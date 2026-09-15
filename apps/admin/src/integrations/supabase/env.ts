const DEAD_SUPABASE_HOST = "yxjbqsfwhypfhxoaachw.supabase.co";
const STOREFRONT_CMS_URL = "https://pyrite-app-storefront.vercel.app/api/cms";
const LOCAL_CMS_ANON = "local-dev-anon";
const LOCAL_CMS_SERVICE = "local-dev-service";

function read(names: string[]): string {
  const vite = import.meta.env as Record<string, string | undefined>;
  for (const name of names) {
    const fromVite = vite[name];
    if (fromVite) return fromVite;
  }
  if (typeof process !== "undefined") {
    for (const name of names) {
      const fromProcess = process.env[name];
      if (fromProcess) return fromProcess;
    }
  }
  return "";
}

export function resolveBackendUrl(raw: string): string {
  if (!raw || raw.includes(DEAD_SUPABASE_HOST)) return STOREFRONT_CMS_URL;
  return raw.replace(/\/+$/, "");
}

export function getSupabaseUrl(): string {
  return resolveBackendUrl(read(["VITE_SUPABASE_URL", "SUPABASE_URL"]));
}

export function isLocalCmsUrl(url = getSupabaseUrl()): boolean {
  return /\/api\/cms/.test(url);
}

export function getSupabasePublishableKey(): string {
  const key = read([
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
  ]);
  if (isLocalCmsUrl()) return key || LOCAL_CMS_ANON;
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = read(["SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SERVICE_ROLE_KEY"]);
  return key || (isLocalCmsUrl() ? LOCAL_CMS_SERVICE : "");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}
