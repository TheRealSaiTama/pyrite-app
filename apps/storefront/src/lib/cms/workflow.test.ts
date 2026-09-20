import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { isRemoteOrDataImage, resolveProductImage, PRODUCT_IMAGE_PLACEHOLDER } from "../product-image";

// Replicate zod schemas used in admin.functions.ts to unit test them
const diaryShape = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  min_price: z.number().nullable().optional(),
  max_price: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  pages: z.number().int().nullable().optional(),
  cover_type: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  enabled: z.boolean().default(true),
  gallery: z.array(z.string()).default([]),
  features: z.record(z.string(), z.any()).default({}),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  moq: z.number().int().default(50),
});

const productShape = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  min_price: z.number().nullable().optional(),
  max_price: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  image_url: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  enabled: z.boolean().default(true),
  gallery: z.array(z.string()).default([]),
  features: z.record(z.string(), z.any()).default({}),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  moq: z.number().int().default(50),
});

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
  const parts = productCategory.split(",").map((p) => p.toLowerCase().trim()).filter(Boolean);
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

function ensureUniqueSlug(desiredSlug: string, existingItems: Array<{ id: string; slug: string }>, currentId?: string): string {
  const base = desiredSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
  const conflicting = new Set(
    existingItems
      .filter((item) => !currentId || item.id !== currentId)
      .map((item) => item.slug.toLowerCase().trim())
  );
  if (!conflicting.has(base)) return base;
  let counter = 2;
  while (conflicting.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

describe("Product & Diary Zod Validation Resilience", () => {
  it("parses diary with decimal prices without crashing", () => {
    const parsed = diaryShape.parse({
      slug: "executive-leather-diary",
      name: "Executive Leather Diary",
      min_price: 299.5,
      max_price: 499.75,
    });
    assert.equal(parsed.min_price, 299.5);
    assert.equal(parsed.max_price, 499.75);
    assert.equal(parsed.moq, 50);
  });

  it("parses diary when seo_title and seo_description are undefined or omitted", () => {
    const parsed = diaryShape.parse({
      slug: "minimal-diary",
      name: "Minimal Diary",
      // seo_title and seo_description omitted
    });
    assert.equal(parsed.seo_title, undefined);
    assert.equal(parsed.seo_description, undefined);
    assert.deepEqual(parsed.gallery, []);
    assert.deepEqual(parsed.features, {});
  });

  it("parses product with decimal price and nullable fields", () => {
    const parsed = productShape.parse({
      slug: "pen-stand-wooden",
      name: "Pen Stand Wooden",
      min_price: 150.25,
      max_price: 150.25,
      description: null,
      seo_title: null,
      seo_description: null,
      gallery: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    });
    assert.equal(parsed.min_price, 150.25);
    assert.equal(parsed.gallery.length, 2);
  });

  it("validates id with z.string().min(1) allowing non-uuid and custom IDs", () => {
    const idSchema = z.string().min(1);
    assert.equal(idSchema.parse("custom-id-123"), "custom-id-123");
    assert.equal(idSchema.parse("11db244a-cf4e-498c-a050-42bd897b5a20"), "11db244a-cf4e-498c-a050-42bd897b5a20");
    assert.throws(() => idSchema.parse(""));
  });
});

describe("Slug uniqueness and sanitation", () => {
  it("returns base slug when no collisions exist", () => {
    const existing: Array<{ id: string; slug: string }> = [
      { id: "1", slug: "gift-set" },
      { id: "2", slug: "classic-diary" },
    ];
    const slug = ensureUniqueSlug("New Leather Diary", existing);
    assert.equal(slug, "new-leather-diary");
  });

  it("increments slug suffix when collision occurs", () => {
    const existing: Array<{ id: string; slug: string }> = [
      { id: "1", slug: "gift-set" },
      { id: "2", slug: "gift-set-2" },
    ];
    const slug = ensureUniqueSlug("gift-set", existing);
    assert.equal(slug, "gift-set-3");
  });

  it("allows same item to keep its slug when editing", () => {
    const existing: Array<{ id: string; slug: string }> = [
      { id: "item-42", slug: "gift-set" },
    ];
    const slug = ensureUniqueSlug("gift-set", existing, "item-42");
    assert.equal(slug, "gift-set");
  });

  it("handles leading, trailing, and duplicate dashes cleanly", () => {
    const slug = ensureUniqueSlug("---Special & Rare Item---", []);
    assert.equal(slug, "special-rare-item");
  });
});

describe("Category matching & comma splitting", () => {
  it("matches single category", () => {
    assert.ok(categoryMatches("WOODEN GIFTS", "Wooden Gifts"));
    assert.ok(categoryMatches("Wooden Gifts", "wooden-gifts"));
  });

  it("matches individual categories within comma-separated string", () => {
    const productCategory = "WOODEN GIFTS, CORPORATE GIFT SETS, LUXURY PENS";
    assert.ok(categoryMatches(productCategory, "Wooden Gifts"));
    assert.ok(categoryMatches(productCategory, "Corporate Gift Sets"));
    assert.ok(categoryMatches(productCategory, "LUXURY PENS"));
    assert.ok(!categoryMatches(productCategory, "DIARY BOOKS"));
  });

  it("handles plural differences in categories", () => {
    assert.ok(categoryMatches("CORPORATE GIFT SETS", "Corporate Gift Set"));
    assert.ok(categoryMatches("CORPORATE GIFT SET", "Corporate Gift Sets"));
    assert.ok(categoryMatches("NEW YEAR DIARIES", "New Year Diary"));
  });

  it("splits comma-separated categories into unique list", () => {
    const products = [
      { category: "WOODEN GIFTS, CORPORATE GIFT SETS" },
      { category: "WOODEN GIFTS, PROMOTIONAL" },
      { category: "DIARIES" },
    ];
    const set = new Set<string>();
    for (const p of products) {
      for (const part of p.category.split(",").map((c) => c.trim()).filter(Boolean)) {
        set.add(part);
      }
    }
    const categories = Array.from(set).sort();
    assert.deepEqual(categories, ["CORPORATE GIFT SETS", "DIARIES", "PROMOTIONAL", "WOODEN GIFTS"]);
  });
});

describe("Image resolution & unoptimized predicate", () => {
  it("detects data URLs as remote/unoptimized", () => {
    assert.ok(isRemoteOrDataImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="));
  });

  it("detects Google Drive and external URLs as unoptimized", () => {
    assert.ok(isRemoteOrDataImage("https://drive.google.com/uc?export=view&id=12345"));
    assert.ok(isRemoteOrDataImage("https://images.unsplash.com/photo-123"));
    assert.ok(isRemoteOrDataImage("/api/cms/media/asset-123.jpg"));
  });

  it("detects local public static images as optimized-eligible", () => {
    assert.ok(!isRemoteOrDataImage("/logo.png"));
    assert.ok(!isRemoteOrDataImage("/hero.webp"));
  });

  it("resolves Google Drive URLs to direct preview links", () => {
    const resolved = resolveProductImage("https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view");
    assert.ok(resolved.includes("1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"));
    assert.ok(resolved.includes("lh3.googleusercontent.com") || resolved.includes("drive.google.com"));
  });

  it("falls back to placeholder when url is empty or null", () => {
    assert.equal(resolveProductImage(null), PRODUCT_IMAGE_PLACEHOLDER);
    assert.equal(resolveProductImage(""), PRODUCT_IMAGE_PLACEHOLDER);
  });
});

describe("Cross-table slug uniqueness & collision prevention", () => {
  function ensureCatalogUniqueSlug(
    candidate: string,
    products: Array<{ id: string; slug: string }>,
    diaries: Array<{ id: string; slug: string }>,
    targetTable: "products" | "diaries",
    targetId?: string
  ): string {
    const base = candidate.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
    const set = new Set<string>();
    for (const p of products) {
      if (targetTable === "products" && targetId && p.id === targetId) continue;
      set.add(p.slug.toLowerCase().trim());
    }
    for (const d of diaries) {
      if (targetTable === "diaries" && targetId && d.id === targetId) continue;
      set.add(d.slug.toLowerCase().trim());
    }

    if (!set.has(base)) return base;
    let counter = 2;
    while (set.has(`${base}-${counter}`)) {
      counter++;
    }
    return `${base}-${counter}`;
  }

  it("detects collisions between product and diary tables", () => {
    const products = [{ id: "prod-1", slug: "classic-leather-notebook" }];
    const diaries = [{ id: "diary-1", slug: "executive-planner" }];

    // Creating diary with same slug as product generates suffix
    const diarySlug = ensureCatalogUniqueSlug("classic-leather-notebook", products, diaries, "diaries");
    assert.equal(diarySlug, "classic-leather-notebook-2");

    // Creating product with same slug as diary generates suffix
    const prodSlug = ensureCatalogUniqueSlug("executive-planner", products, diaries, "products");
    assert.equal(prodSlug, "executive-planner-2");
  });

  it("allows existing item to retain its own slug on update across tables", () => {
    const products = [{ id: "prod-1", slug: "classic-leather-notebook" }];
    const diaries = [{ id: "diary-1", slug: "executive-planner" }];

    const slug = ensureCatalogUniqueSlug("classic-leather-notebook", products, diaries, "products", "prod-1");
    assert.equal(slug, "classic-leather-notebook");
  });
});

describe("Category deletion and stripping logic", () => {
  function stripCategory(itemCategory: string | null | undefined, catToDelete: string): string | null {
    if (!itemCategory) return null;
    const cats = itemCategory.split(",").map((c) => c.trim()).filter(Boolean);
    const remaining = cats.filter((c) => !categoryMatches(c, catToDelete));
    return remaining.length > 0 ? remaining.join(", ") : null;
  }

  it("strips solitary category to null", () => {
    assert.equal(stripCategory("WOODEN GIFTS", "Wooden Gifts"), null);
    assert.equal(stripCategory("CUSTOM DIARIES", "custom-diaries"), null);
  });

  it("strips matching category from comma-separated list while preserving others", () => {
    const initial = "WOODEN GIFTS, CORPORATE GIFT SETS, LUXURY PENS";
    const stripped = stripCategory(initial, "Corporate Gift Sets");
    assert.equal(stripped, "WOODEN GIFTS, LUXURY PENS");
  });

  it("leaves category unchanged if target does not match", () => {
    const initial = "WOODEN GIFTS, LUXURY PENS";
    const stripped = stripCategory(initial, "DIARIES");
    assert.equal(stripped, "WOODEN GIFTS, LUXURY PENS");
  });
});
