"use client";

import { motion } from "motion/react";
import Image from "next/image";

const GiftVibeAbout = ({ content }: { content?: any }) => {
  const heading_title = content?.heading_title || "Pyrite Corporate Gifts";
  const heading_subtitle = content?.heading_subtitle || "Manufacturers of Premium Diaries, Notebooks & Executive Corporate Gifts <br/>Crafting Excellence — Your Trusted Partner for Corporate Gifting Solutions";
  const heading_1 = content?.heading_1 || "Our Journey of";
  const heading_highlight = content?.heading_highlight || "Excellence";
  const paragraph_1 = content?.paragraph_1 || "Pyrite stands as one of the industry's most trusted names in manufacturing and supplying premium Corporate Diaries, Executive Notebooks, and Corporate Gift Sets. From modern manufacturing facilities, we deliver bespoke gifting solutions nationwide.";
  const paragraph_2 = content?.paragraph_2 || "Our comprehensive collection features Executive Planners, PU Leather Diaries, Custom Desk Calendars, Branded Promotional Pens, Power Bank Diaries, and customized gift hampers tailored for leading corporations.";
  const paragraph_3 = content?.paragraph_3 || "With an uncompromising focus on premium materials, precision printing, and client satisfaction, Pyrite turns corporate gifting into lasting brand impressions.";
  const image_url = content?.image_url || "/about.png";
  const dynamicStats = content?.stats || [
    { number: "25+", label: "Years of Excellence" },
    { number: "10K+", label: "Happy Clients" },
    { number: "50K+", label: "Products Delivered" },
    { number: "100%", label: "Quality Assured" }
  ];
  const baseStats = [
    { 
        number: "25+", 
        label: "Years of Excellence", 
        delay: 0.1, 
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        )
    },
    { 
        number: "10K+", 
        label: "Happy Clients", 
        delay: 0.2, 
        icon: (
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        )
    },
    { 
        number: "50K+", 
        label: "Products Delivered", 
        delay: 0.3, 
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
        ) 
    },
    { 
        number: "100%", 
        label: "Quality Assured", 
        delay: 0.4, 
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
        ) 
    },
  ];

  const stats = baseStats.map((stat, i) => {
    const dyn = dynamicStats[i];
    return {
      ...stat,
      number: dyn?.number || stat.number,
      label: dyn?.label || stat.label
    };
  });

  return (
    <div id="about" className="relative bg-white overflow-hidden py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#0F172A]/10 to-[#2a6b80]/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#0F172A]/10 to-[#1a5d73]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <Image
              src="/logo.png"
              alt="Pyrite Logo"
              width={200}
              height={80}
              className="h-14 md:h-16 w-auto mx-auto object-contain drop-shadow-sm"
              priority
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-[#0F172A] tracking-tight"
          >
            {heading_title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative inline-block"
          >
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal" dangerouslySetInnerHTML={{__html: heading_subtitle}} />
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#0F172A] rounded-full"></div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 md:mb-24"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: stat.delay, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              <div className="text-[#0F172A] mb-4 inline-block">
                {stat.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-1 tracking-tight">
                {stat.number}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6 leading-tight">
              {heading_1}{" "}
              <span className="bg-gradient-to-r from-[#0F172A] to-[#2a6b80] bg-clip-text text-transparent">{heading_highlight}</span>
            </h2>
            <div className="space-y-4 text-base md:text-lg text-slate-700 leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg font-semibold text-slate-900"
              >
                {paragraph_1}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-slate-600"
              >
                {paragraph_2}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="font-medium text-[#0F172A]"
              >
                {paragraph_3}
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/20 to-[#2a6b80]/20 rounded-3xl blur-2xl"></div>
            <Image
              src={image_url}
              alt="Pyrite Corporate Gifts"
              width={700}
              height={500}
              className="relative z-10 rounded-3xl shadow-xl w-full object-cover border border-slate-100"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GiftVibeAbout;