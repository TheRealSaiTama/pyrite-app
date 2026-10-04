import { readCms, type CmsRow } from "@/lib/cms/local-store";
import {
  mapSiteSettings,
  mapEnabledNavLinks,
  mapMegaMenuItems,
  mapEnabledSections,
  mapShopChrome,
  mapProductChrome,
  type SiteSettingsOut,
  type NavLinkOut,
  type MegaMenuItemOut,
  type ShopChromeOut,
  type ProductChromeOut,
} from "@/lib/cms/mappers";

export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  tags: string[];
  gallery: string[];
  features: Record<string, unknown>;
  enabled: boolean;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  source: "product" | "diary";
  moq?: number;
};

function asSettings(row: CmsRow | undefined): SiteSettingsOut {
  if (!row) return mapSiteSettings(null);
  return mapSiteSettings({
    brandName: row.brand_name ?? row.brandName,
    tagline: row.tagline,
    logoUrl: row.logo_url ?? row.logoUrl,
    faviconUrl: row.favicon_url ?? row.faviconUrl,
    primaryColor: row.primary_color ?? row.primaryColor,
    whatsappNumber: row.whatsapp_number ?? row.whatsappNumber,
    phone: row.phone,
    email: row.email,
    address: row.address,
    socials: row.socials,
    siteUrl: row.site_url ?? row.siteUrl,
  });
}

function parseFeatures(raw: unknown): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, any>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function parseMoq(row: CmsRow): number {
  const feat = parseFeatures(row.features);
  const raw = row.moq ?? feat?.moq?.value ?? feat?.moq ?? feat?.MOQ?.value ?? feat?.MOQ;
  if (raw != null) {
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return 50;
}

function asCatalog(row: CmsRow, source: "product" | "diary"): CatalogItem {
  const features = parseFeatures(row.features);
  const moq = parseMoq(row);
  return {
    id: String(row.id),
    slug: String(row.slug || ""),
    name: String(row.name || ""),
    description: row.description ?? null,
    minPrice: row.min_price ?? row.minPrice ?? null,
    maxPrice: row.max_price ?? row.maxPrice ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    category: row.category ?? null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [],
    features,
    enabled: row.enabled !== false,
    featured: row.featured === true,
    seoTitle: row.seo_title ?? row.seoTitle ?? null,
    seoDescription: row.seo_description ?? row.seoDescription ?? null,
    source,
    moq,
  };
}

export function cmsSettings(): SiteSettingsOut {
  return asSettings(readCms().site_settings[0]);
}

export function cmsNav(groupKey: string): NavLinkOut[] {
  const rows = readCms().nav_links.filter((r) => r.group_key === groupKey);
  return mapEnabledNavLinks(
    rows.map((r) => ({
      label: r.label,
      href: r.href,
      enabled: r.enabled,
      sort_order: r.sort_order,
    })),
  );
}

import { getDefaultCategoryNav } from "@/lib/catalog-categories";

export function cmsMegaMenu(): MegaMenuItemOut[] {
  const db = readCms();
  const sections = db.page_sections;
  const row = sections.find(
    (s) => s.page_key === "site" && s.section_key === "mega_menu" && s.enabled !== false,
  );
  const catSection = sections.find(
    (s) => s.page_key === "catalog" && s.section_key === "categories",
  );
  const homeCatSection = sections.find(
    (s) => s.page_key === "home" && s.section_key === "categories",
  );

  const customSubcategories = catSection?.content?.customSubcategories;
  const customCategories = catSection?.content?.customCategories;
  const homeCatItems = Array.isArray(homeCatSection?.content?.items)
    ? homeCatSection.content.items
    : [];

  const baseItems: any[] = Array.isArray(row?.content?.items)
    ? [...row.content.items]
    : [];

  // ponytail: ensure any category added via homepage controls or catalog metadata appears in navbar mega-menu
  const seen = new Set<string>();
  for (const it of baseItems) {
    if (it?.name) seen.add(String(it.name).trim().toUpperCase());
  }

  // 1. Merge categories from home:categories
  for (const h of homeCatItems) {
    if (!h?.name) continue;
    const norm = String(h.name).trim().toUpperCase();
    if (!seen.has(norm)) {
      seen.add(norm);
      baseItems.push({
        name: norm,
        subtitle: h.subtitle || "Explore Collection",
        image_url: h.image_url || h.image || "/logo.png",
        href: h.href || `/shop?category=${encodeURIComponent(norm)}`,
        sort_order: typeof h.sort_order === "number" ? h.sort_order : baseItems.length + 1,
        enabled: true,
      });
    }
  }

  // 2. Merge categories from catalog:categories (customCategories)
  if (Array.isArray(customCategories)) {
    for (const c of customCategories) {
      const name = typeof c === "string" ? c : c?.name;
      if (!name) continue;
      const norm = String(name).trim().toUpperCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        baseItems.push({
          name: norm,
          subtitle: "Explore Collection",
          image_url: "/logo.png",
          href: `/shop?category=${encodeURIComponent(norm)}`,
          sort_order: baseItems.length + 1,
          enabled: true,
        });
      }
    }
  }

  // 3. Merge distinct categories from active catalog products and diaries
  const catalog = cmsCatalog();
  for (const item of catalog) {
    if (!item.category) continue;
    const parts = String(item.category)
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    for (const cat of parts) {
      if (!seen.has(cat)) {
        seen.add(cat);
        baseItems.push({
          name: cat,
          subtitle: "Explore Collection",
          image_url: item.imageUrl || "/logo.png",
          href: `/shop?category=${encodeURIComponent(cat)}`,
          sort_order: baseItems.length + 1,
          enabled: true,
        });
      }
    }
  }

  if (baseItems.length > 0) {
    return mapMegaMenuItems(baseItems, customSubcategories);
  }

  return getDefaultCategoryNav(customCategories, customSubcategories).map((c, i) => ({
    name: c.name,
    subtitle: "",
    image: "/logo.png",
    href: c.href,
    sort_order: i + 1,
    subcategories: c.subcategories,
  }));
}

