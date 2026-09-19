"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Search,
  Heart,
  ShoppingCart,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/ProductContext";

type SearchResultItem = {
  id: string | number;
  name: string;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  path: string;
  source: "diary" | "product";
};

type MegaItem = {
  name: string;
  subtitle?: string;
  image?: string;
  href: string;
  subcategories?: { name: string; href: string }[];
};

const FALLBACK_CATEGORIES: MegaItem[] = [
  { name: "CORPORATE GIFT SETS", href: "/shop?category=CORPORATE+GIFT+SETS", subtitle: "120+ Packages" },
  { name: "NEW YEAR DIARY", href: "/shop?category=NEW+YEAR+DIARY", subtitle: "80+ Styles" },
  { name: "LEATHER GIFT ITEMS", href: "/shop?category=LEATHER+GIFT+ITEMS", subtitle: "Premium Collection" },
  { name: "LEATHER BAGS", href: "/shop?category=LEATHER+BAGS", subtitle: "Executive Collection" },
  { name: "JUTE BAGS", href: "/shop?category=JUTE+BAGS", subtitle: "Eco-Friendly" },
  { name: "BOTTLES GIFT SET", href: "/shop?category=BOTTLES+GIFT+SET", subtitle: "Custom Flasks" },
  { name: "CALENDARS", href: "/shop?category=CALENDARS", subtitle: "Yearly Planners" },
  { name: "EXHIBITION GIFTS", href: "/shop?category=EXHIBITION+VISITOR%27S+GIFT+IDEAS", subtitle: "Event Specials" },
  { name: "CUSTOM PRINT DIARIES", href: "/custom-design", subtitle: "Personalized Branding" },
];

const Header = ({
  nav,
  megaMenu,
  logoUrl,
  brandName,
}: {
  nav?: { label: string; href: string }[];
  megaMenu?: MegaItem[];
  logoUrl?: string | null;
  brandName?: string | null;
}) => {
  const categoriesToDisplay = megaMenu && megaMenu.length > 0 ? megaMenu : FALLBACK_CATEGORIES;

  const rawLogo = logoUrl?.trim() || "";
  const logo = rawLogo || "/logo.png";
  const brand = brandName?.trim() || "Pyrite";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
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
    { label: "Shop", href: "/shop" },
    { label: "Bulk Orders", href: "/custom-design" },
    { label: "Custom Print", href: "/custom-design" },
    { label: "Contact Us", href: "#about" },
  ];

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
            <a href="tel:+919899223130" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 9899223130</span>
            </a>
            <span className="opacity-30">|</span>
            <a href="mailto:info@pyrite.in" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>info@pyrite.in</span>
            </a>
            <span className="opacity-30">|</span>
            <Link href="/custom-design" className="hover:underline font-semibold text-white transition-colors">
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
          <div className="flex items-center gap-4 sm:gap-7 shrink-0">
            {/* Favourites Button */}
            <Link
              href="/shop?filter=featured"
              className="flex flex-col items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors group relative px-1 py-0.5 cursor-pointer"
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
              <span className="text-xs font-medium text-slate-600 group-hover:text-[#0F172A] mt-1 hidden sm:inline">
                Favourites
              </span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="flex flex-col items-center justify-center text-slate-700 hover:text-[#0F172A] transition-colors group relative px-1 py-0.5 cursor-pointer"
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
              <span className="text-xs font-medium text-slate-600 group-hover:text-[#0F172A] mt-1 whitespace-nowrap hidden sm:inline">
                Cart
              </span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under logo on small screens) */}
        <div className="md:hidden px-4 pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search diaries, gifts..."
              className="w-full h-10 pl-3 pr-10 rounded-lg border-slate-200 bg-slate-50 text-xs"
              aria-label="Search diaries and gifts"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white p-1.5 rounded-md"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile search results dropdown */}
          {isSearchOpen &&
            (searchLoading || searchResults.length > 0 || searchTerm.trim().length > 0) && (
              <div
                className="mt-2 rounded-lg border border-slate-100 bg-white shadow-lg overflow-hidden"
                onMouseDown={(event) => event.preventDefault()}
              >
                <div className="max-h-60 overflow-y-auto">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                          <Image
                            src={item.imageUrl || "/file.svg"}
                            alt={item.name}
                            fill
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
      </div>

      {/* Row 2: Categories Button + Secondary Navigation Links */}
      <div className="border-t border-slate-100 hidden md:block">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-6 lg:gap-8">
          {/* All Categories Button Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="p-6 w-[min(92vw,700px)] max-h-[70vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-100 z-50 bg-white"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Our Product Categories</span>
                <span className="font-normal normal-case text-slate-500">Factory direct catalogue</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                {categoriesToDisplay.map((item) => (
                  <div key={item.name} className="min-w-0">
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="text-xs font-semibold text-slate-900 hover:text-[#0F172A] uppercase tracking-wide block transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.subcategories && item.subcategories.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {item.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              prefetch={false}
                              className="text-[11px] text-slate-500 hover:text-[#0F172A] transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Over 500+ premium corporate styles</span>
                <Link
                  href="/shop"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  View Full Catalog →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Secondary Nav Links in plain text */}
          <nav className="flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.href === "#about" ? handleContactClick : undefined}
                className="text-sm font-medium text-slate-700 hover:text-[#0F172A] transition-colors py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-3 shadow-lg">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2">
              Navigation
            </p>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (item.href === "#about") handleContactClick(e);
                }}
                className="block px-2 py-2 text-sm font-medium text-slate-800 hover:text-[#0F172A] hover:bg-slate-50 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto px-1">
              {categoriesToDisplay.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-slate-700 hover:text-[#0F172A] py-1 truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
            <a
              href="tel:+919899223130"
              className="flex items-center gap-1.5 hover:text-[#0F172A] py-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Us</span>
            </a>
            <a
              href="mailto:info@pyrite.in"
              className="flex items-center gap-1.5 hover:text-[#0F172A] py-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
