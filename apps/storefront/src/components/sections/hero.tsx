"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Star, Truck } from "lucide-react";

const Hero = ({ content }: { content?: any }) => {
  const heading_1 = content?.heading_1 || content?.headline || content?.heading || "Custom Corporate Diaries";
  const heading_2 = content?.heading_2 || content?.headline_line2 || "& Luxury Gift Sets.";
  const subheading_1 =
    content?.subheading_1 ||
    (typeof content?.subheading === "string" ? content.subheading : null) ||
    "Elevate your brand presence with precision logo-embossed diaries,";
  const subheading_2 = content?.subheading_2 || "executive planners, and tailored corporate gift hampers.";
  const btnUrl = content?.primary_cta?.url || content?.cta_href || "/shop";

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      const target = document.getElementById("about") || document.getElementById("footer") || document.querySelector("footer");
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F9F0E7] py-14 sm:py-20 lg:py-24 border-b border-slate-200/60 min-h-[560px] lg:min-h-[620px] flex items-center">
      {/* Background Banner Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/Banner.jpg"
          alt="Custom Corporate Diaries & Luxury Gift Sets"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Soft responsive overlay for crisp legibility on smaller screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F0E7] via-[#F9F0E7]/85 sm:via-[#F9F0E7]/60 md:via-[#F9F0E7]/25 to-transparent lg:via-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl lg:max-w-2xl xl:max-w-3xl flex flex-col items-start">

          {/* Main Headline with refined font family */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[58px] font-extrabold tracking-tight text-slate-900 leading-[1.14] mb-5 font-['Plus_Jakarta_Sans',sans-serif]">
            <span>{heading_1}</span>{" "}
            <span className="block text-slate-800">{heading_2}</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-700 max-w-xl font-normal leading-relaxed mb-8">
            {subheading_1} {subheading_2}
          </p>

          {/* Dual CTA Buttons (reduced roundness: rounded-lg) */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
            <Link
              href={btnUrl}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#0F172A] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1E293B] hover:shadow-md transition-all group w-full sm:w-auto"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#about"
              onClick={handleContactClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-slate-300/80 px-7 py-3.5 text-sm font-semibold shadow-2xs hover:shadow-xs transition-all w-full sm:w-auto"
            >
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Trust Proof Badges with Icons */}
          <div className="pt-8 border-t border-slate-300/60 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl">
            {/* Stat 1: 500+ Corporate Clients */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-900/5 border border-slate-900/10 flex items-center justify-center shrink-0 text-slate-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  500+
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Corporate Clients
                </div>
              </div>
            </div>

            {/* Stat 2: 4.9/5 ★ Quality Rating */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  4.9/5 ★
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Quality Rating
                </div>
              </div>
            </div>

            {/* Stat 3: 100% On-Time Delivery */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  100%
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  On-Time Delivery
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