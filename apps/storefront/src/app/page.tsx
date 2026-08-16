import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Categories from "@/components/sections/categories";
import BestDealsSection from "@/components/sections/best-deals";
import BestDiscountsBanner from "@/components/sections/best-discounts";
import WhyChooseUsSection from "@/components/sections/why-choose-us";
import CustomerSatisfaction from "@/components/sections/customer-satisfaction";
import BrandsSection from "@/components/sections/brands";
import WeeklyPopularProducts from "@/components/sections/weekly-popular";
import CashBackSection from "@/components/sections/cash-back";
import TabbedProducts from "@/components/sections/tabbed-products";
import CashBackBottom from "@/components/sections/cash-back-bottom";
import ServicesSection from "@/components/sections/services";
import GiftVibeAbout from "@/components/sections/giftvibe-about";
import Footer from "@/components/sections/footer";
import CorporateShowcase from "@/components/sections/corporate-showcase";
import { prisma } from '@/lib/prisma';
import { getStorefrontData } from "@/lib/site";
import {
  mapEnabledSections,
  filterLiveCatalog,
  parseCustomTabs,
  normalizeTabProductIds,
} from "@/lib/cms/mappers";
import { getLocalCatalog } from "@/lib/local-catalog";

export const revalidate = 0;

const catalogSelect = {
  id: true,
  name: true,
  description: true,
  minPrice: true,
  maxPrice: true,
  imageUrl: true,
  category: true,
  tags: true,
  enabled: true,
  featured: true,
} as const;

async function getCatalog() {
  try {
    const [products, diaries] = await Promise.all([
      prisma.product
        .findMany({ select: catalogSelect })
        .catch((e) => {
          console.error("home getCatalog products failed", e);
          return [] as any[];
        }),
      prisma.diary
        .findMany({ select: catalogSelect })
        .catch((e) => {
          console.error("home getCatalog diaries failed", e);
          return [] as any[];
        }),
    ]);
    const live = filterLiveCatalog([...products, ...diaries] as any[]);
    const mapped = (JSON.parse(JSON.stringify(live)) as any[]).map((row) => ({
      ...row,
      id: String(row.id),
    }));
    if (mapped.length) return mapped;
  } catch (e) {
    console.error("home getCatalog failed", e);
  }
  const local = getLocalCatalog();
  return [...local.products, ...local.diaries];
}

async function getHomeSections() {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { pageKey: "home" },
      orderBy: { sortOrder: "asc" },
    });
    return mapEnabledSections(
      sections.map((s) => ({
        sectionKey: s.sectionKey,
        enabled: s.enabled,
        content: s.content,
        sortOrder: s.sortOrder,
      })),
    );
  } catch (e) {
    console.error("home getHomeSections failed", e);
  }
  return {
    hero: {},
    about: {},
    discounts: {},
    categories: {},
    best_deals: {},
    brands: {},
    popular: {},
    cashback: {},
    tabbed_products: {},
    why_choose_us: {},
    satisfaction: {},
    cashback_bottom: {},
    services: {},
    corporate_showcase: {},
  };
}

function collectPickedIds(sections: Record<string, any>): string[] {
  const ids: string[] = [];
  for (const key of ["best_deals", "popular", "tabbed_products", "best_deals_tabbed"]) {
    const c = sections[key];
    if (!c) continue;
    if (Array.isArray(c.items)) {
      ids.push(...normalizeTabProductIds(c.items));
    }
    for (const tab of parseCustomTabs(c)) {
      ids.push(...tab.productIds);
    }
  }
  return [...new Set(ids.map(String))];
}

async function hydrateCatalogPicks(catalog: any[], sections: Record<string, any>) {
  const wanted = collectPickedIds(sections);
  if (!wanted.length) return catalog;
  const have = new Set(catalog.map((r) => String(r.id).toLowerCase()));
  const missing = wanted.filter((id) => !have.has(id.toLowerCase()));
  if (!missing.length) return catalog;

  try {
    const [extraProducts, extraDiaries] = await Promise.all([
      prisma.product
        .findMany({ where: { id: { in: missing } }, select: catalogSelect })
        .catch(() => [] as any[]),
      prisma.diary
        .findMany({ where: { id: { in: missing } }, select: catalogSelect })
        .catch(() => [] as any[]),
    ]);
    const extra = filterLiveCatalog(
      JSON.parse(JSON.stringify([...extraProducts, ...extraDiaries])) as any[],
    ).map((row: any) => ({ ...row, id: String(row.id) }));
    if (!extra.length) return catalog;
    return [...catalog, ...extra];
  } catch (e) {
    console.error("home hydrateCatalogPicks failed", e);
    return catalog;
  }
}

export default async function HomePage() {
  const [catalogRaw, sections, storefront] = await Promise.all([
    getCatalog(),
    getHomeSections(),
    getStorefrontData().catch((e) => {
      console.error("home getStorefrontData failed", e);
      return {
        settings: undefined as any,
        headerNav: undefined as any,
        megaMenu: undefined as any,
        footerLinks: undefined as any,
      };
    }),
  ]);

  const catalog = await hydrateCatalogPicks(catalogRaw, sections);

  const settings = storefront?.settings;
  const headerNav = storefront?.headerNav;
  const megaMenu = storefront?.megaMenu;
  const footerLinks = storefront?.footerLinks;

  return (
    <div className="min-h-screen">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
      />

      <main>
        {/* 1. Hero Showcase */}
        {sections.hero !== undefined && <Hero content={sections.hero} />}

        {/* 2. Core Categories Carousel */}
        {sections.categories !== undefined && <Categories content={sections.categories} />}

        {/* 3. Featured 2026 Diaries & Today's Deals */}
        {sections.best_deals !== undefined && (
          <BestDealsSection content={sections.best_deals} products={catalog} />
        )}

        {/* 4. Corporate Custom Design Studio */}
        {sections.corporate_showcase !== undefined && (
          <CorporateShowcase content={sections.corporate_showcase} />
        )}

        {/* 5. Trending Combos & Weekly Popular */}
        {sections.popular !== undefined && (
          <WeeklyPopularProducts content={sections.popular} products={catalog} />
        )}

        {/* 6. Tabbed Collection */}
        {(sections.tabbed_products !== undefined || sections.best_deals_tabbed !== undefined) && (
          <TabbedProducts
            products={catalog}
            content={sections.tabbed_products || sections.best_deals_tabbed}
          />
        )}

        {/* 7. Why Discerning Brands Choose Pyrite */}
        {sections.why_choose_us !== undefined && (
          <WhyChooseUsSection content={sections.why_choose_us} />
        )}

        {/* 8. Client Brands & Social Proof */}
        {sections.brands !== undefined && <BrandsSection content={sections.brands} />}
        {sections.satisfaction !== undefined && (
          <CustomerSatisfaction content={sections.satisfaction} />
        )}

        {/* 9. Manufacturing Services & Full About Section */}
        {sections.services !== undefined && <ServicesSection content={sections.services} />}
        {sections.about !== undefined && <GiftVibeAbout content={sections.about} />}
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}