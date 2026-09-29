export const STOREFRONT_CATEGORIES = [
  "CORPORATE GIFT SETS",
  "NEW YEAR DIARY",
  "LEATHER GIFT ITEMS",
  "LEATHER BAGS",
  "JUTE BAGS",
  "BOTTLES GIFT SET",
  "POWER BANK DIARIES",
  "PEN STANDS",
  "PROMOTIONAL UMBRELLAS",
  "CUSTOMISED DIARY & NOTE BOOKS",
  "CALENDARS",
  "EXHIBITION VISITOR'S GIFT IDEAS",
];

export const STOREFRONT_SUBCATEGORIES: Record<string, string[]> = {
  "CORPORATE GIFT SETS": [
    "Diary & Pen Sets",
    "Calendar Sets",
    "Giftsets",
    "General / Others",
  ],
  "NEW YEAR DIARY": [
    "Eco-Friendly & Green",
    "Leather Diaries",
    "Hard Bound Diaries",
    "Planners & Themes",
    "Economy & Regular",
    "General / Others",
  ],
  "LEATHER GIFT ITEMS": ["Bags & Portfolios", "Leather Accessories"],
  "LEATHER BAGS": ["Executive Bags"],
  "JUTE BAGS": ["Eco Jute Bags"],
  "BOTTLES GIFT SET": ["Bottle & Flask Sets"],
  "POWER BANK DIARIES": ["Tech Power Bank Diaries"],
  "PEN STANDS": ["Desktop Accessories"],
  "PROMOTIONAL UMBRELLAS": ["Umbrellas"],
  "CUSTOMISED DIARY & NOTE BOOKS": [
    "Eco-Friendly & Green",
    "Leather Diaries",
    "Hard Bound Diaries",
    "Planners & Themes",
    "Economy & Regular",
    "General / Others",
  ],
  "CALENDARS": ["Desktop & Wall Calendars"],
  "EXHIBITION VISITOR'S GIFT IDEAS": ["Giveaways & Promos"],
};

export function getCanonicalCategoryName(cat: string): string {
  const norm = cat.trim().toUpperCase().replace(/\s+/g, " ");
  if (norm.includes("NEW YEAR DIARY")) return "NEW YEAR DIARY";
  if (norm.includes("CORPORATE GIFT")) return "CORPORATE GIFT SETS";
  if (norm.includes("CUSTOMISED DIARY")) return "CUSTOMISED DIARY & NOTE BOOKS";
  if (norm.includes("BOTTLE")) return "BOTTLES GIFT SET";
  if (norm.includes("EXHIBITION")) return "EXHIBITION VISITOR'S GIFT IDEAS";
  return norm;
}

export function getSubcategoriesForCategory(
  cat: string,
  customSubcategories?: Record<string, string[]>
): string[] {
  const norm = cat.trim().toUpperCase().replace(/\s+/g, " ");
  const canonical = getCanonicalCategoryName(norm);

  const matchedKey =
    STOREFRONT_SUBCATEGORIES[canonical] !== undefined
      ? canonical
      : Object.keys(STOREFRONT_SUBCATEGORIES).find((k) =>
          matchCategory(cat, k)
        );

  const predefined = matchedKey ? STOREFRONT_SUBCATEGORIES[matchedKey] || [] : [];
  const custom = [
    ...(customSubcategories?.[norm] || []),
    ...(customSubcategories?.[canonical] || []),
  ];

  return Array.from(new Set([...predefined, ...custom]));
}

