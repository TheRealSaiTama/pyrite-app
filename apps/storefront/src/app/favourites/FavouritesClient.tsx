"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Heart, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/ProductContext";
import {
  resolveProductImage,
  PRODUCT_IMAGE_PLACEHOLDER,
  isRemoteOrDataImage,
} from "@/lib/product-image";
import type { CatalogItem } from "@/lib/cms/load";
import { toast } from "sonner";

interface FavouritesClientProps {
  allProducts: CatalogItem[];
}

function WishlistCard({
  product,
  onRemove,
}: {
  product: CatalogItem;
  onRemove: (id: string, slug?: string, name?: string) => void;
}) {
  const { cart, addToCart } = useCart();
  const resolved = resolveProductImage(product.imageUrl);
  const [imgSrc, setImgSrc] = useState(resolved);

  useEffect(() => {
    setImgSrc(resolveProductImage(product.imageUrl));
  }, [product.imageUrl]);

  const isInCart = cart.some(
    (c) =>
      String(c.id).toLowerCase() === String(product.id).toLowerCase() ||
      (product.slug && String(c.id).toLowerCase() === String(product.slug).toLowerCase()),
  );

  const priceLabel = useMemo(() => {
    const min = product.minPrice;
    const max = product.maxPrice;
    if (typeof min === "number" && typeof max === "number" && min > 0) {
      return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
    }
    if (typeof min === "number" && min > 0) return `₹${min.toLocaleString()}`;
    if (typeof max === "number" && max > 0) return `₹${max.toLocaleString()}`;
    return "Price on request";
  }, [product.minPrice, product.maxPrice]);

  const targetHref = `/shop/${product.slug || product.id}`;
  const categoryLabel = product.category?.split(",")[0]?.trim() || (product.source === "diary" ? "DIARY" : "CORPORATE GIFT");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.imageUrl || undefined,
        price: product.minPrice || 0,
        moq: product.moq || 50,
        slug: product.slug,
        category: product.category,
      },
      product.moq || 50,
    );
    toast.success(`Added ${product.name} to cart`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product.id, product.slug, product.name);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden relative">
      {/* Delete / Remove Wishlist Button in Top-Right Corner */}
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-white hover:border-red-200 hover:scale-105 shadow-xs transition-all cursor-pointer"
        title="Remove from Wishlist"
        aria-label={`Remove ${product.name} from wishlist`}
      >
        <Trash2 className="w-4 h-4 stroke-[1.8]" />
      </button>

      {/* Product Image Link */}
      <Link href={targetHref} className="block relative aspect-[3/4] bg-slate-50 overflow-hidden cursor-pointer">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          unoptimized={isRemoteOrDataImage(imgSrc)}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          onError={() => {
            if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
              setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
            }
          }}
        />
      </Link>

      {/* Card Body with Pyrite format */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#8B6B2E] mb-1.5 truncate">
            {categoryLabel}
          </p>

          {/* Product Name */}
          <Link href={targetHref} className="block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {priceLabel}
            </span>
            {product.moq ? (
              <span className="text-[11px] font-medium text-slate-500">
                MOQ: {product.moq} pcs
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isInCart
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-[#0F172A] text-white hover:bg-slate-800 shadow-xs"
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FavouritesClient({ allProducts }: FavouritesClientProps) {
  const { favourites, removeFromFavourites } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const favouriteProducts = useMemo(() => {
    if (!mounted || favourites.length === 0) return [];
    return allProducts.filter((product) =>
      favourites.some((fav) => {
        const needle = String(fav).toLowerCase();
        return (
          String(product.id).toLowerCase() === needle ||
          (product.slug && String(product.slug).toLowerCase() === needle)
        );
      }),
    );
  }, [allProducts, favourites, mounted]);

  const handleRemove = (id: string, slug?: string, name?: string) => {
    removeFromFavourites(id, slug);
    toast.success(`Removed ${name || "item"} from wishlist`);
  };

  // Pre-hydration placeholder to prevent layout shifts
  if (!mounted) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0F172A] font-semibold tracking-tight">
            My Wishlist
          </h1>
          <div className="h-4 w-24 bg-slate-100 rounded-full mx-auto mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 aspect-[3/4] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">My Wishlist</span>
      </nav>

      {/* My Wishlist Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#0F172A] font-semibold tracking-tight">
          My Wishlist
        </h1>
        {favouriteProducts.length > 0 && (
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            {favouriteProducts.length} {favouriteProducts.length === 1 ? "Product" : "Products"} Saved
          </p>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {favouriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {favouriteProducts.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-16 sm:py-24 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
            You haven&apos;t added any products to your wishlist yet. Tap the heart on any product to save it here.
          </p>
          <Link
            href="/shop"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
