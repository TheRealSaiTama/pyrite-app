import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getLocalCatalog } from "@/lib/local-catalog";

export type CmsRow = Record<string, any>;

export type CmsDb = {
  site_settings: CmsRow[];
  page_sections: CmsRow[];
  page_seo: CmsRow[];
  nav_links: CmsRow[];
  products: CmsRow[];
  diaries: CmsRow[];
  media_assets: CmsRow[];
  user_roles: CmsRow[];
};

const TABLES: (keyof CmsDb)[] = [
  "site_settings",
  "page_sections",
  "page_seo",
  "nav_links",
  "products",
  "diaries",
  "media_assets",
  "user_roles",
];

const LOCAL_OWNER = "00000000-0000-4000-8000-000000000001";

let cache: CmsDb | null = null;

function isDirectoryWritable(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, `.probe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    fs.writeFileSync(probe, "1");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

let resolvedDataDir: string | null = null;

export function dataDir(): string {
  if (resolvedDataDir) return resolvedDataDir;

  const candidates = [
    path.join(process.cwd(), "data"),
    path.join(process.cwd(), "apps", "storefront", "data"),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir) && isDirectoryWritable(dir)) {
      resolvedDataDir = dir;
      return dir;
    }
  }

  const tmpDir = path.join("/tmp", "pyrite-cms");
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
  } catch {}
  resolvedDataDir = tmpDir;
  return tmpDir;
}

function dbPath(): string {
  return path.join(dataDir(), "cms-local.json");
}

export function stableUuid(seed: string): string {
  const h = crypto.createHash("sha1").update(seed).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function now() {
  return new Date().toISOString();
}

function section(
  page_key: string,
  section_key: string,
  title: string,
  sort_order: number,
  content: Record<string, any>,
): CmsRow {
  const t = now();
  return {
    id: stableUuid(`section:${page_key}:${section_key}`),
    page_key,
    section_key,
    title,
    sort_order,
    enabled: true,
    content,
    created_at: t,
    updated_at: t,
  };
}

function buildSeed(): CmsDb {
  const t = now();
  const catalog = getLocalCatalog();
  const products = catalog.products.map((p) => ({
    id: stableUuid(`product:${p.slug}`),
    slug: p.slug,
    name: p.name,
    description: p.description,
    min_price: p.minPrice,
    max_price: p.maxPrice,
    category: p.category,
    tags: p.tags,
    image_url: p.imageUrl,
    gallery: p.gallery,
    features: p.features,
    featured: p.featured,
    enabled: true,
    seo_title: null,
    seo_description: null,
    created_at: t,
    updated_at: t,
  }));
  const diaries = catalog.diaries.map((p) => ({
    id: stableUuid(`diary:${p.slug}`),
    slug: p.slug,
    name: p.name,
    description: p.description,
    min_price: p.minPrice,
    max_price: p.maxPrice,
    category: p.category,
    tags: p.tags,
    image_url: p.imageUrl,
    gallery: p.gallery,
    features: p.features,
    color: null,
    size: null,
    pages: null,
    cover_type: null,
    featured: p.featured,
    enabled: true,
    seo_title: null,
    seo_description: null,
    created_at: t,
    updated_at: t,
  }));

  const nav = (
    group_key: string,
    items: { label: string; href: string }[],
  ): CmsRow[] =>
    items.map((it, i) => ({
      id: stableUuid(`nav:${group_key}:${it.href}:${it.label}`),
      group_key,
      label: it.label,
      href: it.href,
      sort_order: i,
      enabled: true,
      created_at: t,
      updated_at: t,
    }));

  return {
    site_settings: [
      {
        id: 1,
        brand_name: "Pyrite",
        tagline: "Premium Corporate Gifts, Customised Diaries & Executive Planners",
        logo_url: "/logo.png",
        favicon_url: "/logo.png",
        primary_color: "#0F172A",
        whatsapp_number: "+91 9899223130",
        phone: "+91 9899223130",
        email: "info@pyrite.in",
        address: "Corporate Office & Manufacturing Unit, Delhi NCR, India",
        socials: {},
        site_url: "http://localhost:3000",
        preview_url: "http://localhost:3000",
        updated_at: t,
      },
    ],
    page_seo: [
      {
        page_key: "home",
        title: "Pyrite | Customised Diaries 2026 | Customised Note Books | Customised Corporate Gifts",
        description:
          "Pyrite crafts personalised diaries, notebooks, planners, and premium corporate gifts for 2026 with bespoke branding and nationwide delivery.",
        og_image_url: "/og-image.png",
        updated_at: t,
      },
    ],
    nav_links: [
      ...nav("header", [
        { label: "Shop", href: "/shop" },
        { label: "Bulk Orders", href: "#our-products" },
        { label: "Custom Print", href: "/custom-design" },
        { label: "About Us", href: "#about" },
      ]),
      ...nav("footer_shop", [
        { label: "All products", href: "/shop" },
        { label: "Custom design", href: "/custom-design" },
      ]),
      ...nav("footer_company", [
        { label: "About", href: "#about" },
        { label: "Contact", href: "/custom-design" },
      ]),
      ...nav("footer_support", [{ label: "Enquire", href: "/custom-design" }]),
    ],
    products,
    diaries,
    media_assets: [],
    user_roles: [{ id: stableUuid("role:owner"), user_id: LOCAL_OWNER, role: "owner", created_at: t }],
    page_sections: [
      section("home", "hero", "Hero Section", 10, {
        heading_1: "Custom Corporate Diaries",
        heading_2: "& Luxury Gift Sets.",
        subheading_1: "Elevate your brand presence with precision logo-embossed diaries,",
        subheading_2: "executive planners, and tailored corporate gift hampers.",
        primary_cta: { base_text: "Shop Now", hover_text: "Explore More", url: "/shop" },
        background_image_url: "/Banner.jpg",
      }),
      section("home", "categories", "Categories", 40, {
        heading: "Our Products & Categories",
        items: [
          { name: "CORPORATE GIFT SETS", subtitle: "120+ Packages Available", image_url: "/categories/CORPORATE GIFTSETS.png", bgColor: "#0F172A", alt: "Professional corporate gift sets", href: "", sort_order: 1 },
          { name: "NEW YEAR DIARY", subtitle: "80+ Styles Available", image_url: "/categories/NEW YEAR DIARY.png", bgColor: "#1a5d73", alt: "New Year diaries", href: "", sort_order: 2 },
          { name: "LEATHER GIFT ITEMS", subtitle: "Premium Collection", image_url: "/categories/LEATHER GIFT ITEMS.png", bgColor: "#2c3e50", alt: "Leather gifts", href: "", sort_order: 3 },
          { name: "LEATHER BAGS", subtitle: "Executive Collection", image_url: "/categories/LEATHER BAGS.png", bgColor: "#E8923C", alt: "Leather bags", href: "", sort_order: 4 },
          { name: "JUTE BAGS", subtitle: "Eco-Friendly Options", image_url: "/categories/JUTE BAGS.png", bgColor: "#28966E", alt: "Jute bags", href: "", sort_order: 5 },
          { name: "BOTTLES GIFT SET", subtitle: "Premium Combos", image_url: "/categories/BOTTLE GIFT SETS.png", bgColor: "#0F172A", alt: "Bottle gift sets", href: "", sort_order: 6 },
          { name: "POWER BANK DIARIES", subtitle: "Tech-Integrated", image_url: "/categories/POWERBANK DIARIES.png", bgColor: "#1a5d73", alt: "Power bank diaries", href: "", sort_order: 7 },
          { name: "PEN STANDS", subtitle: "Desktop Essentials", image_url: "/categories/PEN STANDS.png", bgColor: "#2c3e50", alt: "Pen stands", href: "", sort_order: 8 },
          { name: "PROMOTIONAL UMBRELLAS", subtitle: "Branded Solutions", image_url: "/categories/PROMOTIONAL UMBRELLAS.jpg", bgColor: "#0f766e", alt: "Umbrellas", href: "", sort_order: 9 },
          { name: "CUSTOMISED DIARY & NOTE BOOKS", subtitle: "150+ Designs Available", image_url: "/categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg", bgColor: "#1e3a5f", alt: "Custom diaries", href: "", sort_order: 10 },
          { name: "CALENDARS", subtitle: "Desktop & Wall Options", image_url: "/categories/CALENDARS.png", bgColor: "#28966E", alt: "Calendars", href: "", sort_order: 11 },
          { name: "EXHIBITION VISITOR'S GIFT IDEAS", subtitle: "Trade Show Specials", image_url: "/categories/EXHIBITION GIVEAWAY IDEAS.png", bgColor: "#0F172A", alt: "Exhibition gifts", href: "", sort_order: 12 },
        ],
      }),
      section("home", "best_deals", "Latest Diaries Section", 50, {
        heading: "Latest 2026 Diaries",
        items: products.slice(0, 4).map((p) => ({ productId: p.id })),
      }),
      section("home", "popular", "Trending Diary Giftsets", 70, {
        heading: "Trending Diary Giftsets",
        items: products.slice(4, 9).map((p) => ({ productId: p.id })),
      }),
      section("home", "tabbed_products", "Today's Best Deals", 90, {
        heading: "Todays Best Deals for you!",
        tabs: [
          { name: "Corporate Gift Set", productIds: products.slice(0, 8).map((p) => p.id) },
          { name: "Diaries", productIds: diaries.slice(0, 8).map((p) => p.id) },
        ],
      }),
      section("home", "corporate_showcase", "Corporate Showcase", 140, {
        badge: "Pyrite Corporate Gifts",
        heading: "Crafting Premium Diaries & Corporate Gifts at Wholesale Value",
        description:
          "Pyrite delivers promotional products and corporate gift sets directly from the source. Enjoy wholesale pricing without middlemen while our team personalizes each piece to suit your brand.",
        features: [
          { title: "25+ Years of Mastery", description: "One of India's largest calendar & diary exporters, maintaining impeccable quality across every order." },
          { title: "Tailored Corporate Gifting", description: "We customise products to match brand guidelines, simplifying corporate & promotional gifting campaigns." },
          { title: "Global Confidence", description: "Our expansive collection, timely delivery, and expert support make us the preferred partner for brands worldwide." },
        ],
      }),
      section("home", "why_choose_us", "Why Choose Us", 100, {
        badge: "The Pyrite Standard",
        heading: "Why Discerning Brands Choose Pyrite",
        subheading: "We don't just supply merchandise; we engineer brand prestige with precision manufacturing, strict QA, and factory-direct pricing.",
        features: [
          { title: "On-Time Deliveries", description: "Reliable shipping and delivery commitments you can count on." },
          { title: "Reasonable Prices", description: "Competitive pricing without compromising on quality." },
          { title: "Customized Printing", description: "Expertise in Logo Emboss Printing, Customised Cover Printing, Logo on Each Page, Hot Foil Printing, and Laser Printing." },
          { title: "PAN India Deliveries", description: "Extensive reach across nationwide markets and beyond." },
        ],
      }),
      section("home", "services", "Services", 130, {
        heading: "Our Premium Services",
        services: [
          { title: "Custom Design Services", subtitle: "Professional diary design and customization solutions", image: "/custom-design/thermal-debossing.jpg", bgColorClass: "#8B6B2E" },
          { title: "Bulk Order Solutions", subtitle: "Special pricing and services for corporate orders", image: "/custom-design/colour-debossing.jpg", bgColorClass: "#2c3e50" },
          { title: "Fast Delivery", subtitle: "Quick turnaround for all diary orders nationwide", image: "/custom-design/metallic-debossing.jpg", bgColorClass: "#1a5d73" },
        ],
      }),
      section("site", "mega_menu", "Category mega-menu", 0, {
        items: [
          { name: "CORPORATE GIFT SETS", subtitle: "Premium Packages Available", image_url: "/categories/CORPORATE GIFTSETS.png", href: "", sort_order: 1, enabled: true },
          { name: "NEW YEAR DIARY BOOKS", subtitle: "Fresh Designs 2025", image_url: "/categories/NEW YEAR DIARY.png", href: "", sort_order: 2, enabled: true },
          { name: "LEATHER GIFT ITEMS", subtitle: "Luxury Options", image_url: "/categories/LEATHER GIFT ITEMS.png", href: "", sort_order: 3, enabled: true },
          { name: "LEATHER BAGS", subtitle: "Elegant Styles", image_url: "/categories/LEATHER BAGS.png", href: "", sort_order: 4, enabled: true },
          { name: "JUTE BAGS", subtitle: "Eco-Friendly Choices", image_url: "/categories/JUTE BAGS.png", href: "", sort_order: 5, enabled: true },
          { name: "BOTTLES GIFT SET", subtitle: "Unique Sets", image_url: "/categories/BOTTLE GIFT SETS.png", href: "", sort_order: 6, enabled: true },
          { name: "POWER BANK DIARIES", subtitle: "Tech-Integrated Gifts", image_url: "/categories/POWERBANK DIARIES.png", href: "", sort_order: 7, enabled: true },
          { name: "PEN STANDS", subtitle: "Desk Essentials", image_url: "/categories/PEN STANDS.png", href: "", sort_order: 8, enabled: true },
          { name: "PROMOTIONAL UMBRELLAS", subtitle: "Branded Protection", image_url: "/categories/PROMOTIONAL UMBRELLAS.jpg", href: "", sort_order: 9, enabled: true },
          { name: "CUSTOMISED DIARY & NOTE BOOKS", subtitle: "Personalized Products", image_url: "/categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg", href: "", sort_order: 10, enabled: true },
          { name: "CALENDARS", subtitle: "Yearly Planners", image_url: "/categories/CALENDARS.png", href: "", sort_order: 11, enabled: true },
          { name: "EXHIBITION VISITOR'S GIFT IDEAS", subtitle: "Event Specials", image_url: "/categories/EXHIBITION GIVEAWAY IDEAS.png", href: "", sort_order: 12, enabled: true },
        ],
      }),
      section("shop", "main", "Shop page", 10, {
        heading: "Our Products",
        subheading: "Browse diaries, gift sets, and corporate essentials.",
        empty_state: "No products match your filters. Try clearing filters.",
      }),
      section("product", "main", "Product template", 10, {
        related_heading: "You may also like",
        enquiry_cta: "Enquire Now",
        quote_cta: "Request Quote",
      }),
      section("custom-design", "main", "Custom design page", 10, {
        heading: "Custom Design",
        techniques: [
          { title: "Thermal Logo Debossing", body: "Debossing or blind debossing is the undisputed favourite among logo debossings. High-quality and pleasant to the touch.", image_url: "/custom-design/thermal-debossing.jpg" },
          { title: "Colour Debossing", body: "A colour debossing works like blind debossing, with a thin coloured foil transferred to the cover.", image_url: "/custom-design/colour-debossing.jpg" },
          { title: "Metallic Debossing", body: "Hot foil embossing in gold or silver. The motif sits deeper and has a metallic shine.", image_url: "/custom-design/metallic-debossing.jpg" },
          { title: "Laser Cut / Punching", body: "Digitally controlled cutting for delicate motifs, stencil lettering, or grid images.", image_url: "/custom-design/laser-cut.jpg" },
          { title: "Magnetic Flap", body: "Metal clasps in various shapes, sizes and colours to showcase your company logo.", image_url: "/custom-design/magnetic-flap.jpg" },
        ],
      }),
    ],
  };
}

export function isCmsTable(name: string): name is keyof CmsDb {
  return (TABLES as string[]).includes(name);
}

export function readCms(): CmsDb {
  if (cache) return cache;
  const file = dbPath();
  if (fs.existsSync(file)) {
    try {
      cache = JSON.parse(fs.readFileSync(file, "utf8")) as CmsDb;
      return cache!;
    } catch {
      // fall through to seed
    }
  }

  // If writable dbPath does not exist yet, look for pre-bundled cms-local.json
  const seedCandidates = [
    path.join(process.cwd(), "apps", "storefront", "data", "cms-local.json"),
    path.join(process.cwd(), "data", "cms-local.json"),
  ];
  for (const s of seedCandidates) {
    if (fs.existsSync(s)) {
      try {
        cache = JSON.parse(fs.readFileSync(s, "utf8")) as CmsDb;
        writeCms(cache);
        return cache!;
      } catch {}
    }
  }

  cache = buildSeed();
  writeCms(cache);
  return cache;
}

export function writeCms(db: CmsDb) {
  cache = db;
  try {
    const file = dbPath();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // In-memory cache still serves the request if disk write fails
  }
}

export function mutateCms(fn: (db: CmsDb) => void) {
  const db = readCms();
  fn(db);
  writeCms(db);
}

export const LOCAL_OWNER_ID = LOCAL_OWNER;
