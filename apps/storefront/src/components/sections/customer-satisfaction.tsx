"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";

const CustomerSatisfaction = ({ content }: { content?: any }) => {
  const heading = content?.heading || "Client Satisfaction & Trust";
  const description = content?.description || "Our commitment to craftsmanship and reliability drives us to exceed expectations at every step. From custom diary manufacturing to executive corporate gifting, Pyrite delivers unmatched quality and precision across India.";
  const btnText = content?.cta?.text || "Request Corporate Quote";

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="relative w-full py-20 px-6 md:px-8 overflow-hidden my-12"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1a5d73 50%, #2a6b80 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-white tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {heading}
        </motion.h2>
        
        <motion.p
          className="text-base md:text-lg text-white/90 mb-10 leading-relaxed max-w-4xl mx-auto font-normal"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link
            href="/custom-design"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-[#0F172A] bg-white rounded-full shadow-lg hover:shadow-2xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1"
          >
            <span>✨</span>
            <span>{btnText}</span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CustomerSatisfaction;
