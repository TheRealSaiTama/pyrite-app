import type { Metadata } from "next";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import FavouritesClient from "./FavouritesClient";
import { getStorefrontData } from "@/lib/site";
import { cmsCatalog } from "@/lib/cms/load";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "My Wishlist | Pyrite",
  description: "View and manage your saved favourite diaries, executive planners, and corporate gifts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FavouritesPage() {
  const [storefront, catalog] = await Promise.all([
    getStorefrontData(),
    cmsCatalog(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between">
      <div>
        <Header
          nav={storefront.headerNav}
          megaMenu={storefront.megaMenu}
          logoUrl={storefront.settings?.logoUrl}
          brandName={storefront.settings?.brandName}
          phone={storefront.settings?.phone}
          email={storefront.settings?.email}
        />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <FavouritesClient allProducts={catalog} />
        </main>
      </div>
      <Footer settings={storefront.settings} footerLinks={storefront.footerLinks} />
    </div>
  );
}
