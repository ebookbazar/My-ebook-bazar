import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Home, 
  BookOpen, 
  Users, 
  HelpCircle, 
  Briefcase, 
  Tag, 
  Menu, 
  X,
  Compass,
  ArrowRight,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db, ref, onValue } from '../firebase';
import { HeaderNavCard } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  onOpenAuth?: (mode: 'user-login' | 'user-register' | 'seller-register' | 'admin-login') => void;
  showFeatureCards?: boolean;
}

export const DEFAULT_HEADER_CARDS: HeaderNavCard[] = [
  { id: '1', title: 'Home', icon: 'Home', subtitle: 'মূল পেইজ ও eBookBazar-এর প্রধান বিষয়সমূহ', url: '', targetSection: 'home' },
  { id: '2', title: 'Blog', icon: 'BookOpen', subtitle: 'বাংলা গল্প, তথ্য, টিউটোরিয়াল ও নতুন পোস্ট', url: '', targetSection: 'blog' },
  { id: '3', title: 'Affiliate', icon: 'Users', subtitle: 'Affiliate Program, Referral ও কমিশন', url: '', targetSection: 'affiliate' },
  { id: '4', title: 'Membership', icon: 'Crown', subtitle: 'Seller Membership ও eBook বিক্রির সুবিধা', url: '', targetSection: 'membership' },
  { id: '5', title: 'FAQ', icon: 'HelpCircle', subtitle: 'সাধারণ প্রশ্ন ও প্রয়োজনীয় সমাধান', url: '', targetSection: 'faq' },
  { id: '6', title: 'Jobs & Services', icon: 'Briefcase', subtitle: 'বিভিন্ন কাজ, সেবা ও প্রয়োজনীয় তথ্য', url: '', targetSection: 'job' },
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenAdmin,
  onOpenNotifications,
  onOpenAuth,
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGlobalNotif, setActiveGlobalNotif] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    // Listen to active global notifications from Firebase Realtime Database
    const notifRef = ref(db, 'notifications/global');
    const unsubNotif = onValue(notifRef, (snap) => {
      if (snap.exists()) {
        const notifs = Object.values(snap.val() as Record<string, any>);
        const active = notifs.find(n => n.active);
        if (active) {
          setActiveGlobalNotif({ title: active.title, message: active.message });
        } else {
          setActiveGlobalNotif(null);
        }
      } else {
        setActiveGlobalNotif(null);
      }
    });

    return () => {
      unsubNotif();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* 
        PREMIUM GLASSMORPHISM CAPSULE HEADER 
        Inspired directly by the reference image with deep emerald translucent glass,
        frosted blur, subtle specular highlights, official eBookBazar logo, and crisp buttons.
      */}
      <div className="bg-[#052b16]/75 backdrop-blur-xl border-b border-emerald-500/35 shadow-[0_8px_32px_rgba(0,0,0,0.37)] transition-all">
        {/* Subtle glass reflection sheen on top */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Top Header Row */}
        <div className="container mx-auto px-4 py-2.5 sm:py-3 max-w-7xl flex items-center justify-between gap-3 sm:gap-4">
          {/* LEFT: Official eBookBazar Logo & Brand */}
          <div 
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
            title="eBookBazar হোম পেজে ফিরে যান"
          >
            {/* Official Logo with Golden Crest */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
              <img 
                src="/ebookbazar-logo.jpg" 
                alt="eBookBazar Official Logo" 
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback in case image fails to load
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-emerald-900');
                    target.parentElement.innerHTML = `<span class="text-amber-400 font-black text-sm">EB</span>`;
                  }
                }}
              />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-white drop-shadow-xs">
                  eBook<span className="text-amber-400">Bazar</span>
                </span>
                <span className="bg-emerald-950/80 text-emerald-200 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/50 uppercase tracking-widest hidden md:inline-block">
                  Marketplace
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/90 font-medium hidden lg:block -mt-0.5">
                ডিজিটাল বই, ব্লগ ও অ্যাফিলিয়েট প্ল্যাটফর্ম
              </p>
            </div>
          </div>

          {/* CENTER: Desktop Quick Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs lg:text-sm font-bold text-emerald-100">
            <button 
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'home' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              মার্কেটপ্লেস
            </button>
            <button 
              onClick={() => { setCurrentView('all-features'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition flex items-center gap-1 py-1 ${currentView === 'all-features' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : 'text-amber-200'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>সব ফিচার হাব</span>
            </button>
            <button 
              onClick={() => { setCurrentView('seller-dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'seller-dashboard' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              সেলার প্যানেল
            </button>
            <button 
              onClick={() => { setCurrentView('user-dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'user-dashboard' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              ইউজার ড্যাশবোর্ড
            </button>
            <button 
              onClick={() => { setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'blog' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              বই ও ব্লগ
            </button>
            <button 
              onClick={() => { setCurrentView('affiliate'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'affiliate' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              অ্যাফিলিয়েট
            </button>
            <button 
              onClick={() => { setCurrentView('membership'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-amber-300 transition py-1 ${currentView === 'membership' ? 'text-amber-300 border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              মেম্বারশিপ
            </button>
          </nav>

          {/* RIGHT: Action Buttons (Glass Notification, Glass Cart, Glass Admin Pill, White Login Pill) */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            {/* 1. Notification Button (Circular Glass Pill) */}
            <button 
              onClick={onOpenNotifications} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white flex items-center justify-center transition shadow-inner active:scale-95 group"
              title="নোটিফিকেশন ও আপডেট"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* 2. Cart Button (Glass Rounded Square with Gold Count Badge) */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white flex items-center justify-center transition shadow-inner active:scale-95 group"
              title="শপিং কার্ট"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md border-2 border-emerald-900 animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* 3. Admin Button (Glass Pill with Shield Icon & Yellow ADMIN Pill from Reference Image) */}
            <button 
              onClick={onOpenAdmin}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 transition shadow-md border ${
                isAdmin
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300'
                  : 'bg-emerald-950/70 hover:bg-emerald-900 text-amber-300 border-emerald-500/50 hover:border-amber-400'
              }`}
              title="সম্পূর্ণ অ্যাডমিন কন্ট্রোল প্যানেল"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                ADMIN
              </span>
            </button>

            {/* 4. Login / User Profile Dropdown Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => {
                    if (userProfile?.role === 'seller') {
                      setCurrentView('seller-dashboard');
                    } else {
                      setCurrentView('user-dashboard');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition active:scale-95 max-w-[110px] sm:max-w-[150px] truncate"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">
                    {userProfile?.fullName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-emerald-950/60 hover:bg-rose-600 text-emerald-200 hover:text-white border border-emerald-500/40 flex items-center justify-center transition shadow-sm active:scale-95"
                  title="লগআউট করে হোমে যান"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('user-login');
                  setCurrentView('login');
                }}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1 sm:gap-1.5 transition active:scale-95"
              >
                <span>লগইন</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
              </button>
            )}

            {/* Mobile Drawer Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-white flex items-center justify-center transition active:scale-95"
              aria-label="মোবাইল মেনু"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 
          SLIM GLASS ANNOUNCEMENT / NOTICE BAR
          Directly integrated below the Header as in the reference design.
        */}
        <div className="bg-[#031d0e]/85 backdrop-blur-md text-emerald-100 text-xs py-2 px-4 border-t border-emerald-500/25 shadow-xs">
          <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              {/* Yellow/Gold Badge: ● ঘোষণা */}
              <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                ঘোষণা
              </span>

              {/* Notice Title */}
              <span className="font-black text-amber-300 truncate shrink-0 text-xs sm:text-sm">
                {activeGlobalNotif?.title || 'ই-বুকবাজার বিশেষ নোটিশ:'}
              </span>

              {/* Notice Description */}
              <span className="text-emerald-100/90 truncate text-[11px] sm:text-xs font-medium">
                {activeGlobalNotif?.message || 'সকল ডিজিটাল বই ও ক্যারিয়ার গাইডে ৫০% পর্যন্ত ক্যাশব্যাক অফার! যেকোনো প্রয়োজনে ২৪/৭ কাস্টমার সাপোর্ট সক্রিয়।'}
              </span>
            </div>

            {/* Right Arrow Indicator or Dismiss */}
            <div className="flex items-center gap-2 shrink-0">
              {activeGlobalNotif ? (
                <button 
                  onClick={() => setActiveGlobalNotif(null)} 
                  className="text-emerald-300 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800"
                  title="বন্ধ করুন"
                >
                  ✕
                </button>
              ) : (
                <ChevronRight className="w-4 h-4 text-emerald-400 hidden sm:block opacity-75" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#042513]/95 backdrop-blur-2xl border-t border-emerald-500/30 px-4 py-4 space-y-3 text-sm font-bold text-white shadow-2xl animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-emerald-800/60">
              <button 
                onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>মার্কেটপ্লেস</span>
              </button>
              <button 
                onClick={() => { setCurrentView('all-features'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2 text-amber-300"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>সব ফিচার হাব</span>
              </button>
              <button 
                onClick={() => { setCurrentView('blog'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>বই ও ব্লগ</span>
              </button>
              <button 
                onClick={() => { setCurrentView('affiliate'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>অ্যাফিলিয়েট</span>
              </button>
              <button 
                onClick={() => { setCurrentView('membership'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>মেম্বারশিপ</span>
              </button>
              <button 
                onClick={() => { setCurrentView('faq'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-teal-400" />
                <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
              </button>
              <button 
                onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-orange-400" />
                <span>আমাদের সম্পর্কে</span>
              </button>
              <button 
                onClick={() => { setCurrentView('terms'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>নীতি ও শর্তাবলি</span>
              </button>
            </div>

            {/* Dashboards & Account in Mobile */}
            <div className="space-y-2 pt-1">
              <button 
                onClick={() => { setCurrentView('seller-dashboard'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 border border-emerald-700/50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>সেলার ড্যাশবোর্ড ও বই আপলোড</span>
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
              <button 
                onClick={() => { setCurrentView('user-dashboard'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 border border-emerald-700/50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>ইউজার ড্যাশবোর্ড ও আমার লাইব্রেরি</span>
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              {currentUser && (
                <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between gap-3">
                  <div className="truncate text-xs">
                    <span className="text-emerald-300 font-bold block truncate">
                      {userProfile?.fullName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-200 uppercase font-mono">
                      {userProfile?.role === 'seller' ? '👑 Seller Account' : '👤 User Account'}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      setCurrentView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
