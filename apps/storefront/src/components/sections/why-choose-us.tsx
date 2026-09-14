"use client";
import * as React from "react";
import { motion } from "motion/react";
import { Zap, Coins, Printer, Truck } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-7 w-7 text-slate-900" strokeWidth={1.5} />,
    title: "On-Time Deliveries",
    description: "Reliable shipping and delivery commitments you can count on.",
    delay: 0.1,
  },
  {
    icon: <Coins className="h-7 w-7 text-slate-900" strokeWidth={1.5} />,
    title: "Reasonable Prices",
    description: "Competitive pricing without compromising on quality.",
    delay: 0.2,
  },
  {
    icon: <Printer className="h-7 w-7 text-slate-900" strokeWidth={1.5} />,
    title: "Customized Printing",
    description:
      "Expertise in Logo Emboss Printing, Customised Cover Printing, Logo on Each Page, Hot Foil Printing, and Laser Printing.",
    delay: 0.3,
  },
  {
    icon: <Truck className="h-7 w-7 text-slate-900" strokeWidth={1.5} />,
    title: "PAN India Deliveries",
    description: "Extensive reach across nationwide markets and beyond.",
    delay: 0.4,
  },
];

const WhyChooseUsSection = ({ content }: { content?: any }) => {
  const badge = content?.badge || "The Pyrite Standard";
  const heading = content?.heading || "Why Discerning Brands Choose Pyrite";
  const subheading =
    content?.subheading ||
    "We don't just supply merchandise; we engineer brand prestige with precision manufacturing, strict QA, and factory-direct pricing.";
  const dynamicFeatures = content?.features || [];

  const displayFeatures = features.map((feature, i) => {
    const dyn = dynamicFeatures[i];
    return {
      ...feature,
      title: dyn?.title || feature.title,
      description: dyn?.description || feature.description,
    };
  });

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-5 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-2xs">
                {badge}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18]"
            >
              {heading}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-md"
            >
              {subheading}
            </motion.p>
          </div>

          {/* Right Column: 2x2 Feature Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {displayFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: feature.delay }}
                  className="rounded-2xl sm:rounded-3xl bg-[#F8FAFC]/90 border border-slate-200/70 p-6 sm:p-7 flex flex-col justify-start transition-all duration-300 hover:bg-white hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div className="mb-4 text-slate-900 transition-transform duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;


