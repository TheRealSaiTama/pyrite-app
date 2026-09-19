import type { Metadata } from "next";
import ThankYouClient from "./ThankYouClient";
import { getStorefrontData } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order Placed Successfully | Pyrite Corporate Gifts",
  description: "Thank you for your order. Our sales executive will contact you shortly with the proforma invoice.",
};

export const revalidate = 0;

export default async function ThankYouPage() {
  const storefront = await getStorefrontData();

  return (
    <ThankYouClient
      headerNav={storefront.headerNav}
      megaMenu={storefront.megaMenu}
      settings={storefront.settings}
      footerLinks={storefront.footerLinks}
    />
  );
}
