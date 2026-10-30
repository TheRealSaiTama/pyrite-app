"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  Heart,
  ShoppingCart,
  X,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useCart } from "@/context/ProductContext";
import { isRemoteOrDataImage } from "@/lib/product-image";

type SearchResultItem = {
  id: string | number;
  name: string;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  path: string;
  source: "diary" | "product";
};

import { getDefaultCategoryNav } from "@/lib/catalog-categories";

type MegaItem = {
  name: string;
  subtitle?: string;
  image?: string;
  href: string;
  subcategories?: { name: string; href: string }[];
};

const FALLBACK_CATEGORIES: MegaItem[] = getDefaultCategoryNav();

const Header = ({
  nav,
  megaMenu,
  logoUrl,
  brandName,
  phone,
  email,
}: {
  nav?: { label: string; href: string; group?: string }[];
  megaMenu?: MegaItem[];
  logoUrl?: string | null;
  brandName?: string | null;
  phone?: string | null;
  email?: string | null;
}) => {
  const categoriesToDisplay = megaMenu && megaMenu.length > 0 ? megaMenu : FALLBACK_CATEGORIES;

  const rawLogo = logoUrl?.trim() || "";
  const logo = rawLogo || "/logo.png";
  const brand = brandName?.trim() || "Pyrite";
  const displayPhone = phone?.trim() || "+91 87966 84365";
  const displayEmail = email?.trim() || "info@pyrite.in";
  const telPhone = displayPhone.replace(/\s+/g, "");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mobileOpenSection, setMobileOpenSection] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const { cartCount, favourites } = useCart();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const searchAbortRef = React.useRef<AbortController | null>(null);
  const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
      searchAbortRef.current = null;
    }

    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Search request failed: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Search request error", error);
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleResultSelect = React.useCallback(
    (item: SearchResultItem) => {
      setIsSearchOpen(false);
      setSearchTerm("");
      setSearchResults([]);
      setIsMobileMenuOpen(false);
      router.push(item.path);
    },
    [router]
  );

  const formatPriceLabel = React.useCallback(
    (item: Pick<SearchResultItem, "minPrice" | "maxPrice">) => {
      const { minPrice, maxPrice } = item;
      if (typeof minPrice === "number" && typeof maxPrice === "number" && minPrice !== maxPrice) {
        return `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`;
      }
      if (typeof minPrice === "number") {
        return `₹${minPrice.toLocaleString()}`;
      }
      if (typeof maxPrice === "number") {
        return `₹${maxPrice.toLocaleString()}`;
      }
      return "Price on request";
    },
    []
  );

  const handleSearchSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (searchResults.length > 0) {
        handleResultSelect(searchResults[0]);
        return;
      }
      const trimmed = searchTerm.trim();
      if (trimmed) {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
      }
    },
    [handleResultSelect, router, searchResults, searchTerm]
  );

  const handleInputBlur = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => setIsSearchOpen(false), 150);
  }, []);

  const handleInputFocus = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsSearchOpen(true);
  }, []);

  const handleContactClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof window !== "undefined") {
        const aboutSection = document.getElementById("about") || document.getElementById("footer") || document.querySelector("footer");
        if (aboutSection) {
          e.preventDefault();
          aboutSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    []
  );

  // Standard nav links matching the user's specification
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Bulk Orders", href: "/bulk-orders" },
    { label: "Custom Print", href: "/custom-design" },
    { label: "Contact Us", href: "#about" },
  ];

  const occasionLinks = (nav || []).filter((item) => item.group === "shop_occasion");
  const professionLinks = (nav || []).filter((item) => item.group === "shop_profession");
  const selectedCategory = categoriesToDisplay.find((item) => item.name === activeCategory) || categoriesToDisplay[0];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      {/* Top Promotional Notification Bar */}
      <div className="bg-[#0F172A] py-2 text-white text-xs hidden sm:block border-b border-slate-800">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="font-medium text-slate-200 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Direct Factory Pricing • Custom Logo Embossing • 100% Quality Guarantee
          </p>
          <div className="flex items-center gap-5 text-slate-300">
            <a href={`tel:${telPhone}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{displayPhone}</span>
            </a>
            <span className="opacity-30">|</span>
            <a href={`mailto:${displayEmail}`} className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{displayEmail}</span>
            </a>
            <span className="opacity-30">|</span>
            <Link href="/bulk-orders" className="hover:underline font-semibold text-white transition-colors">
              Bulk Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Brand Logo, Long Search Bar, Favourites, Add to Cart */}
      <div className="w-full border-b border-slate-100 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src={logo}
              alt={brand}
              width={160}
              height={48}
              priority
              unoptimized={isRemoteOrDataImage(logo)}
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Long Search Bar (Desktop & Tablet) */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-6 lg:mx-8 relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center">
                <Input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search diaries, gifts, custom products..."
                  className="w-full h-11 pl-4 pr-12 rounded-lg border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] text-sm text-slate-900 transition-all shadow-2xs"
                  aria-label="Search diaries and gifts"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0F172A] hover:bg-[#1E293B] text-white p-2 rounded-md transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Search Autocomplete Dropdown */}
            {isSearchOpen &&
              (searchLoading || searchResults.length > 0 || searchTerm.trim().length > 0) && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden z-50"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-6 text-xs text-slate-500">
                        Searching catalog…
                      </div>
                    )}

                    {!searchLoading && searchResults.length === 0 && searchTerm.trim().length > 0 && (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No products found
                      </div>
                    )}

                    {!searchLoading &&
                      searchResults.map((item) => (
                        <button
                          key={`${item.source}-${item.id}`}
                          type="button"
                          onClick={() => handleResultSelect(item)}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <Image
                              src={item.imageUrl || "/file.svg"}
                              alt={item.name}
                              fill
                              unoptimized={isRemoteOrDataImage(item.imageUrl || "")}
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {formatPriceLabel(item)}
                            </p>
                          </div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {item.source === "product" ? "Gift" : "Diary"}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Actions: Favourites and Add to Cart */}
          <div className="flex items-center gap-2 sm:gap-7 shrink-0">
            {/* Favourites Button (Desktop) */}
            <Link
              href="/favourites"
              className="hidden md:flex flex-col items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors group relative px-1 py-0.5 cursor-pointer"
              title="View Favourites"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-slate-700 group-hover:text-[#0F172A] group-hover:scale-110 transition-all" />
                {favourites.length > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {favourites.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-[#0F172A] mt-1">
                Favourites
              </span>
            </Link>

            {/* Cart Button (Desktop) */}
            <Link
              href="/cart"
              className="hidden md:flex flex-col items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors group relative px-1 py-0.5 cursor-pointer"
              aria-label="View Shopping Cart"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-[#0F172A] group-hover:scale-110 transition-all" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#0F172A] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-[#0F172A] mt-1 whitespace-nowrap">
                Cart
              </span>
            </Link>

            {/* Mobile Actions: Phone, User, Cart matching reference screenshot */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href={`tel:${telPhone}`}
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors"
                aria-label="Call Us"
                title="Call Us"
              >
                <Phone className="w-4 h-4" />
              </a>

              <Link
                href="/favourites"
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors relative"
                aria-label="Favourites"
                title="Favourites"
              >
                <User className="w-4 h-4" />
                {favourites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {favourites.length}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors relative"
                aria-label="Shopping Cart"
                title="Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0F172A] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar + Menu Toggle (Aligned with reference screenshot) */}
        <div className="md:hidden px-3.5 py-2.5 bg-[#0F172A] flex items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search"
              className="w-full h-10 pl-4 pr-10 rounded-full border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-400 text-xs focus:bg-slate-900 focus:border-slate-500"
              aria-label="Search diaries and gifts"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Menu Button Toggle: "Menu ✕" or "Menu ☰" */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wide px-2 py-1.5 hover:text-slate-200 cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            <span>Menu</span>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile search results dropdown */}
        {isSearchOpen &&
          (searchLoading || searchResults.length > 0 || searchTerm.trim().length > 0) && (
            <div
              className="md:hidden border-b border-slate-100 bg-white shadow-xl overflow-hidden px-3 py-2 z-50"
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {searchLoading && (
                  <div className="py-4 text-center text-xs text-slate-500">Searching…</div>
                )}
                {!searchLoading &&
                  searchResults.length === 0 &&
                  searchTerm.trim().length > 0 && (
                    <div className="py-4 text-center text-xs text-slate-500">
                      No products found
                    </div>
                  )}
                {!searchLoading &&
                  searchResults.map((item) => (
                    <button
                      key={`m-${item.source}-${item.id}`}
                      type="button"
                      onClick={() => handleResultSelect(item)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                        <Image
                          src={item.imageUrl || "/file.svg"}
                          alt={item.name}
                          fill
                          unoptimized={isRemoteOrDataImage(item.imageUrl || "")}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {formatPriceLabel(item)}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
      </div>

      <nav aria-label="Main navigation" className="hidden md:block border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-700">
          <Link href="/" className="py-3 hover:text-slate-950">Home</Link>
          <div className="relative group">
            <button type="button" className="flex items-center gap-1 py-3 hover:text-slate-950" aria-haspopup="true">Shop by Category <ChevronDown className="h-4 w-4" /></button>
            <div className="hidden group-hover:flex group-focus-within:flex absolute top-full left-0 w-[min(850px,80vw)] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="w-64 shrink-0 max-h-[65vh] overflow-y-auto bg-slate-50 py-2">
                {categoriesToDisplay.map((item) => (
                  <Link key={item.name} href={item.href} onMouseEnter={() => setActiveCategory(item.name)} onFocus={() => setActiveCategory(item.name)} className={`flex items-center justify-between px-4 py-2.5 text-xs ${selectedCategory?.name === item.name ? "bg-slate-200 text-slate-950" : "hover:bg-slate-100"}`}>
                    {item.name}<ChevronRight className="h-4 w-4 shrink-0" />
                  </Link>
                ))}
              </div>
              {selectedCategory && <div className="p-6 flex-1 max-h-[65vh] overflow-y-auto">
                <Link href={selectedCategory.href} className="block border-b border-slate-200 pb-3 text-sm font-bold text-slate-900">{selectedCategory.name}</Link>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4">
                  {selectedCategory.subcategories?.map((sub) => <Link key={sub.name} href={sub.href} className="text-sm text-slate-600 hover:text-slate-950 hover:underline">{sub.name}</Link>)}
                </div>
                <Link href={selectedCategory.href} className="inline-block mt-5 text-xs font-semibold underline">View all {selectedCategory.name}</Link>
              </div>}
            </div>
          </div>
          {[["Shop by Occasion", occasionLinks], ["Shop by Profession", professionLinks]].map(([title, links]) => (
            <div key={title as string} className="relative group">
              <button type="button" className="flex items-center gap-1 py-3 hover:text-slate-950" aria-haspopup="true">{title as string}<ChevronDown className="h-4 w-4" /></button>
              <div className="hidden group-hover:grid group-focus-within:grid absolute top-full left-0 w-72 gap-1 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50">
                {(links as typeof occasionLinks).map((link) => <Link key={link.label} href={link.href} className="px-3 py-2 text-sm hover:bg-slate-50 rounded">{link.label}</Link>)}
              </div>
            </div>
          ))}
          {navItems.slice(1).map((item) => <Link key={item.label} href={item.href === "#about" ? "/#footer" : item.href} className="py-3 hover:text-slate-950 whitespace-nowrap">{item.label}</Link>)}
        </div>
      </nav>

      {/* Mobile Menu Panel - Dark accordion matching reference screenshot */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] text-white divide-y divide-slate-800 shadow-2xl border-t border-slate-800">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Home</Link>
          {/* 1. SHOP BY CATEGORY */}
          <div>
            <button
              type="button"
              onClick={() => setMobileOpenSection(mobileOpenSection === "category" ? null : "category")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <span>SHOP BY CATEGORY</span>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  mobileOpenSection === "category" ? "rotate-90 text-white" : ""
                }`}
              />
            </button>
            {mobileOpenSection === "category" && (
              <div className="bg-[#0B132B] px-5 py-3 space-y-2 border-t border-slate-800/60 max-h-72 overflow-y-auto custom-scrollbar">
                {categoriesToDisplay.map((cat) => (
                  <div key={cat.name} className="py-1">
                    <div className="flex items-center justify-between">
                      <Link href={cat.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-semibold text-slate-200 py-2">{cat.name}</Link>
                      {Boolean(cat.subcategories?.length) && <button type="button" aria-label={`Show ${cat.name} subcategories`} aria-expanded={activeCategory === cat.name} onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)} className="p-2"><ChevronRight className={`h-4 w-4 ${activeCategory === cat.name ? "rotate-90" : ""}`} /></button>}
                    </div>
                    {activeCategory === cat.name && <div className="pl-3 pb-2 grid gap-2">{cat.subcategories?.map((sub) => <Link key={sub.name} href={sub.href} onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-slate-400">{sub.name}</Link>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. SHOP BY OCCASION */}
          <div>
            <button
              type="button"
              onClick={() => setMobileOpenSection(mobileOpenSection === "occasion" ? null : "occasion")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <span>SHOP BY OCCASION</span>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  mobileOpenSection === "occasion" ? "rotate-90 text-white" : ""
                }`}
              />
            </button>
            {mobileOpenSection === "occasion" && (
              <div className="bg-[#0B132B] px-5 py-3 space-y-2.5 border-t border-slate-800/60">
                {occasionLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white">{item.label}</Link>)}
              </div>
            )}
          </div>

          {/* 3. SHOP BY PROFESSION */}
          <div>
            <button
              type="button"
              onClick={() => setMobileOpenSection(mobileOpenSection === "occupation" ? null : "occupation")}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <span>SHOP BY PROFESSION</span>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  mobileOpenSection === "occupation" ? "rotate-90 text-white" : ""
                }`}
              />
            </button>
            {mobileOpenSection === "occupation" && (
              <div className="bg-[#0B132B] px-5 py-3 space-y-2.5 border-t border-slate-800/60">
                {professionLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-xs font-medium text-slate-300 hover:text-white">{item.label}</Link>)}
              </div>
            )}
          </div>

          {/* Secondary links & Contact in dark footer */}
          <div className="px-5 py-3.5 bg-[#080d1e] border-t border-slate-800/80">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-300 mb-3">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.label}
                  href={item.href === "#about" ? "/#footer" : item.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (item.href === "#about") handleContactClick(e);
                  }}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <a
                href={`tel:${telPhone}`}
                className="flex items-center gap-1.5 hover:text-white py-1"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Call Us</span>
              </a>
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center gap-1.5 hover:text-white py-1"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