export function matchCategory(
  productCat: string | null | undefined,
  targetCat: string
): boolean {
  if (!productCat) return false;
  const targetNorm = targetCat.trim().toUpperCase().replace(/\s+/g, " ");
  const productCats = productCat
    .split(",")
    .map((c) => c.trim().toUpperCase().replace(/\s+/g, " "));

  return productCats.some((pc) => {
    if (pc === targetNorm) return true;
    if (pc + "S" === targetNorm || pc === targetNorm + "S") return true;
    if (
      targetNorm === "CORPORATE GIFT SETS" &&
      (pc === "CORPORATE GIFT SET" ||
        pc === "CORPORATE GIFTSETS" ||
        pc === "CORPORATE GIFT SETS")
    ) {
      return true;
    }
    if (
      targetNorm.includes("CUSTOMISED DIARY") &&
      pc.includes("CUSTOMISED DIARY")
    ) {
      return true;
    }
    if (targetNorm.includes("NEW YEAR DIARY") && pc.includes("NEW YEAR DIARY")) {
      return true;
    }
    if (targetNorm.includes("BOTTLE") && pc.includes("BOTTLE")) {
      return true;
    }
    return false;
  });
}

export function getSubcategory(
  item: { name: string; tags?: string[] | string | null },
  category: string,
  customSubcategories?: Record<string, string[]>
): string {
  const categoryNorm = category.trim().toUpperCase();

  const predefined = [
    ...(STOREFRONT_SUBCATEGORIES[categoryNorm] || []),
    ...(customSubcategories?.[categoryNorm] || []),
  ];
  const itemTags: string[] = Array.isArray(item.tags)
    ? item.tags
    : typeof item.tags === "string"
    ? item.tags.split(",").map((s) => s.trim())
    : [];

  if (predefined.length > 0) {
    const explicitMatch = predefined.find((sub) =>
      itemTags.some((t) => t.toLowerCase() === sub.toLowerCase())
    );
    if (explicitMatch) return explicitMatch;
  }

  const nameLower = (item.name || "").toLowerCase();
  const tagsLower = itemTags.map((t) => t.toLowerCase());

  const hasKeyword = (keywords: string[]) =>
    keywords.some((k) => {
      if (k === "eco") {
        return /\beco\b/i.test(nameLower) || tagsLower.some((t) => /\beco\b/i.test(t));
      }
      return nameLower.includes(k) || tagsLower.some((t) => t.includes(k));
    });

  if (
    categoryNorm === "CORPORATE GIFT SETS" ||
    categoryNorm === "CORPORATE GIFT SET" ||
    categoryNorm === "CORPORATE GIFTSETS"
  ) {
    if (hasKeyword(["diary and pen", "diary & pen", "pen set"]))
      return "Diary & Pen Sets";
    if (hasKeyword(["calendar"])) return "Calendar Sets";
    if (hasKeyword(["gift set", "giftset", "combo"])) return "Giftsets";
    return "General / Others";
  }

  if (
    categoryNorm === "NEW YEAR DIARY" ||
    categoryNorm === "NEW YEAR DIARIES" ||
    categoryNorm === "CUSTOMISED DIARY & NOTE BOOKS" ||
    categoryNorm === "NEW YEAR DIARY BOOKS"
  ) {
    if (hasKeyword(["go green", "eco", "wood", "woody", "green"]))
      return "Eco-Friendly & Green";
    if (hasKeyword(["leather", "pu leather"])) return "Leather Diaries";
    if (hasKeyword(["hard bound", "hard cover", "hb"]))
      return "Hard Bound Diaries";
    if (hasKeyword(["planner", "motivation", "theme"]))
      return "Planners & Themes";
    if (hasKeyword(["economy", "economical", "regular"]))
      return "Economy & Regular";
    return "General / Others";
  }

  if (categoryNorm === "LEATHER GIFT ITEMS") {
    if (hasKeyword(["bag", "portfolio"])) return "Bags & Portfolios";
    return "Leather Accessories";
  }

  if (categoryNorm === "LEATHER BAGS") {
    return "Executive Bags";
  }

  if (categoryNorm === "JUTE BAGS") {
    return "Eco Jute Bags";
  }

  if (
    categoryNorm === "BOTTLES GIFT SET" ||
    categoryNorm === "BOTTLE GIFT SETS"
  ) {
    return "Bottle & Flask Sets";
  }

  if (categoryNorm === "POWER BANK DIARIES") {
    return "Tech Power Bank Diaries";
  }

  if (categoryNorm === "PEN STANDS") {
    return "Desktop Accessories";
  }

  if (categoryNorm === "PROMOTIONAL UMBRELLAS") {
    return "Umbrellas";
  }

  if (categoryNorm === "CALENDARS") {
    return "Desktop & Wall Calendars";
  }

  if (
    categoryNorm === "EXHIBITION VISITOR'S GIFT IDEAS" ||
    categoryNorm === "EXHIBITION GIFTS"
  ) {
    return "Giveaways & Promos";
  }

  return "General / Others";
}

