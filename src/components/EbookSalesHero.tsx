import React from 'react';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, Zap, Smartphone, CheckCircle, Star } from 'lucide-react';
import { Ebook } from '../types';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

interface EbookSalesHeroProps {
  ebooks: Ebook[];
  onExploreEbooks: () => void;
  onViewCurated: () => void;
  onSelectBook: (book: Ebook) => void;
}

export const EbookSalesHero: React.FC<EbookSalesHeroProps> = React.memo(({
  ebooks,
  onExploreEbooks,
  onViewCurated,
  onSelectBook
}) => {
  // Select up to 3 actual published books for the hero preview
  const showcaseBooks = (ebooks && ebooks.length > 0) ? ebooks.slice(0, 3) : [];

  return (
    <section 
      aria-label="eBookBazar সেলস হিরো ব্যানার" 
      className="relative bg-gradient-to-b from-white via-slate-50/60 to-emerald-50/20 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 sm:p-7 md:p-8 lg:p-9 transition-all"
    >
      {/* Subtle bookstore ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
        {/* LEFT COLUMN: Brand, H1, Description, CTAs, Trust Highlights (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-4.5 text-left">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs sm:text-sm font-bold tracking-tight shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>eBookBazar — আপনার শেখার ডিজিটাল ঠিকানা</span>
          </div>

          {/* Main H1 Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.25] sm:leading-[1.2]">
            শিখুন নতুন কিছু,{' '}
            <span className="text-[#15803d]">নিজের দক্ষতা বাড়ান</span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
            সহজ বাংলায় লেখা ব্যবহারিক eBook পড়ুন। অনলাইন ব্যবসা, প্রযুক্তি, ব্যক্তিগত অর্থব্যবস্থা
            এবং বাংলা গল্পের বই থেকে নিজের প্রয়োজনের বইটি বেছে নিন।
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Primary Button */}
            <button
              type="button"
              onClick={onExploreEbooks}
              className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-2xl shadow-md shadow-emerald-900/20 hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
              <span>eBook দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary Button */}
            <button
              type="button"
              onClick={onViewCurated}
              className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-2xl border-2 border-slate-200/90 hover:border-slate-300 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>জনপ্রিয় বইগুলো দেখুন</span>
            </button>
          </div>

          {/* Amazon-Inspired Trust Highlights Row */}
          <div className="pt-3 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-2xs p-2 rounded-xl border border-slate-200/60">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">তাৎক্ষণিক PDF এক্সেস</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-2xs p-2 rounded-xl border border-slate-200/60">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">১০০% নিরাপদ পেমেন্ট</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-2xs p-2 rounded-xl border border-slate-200/60 col-span-2 sm:col-span-1">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">মোবাইল ও কম্পিউটারে পাঠযোগ্য</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Amazon-Inspired Digital Bookstore Showcase (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
          {showcaseBooks.length > 0 ? (
            <div className="w-full max-w-lg bg-white/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-md">
              {/* Bookstore Showcase Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider">
                    জনপ্রিয় ডিজিটাল বইসমূহ
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                  ক্লিক করে বিস্তারিত দেখুন
                </span>
              </div>

              {/* 3 Real Book Covers - Bookstore Pedestal Showcase */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {showcaseBooks.map((book, idx) => {
                  const salePrice = book.discountPrice 
                    ? Math.min(book.discountPrice, book.price) 
                    : (book.regularPrice && book.regularPrice > book.price ? book.price : book.price);
                  const isFeaturedCenter = idx === 1;

                  return (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book)}
                      className={`group cursor-pointer bg-white rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-300 select-none ${
                        isFeaturedCenter ? 'shadow-md ring-1 ring-emerald-500/30' : 'shadow-xs'
                      }`}
                      title={`${book.title} — বিস্তারিত বিবরণ দেখতে ক্লিক করুন`}
                    >
                      {/* Realistic 3D Book Cover with Spine & Sheen */}
                      <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-slate-900 shadow-sm group-hover:shadow-md transition-shadow mb-2">
                        {/* Book Spine Highlight Effect */}
                        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none z-10" />
                        
                        {/* Soft Cover Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none z-10" />

                        {/* Real Cover Image */}
                        <img
                          src={getOptimizedImageUrl(book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', { width: 240, height: 336, quality: 75 })}
                          alt={book.title}
                          width={140}
                          height={196}
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="eager"
                        />

                        {/* Category Chip on Cover */}
                        <span className="absolute top-1.5 left-1.5 z-20 bg-slate-950/80 backdrop-blur-2xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs max-w-[85%] truncate">
                          {book.category || 'eBook'}
                        </span>

                        {/* Price Tag on Cover */}
                        <span className="absolute bottom-1.5 right-1.5 z-20 bg-emerald-800 text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm border border-emerald-600">
                          ৳{salePrice}
                        </span>
                      </div>

                      {/* Book Meta Details */}
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] sm:text-xs font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                          {book.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate font-medium">
                          {book.author || 'লেখক'}
                        </p>
                      </div>

                      {/* Quick Action Prompt */}
                      <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                        <span>বিস্তারিত</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span>ডিজিটাল বইয়ের সমাহার</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
