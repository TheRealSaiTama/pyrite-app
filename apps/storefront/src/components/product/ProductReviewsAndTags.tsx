'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Tag } from 'lucide-react';

interface ProductReviewsAndTagsProps {
  productName: string;
  tags?: string[] | string | null;
}

export default function ProductReviewsAndTags({
  productName,
  tags: rawTags,
}: ProductReviewsAndTagsProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'tags'>('reviews');

  const displayTags = useMemo(() => {
    const tags = Array.isArray(rawTags)
      ? rawTags.filter(Boolean).map(String)
      : typeof rawTags === 'string'
        ? rawTags.split(',').map((tag) => tag.replace(/\s+/g, ' ').trim()).filter(Boolean)
        : [];
    return tags.length > 0 ? tags : [
      'corporate gifts',
      'customized diary with pen',
      'executive planner',
      'premium gift set',
      'new year diaries',
      'bulk stationery',
    ];
  }, [rawTags]);

  return (
    <section id="reviews-section" className="mt-12 mb-16 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2.5 pb-3.5 px-2 font-bold text-base transition-colors relative cursor-pointer ${
            activeTab === 'reviews' ? 'text-[#0F172A]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Reviews</span>
          {activeTab === 'reviews' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-2.5 pb-3.5 px-2 font-bold text-base transition-colors relative cursor-pointer ${
            activeTab === 'tags' ? 'text-[#0F172A]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Product Tags</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
            {displayTags.length}
          </span>
          {activeTab === 'tags' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A]" />
          )}
        </button>
      </div>

      {activeTab === 'reviews' ? (
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-gray-900 mb-1">No customer reviews yet</h3>
          <p className="text-sm text-gray-600">
            Reviews for {productName} will appear here once they are available.
          </p>
        </div>
      ) : (
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Product Tags</h3>
            <p className="text-xs text-gray-500">
              Keywords and categories associated with {productName}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {displayTags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-block px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-sm font-normal select-text cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
