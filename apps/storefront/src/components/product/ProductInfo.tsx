'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/ProductContext';
import { pickVisibleFeatures } from "@/lib/cms/mappers";

const TAG_VARIANTS = [
  { accent: '#0F172A', bg: 'bg-[#0F172A]/[0.03]', border: 'border-[#0F172A]/20' },
  { accent: '#7c2d12', bg: 'bg-[#7c2d12]/[0.03]', border: 'border-[#7c2d12]/20' },
  { accent: '#15803d', bg: 'bg-[#15803d]/[0.03]', border: 'border-[#15803d]/20' },
  { accent: '#6b21a8', bg: 'bg-[#6b21a8]/[0.03]', border: 'border-[#6b21a8]/20' },
];

interface Product {
  id: string | number;
  name: string;
  category?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  description: string;
  tags?: string[] | string | null;
  features?: Record<string, { show?: boolean; value?: string }> | null;
  moq?: number;
}

interface ProductInfoProps {
  product: Product;
  chrome?: {
    enquiry_cta?: string;
    quote_cta?: string;
  };
}

interface Specification {
  label: string;
  value: string;
}

function specsFromFeatures(
  features?: Record<string, { show?: boolean; value?: string }> | null,
): Specification[] {
  return pickVisibleFeatures(features).map(({ label, value }) => ({ label, value }));
}

export default function ProductInfo({ product, chrome }: ProductInfoProps) {
  const moq = Math.max(1, Number(product.moq) || 100);
  const [quantity, setQuantity] = useState<number>(moq);
  const { addToCart, toggleFavourite, isFavourite } = useCart();
  const router = useRouter();
  const isFav = isFavourite(product.id);

  const tags = useMemo(() => {
    if (!product.tags) return [] as string[];
    if (Array.isArray(product.tags)) {
      return product.tags.filter(Boolean);
    }

    return product.tags
      .split(',')
      .map((tag) => tag.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }, [product.tags]);

  const generateSKU = (id: string | number) => {
    return `71 ${id.toString().slice(-6).toUpperCase()} OP | LEATHER`;
  };

  const parseHighlights = (description: string): string => {
    if (!description) return '';
    const highlightMatch = description.match(/Product Highlights\s*([\s\S]+?)(?=Size\s*:|$)/);
    if (highlightMatch) {
      return highlightMatch[1].trim();
    }
    return description.split('\n\n')[0] || '';
  };

  const parseSpecifications = (description: string): Specification[] => {
    if (!description) return [];

    const specs: Specification[] = [];
    const lines = description.split('\n');

    const specPatterns = [
      { pattern: /Size\s*:\s*(.+)/, label: 'Size' },
      { pattern: /Paper Quality\s*:\s*(.+)/, label: 'Paper Quality' },
      { pattern: /Page Format\s*:\s*(.+)/, label: 'Page Format' },
      { pattern: /Cover Binding\s*:\s*(.+)/, label: 'Cover Binding' },
      { pattern: /Monthly Planner\s*:\s*(.+)/, label: 'Monthly Planner' },
      { pattern: /Month Cutting\s*:\s*(.+)/, label: 'Month Cutting' },
      { pattern: /Cover Colours?\s*:\s*(.+)/, label: 'Cover Colors' },
    ];

    for (const line of lines) {
      for (const { pattern, label } of specPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          if (!specs.some((s) => s.label === label)) {
            specs.push({ label, value });
          }
        }
      }
    }

    return specs;
  };

  const parseNotes = (description: string): string[] => {
    if (!description) return [];
    const notes: string[] = [];

    if (description.includes('COD facility not available')) {
      notes.push('* COD facility not available for this product *');
    }
    if (description.includes('minimum order quantity restriction')) {
      notes.push('*This product has minimum order quantity restriction.');
    }
    if (description.includes('Pen Charges Extra')) {
      notes.push('** Pen Charges Extra');
    }
    if (description.includes('less than MOQ')) {
      notes.push('** If your order quantity is little less than MOQ then please write us.');
    }

    return notes;
  };

  const highlights = parseHighlights(product.description);
  const fromFeatures = specsFromFeatures(product.features);
  const specifications =
    fromFeatures.length > 0 ? fromFeatures : parseSpecifications(product.description);
  const notes = parseNotes(product.description);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mb-4">
          <p className="text-sm text-gray-600">
            SKU: <span className="font-semibold text-gray-900">{generateSKU(product.id)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">0 Review(s)</span>
          <span className="text-gray-400">|</span>
          <button className="text-sm text-[#0F172A] hover:underline">
            Write a review
          </button>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Our Price</p>
          {typeof product.minPrice === 'number' && product.minPrice !== null ? (
            <div className="flex items-baseline gap-2">
              <p className="text-4xl lg:text-5xl font-bold text-red-600">
                ₹{product.minPrice.toLocaleString()}
              </p>
              <span className="text-sm text-gray-500 font-medium">/ piece</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-700">Price on Request</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-semibold text-amber-800">
            <span>Minimum Order Quantity (MOQ):</span>
            <span className="font-bold">{moq} units</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[0.65rem] uppercase tracking-[0.25em] font-medium text-gray-400 mb-4">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag, index) => {
                const variant = TAG_VARIANTS[index % TAG_VARIANTS.length];
                return (
                  <span
                    key={`${tag}-${index}`}
                    className={`group inline-flex items-center gap-2 ${variant.bg} ${variant.border} border px-4 py-2 rounded-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}
                  >
                    <span
                      className="w-1 h-1 rounded-full transition-transform duration-200 group-hover:scale-125"
                      style={{ backgroundColor: variant.accent }}
                      aria-hidden
                    />
                    <span className="text-[0.8125rem] font-medium text-gray-700 tracking-tight">
                      {tag}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {highlights && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Highlights</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {highlights}
            </p>
          </div>
        )}

        {specifications.length > 0 && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <div className="divide-y divide-gray-200">
              {specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-sm font-semibold text-gray-700">{spec.label} :</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{spec.value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="space-y-2 mb-6">
            {notes.map((note, idx) => (
              <p key={idx} className="text-xs text-red-600">
                {note}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 min-w-[80px]">
              Quantity:
            </span>
            <div className="inline-flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(moq, prev - 1))}
                disabled={quantity <= moq}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 text-gray-700 font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={moq}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? moq : Math.max(moq, val));
                }}
                className="w-24 text-center font-bold text-gray-900 focus:outline-hidden py-2 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              (Minimum order: {moq} units)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                addToCart(
                  {
                    id: product.id,
                    name: product.name,
                    image: product.imageUrl || '',
                    price: product.minPrice || 0,
                    moq,
                    category: product.category,
                  },
                  quantity,
                );
                router.push('/cart');
              }}
              className="flex-1 flex items-center justify-center gap-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-base shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={() => toggleFavourite(product.id)}
              className={`flex items-center justify-center gap-2 sm:w-auto px-6 py-4 rounded-lg font-semibold border-2 transition-all duration-200 cursor-pointer ${
                isFav
                  ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : 'bg-white border-[#0F172A] text-[#0F172A] hover:bg-slate-50'
              }`}
              aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-sm font-medium">{isFav ? 'Favourited' : 'Add to Favourites'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
