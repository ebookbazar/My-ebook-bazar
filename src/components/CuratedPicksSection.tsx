import React from 'react';
import { Sparkles, Eye, ShoppingCart, Crown, ShoppingBag, ArrowRight } from 'lucide-react';
import { Ebook, EbookRatingSummary } from '../types';
import { useCart } from '../context/CartContext';
import { isEbookAdminOwned } from '../utils/ebookOwnership';
import { StarRating } from './StarRating';

interface CuratedPicksSectionProps {
  ebooks: Ebook[];
  onViewDetails: (ebook: Ebook) => void;
  onBuyNow: (ebook: Ebook) => void;
  ratingSummaries?: Record<string, EbookRatingSummary>;
}

export const CuratedPicksSection: React.FC<CuratedPicksSectionProps> = React.memo(({
  ebooks,
  onViewDetails,
  onBuyNow,
  ratingSummaries = {}
}) => {
  const { addToCart } = useCart();

  // Pick up to 3 real ebooks from Firebase
  const topPicks = (ebooks || []).slice(0, 3);

  if (topPicks.length === 0) return null;

  return (
    <section aria-label="আজকের বাছাই" className="space-y-4 md:space-y-5">
      {/* Section Header with Subtle Gold & Emerald Accent */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black tracking-wide mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>বিশেষ সংকলন</span>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2 sm:gap-2.5">
            <span>আজকের বাছাই</span>
            <span className="text-[#2563EB] font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-normal select-none">
              24
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
            পাঠকদের সর্বাধিক পছন্দের সেরা ৩টি ডিজিটাল বই
          </p>
        </div>
      </div>

      {/* 3 Curated Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {topPicks.map((book, idx) => {
          const regularPrice = book.regularPrice || (book.discountPrice && book.discountPrice < book.price ? book.price : book.price);
          const salePrice = book.discountPrice ? Math.min(book.discountPrice, book.price) : (book.regularPrice && book.regularPrice > book.price ? book.price : book.price);
          const oldPrice = Math.max(regularPrice, book.price);
          const isDiscounted = oldPrice > salePrice;
          const isAdminBook = isEbookAdminOwned(book);

          return (
            <div
              key={book.id}
              onClick={() => onViewDetails(book)}
              className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer subtle-card-hover overflow-hidden"
            >
              {/* Subtle Decorative Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600" />

              <div className="flex gap-4">
                {/* Book Cover */}
                <div className="relative w-24 sm:w-28 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/70">
                  <img
                    src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop'}
                    alt={book.title}
                    width={112}
                    height={150}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-400/30">
                    বাছাই #{idx + 1}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {isAdminBook ? (
                        <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-700 fill-amber-500" />
                          <span>অ্যাডমিন ই-বুক</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-indigo-600" />
                          <span>সেলার ই-বুক</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 truncate font-medium">
                      লেখক: <span className="text-slate-800 font-bold">{book.author || 'অজ্ঞাতনামা'}</span>
                    </p>
                    <div className="mt-1">
                      <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {book.category || 'সাধারণ'}
                      </span>
                    </div>

                    {/* 5-Star Rating */}
                    <div className="mt-2">
                      <StarRating
                        rating={ratingSummaries[book.id]?.averageRating || 0}
                        totalRatings={ratingSummaries[book.id]?.totalRatings || 0}
                        size="xs"
                        compact={false}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-black text-emerald-800">
                      ৳{salePrice}
                    </span>
                    {isDiscounted && (
                      <span className="text-xs text-slate-400 line-through font-bold">
                        ৳{oldPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(book);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>বিস্তারিত</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyNow(book);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 transition flex items-center justify-center gap-1 shadow-xs active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                  <span>কিনুন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
