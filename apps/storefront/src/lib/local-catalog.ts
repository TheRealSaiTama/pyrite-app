import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getDiaryRows } from "@/lib/diary-data";

export type LocalCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  tags: string[];
  gallery: string[];
  features: Record<string, unknown>;
  enabled: boolean;
  featured: boolean;
  source: "product" | "diary";
};

const PRODUCT_CSVS = [
  "RE Products Page - Corporate Gift Sets.csv",
  "RE Products Page - SBI Gift Items.csv",
];

const DIARY_CSVS = [
  "RE Products Page - Hardbound Diaries.csv",
  "RE Products Page - Premium PU Leather Diaries.csv",
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function parsePrice(range: string | undefined): { min: number | null; max: number | null } {
  const nums = (range || "").match(/\d+/g)?.map(Number) || [];
  if (!nums.length) return { min: null, max: null };
  return { min: nums[0], max: nums.length > 1 ? nums[1] : nums[0] };
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

function csvDir(): string {
  const candidates = [
    path.join(process.cwd(), "csv"),
    path.join(process.cwd(), "apps", "storefront", "csv"),
  ];
  return candidates.find((d) => fs.existsSync(d)) || candidates[0];
}

function loadCsv(file: string): Record<string, string>[] {
  const full = path.join(csvDir(), file);
  if (!fs.existsSync(full)) return [];
  return parse(fs.readFileSync(full, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];
}

function rowToItem(
  row: Record<string, string>,
  source: "product" | "diary",
  prefix: string,
): LocalCatalogItem | null {
  const name = (row["Product Name"] || "").trim();
  if (!name) return null;
  const slug = slugify(name);
  const { min, max } = parsePrice(row["Price Range"]);
  return {
    id: `${prefix}-${slug}`,
    slug,
    name,
    description: row["Short Description"]?.trim() || null,
    minPrice: min,
    maxPrice: max,
    imageUrl: row["Product image"]?.trim() || null,
    category: row["Categories"]?.trim() || null,
    tags: parseTags(row["Tags"]),
    gallery: [],
    features: {},
    enabled: true,
    featured: false,
    source,
  };
}

let cache: { products: LocalCatalogItem[]; diaries: LocalCatalogItem[] } | null = null;

export function getLocalCatalog(): { products: LocalCatalogItem[]; diaries: LocalCatalogItem[] } {
  if (cache) return cache;
  const products: LocalCatalogItem[] = [];
  const diaries: LocalCatalogItem[] = [];
  const seenP = new Set<string>();
  const seenD = new Set<string>();

  for (const file of PRODUCT_CSVS) {
    for (const row of loadCsv(file)) {
      const item = rowToItem(row, "product", "p");
      if (!item || seenP.has(item.id)) continue;
      seenP.add(item.id);
      products.push(item);
    }
  }
  for (const file of DIARY_CSVS) {
    for (const row of loadCsv(file)) {
      const item = rowToItem(row, "diary", "d");
      if (!item || seenD.has(item.id)) continue;
      seenD.add(item.id);
      diaries.push(item);
    }
  }
  for (const row of getDiaryRows()) {
    const item = rowToItem(row as Record<string, string>, "diary", "d");
    if (!item || seenD.has(item.id)) continue;
    seenD.add(item.id);
    diaries.push(item);
  }

  cache = { products, diaries };
  return cache;
}

export function findLocalItem(id: string): LocalCatalogItem | null {
  const { products, diaries } = getLocalCatalog();
  const all = [...products, ...diaries];
  return all.find((p) => p.id === id || p.slug === id) || null;
}

export function localRelated(category: string, currentId: string, take = 8): LocalCatalogItem[] {
  const cat = (category || "").split(",")[0]?.trim().toLowerCase();
  if (!cat) return [];
  const { products, diaries } = getLocalCatalog();
  return [...products, ...diaries]
    .filter((p) => p.id !== currentId && (p.category || "").toLowerCase().includes(cat))
    .slice(0, take);
}
