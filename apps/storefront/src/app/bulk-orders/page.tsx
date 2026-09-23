import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  BookOpen,
  Gift,
  Megaphone,
  Users,
  Stamp,
  Printer,
  Sparkles,
  Cpu,
  Layers,
  FileCheck2,
  Truck,
  Building2,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { getStorefrontData } from "@/lib/site";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Bulk Orders & B2B Corporate Procurement | Pyrite",
  description:
    "Direct-from-manufacturer corporate diaries, daily planners, executive notebooks, and curated gift combos. High-volume B2B manufacturing in Delhi with trackable PAN-India delivery.",
};

const PROCUREMENT_CATEGORIES = [
  {
    title: "Yearly Planners & Dated Agendas",
    description: "Structured formats aligned with annual corporate planning cycles.",
    icon: Calendar,
  },
  {
    title: "Executive PU Leather Notebooks",
    description: "Premium finishes built for leadership, VIPs, and client gifting.",
    icon: BookOpen,
  },
  {
    title: "Curated Gift Combos",
    description: "Coordinated sets pairing diaries with pens, keychains, and tech accessories (2-in-1, 3-in-1, and 4-in-1 formats).",
    icon: Gift,
  },
  {
    title: "Marketing & Event Notebooks",
    description: "Cost-effective, high-volume runs designed for brand campaigns and roadshows.",
    icon: Megaphone,
  },
  {
    title: "Onboarding & Event Kits",
    description: "Complete packs tailored for new hires and trade show handouts.",
    icon: Users,
  },
];

const CUSTOMIZATION_TECHNIQUES = [
  {
    title: "Blind Debossing",
    description: "Deep, heat-pressed tactile indentation of your company insignia on premium PU leather without pigment.",
    icon: Stamp,
  },
  {
    title: "Metallic Hot Foil Stamping",
    description: "High-sheen gold, silver, or bronze foil permanently embedded onto covers for distinguished leadership appeal.",
    icon: Sparkles,
  },
  {
    title: "Screen Printing",
    description: "Vibrant, Pantone-accurate single and multi-color logo reproduction engineered for high-run durability.",
    icon: Printer,
  },
  {
    title: "Precision Laser Engraving",
    description: "Computer-controlled etching for razor-sharp detailing on metal pens, clasps, keyrings, and metallic badges.",
    icon: Cpu,
  },
  {
    title: "Full-Cover UV Printing",
    description: "High-definition full-color edge-to-edge printing with vivid scratch-resistant cured polymer ink layers.",
    icon: Layers,
  },
  {
    title: "Watermarked & Printed Inner Pages",
    description: "Custom date grids, ruled layouts, corporate profile inserts, product brochures, and watermarked sheets.",
    icon: FileCheck2,
  },
];

const FULFILLMENT_STEPS = [
  {
    step: "01",
    title: "Initial Scope & Logo Asset",
    description: "Minimum order quantities begin at 100 units. Share target volume, destination city, dispatch window, and vector logo.",
  },
  {
    step: "02",
    title: "Engineering & Sizing Calibration",
    description: "Our team locks in paper density, book size (typically executive A5 or B5), and custom box packaging.",
  },
  {
    step: "03",
    title: "Schedule Lock & PO Issuance",
    description: "Production timeline and physical pre-production proof are locked before your team issues a formal PO.",
  },
  {
    step: "04",
    title: "Factory Turnaround & Dispatch",
    description: "Runs between 500 and 5,000 units follow calibrated factory cycles, packaged securely for transit.",
  },
];

const CLIENT_SECTORS = [
  "Banking & Financial Services",
  "Pharmaceuticals & Healthcare",
  "Industrial & Heavy Manufacturing",
  "Global Enterprise Admin Divisions",
  "Technology & Consulting Firms",
  "Automotive & Engineering",
];

