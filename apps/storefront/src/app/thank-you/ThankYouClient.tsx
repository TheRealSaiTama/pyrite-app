"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, ShoppingBag, Phone, ArrowRight } from "lucide-react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/context/ProductContext";

interface ThankYouClientProps {
  headerNav: any;
  megaMenu: any;
  settings: any;
  footerLinks: any;
}

export default function ThankYouClient({
  headerNav,
  megaMenu,
  settings,
  footerLinks,
}: ThankYouClientProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    // Ensure cart is cleared after reaching thank-you page
    clearCart();
  }, [clearCart]);

  const customerCarePhone = settings?.phone || settings?.whatsappNumber || "+91 98111 88399";
  const brandName = settings?.brandName || "New Year Diaries";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-gray-700 font-medium">Thankyou Page</span>
        </nav>

        {/* Content Box matching uploaded reference Image 3 */}
        <div className="max-w-2xl mx-auto text-center px-4">
          {/* Round thumbs-up icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#334155] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
            <ThumbsUp className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.2} />
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-red-600 mb-8 tracking-tight">
            Congratulations ! Thanks for your order.
          </h1>

          {/* Notice sections */}
          <div className="space-y-6 text-slate-900 leading-relaxed">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-red-600 uppercase tracking-wide mb-2">
                PLEASE NOTE :
              </h2>
              <p className="text-base md:text-lg font-semibold text-gray-800">
                Amount showing here is the basic cost of your purchased items, there will be{" "}
                <span className="font-extrabold">SHIPPING OR CUSTOMIZATION CHARGES</span> to be
                included in this amount.
              </p>
            </div>

            <div className="py-2">
              <p className="text-base md:text-lg font-bold text-red-600">
                ** PLEASE DO NOT PROCEED WITH PAYMENT AT THIS STAGE,
              </p>
              <p className="text-base md:text-lg font-semibold text-gray-800 mt-2">
                Our sales executive will call you shortly to discuss and give detailed proforma
                invoice for your order and payment.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-sm md:text-base font-medium text-gray-700">
                If you have any query, you can contact to our customer care:{" "}
                <a
                  href={`tel:${customerCarePhone.replace(/\s/g, "")}`}
                  className="font-bold text-[#0F172A] hover:underline"
                >
                  {customerCarePhone}
                </a>
              </p>
            </div>

            <div className="pt-4">
              <p className="text-lg font-bold text-red-600">Thanks...!!</p>
              <p className="text-lg font-bold text-red-600">{brandName}</p>
            </div>
          </div>

          {/* Continue Shopping CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-4 rounded-xl font-bold text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
