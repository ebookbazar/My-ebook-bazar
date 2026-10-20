import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ArrowUp, 
  FileText, 
  MessageCircle,
  HelpCircle,
  Phone,
  Info
} from 'lucide-react';
import { db, ref, onValue } from '../firebase';
import { useAuth } from '../context/AuthContext';

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
  facebookUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  setCurrentView, 
  onOpenTerms, 
  onOpenPrivacy 
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [footerLinks, setFooterLinks] = useState<FooterLinks>({
    termsUrl: '',
    privacyUrl: '',
    contactUrl: 'https://wa.me/8801911633056',
    aboutUrl: '',
    freederUrl: 'https://freeder.com.bd/pages/ebookbazar',
    youtubeUrl: 'https://youtube.com/@ebookbazarofficial?si=vosC0lffrhhckDLm',
    telegramUrl: 'https://t.me/ebookbazar',
    facebookUrl: ''
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
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    } else {
      setCurrentView(fallbackView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="w-full pt-4 sm:pt-5 pb-2 sm:pb-3 px-3 sm:px-4">
      {/* 
        PREMIUM GLASSMORPHISM FOOTER CONTAINER
        Deep emerald translucent glass with delicate specular border highlight,
        4 semantic columns, compact payment logos, and dynamic copyright bar.
      */}
      <div className="container mx-auto max-w-7xl relative bg-gradient-to-br from-[#064e3b]/90 via-[#042f1a]/95 to-[#021f11] backdrop-blur-2xl border border-emerald-400/35 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-white">
        {/* Subtle glass reflection highlight across the top edge */}
        <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Ambient background glow inside the footer */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 2 BALANCED COLUMNS GRID */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          {/* ======================================================== */}
          {/* COLUMN 1: Official Logo, Brand, Description & Trust Badge */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div 
              onClick={() => {
                setCurrentView('home');
                scrollToTop();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('home');
                  scrollToTop();
                }
              }}
              className="flex items-center gap-3 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl w-fit p-0.5"
              title="eBookBazar হোম পেজ"
              aria-label="eBookBazar হোম পেজ"
            >
              {/* Official eBookBazar Golden Crest Logo */}
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                <picture>
                  <source srcSet={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/ebookbazar-logo.webp`} type="image/webp" />
                  <img 
                    src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/ebookbazar-logo.jpg`} 
                    alt="eBookBazar logo" 
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
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
                </picture>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                  eBook<span className="text-amber-400">Bazar</span>
                </span>
                <span className="text-[10px] text-emerald-200/80 font-medium -mt-1">
                  ডিজিটাল বইয়ের বিশ্বস্ত প্ল্যাটফর্ম
                </span>
              </div>
            </div>

            {/* Official Bengali Website Description */}
            <p className="text-emerald-100/90 leading-relaxed text-xs sm:text-sm font-medium">
              বাংলা গল্প, eBook, ব্যবহারিক গাইড ও অনলাইন শেখার রিসোর্স—সব এক জায়গায়। নিজের প্রয়োজনের বইটি খুঁজে নিন eBookBazar-এ।
            </p>

            {/* Trust & Verified Badge */}
            <div className="flex items-center gap-2 pt-2 text-amber-300 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>100% নিরাপদ ও বিশ্বস্ত লেনদেন</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2: সোশ্যাল মিডিয়া & আমাদের সাথে থাকুন             */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <h3 className="font-black text-white text-base md:text-lg mb-4 uppercase tracking-wider border-b-2 border-emerald-500/60 pb-1.5 inline-block">
              সোশ্যাল মিডিয়া
            </h3>

            {/* Social Media Link Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Facebook (if configured) */}
              {footerLinks.facebookUrl && (
                <a 
                  href={footerLinks.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Facebook পেজ"
                  aria-label="Facebook পেজ"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {/* YouTube */}
              <a 
                href={footerLinks.youtubeUrl || "https://youtube.com/@ebookbazarofficial?si=vosC0lffrhhckDLm"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FF0000] hover:bg-[#d90000] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                title="YouTube চ্যানেল"
                aria-label="YouTube চ্যানেল"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a 
                href={footerLinks.telegramUrl || "https://t.me/ebookbazar"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#229ED9] hover:bg-[#1a8bc2] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                title="Telegram চ্যানেল"
                aria-label="Telegram চ্যানেল"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.195 1.006.128.828.942z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a 
                href={footerLinks.contactUrl && !footerLinks.contactUrl.includes('8801673860659') ? footerLinks.contactUrl : "https://wa.me/8801911633056"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                title="WhatsApp সাপোর্ট"
                aria-label="WhatsApp সাপোর্ট"
              >
                <MessageCircle className="w-5 h-5 fill-white" aria-hidden="true" />
              </a>

              {/* Freeder Official Page */}
              <a 
                href={footerLinks.freederUrl || "https://freeder.com.bd/pages/ebookbazar"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-md border border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
                title="Freeder পেজ"
                aria-label="Freeder পেজ"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 3h12c.55 0 1 .45 1 1v2.5c0 .55-.45 1-1 1h-7v2.5h6c.55 0 1 .45 1 1V13c0 .55-.45 1-1 1h-6v6c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1z"/>
                </svg>
              </a>
            </div>

            {/* Stay Connected message */}
            <div className="mt-5 pt-4 border-t border-emerald-700/50 space-y-1">
              <h4 className="font-bold text-white text-sm">আমাদের সাথে থাকুন</h4>
              <p className="text-emerald-200/90 text-xs leading-relaxed">
                নতুন বই, অফার ও আপডেট পেতে আমাদের সাথে যুক্ত থাকুন।
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PART 6: PAYMENT METHOD LOGOS (পেমেন্ট পদ্ধতি)              */}
        {/* ======================================================== */}
        <section 
          aria-labelledby="footer-payment-heading"
          className="relative z-10 border-t border-emerald-600/40 mt-8 sm:mt-10 pt-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-center md:text-left">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <h3 id="footer-payment-heading" className="text-sm font-black text-white">
                  পেমেন্ট পদ্ধতি
                </h3>
                <p className="text-[11px] text-emerald-200/80 font-medium">
                  ১০০% সুরক্ষিত ও বিশ্বস্ত মোবাইল ব্যাংকিং লেনদেন
                </p>
              </div>
            </div>

            {/* bKash, Nagad, Rocket Authentic Payment Method Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* 1. bKash Payment Logo Card */}
              <div 
                className="h-9 px-3.5 bg-white text-slate-900 rounded-xl flex items-center justify-center gap-2 border border-slate-200 shadow-xs select-none hover:shadow-md transition-shadow"
                title="bKash পেমেন্ট পদ্ধতি"
              >
                <svg 
                  className="w-5 h-5 shrink-0" 
                  viewBox="0 0 48 48" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  role="img" 
                  aria-label="bKash payment method logo"
                >
                  <title>bKash payment method logo</title>
                  <path d="M42.4 17.5L25.3 34.6l-5.6-5.6L34.1 14.6l8.3 2.9z" fill="#E2136E"/>
                  <path d="M25.3 34.6L16.4 43.5 13 32.8l12.3 1.8z" fill="#B70F57"/>
                  <path d="M19.7 29L8.2 17.5l14.1-2.9-2.6 14.4z" fill="#E2136E"/>
                  <path d="M8.2 17.5L4 4.5l18.3 10.1L8.2 17.5z" fill="#E2136E"/>
                </svg>
                <span className="font-black text-[#E2136E] text-xs sm:text-sm tracking-tight">bKash</span>
              </div>

              {/* 2. Nagad Payment Logo Card */}
              <div 
                className="h-9 px-3.5 bg-white text-slate-900 rounded-xl flex items-center justify-center gap-2 border border-slate-200 shadow-xs select-none hover:shadow-md transition-shadow"
                title="নগদ (Nagad) পেমেন্ট পদ্ধতি"
              >
                <svg 
                  className="w-5 h-5 shrink-0" 
                  viewBox="0 0 48 48" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  role="img" 
                  aria-label="Nagad payment method logo"
                >
                  <title>Nagad payment method logo</title>
                  <path d="M24 4C14.5 14 11 19.5 11 27c0 7.2 5.8 13 13 13s13-5.8 13-13c0-7.5-3.5-13-13-23z" fill="#F7941D"/>
                  <path d="M24 14c-4.5 5.5-6.5 9-6.5 13.5 0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5C30.5 23 28.5 19.5 24 14z" fill="#ED1C24"/>
                </svg>
                <span className="font-black text-[#ED1C24] text-xs sm:text-sm tracking-tight">
                  নগদ <span className="font-bold text-[11px] text-slate-700">(Nagad)</span>
                </span>
              </div>

              {/* 3. Rocket Payment Logo Card */}
              <div 
                className="h-9 px-3.5 bg-white text-slate-900 rounded-xl flex items-center justify-center gap-2 border border-slate-200 shadow-xs select-none hover:shadow-md transition-shadow"
                title="Rocket (রকেট) পেমেন্ট পদ্ধতি"
              >
                <svg 
                  className="w-5 h-5 shrink-0" 
                  viewBox="0 0 48 48" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  role="img" 
                  aria-label="Rocket payment method logo"
                >
                  <title>Rocket payment method logo</title>
                  <path d="M24 4c-4 6-7 15-7 22 0 4.5 2.5 8.5 7 10 4.5-1.5 7-5.5 7-10 0-7-3-16-7-22z" fill="#8C3494"/>
                  <path d="M14 26l3 6-5 4 2-10z" fill="#8C3494"/>
                  <path d="M34 26l-3 6 5 4-2-10z" fill="#8C3494"/>
                  <circle cx="24" cy="20" r="3.5" fill="#FFFFFF"/>
                </svg>
                <span className="font-black text-[#8C3494] text-xs sm:text-sm tracking-tight">Rocket</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PART 8: BOTTOM COPYRIGHT, POLICY LINKS & SCROLL TO TOP BAR */}
        {/* ======================================================== */}
        <div className="relative z-10 border-t border-emerald-600/40 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-[13px] text-emerald-200/90">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="font-medium">
              © {currentYear} <span className="text-amber-400 font-bold">eBookBazar</span>. সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex items-center gap-3 text-emerald-300 font-semibold text-xs">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTerms) onOpenTerms();
                  else handleLinkClick(footerLinks.termsUrl, 'terms');
                }}
                className="hover:text-amber-300 transition underline underline-offset-2 cursor-pointer"
              >
                শর্তাবলী
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenPrivacy) onOpenPrivacy();
                  else handleLinkClick(footerLinks.privacyUrl, 'privacy');
                }}
                className="hover:text-amber-300 transition underline underline-offset-2 cursor-pointer"
              >
                গোপনীয়তা নীতি
              </button>
              <span>•</span>
              <a
                href={footerLinks.contactUrl && !footerLinks.contactUrl.includes('8801673860659') ? footerLinks.contactUrl : "https://wa.me/8801911633056"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition underline underline-offset-2 cursor-pointer"
              >
                যোগাযোগ
              </a>
            </div>
          </div>

          {/* Accessible Scroll to Top Pill Button */}
          <button 
            type="button"
            onClick={scrollToTop} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold transition shadow-sm active:scale-95 group focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shrink-0 sm:mr-24 lg:mr-28"
            title="উপরে স্ক্রোল করুন"
            aria-label="পৃষ্ঠার শুরুতে স্ক্রোল করুন"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-amber-400" aria-hidden="true" />
            <span>উপরে যান</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
