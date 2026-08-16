import * as React from "react";

const BestDiscountsBanner = ({ content }: { content?: any }) => {
  const text_1 = content?.text_1 || "BEST DISCOUNTS";
  const text_2 = content?.text_2 || "ONLY WHOLESALE";

  return (
    <section className="py-8 bg-slate-50/70 border-y border-slate-100">
      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-6 sm:gap-10 flex-wrap justify-center text-center">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">{text_1}</span>
          <span className="hidden sm:inline-block h-8 w-px bg-slate-300" />
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a]">{text_2}</span>
        </div>
      </div>
    </section>
  );
};

export default BestDiscountsBanner;


