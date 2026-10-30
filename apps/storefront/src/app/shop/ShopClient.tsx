'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Diary, Product } from '@prisma/client';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import { resolveProductImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import {
  STOREFRONT_CATEGORIES,
  matchCategory,
  getSubcategory,
  extractProductMaterials,
} from '@/lib/catalog-categories';

type ShopProduct = {
  id: string | number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  tags: string[] | string | null;
  features?: Record<string, any> | null;
  cover_type?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
};

interface Filters {
  category: string[];
  subcategory: string | null;
  materials: string[];
  search: string | null;
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
  if (matchCategory(productCategory, filterCat)) return true;
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

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((product: ShopProduct) => {
        const nameMatch = product.name.toLowerCase().includes(q);
        const descMatch = product.description ? product.description.toLowerCase().includes(q) : false;
        const catMatch = product.category ? product.category.toLowerCase().includes(q) : false;
        return nameMatch || descMatch || catMatch;
      });
    }
  }

  if (filters.category.length > 0) {
    filtered = filtered.filter(
      (product: ShopProduct) =>
        product.category &&
        filters.category.some((cat: string) => categoryMatches(product.category!, cat)),
    );
  }

  if (filters.subcategory) {
    const targetSub = filters.subcategory.toLowerCase().trim();
    filtered = filtered.filter((product: ShopProduct) => {
      const catsToCheck =
        filters.category.length > 0
          ? filters.category
          : product.category
          ? product.category.split(',').map((c) => c.trim())
          : [''];
      return catsToCheck.some((cat) => {
        const sub = getSubcategory(product, cat);
        if (sub.toLowerCase() === targetSub) return true;
        const tags = Array.isArray(product.tags)
          ? product.tags
          : typeof product.tags === 'string'
          ? product.tags.split(',').map((t) => t.trim())
          : [];
        return tags.some((t) => t.toLowerCase() === targetSub);
      });
    });
  }

  if (filters.materials.length > 0) {
    filtered = filtered.filter((product: ShopProduct) => {
      const itemMaterials = extractProductMaterials(product);
      return filters.materials.some((selectedMat) =>
        itemMaterials.some((im) => im.toLowerCase() === selectedMat.toLowerCase())
      );
    });
  }

  if (filters.minPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => (product.minPrice ?? product.maxPrice ?? 0) >= filters.minPrice);
  }

  if (filters.maxPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => (product.minPrice ?? product.maxPrice ?? Infinity) <= filters.maxPrice);
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
    <article className="bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <Link href={`/shop/${product.id}`} className="block flex-1 flex flex-col">
        <div className="relative aspect-square w-full bg-slate-50/60 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <Image
            src={imgSrc}
            alt={product.name || "Product"}
            fill
            unoptimized={imgSrc.startsWith("data:")}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => {
              if (imgSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
                setImgSrc(PRODUCT_IMAGE_PLACEHOLDER);
              }
            }}
          />
        </div>
        <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          <div className="pt-2 border-t border-slate-100 mt-auto">
            <div className="text-[11px] sm:text-xs text-slate-600 flex flex-wrap items-baseline gap-1">
              <span>As low as</span>
              {typeof product.minPrice === 'number' && product.minPrice !== null ? (
                <>
                  {typeof product.maxPrice === 'number' && product.maxPrice > product.minPrice && (
                    <span className="line-through text-slate-400 text-[10px] sm:text-xs mr-0.5">
                      ₹{product.maxPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-red-600 font-bold text-xs sm:text-sm">
                    ₹{product.minPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-slate-800 text-xs">On request</span>
              )}
            </div>
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
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    category: [],
    subcategory: null,
    materials: [],
    search: null,
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'price',
    sortOrder: 'asc',
  });

  const heading = filters.search
    ? `Search results for "${filters.search}"`
    : chrome?.heading?.trim() || "Our Products";
  const emptyState =
    chrome?.empty_state?.trim() ||
    "No products match your filters. Try clearing filters.";

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
      tags: diary.tags ?? null,
      features: diary.features ?? null,
      cover_type: diary.cover_type ?? diary.coverType ?? null,
      minPrice: diary.minPrice ?? diary.min_price ?? null,
      maxPrice: diary.maxPrice ?? diary.max_price ?? null,
    }));
    const productsAsShopProducts: ShopProduct[] = (initialProducts || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      imageUrl: product.imageUrl ?? product.image_url ?? null,
      category: product.category ?? null,
      tags: product.tags ?? null,
      features: product.features ?? null,
      cover_type: product.cover_type ?? product.coverType ?? null,
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

    const subcategoryParam = searchParams.get('subcategory') || null;

    const materialParams = searchParams.getAll('material');
    let nextMaterials = materialParams.filter(Boolean);
    if (nextMaterials.length === 0) {
      const singleMat = searchParams.get('material');
      if (singleMat) {
        nextMaterials = singleMat.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }

    const searchParam = searchParams.get('search') || searchParams.get('q') || null;

    setFilters((prev) => {
      const catChanged = !arraysEqual(prev.category, nextCategories);
      const subChanged = prev.subcategory !== subcategoryParam;
      const matChanged = !arraysEqual(prev.materials, nextMaterials);
      const searchChanged = prev.search !== searchParam;
      if (!catChanged && !subChanged && !matChanged && !searchChanged) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategories,
        subcategory: subcategoryParam,
        materials: nextMaterials,
        search: searchParam,
      };
    });
  }, [searchParams]);

  const results = useMemo(
    () => filterAndSortProducts(combinedProducts, filters),
    [combinedProducts, filters]
  );

  const toggleCategory = (cat: string) => {
    setFilters((prev) => {
      const isSelected = prev.category.some((c) => categoryMatches(cat, c));
      const nextCats = isSelected
        ? prev.category.filter((c) => !categoryMatches(cat, c))
        : [...prev.category, cat];
      return {
        ...prev,
        category: nextCats,
        subcategory: null,
      };
    });
  };

  const handleMaterialToggle = (mat: string) => {
    setFilters((prev) => {
      const isSelected = prev.materials.includes(mat);
      const next = isSelected
        ? prev.materials.filter((m) => m !== mat)
        : [...prev.materials, mat];
      return {
        ...prev,
        materials: next,
      };
    });
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
      subcategory: null,
      materials: [],
      search: null,
      minPrice: 0,
      maxPrice: 0,
      sortBy: 'price',
      sortOrder: 'asc',
    });
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    for (const cat of STOREFRONT_CATEGORIES) {
      set.add(cat);
    }
    for (const p of combinedProducts) {
      if (!p.category) continue;
      const parts = p.category
        .split(',')
        .map((c) => c.trim().toUpperCase().replace(/\s+/g, ' '))
        .filter(Boolean);
      for (const part of parts) {
        if (!Array.from(set).some((existing) => categoryMatches(part, existing))) {
          set.add(part);
        }
      }
    }
    return Array.from(set);
  }, [combinedProducts]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of uniqueCategories) {
      map[cat] = combinedProducts.filter((p) =>
        p.category && categoryMatches(p.category, cat)
      ).length;
    }
    return map;
  }, [combinedProducts, uniqueCategories]);

  const { uniqueMaterials, materialCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of combinedProducts) {
      const mats = extractProductMaterials(p);
      for (const m of mats) {
        counts[m] = (counts[m] || 0) + 1;
      }
    }
    const unique = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { uniqueMaterials: unique, materialCounts: counts };
  }, [combinedProducts]);

  const activeFiltersCount =
    filters.category.length +
    (filters.subcategory ? 1 : 0) +
    filters.materials.length +
    (filters.search ? 1 : 0) +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice > 0 ? 1 : 0);

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="sticky top-4 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Refine</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-800">Curate your picks</h2>
              <p className="mt-1 text-sm text-slate-500">Filter by category, material, and price.</p>

              <div className="mt-6 space-y-6">
                {/* 1. Categories Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700">Categories</p>
                    {filters.category.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, category: [], subcategory: null }))}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {uniqueCategories.slice(0, 6).map((cat) => {
                      const isChecked = filters.category.some((c: string) => categoryMatches(cat, c));
                      const count = categoryCounts[cat] || 0;
                      return (
                        <label
                          key={cat}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition cursor-pointer ${
                            isChecked
                              ? 'border-[#0F172A] bg-slate-50 text-slate-900 font-semibold shadow-2xs'
                              : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400 font-normal">({count})</span>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat)}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {uniqueCategories.length > 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategorySearchQuery("");
                        setIsCategoryModalOpen(true);
                      }}
                      className="mt-2.5 text-xs font-semibold text-[#0F172A] hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+ Show more ({uniqueCategories.length - 6} more)</span>
                    </button>
                  )}
                </div>

                {/* 2. Material Filter */}
                {uniqueMaterials.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-700">Material</p>
                      {filters.materials.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, materials: [] }))}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                      {uniqueMaterials.map((mat) => {
                        const isChecked = filters.materials.includes(mat);
                        const count = materialCounts[mat] || 0;
                        return (
                          <label
                            key={mat}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition cursor-pointer ${
                              isChecked
                                ? 'border-[#0F172A] bg-slate-50 text-slate-900 font-semibold shadow-2xs'
                                : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate pr-2">{mat}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-slate-400 font-normal">({count})</span>
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                                checked={isChecked}
                                onChange={() => handleMaterialToggle(mat)}
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Price Range Filter */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Price range</p>
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
                          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition cursor-pointer ${
                            isActive
                              ? 'border-primary bg-primary text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset All Filters Button */}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full rounded-xl border border-[#0F172A] px-5 py-2.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#0F172A] hover:text-white cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Reset all filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800 font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Main View */}
        <div className="flex-1 min-w-0">
          {/* Catalog Description Text (Aligned with reference screenshot) */}
          <div className="mb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-b border-slate-100 pb-3">
            <p>
              Whether you are looking for an elegant handcrafted leather diary, personalized executive stationery, or corporate gift sets tailored to your team, explore our factory-direct collection below.
            </p>
          </div>

          {/* Header & Controls Bar */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3 flex-wrap">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                {heading} ({results.length})
              </h1>
              {filters.subcategory && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing subcategory: <span className="font-semibold text-slate-800">{filters.subcategory}</span>
                </p>
              )}
            </div>

            {/* Mobile Controls: Show Filters Button + Sort Dropdown */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              {/* Show Filters button on mobile (pill style matching reference screenshot) */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-slate-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Show Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-slate-900 text-white px-1.5 py-0.2 text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown (rounded style matching reference screenshot) */}
              <select
                className="px-3 py-1.5 border border-slate-300 rounded-lg sm:rounded-xl bg-white text-xs font-medium text-slate-700 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                onChange={handleSortChange}
                value={`${filters.sortBy}-${filters.sortOrder}`}
                aria-label="Sort products"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(filters.category.length > 0 ||
            filters.subcategory ||
            filters.materials.length > 0 ||
            filters.search ||
            filters.minPrice > 0 ||
            filters.maxPrice > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Active:
              </span>
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white">
                  <span className="truncate max-w-[160px]">Search: &ldquo;{filters.search}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, search: null }))}
                    className="hover:opacity-75 cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                >
                  <span className="truncate max-w-[160px]">{cat}</span>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="hover:text-rose-600 cursor-pointer"
                    aria-label={`Remove category filter ${cat}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.subcategory && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="truncate max-w-[160px]">Sub: {filters.subcategory}</span>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, subcategory: null }))}
                    className="hover:text-rose-600 cursor-pointer"
                    aria-label="Remove subcategory filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.materials.map((mat) => (
                <span
                  key={mat}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
                >
                  <span className="truncate max-w-[160px]">{mat}</span>
                  <button
                    type="button"
                    onClick={() => handleMaterialToggle(mat)}
                    className="hover:text-rose-600 cursor-pointer"
                    aria-label={`Remove material filter ${mat}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(filters.minPrice > 0 || filters.maxPrice > 0) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  <span>
                    ₹{filters.minPrice} - {filters.maxPrice ? `₹${filters.maxPrice}` : 'Above'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 0 }))}
                    className="hover:text-rose-600 cursor-pointer"
                    aria-label="Remove price filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:underline ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid or Empty State */}
          {results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📓</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{emptyState}</h2>
              <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
                No products match your selected filters. Try clearing some filters or browse all categories.
              </p>
              <button 
                onClick={clearFilters} 
                className="px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {results.map((product) => (
                <ShopCard key={String(product.id)} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Show More Categories Modal Overlay */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCategoryModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Categories</h3>
                <p className="text-xs text-slate-500 mt-0.5">Filter products by one or more categories</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            {/* Categories Multi-select Grid */}
            <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {uniqueCategories
                  .filter((c) =>
                    c.toLowerCase().includes(categorySearchQuery.toLowerCase().trim())
                  )
                  .map((cat) => {
                    const isChecked = filters.category.some((c: string) => categoryMatches(cat, c));
                    const count = categoryCounts[cat] || 0;
                    return (
                      <label
                        key={cat}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-[#0F172A] bg-slate-50 text-slate-900 font-semibold shadow-2xs'
                            : 'border-slate-100 bg-slate-50/40 text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat)}
                          />
                          <span className="text-xs truncate">{cat}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                          ({count})
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  {filters.category.length} category{filters.category.length === 1 ? '' : 'ies'} selected
                </span>
                {filters.category.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, category: [], subcategory: null }))}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Filters Drawer / Slide-Over Modal */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-800" />
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-[#0F172A] text-white px-2 py-0.5 text-[11px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">
            {/* 1. Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Categories</p>
                {filters.category.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, category: [], subcategory: null }))}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {uniqueCategories.map((cat) => {
                  const isChecked = filters.category.some((c: string) => categoryMatches(cat, c));
                  const count = categoryCounts[cat] || 0;
                  return (
                    <label
                      key={cat}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition cursor-pointer ${
                        isChecked
                          ? 'border-[#0F172A] bg-slate-50 text-slate-900 font-semibold shadow-2xs'
                          : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400">({count})</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat)}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Materials */}
            {uniqueMaterials.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-800">Material</p>
                  {filters.materials.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, materials: [] }))}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                  {uniqueMaterials.map((mat) => {
                    const isChecked = filters.materials.includes(mat);
                    const count = materialCounts[mat] || 0;
                    return (
                      <label
                        key={mat}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition cursor-pointer ${
                          isChecked
                            ? 'border-[#0F172A] bg-slate-50 text-slate-900 font-semibold shadow-2xs'
                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{mat}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400">({count})</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                            checked={isChecked}
                            onChange={() => handleMaterialToggle(mat)}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Price Range */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Price Range</p>
                {(filters.minPrice > 0 || filters.maxPrice > 0) && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 0 }))}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Min (₹)</span>
                  <input
                    type="number"
                    name="minPrice"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                    value={filters.minPrice || ''}
                    onChange={handlePriceChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Max (₹)</span>
                  <input
                    type="number"
                    name="maxPrice"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                    value={filters.maxPrice || ''}
                    onChange={handlePriceChange}
                    placeholder="Any"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pricePresets.map((preset) => {
                  const isActive =
                    filters.minPrice === preset.min &&
                    (preset.max === 0 ? filters.maxPrice === 0 : filters.maxPrice === preset.max);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset.min, preset.max)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex-1 rounded-xl bg-[#0F172A] py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              View ({results.length}) Results
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
