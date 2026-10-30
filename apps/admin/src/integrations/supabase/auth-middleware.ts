import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { getSupabasePublishableKey, getSupabaseUrl, isLocalCmsUrl } from './env'



function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

async function verifyLocalCmsToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const [header, body, signature, extra] = token.split('.');
    if (!header || !body || !signature || extra) return null;

    const decode = (value: string) => {
      const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    };
    const jwtHeader = JSON.parse(new TextDecoder().decode(decode(header)));
    if (jwtHeader.alg !== 'HS256' || jwtHeader.typ !== 'JWT') return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('pyrite-local-cms'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decode(signature),
      new TextEncoder().encode(`${header}.${body}`),
    );
    if (!valid) return null;

    const claims = JSON.parse(new TextDecoder().decode(decode(body))) as Record<string, unknown>;
    if (
      typeof claims.sub !== 'string' || !claims.sub ||
      typeof claims.email !== 'string' ||
      typeof claims.exp !== 'number' || claims.exp <= Math.floor(Date.now() / 1000) ||
      claims.role !== 'authenticated' || claims.aud !== 'authenticated' || claims.token_use !== 'access'
    ) return null;
    return claims;
  } catch {
    return null;
  }
}

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    
    const SUPABASE_URL = getSupabaseUrl();
    const SUPABASE_PUBLISHABLE_KEY = getSupabasePublishableKey();

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
        ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
      ];
      const message = `Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to apps/admin/.env`;
      console.error(`[Supabase] ${message}`);
      throw new Error(message);
    }
    
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized: No request headers available');
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      throw new Error('Unauthorized: No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Only Bearer tokens are supported');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    if (token.split('.').length !== 3) {
      throw new Error('Unauthorized: Invalid token');
    }

    const supabase = createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY!),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const localCmsDevelopment = isLocalCmsUrl(SUPABASE_URL) && process.env.NODE_ENV !== 'production';
    const claims = localCmsDevelopment
      ? await verifyLocalCmsToken(token)
      : (await supabase.auth.getClaims(token)).data?.claims as Record<string, unknown> | undefined;
    if (typeof claims?.sub !== 'string' || !claims.sub) {
      throw new Error('Unauthorized: Invalid token');
    }

    if (localCmsDevelopment) {
      return next({
        context: {
          supabase,
          userId: claims.sub as string,
          claims,
        },
      });
    }

    const { data: ownerRole, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', claims.sub)
      .eq('role', 'owner')
      .maybeSingle();
    if (roleError || !ownerRole) {
      throw new Error('Unauthorized: Owner access required');
    }

    return next({
      context: {
        supabase,
        userId: claims.sub as string,
        claims,
      },
    });
  },
);
