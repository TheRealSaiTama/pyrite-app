import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  isCmsTable,
  mutateCms,
  readCms,
  LOCAL_OWNER_ID,
  type CmsRow,
} from "@/lib/cms/local-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JWT_SECRET = "pyrite-local-cms";
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, prefer, x-client-info, x-supabase-api-version, accept-profile, content-profile, range, accept, *",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Expose-Headers": "content-range, content-profile, location, *",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...CORS, ...extra } });
}

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function localUser(email = "admin@local") {
  return {
    id: LOCAL_OWNER_ID,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: "email" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
}

function tokenPayload(email: string) {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: LOCAL_OWNER_ID,
    email,
    role: "authenticated",
    aud: "authenticated",
    exp: now + 60 * 60 * 24 * 7,
    iat: now,
  };
}

function session(email: string) {
  const access_token = signJwt(tokenPayload(email));
  return {
    access_token,
    token_type: "bearer",
    expires_in: 60 * 60 * 24 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    refresh_token: "local-refresh",
    user: localUser(email),
  };
}

function matchOp(cell: unknown, expr: string): boolean {
  const m = expr.match(/^(eq|neq|gt|gte|lt|lte|like|ilike|in|is)\.(.*)$/s);
  if (!m) return String(cell) === expr;
  const [, op, raw] = m;
  if (op === "eq") return String(cell ?? "") === raw;
  if (op === "neq") return String(cell ?? "") !== raw;
  if (op === "is") {
    if (raw === "null") return cell == null;
    if (raw === "true") return cell === true;
    if (raw === "false") return cell === false;
  }
  if (op === "in") {
    const inner = raw.replace(/^\(/, "").replace(/\)$/, "");
    const parts = inner.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    return parts.includes(String(cell ?? ""));
  }
  if (op === "ilike" || op === "like") {
    const needle = raw.replace(/%/g, "*").replace(/^\*/, "").replace(/\*$/, "").toLowerCase();
    return String(cell ?? "").toLowerCase().includes(needle);
  }
  const n = Number(cell);
  const v = Number(raw);
  if (op === "gt") return n > v;
  if (op === "gte") return n >= v;
  if (op === "lte") return n <= v;
  if (op === "lt") return n < v;
  return true;
}

function filterRows(rows: CmsRow[], url: URL): CmsRow[] {
  let out = rows.filter((row) => {
    for (const [key, raw] of url.searchParams.entries()) {
      if (["select", "order", "limit", "offset", "and", "or"].includes(key)) continue;
      if (!matchOp(row[key], raw)) return false;
    }
    return true;
  });
  const order = url.searchParams.get("order");
  if (order) {
    const [col, dir] = order.split(".");
    const desc = dir === "desc";
    out = out.slice().sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av > bv ? 1 : -1) * (desc ? -1 : 1);
    });
  }
  const offset = Number(url.searchParams.get("offset") || 0);
  const limit = url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined;
  if (offset) out = out.slice(offset);
  if (limit != null && !Number.isNaN(limit)) out = out.slice(0, limit);
  return out;
}

function project(rows: CmsRow[], select: string | null): CmsRow[] {
  if (!select || select === "*") return rows;
  const cols = select.split(",").map((c) => c.trim()).filter(Boolean);
  return rows.map((row) => {
    const next: CmsRow = {};
    for (const c of cols) next[c] = row[c];
    return next;
  });
}

function pk(table: keyof CmsDb): string {
  return table === "page_seo" ? "page_key" : "id";
}

