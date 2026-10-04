import React from 'react';
import { ShoppingCart, Eye, Zap, BookOpen, Crown, ShoppingBag } from 'lucide-react';
import { Ebook, EbookRatingSummary } from '../types';
import { useCart } from '../context/CartContext';
import { isEbookAdminOwned } from '../utils/ebookOwnership';
import { StarRating } from './StarRating';

interface EbookCardProps {
  ebook: Ebook;
  onViewDetails: (ebook: Ebook) => void;
  onBuyNow: (ebook: Ebook) => void;
  ratingSummary?: EbookRatingSummary;
}

export const EbookCard: React.FC<EbookCardProps> = ({ ebook, onViewDetails, onBuyNow, ratingSummary }) => {
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
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img 
          src={ebook.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'} 
          alt={ebook.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isAdminBook ? (
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-black px-3 py-1 rounded-xl shadow-lg border-2 border-amber-300 flex items-center gap-1.5 tracking-wide">
              <Crown className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
              <span>অ্যাডমিন ই-বুক</span>
            </span>
          ) : (
            <span className="bg-indigo-600 text-white text-xs sm:text-sm font-black px-3 py-1 rounded-xl shadow-lg border-2 border-indigo-400 flex items-center gap-1.5 tracking-wide">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>সেলার ই-বুক</span>
            </span>
          )}
          <span className="bg-slate-950/90 backdrop-blur-md text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm w-fit border border-emerald-500/30">
            {ebook.category || 'সাধারণ'}
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 text-white text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3.5 h-3.5" />
          <span>বিস্তারিত</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {isAdminBook ? (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                <Crown className="w-4 h-4 text-amber-700 fill-amber-500 shrink-0" />
                <span>অ্যাডমিন ই-বুক (রেফারেল বোনাস ৳৫০)</span>
              </span>
            </div>
          ) : (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-950 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>সেলার ই-বুক ({ebook.sellerName || 'ভেরিফাইড সেলার'})</span>
              </span>
            </div>
          )}
          <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {ebook.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 truncate font-bold">
            লেখক: <span className="text-slate-800">{ebook.author || 'অজ্ঞাতনামা'}</span>
          </p>
          {ebook.sellerName && !isAdminBook && (
            <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
              সেলার: {ebook.sellerName}
            </p>
          )}

          {/* 5-Star Rating */}
          <div className="mt-2 pt-0.5">
            <StarRating
              rating={ratingSummary?.averageRating || 0}
              totalRatings={ratingSummary?.totalRatings || 0}
              size="xs"
              compact={false}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                ৳{salePrice}
              </span>
              {isDiscounted && (
                <span className="text-xs sm:text-sm text-slate-400 line-through font-bold">
                  ৳{oldPrice}
                </span>
              )}
            </div>
            {isDiscounted && (
              <span className="bg-rose-50 text-rose-700 text-xs font-black px-2 py-0.5 rounded-lg border border-rose-200">
                সেভ ৳{oldPrice - salePrice}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              title="কার্টে যোগ করুন"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>কার্ট</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              title="সরাসরি কিনুন"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>কিনুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
