import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import WhatsAppButton from "@/components/WhatsAppButton";
import Script from "next/script";
import { Toaster } from "sonner";
import { ProductProvider } from '@/context/ProductContext';
import { getSettings, getSeo } from "@/lib/site";
import { DEFAULT_BRAND_NAME, DEFAULT_SITE_URL, normalizePublicSiteUrl } from "@/lib/cms/mappers";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [settings, homeSeo] = await Promise.all([getSettings(), getSeo("home")]);

    const brand = settings.brandName || DEFAULT_BRAND_NAME;
    const defaultTitle = homeSeo?.title
      ?? `${brand} | Customised Diaries 2026 | Customised Note Books | Customised Corporate Gifts`;
    const defaultDescription = homeSeo?.description
      ?? `${brand} crafts personalised diaries, notebooks, planners, and premium corporate gifts for 2026 with bespoke branding and nationwide delivery.`;
    const siteUrl = normalizePublicSiteUrl(settings.siteUrl);
    const ogImage = homeSeo?.ogImageUrl || settings.logoUrl || "/logo.png";
    const favicon = settings.faviconUrl || "/favicon/favicon.png";

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: `%s | ${brand}`,
      },
      description: defaultDescription,
      keywords: [
        "customised diaries",
        "customised diaries 2026",
        "personalised notebooks",
        "corporate gifts india",
        "corporate gifts delhi",
        "diary printing 2026",
        "executive planners b2b",
        "bulk corporate gifts",
        "customised note books",
        "leatherette diaries",
        "promotional gift hampers",
        brand.toLowerCase(),
        "b2b corporate procurement",
        "custom planners",
      ],
      alternates: { canonical: "/" },
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        url: "/",
        siteName: brand,
        locale: "en_IN",
        type: "website",
        images: [{ url: ogImage, width: 1200, height: 630, alt: `${brand} customised diaries, notebooks, and corporate gifts` }],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: defaultDescription,
        images: [ogImage],
      },
      robots: { index: true, follow: true },
      icons: { icon: favicon },
    };
  } catch (e) {
    console.error("generateMetadata failed", e);
    return {
      title: `${DEFAULT_BRAND_NAME} | Corporate Gifts, Diaries & Notebooks`,
      description: "Corporate gifts, pens, notebooks, and customised diaries.",
      metadataBase: new URL(DEFAULT_SITE_URL),
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const enableVisualEdits = process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITS === "true";
  const settings = await getSettings().catch(() => null);
  const brand = settings?.brandName || DEFAULT_BRAND_NAME;
  const siteUrl = normalizePublicSiteUrl(settings?.siteUrl);

  const orgSchema = buildOrganizationSchema({
    brandName: brand,
    siteUrl,
    logoUrl: settings?.logoUrl,
    phone: settings?.phone,
    email: settings?.email,
    address: settings?.address,
  });

  const webSiteSchema = buildWebSiteSchema({
    brandName: brand,
    siteUrl,
  });

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="antialiased">
        <ProductProvider>
          {enableVisualEdits && <ErrorReporter />}
          {enableVisualEdits && (
            <Script
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="true"
              data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
            />
          )}
          <Toaster position="top-center" richColors expand />
          {children}
          <WhatsAppButton />
          {enableVisualEdits && <VisualEditsMessenger />}
        </ProductProvider>
      </body>
    </html>
  );
}
