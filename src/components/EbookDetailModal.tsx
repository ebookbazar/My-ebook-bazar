import React from 'react';
import { X, ShoppingCart, Zap, BookOpen, Star, User, Tag, ShieldCheck, Crown, ShoppingBag } from 'lucide-react';
import { Ebook } from '../types';
import { useCart } from '../context/CartContext';
import { AdsterraSlot } from './AdsterraSlot';

interface EbookDetailModalProps {
  ebook: Ebook | null;
  onClose: () => void;
  onBuyNow: (ebook: Ebook) => void;
  onOpenPreview?: (url: string, title: string) => void;
}

export const EbookDetailModal: React.FC<EbookDetailModalProps> = ({
  ebook,
  onClose,
  onBuyNow,
  onOpenPreview,
}) => {
  const { addToCart } = useCart();
  if (!ebook) return null;

  const regularPrice = ebook.regularPrice || (ebook.discountPrice && ebook.discountPrice < ebook.price ? ebook.price : ebook.price);
  const salePrice = ebook.discountPrice ? Math.min(ebook.discountPrice, ebook.price) : (ebook.regularPrice && ebook.regularPrice > ebook.price ? ebook.price : ebook.price);
  const oldPrice = Math.max(regularPrice, ebook.price);
  const isDiscounted = oldPrice > salePrice;

  const handleAddToCart = () => {
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
      isSeller: ebook.isSeller ?? false
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-base md:text-lg">ই-বুক বিস্তারিত বিবরণ</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Cover */}
          <div className="space-y-3">
            <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-md border border-slate-200">
              <img 
                src={ebook.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'} 
                alt={ebook.title} 
                className="w-full h-full object-cover"
              />
            </div>
            {ebook.pdfUrl && onOpenPreview && (
              <button
                type="button"
                onClick={() => onOpenPreview(ebook.pdfUrl, ebook.title)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-sm py-3 rounded-2xl border border-emerald-300 flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>বই প্রিভিউ পড়ুন</span>
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {(!ebook.sellerId || ebook.sellerId === 'ADMIN' || !ebook.isSeller) ? (
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>অ্যাডমিন ই-বুক (৫০৳ রেফারেল বোনাস)</span>
                  </span>
                ) : (
                  <span className="bg-indigo-600 text-white text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl shadow-md border-2 border-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShoppingBag className="w-4 h-4" />
                    <span>সেলার ই-বুক</span>
                  </span>
                )}
                <span className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black px-3 py-1 rounded-full">
                  {ebook.category}
                </span>
                {ebook.level && (
                  <span className="bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
                    {ebook.level}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {ebook.title}
              </h2>

              <p className="text-sm md:text-base text-slate-700 font-bold">
                লেখক: <span className="text-slate-950 font-black">{ebook.author || 'অজ্ঞাতনামা'}</span>
              </p>

              {ebook.sellerName && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  প্রকাশক / বিক্রেতা: <span className="font-bold text-slate-700">{ebook.sellerName}</span>
                </p>
              )}

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 py-2">
                {isDiscounted && (
                  <span className="text-sm sm:text-base text-slate-400 line-through font-bold">
                    ৳{oldPrice}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  ৳{salePrice}
                </span>
                {isDiscounted && (
                  <span className="bg-rose-100 text-rose-700 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg">
                    সেভ ৳{oldPrice - salePrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <h4 className="font-black text-xs sm:text-sm text-slate-800 mb-2">বইয়ের বিবরণ:</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
                  {ebook.description || 'এই বইটির জন্য বিস্তারিত বিবরণ যোগ করা হয়নি।'}
                </p>
              </div>

              {/* Referral Earning Rule Badge */}
              <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                !ebook.isSeller 
                  ? 'bg-amber-50 border-amber-300 text-amber-950' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-950'
              }`}>
                {!ebook.isSeller ? (
                  <p>
                    ⭐ <b>৫০৳ রেফারেল কমিশন প্রযোজ্য:</b> এটি অ্যাডমিন ই-বুক। কোনো ক্রেতা আপনার রেফারেল কোড ব্যবহার করে এটি কিনলে এবং অ্যাডমিন অনুমোদন দিলে আপনার অ্যাকাউন্টে ৫০ টাকা জমা হবে।
                  </p>
                ) : (
                  <p>
                    ℹ️ <b>সেলার ই-বুক:</b> এটি সেলার কর্তৃক প্রকাশিত বই। নিয়ম অনুযায়ী সেলার ই-বুক ক্রয়ের ক্ষেত্রে কোনো রেফারেল কমিশন প্রযোজ্য নয়।
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 pt-1 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>অর্ডার অনুমোদনের পর সরাসরি লাইব্রেরি থেকে PDF ডাউনলোড ও পড়ার সুবিধা</span>
              </div>

              {/* Adsterra eBook Details Ad Placement */}
              <AdsterraSlot placement="ebookDetails" className="my-2" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-2xl transition shadow flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্টে রাখুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBuyNow(ebook);
                }}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm py-3 rounded-2xl transition shadow flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>এখনই কিনুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
