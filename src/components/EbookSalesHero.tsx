import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface EbookSalesHeroProps {
  onExploreEbooks: () => void;
  onSellEbook?: () => void;
  onViewAffiliate?: () => void;
}

export const EbookSalesHero: React.FC<EbookSalesHeroProps> = React.memo(({
  onExploreEbooks,
  onViewAffiliate
}) => {
  return (
    <section 
      aria-label="eBookBazar হিরো ব্যানার" 
      className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] border border-emerald-300/60 shadow-lg overflow-hidden bg-[#e4f6eb] select-none transition-all"
    >
      {/* 
        PANORAMIC HERO BANNER MATCHING VISUAL TARGET:
        1. Full background student illustration on the right side (backpack, casual green shirt, book in hand, smiling expression).
        2. Soft gradient overlay on left to guarantee crystal clear readability of Bengali text and buttons.
        3. Removed 'EBOOKBAZAR SPECIAL' badge.
        4. Bengali Headline: 'পড়ুন, শিখুন, এগিয়ে যান!' (Dark green + Golden yellow, Hind Siliguri font).
        5. Exact Description placed directly under headline.
        6. Two CTA buttons: 'eBook দেখুন' (solid green) & 'Affiliate দেখুন' (outlined with green border).
        7. Affiliate callout placed beneath the CTA buttons.
        8. Uncut student figure on desktop and mobile.
      */}
      
      {/* 1. Full Panoramic Background Scene with student figure */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <img 
          src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/hero-banner-boy.jpg`} 
          alt="eBookBazar শিক্ষার্থী ইলাস্ট্রেশন" 
          width={1376}
          height={768}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-[88%_12%] sm:object-[86%_16%] md:object-right"
        />
        {/* Soft Left Legibility Overlay: Blends seamlessly before reaching the student illustration */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#dcf0fa]/95 via-[#eaf7ee]/92 sm:via-[#eaf7ee]/85 to-transparent w-full sm:w-[72%] md:w-[62%] lg:w-[56%]" />
      </div>

      {/* 2. Hero Interactive Content Layer */}
      <div className="relative z-10 w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[390px] xl:min-h-[430px] flex items-center">
        
        {/* LEFT COLUMN: Text Content & Actions */}
        <div className="w-[72%] sm:w-[62%] md:w-[58%] lg:w-[54%] p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex flex-col justify-center space-y-2.5 sm:space-y-3.5 md:space-y-4 text-left">
          
          {/* Main Headline: পড়ুন, শিখুন, এগিয়ে যান! */}
          <div className="relative">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[42px] xl:text-[48px] font-black tracking-tight leading-[1.2] drop-shadow-xs font-['Hind_Siliguri']">
              <span className="text-[#00563F] inline-block mr-1.5 sm:mr-2">পড়ুন, শিখুন,</span>
              <span className="text-[#D97706] sm:text-[#B45309] lg:text-[#D97706] inline-block font-black" style={{ color: '#EAB308', textShadow: '0 1px 2px rgba(0,0,0,0.12)' }}>
                এগিয়ে যান!
              </span>
            </h1>
          </div>

          {/* Supporting Bengali Description directly beneath headline */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 font-bold leading-relaxed max-w-md lg:max-w-lg font-['Hind_Siliguri']">
            আপনার পছন্দের বাংলা eBook কিনুন, নতুন দক্ষতা শিখুন এবং নিজের জ্ঞানকে আরও সমৃদ্ধ করুন।
          </p>

          {/* CTA Row: Button 1 (eBook দেখুন) + Button 2 (Affiliate দেখুন) */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
            
            {/* Button 1: eBook দেখুন (Solid emerald green) */}
            <button
              type="button"
              onClick={onExploreEbooks}
              className="bg-[#00563F] hover:bg-[#004230] text-white font-extrabold text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-7 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer group shrink-0 font-['Hind_Siliguri']"
            >
              <span>eBook দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Button 2: Affiliate দেখুন (Outlined with green border) */}
            <button
              type="button"
              onClick={onViewAffiliate}
              className="border-2 border-[#00563F] bg-white/90 hover:bg-emerald-50 text-[#00563F] font-extrabold text-xs sm:text-sm md:text-base lg:text-lg py-1.5 sm:py-2 md:py-2.5 px-3.5 sm:px-5 md:px-6 rounded-full shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0 font-['Hind_Siliguri']"
            >
              <span>Affiliate দেখুন</span>
            </button>
          </div>

          {/* Affiliate Highlight / Info Callout beneath CTA Buttons */}
          <div className="pt-1 flex items-center gap-1.5 sm:gap-2 text-slate-800">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] shrink-0" />
            <div className="text-[11px] sm:text-xs md:text-sm lg:text-[15px] font-bold text-slate-800 leading-snug">
              <span className="text-[#00563F] font-black">eBookBazar এর সাথে আয় করুন, শিখুন এবং এগিয়ে যান!</span>
              <span className="hidden md:inline text-slate-500 font-semibold ml-1.5">
                (Earn, Learn and Grow with eBookBazar!)
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
});
