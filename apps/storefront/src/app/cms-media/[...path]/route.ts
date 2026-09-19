import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readCms, dataDir, extractFileFromMultipart } from "@/lib/cms/local-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolved = "then" in ctx.params ? await ctx.params : ctx.params;
  const parts = resolved.path || [];
  const bucket = parts[0] || "site-media";
  const objectPath = parts.slice(1).join("/");

  if (!objectPath) {
    return NextResponse.json({ error: "missing path" }, { status: 400, headers: CORS });
  }

  // 1. Try disk candidates
  const diskCandidates = [
    path.join(dataDir(), "media", bucket, objectPath),
    path.join("/tmp", "pyrite-cms", "media", bucket, objectPath),
    path.join(process.cwd(), "public", "cms-media", bucket, objectPath),
  ];

  for (const p of diskCandidates) {
    if (fs.existsSync(p)) {
      try {
        let buf = fs.readFileSync(p);
        const unwrapped = extractFileFromMultipart(buf);
        buf = unwrapped.buf;
        const mime = unwrapped.mime || getMimeType(objectPath);
        return new NextResponse(buf, {
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

  // 2. Try database media_assets
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
    let buf = Buffer.from(asset.data_base64, "base64");
    const unwrapped = extractFileFromMultipart(buf);
    buf = unwrapped.buf;
    const mime = unwrapped.mime || asset.mime_type || getMimeType(objectPath);
    try {
      const tmpPath = path.join("/tmp", "pyrite-cms", "media", bucket, objectPath);
      fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
      fs.writeFileSync(tmpPath, buf);
    } catch {}

    return new NextResponse(buf, {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return NextResponse.json({ error: "not found" }, { status: 404, headers: CORS });
}

export const HEAD = GET;
