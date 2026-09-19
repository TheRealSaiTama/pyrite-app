import type { Metadata } from "next";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getStorefrontData, getProductChrome } from "@/lib/site";
import { cmsItemByIdOrSlug, cmsCatalog } from "@/lib/cms/load";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = "then" in params ? await params : params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return {};
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || product.name;
  return {
    title,
    description: description.slice(0, 200),
    openGraph: {
      title,
      description: description.slice(0, 200),
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
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
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = "then" in params ? await params : params;
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

  return (
    <div className="min-h-screen bg-white">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-gray-100">
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
            <div className="w-14 h-14 bg-[#0F172A] text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">New Year</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customized Diary & Note Books</h3>
            <p className="text-sm text-gray-600">Perfect for corporate gifting and personal use</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
            <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Bulk</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Special Pricing</h3>
            <p className="text-sm text-gray-600">Contact us for bulk orders and custom designs</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
            <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Quick</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
            <p className="text-sm text-gray-600">Quick delivery options available across India</p>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} heading={chrome.related_heading} />
        )}
      </main>
      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
