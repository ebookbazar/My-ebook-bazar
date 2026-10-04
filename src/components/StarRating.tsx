import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  totalRatings?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  compact?: boolean;
  interactive?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  totalRatings = 0,
  size = 'sm',
  showCount = true,
  compact = false,
  interactive = false,
  value,
  onChange,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base'
  };

  // Interactive Star Selector (for user rating input)
  if (interactive) {
    const activeValue = hoverRating !== null ? hoverRating : (value || rating || 0);

    const labels: Record<number, string> = {
      1: '★ ১ - খারাপ',
      2: '★★ ২ - মোটামুটি',
      3: '★★★ ৩ - ভালো',
      4: '★★★★ ৪ - খুব ভালো',
      5: '★★★★★ ৫ - অসাধারণ'
    };

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((starNum) => {
            const isFilled = starNum <= activeValue;
            return (
              <button
                key={starNum}
                type="button"
                onClick={() => onChange && onChange(starNum)}
                onMouseEnter={() => setHoverRating(starNum)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 rounded-lg transition-transform active:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 group"
                aria-label={`রেটিং দিন ${starNum} স্টার`}
              >
                <Star
                  className={`${starSizes[size]} transition-colors duration-150 ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                      : 'fill-slate-100 text-slate-300 group-hover:text-amber-300'
                  }`}
                />
              </button>
            );
          })}
          {activeValue > 0 && (
            <span className="font-black text-amber-700 text-xs sm:text-sm ml-2 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200">
              {labels[activeValue] || `${activeValue} স্টার`}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Display Mode:
  // If no ratings yet (totalRatings === 0 or rating === 0)
  const hasRatings = (totalRatings ?? 0) > 0 && rating > 0;

  if (!hasRatings) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${starSizes[size]} fill-transparent text-slate-300 stroke-[1.5]`}
              aria-hidden="true"
            />
          ))}
        </div>
        {showCount && (
          <span className={`${textSizes[size]} text-slate-400 font-semibold select-none`}>
            No ratings yet
          </span>
        )}
      </div>
    );
  }

  // Has ratings: Display accurate filled / half / empty stars
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - (starIndex - 1)));
          const isFull = fillPercentage >= 0.8;
          const isHalf = fillPercentage >= 0.3 && fillPercentage < 0.8;

          if (isFull) {
            return (
              <Star
                key={starIndex}
                className={`${starSizes[size]} fill-amber-400 text-amber-400`}
                aria-hidden="true"
              />
            );
          } else if (isHalf) {
            // Render half star with SVG gradient
            const gradId = `half-star-${starIndex}-${Math.round(rating * 10)}`;
            return (
              <div key={starIndex} className="relative inline-flex items-center">
                <svg className={starSizes[size]} viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id={gradId}>
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#f1f5f9" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#${gradId})`}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
            );
          } else {
            return (
              <Star
                key={starIndex}
                className={`${starSizes[size]} fill-slate-100 text-slate-300 stroke-[1.5]`}
                aria-hidden="true"
              />
            );
          }
        })}
      </div>

      <div className="flex items-baseline gap-1 select-none">
        <span className={`${textSizes[size]} font-black text-slate-800`}>
          {rating.toFixed(1)}
        </span>
        {showCount && (
          <span className={`${textSizes[size]} text-slate-500 font-semibold`}>
            {compact ? `(${totalRatings})` : `(${totalRatings} ratings)`}
          </span>
        )}
      </div>
    </div>
  );
};
