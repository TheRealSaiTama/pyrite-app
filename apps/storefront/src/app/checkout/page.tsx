import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getStorefrontData } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout & Billing Details | Pyrite Corporate Gifts",
  description: "Complete your billing details and request your proforma invoice for corporate gifts and diaries.",
};

export const revalidate = 0;

export default async function CheckoutPage() {
  const storefront = await getStorefrontData();

  return (
    <CheckoutClient
      headerNav={storefront.headerNav}
      megaMenu={storefront.megaMenu}
      settings={storefront.settings}
      footerLinks={storefront.footerLinks}
    />
  );
}