async function handleRest(req: NextRequest, table: string) {
  if (!isCmsTable(table)) return json({ error: `unknown table ${table}` }, 404);
  const url = new URL(req.url);
  const prefer = req.headers.get("prefer") || "";
  const wantObject =
    (req.headers.get("accept") || "").includes("vnd.pgrst.object") || prefer.includes("return=representation");
  const headCount = req.method === "HEAD" || prefer.includes("count=exact");

  if (req.method === "GET" || req.method === "HEAD") {
    const all = readCms()[table];
    const matched = filterRows(all, url);
    const rows = project(matched, url.searchParams.get("select"));
    const range = `0-${Math.max(0, rows.length - 1)}/${matched.length}`;
    if (headCount && req.method === "HEAD") {
      return new NextResponse(null, {
        status: 200,
        headers: { ...CORS, "Content-Range": range, "Content-Type": "application/json" },
      });
    }
    if (wantObject && rows.length <= 1) {
      if (!rows.length) {
        return json(
          { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: "Results contain 0 rows" },
          406,
        );
      }
      return json(rows[0], 200, { "Content-Range": range });
    }
    return json(rows, 200, { "Content-Range": range });
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    const items: CmsRow[] = Array.isArray(body) ? body : [body];
    const inserted: CmsRow[] = [];
    mutateCms((db) => {
      for (const item of items) {
        if (!item) continue;
        const key = pk(table);
        if (item[key] == null) item[key] = crypto.randomUUID();
        item.created_at = item.created_at || new Date().toISOString();
        item.updated_at = new Date().toISOString();
        if (item.enabled == null && table !== "site_settings" && table !== "page_seo") item.enabled = true;
        db[table].push(item);
        inserted.push(item);
      }
    });
    if (prefer.includes("return=minimal")) return new NextResponse(null, { status: 201, headers: CORS });
    return json(inserted.length === 1 ? inserted[0] : inserted, 201);
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const body = (await req.json().catch(() => ({}))) as CmsRow;
    const updated: CmsRow[] = [];
    mutateCms((db) => {
      const matched = filterRows(db[table], url);
      const ids = new Set(matched.map((r) => r[pk(table)]));
      db[table] = db[table].map((row) => {
        if (!ids.has(row[pk(table)])) return row;
        const next = { ...row, ...body, updated_at: new Date().toISOString() };
        updated.push(next);
        return next;
      });
    });
    if (prefer.includes("return=minimal")) return new NextResponse(null, { status: 204, headers: CORS });
    if (wantObject) return json(updated[0] ?? {}, 200);
    return json(updated, 200);
  }

  if (req.method === "DELETE") {
    mutateCms((db) => {
      const matched = filterRows(db[table], url);
      const ids = new Set(matched.map((r) => r[pk(table)]));
      db[table] = db[table].filter((row) => !ids.has(row[pk(table)]));
    });
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  return json({ error: "method not allowed" }, 405);
}

async function handleStorage(req: NextRequest, parts: string[]) {
  // /storage/v1/object/{bucket}/{...path} or /storage/v1/object/public/{bucket}/{...}
  const afterObject = parts[2] === "object" ? parts.slice(3) : parts.slice(2);
  const isPublic = afterObject[0] === "public";
  const rest = isPublic ? afterObject.slice(1) : afterObject;
  const bucket = rest[0] || "site-media";
  const objectPath = rest.slice(1).join("/");
  if (req.method === "GET" || req.method === "HEAD") {
    const dest = path.join(process.cwd(), "public", "cms-media", bucket, objectPath);
    if (!fs.existsSync(dest)) return json({ error: "not found" }, 404);
    const buf = fs.readFileSync(dest);
    return new NextResponse(buf, {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/octet-stream" },
    });
  }
  if (req.method === "POST" || req.method === "PUT") {
    const buf = Buffer.from(await req.arrayBuffer());
    const destDir = path.join(process.cwd(), "public", "cms-media", bucket);
    const dest = path.join(destDir, objectPath || `upload-${Date.now()}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    const publicUrl = `/cms-media/${bucket}/${objectPath}`;
    mutateCms((db) => {
      db.media_assets.push({
        id: crypto.randomUUID(),
        path: `${bucket}/${objectPath}`,
        url: publicUrl,
        alt: null,
        mime_type: req.headers.get("content-type"),
        size_bytes: buf.length,
        created_at: new Date().toISOString(),
      });
    });
    return json({ Key: `${bucket}/${objectPath}`, url: publicUrl }, 200);
  }
  return json({ error: "not found" }, 404);
}

async function handleAuth(req: NextRequest, parts: string[]) {
  const action = parts.slice(1).join("/");
  if (req.method === "GET" && (action === "v1/user" || parts.includes("user"))) {
    const authHeader = req.headers.get("authorization") || "";
    let email = "admin@local";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, "");
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
          if (payload?.email) email = payload.email;
        }
      } catch {}
    }
    return json({ ...localUser(email), aud: "authenticated" });
  }
  if (req.method === "POST" && (action === "v1/signup" || action.includes("signup") || action.includes("token"))) {
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = body.email || "admin@local";
    return json(session(email));
  }
  if (req.method === "POST" && action === "v1/logout") {
    return new NextResponse(null, { status: 204, headers: CORS });
  }
  if (action === "v1/settings") {
    return json({ disable_signup: false });
  }
  return json({ error: "auth route not implemented", action }, 404);
}

async function dispatch(req: NextRequest, parts: string[]) {
  if (parts[0] === "auth") return handleAuth(req, parts);
  if (parts[0] === "rest" && parts[1] === "v1" && parts[2]) return handleRest(req, parts[2]);
  if (parts[0] === "storage") return handleStorage(req, parts);
  return json({ error: "not found", path: parts.join("/") }, 404);
}

export async function OPTIONS(req: NextRequest) {
  const reqHeaders = req.headers.get("access-control-request-headers");
  const headers = {
    ...CORS,
    ...(reqHeaders ? { "Access-Control-Allow-Headers": reqHeaders } : {}),
  };
  return new NextResponse(null, { status: 204, headers });
}

async function run(req: NextRequest, ctx: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolved = "then" in ctx.params ? await ctx.params : ctx.params;
  const parts = resolved.path || [];
  try {
    return await dispatch(req, parts);
  } catch (e) {
    console.error("local cms error", e);
    return json({ error: e instanceof Error ? e.message : "cms error" }, 500);
  }
}

export const GET = run;
export const POST = run;
export const PATCH = run;
export const PUT = run;
export const DELETE = run;
export const HEAD = run;
