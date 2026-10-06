import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ArrowUp, 
  Sparkles, 
  FileText, 
  ChevronRight,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { db, ref, onValue } from '../firebase';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

interface FooterLinks {
  termsUrl: string;
  privacyUrl: string;
  contactUrl: string;
  aboutUrl: string;
  freederUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  setCurrentView, 
  onOpenTerms, 
  onOpenPrivacy 
}) => {
  const [footerLinks, setFooterLinks] = useState<FooterLinks>({
    termsUrl: '',
    privacyUrl: '',
    contactUrl: 'https://wa.me/8801911633056',
    aboutUrl: '',
    freederUrl: 'https://freeder.com.bd/pages/ebookbazar',
    youtubeUrl: 'https://youtube.com/@ebookbazarofficial?si=vosC0lffrhhckDLm',
    telegramUrl: 'https://t.me/ebookbazar'
  });

  useEffect(() => {
    // Listen to real-time custom footer links configured in settings
    const unsub = onValue(ref(db, 'settings/footerLinks'), (snap) => {
      if (snap.exists()) {
        setFooterLinks(prev => ({ ...prev, ...snap.val() }));
      }
    });
    return () => unsub();
  }, []);

  const handleLinkClick = (url: string, fallbackView: string) => {
    if (url && url.trim().startsWith('http')) {
      window.open(url.trim(), '_blank');
    } else {
      setCurrentView(fallbackView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-14 sm:mt-16 pb-8 px-3 sm:px-4">
      {/* 
        PREMIUM GLASSMORPHISM FOOTER CONTAINER
        Matching the uploaded reference image with deep emerald translucent glass,
        frosted backdrop blur, delicate specular border, 4 columns, and scroll-to-top action.
      */}
      <div className="container mx-auto max-w-7xl relative bg-gradient-to-br from-[#064e3b]/85 via-[#042f1a]/90 to-[#021f11]/95 backdrop-blur-2xl border border-emerald-400/35 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white">
        {/* Subtle glass reflection highlight across the top edge */}
        <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Ambient background glow inside the footer */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 4 COLUMNS GRID */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* ======================================================== */}
          {/* COLUMN 1: Official Logo, Brand, Description & Trust Badge */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div 
              onClick={() => {
                setCurrentView('home');
                scrollToTop();
              }}
              className="flex items-center gap-3 cursor-pointer select-none group"
              title="eBookBazar হোম পেজ"
            >
              {/* Official eBookBazar Golden Crest Logo */}
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                <img 
                  src={`${import.meta.env.BASE_URL || '/'}ebookbazar-logo.jpg`} 
                  alt="eBookBazar Official Logo" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-emerald-900');
                      target.parentElement.innerHTML = `<span class="text-amber-400 font-black text-sm">EB</span>`;
                    }
                  }}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                  eBook<span className="text-amber-400">Bazar</span>
                </span>
                <span className="text-[10px] text-emerald-200/80 font-medium -mt-1">
                  ডিজিটাল বইয়ের নির্ভরযোগ্য প্ল্যাটফর্ম
                </span>
              </div>
            </div>

            {/* Website Description */}
            <p className="text-emerald-100/90 leading-relaxed text-xs sm:text-sm font-medium">
              ডিজিটাল eBook কেনা, বিক্রি ও লাইব্রেরি অ্যাক্সেসের নির্ভরযোগ্য প্ল্যাটফর্ম। লেখক ও অ্যাফিলিয়েটদের জন্য সহজ আয়ের সুযোগ।
            </p>

            {/* Trust & Verified Badge */}
            <div className="flex items-center gap-2 pt-2 text-amber-300 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>100% নিরাপদ ও বিশ্বস্ত লেনদেন</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2: দ্রুত লিংক (Quick Links)                       */}
          {/* ======================================================== */}
          <div>
            <h4 className="font-black text-white text-base md:text-lg mb-4 uppercase tracking-wider border-b-2 border-emerald-500/60 pb-1.5 inline-block">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => { setCurrentView('all-features'); scrollToTop(); }}
                  className="text-amber-300 hover:text-white transition flex items-center gap-2 py-0.5 font-black text-left group"
                >
                  <span className="text-amber-400 group-hover:scale-110 transition-transform">★</span>
                  <span>সব ফিচার হাব (Admin, Seller, User)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('home'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-amber-400 group-hover:scale-110 transition-transform">★</span>
                  <span>ই-বুক মার্কেটপ্লেস</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('seller-dashboard'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-amber-400 group-hover:scale-110 transition-transform">★</span>
                  <span>সেলার প্যানেল</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('user-dashboard'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">➜</span>
                  <span>ইউজার ড্যাশবোর্ড</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('blog'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">➜</span>
                  <span>বই ও ব্লগ</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('affiliate'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">➜</span>
                  <span>অ্যাফিলিয়েট প্রোগ্রাম</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('membership'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">➜</span>
                  <span>সেলার মেম্বারশিপ</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 3: নীতি ও পেজসমূহ (Policies & Info Pages)         */}
          {/* ======================================================== */}
          <div>
            <h4 className="font-black text-white text-base md:text-lg mb-4 uppercase tracking-wider border-b-2 border-emerald-500/60 pb-1.5 inline-block">
              নীতি ও পেজসমূহ
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => {
                    if (onOpenTerms) onOpenTerms();
                    else handleLinkClick(footerLinks.termsUrl, 'terms');
                  }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <FileText className="w-4 h-4 text-emerald-300 group-hover:text-amber-300 shrink-0" />
                  <span>শর্তাবলি ও নীতিমালা (Terms)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (onOpenPrivacy) onOpenPrivacy();
                    else handleLinkClick(footerLinks.privacyUrl, 'privacy');
                  }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <FileText className="w-4 h-4 text-emerald-300 group-hover:text-amber-300 shrink-0" />
                  <span>গোপনীয়তা নীতি (Privacy Policy)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick(footerLinks.aboutUrl, 'about')}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <FileText className="w-4 h-4 text-emerald-300 group-hover:text-amber-300 shrink-0" />
                  <span>আমাদের সম্পর্কে (About Us)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick(footerLinks.contactUrl, 'contact')}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <FileText className="w-4 h-4 text-emerald-300 group-hover:text-amber-300 shrink-0" />
                  <span>যোগাযোগ (Contact Us)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentView('faq'); scrollToTop(); }}
                  className="text-emerald-100 hover:text-amber-300 transition flex items-center gap-2 py-0.5 font-bold text-left group"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-300 group-hover:text-amber-300 shrink-0" />
                  <span>সাধারণ প্রশ্ন ও উত্তর (FAQ)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 4: সোশ্যাল মিডিয়া & আমাদের সাথে থাকুন             */}
          {/* ======================================================== */}
          <div>
            <h4 className="font-black text-white text-base md:text-lg mb-4 uppercase tracking-wider border-b-2 border-emerald-500/60 pb-1.5 inline-block">
              সোশ্যাল মিডিয়া
            </h4>

            {/* 4 Circular Colorful Social Buttons from Reference Image */}
            <div className="flex items-center gap-3 pt-1">
              {/* Freeder */}
              <a 
                href={footerLinks.freederUrl || "https://freeder.com.bd/pages/ebookbazar"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md border border-emerald-400/40"
                title="Freeder"
                aria-label="Freeder"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3h12c.55 0 1 .45 1 1v2.5c0 .55-.45 1-1 1h-7v2.5h6c.55 0 1 .45 1 1V13c0 .55-.45 1-1 1h-6v6c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href={footerLinks.youtubeUrl || "https://youtube.com/@ebookbazarofficial?si=vosC0lffrhhckDLm"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                title="YouTube চ্যানেল"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a 
                href={footerLinks.telegramUrl || "https://t.me/ebookbazar"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#229ED9] hover:bg-[#1a8bc2] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                title="Telegram চ্যানেল"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.195 1.006.128.828.942z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a 
                href={footerLinks.contactUrl && !footerLinks.contactUrl.includes('8801673860659') ? footerLinks.contactUrl : "https://wa.me/8801911633056"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                title="WhatsApp সাপোর্ট"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </a>
            </div>

            {/* Newsletter / Stay Connected message */}
            <div className="mt-5 pt-4 border-t border-emerald-700/50 space-y-1">
              <h5 className="font-bold text-white text-sm">আমাদের সাথে থাকুন</h5>
              <p className="text-emerald-200/90 text-xs leading-relaxed">
                নতুন বই, অফার ও আপডেট পেতে সাবস্ক্রাইব করুন এবং আমাদের কমিউনিটিতে যুক্ত থাকুন।
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM COPYRIGHT & SCROLL TO TOP BAR                     */}
        {/* ======================================================== */}
        <div className="relative z-10 border-t border-emerald-600/40 mt-8 sm:mt-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px] text-emerald-200/90">
          <p className="font-medium text-center sm:text-left">
            © 2026 <span className="text-amber-400 font-bold">eBookBazar</span>. সর্বস্বত্ব সংরক্ষিত। | ডিজিটাল বইয়ের বিশ্বস্ত ঠিকানা
          </p>

          {/* Scroll to Top Pill Button */}
          <button 
            onClick={scrollToTop} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold transition shadow-sm active:scale-95 group"
            title="উপরে স্ক্রোল করুন"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-amber-400" />
            <span>উপরে যান</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
