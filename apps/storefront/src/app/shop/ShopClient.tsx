'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Diary, Product } from '@prisma/client';
import { resolveProductImage, isRemoteOrDataImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";

type ShopProduct = {
  id: string | number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  tags: string | null;
  minPrice: number | null;
  maxPrice: number | null;
};

interface Filters {
  category: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price';
  sortOrder: 'asc' | 'desc';
}

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const normalizedA = [...a].sort();
  const normalizedB = [...b].sort();
  return normalizedA.every((value, index) => value === normalizedB[index]);
};

function getFileIdFromUrl(url: string): string | null {
  if (!url) return null;

  const regex = /(?:\/d\/|\?id=|&id=)([a-zA-Z0-9_-]{28,})/;
  const match = url.match(regex);

  return match ? match[1] : null;
}

function stemCat(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => {
      if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
      if (w.endsWith("es") && w.length > 4 && !w.endsWith("ses") && !w.endsWith("zes")) return w.slice(0, -2);
      if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
      return w;
    })
    .join(" ");
}

function categoryMatches(productCategory: string, filterCat: string): boolean {
  const needle = filterCat.toLowerCase().trim();
  if (!needle) return true;
  const parts = productCategory.split(',').map((p) => p.toLowerCase().trim()).filter(Boolean);
  if (parts.length === 0) return false;
  const stemNeedle = stemCat(needle);
  const compact = (s: string) => s.replace(/[^a-z0-9]+/g, " ").trim();
  const n = compact(needle);
  return parts.some((part) => {
    if (part === needle) return true;
    const h = compact(part);
    if (h === n || h.includes(n) || n.includes(h)) return true;
    const stemPart = stemCat(part);
    if (stemPart === stemNeedle || stemPart.includes(stemNeedle) || stemNeedle.includes(stemPart)) return true;
    return false;
  });
}

function filterAndSortProducts(products: ShopProduct[], filters: Filters): ShopProduct[] {
  let filtered: ShopProduct[] = products;

  if (filters.category.length > 0) {
    filtered = filtered.filter(
      (product: ShopProduct) =>
        product.category &&
        filters.category.some((cat: string) => categoryMatches(product.category!, cat)),
    );
  }

  if (filters.minPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => product.minPrice && product.minPrice >= filters.minPrice);
  }

  if (filters.maxPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => product.maxPrice && product.maxPrice <= filters.maxPrice);
  }

  return filtered.sort((a: ShopProduct, b: ShopProduct) => {
    let comparison = 0;
    if (filters.sortBy === 'price') {
      comparison = (a.minPrice || 0) - (b.minPrice || 0);
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });
}

