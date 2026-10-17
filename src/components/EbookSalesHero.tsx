import React from 'react';
import { ArrowRight, UserCheck, Handshake, Sparkles, BookOpen } from 'lucide-react';

interface EbookSalesHeroProps {
  onExploreEbooks: () => void;
  onSellEbook?: () => void;
  onViewAffiliate?: () => void;
}

export const EbookSalesHero: React.FC<EbookSalesHeroProps> = React.memo(({
  onExploreEbooks,
  onSellEbook,
  onViewAffiliate
}) => {
  return (
    <section 
      aria-label="eBookBazar স্পেশাল হিরো ব্যানার" 
      className="relative w-full rounded-[28px] sm:rounded-[36px] border-2 border-emerald-400/30 shadow-xl overflow-hidden bg-gradient-to-r from-[#dcf0fa] via-[#eaf7ee] to-[#dff3e5] transition-all"
    >
      {/* Decorative Natural Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[420px] md:min-h-[460px]">
        {/* LEFT COLUMN: Texts, Headline, Badges, CTAs, and Links (7 cols on Desktop) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 lg:p-12 space-y-4 sm:space-y-5 text-left z-20">
          {/* Badge: 📚 EBOOKBAZAR SPECIAL */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-sm tracking-wide border border-amber-500/40">
            <BookOpen className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>EBOOKBAZAR SPECIAL</span>
          </div>

          {/* Main Headline: পড়ুন, শিখুন, এগিয়ে যান! */}
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-[#0d4529] tracking-tight leading-[1.2] drop-shadow-2xs">
              <span className="block text-[#0b5430] flex items-center gap-2 flex-wrap">
                পড়ুন, শিখুন,
                <span className="inline-flex items-center text-emerald-600 text-2xl sm:text-3xl animate-bounce" title="Learn & Grow">
                  🍃
                </span>
              </span>
              <span className="block text-amber-500 flex items-center gap-2 flex-wrap mt-0.5">
                এগিয়ে যান!
                <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/70 uppercase tracking-widest">
                  Earn, Learn, Grow!
                </span>
              </span>
            </h1>
          </div>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-slate-700 font-medium leading-relaxed max-w-xl">
            আপনার পছন্দের বাংলা eBook কিনুন, নতুন দক্ষতা শিখুন এবং নিজের জ্ঞানকে আরও সমৃদ্ধ করুন।
          </p>

          {/* Primary CTA Button: eBook দেখুন → */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onExploreEbooks}
              className="bg-[#054b29] hover:bg-[#03341c] text-white font-black text-sm sm:text-base py-3 sm:py-3.5 px-7 sm:px-8 rounded-full shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer group"
            >
              <span>eBook দেখুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Secondary Promotional Links (Seller & Affiliate) */}
          <div className="pt-2 border-t border-emerald-700/15 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-800">
            {/* Link 1: নিজের eBook প্রকাশ করুন */}
            <button
              type="button"
              onClick={onSellEbook}
              className="flex items-center gap-2 hover:text-[#0b5430] transition text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="group-hover:underline">নিজের eBook প্রকাশ করুন</span>
            </button>

            {/* Link 2: অথবা Affiliate Program সম্পর্কে জানুন */}
            <button
              type="button"
              onClick={onViewAffiliate}
              className="flex items-center gap-2 hover:text-[#0b5430] transition text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Handshake className="w-4 h-4" />
              </div>
              <span className="group-hover:underline">অথবা Affiliate Program সম্পর্কে জানুন।</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Character with glasses reading under the tree (5 cols on Desktop) */}
        <div className="lg:col-span-5 relative w-full h-full min-h-[280px] sm:min-h-[340px] lg:min-h-[460px] flex items-end justify-center lg:justify-end overflow-hidden">
          {/* Flipped horizontally to match the user's reference mockup with boy on the right facing left */}
          <picture className="w-full h-full flex items-end justify-center lg:justify-end">
            <img 
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''}/hero-banner-boy.jpg`} 
              alt="eBookBazar চরিত্র বই পড়ছে"
              width={800}
              height={500}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center lg:object-right transition-transform duration-500 transform -scale-x-100 max-h-[460px]"
            />
          </picture>

          {/* Soft gradient blend on the left edge of the image on desktop */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#eaf7ee] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
});
