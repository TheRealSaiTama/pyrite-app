import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readCms, mutateCms } from "./local-store";

describe("Catalog End-to-End Persistence & Renaming Workflow", () => {
  const testProductId = "test-prod-e2e-" + Date.now();
  const testDiaryId = "test-diary-e2e-" + Date.now();
  const testCatOriginal = "E2E SPECIAL GIFTS";
  const testCatRenamed = "E2E LUXURY GIFTS";

  it("1. Creates a new product with image, decimal price, and category", () => {
    mutateCms((db) => {
      db.products.push({
        id: testProductId,
        slug: "test-leather-gift-set",
        name: "Test Leather Gift Set",
        description: "A premium gift set for testing",
        min_price: 349.99,
        max_price: 499.5,
        category: testCatOriginal,
        tags: ["Giftsets"],
        image_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        featured: true,
        enabled: true,
        gallery: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        ],
        features: {
          moq: { show: true, value: "25" },
        },
        seo_title: "Test Leather Gift Set | Pyrite",
        seo_description: "Best gift set description",
        moq: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    const db = readCms();
    const created = db.products.find((p) => p.id === testProductId);
    assert.ok(created, "Product should be persisted in CMS");
    assert.equal(created?.name, "Test Leather Gift Set");
    assert.equal(created?.min_price, 349.99);
    assert.equal(created?.max_price, 499.5);
    assert.equal(created?.category, testCatOriginal);
    assert.equal(created?.moq, 25);
  });

  it("2. Creates a new diary with safe defaults", () => {
    mutateCms((db) => {
      db.diaries.push({
        id: testDiaryId,
        slug: "test-executive-diary",
        name: "Test Executive Diary",
        description: "Hardbound diary for 2026",
        min_price: 275.0,
        max_price: 275.0,
        category: testCatOriginal,
        tags: ["Hard Bound Diaries"],
        color: "Navy Blue",
        size: "A5",
        pages: 320,
        cover_type: "PU Leather",
        image_url: "https://example.com/diary.jpg",
        featured: false,
        enabled: true,
        gallery: [],
        features: { moq: { show: true, value: "50" } },
        seo_title: null,
        seo_description: null,
        moq: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    const db = readCms();
    const created = db.diaries.find((d) => d.id === testDiaryId);
    assert.ok(created, "Diary should be persisted in CMS");
    assert.equal(created?.name, "Test Executive Diary");
    assert.equal(created?.category, testCatOriginal);
    assert.equal(created?.pages, 320);
  });

  it("3. Persists custom categories and SEO in page_sections", () => {
    const customMetadata = {
      customCategories: [
        { name: testCatOriginal, seoTitle: "E2E Category Title", seoDescription: "E2E Category Desc" }
      ],
      customSubcategories: {
        [testCatOriginal]: ["Subcat Alpha", "Subcat Beta"]
      },
      categorySeo: {
        [testCatOriginal]: {
          seoTitle: "E2E Category Title",
          seoDescription: "E2E Category Desc",
          ogImageUrl: "/og-test.png"
        }
      }
    };

    mutateCms((db) => {
      const idx = db.page_sections.findIndex(
        (s) => s.page_key === "catalog" && s.section_key === "categories"
      );
      if (idx >= 0) {
        db.page_sections[idx].content = customMetadata;
      } else {
        db.page_sections.push({
          id: "cat-meta-e2e",
          page_key: "catalog",
          section_key: "categories",
          title: "Catalog Categories Metadata",
          content: customMetadata,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });

    const db = readCms();
    const section = db.page_sections.find(
      (s) => s.page_key === "catalog" && s.section_key === "categories"
    );
    assert.ok(section, "Catalog categories section must exist");
    assert.equal(section?.content?.customCategories?.[0]?.name, testCatOriginal);
    assert.deepEqual(section?.content?.customSubcategories?.[testCatOriginal], ["Subcat Alpha", "Subcat Beta"]);
  });

  it("4. Renames category and cascades update to both products and diaries", () => {
    // Simulate saveCategoryForm renaming
    mutateCms((db) => {
      // 1. Update metadata in page_sections
      const section = db.page_sections.find(
        (s) => s.page_key === "catalog" && s.section_key === "categories"
      );
      if (section && section.content) {
        section.content.customCategories = (section.content.customCategories || []).map((c: any) =>
          c.name === testCatOriginal ? { ...c, name: testCatRenamed } : c
        );
        if (section.content.customSubcategories?.[testCatOriginal]) {
          section.content.customSubcategories[testCatRenamed] = section.content.customSubcategories[testCatOriginal];
          delete section.content.customSubcategories[testCatOriginal];
        }
        if (section.content.categorySeo?.[testCatOriginal]) {
          section.content.categorySeo[testCatRenamed] = section.content.categorySeo[testCatOriginal];
          delete section.content.categorySeo[testCatOriginal];
        }
      }

      // 2. Cascade rename to all products
      for (const prod of db.products) {
        if (!prod.category) continue;
        const cats = prod.category.split(",").map((c: string) => c.trim());
        if (cats.includes(testCatOriginal)) {
          prod.category = cats.map((c: string) => (c === testCatOriginal ? testCatRenamed : c)).join(", ");
        }
      }

      // 3. Cascade rename to all diaries
      for (const diary of db.diaries) {
        if (!diary.category) continue;
        const cats = diary.category.split(",").map((c: string) => c.trim());
        if (cats.includes(testCatOriginal)) {
          diary.category = cats.map((c: string) => (c === testCatOriginal ? testCatRenamed : c)).join(", ");
        }
      }
    });

    const db = readCms();
    const updatedProd = db.products.find((p) => p.id === testProductId);
    const updatedDiary = db.diaries.find((d) => d.id === testDiaryId);

    assert.equal(updatedProd?.category, testCatRenamed, "Product category should be updated to renamed category");
    assert.equal(updatedDiary?.category, testCatRenamed, "Diary category should be updated to renamed category");
  });

  it("5. Updates product details while preserving existing slug", () => {
    mutateCms((db) => {
      const prod = db.products.find((p) => p.id === testProductId);
      if (prod) {
        // Name changed, but slug was preserved because slugTouched is true for existing products
        prod.name = "Test Leather Gift Set (Updated)";
        prod.min_price = 399.0;
        prod.max_price = 499.0;
      }
    });

    const db = readCms();
    const prod = db.products.find((p) => p.id === testProductId);
    assert.equal(prod?.name, "Test Leather Gift Set (Updated)");
    assert.equal(prod?.slug, "test-leather-gift-set", "Slug should NOT be auto-overwritten when product is updated");
    assert.equal(prod?.min_price, 399.0);
  });

  it("6. Deletes custom category and strips tag from products and diaries", () => {
    mutateCms((db) => {
      // 1. Remove from page_sections
      const section = db.page_sections.find(
        (s) => s.page_key === "catalog" && s.section_key === "categories"
      );
      if (section && section.content) {
        section.content.customCategories = (section.content.customCategories || []).filter(
          (c: any) => c.name !== testCatRenamed
        );
        delete section.content.customSubcategories?.[testCatRenamed];
        delete section.content.categorySeo?.[testCatRenamed];
      }

      // 2. Strip from products
      for (const prod of db.products) {
        if (!prod.category) continue;
        const cats = prod.category.split(",").map((c: string) => c.trim()).filter(Boolean);
        const remaining = cats.filter((c: string) => c !== testCatRenamed);
        prod.category = remaining.length > 0 ? remaining.join(", ") : null as any;
      }

      // 3. Strip from diaries
      for (const diary of db.diaries) {
        if (!diary.category) continue;
        const cats = diary.category.split(",").map((c: string) => c.trim()).filter(Boolean);
        const remaining = cats.filter((c: string) => c !== testCatRenamed);
        diary.category = remaining.length > 0 ? remaining.join(", ") : null as any;
      }
    });

    const db = readCms();
    const prod = db.products.find((p) => p.id === testProductId);
    const diary = db.diaries.find((d) => d.id === testDiaryId);
    assert.equal(prod?.category, null, "Product category should be stripped to null");
    assert.equal(diary?.category, null, "Diary category should be stripped to null");

    const section = db.page_sections.find(
      (s) => s.page_key === "catalog" && s.section_key === "categories"
    );
    assert.ok(
      !section?.content?.customCategories?.some((c: any) => c.name === testCatRenamed),
      "Custom category should be removed from catalog metadata"
    );
  });

  it("7. Cleans up test fixtures cleanly", () => {
    mutateCms((db) => {
      db.products = db.products.filter((p) => p.id !== testProductId);
      db.diaries = db.diaries.filter((d) => d.id !== testDiaryId);
      const section = db.page_sections.find(
        (s) => s.page_key === "catalog" && s.section_key === "categories"
      );
      if (section && section.content) {
        section.content.customCategories = (section.content.customCategories || []).filter(
          (c: any) => c.name !== testCatRenamed && c.name !== testCatOriginal
        );
        delete section.content.customSubcategories?.[testCatRenamed];
        delete section.content.customSubcategories?.[testCatOriginal];
        delete section.content.categorySeo?.[testCatRenamed];
        delete section.content.categorySeo?.[testCatOriginal];
      }
    });

    const db = readCms();
    assert.ok(!db.products.some((p) => p.id === testProductId), "Test product cleaned up");
    assert.ok(!db.diaries.some((d) => d.id === testDiaryId), "Test diary cleaned up");
  });
});
