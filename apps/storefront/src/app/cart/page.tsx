import type { Metadata } from "next";
import CartClient from "./CartClient";
import { getStorefrontData } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shopping Cart | Pyrite Corporate Gifts",
  description: "Review your selected diaries and corporate gifts, calculate GST, and request your proforma invoice.",
};

export const revalidate = 0;

export default async function CartPage() {
  const storefront = await getStorefrontData();

  return (
    <CartClient
      headerNav={storefront.headerNav}
      megaMenu={storefront.megaMenu}
      settings={storefront.settings}
      footerLinks={storefront.footerLinks}
    />
  );
}
