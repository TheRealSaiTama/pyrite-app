import React, { useState, useMemo } from "react";
import { ImageIcon } from "lucide-react";

const STOREFRONT_ORIGIN = "https://pyrite-app-storefront.vercel.app";

export function extractGoogleDriveFileId(url: string): string | null {
  const s = String(url || "").trim();
  if (!s) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /^([a-zA-Z0-9_-]{25,})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function resolveAdminImage(raw: string | null | undefined): string {
  const url = String(raw || "").trim();
  if (!url) return "";

  // 1. Google Drive URLs -> direct image URL from Googleusercontent
  const driveId = extractGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}=w400`;
  }

  // 2. Relative URLs -> prefix with Storefront origin so admin domain can fetch them
  if (url.startsWith("/")) {
    return `${STOREFRONT_ORIGIN}${url}`;
  }

  // 3. Absolute HTTP / HTTPS / data: URLs
  return url;
}

export function AdminProductImage({
  src,
  alt = "",
  className = "h-full w-full object-cover",
  fallbackIcon: FallbackIcon,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}) {
  const [error, setError] = useState(false);
  const resolved = useMemo(() => resolveAdminImage(src), [src]);

  // Reset error state if src changes
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setError(false);
  }

  if (!resolved || error) {
    if (FallbackIcon) {
      return <FallbackIcon className="h-4 w-4 text-muted-foreground" />;
    }
    return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
