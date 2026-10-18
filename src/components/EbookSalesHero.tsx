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
      className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] border border-emerald-300/60 shadow-md overflow-hidden bg-gradient-to-r from-[#dcf0fa] via-[#eaf7ee] to-[#e4f6eb] transition-all"
    >
      {/* 
        PANORAMIC HERO BANNER EXACTLY MATCHING REFERENCE IMAGE 1:
        - Left: Yellow badge, Bengali headline, description, CTA button, and inline affiliate info
        - Center: Tilted 'Earn, Learn, Grow!' slogan with golden brush underline
        - Right: Cheerful student boy with round glasses, green hoodie, thumbs up, and book under oak tree
        - Zero extra bottom strip; announcement marquee sits directly underneath
      */}
      <div className="flex flex-row items-stretch min-h-[190px] sm:min-h-[240px] md:min-h-[320px] lg:min-h-[380px] xl:min-h-[420px] w-full">
        
        {/* LEFT COLUMN: Text Content & CTAs */}
        <div className="w-[62%] sm:w-[58%] md:w-[60%] lg:w-[62%] p-3 sm:p-5 md:p-7 lg:p-10 xl:p-12 flex flex-col justify-center space-y-2 sm:space-y-3 md:space-y-4 text-left relative z-10 shrink-0">
          
          {/* Badge: 📖 EBOOKBAZAR SPECIAL */}
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#FACC15] text-slate-950 text-[10px] sm:text-xs md:text-sm font-black shadow-xs tracking-wide border border-amber-500/40 w-fit">
            <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 text-slate-950 shrink-0" />
            <span>EBOOKBAZAR SPECIAL</span>
          </div>

          {/* Main Headline: পড়ুন, শিখুন, এগিয়ে যান! */}
          <div className="relative">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[40px] xl:text-[46px] font-black tracking-tight leading-[1.18] drop-shadow-2xs">
              <span className="text-[#00563F] block sm:inline">পড়ুন, শিখুন, </span>
              <span className="text-[#F59E0B] block sm:inline">এগিয়ে যান!</span>
            </h1>
          </div>

          {/* Supporting Bengali Description */}
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-slate-700 font-medium leading-relaxed max-w-md lg:max-w-lg line-clamp-2 sm:line-clamp-none">
            আপনার পছন্দের বাংলা eBook কিনুন, নতুন দক্ষতা শিখুন এবং নিজের জ্ঞানকে আরও সমৃদ্ধ করুন।
          </p>

          {/* CTA Row: eBook দেখুন button + Divider + Publisher / Affiliate Link */}
          <div className="pt-0.5 sm:pt-1 md:pt-2 flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 md:gap-4">
            
            {/* Primary Button: eBook দেখুন → */}
            <button
              type="button"
              onClick={onExploreEbooks}
              className="bg-[#00563F] hover:bg-[#004230] text-white font-black text-[11px] sm:text-xs md:text-sm lg:text-base py-1.5 sm:py-2.5 md:py-3 px-3.5 sm:px-5 md:px-7 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer group shrink-0"
            >
              <span>eBook দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Vertical Divider (Desktop/tablet only) */}
            <div className="hidden sm:block h-7 w-px bg-slate-300/80 shrink-0" />

            {/* Secondary Publishing & Affiliate info */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-800">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <button
                  type="button"
                  onClick={onSellEbook}
                  className="hover:text-[#00563F] hover:underline transition text-left cursor-pointer"
                >
                  নিজের eBook প্রকাশ করুন অথবা
                </button>
                <button
                  type="button"
                  onClick={onViewAffiliate}
                  className="text-emerald-800 hover:text-emerald-950 hover:underline transition text-left cursor-pointer font-black"
                >
                  Affiliate Program সম্পর্কে জানুন।
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP TILTED SLOGAN: "Earn, Learn, Grow!" matching REFERENCE IMAGE 1 */}
          <div className="hidden lg:block absolute right-0 xl:right-4 top-[44%] -translate-y-1/2 pointer-events-none select-none z-20">
            <div className="transform -rotate-[12deg] text-center">
              <span className="font-extrabold text-2xl xl:text-3xl text-[#00563F] tracking-wide block drop-shadow-2xs font-sans">
                Earn, Learn,
              </span>
              <span className="font-black text-3xl xl:text-4xl text-[#00563F] tracking-wider block drop-shadow-2xs font-sans">
                Grow!
              </span>
              {/* Golden Yellow Brush Underline */}
              <div className="w-20 xl:w-24 h-1.5 bg-[#FACC15] rounded-full mx-auto mt-0.5 transform -rotate-1 shadow-2xs" />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Dedicated Student Cartoon Illustration (Permanently on the Right side) */}
        <div className="w-[38%] sm:w-[42%] md:w-[40%] lg:w-[38%] relative min-h-full self-stretch overflow-hidden bg-[#e4f6eb] shrink-0 flex items-stretch">
          {/* Subtle blend fade on the left edge of the illustration */}
          <div className="absolute inset-y-0 left-0 w-4 sm:w-8 md:w-16 bg-gradient-to-r from-[#eaf7ee] to-transparent pointer-events-none z-10" />
          <picture className="w-full h-full block">
            <img 
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/hero-banner-boy.jpg`} 
              alt="eBookBazar হিরো ব্যানার" 
              width={800}
              height={500}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-[84%_18%] sm:object-[83%_center] lg:object-[85%_center] transition-transform duration-500"
            />
          </picture>
        </div>

      </div>
    </section>
  );
});
