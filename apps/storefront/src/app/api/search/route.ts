import { NextRequest, NextResponse } from "next/server";
import { getLocalCatalog } from "@/lib/local-catalog";

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

const DRIVE_REGEX = /\/d\/([A-Za-z0-9_-]+)/;
const DRIVE_QUERY_REGEX = /[?&]id=([A-Za-z0-9_-]+)/;

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(DRIVE_REGEX) || url.match(DRIVE_QUERY_REGEX);
    if (match?.[1]) return `https://drive.google.com/uc?id=${match[1]}`;
  }
  return url;
}

async function searchDatabaseProducts(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const matches = await prisma.product.findMany({
      where: {
        enabled: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
    });
    return matches.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      minPrice: product.minPrice ?? null,
      maxPrice: product.maxPrice ?? null,
      imageUrl: resolveImageUrl(product.imageUrl ?? ""),
      category: product.category,
      source: "product" as const,
      path: `/shop/${product.id}`,
    }));
  } catch (e) {
    console.error("search products failed", e);
    return [];
  }
}

async function searchDatabaseDiaries(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const matches = await prisma.diary.findMany({
      where: {
        enabled: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
    });
    return matches.map((diary) => ({
      id: diary.id,
      name: diary.name,
      description: diary.description,
      minPrice: diary.minPrice ?? null,
      maxPrice: diary.maxPrice ?? null,
      imageUrl: resolveImageUrl(diary.imageUrl ?? ""),
      category: diary.category,
      source: "diary" as const,
      path: `/shop/${diary.id}`,
    }));
  } catch (e) {
    console.error("search diaries failed", e);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawQuery = url.searchParams.get("q") ?? "";
    const query = rawQuery.trim();

    if (!query) {
      return NextResponse.json({ results: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    let [diaries, products] = await Promise.all([
      searchDatabaseDiaries(query, 7),
      searchDatabaseProducts(query, 5),
    ]);

    if (!diaries.length && !products.length) {
      const q = query.toLowerCase();
      const local = getLocalCatalog();
      const match = (item: (typeof local.products)[number]) =>
        item.name.toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q);
      products = local.products.filter(match).slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        imageUrl: resolveImageUrl(item.imageUrl ?? ""),
        category: item.category,
        source: "product" as const,
        path: `/shop/${item.id}`,
      }));
      diaries = local.diaries.filter(match).slice(0, 7).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        imageUrl: resolveImageUrl(item.imageUrl ?? ""),
        category: item.category,
        source: "diary" as const,
        path: `/shop/${item.id}`,
      }));
    }

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
