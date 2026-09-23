import { NextRequest, NextResponse } from "next/server";
import { cmsCatalog } from "@/lib/cms/load";

interface SearchResult {
  id: string | number;
  name: string;
  description?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  category?: string | null;
  source: "diary" | "product";
  path: string;
}

import { resolveProductImage } from "@/lib/product-image";

function resolveImageUrl(url: string | null | undefined): string {
  return resolveProductImage(url);
}

function searchCms(query: string, source: "product" | "diary", limit: number): SearchResult[] {
  const q = query.toLowerCase();
  return cmsCatalog()
    .filter((item) => item.source === source)
    .filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q),
    )
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice,
      imageUrl: resolveImageUrl(item.imageUrl ?? ""),
      category: item.category,
      source,
      path: `/shop/${item.id}`,
    }));
}

async function searchDatabaseProducts(query: string, limit: number): Promise<SearchResult[]> {
  return searchCms(query, "product", limit);
}

async function searchDatabaseDiaries(query: string, limit: number): Promise<SearchResult[]> {
  return searchCms(query, "diary", limit);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim();
    if (!query) {
      return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    const [diaries, products] = await Promise.all([
      searchDatabaseDiaries(query, 7),
      searchDatabaseProducts(query, 5),
    ]);
    const combined: SearchResult[] = [];
    for (const item of [...diaries, ...products]) {
      if (combined.length >= 10) break;
      combined.push(item);
    }
    return NextResponse.json(
      { results: combined },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Search API error", error);
    return NextResponse.json({ results: [], error: "SEARCH_FAILED" }, { status: 500 });
  }
}
