"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";
import {
  DEFAULT_POPULAR_NAMES,
  matchCatalogIdsByNames,
} from "@/lib/cms/mappers";

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Primo A5 Corporate Diary and Pen Set",
    price: 225,
    minPrice: 225,
    maxPrice: 255,
    currency: "INR" as const,
    description: "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
    image: "/diary/trendingdiary.png",
  },
  {
    id: 2,
    name: "Wooden A5 Corporate Diary and Pen Set",
    price: 230,
    minPrice: 230,
    maxPrice: 250,
    currency: "INR" as const,
    description: "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
    image: "/diary/trendingdiary2.png",
  },
  {
    id: 3,
    name: "Polo A5 Corporate Diary and Pen Set",
    price: 220,
    minPrice: 220,
    maxPrice: 245,
    currency: "INR" as const,
    description: "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
    image: "/diary/trendingdiary3.png",
  },
  {
    id: 4,
    name: "50-50 B5 Diary Calendar with Pen Combo Set",
    price: 315,
    minPrice: 315,
    maxPrice: 332,
    currency: "INR" as const,
    description: "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
    image: "/diary/trendingdiary4.png",
  },
  {
    id: 5,
    name: "Oval Leather B5 Diary with Pen Gift Set",
    price: 300,
    minPrice: 300,
    maxPrice: 310,
    currency: "INR" as const,
    description: "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
    image: "/diary/trendingdiary5.png",
  },
];

const RATING = 5;
const REVIEWS = 121;

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

interface WeeklyPopularProductsProps {
  content?: any;
  products?: any[];
}

const PopularProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [imgSrc, setImgSrc] = useState(product.image || PRODUCT_IMAGE_PLACEHOLDER);

  useEffect(() => {
    setImgSrc(product.image || PRODUCT_IMAGE_PLACEHOLDER);
  }, [product.image]);

  const base = typeof product.minPrice === "number" ? product.minPrice : product.price;
  const displayPrice = typeof base === "number" && !Number.isNaN(base)
    ? `₹${base.toLocaleString()}`
    : 'On request';
  const productHref = `/shop/${product.id || index}`;

  return (
    <div 
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 relative justify-between"
    >
      <Link href={productHref} className="block flex-1 flex flex-col">
        {/* Product Image */}
        <div className="relative bg-slate-50/70 aspect-[4/3] overflow-hidden p-5 flex items-center justify-center block">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            unoptimized={imgSrc.startsWith("data:")}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-108"
            onError={() => {
              if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
                setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
              }
            }}
          />
          <span className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-xs border border-slate-100 transition-all duration-300 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
            <Image src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg" alt="Wishlist" width={14} height={14} unoptimized />
          </span>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-slate-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-400 block">Price</span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">{displayPrice}</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-[#0F172A] transition-colors flex items-center gap-1">
              View →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const WeeklyPopularProducts = ({ content, products: dbProducts }: WeeklyPopularProductsProps) => {
  const heading = content?.heading || "Trending Diary Giftsets";
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
    const matched = matchCatalogIdsByNames(dbProducts || [], DEFAULT_POPULAR_NAMES, 5);
    items = matched
      .map((m) => byId.get(m.productId))
      .filter((p): p is Product => !!p);
  }
  if (items.length === 0) items = defaultProducts;

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Trending Gift Combos
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {heading}
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors group self-start md:self-end"
          >
            <span>View All Gift Sets</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {items.map((product, index) => (
            <PopularProductCard key={product.id || index} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeeklyPopularProducts;
