"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Phone,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Home,
} from "lucide-react";
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
  const hasClearedRef = React.useRef(false);

  useEffect(() => {
    // Ensure cart is cleared after reaching thank-you page
    if (!hasClearedRef.current) {
      hasClearedRef.current = true;
      clearCart();
    }
  }, [clearCart]);

  const customerCarePhone = settings?.phone || settings?.whatsappNumber || "+91 87966 84365";
  const rawPhone = customerCarePhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${rawPhone || "918796684365"}?text=${encodeURIComponent(
    "Hi Pyrite team, I just placed an order request on your website and would like to check on the customization and proforma invoice details."
  )}`;
  const brandName = settings?.brandName || "Pyrite";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/70 flex flex-col">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
        phone={settings?.phone}
        email={settings?.email}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-8 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-800 font-medium">Order Confirmation</span>
        </nav>

        {/* Elevated Main Card */}
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-10 md:p-12 text-center">
          {/* Animated celebration icon */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-30" />
            <div className="relative w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/70 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" strokeWidth={2.2} />
            </div>
          </div>

          {/* Success pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Request Received</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
            Congratulations! Thanks for your order.
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            We have received your order details. Our executive team is currently reviewing your
            selected items and preparing the formal quote.
          </p>

          {/* Important Advisory / Note Box */}
          <div className="mt-8 mb-8 text-left bg-gradient-to-br from-amber-50/90 via-amber-50/60 to-amber-100/30 border border-amber-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-amber-950 uppercase tracking-wide">
                  PLEASE NOTE :
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-800">
                  Important Information Regarding Payment & Customization
                </p>
              </div>
            </div>

            <div className="space-y-4 text-slate-800 text-sm sm:text-base pl-1">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-600 font-bold leading-tight mt-1">•</span>
                <p className="leading-relaxed">
                  Amount showing here is the basic cost of your purchased items. There will be{" "}
                  <strong className="font-bold text-slate-950 uppercase">
                    shipping or customization charges
                  </strong>{" "}
                  to be included in this amount.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-white/90 border border-amber-200/80 rounded-xl">
                <p className="font-bold text-red-600 text-sm sm:text-base flex items-center gap-2">
                  <span>⚠️ PLEASE DO NOT PROCEED WITH PAYMENT AT THIS STAGE</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1.5 leading-relaxed">
                  Our sales executive will call you shortly to discuss branding options (logo debossing, custom cover prints, inserts) and provide a detailed proforma invoice for your order and payment.
                </p>
              </div>
            </div>
          </div>

          {/* 3-Step Process Timeline */}
          <div className="my-8 pt-6 pb-2 border-t border-b border-gray-100">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6 text-center">
              What Happens Next
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-sm font-bold text-slate-900">Order Received</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your requirements and product quantities are logged in our production queue.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-sm font-bold text-[#0F172A]">Proforma Invoice</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Our executive calls to confirm logo branding, packaging & issue payment proforma.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-sm font-bold text-slate-900">Dispatch & Delivery</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Customization finished, quality inspected, and shipped with door-to-door tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Care Contact Strip */}
          <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">
              If you have any query, you can contact to our customer care:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${rawPhone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-bold text-[#0F172A] hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{customerCarePhone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Warm closing */}
          <div className="mb-8">
            <p className="text-base font-bold text-gray-900">Thanks...!!</p>
            <p className="text-xl font-extrabold text-[#0F172A] tracking-tight">{brandName}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-gray-100">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-colors"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
