"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Info,
} from "lucide-react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/context/ProductContext";
import { resolveProductImage } from "@/lib/product-image";

interface CartClientProps {
  headerNav: any;
  megaMenu: any;
  settings: any;
  footerLinks: any;
}

export default function CartClient({
  headerNav,
  megaMenu,
  settings,
  footerLinks,
}: CartClientProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartGst,
    cartTotal,
  } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review your items and proceed to generate your proforma invoice
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is currently empty</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Explore our wide collection of corporate gifts, customized diaries, and executive
              stationery.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
                {cart.map((item) => {
                  const imageUrl = resolveProductImage(item.image);
                  const lineTotal = item.price * item.quantity;
                  const itemMoq = item.moq || 50;

                  return (
                    <div
                      key={String(item.id)}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/40 transition-colors"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/shop/${item.id}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 group"
                      >
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.id}`}
                          className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 text-base"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="font-semibold text-slate-900">
                            ₹{item.price.toLocaleString()} / unit
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            MOQ: {itemMoq} units
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector with MOQ enforcement */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="inline-flex items-center border border-gray-300 rounded-md bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(itemMoq, item.quantity - 1))}
                            disabled={item.quantity <= itemMoq}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={itemMoq}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              updateQuantity(item.id, isNaN(val) ? itemMoq : Math.max(itemMoq, val));
                            }}
                            className="w-16 text-center font-bold text-sm text-gray-900 focus:outline-hidden py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-base font-bold text-gray-900">
                              ₹{lineTotal.toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary & Billing Details Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      GST (18%)
                      <span className="text-xs text-gray-400 font-normal">(Included for Proforma)</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{cartGst.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Subtotal Amount</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-[#0F172A]">
                        ₹{cartTotal.toLocaleString()}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">Basic total incl. 18% GST</p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer banner */}
                <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="flex items-start gap-1.5 font-bold text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>Shipping & Customization Extra</span>
                  </div>
                  <p className="leading-relaxed pl-5 text-amber-800">
                    Shipping charges are calculated based on your destination location and volume.
                    Our sales executive will include exact shipping in your proforma invoice.
                  </p>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-4 px-6 rounded-lg text-base shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-[11px] text-gray-400 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No advance payment needed right now</span>
                  </div>
                  <p>Our sales team will connect with you with the finalized proforma.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
