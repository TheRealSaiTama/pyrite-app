import type { Metadata } from "next";
import CustomDesignClient from "./CustomDesignClient";
import { getStorefrontData, getPageSections } from "@/lib/site";
import { buildBreadcrumbSchema } from "@/lib/seo";
import { normalizePublicSiteUrl } from "@/lib/cms/mappers";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Custom Printed Diaries & Notebook Branding Solutions | Pyrite",
  description:
    "Personalise corporate diaries with debossing, gold/silver foil stamping, screen printing, and UV prints. Bespoke executive notebooks engineered for your brand.",
  alternates: {
    canonical: "/custom-design",
  },
  openGraph: {
    title: "Custom Printed Diaries & Notebook Branding Solutions | Pyrite",
    description:
      "Personalise corporate diaries with debossing, gold/silver foil stamping, screen printing, and UV prints. Bespoke executive notebooks engineered for your brand.",
    url: "/custom-design",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Printed Diaries & Notebook Branding Solutions | Pyrite",
    description:
      "Personalise corporate diaries with debossing, gold/silver foil stamping, screen printing, and UV prints. Bespoke executive notebooks engineered for your brand.",
  },
};

export default async function CustomDesignPage() {
  const [data, sections] = await Promise.all([getStorefrontData(), getPageSections("custom-design")]);
  const siteUrl = normalizePublicSiteUrl(data.settings?.siteUrl);
  const breadcrumbSchema = buildBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Custom Print Options", url: "/custom-design" },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomDesignClient
        headerNav={data.headerNav}
        megaMenu={data.megaMenu}
        settings={data.settings}
        footerLinks={data.footerLinks}
        content={sections.main}
      />
    </>
  );
}
