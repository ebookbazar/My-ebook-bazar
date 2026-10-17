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
  ChevronRight,
  Calculator
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
      <div className="bg-gradient-to-r from-[#032b18] via-[#053820] to-[#032b18] border-b border-amber-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all">
        {/* Subtle golden reflection sheen on top */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent pointer-events-none" />

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
              <picture>
                <source srcSet={`${import.meta.env.BASE_URL || '/'}ebookbazar-logo.webp`} type="image/webp" />
                <img 
                  src={`${import.meta.env.BASE_URL || '/'}ebookbazar-logo.jpg`} 
                  alt="eBookBazar Official Logo" 
                  width={44}
                  height={44}
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

            {/* Brand Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-white drop-shadow-xs">
                  eBook<span className="text-[#FACC15]">Bazar</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium tracking-wide -mt-0.5">
                পড়ুন • শিখুন • এগিয়ে যান
              </p>
            </div>
          </div>

          {/* CENTER: Desktop Quick Navigation Links Matching Reference (হোম, eBook, ব্লগ, সেলার, অ্যাফিলিয়েট, টুলস, অ্যাপ) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs lg:text-sm font-bold text-emerald-100">
            <button 
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer flex items-center gap-1.5 ${currentView === 'home' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              <Home className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>হোম</span>
            </button>
            <button 
              onClick={() => { setCurrentView('ebooks'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer ${currentView === 'ebooks' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              eBook
            </button>
            <button 
              onClick={() => { setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer ${currentView === 'blog' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              ব্লগ
            </button>
            <button 
              onClick={() => {
                if (userProfile?.role === 'seller') {
                  setCurrentView('seller-dashboard');
                } else {
                  if (onOpenAuth) onOpenAuth('seller-register');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer ${currentView === 'seller-dashboard' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              সেলার
            </button>
            <button 
              onClick={() => { setCurrentView('affiliate'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer ${currentView === 'affiliate' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              অ্যাফিলিয়েট
            </button>
            <button 
              onClick={() => { setCurrentView('tools'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className={`hover:text-[#FACC15] transition py-1 cursor-pointer ${currentView === 'tools' ? 'text-[#FACC15] border-b-2 border-[#FACC15] pb-0.5' : ''}`}
            >
              টুলস
            </button>
            <button 
              onClick={() => {
                const navCards = document.getElementById('primary-service-cards');
                if (navCards) {
                  navCards.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('home');
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }
              }} 
              className="hover:text-[#FACC15] transition py-1 cursor-pointer"
            >
              অ্যাপ
            </button>
          </nav>

          {/* RIGHT: Action Buttons (Only Reference-styled Login Dropdown & Mobile Hamburger Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reference-Styled Login / User Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    if (isAdmin) {
                      onOpenAdmin();
                    } else if (userProfile?.role === 'seller') {
                      setCurrentView('seller-dashboard');
                    } else {
                      setCurrentView('user-dashboard');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-[#06381e] hover:bg-[#084827] text-white border border-amber-400/90 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition active:scale-95 max-w-[140px] sm:max-w-[170px] truncate cursor-pointer group"
                  title={isAdmin ? 'অ্যাডমিন ড্যাশবোর্ড খুলুন' : userProfile?.role === 'seller' ? 'সেলার ড্যাশবোর্ড খুলুন' : 'ইউজার ড্যাশবোর্ড খুলুন'}
                >
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {isAdmin ? 'অ্যাডমিন' : (userProfile?.fullName || currentUser.email?.split('@')[0])}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-[#06381e] hover:bg-rose-700 text-amber-300 hover:text-white border border-amber-400/50 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
                  title="লগআউট"
                  aria-label="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('user-login');
                }}
                className="px-4 sm:px-5 py-2 rounded-full bg-[#06381e] hover:bg-[#084827] text-white border border-amber-400/90 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 sm:gap-2 transition active:scale-95 cursor-pointer group"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-white">লগইন</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
              </button>
            )}

            {/* Mobile Drawer Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              aria-label="মোবাইল মেনু"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
            </button>
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
                onClick={() => { setCurrentView('ebooks'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>ই-বুক ক্যাটালগ</span>
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
                onClick={() => { setCurrentView('tools'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`text-left p-2.5 rounded-xl border flex items-center gap-2 ${
                  currentView === 'tools'
                    ? 'bg-amber-400 text-slate-950 font-black border-amber-500'
                    : 'bg-emerald-900/60 hover:bg-emerald-800 border-emerald-700/50 text-white'
                }`}
              >
                <Calculator className={`w-4 h-4 ${currentView === 'tools' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>ফ্রি টুলস ও ক্যালকুলেটর</span>
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
              {userProfile?.role === 'seller' && (
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
              )}
              {currentUser && userProfile?.role !== 'seller' && !isAdmin && (
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
              )}

              {currentUser ? (
                <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between gap-3">
                  <div 
                    onClick={() => {
                      if (isAdmin) {
                        onOpenAdmin();
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`truncate text-xs ${isAdmin ? 'cursor-pointer hover:opacity-90' : ''}`}
                  >
                    <span className="text-emerald-300 font-bold block truncate">
                      {isAdmin ? 'অ্যাডমিন' : (userProfile?.fullName || currentUser.email?.split('@')[0])}
                    </span>
                    <span className="text-[10px] text-emerald-200 uppercase font-mono">
                      {isAdmin ? '🛡️ Admin Account' : userProfile?.role === 'seller' ? '👑 Seller Account' : '👤 User Account'}
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
              ) : (
                <div className="pt-2 border-t border-emerald-800/60">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAuth) onOpenAuth('user-login');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>লগইন / সাইন-আপ</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </header>
  );
};
