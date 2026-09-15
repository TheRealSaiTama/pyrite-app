"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

const DEFAULT_TECHNIQUES = [
  { title: "Thermal Logo Debossing", body: "Debossing or blind debossing is and will continue to be the undisputed favourite among the logo debossings. It is charmingly unobtrusive, of high-quality and pleasant to the touch.", image_url: "/custom-design/thermal-debossing.jpg" },
  { title: "Colour Debossing", body: "A colour debossing functions in a similar way to a blind debossing. The only difference: between the debossing stamp and the book there is a thin coloured foil that is transferred to the cover.", image_url: "/custom-design/colour-debossing.jpg" },
  { title: "Metallic Debossing", body: "Metallic debossing is also called hot foil embossing in Gold or Silver.", image_url: "/custom-design/metallic-debossing.jpg" },
  { title: "Laser Cut / Punching", body: "A good alternative to stamping is the laser cut – a digitally controlled cutting technique.", image_url: "/custom-design/laser-cut.jpg" },
  { title: "Magnetic Flap", body: "All types of clasps made in metal, that are available in various shapes, sizes and colours to showcase your company logo.", image_url: "/custom-design/magnetic-flap.jpg" },
];

export default function CustomDesignClient({
  headerNav,
  megaMenu,
  settings,
  footerLinks,
  content,
}: {
  headerNav?: { label: string; href: string }[];
  megaMenu?: { name: string; subtitle: string; image: string; href: string }[];
  settings?: {
    brandName: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    logoUrl: string | null;
    socials: Record<string, string>;
  };
  footerLinks?: {
    company?: { label: string; href: string }[];
    shop?: { label: string; href: string }[];
    support?: { label: string; href: string }[];
  };
  content?: {
    heading?: string;
    techniques?: { title?: string; body?: string; image_url?: string }[];
  };
}) {
  const techniques = (content?.techniques?.length ? content.techniques : DEFAULT_TECHNIQUES).filter(
    (t) => t?.title,
  );
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("fullName", formValues.name);
      payload.append("email", formValues.email);
      payload.append("description", formValues.subject || "Custom Design Enquiry");
      payload.append("orderNotes", formValues.message);
      payload.append("phone", "");
      payload.append("quantity", "1");
      payload.append("pincode", "");
      payload.append("address", "");
      payload.append("companyName", "");
      payload.append("gst", "");
      payload.append("selectedProducts", JSON.stringify([]));

      const response = await fetch("/api/enquiry", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (result?.success) {
        toast.success("Your custom design request has been sent!");
        setFormValues({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result?.message || "Failed to send your request. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        nav={headerNav}
        megaMenu={megaMenu}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
      />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#0f4c5c]/15 to-[#8B6B2E]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#1a5d73]/15 to-[#2a6b80]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          {techniques.map((tech, index) => {
            const imageLeft = index % 2 === 0;
            const HeadingTag = index === 0 ? "h1" : "h2";
            const image = (
              <motion.div
                initial={{ opacity: 0, x: imageLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                  <Image
                    src={tech.image_url || "/custom-design/thermal-debossing.jpg"}
                    alt={tech.title || "Custom design"}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </motion.div>
            );
            const copy = (
              <motion.div
                initial={{ opacity: 0, x: imageLeft ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                <HeadingTag className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight">
                  {tech.title}
                </HeadingTag>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{tech.body}</p>
              </motion.div>
            );
            return (
              <motion.div
                key={`${tech.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid lg:grid-cols-2 gap-12 items-center mb-32"
              >
                {imageLeft ? (
                  <>
                    {image}
                    {copy}
                  </>
                ) : (
                  <>
                    {copy}
                    {image}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative py-20 mb-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#CCDFFD] to-[#EEEEEE]"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl p-12 md:p-16">
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                <div className="space-y-8">
                  <div>
                    <label htmlFor="name" className="block text-base font-normal text-gray-900 mb-3">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formValues.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-base font-normal text-gray-900 mb-3">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-base font-normal text-gray-900 mb-3">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formValues.subject}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-base font-normal text-gray-900 mb-3">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={11}
                    value={formValues.message}
                    onChange={handleChange}
                    required
                    className="w-full h-[calc(100%-2rem)] px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#0F172A] text-white font-semibold shadow-md transition-all hover:bg-[#1E293B] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Submit Enquiry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}