export default async function BulkOrdersPage() {
  const data = await getStorefrontData();
  const phone = data.settings.phone || data.settings.whatsappNumber || "+91 87966 84365";
  const rawPhone = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${rawPhone || "918796684365"}?text=${encodeURIComponent(
    "Hi Pyrite team, we are planning a bulk B2B order of corporate diaries / gift sets and would like to receive product catalogs and a formal quote."
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        nav={data.headerNav}
        megaMenu={data.megaMenu}
        logoUrl={data.settings.logoUrl}
        brandName={data.settings.brandName}
        phone={data.settings.phone}
        email={data.settings.email}
      />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Bulk Orders & Corporate Procurement</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-white border-b border-slate-200 py-12 lg:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15] mb-6">
                Direct-from-Manufacturer Corporate Diaries &amp; Gift Sets
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8">
                <strong className="text-slate-900 font-semibold">Pyrite Corporate Gifts</strong> is the direct corporate supply division of our Delhi-based manufacturing facility, producing custom-engineered diaries, daily planners, executive notebooks, and premium desk utilities since 1999. We focus strictly on bulk B2B procurement rather than retail gift baskets. Whether your requirement is 100 units or 10,000 fully customized pieces, we operate on firm, guaranteed delivery timelines you can rely on.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-7 py-3.5 rounded-xl shadow-xs transition-colors text-sm"
                >
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: What Procurement Teams Source From Us */}
        <section className="py-14 lg:py-18">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Product Spectrum
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                What Procurement Teams Source From Us
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROCUREMENT_CATEGORIES.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#0F172A] mb-4">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: In-House Customization Capabilities */}
        <section className="bg-white py-14 lg:py-18 border-y border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Factory Execution
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-4">
                In-House Customization Capabilities
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Every branding job runs directly on our factory floor: blind debossing, metallic hot foil stamping, screen printing, precision laser engraving, full-cover UV printing, and custom watermarked or printed inner pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CUSTOMIZATION_TECHNIQUES.map((tech) => {
                const IconComponent = tech.icon;
                return (
                  <div
                    key={tech.title}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {tech.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Our Bulk Fulfillment Process */}
        <section className="py-14 lg:py-18">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Workflow Timeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-4">
                Our Bulk Fulfillment Process
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Standard minimum order quantities begin at 100 units. Send us your target volume, destination city, required dispatch window, and vector logo file. Our team locks in the paper density, book size (typically executive A5 or B5), custom box packaging, and production schedule before you issue a formal PO. Specific production runs between 500 and 5,000 units follow calibrated turnaround cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FULFILLMENT_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative"
                >
                  <span className="text-3xl font-black text-slate-200 font-mono block mb-3">
                    {step.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Client Base & Logistics */}
        <section className="bg-slate-900 text-white py-14 lg:py-18">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Central Delhi Production Hub • PAN-India Delivery</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-white">
                  Client Base &amp; Logistics
                </h2>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  Direct-from-manufacturer corporate diaries, executive planners, and curated gift sets built for bulk B2B procurement and delivered on guaranteed timelines nationwide.
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-7 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-slate-300" />
                  <h3 className="text-lg font-bold text-white">
                    Primary Industry Verticals
                  </h3>
                </div>

                <div className="space-y-3">
                  {CLIENT_SECTORS.map((sector) => (
                    <div
                      key={sector}
                      className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-200">
                        {sector}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <span className="text-xs text-slate-400">Need sample units or custom spec sheet?</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact B2B Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-white py-12 border-t border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              Ready to Plan Your Corporate Procurement?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
              Talk directly with our factory production team to lock in paper weights, cover materials, and custom embossing layouts for your upcoming fiscal or holiday gifting cycle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-xs transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-7 py-3.5 rounded-xl shadow-xs transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call {phone}</span>
              </a>
              <Link
                href="/custom-design"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                <span>Custom Print Options</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={data.settings} footerLinks={data.footerLinks} />
    </div>
  );
}
