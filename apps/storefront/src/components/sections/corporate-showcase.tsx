import Link from "next/link";
import { Sparkles, ShieldCheck, Globe2, ArrowRight } from "lucide-react";

const PeachDecoration = () => (
  <svg
    viewBox="0 0 200 200"
    className="absolute -right-6 -bottom-6 sm:-right-3 sm:-bottom-3 w-40 h-40 sm:w-48 sm:h-48 pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-3"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="peachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.08" />
      </linearGradient>
    </defs>
    <g transform="translate(100, 100) rotate(45)">
      <rect x="-44" y="-44" width="40" height="40" rx="14" fill="url(#peachGrad)" />
      <rect x="4" y="-44" width="40" height="40" rx="14" fill="url(#peachGrad)" />
      <rect x="-44" y="4" width="40" height="40" rx="14" fill="url(#peachGrad)" />
      <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#peachGrad)" />
    </g>
  </svg>
);

const BlueDecoration = () => (
  <svg
    viewBox="0 0 200 200"
    className="absolute -right-6 -bottom-6 sm:-right-3 sm:-bottom-3 w-40 h-40 sm:w-48 sm:h-48 pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-3"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.08" />
      </linearGradient>
    </defs>
    <g transform="translate(48, 48)">
      <path d="M 0 52 A 52 52 0 0 1 52 0 L 52 52 Z" fill="url(#blueGrad)" />
      <rect x="58" y="0" width="52" height="52" rx="14" fill="url(#blueGrad)" />
      <rect x="0" y="58" width="52" height="52" rx="14" fill="url(#blueGrad)" />
      <path d="M 58 110 A 52 52 0 0 1 110 58 L 58 58 Z" fill="url(#blueGrad)" />
    </g>
  </svg>
);

const PurpleDecoration = () => (
  <svg
    viewBox="0 0 200 200"
    className="absolute -right-6 -bottom-6 sm:-right-3 sm:-bottom-3 w-40 h-40 sm:w-48 sm:h-48 pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-3"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.08" />
      </linearGradient>
    </defs>
    <g transform="translate(56, 40)">
      <path d="M 0 0 C 48 0 80 32 80 80 C 32 80 0 48 0 0 Z" fill="url(#purpleGrad)" />
      <path d="M 0 160 C 48 160 80 128 80 80 C 32 80 0 112 0 160 Z" fill="url(#purpleGrad)" />
    </g>
  </svg>
);

const CorporateShowcase = ({ content }: { content?: any }) => {
  const badgeText = content?.badge || "Pyrite Corporate Gifts";
  const heading =
    content?.heading ||
    "Crafting Premium Diaries & Corporate Gifts at Wholesale Value";
  const descriptionHtml =
    content?.description ||
    `<strong>Pyrite</strong> delivers promotional products and corporate gift sets directly from the source.&nbsp;Enjoy wholesale pricing without middlemen while our team personalizes each piece to suit your brand.`;

  const cardsData = content?.features;

  const cards = [
    {
      id: "mastery",
      badge: "Proven Heritage",
      title: cardsData?.[0]?.title || "25+ Years of Mastery",
      desc:
        cardsData?.[0]?.desc ||
        "One of India's largest calendar & diary exporters, maintaining impeccable quality across every order.",
      icon: ShieldCheck,
      linkText: "Explore Collection",
      linkUrl: "/shop",
      bgClass: "bg-[#FFF6ED]",
      borderClass: "border-[#FED7AA]/70",
      badgeBorder: "border-amber-200/80",
      badgeText: "text-amber-950",
      badgeIconColor: "text-amber-600",
      linkColor: "text-amber-950 hover:text-amber-800",
      Decoration: PeachDecoration,
    },
    {
      id: "tailored",
      badge: "Bespoke Branding",
      title: cardsData?.[1]?.title || "Tailored Corporate Gifting",
      desc:
        cardsData?.[1]?.desc ||
        "We customise products to match brand guidelines, simplifying corporate & promotional gifting campaigns.",
      icon: Sparkles,
      linkText: "Custom Design Studio",
      linkUrl: "/custom-design",
      bgClass: "bg-[#EFF6FF]",
      borderClass: "border-[#BFDBFE]/70",
      badgeBorder: "border-blue-200/80",
      badgeText: "text-blue-950",
      badgeIconColor: "text-blue-600",
      linkColor: "text-blue-950 hover:text-blue-800",
      Decoration: BlueDecoration,
    },
    {
      id: "global",
      badge: "Worldwide Reach",
      title: cardsData?.[2]?.title || "Global Confidence",
      desc:
        cardsData?.[2]?.desc ||
        "Our expansive collection, timely delivery, and expert support make us the preferred partner for brands worldwide.",
      icon: Globe2,
      linkText: "Corporate Gifting",
      linkUrl: "/shop",
      bgClass: "bg-[#FAF5FF]",
      borderClass: "border-[#DDD6FE]/70",
      badgeBorder: "border-purple-200/80",
      badgeText: "text-purple-950",
      badgeIconColor: "text-purple-600",
      linkColor: "text-purple-950 hover:text-purple-800",
      Decoration: PurpleDecoration,
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/60 via-white to-[#f8fafc]/40" />
      <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/5 via-blue-500/5 to-transparent blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 border border-slate-900/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> {badgeText}
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {heading}
          </h2>
          <p
            className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-normal"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>

        {/* 3 Colorful Feature Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const Decoration = card.Decoration;
            const isLastOnTablet = idx === 2;

            return (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-3xl border ${card.borderClass} ${card.bgClass} p-7 sm:p-8 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                  isLastOnTablet
                    ? "md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto lg:max-w-none w-full"
                    : ""
                }`}
              >
                {/* Decorative Geometric Watermark */}
                <Decoration />

                {/* Card Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    {/* Pill Badge */}
                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-3.5 py-1.5 text-xs font-semibold shadow-2xs border ${card.badgeBorder} ${card.badgeText}`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${card.badgeIconColor}`} />
                        <span>{card.badge}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug mb-3">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 font-normal max-w-xs sm:max-w-sm mb-8">
                      {card.desc}
                    </p>
                  </div>

                  {/* CTA Link */}
                  <div className="pt-2">
                    <Link
                      href={card.linkUrl}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group/link ${card.linkColor}`}
                    >
                      <span>{card.linkText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CorporateShowcase;
