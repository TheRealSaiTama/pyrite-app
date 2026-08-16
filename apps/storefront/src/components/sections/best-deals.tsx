"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";
import {
  DEFAULT_BEST_DEALS_NAMES,
  matchCatalogIdsByNames,
} from "@/lib/cms/mappers";

const defaultProducts: Product[] = [
  {
    id: 100000,
    name: 'Management Premium PU Leather Diary 2026',
    price: 240,
    minPrice: 240,
    maxPrice: 300,
    description: 'Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.',
    image: '/diary/directors.png',
    currency: 'INR',
  },
  {
    id: 100001,
    name: 'DIRECTORS Premium Leather Diary 2026',
    price: 172,
    minPrice: 172,
    maxPrice: 195,
    description: 'Director edition PU leather diary with sponge padding and elegant magnetic flap finish.',
    image: '/diary/regularleather.png',
    currency: 'INR',
  },
  {
    id: 100002,
    name: 'Heritage Leather Executive Diary 2026',
    price: 137,
    minPrice: 137,
    maxPrice: 153,
    description: 'Heritage inspired PU leather diary with foam padding and one-date-per-page layout.',
    image: '/diary/antleather.png',
    currency: 'INR',
  },
  {
    id: 100003,
    name: 'Paipin Brown Executive Leather Diary',
    price: 154,
    minPrice: 154,
    maxPrice: 176,
    description: 'Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.',
    image: '/diary/papin.png',
    currency: 'INR',
  },
];

const heartIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg";
const starIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg";

const ProductCard = ({ product }: { product: Product }) => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();
  const selected = isSelected(product.id);

  const priceString = (() => {
    const hasRange = typeof product.minPrice === 'number' && typeof product.maxPrice === 'number' && product.minPrice !== product.maxPrice;
    const baseValue = typeof product.minPrice === 'number' ? product.minPrice : product.price;
    if (hasRange) {
      return `₹${product.minPrice!.toLocaleString()} – ₹${product.maxPrice!.toLocaleString()}`;
    }
    if (typeof baseValue === 'number' && !Number.isNaN(baseValue)) {
      return `₹${baseValue.toLocaleString()}`;
    }
    return 'Price on request';
  })();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 relative">
      {/* Top Floating Badges: Select Checkbox & Min Order */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xs border border-slate-100 flex items-center">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => {
              if (checked) {
                selectProduct(product);
              } else {
                deselectProduct(product.id);
              }
            }}
            className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 rounded-md"
            aria-label={`Select ${product.name} for quotation`}
          />
        </div>
      </div>

      {/* Product Image Container */}
      <Link href={`/shop/${product.id}`} className="relative bg-slate-50/70 aspect-[4/3] overflow-hidden p-6 block">
        <Image
          src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
          alt={product.name}
          fill
          unoptimized={isRemoteOrDataImage(product.image || "")}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-108"
        />
        <span className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-xs border border-slate-100 transition-all duration-300 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
          <Image src={heartIconUrl} alt="Wishlist" width={15} height={15} unoptimized />
        </span>
      </Link>

      {/* Card Info Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Custom Logo
            </span>
            <div className="flex items-center">
              <span className="text-amber-500 text-xs mr-1">★</span>
              <span className="text-xs font-semibold text-slate-700">4.9</span>
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-slate-700 transition-colors">
            <Link href={`/shop/${product.id}`}>
              {product.name}
            </Link>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {product.description || "Premium handcrafted executive finish with custom branding."}
          </p>
        </div>

        <div>
          {/* Price Tag */}
          <div className="flex items-baseline justify-between mb-4 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Factory Bulk Rate</span>
              <p className="text-base sm:text-lg font-extrabold text-slate-900">
                {priceString}
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Min. 50 pcs</span>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              selectProduct(product);
            }}
            className={`w-full rounded-full font-semibold text-xs py-2.5 transition-all shadow-xs ${
              selected 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {selected ? "✓ Added to Quote" : "Add to Bulk Quote"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function mapDbProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name || "Product",
    image: resolveProductImage(p.imageUrl || p.image_url || p.image),
    minPrice: p.minPrice ?? p.min_price ?? null,
    maxPrice: p.maxPrice ?? p.max_price ?? null,
    description: p.description || "",
    currency: "INR",
  };
}

interface BestDealsSectionProps {
  content?: any;
  products?: any[];
}

const BestDealsSection = ({ content, products: dbProducts }: BestDealsSectionProps) => {
  const heading = content?.heading || "Today's Featured Diaries & Combos";
  const selectedIds: string[] = (content?.items || [])
    .map((item: any) => item?.productId)
    .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);

  const byId = new Map(
    (dbProducts || []).map((p) => [String(p.id), mapDbProduct(p)]),
  );
  let items: Product[] =
    selectedIds.length > 0
      ? selectedIds.map((id) => byId.get(id)).filter((p): p is Product => !!p)
      : [];
  if (items.length === 0 && (dbProducts || []).length > 0) {
    const matched = matchCatalogIdsByNames(dbProducts || [], DEFAULT_BEST_DEALS_NAMES, 4);
    items = matched
      .map((m) => byId.get(m.productId))
      .filter((p): p is Product => !!p);
  }
  if (items.length === 0) items = defaultProducts;

  return (
    <section className="bg-slate-50/50 py-16 lg:py-24 border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Featured 2026 Release
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {heading}
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors group self-start md:self-end"
          >
            <span>Explore Full Catalog</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestDealsSection;