export type CategoryNavItem = {
  name: string;
  href: string;
  subcategories: { name: string; href: string }[];
};

export function getDefaultCategoryNav(
  customCategories?: Array<{ name: string }>,
  customSubcategories?: Record<string, string[]>
): CategoryNavItem[] {
  const categories = [...STOREFRONT_CATEGORIES];
  if (customCategories && Array.isArray(customCategories)) {
    for (const c of customCategories) {
      if (c && c.name) {
        const norm = c.name.trim().toUpperCase();
        if (!categories.includes(norm)) {
          categories.push(norm);
        }
      }
    }
  }

  return categories.map((cat) => {
    const subs = getSubcategoriesForCategory(cat, customSubcategories);

    return {
      name: cat,
      href: `/shop?category=${encodeURIComponent(cat)}`,
      subcategories: subs.map((sub) => ({
        name: sub,
        href: `/shop?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub)}`,
      })),
    };
  });
}

export function extractProductMaterials(item: {
  name?: string | null;
  tags?: string[] | string | null;
  features?: Record<string, any> | string | null;
  cover_type?: string | null;
}): string[] {
  const mats = new Set<string>();
  let feat: Record<string, any> = {};

  if (item.features) {
    if (typeof item.features === "object" && item.features !== null) {
      feat = item.features;
    } else if (typeof item.features === "string") {
      try {
        feat = JSON.parse(item.features);
      } catch {}
    }
  }

  const candidates = [
    feat.material,
    feat.Material,
    feat.cover_type,
    feat["Cover Type"],
    feat.cover_binding,
    feat["Cover Binding"],
    item.cover_type,
  ];

  for (const c of candidates) {
    const val = typeof c === "object" && c !== null ? c.value : c;
    if (typeof val === "string" && val.trim()) {
      const trimmed = val.trim();
      if (trimmed.length > 1 && trimmed.length < 30) {
        mats.add(trimmed);
      }
    }
  }

  const tags: string[] = Array.isArray(item.tags)
    ? item.tags
    : typeof item.tags === "string"
    ? item.tags.split(",").map((s) => s.trim())
    : [];
  const name = (item.name || "").toLowerCase();
  const text = (tags.join(" ") + " " + name).toLowerCase();

  if (text.includes("pu leather") || text.includes("leatherite")) {
    mats.add("PU Leather");
  } else if (text.includes("leather")) {
    mats.add("Leather");
  }

  if (
    text.includes("hard bound") ||
    text.includes("hard cover") ||
    text.includes(" hb ")
  ) {
    mats.add("Hard Bound");
  }
  if (text.includes("soft bound") || text.includes("soft cover")) {
    mats.add("Soft Bound");
  }
  if (text.includes("jute")) {
    mats.add("Jute");
  }
  if (text.includes("wood") || text.includes("wooden")) {
    mats.add("Wooden");
  }
  if (text.includes("metal") || text.includes("steel")) {
    mats.add("Metal");
  }
  if (text.includes("canvas")) {
    mats.add("Canvas");
  }
  if (text.includes("paper") || text.includes("kraft")) {
    mats.add("Paper");
  }

  return Array.from(mats);
}
