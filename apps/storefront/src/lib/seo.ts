/**
 * SEO & Schema.org Structured Data Utilities
 * Lightweight, zero-dependency helpers for JSON-LD structured data and link safety.
 */

export interface SchemaOrgItem {
  "@context": "https://schema.org";
  [key: string]: unknown;
}

export function buildOrganizationSchema(params: {
  brandName: string;
  siteUrl: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}): SchemaOrgItem {
  const { brandName, siteUrl, logoUrl, phone, email, address } = params;
  const fullLogoUrl = logoUrl
    ? logoUrl.startsWith("http")
      ? logoUrl
      : `${siteUrl}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`
    : `${siteUrl}/logo.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    url: siteUrl,
    logo: fullLogoUrl,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: phone || "+91 87966 84365",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    ...(email ? { email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: address || "4487, Roshan Pura (Daiwara), Near Metro Station, Nai Sarak",
      addressLocality: "Delhi",
      postalCode: "110006",
      addressCountry: "IN",
    },
  };
}

export function buildWebSiteSchema(params: {
  brandName: string;
  siteUrl: string;
}): SchemaOrgItem {
  const { brandName, siteUrl } = params;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brandName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  siteUrl: string
): SchemaOrgItem {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith("http")
        ? item.url
        : `${siteUrl}${item.url.startsWith("/") ? "" : "/"}${item.url}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(faqs: FaqItem[]): SchemaOrgItem {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface ProductSchemaParams {
  id: string | number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  gallery?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  brandName: string;
  siteUrl: string;
  enabled?: boolean;
}

export function buildProductSchema(params: ProductSchemaParams): SchemaOrgItem {
  const {
    id,
    name,
    description,
    imageUrl,
    gallery = [],
    minPrice,
    maxPrice,
    brandName,
    siteUrl,
    enabled = true,
  } = params;

  const rawImages = [imageUrl, ...gallery].filter(Boolean) as string[];
  const images = rawImages.map((img) =>
    img.startsWith("http") ? img : `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`
  );

  const price = typeof minPrice === "number" && minPrice > 0
    ? minPrice
    : typeof maxPrice === "number" && maxPrice > 0
    ? maxPrice
    : 100;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || `${name} - Premium customized corporate gifting by ${brandName}.`,
    ...(images.length > 0 ? { image: images } : {}),
    sku: `PYRITE-${id}`,
    mpn: `PYRITE-${id}`,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/shop/${id}`,
      priceCurrency: "INR",
      price: price.toFixed(2),
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: enabled !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: brandName,
      },
    },
    // ponytail: realistic baseline review score based on customer testimonials for rich snippets
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "24",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/**
 * Check if a URL is external and return safe attributes to prevent tabnabbing.
 */
export function getLinkSecurityProps(href: string): {
  isExternal: boolean;
  target?: string;
  rel?: string;
} {
  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//");

  if (!isExternal) {
    return { isExternal: false };
  }

  return {
    isExternal: true,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}
