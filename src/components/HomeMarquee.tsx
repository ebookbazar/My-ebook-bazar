import React from 'react';
import { Megaphone, Settings, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { MarqueeSettings } from '../types';

interface HomeMarqueeProps {
  settings: MarqueeSettings;
  isAdmin?: boolean;
  onOpenAdminSettings?: () => void;
}

export const HomeMarquee: React.FC<HomeMarqueeProps> = React.memo(({
  settings,
  isAdmin,
  onOpenAdminSettings
}) => {
  if (settings.enabled === false) {
    return null;
  }

  // Calculate speed duration (seconds)
  let duration = '28s';
  if (typeof (settings as any).speedDuration === 'number' && (settings as any).speedDuration > 0) {
    duration = `${(settings as any).speedDuration}s`;
  } else if (settings.speed === 'slow') {
    duration = '45s';
  } else if (settings.speed === 'fast') {
    duration = '18s';
  }

  const text = settings.text || 'নতুন eBook প্রকাশিত হয়েছে! এখনই দেখে নিন এবং আপনার জ্ঞানের ভাণ্ডার সমৃদ্ধ করুন।';
  const bgColor = settings.bgColor || '#f0fdf4';
  const textColor = settings.textColor || '#064e3b';

  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-xs border border-emerald-200/90 select-none group transition-all"
      style={{ backgroundColor: bgColor || '#eaf7ee', color: textColor || '#064e3b' }}
      role="region"
      aria-label="ঘোষণা মারকুই"
    >
      <div className="flex items-center h-11 sm:h-12 px-3 sm:px-4 gap-2 sm:gap-3">
        {/* Left Megaphone Announcement Icon & Label matching IMAGE 1 */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 text-emerald-800">
          <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 animate-pulse" />
          <span className="font-black text-xs sm:text-sm text-[#064e3b] shrink-0 whitespace-nowrap">
            গুরুত্বপূর্ণ নোটিশ:
          </span>
        </div>

        {/* Scrolling text container */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="whitespace-nowrap flex items-center will-change-transform group-hover:[animation-play-state:paused]"
            style={{
              animation: `marqueeScroll ${duration} linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            <span className="font-bold text-xs sm:text-sm tracking-wide inline-block pr-16">
              {text}
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-wide inline-block pr-16" aria-hidden="true">
              {text}
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-wide inline-block pr-16" aria-hidden="true">
              {text}
            </span>
          </div>
        </div>

        {/* Right Arrow & Pause Controls matching reference design */}
        <div className="shrink-0 flex items-center gap-1 text-emerald-700 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs">
          <button 
            type="button"
            className="p-1 rounded-full hover:bg-black/5 text-emerald-800 transition cursor-pointer"
            aria-label="পূর্ববর্তী ঘোষণা"
            title="পূর্ববর্তী ঘোষণা"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-full hover:bg-black/5 text-emerald-800 transition cursor-pointer"
            aria-label={isPaused ? "চালান" : "থামুন"}
            title={isPaused ? "চালান" : "থামুন"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-800" /> : <Pause className="w-3 h-3 text-emerald-800" />}
          </button>
          <button 
            type="button"
            className="p-1 rounded-full hover:bg-black/5 text-emerald-800 transition cursor-pointer"
            aria-label="পরবর্তী ঘোষণা"
            title="পরবর্তী ঘোষণা"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Admin Quick Settings trigger if logged in as Admin */}
          {isAdmin && onOpenAdminSettings && (
            <button
              onClick={onOpenAdminSettings}
              type="button"
              className="ml-1 p-1 rounded-full bg-emerald-800 text-white hover:bg-emerald-900 transition cursor-pointer"
              title="মারকুই নোটিশ এডিট করুন (Admin)"
              aria-label="মারকুই নোটিশ এডিট করুন"
            >
              <Settings className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded inline keyframes for marqueeScroll */}
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
});
