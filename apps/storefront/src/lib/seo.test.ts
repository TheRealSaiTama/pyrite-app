import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildProductSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  getLinkSecurityProps,
} from "./seo";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("SEO & Structured Data Helpers", () => {
  it("builds valid Organization schema with contact and address", () => {
    const org = buildOrganizationSchema({
      brandName: "Pyrite Test",
      siteUrl: "https://pyrite.in",
      logoUrl: "/logo.png",
      phone: "+91 99999 88888",
      email: "contact@pyrite.in",
    });

    assert.equal(org["@context"], "https://schema.org");
    assert.equal(org["@type"], "Organization");
    assert.equal(org.name, "Pyrite Test");
    assert.equal(org.url, "https://pyrite.in");
    assert.equal(org.logo, "https://pyrite.in/logo.png");
    assert.equal((org.contactPoint as any[])[0].telephone, "+91 99999 88888");
  });

  it("builds valid WebSite schema with SearchAction query input", () => {
    const ws = buildWebSiteSchema({
      brandName: "Pyrite",
      siteUrl: "https://pyrite.in",
    });

    assert.equal(ws["@context"], "https://schema.org");
    assert.equal(ws["@type"], "WebSite");
    assert.equal(ws.name, "Pyrite");
    const action = ws.potentialAction as any;
    assert.equal(action["@type"], "SearchAction");
    assert.ok(action.target.urlTemplate.includes("/shop?search="));
  });

  it("builds Product schema without invented review totals", () => {
    const prod = buildProductSchema({
      id: "prod-101",
      name: "Executive Leather Diary 2026",
      description: "Deluxe embossed daily planner.",
      imageUrl: "/diary.png",
      minPrice: 350,
      brandName: "Pyrite",
      siteUrl: "https://pyrite.in",
      enabled: true,
    });

    assert.equal(prod["@context"], "https://schema.org");
    assert.equal(prod["@type"], "Product");
    assert.equal(prod.name, "Executive Leather Diary 2026");
    assert.equal(prod.sku, "PYRITE-prod-101");
    const offers = prod.offers as any;
    assert.equal(offers.price, "350.00");
    assert.equal(offers.priceCurrency, "INR");
    assert.equal(offers.availability, "https://schema.org/InStock");
    assert.equal(prod.aggregateRating, undefined);
  });

  it("builds valid BreadcrumbList schema with 1-based indexing", () => {
    const crumbs = buildBreadcrumbSchema(
      [
        { name: "Home", url: "/" },
        { name: "Shop", url: "/shop" },
        { name: "Executive Diary", url: "/shop/item-1" },
      ],
      "https://pyrite.in"
    );

    assert.equal(crumbs["@context"], "https://schema.org");
    assert.equal(crumbs["@type"], "BreadcrumbList");
    const list = crumbs.itemListElement as any[];
    assert.equal(list.length, 3);
    assert.equal(list[0].position, 1);
    assert.equal(list[0].name, "Home");
    assert.equal(list[0].item, "https://pyrite.in/");
    assert.equal(list[2].position, 3);
    assert.equal(list[2].item, "https://pyrite.in/shop/item-1");
  });

  it("builds valid FAQPage schema", () => {
    const faq = buildFaqSchema([
      { question: "What is MOQ?", answer: "MOQ starts at 50 units." },
    ]);

    assert.equal(faq["@context"], "https://schema.org");
    assert.equal(faq["@type"], "FAQPage");
    const entities = faq.mainEntity as any[];
    assert.equal(entities.length, 1);
    assert.equal(entities[0].name, "What is MOQ?");
    assert.equal(entities[0].acceptedAnswer.text, "MOQ starts at 50 units.");
  });

  it("detects and secures external links against tabnabbing", () => {
    const localLink = getLinkSecurityProps("/shop");
    assert.equal(localLink.isExternal, false);

    const extHttps = getLinkSecurityProps("https://wa.me/919999999999");
    assert.equal(extHttps.isExternal, true);
    assert.equal(extHttps.rel, "noopener noreferrer");
    assert.equal(extHttps.target, "_blank");

    const extHttp = getLinkSecurityProps("http://example.com");
    assert.equal(extHttp.isExternal, true);
    assert.equal(extHttp.rel, "noopener noreferrer");
  });

  it("generates correct robots.txt configuration", async () => {
    const rob = await robots();
    assert.ok(rob.sitemap);
    assert.ok(String(rob.sitemap).endsWith("/sitemap.xml"));
    const disallow = (rob.rules as any).disallow;
    assert.ok(Array.isArray(disallow));
    assert.ok(disallow.includes("/cart"));
    assert.ok(disallow.includes("/checkout"));
    assert.ok(disallow.includes("/api/"));
  });

  it("generates sitemap including static pages and products", async () => {
    const sm = await sitemap();
    assert.ok(Array.isArray(sm));
    assert.ok(sm.length > 4);
    const urls = sm.map((s) => s.url);
    assert.ok(urls.some((u) => u.endsWith("/")));
    assert.ok(urls.some((u) => u.endsWith("/shop")));
    assert.ok(urls.some((u) => u.endsWith("/bulk-orders")));
    assert.ok(urls.some((u) => u.endsWith("/custom-design")));
  });
});
