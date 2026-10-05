import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export interface SlideItem {
  id: number;
  src: string;
  alt: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    src: '/slide-1.webp',
    alt: 'শৈশবে ফিরে যাওয়া — গ্রামের বর্ষায় উঠানে বৃষ্টির পানিতে শিশুর আনন্দ ও হারিকেনের আলোয় শান্ত পড়াশোনা'
  },
  {
    id: 2,
    src: '/slide-2.webp',
    alt: 'শীতের সকালে মায়ের ডাক — শীতের কুয়াশায় পিঠার সুবাস ও গ্রামের উঠানের শৈশবের স্মৃতি'
  },
  {
    id: 3,
    src: '/slide-3.webp',
    alt: 'গ্রামের পাকা ব্রিজে বন্ধুদের আড্ডা — চায়ের কাপে গল্প, মাঠে ফুটবল ও সোনালী বিকেল'
  },
  {
    id: 4,
    src: '/slide-4.webp',
    alt: 'একটি চিঠি বদলে দিতে পারে একটি পরিবার — অপেক্ষার শেষে সুখবর ও পারিবারিক আনন্দ'
  },
  {
    id: 5,
    src: '/slide-5.webp',
    alt: 'গ্রাম থেকেই শুরু হোক স্বপ্নের ব্যবসা — অনলাইনে ব্যবসা ও নারীদের স্বাবলম্বী হওয়ার আনন্দ'
  }
];

export const ImageSlideshow: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bengali numerals for the subtle slide counter
  const toBanglaDigits = (num: number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay timer every 5 seconds
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Accessible keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPaused((p) => !p);
    }
  };

  return (
    <section 
      aria-label="ই-বুকবাজার বিশেষ ইমেজ স্লাইডশো"
      className="w-full max-w-6xl mx-auto"
    >
      {/* Subtle Premium Green & Gold Gradient Border Container (18-20px rounded) */}
      <div className="rounded-[18px] md:rounded-[20px] p-[1.5px] bg-gradient-to-r from-emerald-600/35 via-amber-400/30 to-emerald-600/35 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-950/10 transition-all duration-300">
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="group relative w-full aspect-[16/9] rounded-[17px] md:rounded-[19px] overflow-hidden bg-slate-900 border border-emerald-900/10 select-none focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
        >
          {/* Slides: Unobstructed Images with exact 16:9 ratio & subtle slow zoom */}
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={1152}
                  height={648}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding={idx === 0 ? 'sync' : 'async'}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out will-change-transform ${
                    isActive ? 'scale-[1.03]' : 'scale-100'
                  }`}
                />
              </div>
            );
          })}

          {/* Minimalist Top Control Pill (Counter & Play/Pause) */}
          <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-20 flex items-center gap-1.5 pointer-events-auto">
            <div className="px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/15 text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-xs flex items-center gap-1">
              <span className="text-emerald-400">{toBanglaDigits(currentIndex + 1)}</span>
              <span className="text-slate-400">/</span>
              <span>{toBanglaDigits(SLIDES.length)}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'স্লাইডশো চালু করুন' : 'স্লাইডশো থামান'}
              title={isPaused ? 'চালু করুন' : 'থামান'}
              className="p-1 sm:p-1.5 rounded-full bg-slate-950/50 hover:bg-emerald-700/80 backdrop-blur-md border border-white/15 text-white transition-all transform active:scale-95 shadow-xs"
            >
              {isPaused ? (
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300" />
              ) : (
                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              )}
            </button>
          </div>

          {/* Previous Slide Button */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="পূর্ববর্তী স্লাইড"
            title="পূর্ববর্তী স্লাইড"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-emerald-700 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 opacity-75 sm:opacity-0 group-hover:opacity-100 shadow-md active:scale-90 focus:opacity-100 focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Next Slide Button */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="পরবর্তী স্লাইড"
            title="পরবর্তী স্লাইড"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/40 hover:bg-emerald-700 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 opacity-75 sm:opacity-0 group-hover:opacity-100 shadow-md active:scale-90 focus:opacity-100 focus:outline-none"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Clean Bottom Dot Indicators */}
          <div 
            role="tablist" 
            aria-label="স্লাইড নির্বাচন"
            className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/15"
          >
            {SLIDES.map((slide, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`স্লাইড ${toBanglaDigits(idx + 1)}`}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full focus:outline-none ${
                    isCurrent
                      ? 'w-4 sm:w-5 h-1.5 bg-emerald-400 shadow-xs shadow-emerald-400/50'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>

          {/* Subtle Bottom Loading Progress Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500 ease-linear"
              style={{ width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