export function cmsSections(pageKey: string): Record<string, Record<string, any>> {
  const db = readCms();
  const rows = db.page_sections.filter((s) => s.page_key === pageKey);
  const out = mapEnabledSections(
    rows.map((s) => ({
      section_key: s.section_key,
      enabled: s.enabled,
      content: s.content,
      sort_order: s.sort_order,
    })),
  );

  // ponytail: ensure homepage categories carousel includes any custom categories registered in catalog
  if (pageKey === "home" && out.categories) {
    const catSection = db.page_sections.find(
      (s) => s.page_key === "catalog" && s.section_key === "categories",
    );
    const customCategories = catSection?.content?.customCategories;
    if (Array.isArray(customCategories) && customCategories.length > 0) {
      const items: any[] = Array.isArray(out.categories.items) ? [...out.categories.items] : [];
      const seen = new Set(items.map((it: any) => String(it.name || "").trim().toUpperCase()));
      let maxOrder = items.reduce((m: number, it: any) => Math.max(m, it.sort_order || 0), 0);

      let added = false;
      for (const c of customCategories) {
        const name = typeof c === "string" ? c : c?.name;
        if (!name) continue;
        const norm = String(name).trim().toUpperCase();
        if (!seen.has(norm)) {
          seen.add(norm);
          maxOrder += 1;
          items.push({
            name: norm,
            subtitle: "Explore Collection",
            image_url: "/categories/CORPORATE GIFTSETS.png",
            bgColor: "#0F172A",
            alt: norm,
            href: `/shop?category=${encodeURIComponent(norm)}`,
            sort_order: maxOrder,
          });
          added = true;
        }
      }
      if (added) {
        out.categories.items = items;
      }
    }
  }

  return out;
}

export function cmsSeo(pageKey: string): { title: string | null; description: string | null; ogImageUrl: string | null } | null {
  const row = readCms().page_seo.find((s) => s.page_key === pageKey);
  if (!row) return null;
  return {
    title: row.title ?? null,
    description: row.description ?? null,
    ogImageUrl: row.og_image_url ?? row.ogImageUrl ?? null,
  };
}

export function cmsCatalog(): CatalogItem[] {
  const db = readCms();
  return [
    ...db.products.filter((r) => r.enabled !== false).map((r) => asCatalog(r, "product")),
    ...db.diaries.filter((r) => r.enabled !== false).map((r) => asCatalog(r, "diary")),
  ];
}

export function cmsProducts(): CatalogItem[] {
  return cmsCatalog().filter((r) => r.source === "product");
}

export function cmsDiaries(): CatalogItem[] {
  return cmsCatalog().filter((r) => r.source === "diary");
}

export function cmsItemByIdOrSlug(id: string): CatalogItem | null {
  if (!id) return null;
  let cleanId = String(id);
  try {
    cleanId = decodeURIComponent(cleanId);
  } catch {}
  const needle = cleanId.replace(/^\/+|\/+$/g, "").toLowerCase().trim();
  return (
    cmsCatalog().find(
      (r) => r.id.toLowerCase() === needle || r.slug.toLowerCase() === needle,
    ) || null
  );
}

export function cmsShopChrome(): ShopChromeOut {
  return mapShopChrome(cmsSections("shop").main);
}

export function cmsProductChrome(): ProductChromeOut {
  return mapProductChrome(cmsSections("product").main);
}
