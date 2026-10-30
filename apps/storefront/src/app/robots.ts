import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/site";
import { normalizePublicSiteUrl } from "@/lib/cms/mappers";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const baseUrl = normalizePublicSiteUrl(settings.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/thank-you",
        "/favourites",
        "/wishlist",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
