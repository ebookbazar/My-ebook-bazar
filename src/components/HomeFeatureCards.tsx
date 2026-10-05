import React from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Crown, 
  Info, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface HomeFeatureCardsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

interface GlassCardItem {
  id: string;
  badgeLabel: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  targetSection: string;
  theme: {
    glassBg: string;
    borderColor: string;
    glowShadow: string;
    tileGradient: string;
    tileBorder: string;
    surfaceReflection: string;
    buttonGradient: string;
  };
  render3DIcon: () => React.ReactNode;
}

export const HomeFeatureCards: React.FC<HomeFeatureCardsProps> = React.memo(({
  currentView,
  setCurrentView,
}) => {
  const handleCardClick = (target: string) => {
    setCurrentView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cards: GlassCardItem[] = [
    {
      id: 'blog',
      badgeLabel: 'Blog',
      badgeIcon: <BookOpen className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#0284c7]',
      title: 'Blog',
      description: 'বিভিন্ন বিষয়ে আকর্ষণীয় লেখা পড়ুন ও জানুন নতুন কিছু।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#0284c7] hover:bg-[#0369a1]',
      targetSection: 'blog',
      theme: {
        glassBg: 'bg-gradient-to-br from-cyan-400/30 via-sky-500/20 to-blue-950/70',
        borderColor: 'border-cyan-300/60 hover:border-cyan-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(6,182,212,0.45)]',
        tileGradient: 'from-cyan-400 via-sky-500 to-blue-600',
        tileBorder: 'border-cyan-200/70',
        surfaceReflection: 'bg-cyan-500/30',
        buttonGradient: 'from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base shadow */}
          <ellipse cx="50" cy="80" rx="36" ry="6" fill="#034870" fillOpacity="0.45" filter="blur(2px)" />
          
          {/* Book Spine / Cover */}
          <path d="M14 62C24 64 38 61 50 66C62 61 76 64 86 62L86 68C76 70 62 67 50 72C38 67 24 70 14 68Z" fill="#1e3a8a" />
          <path d="M12 60C23 62 38 59 50 64C62 59 77 62 88 60L86 65C76 67 62 64 50 69C38 64 23 67 14 65Z" fill="#2563eb" />
          
          {/* Left Pages */}
          <path d="M15 57C26 59 38 56 49 60L49 32C38 28 26 31 15 29Z" fill="#e2e8f0" />
          <path d="M17 56C27 58 39 55 50 59L50 31C39 27 27 30 17 28Z" fill="#f8fafc" />
          
          {/* Right Pages */}
          <path d="M85 57C74 59 62 56 51 60L51 32C62 28 74 31 85 29Z" fill="#cbd5e1" />
          <path d="M83 56C73 58 61 55 50 59L50 31C61 27 73 30 83 28Z" fill="#ffffff" />
          
          {/* Spine Separator */}
          <path d="M50 31L50 59" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Page Lines */}
          <line x1="22" y1="36" x2="42" y2="39" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="22" y1="43" x2="42" y2="46" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="22" y1="50" x2="38" y2="53" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          
          <line x1="58" y1="39" x2="78" y2="36" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="58" y1="46" x2="78" y2="43" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="62" y1="53" x2="78" y2="50" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* 3D Sprout / Plant rising from book */}
          <path d="M50 42C50 32 50 25 50 18" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Left Leaf */}
          <path d="M50 24C44 21 39 25 41 31C45 33 50 27 50 24Z" fill="#4ade80" />
          <path d="M50 24C45 22 41 25 42 29C46 31 50 26 50 24Z" fill="#22c55e" />
          <path d="M50 24C46 25 43 27 42 29" stroke="#bbf7d0" strokeWidth="0.8" />
          
          {/* Right Leaf */}
          <path d="M50 20C57 16 63 21 60 28C55 30 50 23 50 20Z" fill="#22c55e" />
          <path d="M50 20C55 17 60 21 58 26C54 28 50 22 50 20Z" fill="#86efac" />
          <path d="M50 20C54 21 57 23 58 26" stroke="#f0fdf4" strokeWidth="0.8" />
        </svg>
      )
    },
    {
      id: 'affiliate',
      badgeLabel: 'Affiliate',
      badgeIcon: <Users className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#9333ea]',
      title: 'Affiliate',
      description: 'অ্যাফিলিয়েট প্রোগ্রামে যোগ দিয়ে ইনকাম করুন সহজে।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#9333ea] hover:bg-[#7e22ce]',
      targetSection: 'affiliate',
      theme: {
        glassBg: 'bg-gradient-to-br from-fuchsia-400/30 via-purple-500/20 to-indigo-950/70',
        borderColor: 'border-fuchsia-300/60 hover:border-fuchsia-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(192,38,211,0.45)]',
        tileGradient: 'from-fuchsia-400 via-purple-500 to-indigo-700',
        tileBorder: 'border-purple-200/70',
        surfaceReflection: 'bg-fuchsia-500/30',
        buttonGradient: 'from-[#9333ea] to-[#7e22ce] hover:from-[#7e22ce] hover:to-[#6b21a8]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Shadow */}
          <ellipse cx="50" cy="78" rx="34" ry="6" fill="#2e1065" fillOpacity="0.45" filter="blur(2px)" />

          {/* Left Sleeve (Blue) */}
          <path d="M12 44L28 36C31 38 33 42 33 46L24 64C20 64 15 58 12 52L12 44Z" fill="#1d4ed8" />
          <path d="M14 42L28 35C30 37 32 40 32 43L24 61C21 61 17 56 14 51L14 42Z" fill="#3b82f6" />
          <ellipse cx="28.5" cy="48" rx="2.5" ry="9" transform="rotate(-30 28.5 48)" fill="#ffffff" fillOpacity="0.35" />

          {/* Right Sleeve (Gold/Orange) */}
          <path d="M88 44L72 36C69 38 67 42 67 46L76 64C80 64 85 58 88 52L88 44Z" fill="#b45309" />
          <path d="M86 42L72 35C70 37 68 40 68 43L76 61C79 61 83 56 86 51L86 42Z" fill="#f59e0b" />
          <ellipse cx="71.5" cy="48" rx="2.5" ry="9" transform="rotate(30 71.5 48)" fill="#ffffff" fillOpacity="0.35" />

          {/* Handshake: Left Hand */}
          <path d="M30 46C34 44 42 45 47 48L55 54C57 56 56 60 52 61L44 60L33 55C31 53 30 49 30 46Z" fill="#fbb6ce" />
          <path d="M31 45C35 43 43 44 48 47L56 53C58 55 57 59 53 60L45 59L34 54C32 52 31 48 31 45Z" fill="#fed7aa" />

          {/* Handshake: Right Hand */}
          <path d="M68 46C64 44 56 46 51 50L45 55C43 57 44 61 48 62L56 61L67 55C69 53 70 49 68 46Z" fill="#fdba74" />
          <path d="M67 45C63 43 55 45 50 49L44 54C42 56 43 60 47 61L55 60L66 54C68 52 69 48 67 45Z" fill="#ffedd5" />

          {/* Fingers */}
          <rect x="42" y="47" width="9" height="5" rx="2.5" transform="rotate(25 42 47)" fill="#fb923c" />
          <rect x="45" y="52" width="9" height="5" rx="2.5" transform="rotate(25 45 52)" fill="#f97316" />
          <rect x="48" y="57" width="9" height="5" rx="2.5" transform="rotate(25 48 57)" fill="#ea580c" />

          <rect x="49" y="46" width="9" height="5" rx="2.5" transform="rotate(-25 49 46)" fill="#fed7aa" />
          <rect x="46" y="51" width="9" height="5" rx="2.5" transform="rotate(-25 46 51)" fill="#fdba74" />
          <rect x="43" y="56" width="9" height="5" rx="2.5" transform="rotate(-25 43 56)" fill="#fb923c" />
        </svg>
      )
    },
    {
      id: 'membership',
      badgeLabel: 'Membership',
      badgeIcon: <Crown className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#15803d]',
      title: 'Membership',
      description: 'প্রিমিয়াম সুবিধা পেতে মেম্বারশিপ নিন এবং আরও বেশি সুবিধা উপভোগ করুন।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#15803d] hover:bg-[#166534]',
      targetSection: 'membership',
      theme: {
        glassBg: 'bg-gradient-to-br from-emerald-400/30 via-green-500/20 to-emerald-950/70',
        borderColor: 'border-emerald-300/60 hover:border-emerald-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(16,185,129,0.45)]',
        tileGradient: 'from-emerald-400 via-green-500 to-emerald-700',
        tileBorder: 'border-emerald-200/70',
        surfaceReflection: 'bg-emerald-500/30',
        buttonGradient: 'from-[#15803d] to-[#166534] hover:from-[#166534] hover:to-[#14532d]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Shadow */}
          <ellipse cx="50" cy="80" rx="34" ry="6" fill="#064e3b" fillOpacity="0.45" filter="blur(2px)" />

          {/* Crown Base Rim */}
          <path d="M22 66C32 70 68 70 78 66L77 71C67 75 33 75 23 71Z" fill="#b45309" />
          <path d="M22 64C32 68 68 68 78 64L78 67C68 71 32 71 22 67Z" fill="#d97706" />

          {/* Jewels */}
          <circle cx="34" cy="65.5" r="2.5" fill="#ef4444" />
          <circle cx="50" cy="66" r="3" fill="#3b82f6" />
          <circle cx="66" cy="65.5" r="2.5" fill="#10b981" />

          {/* Crown Body with 3 Peaks */}
          <path 
            d="M23 63L25 39C25 39 34 50 38 51C42 53 48 30 50 29C52 30 58 53 62 51C66 50 75 39 75 39L77 63C67 67 33 67 23 63Z" 
            fill="url(#goldCrownGrad2)" 
          />

          {/* Facets */}
          <path d="M50 29L47 52C49 53 51 53 53 52L50 29Z" fill="#fef08a" fillOpacity="0.75" />
          <path d="M25 39L35 52C36 51 37 51 38 51L25 39Z" fill="#fef08a" fillOpacity="0.65" />
          <path d="M75 39L65 52C64 51 63 51 62 51L75 39Z" fill="#fef08a" fillOpacity="0.5" />

          {/* 3 Spheres */}
          <circle cx="24" cy="37.5" r="3.5" fill="#fde047" />
          <circle cx="23" cy="36.5" r="1.5" fill="#ffffff" />

          <circle cx="50" cy="27" r="4.5" fill="#fde047" />
          <circle cx="49" cy="25.5" r="2" fill="#ffffff" />

          <circle cx="75" cy="37.5" r="3.5" fill="#fde047" />
          <circle cx="74" cy="36.5" r="1.5" fill="#ffffff" />

          <defs>
            <linearGradient id="goldCrownGrad2" x1="50" y1="28" x2="50" y2="67" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.3" stopColor="#fde047" />
              <stop offset="0.7" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'about',
      badgeLabel: 'About',
      badgeIcon: <Info className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#ea580c]',
      title: 'About',
      description: 'আমাদের সম্পর্কে জানুন এবং আমাদের লক্ষ্য ও উদ্দেশ্য সম্পর্কে পড়ুন।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#ea580c] hover:bg-[#c2410c]',
      targetSection: 'about',
      theme: {
        glassBg: 'bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-amber-950/70',
        borderColor: 'border-amber-300/60 hover:border-amber-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(249,115,22,0.45)]',
        tileGradient: 'from-amber-400 via-orange-500 to-amber-700',
        tileBorder: 'border-amber-200/70',
        surfaceReflection: 'bg-amber-500/30',
        buttonGradient: 'from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Shadow */}
          <ellipse cx="50" cy="80" rx="34" ry="6" fill="#451a03" fillOpacity="0.45" filter="blur(2px)" />

          {/* 3D Document Sheet */}
          <rect x="23" y="24" width="46" height="52" rx="10" fill="#93c5fd" />
          <rect x="22" y="22" width="46" height="52" rx="10" fill="#e0f2fe" />
          <rect x="24" y="23" width="42" height="48" rx="8" fill="#ffffff" />

          {/* Text Bars */}
          <rect x="30" y="32" width="22" height="4.5" rx="2.25" fill="#0284c7" />
          <rect x="30" y="40" width="30" height="3.5" rx="1.75" fill="#38bdf8" />
          <rect x="30" y="47" width="26" height="3.5" rx="1.75" fill="#7dd3fc" />
          <rect x="30" y="54" width="18" height="3.5" rx="1.75" fill="#bae6fd" />

          {/* Circular 3D Info Badge in Front */}
          <circle cx="68" cy="65" r="17" fill="#c2410c" />
          <circle cx="68" cy="62" r="15" fill="#f97316" />
          <circle cx="68" cy="62" r="13" stroke="#ffedd5" strokeWidth="1" strokeOpacity="0.5" />

          {/* Bold White "i" */}
          <circle cx="68" cy="55.5" r="2.5" fill="#ffffff" />
          <path d="M66 60C66 59 67 59 68 59C69 59 70 59 70 60V69C70 70 69 70 68 70C67 70 66 70 66 69V60Z" fill="#ffffff" />
          <path d="M65 61H68" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M65 69H71" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'terms',
      badgeLabel: 'Terms & Conditions',
      badgeIcon: <ShieldCheck className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#e11d48]',
      title: 'Terms & Conditions',
      description: 'ব্যবহারকারীর নিয়ম ও শর্তাবলী জেনে নিন, নিরাপদ থাকুন।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#e11d48] hover:bg-[#be123c]',
      targetSection: 'terms',
      theme: {
        glassBg: 'bg-gradient-to-br from-rose-400/30 via-red-500/20 to-rose-950/70',
        borderColor: 'border-rose-300/60 hover:border-rose-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(244,63,94,0.45)]',
        tileGradient: 'from-rose-400 via-red-500 to-rose-700',
        tileBorder: 'border-rose-200/70',
        surfaceReflection: 'bg-rose-500/30',
        buttonGradient: 'from-[#e11d48] to-[#be123c] hover:from-[#be123c] hover:to-[#9f1239]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Shadow */}
          <ellipse cx="50" cy="80" rx="34" ry="6" fill="#4c0519" fillOpacity="0.45" filter="blur(2px)" />

          {/* Crimson Rounded Plate */}
          <rect x="22" y="22" width="56" height="56" rx="16" fill="#be123c" />
          <rect x="24" y="22" width="52" height="50" rx="14" fill="#e11d48" />

          {/* 3D Blue Shield (Foreground) */}
          <path 
            d="M50 33C58 35 67 33 68 35C68 49 61 62 50 68C39 62 32 49 32 35C33 33 42 35 50 33Z" 
            fill="#2563eb" 
          />
          <path 
            d="M50 36C56 38 63 36 64 38C64 48 58 58 50 63C42 58 36 48 36 38C37 36 44 38 50 36Z" 
            fill="#3b82f6" 
          />

          {/* Glossy White Checkmark */}
          <path 
            d="M44 50L40 46C38.5 44.5 36.5 46.5 38 48L43 53C44 54 45.5 54 46.5 53L62 38C63.5 36.5 61.5 34.5 60 36L44 50Z" 
            fill="#ffffff" 
          />
        </svg>
      )
    },
    {
      id: 'faq',
      badgeLabel: 'FAQ',
      badgeIcon: <HelpCircle className="w-3 h-3 text-white" />,
      badgeColor: 'bg-[#0d9488]',
      title: 'FAQ',
      description: 'প্রায়শই জিজ্ঞাসিত প্রশ্নের উত্তর এখানে পাবেন সহজে।',
      buttonLabel: 'Explore',
      buttonColor: 'bg-[#0d9488] hover:bg-[#0f766e]',
      targetSection: 'faq',
      theme: {
        glassBg: 'bg-gradient-to-br from-teal-400/30 via-cyan-500/20 to-teal-950/70',
        borderColor: 'border-teal-300/60 hover:border-teal-200',
        glowShadow: 'hover:shadow-[0_16px_40px_rgba(20,184,166,0.45)]',
        tileGradient: 'from-teal-400 via-cyan-500 to-teal-700',
        tileBorder: 'border-teal-200/70',
        surfaceReflection: 'bg-teal-500/30',
        buttonGradient: 'from-[#0d9488] to-[#0f766e] hover:from-[#0f766e] hover:to-[#115e59]',
      },
      render3DIcon: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Shadow */}
          <ellipse cx="50" cy="80" rx="34" ry="6" fill="#134e4a" fillOpacity="0.45" filter="blur(2px)" />

          {/* 3D Cyan-Blue Chat Bubble */}
          <path 
            d="M50 21C34 21 23 32 23 45C23 52 27 58 33 62L29 73C28.5 74.5 30 75.5 31.5 74.5L42.5 68C45 69 47.5 69 50 69C66 69 77 58 77 45C77 32 66 21 50 21Z" 
            fill="#0284c7" 
          />

          {/* Reflection Rim */}
          <path 
            d="M32 28C37 25 43 24 50 24C62 24 71 31 73 40C70 33 62 27 50 27C42 27 36 29 32 32V28Z" 
            fill="#ffffff" 
            fillOpacity="0.45" 
          />

          {/* 3D White Question Mark (?) */}
          <circle cx="50" cy="58" r="3.2" fill="#ffffff" />
          <path 
            d="M44 37C44 32.5 47 30 50.5 30C54.5 30 57.5 32.5 57.5 36C57.5 39 55.5 41 53 43C51 44.5 50 46 50 49H47C47 45 49 43 51 41.5C53 40 54.5 38.5 54.5 36C54.5 34 52.5 32.5 50.5 32.5C48 32.5 46.5 34 46.5 37H44Z" 
            fill="#ffffff" 
          />
        </svg>
      )
    }
  ];

  return (
    <section 
      aria-label="eBookBazar নেভিগেশন কার্ড ড্যাশবোর্ড"
      className="w-full"
    >
      {/* Dark Emerald / Green Section Backdrop with Soft Ambient Lighting & Desk-style Reflection */}
      <div className="relative rounded-[26px] sm:rounded-[32px] md:rounded-[36px] p-3 sm:p-4.5 md:p-6 lg:p-7 bg-[#052212] border border-emerald-800/80 shadow-2xl overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 
          CSS GRID:
          - Desktop (lg): 3 cards per row, 2 rows (6 cards total)
          - Tablet (sm/md): 2 cards per row
          - Mobile: 2 columns (compact horizontal landscape cards with icon on left, text on right)
          - Landscape ratio: ~1.75:1 to 1.85:1 wide rectangular cards
        */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
          {cards.map((card) => {
            const isActive = currentView === card.targetSection;

            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(card.targetSection)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(card.targetSection);
                  }
                }}
                className={`group relative overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[26px] p-2.5 sm:p-3.5 md:p-4.5 lg:p-5 cursor-pointer select-none transition-all duration-300 ease-out border backdrop-blur-xl flex flex-row items-center justify-between gap-2.5 sm:gap-3.5 md:gap-4.5 aspect-[1.75/1] sm:aspect-[1.8/1] outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${card.theme.glassBg} ${card.theme.borderColor} ${card.theme.glowShadow} ${
                  isActive 
                    ? 'ring-2 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] -translate-y-1' 
                    : 'hover:-translate-y-1.5 active:scale-[0.985] shadow-lg shadow-black/35'
                }`}
              >
                {/* 1. Diagonal Specular Glass Reflection Sheen */}
                <div 
                  className="absolute -top-16 -left-16 w-44 sm:w-56 h-44 sm:h-56 bg-gradient-to-br from-white/35 via-white/10 to-transparent rounded-full blur-md pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform duration-500" 
                />

                {/* 2. Top Specular Glass Edge Highlight */}
                <div className="absolute top-0 inset-x-4 sm:inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                {/* 3. Surface Light Reflection underneath each card */}
                <div className={`absolute -bottom-8 inset-x-6 h-8 rounded-full blur-lg pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-75 ${card.theme.surfaceReflection}`} />

                {/* 
                  LEFT SIDE: 
                  3D Icon Container inside a rounded tilted plate
                */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <div 
                    className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[16px] sm:rounded-[20px] md:rounded-[22px] bg-gradient-to-br ${card.theme.tileGradient} ${card.theme.tileBorder} border shadow-xl flex items-center justify-center p-1 sm:p-2 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 relative overflow-hidden`}
                  >
                    {/* Glossy top overlay */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-[16px] sm:rounded-t-[20px] pointer-events-none" />
                    {card.render3DIcon()}
                  </div>
                </div>

                {/* 
                  RIGHT SIDE: 
                  Pill Badge + Title + Bengali Description + Explore Button
                */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 sm:py-1">
                  <div>
                    {/* Top Pill Badge */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-black text-white shadow-xs ${card.badgeColor}`}
                      >
                        {card.badgeIcon}
                        <span>{card.badgeLabel}</span>
                      </span>

                      {isActive && (
                        <span 
                          className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse shrink-0" 
                          title="বর্তমান সক্রিয় পেজ"
                        />
                      )}
                    </div>

                    {/* Card Title */}
                    <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight mt-1 sm:mt-1.5 group-hover:text-amber-200 transition-colors duration-200">
                      {card.title}
                    </h3>

                    {/* Bengali Description */}
                    <p className="text-slate-100/90 text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] font-medium leading-snug line-clamp-2 mt-0.5 transition-colors duration-200">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom Right Pill Button: Explore → */}
                  <div className="mt-1 sm:mt-2 self-end">
                    <span 
                      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 md:px-4 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] md:text-xs font-black transition-all duration-200 shadow-md text-white bg-gradient-to-r ${card.theme.buttonGradient} group-hover:brightness-110 active:scale-95`}
                    >
                      <span>{card.buttonLabel}</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
