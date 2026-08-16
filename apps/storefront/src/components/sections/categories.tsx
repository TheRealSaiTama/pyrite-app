"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getCategoryHref } from '@/lib/category-links';

interface Category {
  name: string;
  subtitle: string;
  image_url: string;
  bgColor: string;
  alt: string;
  href?: string;
  sort_order?: number;
}

const categoryData: Category[] = [
  {
    name: 'CORPORATE GIFT SETS',
    subtitle: '120+ Packages Available',
    image_url: '/categories/CORPORATE GIFTSETS.png',
    bgColor: '#0F172A',
    alt: 'Professional corporate gift sets and custom diaries',
    sort_order: 1,
  },
  {
    name: 'NEW YEAR DIARY',
    subtitle: '80+ Styles Available',
    image_url: '/categories/NEW YEAR DIARY.png',
    bgColor: '#1a5d73',
    alt: 'Premium New Year themed diaries and planners',
    sort_order: 2,
  },
  {
    name: 'LEATHER GIFT ITEMS',
    subtitle: 'Premium Collection',
    image_url: '/categories/LEATHER GIFT ITEMS.png',
    bgColor: '#2c3e50',
    alt: 'High-quality leather gift items and accessories',
    sort_order: 3,
  },
  {
    name: 'LEATHER BAGS',
    subtitle: 'Executive Collection',
    image_url: '/categories/LEATHER BAGS.png',
    bgColor: '#E8923C',
    alt: 'Premium leather bags and accessories',
    sort_order: 4,
  },
  {
    name: 'JUTE BAGS',
    subtitle: 'Eco-Friendly Options',
    image_url: '/categories/JUTE BAGS.png',
    bgColor: '#28966E',
    alt: 'Sustainable jute bags for promotional use',
    sort_order: 5,
  },
  {
    name: 'BOTTLES GIFT SET',
    subtitle: 'Premium Combos',
    image_url: '/categories/BOTTLE GIFT SETS.png',
    bgColor: '#0F172A',
    alt: 'Gift sets with premium bottles and accessories',
    sort_order: 6,
  },
  {
    name: 'POWER BANK DIARIES',
    subtitle: 'Tech-Integrated',
    image_url: '/categories/POWERBANK DIARIES.png',
    bgColor: '#1a5d73',
    alt: 'Diaries with built-in power bank functionality',
    sort_order: 7,
  },
  {
    name: 'PEN STANDS',
    subtitle: 'Desktop Essentials',
    image_url: '/categories/PEN STANDS.png',
    bgColor: '#2c3e50',
    alt: 'Elegant pen stands and desk accessories',
    sort_order: 8,
  },
  {
    name: 'PROMOTIONAL UMBRELLAS',
    subtitle: 'Branded Solutions',
    image_url: '/categories/PROMOTIONAL UMBRELLAS.jpg',
    bgColor: '#0f766e',
    alt: 'Custom promotional umbrellas for marketing',
    sort_order: 9,
  },
  {
    name: 'CUSTOMISED DIARY & NOTE BOOKS',
    subtitle: '150+ Designs Available',
    image_url: '/categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg',
    bgColor: '#1e3a5f',
    alt: 'Fully customized diaries and notebooks',
    sort_order: 10,
  },
  {
    name: 'CALENDARS',
    subtitle: 'Desktop & Wall Options',
    image_url: '/categories/CALENDARS.png',
    bgColor: '#28966E',
    alt: 'Custom table and wall calendars',
    sort_order: 11,
  },
  {
    name: "EXHIBITION VISITOR'S GIFT IDEAS",
    subtitle: 'Trade Show Specials',
    image_url: '/categories/EXHIBITION GIVEAWAY IDEAS.png',
    bgColor: '#0F172A',
    alt: 'Special gift ideas for exhibition visitors',
    sort_order: 12,
  },
];

const Categories = ({ content }: { content?: any }) => {
  const heading = content?.heading || "Our Products & Categories";
  const items: Category[] = (content?.items || categoryData)
    .map((c: any, i: number) => ({
      name: c.name || "",
      subtitle: c.subtitle || "",
      image_url: c.image_url || c.image || "",
      bgColor: c.bgColor || "#0F172A",
      alt: c.alt || c.name || "",
      href: c.href || "",
      sort_order: typeof c.sort_order === "number" ? c.sort_order : i + 1,
    }))
    .filter((c: Category) => c.name)
    .slice()
    .sort((a: Category, b: Category) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <section id="our-products" className="bg-white py-16 lg:py-24 border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Browse Collections
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              {heading}
            </motion.h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors group self-start md:self-end"
          >
            <span>View All Categories</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Categories Horizontal Scroll / Grid */}
        <div className="flex overflow-x-auto gap-6 pb-6 pt-2 custom-scrollbar snap-x">
          {items.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start"
            >
              <Link
                href={
                  category.href && category.href.trim()
                    ? category.href.trim()
                    : getCategoryHref(category.name)
                }
                className="block group"
              >
                <div className="relative h-[340px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-1.5">
                  {category.image_url &&
                  (category.image_url.startsWith("http") || category.image_url.startsWith("/")) ? (
                    <Image
                      src={category.image_url}
                      alt={category.alt || category.name}
                      fill
                      unoptimized={
                        category.image_url.includes("drive.google.com") ||
                        category.image_url.includes("googleusercontent.com")
                      }
                      sizes="(max-width: 640px) 280px, 300px"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-90 group-hover:opacity-100"
                    />
                  ) : null}
                  
                  {/* High contrast bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-300" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-semibold tracking-wide uppercase bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full shadow-xs">
                      {category.subtitle || "Premium Gifting"}
                    </span>
                  </div>

                  {/* Bottom Content Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
                    <h3 className="font-extrabold text-lg text-white leading-snug drop-shadow-sm group-hover:text-slate-100 transition-colors">
                      {category.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span>Explore Catalog</span>
                      <span className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-slate-900">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;