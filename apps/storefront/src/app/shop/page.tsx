import { Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ShopClient from "./ShopClient";
import { getStorefrontData, getShopChrome } from "@/lib/site";
import { cmsProducts, cmsDiaries } from "@/lib/cms/load";

export const revalidate = 0;

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

  return (
    <div className="min-h-screen bg-gray-50">
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