function ShopCard({ product }: { product: ShopProduct }) {
  const resolved = resolveProductImage(product.imageUrl);
  const [imgSrc, setImgSrc] = useState(resolved);

  useEffect(() => {
    setImgSrc(resolveProductImage(product.imageUrl));
  }, [product.imageUrl]);

  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-primary/30 flex flex-col group">
      <Link href={`/shop/${product.id}`} className="block flex-1 flex flex-col">
        <div className="relative h-56 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name || "Product"}
            fill
            unoptimized={imgSrc.startsWith("data:")}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => {
              if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
                setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
              }
            }}
          />
          <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
            View Details
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between flex-1">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <span className="text-lg font-bold text-primary">
              {typeof product.minPrice === 'number' && product.minPrice !== null
                ? `₹${product.minPrice.toLocaleString()}`
                : 'On request'}
            </span>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-primary transition-colors flex items-center gap-1">
              View →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function ShopClient({
  initialDiaries,
  initialProducts,
  chrome,
}: {
  initialDiaries: Diary[];
  initialProducts: Product[];
  chrome?: {
    heading?: string;
    subheading?: string;
    empty_state?: string;
  };
}) {
  const heading = chrome?.heading?.trim() || "Our Products";
  const emptyState =
    chrome?.empty_state?.trim() ||
    "No products match your filters. Try clearing filters.";
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    category: [],
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'price',
    sortOrder: 'asc',
  });
  const pricePresets = useMemo(
    () => [
      { label: 'Under ₹200', min: 0, max: 200 },
      { label: '₹200 - ₹350', min: 200, max: 350 },
      { label: '₹350 - ₹500', min: 350, max: 500 },
      { label: '₹500+', min: 500, max: 0 },
    ],
    []
  );



  const combinedProducts = useMemo(() => {
    const diariesAsProducts: ShopProduct[] = (initialDiaries || []).map((diary: any) => ({
      id: diary.id,
      name: diary.name,
      description: diary.description ?? null,
      imageUrl: diary.imageUrl ?? diary.image_url ?? null,
      category: diary.category ?? null,
      tags: Array.isArray(diary.tags) ? diary.tags.join(", ") : diary.tags ?? null,
      minPrice: diary.minPrice ?? diary.min_price ?? null,
      maxPrice: diary.maxPrice ?? diary.max_price ?? null,
    }));
    const productsAsShopProducts: ShopProduct[] = (initialProducts || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      imageUrl: product.imageUrl ?? product.image_url ?? null,
      category: product.category ?? null,
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags ?? null,
      minPrice: product.minPrice ?? product.min_price ?? null,
      maxPrice: product.maxPrice ?? product.max_price ?? null,
    }));
    return [...diariesAsProducts, ...productsAsShopProducts];
  }, [initialDiaries, initialProducts]);

  useEffect(() => {
    if (!searchParams) return;
    const categoryParams = searchParams.getAll('category');
    let nextCategories = categoryParams.filter(Boolean);
    if (nextCategories.length === 0) {
      const single = searchParams.get('category');
      if (single) {
        nextCategories = single.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    setFilters((prev) => {
      if (arraysEqual(prev.category, nextCategories)) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategories,
      };
    });
  }, [searchParams]);

  const results = useMemo(() => filterAndSortProducts(combinedProducts, filters), [combinedProducts, filters]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFilters((prevFilters: Filters) => ({
      ...prevFilters,
      category: checked 
        ? [...prevFilters.category.filter((c: string) => !categoryMatches(value, c)), value]
        : prevFilters.category.filter((c: string) => !categoryMatches(value, c)),
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters: Filters) => ({
      ...prevFilters,
      [name]: Number(value) || 0,
    }));
  };

  const handlePresetSelect = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as ['name' | 'price', 'asc' | 'desc'];
    setFilters((prevFilters: Filters) => ({ ...prevFilters, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      minPrice: 0,
      maxPrice: 0,
      sortBy: 'price',
      sortOrder: 'asc',
    });
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of combinedProducts) {
      if (!p.category) continue;
      const parts = p.category.split(',').map((c) => c.trim()).filter(Boolean);
      for (const part of parts) {
        set.add(part);
      }
    }
    return Array.from(set).sort();
  }, [combinedProducts]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 order-2 lg:order-1">
            <div className="sticky top-4 space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Refine</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-800">Curate your picks</h2>
                <p className="mt-1 text-sm text-slate-500">Mix and match diaries that suit your gifting mood.</p>

                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-3">Categories</p>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                      {uniqueCategories.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-slate-600 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <span className="truncate pr-3">{cat}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            value={cat}
                            checked={filters.category.some((c: string) => categoryMatches(cat, c))}
                            onChange={handleCategoryChange}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">Price range</p>
                      <span className="text-xs uppercase tracking-wide text-primary/70">Crafted in ₹</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Min</span>
                        <input
                          type="number"
                          name="minPrice"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={filters.minPrice || ''}
                          onChange={handlePriceChange}
                        />
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Max</span>
                        <input
                          type="number"
                          name="maxPrice"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={filters.maxPrice || ''}
                          onChange={handlePriceChange}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pricePresets.map((preset) => {
                        const isActive =
                          filters.minPrice === preset.min &&
                          (preset.max === 0 ? filters.maxPrice === 0 : filters.maxPrice === preset.max);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handlePresetSelect(preset.min, preset.max)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? 'border-primary bg-primary text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    Reset filters
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {filters.category.length + (filters.minPrice > 0 ? 1 : 0) + (filters.maxPrice > 0 ? 1 : 0)} active
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
          <div className="lg:w-4/5 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {heading} ({results.length})
              </h1>
              <div className="flex items-center gap-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-w-[180px]"
                  onChange={handleSortChange}
                  defaultValue="price-asc"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📓</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">{emptyState}</h2>
                <p className="text-gray-500 mb-6">Try adjusting your filters or clearing them to see all products.</p>
                <button 
                  onClick={clearFilters} 
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ShopCard key={String(product.id)} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
