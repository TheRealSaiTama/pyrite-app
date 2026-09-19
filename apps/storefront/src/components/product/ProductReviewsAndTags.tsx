'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, Tag, CheckCircle2, User, Send, ThumbsUp } from 'lucide-react';

const TAG_VARIANTS = [
  { accent: '#0F172A', bg: 'bg-[#0F172A]/[0.04]', border: 'border-[#0F172A]/20', text: 'text-slate-800' },
  { accent: '#7c2d12', bg: 'bg-[#7c2d12]/[0.04]', border: 'border-[#7c2d12]/20', text: 'text-amber-900' },
  { accent: '#15803d', bg: 'bg-[#15803d]/[0.04]', border: 'border-[#15803d]/20', text: 'text-emerald-900' },
  { accent: '#6b21a8', bg: 'bg-[#6b21a8]/[0.04]', border: 'border-[#6b21a8]/20', text: 'text-purple-900' },
];

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified?: boolean;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Vikram Mehta',
    rating: 5,
    date: '2 weeks ago',
    title: 'Superb quality executive diaries',
    comment: 'Ordered 150 pieces with our company logo embossed on the front cover. The paper quality, leatherette finish, and packaging exceeded our expectations. Great for annual corporate gifting!',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Ananya Sharma',
    rating: 5,
    date: '1 month ago',
    title: 'Prompt delivery and flawless debossing',
    comment: 'Turnaround time was impressively fast. Everyone on our leadership team appreciated the smooth pen and calendar planner inserts.',
    verified: true,
  },
];

interface ProductReviewsAndTagsProps {
  productId: string | number;
  productName: string;
  tags?: string[] | string | null;
}

export default function ProductReviewsAndTags({
  productId,
  productName,
  tags: rawTags,
}: ProductReviewsAndTagsProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'tags'>('reviews');

  // Parse tags
  const tags = useMemo(() => {
    if (!rawTags) return [] as string[];
    if (Array.isArray(rawTags)) {
      return rawTags.filter(Boolean).map(String);
    }
    return rawTags
      .split(',')
      .map((t) => t.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }, [rawTags]);

  const displayTags = tags.length > 0 ? tags : [
    'corporate gifts',
    'customized diary with pen',
    'executive planner',
    'premium gift set',
    'new year diaries',
    'bulk stationery',
  ];

  // Reviews state with localStorage persistence
  const storageKey = `pyrite_reviews_${productId}`;
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Form state
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
        }
      }
    } catch {
      // fallback to default reviews
    }
  }, [storageKey]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: formName.trim(),
      rating: formRating,
      date: 'Just now',
      title: formTitle.trim() || 'Verified purchase review',
      comment: formComment.trim(),
      verified: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormName('');
      setFormTitle('');
      setFormComment('');
      setFormSubmitted(false);
      setShowReviewForm(false);
    }, 1500);
  };

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <section id="reviews-section" className="mt-12 mb-16 pt-8 border-t border-gray-200">
      {/* Tabs Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2.5 pb-3.5 px-2 font-bold text-base transition-colors relative cursor-pointer ${
            activeTab === 'reviews'
              ? 'text-[#0F172A]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Reviews</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'reviews' ? 'bg-[#0F172A] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {reviews.length}
          </span>
          {activeTab === 'reviews' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-2.5 pb-3.5 px-2 font-bold text-base transition-colors relative cursor-pointer ${
            activeTab === 'tags'
              ? 'text-[#0F172A]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Product Tags</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            activeTab === 'tags' ? 'bg-[#0F172A] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {displayTags.length}
          </span>
          {activeTab === 'tags' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A]" />
          )}
        </button>
      </div>

      {/* Reviews Tab Content */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {/* Summary Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-none">
                  {avgRating}
                </div>
                <div className="text-xs text-slate-500 mt-1">out of 5.0</div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                <div className="flex items-center gap-1 mb-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(Number(avgRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Based on {reviews.length} customer review{reviews.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm((prev) => !prev)}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Write a Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900">Share Your Experience</h3>

              {/* Star Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormRating(star)}
                      className="p-1 focus:outline-hidden cursor-pointer"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || formRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-100 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-gray-600">
                    {hoverRating || formRating} Star{(hoverRating || formRating) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-hidden focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Excellent corporate gift!"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-hidden focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Share details about the diary quality, print finish, delivery, or custom branding..."
                  className="w-full rounded-lg border border-gray-300 p-3.5 text-sm text-gray-800 focus:outline-hidden focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={formSubmitted}
                  className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {formSubmitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Review Submitted!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <article
                key={rev.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 transition-all hover:border-slate-300 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{rev.author}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{rev.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Tags Tab Content */}
      {activeTab === 'tags' && (
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Keywords & Tags for {productName}
            </h3>
            <p className="text-xs text-gray-500">
              Click any tag below to find related gift sets, diaries, and merchandise across our store.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {displayTags.map((tag, index) => {
              const variant = TAG_VARIANTS[index % TAG_VARIANTS.length];
              return (
                <Link
                  key={`${tag}-${index}`}
                  href={`/shop?q=${encodeURIComponent(tag)}`}
                  className={`group inline-flex items-center gap-2.5 ${variant.bg} ${variant.border} border px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-transform duration-200 group-hover:scale-125"
                    style={{ backgroundColor: variant.accent }}
                    aria-hidden
                  />
                  <span className={`text-sm font-semibold ${variant.text}`}>
                    {tag}
                  </span>
                  <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity">
                    ↗
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
