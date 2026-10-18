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
      className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] border border-emerald-300/40 shadow-lg overflow-hidden bg-[#eaf6ee] transition-all"
    >
      {/* 
        DESKTOP & TABLET PANORAMIC LAYOUT (Side-by-side matching IMAGE 1)
        Left: Badge, Bengali Headline, Description, CTA button, Publisher/Affiliate info, and tilted 'Earn, Learn, Grow!'
        Right: Standing student boy with glasses, thumbs up, book, tree & park illustration
      */}
      <div className="relative w-full min-h-[300px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] flex flex-col justify-center overflow-hidden">
        
        {/* Scenic Background Illustration spanning across the card */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <picture className="w-full h-full">
            <img 
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/hero-banner-boy.jpg`} 
              alt="eBookBazar হিরো ব্যানার" 
              width={1280}
              height={720}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-right-bottom sm:object-right transition-transform duration-700"
            />
          </picture>

          {/* Soft Left-to-Right Gradient Scrim to ensure 100% crystal-clear readability for Bengali text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#dcf0fa]/95 via-[#eaf7ee]/90 sm:via-[#eaf7ee]/80 to-transparent sm:to-transparent/10" />
        </div>

        {/* Content Container (Grid / Flex) */}
        <div className="relative z-10 w-full p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            
            {/* LEFT COLUMN: Text Content & CTAs (7 cols on md, 8 cols on lg) */}
            <div className="md:col-span-7 lg:col-span-8 space-y-2.5 sm:space-y-3.5 md:space-y-4 max-w-2xl text-left">
              
              {/* Badge: 📖 EBOOKBAZAR SPECIAL */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-xl bg-[#FACC15] text-slate-950 text-[11px] sm:text-xs md:text-sm font-black shadow-xs tracking-wide border border-amber-500/40">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950" />
                <span>EBOOKBAZAR SPECIAL</span>
              </div>

              {/* Main Headline: পড়ুন, শিখুন, এগিয়ে যান! */}
              <div className="relative">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[46px] xl:text-[50px] font-black tracking-tight leading-[1.18] drop-shadow-2xs">
                  <span className="text-[#00563F]">পড়ুন, শিখুন, </span>
                  <span className="text-[#F59E0B]">এগিয়ে যান!</span>
                </h1>
              </div>

              {/* Supporting Bengali Description */}
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-800 font-medium leading-relaxed max-w-xl">
                আপনার পছন্দের বাংলা eBook কিনুন, নতুন দক্ষতা শিখুন এবং নিজের জ্ঞানকে আরও সমৃদ্ধ করুন।
              </p>

              {/* CTA Row: eBook দেখুন button + Divider + Publisher / Affiliate Link */}
              <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                
                {/* Primary Button: eBook দেখুন → */}
                <button
                  type="button"
                  onClick={onExploreEbooks}
                  className="bg-[#00563F] hover:bg-[#004230] text-white font-black text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-5 sm:px-7 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer group"
                >
                  <span>eBook দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Vertical Divider (Hidden on very narrow mobile screens) */}
                <div className="hidden sm:block h-8 w-px bg-slate-300/80" />

                {/* Secondary Publishing & Affiliate info */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-bold text-slate-800">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left leading-snug">
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
            </div>

            {/* CENTER / FLOATING TILTED SLOGAN: "Earn, Learn, Grow!" matching IMAGE 1 */}
            <div className="hidden lg:flex md:col-span-5 lg:col-span-4 justify-start items-center relative pointer-events-none select-none">
              <div className="transform -rotate-[14deg] -translate-x-6 xl:-translate-x-12 -translate-y-4">
                <span className="font-extrabold text-2xl xl:text-3xl text-[#047857] tracking-wide block drop-shadow-sm font-sans" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Earn, Learn,
                </span>
                <span className="font-black text-3xl xl:text-4xl text-[#059669] tracking-wider block drop-shadow-sm ml-4 font-sans" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Grow!
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
});
