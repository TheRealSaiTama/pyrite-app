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
  return await cmsSettings();
}

export async function getHeaderNav(): Promise<StorefrontNavLink[]> {
  const [header, occasion, profession] = await Promise.all([
    cmsNav("header"),
    cmsNav("shop_occasion"),
    cmsNav("shop_profession"),
  ]);
  return [
    ...header,
    ...occasion.map((item) => ({ ...item, group: "shop_occasion" })),
    ...profession.map((item) => ({ ...item, group: "shop_profession" })),
  ];
}

export async function getFooterNav(groupKey = "footer"): Promise<StorefrontNavLink[]> {
  return await cmsNav(groupKey);
}

export async function getMegaMenu(): Promise<MegaMenuItemOut[]> {
  return await cmsMegaMenu();
}

export type StorefrontSeo = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export async function getSeo(pageKey: string): Promise<StorefrontSeo | null> {
  return await cmsSeo(pageKey);
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
  return await cmsSections(pageKey);
}

export async function getShopChrome(): Promise<ShopChromeOut> {
  return await cmsShopChrome();
}

export async function getProductChrome(): Promise<ProductChromeOut> {
  return await cmsProductChrome();
}
