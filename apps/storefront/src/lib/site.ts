import {
  cmsSettings,
  cmsNav,
  cmsMegaMenu,
  cmsSections,
  cmsSeo,
  cmsShopChrome,
  cmsProductChrome,
} from "@/lib/cms/load";
import type {
  SiteSettingsOut,
  NavLinkOut,
  MegaMenuItemOut,
  ShopChromeOut,
  ProductChromeOut,
} from "@/lib/cms/mappers";

export type StorefrontSettings = SiteSettingsOut;
export type StorefrontNavLink = NavLinkOut;
export type StorefrontMegaItem = MegaMenuItemOut;

export async function getSettings(): Promise<StorefrontSettings> {
  return cmsSettings();
}

export async function getHeaderNav(): Promise<StorefrontNavLink[]> {
  const mapped = cmsNav("header");
  if (mapped.length) return mapped;
  return [
    { label: "Shop", href: "/shop" },
    { label: "Bulk Orders", href: "/bulk-orders" },
    { label: "Custom Print", href: "/custom-design" },
    { label: "About Us", href: "#about" },
  ];
}

export async function getFooterNav(groupKey = "footer"): Promise<StorefrontNavLink[]> {
  return cmsNav(groupKey);
}

export async function getMegaMenu(): Promise<MegaMenuItemOut[]> {
  return cmsMegaMenu();
}

export type StorefrontSeo = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export async function getSeo(pageKey: string): Promise<StorefrontSeo | null> {
  return cmsSeo(pageKey);
}

export type FooterLinkGroups = {
  company: NavLinkOut[];
  shop: NavLinkOut[];
  support: NavLinkOut[];
};

export async function getStorefrontData() {
  const [settings, headerNav, footerShop, footerCompany, footerSupport, megaMenu] =
    await Promise.all([
      getSettings(),
      getHeaderNav(),
      getFooterNav("footer_shop"),
      getFooterNav("footer_company"),
      getFooterNav("footer_support"),
      getMegaMenu(),
    ]);
  return {
    settings,
    headerNav,
    megaMenu,
    footerLinks: {
      shop: footerShop,
      company: footerCompany,
      support: footerSupport,
    } satisfies FooterLinkGroups,
  };
}

export async function getPageSections(
  pageKey: string,
): Promise<Record<string, Record<string, any>>> {
  return cmsSections(pageKey);
}

export async function getShopChrome(): Promise<ShopChromeOut> {
  return cmsShopChrome();
}

export async function getProductChrome(): Promise<ProductChromeOut> {
  return cmsProductChrome();
}
