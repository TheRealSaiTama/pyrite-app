"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/context/ProductContext";
import { resolveProductImage, isRemoteOrDataImage } from "@/lib/product-image";

const INDIAN_STATES = [
  "Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
];

interface CheckoutClientProps {
  headerNav: any;
  megaMenu: any;
  settings: any;
  footerLinks: any;
}

export default function CheckoutClient({
  headerNav,
  megaMenu,
  settings,
  footerLinks,
}: CheckoutClientProps) {
  const { cart, cartSubtotal, cartGst, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    gstOrAadhar: "",
    country: "India",
    streetAddress1: "",
    streetAddress2: "",
    city: "",
    state: "Delhi",
    postcode: "",
    phone: "",
    email: "",
    orderNotes: "",
    agreePrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.streetAddress1.trim() || !formData.city.trim() || !formData.postcode.trim()) {
      setErrorMsg("Please provide your complete street address, city, and postcode.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please provide your phone/mobile number so our team can reach you.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Please provide your email address for sending the proforma invoice.");
      return;
    }
    if (!formData.agreePrivacy) {
      setErrorMsg("Please acknowledge the Privacy Statement and Terms & Conditions to proceed.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty. Please add items to your cart before checking out.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          pricing: {
            subtotal: cartSubtotal,
            gst: cartGst,
            total: cartTotal,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to process your order request.");
      }

      // Order placed successfully
      clearCart();
      router.push("/thank-you");
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMsg(err.message || "Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
        phone={settings?.phone}
        email={settings?.email}
      />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Billing Details</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in your billing and shipping details to generate your order proforma
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to proceed</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form inputs */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-xs space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  First name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Last name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Company name (optional)
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* GST / Aadhar */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                GST / Aadhar ID
              </label>
              <input
                type="text"
                name="gstOrAadhar"
                placeholder="GST Number or Aadhar ID"
                value={formData.gstOrAadhar}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                In case of non availability of GST no. we will need your Aadhar ID for billing or
                shipping / transportation purpose
              </p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Country / Region <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 text-sm font-semibold cursor-not-allowed"
              />
            </div>

            {/* Street Address */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-800">
                Street address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="streetAddress1"
                required
                placeholder="House number and street name"
                value={formData.streetAddress1}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
              <input
                type="text"
                name="streetAddress2"
                placeholder="Apartment, suite, unit, etc. (optional)"
                value={formData.streetAddress2}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* Town / City */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Town / City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* State / County & Postcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  State / County <span className="text-red-600">*</span>
                </label>
                <select
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all cursor-pointer"
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Postcode / ZIP <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="postcode"
                  required
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Phone / Mobile <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 "
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Email address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Privacy Statement */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-1">Privacy Statement</h3>
              <p className="text-xs text-gray-500 mb-3">
                Please acknowledge you agree with our privacy statement by ticking the following box.
              </p>
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0F172A] focus:ring-[#0F172A]"
                />
                <span className="leading-snug">
                  I have read & agreed to your privacy statement. By clicking this I am agree with all
                  Terms and Conditions. <span className="text-red-600">*</span>
                </span>
              </label>
            </div>

            {/* Additional Information / Order Notes */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-1">Additional information</h3>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Special Instructions or Comments about your order
              </label>
              <textarea
                name="orderNotes"
                rows={4}
                value={formData.orderNotes}
                onChange={handleChange}
                placeholder="Notes about your order, e.g. special notes for delivery, customization requests, etc."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F172A] focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* Please Note Banner */}
            <div className="rounded-xl bg-gray-100 p-5 space-y-2 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900">Please Note:</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="text-red-600 font-bold">*SHIPPING IS NOT FREE*</span> Please
                continue with your order by selecting your preferred shipping choice, we will get back
                to you soon to give you exact amount for shipping according to your location and
                shipping choice.
              </p>
              <p className="text-xs text-gray-600">
                * Cash on Delivery (COD) is not available on this product.
              </p>
            </div>

            {/* Payment Options Banner */}
            <div className="rounded-xl bg-gray-100 p-5 space-y-2 border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900">Payment Options:</h4>
              <div className="bg-gray-200/70 p-3.5 rounded-lg text-xs text-gray-800 space-y-1">
                <p className="font-semibold">You can use any payment option for this order</p>
                <p className="text-gray-700">
                  Debit Card / Credit Card / Online Bank Transfer / NEFT / RTGS / IMPS / Cheque
                </p>
              </div>
              <p className="text-xs text-red-600 font-bold tracking-tight">
                *** Your Order will not be shipped until we receive your payment ***
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                Your Order ({cart.length} item{cart.length === 1 ? "" : "s"})
              </h2>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={String(item.id)} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded bg-gray-100 shrink-0 overflow-hidden border border-gray-100">
                        <Image
                          src={resolveProductImage(item.image)}
                          alt={item.name}
                          fill
                          unoptimized={isRemoteOrDataImage(resolveProductImage(item.image))}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-xs">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 text-xs shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{cartGst.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total Proforma</span>
                  <span className="text-2xl font-extrabold text-[#0F172A]">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-4 px-6 rounded-lg text-base shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Submit Order</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-gray-500 text-center space-y-1">
                <p>No card details or direct payment charged online.</p>
                <p>A formal proforma invoice will be provided by our sales team.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Corporate Ordering</span>
            </div>
          </div>
        </form>
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
