import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ShopClient from "./ShopClient";
import { getStorefrontData, getShopChrome } from "@/lib/site";
import { cmsProducts, cmsDiaries } from "@/lib/cms/load";
import { buildBreadcrumbSchema } from "@/lib/seo";
import { normalizePublicSiteUrl } from "@/lib/cms/mappers";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Corporate Diaries, Executive Planners & Gift Sets Catalog | Pyrite",
  description:
    "Explore Pyrite's wholesale catalog of customised 2026 diaries, leatherette executive notebooks, organizers, and luxury corporate gift sets with logo branding.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Corporate Diaries, Executive Planners & Gift Sets Catalog | Pyrite",
    description:
      "Explore Pyrite's wholesale catalog of customised 2026 diaries, leatherette executive notebooks, organizers, and luxury corporate gift sets with logo branding.",
    url: "/shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Diaries, Executive Planners & Gift Sets Catalog | Pyrite",
    description:
      "Explore Pyrite's wholesale catalog of customised 2026 diaries, leatherette executive notebooks, organizers, and luxury corporate gift sets with logo branding.",
  },
};

async function getProducts() {
  return cmsProducts();
}

async function getDiaries() {
  return cmsDiaries();
}

export default async function ShopPage() {
  const [allDiaries, allProducts, storefront, chrome] = await Promise.all([
    getDiaries(),
    getProducts(),
    getStorefrontData(),
    getShopChrome(),
  ]);

  const siteUrl = normalizePublicSiteUrl(storefront.settings?.siteUrl);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
    ],
    siteUrl
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header
        nav={storefront.headerNav}
        megaMenu={storefront.megaMenu}
        logoUrl={storefront.settings?.logoUrl}
        brandName={storefront.settings?.brandName}
        phone={storefront.settings?.phone}
        email={storefront.settings?.email}
      />
      <Suspense
        fallback={
          <div className="container py-16 text-sm text-muted-foreground">Loading shop…</div>
        }
      >
        <ShopClient
          initialDiaries={allDiaries as any}
          initialProducts={allProducts as any}
          chrome={chrome}
        />
      </Suspense>
      <Footer settings={storefront.settings} footerLinks={storefront.footerLinks} />
    </div>
  );
}
