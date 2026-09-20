import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  isCmsTable,
  mutateCms,
  readCms,
  dataDir,
  LOCAL_OWNER_ID,
  extractFileFromMultipart,
  type CmsRow,
  type CmsDb,
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
  const m = expr.match(/^(eq|neq|gt|gte|lt|lte|like|ilike|in|is)\.([\s\S]*)$/);
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
        if (table === "media_assets") {
          const itemClean = (item.path || "").replace(/^site-media\//, "");
          const existing = (db.media_assets || []).find(
            (m) =>
              m.path === item.path ||
              (m.path || "").replace(/^site-media\//, "") === itemClean ||
              (item.url && m.url && (m.url === item.url || m.url.endsWith(`/${itemClean}`)))
          );
          if (existing) {
            const preservedB64 = existing.data_base64 || item.data_base64;
            Object.assign(existing, item, {
              path: existing.path || item.path,
              data_base64: preservedB64,
              updated_at: new Date().toISOString(),
            });
            inserted.push(existing);
            continue;
          }
        }
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

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function handleStorage(req: NextRequest, parts: string[]) {
  // Support bucket management: /storage/v1/bucket or /storage/v1/bucket/{bucket}
  if (parts[2] === "bucket") {
    if (req.method === "GET") {
      const bucketName = parts[3];
      if (bucketName) {
        return json({
          id: bucketName,
          name: bucketName,
          public: true,
          created_at: new Date().toISOString(),
        });
      }
      return json([
        { id: "site-media", name: "site-media", public: true, created_at: new Date().toISOString() },
      ]);
    }
    if (req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { name?: string };
      const name = body.name || "site-media";
      return json({ name }, 200);
    }
    if (req.method === "DELETE") {
      return json({ message: "Bucket deleted" }, 200);
    }
  }

  // /storage/v1/object/{bucket}/{...path} or /storage/v1/object/public/{bucket}/{...}
  const afterObject = parts[2] === "object" ? parts.slice(3) : parts.slice(2);
  const isPublic = afterObject[0] === "public";
  const rest = isPublic ? afterObject.slice(1) : afterObject;
  const bucket = rest[0] || "site-media";
  const objectPath = rest.slice(1).join("/");

  // DELETE object(s)
  if (req.method === "DELETE") {
    let prefixes: string[] = [];
    if (objectPath) {
      prefixes = [objectPath];
    } else {
      const body = (await req.json().catch(() => ({}))) as { prefixes?: string[] };
      prefixes = body.prefixes || [];
    }

    mutateCms((db) => {
      const prefixSet = new Set(prefixes);
      db.media_assets = (db.media_assets || []).filter((m) => {
        const p = m.path || "";
        const rel = p.startsWith(`${bucket}/`) ? p.slice(bucket.length + 1) : p;
        return !prefixSet.has(p) && !prefixSet.has(rel);
      });
    });

    for (const prefix of prefixes) {
      const diskPaths = [
        path.join(dataDir(), "media", bucket, prefix),
        path.join("/tmp", "pyrite-cms", "media", bucket, prefix),
        path.join(process.cwd(), "public", "cms-media", bucket, prefix),
      ];
      for (const dp of diskPaths) {
        try {
          if (fs.existsSync(dp)) fs.unlinkSync(dp);
        } catch {}
      }
    }
    return json({ message: "Successfully deleted" }, 200);
  }

  // GET or HEAD object
  if (req.method === "GET" || req.method === "HEAD") {
    // 1. Try reading from disk candidates
    const diskCandidates = [
      path.join(dataDir(), "media", bucket, objectPath),
      path.join("/tmp", "pyrite-cms", "media", bucket, objectPath),
      path.join(process.cwd(), "public", "cms-media", bucket, objectPath),
    ];

    for (const p of diskCandidates) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p);
          const unwrapped = extractFileFromMultipart(raw);
          const mime = unwrapped.mime || getMimeType(objectPath);
          return new NextResponse(new Uint8Array(unwrapped.buf), {
            status: 200,
            headers: {
              ...CORS,
              "Content-Type": mime,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch {}
      }
    }

    // 2. Try looking up in database media_assets
    const db = readCms();
    const cleanObject = objectPath.replace(/^site-media\//, "");
    const asset = (db.media_assets || []).find(
      (m) =>
        m.path === `${bucket}/${objectPath}` ||
        m.path === objectPath ||
        (m.path || "").replace(/^site-media\//, "") === cleanObject ||
        m.path?.endsWith(`/${cleanObject}`) ||
        m.url?.endsWith(`/${cleanObject}`)
    );

    if (asset && asset.data_base64) {
      const raw = Buffer.from(asset.data_base64, "base64");
      const unwrapped = extractFileFromMultipart(raw);
      const mime = unwrapped.mime || asset.mime_type || getMimeType(objectPath);
      // Cache to /tmp for fast future hits
      try {
        const tmpPath = path.join("/tmp", "pyrite-cms", "media", bucket, objectPath);
        fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
        fs.writeFileSync(tmpPath, unwrapped.buf);
      } catch {}

      return new NextResponse(new Uint8Array(unwrapped.buf), {
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": mime,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return json({ error: "not found" }, 404);
  }

  // POST or PUT object (Upload)
  if (req.method === "POST" || req.method === "PUT") {
    let buf: Buffer;
    const finalObjectPath =
      objectPath || `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    let mimeType = getMimeType(finalObjectPath);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await req.formData();
        let foundFile: File | null = null;
        for (const [, val] of formData.entries()) {
          if (val && typeof val === "object" && typeof (val as File).arrayBuffer === "function") {
            foundFile = val as File;
            break;
          }
        }
        if (foundFile) {
          buf = Buffer.from(await foundFile.arrayBuffer());
          mimeType = foundFile.type || getMimeType(foundFile.name || finalObjectPath);
        } else {
          buf = Buffer.from(await req.arrayBuffer());
        }
      } catch {
        buf = Buffer.from(await req.arrayBuffer());
      }
    } else {
      buf = Buffer.from(await req.arrayBuffer());
      if (contentType && !contentType.includes("application/octet-stream")) {
        mimeType = contentType;
      }
    }

    // Safety unwrap if raw multipart headers were read
    const unwrapped = extractFileFromMultipart(buf);
    buf = unwrapped.buf;
    if (unwrapped.mime) mimeType = unwrapped.mime;

    const assetId = crypto.randomUUID();
    const publicUrl = `/api/cms/storage/v1/object/public/${bucket}/${finalObjectPath}`;
    const base64Data = buf.toString("base64");

    // Attempt to write to disk if writable, safely ignore if read-only
    const diskCandidates = [
      path.join(dataDir(), "media", bucket, finalObjectPath),
      path.join("/tmp", "pyrite-cms", "media", bucket, finalObjectPath),
      path.join(process.cwd(), "public", "cms-media", bucket, finalObjectPath),
    ];
    for (const dest of diskCandidates) {
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buf);
        break;
      } catch {}
    }

    // Persist in CMS database with base64 data so it survives serverless restarts
    mutateCms((db) => {
      const cleanPath = finalObjectPath.replace(/^site-media\//, "");
      db.media_assets = (db.media_assets || []).filter(
        (m) =>
          m.path !== `${bucket}/${finalObjectPath}` &&
          m.path !== finalObjectPath &&
          (m.path || "").replace(/^site-media\//, "") !== cleanPath &&
          !m.url?.endsWith(`/${cleanPath}`)
      );
      db.media_assets.push({
        id: assetId,
        path: `${bucket}/${finalObjectPath}`,
        url: publicUrl,
        alt: finalObjectPath.replace(/[^\w.-]+/g, " "),
        mime_type: mimeType,
        size_bytes: buf.length,
        data_base64: base64Data,
        created_at: new Date().toISOString(),
      });
    });

    return json({ Key: `${bucket}/${finalObjectPath}`, Id: assetId, url: publicUrl }, 200);
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

async function run(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const resolved = await ctx.params;
  const parts = resolved.path || [];
  try {
    return await dispatch(req, parts);
  } catch (e) {
    console.error("local cms error", e);
    return json({ error: e instanceof Error ? e.message : "cms error" }, 500);
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
export async function HEAD(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return run(req, ctx);
}
