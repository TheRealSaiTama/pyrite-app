"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

const Hero = ({ content }: { content?: any }) => {
  const heading_1 = content?.heading_1 || content?.headline || content?.heading || "Custom Corporate Diaries";
  const heading_2 = content?.heading_2 || content?.headline_line2 || "& Luxury Gift Sets.";
  const subheading_1 =
    content?.subheading_1 ||
    (typeof content?.subheading === "string" ? content.subheading : null) ||
    "Elevate your brand presence with precision logo-embossed diaries,";
  const subheading_2 = content?.subheading_2 || "executive planners, and tailored corporate gift hampers.";
  const btnBaseText = content?.primary_cta?.base_text || content?.cta_text || "Explore 2026 Catalog";
  const btnUrl = content?.primary_cta?.url || content?.cta_href || "/shop";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white py-12 lg:py-20 border-b border-slate-100">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-slate-100/60 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, CTAs, Proof */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium tracking-wide mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Direct Manufacturer • Bulk Gifting Specialists</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
              <span>{heading_1}</span>{" "}
              <span className="block text-slate-700">{heading_2}</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed mb-8">
              {subheading_1} {subheading_2}
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href={btnUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all hover:gap-3 hover:shadow-lg w-full sm:w-auto"
              >
                <span>{btnBaseText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/custom-design"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-7 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 transition-all w-full sm:w-auto"
              >
                Custom Design Studio
              </Link>
            </div>

            {/* Trust Proof Badges */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 w-full max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">500+</div>
                <div className="text-xs text-slate-500 font-medium">Corporate Clients</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">4.9/5 ★</div>
                <div className="text-xs text-slate-500 font-medium">Quality Rating</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium">On-Time Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Product Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product Card Canvas */}
              <div className="relative rounded-3xl bg-white p-4 sm:p-5 shadow-xl border border-slate-200/70 overflow-hidden group">
                <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
                  <Image
                    src="/headerimage2.png"
                    alt="Pyrite Executive Diary Showcase"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                  
                  {/* Bottom Overlay Label */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full inline-block mb-1.5 border border-white/20">
                      2026 Executive Series
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-md">
                      Management PU Leather Diary
                    </h3>
                    <p className="text-xs text-slate-200 font-normal">
                      With Magnetic Closure & Debossed Logo
                    </p>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-semibold px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Thermal Deboss
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-semibold px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    80 GSM Paper
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-semibold px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Gold Foiling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;