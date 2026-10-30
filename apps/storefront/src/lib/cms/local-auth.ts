import crypto from "node:crypto";

const DEV_JWT_SECRET = "pyrite-local-cms";

export type LocalCmsToken = Record<string, unknown> & {
  sub: string;
  email: string;
  exp: number;
  token_use: "access" | "refresh";
};

function jwtSecret(): string | null {
  return process.env.NODE_ENV === "production" ? null : DEV_JWT_SECRET;
}

function equalSecret(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && crypto.timingSafeEqual(actualBytes, expectedBytes);
}

export function signLocalCmsToken(payload: LocalCmsToken): string | null {
  const secret = jwtSecret();
  if (!secret) return null;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyLocalCmsToken(token: string, tokenUse?: LocalCmsToken["token_use"]): LocalCmsToken | null {
  const secret = jwtSecret();
  if (!secret) return null;
  try {
    const [header, body, signature, extra] = token.split(".");
    if (!header || !body || !signature || extra) return null;
    const parsedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") return null;
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    if (!equalSecret(signature, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as LocalCmsToken;
    if (typeof payload.sub !== "string" || !payload.sub || typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "authenticated" || payload.aud !== "authenticated") return null;
    if (tokenUse && payload.token_use !== tokenUse) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyLocalCmsCredentials(email: string, password: string): boolean {
  return process.env.NODE_ENV !== "production" && Boolean(email && password);
}
