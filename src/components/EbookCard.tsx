import React from 'react';
import { ShoppingCart, Eye, Zap, BookOpen, Crown, ShoppingBag, Share2 } from 'lucide-react';
import { Ebook, EbookRatingSummary } from '../types';
import { useCart } from '../context/CartContext';
import { isEbookAdminOwned } from '../utils/ebookOwnership';
import { StarRating } from './StarRating';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface EbookCardProps {
  ebook: Ebook;
  onViewDetails: (ebook: Ebook) => void;
  onBuyNow: (ebook: Ebook) => void;
  onShare?: (ebook: Ebook) => void;
  ratingSummary?: EbookRatingSummary;
}

export const EbookCard: React.FC<EbookCardProps> = React.memo(({ ebook, onViewDetails, onBuyNow, onShare, ratingSummary }) => {
  const { addToCart } = useCart();
  const regularPrice = ebook.regularPrice || (ebook.discountPrice && ebook.discountPrice < ebook.price ? ebook.price : ebook.price);
  const salePrice = ebook.discountPrice ? Math.min(ebook.discountPrice, ebook.price) : (ebook.regularPrice && ebook.regularPrice > ebook.price ? ebook.price : ebook.price);
  const oldPrice = Math.max(regularPrice, ebook.price);
  const isDiscounted = oldPrice > salePrice;
  const isAdminBook = isEbookAdminOwned(ebook);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: ebook.id,
      title: ebook.title,
      author: ebook.author,
      coverUrl: ebook.coverUrl,
      price: salePrice,
      qty: 1,
      sellerId: ebook.sellerId,
      sellerName: ebook.sellerName,
      sellerEmail: ebook.sellerEmail,
      sellerReferralCode: ebook.sellerReferralCode,
      isSeller: !isAdminBook
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(ebook);
  };

  return (
    <div 
      onClick={() => onViewDetails(ebook)}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer w-full min-w-0 max-w-full"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
        <img 
          src={getOptimizedImageUrl(ebook.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', { width: 320, height: 426, quality: 72 })} 
          alt={ebook.title} 
          width={300}
          height={400}
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 max-w-full"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 sm:gap-1.5 z-10 max-w-[calc(100%-1rem)]">
          {isAdminBook ? (
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md border border-amber-300 flex items-center gap-1 sm:gap-1.5 tracking-wide truncate">
              <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
              <span className="truncate">অ্যাডমিন ই-বুক</span>
            </span>
          ) : (
            <span className="bg-indigo-600 text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md border border-indigo-400 flex items-center gap-1 sm:gap-1.5 tracking-wide truncate">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">সেলার ই-বুক</span>
            </span>
          )}
          <span className="bg-slate-950/90 backdrop-blur-md text-emerald-300 text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg shadow-sm w-fit border border-emerald-500/30 truncate">
            {ebook.category || 'সাধারণ'}
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>বিস্তারিত</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3.5 min-w-0 w-full">
        <div className="min-w-0">
          {isAdminBook ? (
            <div className="mb-1.5 sm:mb-2 min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 sm:py-1 rounded-lg max-w-full">
                <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-500 shrink-0" />
                <span className="truncate">অ্যাডমিন ই-বুক (বোনাস ৳৫০)</span>
              </span>
            </div>
          ) : (
            <div className="mb-1.5 sm:mb-2 min-w-0">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-indigo-950 bg-indigo-50 border border-indigo-200 px-2 py-0.5 sm:py-1 rounded-lg max-w-full">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">সেলার: {ebook.sellerName || 'ভেরিফাইড'}</span>
              </span>
            </div>
          )}
          <h3 className="font-black text-slate-900 text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {ebook.title}
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-600 mt-1 sm:mt-1.5 truncate font-bold">
            লেখক: <span className="text-slate-800">{ebook.author || 'অজ্ঞাতনামা'}</span>
          </p>
          {ebook.sellerName && !isAdminBook && (
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate font-medium">
              সেলার: {ebook.sellerName}
            </p>
          )}

          {/* 5-Star Rating */}
          <div className="mt-1.5 sm:mt-2 pt-0.5">
            <StarRating
              rating={ratingSummary?.averageRating || 0}
              totalRatings={ratingSummary?.totalRatings || 0}
              size="xs"
              compact={false}
            />
          </div>
        </div>

        <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2 sm:space-y-3 min-w-0">
          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-700">
                ৳{salePrice}
              </span>
              {isDiscounted && (
                <span className="text-[11px] sm:text-sm text-slate-400 line-through font-bold">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            {isDiscounted && (
              <span className="bg-rose-50 text-rose-700 text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-rose-200">
                সেভ ৳{oldPrice - salePrice}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs md:text-sm py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer min-w-0"
                title="কার্টে যোগ করুন"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">কার্ট</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-[11px] sm:text-xs md:text-sm py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer min-w-0"
                title="সরাসরি কিনুন"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                <span className="truncate">কিনুন</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(ebook);
                }}
                className="py-1 sm:py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1 cursor-pointer min-w-0"
                title="বইয়ের বিস্তারিত বিবরণ"
              >
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">বিস্তারিত</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShare) onShare(ebook);
                }}
                className="py-1 sm:py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 min-w-0"
                title="eBook বন্ধুদের সাথে শেয়ার করুন"
              >
                <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">শেয়ার</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
