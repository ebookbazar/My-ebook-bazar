import React from 'react';
import { 
  ArrowRight, 
  Sparkles,
  Download
} from 'lucide-react';
import { AppDownloadSettings } from '../types';

interface HomePrimaryNavCardsProps {
  onOpenEbooks: () => void;
  onOpenAffiliate: () => void;
  onOpenMembership: () => void;
  onOpenBlog: () => void;
  onOpenTools: () => void;
  onOpenAppDownload: () => void;
  appDownloadSettings: AppDownloadSettings;
}

export const HomePrimaryNavCards: React.FC<HomePrimaryNavCardsProps> = React.memo(({
  onOpenEbooks,
  onOpenAffiliate,
  onOpenMembership,
  onOpenBlog,
  onOpenTools,
  onOpenAppDownload,
  appDownloadSettings
}) => {
  return (
    <section aria-label="প্রধান সেবাসমূহ ও ক্যাটাগরি" className="space-y-3.5 sm:space-y-4">
      {/* 
        Reference Image Inspired Top Header Bar
        "সকল ক্যাটাগরি" - sleek, rounded, dark slate/emerald bar
      */}
      <div className="bg-[#0f291e] text-white rounded-2xl py-3 px-4 sm:px-6 shadow-sm border border-emerald-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-base sm:text-lg md:text-xl font-black tracking-tight">
            সকল ক্যাটাগরি
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-300/90 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>৬টি মূল ফিচার</span>
        </div>
      </div>

      {/* 
        Six Main Cards Grid:
        - 2 columns on mobile (exactly like the reference screenshot!)
        - 3 columns on tablet
        - 6 columns on desktop
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-4.5">
        
        {/* CARD 1: EBOOK */}
        <div 
          onClick={onOpenEbooks}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenEbooks(); }}
          className="group cursor-pointer bg-[#f8fafc] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98]"
        >
          <div className="flex flex-col items-center">
            {/* Centered High-Fidelity 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/70 border border-emerald-200/80 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Book Base */}
                <ellipse cx="36" cy="62" rx="26" ry="4" fill="#064e3b" fillOpacity="0.2" />
                <path d="M10 48C18 50 28 47 36 51C44 47 54 50 62 48V20C54 22 44 19 36 23C28 19 18 22 10 20V48Z" fill="#15803d" />
                <path d="M12 46C20 48 29 45 36 49C43 45 52 48 60 46V18C52 20 43 17 36 21C29 17 20 20 12 18V46Z" fill="#22c55e" />
                {/* Book Pages */}
                <path d="M14 43C21 45 29 42 36 46V16C29 12 21 15 14 13V43Z" fill="#f8fafc" />
                <path d="M58 43C51 45 43 42 36 46V16C43 12 51 15 58 13V43Z" fill="#ffffff" />
                <line x1="36" y1="16" x2="36" y2="46" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Spine bookmark ribbon */}
                <path d="M35 15L35 32L38 28L41 32L41 15" fill="#f59e0b" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition flex items-center justify-center gap-1.5">
              <span>📚</span>
              <span>eBook</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              আপনার পছন্দের eBook খুঁজুন ও কিনুন।
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEbooks();
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-[#15803d] text-emerald-800 hover:text-white font-black text-xs transition flex items-center justify-center gap-1 group/btn shadow-2xs"
            >
              <span>eBook দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: AFFILIATE PROGRAM */}
        <div 
          onClick={onOpenAffiliate}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenAffiliate(); }}
          className="group cursor-pointer bg-[#fffdfa] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98] relative overflow-hidden"
        >
          {/* Highlight Badge */}
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-tight">
            ৳৫০ কমিশন
          </div>

          <div className="flex flex-col items-center">
            {/* Centered 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shadow */}
                <ellipse cx="36" cy="62" rx="22" ry="4" fill="#78350f" fillOpacity="0.2" />
                {/* Gold Coin Stack */}
                <ellipse cx="36" cy="50" rx="20" ry="7" fill="#b45309" />
                <rect x="16" y="44" width="40" height="6" fill="#d97706" />
                <ellipse cx="36" cy="44" rx="20" ry="7" fill="#f59e0b" />
                <rect x="16" y="38" width="40" height="6" fill="#d97706" />
                <ellipse cx="36" cy="38" rx="20" ry="7" fill="#fcd34d" />
                <rect x="16" y="32" width="40" height="6" fill="#f59e0b" />
                <ellipse cx="36" cy="32" rx="20" ry="7" fill="#fbbf24" />
                {/* Top Glowing Coin */}
                <circle cx="36" cy="24" r="16" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="2" />
                <text x="36" y="30" fontSize="16" fontWeight="bold" fill="#78350f" textAnchor="middle">৳</text>
                <defs>
                  <linearGradient id="goldGrad" x1="20" y1="8" x2="52" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fef08a" />
                    <stop offset="0.5" stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#b45309" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition flex items-center justify-center gap-1.5">
              <span>💰</span>
              <span>Affiliate Program</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              eBook শেয়ার করে আয় করার সুযোগ তৈরি করুন।
            </p>

            {/* Promotional Highlight text */}
            <span className="mt-1.5 inline-block text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
              যোগ্য eBook Sale-এ ৳৫০ কমিশন!
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-amber-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAffiliate();
              }}
              className="w-full py-2 px-2 rounded-xl bg-amber-100 hover:bg-amber-500 text-amber-950 font-black text-xs transition flex items-center justify-center gap-1 group/btn shadow-2xs"
            >
              <span>Affiliate Program দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 3: MEMBERSHIP */}
        <div 
          onClick={onOpenMembership}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenMembership(); }}
          className="group cursor-pointer bg-[#fcfbfe] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-purple-200/80 hover:border-purple-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98]"
        >
          <div className="flex flex-col items-center">
            {/* Centered 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100/70 border border-purple-200 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="36" cy="62" rx="22" ry="4" fill="#312e81" fillOpacity="0.2" />
                {/* Crown Body */}
                <path d="M12 50L18 24L30 38L36 18L42 38L54 24L60 50H12Z" fill="url(#crownGrad)" stroke="#fef08a" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 50H60V56H12V50Z" fill="#b45309" />
                {/* Crown Jewels */}
                <circle cx="18" cy="24" r="3" fill="#ef4444" />
                <circle cx="36" cy="18" r="3.5" fill="#3b82f6" />
                <circle cx="54" cy="24" r="3" fill="#10b981" />
                <circle cx="36" cy="46" r="3" fill="#ec4899" />
                <defs>
                  <linearGradient id="crownGrad" x1="12" y1="18" x2="60" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fde047" />
                    <stop offset="0.5" stopColor="#eab308" />
                    <stop offset="1" stopColor="#ca8a04" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-700 transition flex items-center justify-center gap-1.5">
              <span>👑</span>
              <span>Membership</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              আপনার প্রয়োজন অনুযায়ী Membership বেছে নিন।
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-purple-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMembership();
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white font-black text-xs transition flex items-center justify-center gap-1 group/btn shadow-2xs cursor-pointer"
            >
              <span>Membership দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 4: BLOG */}
        <div 
          onClick={onOpenBlog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenBlog(); }}
          className="group cursor-pointer bg-[#f8fbfe] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-sky-200/80 hover:border-sky-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98]"
        >
          <div className="flex flex-col items-center">
            {/* Centered 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/70 border border-sky-200 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="36" cy="62" rx="22" ry="4" fill="#0c4a6e" fillOpacity="0.2" />
                {/* Article Document */}
                <rect x="18" y="14" width="36" height="46" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <path d="M24 22H42" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 28H48" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M24 34H48" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M24 40H40" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                {/* Pen / Quill */}
                <path d="M42 46L54 22L58 26L46 50L40 52L42 46Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                <circle cx="41" cy="51" r="1.5" fill="#0369a1" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-sky-700 transition flex items-center justify-center gap-1.5">
              <span>📝</span>
              <span>Blog</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              নতুন পোস্ট পড়ুন এবং বিষয় অনুযায়ী খুঁজুন।
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-sky-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBlog();
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white font-black text-xs transition flex items-center justify-center gap-1 group/btn shadow-2xs cursor-pointer"
            >
              <span>Blog পোস্ট দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 5: FREE TOOLS */}
        <div 
          onClick={onOpenTools}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenTools(); }}
          className="group cursor-pointer bg-[#fcfdfa] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-teal-200/80 hover:border-teal-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98]"
        >
          <div className="flex flex-col items-center">
            {/* Centered 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100/70 border border-teal-200 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="36" cy="62" rx="22" ry="4" fill="#134e4a" fillOpacity="0.2" />
                {/* Computer Monitor / Tool Interface */}
                <rect x="14" y="14" width="44" height="32" rx="4" fill="#0f766e" />
                <rect x="18" y="18" width="36" height="24" rx="2" fill="#ccfbf1" />
                <rect x="32" y="46" width="8" height="8" fill="#115e59" />
                <path d="M26 54H46" stroke="#115e59" strokeWidth="3" strokeLinecap="round" />
                {/* Wrench and Gear inside screen */}
                <path d="M30 24L38 32M38 24L30 32" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="34" cy="28" r="5" stroke="#f59e0b" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-teal-700 transition flex items-center justify-center gap-1.5">
              <span>🛠️</span>
              <span>Free Tools</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              প্রয়োজনীয় অনলাইন টুলস ব্যবহার করুন।
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-teal-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTools();
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-700 text-teal-800 hover:text-white font-black text-xs transition flex items-center justify-center gap-1 group/btn shadow-2xs cursor-pointer"
            >
              <span>সব Tools দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 6: APP DOWNLOAD */}
        <div 
          onClick={onOpenAppDownload}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenAppDownload(); }}
          className="group cursor-pointer bg-[#fcf9ff] hover:bg-white rounded-3xl p-3.5 sm:p-4 border border-rose-200/80 hover:border-rose-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center select-none active:scale-[0.98]"
        >
          <div className="flex flex-col items-center">
            {/* Centered 3D-styled Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100/70 border border-rose-200 flex items-center justify-center p-2.5 mb-2.5 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 72 72" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="36" cy="62" rx="20" ry="4" fill="#881337" fillOpacity="0.2" />
                {/* Smartphone Body */}
                <rect x="22" y="12" width="28" height="46" rx="6" fill="#be123c" />
                <rect x="24" y="16" width="24" height="34" rx="3" fill="#ffe4e6" />
                <circle cx="36" cy="54" r="2" fill="#ffffff" />
                {/* Download Arrow */}
                <path d="M36 22V36M36 36L30 30M36 36L42 30" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28 40H44" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-rose-700 transition flex items-center justify-center gap-1.5">
              <span>📲</span>
              <span>App Download</span>
            </h3>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
              EbookBazar App ডাউনলোড করুন সহজেই।
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 mt-2 border-t border-rose-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAppDownload();
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs transition flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer group/btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>App ডাউনলোড করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
});
