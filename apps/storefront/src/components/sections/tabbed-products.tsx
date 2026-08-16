"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";
import { parseCustomTabs, resolveProductsByIds } from "@/lib/cms/mappers";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();
  const selected = isSelected(product.id);
  const hasRange =
    typeof product.minPrice === 'number' &&
    typeof product.maxPrice === 'number' &&
    product.minPrice !== product.maxPrice;
  const hasSingle = typeof product.minPrice === 'number' && product.minPrice !== null;
  const priceLabel = hasRange
    ? `₹${product.minPrice!.toLocaleString()} – ₹${product.maxPrice!.toLocaleString()}`
    : hasSingle
      ? `₹${product.minPrice!.toLocaleString()}`
      : 'On request';

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group relative", className)}>
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => {
            if (checked) {
              selectProduct({
                ...product,
                price: product.minPrice ?? 0,
              });
            } else {
              deselectProduct(product.id);
            }
          }}
          className="data-[state=checked]:bg-[#0F172A] data-[state=checked]:border-[#0F172A]"
        />
      </div>
      <Link href={`/shop/${product.id}`} className="relative bg-slate-50 rounded-xl flex items-center justify-center p-5 mb-4 h-[220px] overflow-hidden product-image-container block">
        <Image
          src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
          alt={product.name}
          fill
          unoptimized={isRemoteOrDataImage(product.image || "")}
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
        />
        <span className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-xs z-10 transition-transform group-hover:scale-110">
          <Image
            src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg"
            alt="wishlist"
            width={16}
            height={16}
            unoptimized
          />
        </span>
      </Link>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-4">
          <Link href={`/shop/${product.id}`} className="text-base font-bold text-slate-900 leading-snug hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </Link>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-[#0F172A] whitespace-nowrap">
            {priceLabel}
          </span>
        </div>
        <Button
          onClick={() => {
            selectProduct(product);
            console.log('Enquire for:', product.name);
          }}
          className="w-full mt-auto bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm rounded-xl transition-colors duration-200"
        >
          Enquire Now
        </Button>
      </div>
    </div>
  );
};

export default function TabbedProducts({
  products: dbProducts,
  content,
}: {
  products: any[];
  content?: any;
}) {
  const heading = content?.heading || "Todays Best Deals for you!";

  const customTabs = parseCustomTabs(content);

  const products: Product[] = (dbProducts || []).map((p) => {
    const minPrice = p.minPrice ?? p.min_price ?? null;
    const maxPrice = p.maxPrice ?? p.max_price ?? null;
    const id = String(p.id ?? "");

    return {
      id,
      name: p.name || "Product",
      minPrice,
      maxPrice,
      price: minPrice ?? undefined,
      description: p.description || "",
      image: resolveProductImage(p.imageUrl || p.image_url || p.image),
      rating: 5,
      reviewCount: 121,
      currency: "INR" as const,
      category: p.category,
    };
  });

  const byId = new Map<string, Product>();
  for (const p of products) {
    if (!p.id) continue;
    byId.set(p.id, p);
    byId.set(p.id.toLowerCase(), p);
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const productsByCategory = categories.reduce(
    (acc, category) => {
      if (category) {
        acc[category] = products.filter((p) => p.category === category);
      }
      return acc;
    },
    {} as { [key: string]: Product[] },
  );

  const tabKeys: string[] =
    customTabs.length > 0 ? customTabs.map((t) => t.name) : Object.keys(productsByCategory);

  const tabEntries = tabKeys.map((name, index) => ({
    name,
    value: `tab-${index}`,
  }));

  const productsForTabName = (tabName: string): Product[] => {
    if (customTabs.length > 0) {
      const t = customTabs.find((ct) => ct.name === tabName);
      if (!t) return [];
      return resolveProductsByIds(t.productIds, byId);
    }
    return productsByCategory[tabName] || [];
  };

  if (tabEntries.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h3 className="text-2xl font-semibold text-dark-gray mb-6">
          {heading}
        </h3>
        <Tabs defaultValue={tabEntries[0].value} className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-x-3 gap-y-2 mb-10 bg-transparent p-0 h-auto">
            {tabEntries.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-[#0F172A] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabEntries.map((tab) => {
            const tabProducts = productsForTabName(tab.name);
            const custom = customTabs.find((ct) => ct.name === tab.name);
            const missing =
              custom && custom.productIds.length > 0 && tabProducts.length === 0
                ? custom.productIds.length
                : 0;
            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {tabProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tabProducts.map((product) => (
                      <ProductCard key={`${tab.value}-${product.id}`} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-12 text-center text-sm text-medium-gray">
                    {missing > 0 ? (
                      <>
                        {missing} product{missing === 1 ? "" : "s"} selected in admin, but not found
                        in the live catalog (check Diaries/Products are enabled).
                      </>
                    ) : (
                      <>No products in this tab yet. Open Admin → Home → Today&apos;s Best Deals and add products.</>
                    )}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}