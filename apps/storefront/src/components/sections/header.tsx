"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, MessageCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { EnquiryFormContent } from "./enquiry-modal";
import { useSelectedProducts } from '@/context/ProductContext';
import { Badge } from '@/components/ui/badge';
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
  subtitle: string;
  image: string;
  href: string;
};

const FALLBACK_NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Bulk Orders", href: "#our-products" },
  { label: "Custom Print", href: "/custom-design" },
  { label: "About Us", href: "#about" },
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
  const navLinks = nav && nav.length ? nav : FALLBACK_NAV;
  const megaItems = megaMenu && megaMenu.length ? megaMenu : [];
  const rawLogo = logoUrl?.trim() || "";
  const logo = rawLogo || "/logo.png";
  const brand = brandName?.trim() || "Pyrite";
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = React.useState(false);
  const { selectedProducts, clearSelected } = useSelectedProducts();
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

  const handleResultSelect = React.useCallback((item: SearchResultItem) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(item.path);
  }, [router]);

  const formatPriceLabel = React.useCallback((item: Pick<SearchResultItem, "minPrice" | "maxPrice">) => {
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
  }, []);

  const handleSearchSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      handleResultSelect(searchResults[0]);
      return;
    }
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  }, [handleResultSelect, router, searchResults, searchTerm]);

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Notification Bar */}
      <div className="bg-[#0F172A] py-2 text-white text-xs hidden sm:block">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10">
          <p className="font-medium text-slate-200 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Direct Factory Pricing • Custom Logo Embossing • 100% Quality Guarantee
          </p>
          <div className="flex items-center gap-5 text-slate-300">
            <a href="tel:+919899223130" className="hover:text-white transition-colors">📞 +91 9899223130</a>
            <span className="opacity-30">|</span>
            <a href="mailto:info@pyrite.in" className="hover:text-white transition-colors">✉️ info@pyrite.in</a>
            <span className="opacity-30">|</span>
            <Link href="/custom-design" className="hover:underline font-semibold text-white">Bulk Orders</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src={logo}
              alt={brand}
              width={160}
              height={44}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-700">
            {megaItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors py-2 focus:outline-none">
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-6 w-[600px] rounded-2xl shadow-2xl border border-slate-100 bg-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Our Core Catalog</div>
                  <div className="grid grid-cols-3 gap-4">
                    {megaItems.map((item) => (
                      <Link
                        href={item.href}
                        key={item.name}
                        className="group p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        prefetch={false}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                            <Image
                              src={item.image || "/logo.png"}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 group-hover:text-black">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Over 500+ premium corporate styles</span>
                    <Link href="/shop" className="font-semibold text-slate-900 hover:underline">
                      View Full Catalog →
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {navLinks.map((l, i) => (
              <Link 
                key={`${l.href}-${i}`} 
                href={l.href} 
                className="hover:text-black transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-300"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Search + Enquiry CTA */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-[240px] lg:w-[280px]">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search diaries, gifts..."
                  className="w-full rounded-full pl-4 pr-10 h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-400 transition-all"
                  aria-label="Search diaries and gifts"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && (searchLoading || searchResults.length > 0 || searchTerm.trim().length > 0) && (
                <div
                  className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden z-50"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-6 text-xs text-slate-500">
                        Searching catalog…
                      </div>
                    )}

                    {!searchLoading && searchResults.length === 0 && searchTerm.trim().length > 0 && (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">No products found</div>
                    )}

                    {!searchLoading && searchResults.map((item) => (
                      <button
                        key={`${item.source}-${item.id}`}
                        type="button"
                        onClick={() => handleResultSelect(item)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
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
                          <p className="truncate text-xs font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{formatPriceLabel(item)}</p>
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

            {/* Quick Enquiry / Instant Quote Modal */}
            <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold px-4 sm:px-5 h-10 shadow-sm transition-all hover:shadow-md flex items-center gap-2 relative"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Request Quote</span>
                  <span className="sm:hidden">Quote</span>
                  {selectedProducts.length > 0 && (
                    <Badge className="bg-emerald-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center p-0 rounded-full">
                      {selectedProducts.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
                <EnquiryFormContent 
                  open={isEnquiryModalOpen} 
                  onOpenChange={setIsEnquiryModalOpen} 
                  selectedProducts={selectedProducts} 
                  onSubmitAfter={clearSelected} 
                />
              </DialogContent>
            </Dialog>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <Link 
                href="/shop" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Shop All Products
              </Link>
              <Link 
                href="/custom-design" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Custom Design Studio
              </Link>
              {navLinks.map((l, i) => (
                <Link 
                  key={`${l.href}-${i}`} 
                  href={l.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-lg pl-3 pr-9 h-10 text-xs bg-slate-50"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
