import type { Metadata } from "next";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductReviewsAndTags from "@/components/product/ProductReviewsAndTags";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getStorefrontData, getProductChrome } from "@/lib/site";
import { cmsItemByIdOrSlug, cmsCatalog } from "@/lib/cms/load";
import { buildProductSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { DEFAULT_BRAND_NAME, normalizePublicSiteUrl } from "@/lib/cms/mappers";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const [product, storefront] = await Promise.all([
    getProduct(resolvedParams.id),
    getStorefrontData().catch(() => null),
  ]);
  if (!product) return {};

  const brand = storefront?.settings?.brandName || DEFAULT_BRAND_NAME;
  const siteUrl = normalizePublicSiteUrl(storefront?.settings?.siteUrl);

  const title = product.seoTitle || `${product.name} | Customised Corporate Diaries & Gifts`;
  const description =
    product.seoDescription ||
    (product.description
      ? product.description.slice(0, 160)
      : `${product.name} - Premium customized corporate diary and planner by ${brand}.`);
  const canonicalUrl = `/shop/${encodeURIComponent(product.id)}`;
  const ogImage = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${siteUrl}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand,
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: product.enabled !== false,
      follow: true,
    },
  };
}

function normalizeTags(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  const tags = value
    .split(",")
    .map((tag) => tag.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return Array.from(new Set(tags));
}

async function getProduct(id: string): Promise<any | null> {
  const item = cmsItemByIdOrSlug(id);
  if (item) {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice,
      imageUrl: item.imageUrl ?? "",
      category: item.category,
      tags: item.tags,
      gallery: item.gallery,
      features: item.features,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      enabled: item.enabled,
      moq: item.moq ?? 50,
    };
  }
  return null;
}

async function getRelatedProducts(
  category: string,
  currentId: string | number,
): Promise<any[]> {
  const cat = (category || "").split(",")[0]?.trim().toLowerCase() || "";
  if (!cat) return [];
  const idStr = String(currentId);
  return cmsCatalog()
    .filter(
      (item) =>
        item.id !== idStr &&
        (item.category || "").toLowerCase().includes(cat),
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice,
      imageUrl: item.imageUrl ?? "",
      category: item.category,
      tags: normalizeTags(item.tags),
    }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [product, storefront, chrome] = await Promise.all([
    getProduct(resolvedParams.id),
    getStorefrontData(),
    getProductChrome(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category || "", product.id);
  const { settings, headerNav, megaMenu, footerLinks } = storefront;
  const brandName = settings?.brandName || DEFAULT_BRAND_NAME;
  const siteUrl = normalizePublicSiteUrl(settings?.siteUrl);

  const productSchema = buildProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    gallery: product.gallery,
    minPrice: product.minPrice,
    maxPrice: product.maxPrice,
    brandName,
    siteUrl,
    enabled: product.enabled,
  });

  const primaryCategory = product.category?.split(",")[0]?.trim() || "Shop";
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: primaryCategory, url: `/shop?category=${encodeURIComponent(primaryCategory)}` },
    { name: product.name, url: `/shop/${encodeURIComponent(product.id)}` },
  ];
  const breadcrumbsSchema = buildBreadcrumbSchema(breadcrumbItems, siteUrl);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
        phone={settings?.phone}
        email={settings?.email}
      />
      <main className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">
            {product.category?.split(",")[0]?.trim() || "Shop"}
          </Link>
          {product.category?.split(",")[1] && (
            <>
              <span>/</span>
              <span className="hover:text-primary transition-colors">
                {product.category.split(",")[1].trim()}
              </span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <ProductGallery
            imageUrl={product.imageUrl}
            productName={product.name}
            gallery={product.gallery}
          />
          <ProductInfo product={product} chrome={chrome} />
        </div>

        {/* Selectable Customer Reviews & Product Tags Section */}
        <ProductReviewsAndTags
          productId={product.id}
          productName={product.name}
          tags={product.tags}
        />

        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} heading={chrome.related_heading} />
        )}
      </main>
      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
