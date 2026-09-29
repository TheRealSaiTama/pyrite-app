import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  STOREFRONT_CATEGORIES,
  STOREFRONT_SUBCATEGORIES,
  matchCategory,
  getSubcategory,
  getSubcategoriesForCategory,
  extractProductMaterials,
  getDefaultCategoryNav,
} from "./catalog-categories";

describe("catalog-categories and subcategories mapping", () => {
  test("contains all 12 canonical categories", () => {
    assert.equal(STOREFRONT_CATEGORIES.length, 12);
    assert.ok(STOREFRONT_CATEGORIES.includes("CORPORATE GIFT SETS"));
    assert.ok(STOREFRONT_CATEGORIES.includes("NEW YEAR DIARY"));
    assert.ok(STOREFRONT_CATEGORIES.includes("LEATHER GIFT ITEMS"));
    assert.ok(STOREFRONT_CATEGORIES.includes("CUSTOMISED DIARY & NOTE BOOKS"));
  });

  test("contains subcategory mappings for categories", () => {
    const corpSubs = STOREFRONT_SUBCATEGORIES["CORPORATE GIFT SETS"];
    assert.ok(Array.isArray(corpSubs) && corpSubs.length > 0);
    assert.ok(corpSubs.includes("Diary & Pen Sets"));
    assert.ok(corpSubs.includes("Calendar Sets"));
    assert.ok(corpSubs.includes("Giftsets"));

    const diarySubs = STOREFRONT_SUBCATEGORIES["NEW YEAR DIARY"];
    assert.ok(diarySubs.includes("Eco-Friendly & Green"));
    assert.ok(diarySubs.includes("Leather Diaries"));
    assert.ok(diarySubs.includes("Hard Bound Diaries"));
  });

  test("getSubcategoriesForCategory handles category variations and aliases", () => {
    const subs1 = getSubcategoriesForCategory("NEW YEAR DIARY");
    assert.ok(subs1.includes("Eco-Friendly & Green"));

    const subs2 = getSubcategoriesForCategory("NEW YEAR DIARY BOOKS");
    assert.ok(subs2.includes("Eco-Friendly & Green"));

    const subs3 = getSubcategoriesForCategory("CORPORATE GIFT SET");
    assert.ok(subs3.includes("Diary & Pen Sets"));
  });

  test("matchCategory matches exact, plurals, and case variations", () => {
    assert.ok(matchCategory("Corporate Gift Sets", "CORPORATE GIFT SETS"));
    assert.ok(matchCategory("CORPORATE GIFT SET", "CORPORATE GIFT SETS"));
    assert.ok(matchCategory("NEW YEAR DIARY BOOKS", "NEW YEAR DIARY"));
    assert.ok(matchCategory("Customised Diary & Note Books", "CUSTOMISED DIARY & NOTE BOOKS"));
    assert.ok(matchCategory("Leather Bags", "LEATHER BAGS"));
    assert.ok(!matchCategory("Jute Bags", "LEATHER BAGS"));
  });

  test("getSubcategory assigns subcategories by tags and heuristics", () => {
    const penSet = {
      name: "Primo A5 Corporate Diary and Pen Set",
      tags: ["diary and pen set", "best corporate gift"],
    };
    assert.equal(getSubcategory(penSet, "CORPORATE GIFT SETS"), "Diary & Pen Sets");

    const combo = {
      name: "50-50 B5 Diary Calendar with Pen Combo Set",
      tags: ["combo", "gift set"],
    };
    assert.equal(getSubcategory(combo, "CORPORATE GIFT SETS"), "Calendar Sets");

    const ecoDiary = {
      name: "Executive 2 Date ECO HB Diary 2026",
      tags: ["eco diary"],
    };
    assert.equal(getSubcategory(ecoDiary, "NEW YEAR DIARY"), "Eco-Friendly & Green");

    const hbDiary = {
      name: "COM Economy 1 Date Hard Bound diary",
      tags: ["hard bound diary"],
    };
    assert.equal(getSubcategory(hbDiary, "NEW YEAR DIARY"), "Hard Bound Diaries");
  });

  test("getDefaultCategoryNav builds complete nav tree with subcategories and URLs", () => {
    const nav = getDefaultCategoryNav();
    assert.equal(nav.length, 12);
    const corp = nav.find((c) => c.name === "CORPORATE GIFT SETS");
    assert.ok(corp);
    assert.equal(corp.href, "/shop?category=CORPORATE%20GIFT%20SETS");
    assert.ok(corp.subcategories.length >= 4);
    assert.ok(
      corp.subcategories.some(
        (s) =>
          s.name === "Diary & Pen Sets" &&
          s.href === "/shop?category=CORPORATE%20GIFT%20SETS&subcategory=Diary%20%26%20Pen%20Sets"
      )
    );
  });

  test("extractProductMaterials extracts materials accurately from features and tags", () => {
    const p1 = {
      name: "Executive Leather Diary",
      tags: ["leather", "corporate"],
      features: { cover_type: "PU Leather" },
    };
    const mats1 = extractProductMaterials(p1);
    assert.ok(mats1.includes("PU Leather"));

    const p2 = {
      name: "Hard Bound Note Book",
      tags: ["hard cover", "wooden"],
      features: {},
    };
    const mats2 = extractProductMaterials(p2);
    assert.ok(mats2.includes("Hard Bound"));
    assert.ok(mats2.includes("Wooden"));

    const p3 = {
      name: "Eco Jute Bag",
      tags: ["eco-friendly jute"],
      features: { material: "Jute" },
    };
    const mats3 = extractProductMaterials(p3);
    assert.ok(mats3.includes("Jute"));
  });
});
