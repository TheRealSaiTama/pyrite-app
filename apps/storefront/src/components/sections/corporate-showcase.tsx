import { Sparkles, ShieldCheck, Globe2 } from "lucide-react";

const productHighlights = [
  "2026 Diaries & Planners",
  "Promotional Customized Diaries",
  "Business Organizers",
  "PU Leather Diaries",
  "Executive Diaries",
  "Corporate Gift Sets",
  "Customized Notepads & Notebooks",
  "Promotional Pens & Calendars",
  "Keychains & Desktop Gifts",
  "Employee Joining Kits",
  "2-in-1 & 3-in-1 Gift Sets",
];

const marketingSolutions = [
  "Office Diaries & Leather Planners",
  "Sticky Notes & Notepads",
  "Customized Gift Sets & Notebooks",
  "Pharma Gifts & Marketing Materials",
  "Key Chains & Wooden Pen Stands",
  "Seasonal Gifts (Diwali, New Year)",
  "Promotional Pens",
  "Umbrellas",
];

const CorporateShowcase = ({ content }: { content?: any }) => {
  const badgeText = content?.badge || "Pyrite Corporate Gifts";
  const heading = content?.heading || "Crafting Premium Diaries & Corporate Gifts at Wholesale Value";
  const descriptionHtml = content?.description || `<strong>Pyrite</strong> delivers promotional products and corporate gift sets directly from the source.&nbsp;Enjoy wholesale pricing without middlemen while our team personalizes each piece to suit your brand.`;
  const customCards = content?.features || [
    { title: "25+ Years of Mastery", desc: "One of India's largest calendar & diary exporters, maintaining impeccable quality across every order.", icon: "ShieldCheck" },
    { title: "Tailored Corporate Gifting", desc: "We customise products to match brand guidelines, simplifying corporate & promotional gifting campaigns.", icon: "Sparkles" },
    { title: "Global Confidence", desc: "Our expansive collection, timely delivery, and expert support make us the preferred partner for brands worldwide.", icon: "Globe2" },
  ];
  const list1Title = content?.highlights_title || "Signature Corporate Offerings";
  const list1Desc = content?.highlights_desc || "Discover a comprehensive range designed to suit every corporate milestone and brand moment.";
  const list1Items = content?.highlights || productHighlights;

  const list2Title = content?.solutions_title || "360° Marketing Support";
  const list2Desc = content?.solutions_desc || "Partner with us for marketing collateral that keeps your brand memorable long after every gifting moment.";
  const list2Items = content?.solutions || marketingSolutions;

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-white to-[#f8fafc]" />
      <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#0F172A]/10 via-[#2a6b80]/15 to-transparent blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-[#0F172A]/10 via-[#1a5d73]/20 to-transparent blur-3xl" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0F172A]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            <Sparkles className="h-4 w-4" /> {badgeText}
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {heading}
          </h2>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600 font-normal" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {customCards.map((card: any, idx: number) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xs hover:shadow-xl transition-all duration-300">
              {card.icon === 'ShieldCheck' && <ShieldCheck className="h-10 w-10 text-[#0F172A]" />}
              {card.icon === 'Sparkles' && <Sparkles className="h-10 w-10 text-[#f59e0b]" />}
              {card.icon === 'Globe2' && <Globe2 className="h-10 w-10 text-[#2a6b80]" />}
              <h3 className="mt-5 text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xs hover:shadow-lg transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-900">{list1Title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {list1Desc}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {list1Items.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  <span className="mt-1.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-[#0F172A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xs hover:shadow-lg transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-900">{list2Title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {list2Desc}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {list2Items.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  <span className="mt-1.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-[#f59e0b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
          Disclaimer: All trademarks, logos, and brand names referenced remain the property of their respective owners.
        </p>
      </div>
    </section>
  );
};

export default CorporateShowcase;
