import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/site";
import { cmsCatalog } from "@/lib/cms/load";
import { normalizePublicSiteUrl } from "@/lib/cms/mappers";

export const revalidate = 3600; // revalidate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const baseUrl = normalizePublicSiteUrl(settings.siteUrl);
  const catalog = cmsCatalog().filter((item) => item.enabled !== false);

  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bulk-orders`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-design`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic product routes
  const productRoutes: MetadataRoute.Sitemap = catalog.map((item) => ({
    url: `${baseUrl}/shop/${encodeURIComponent(item.id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
