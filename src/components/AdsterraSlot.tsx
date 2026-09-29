import React, { useEffect, useRef } from 'react';
import { useAdsterra } from '../context/AdsterraContext';

export type AdPlacementType =
  | 'homepage'
  | 'blogListing'
  | 'blogArticle'
  | 'ebookListing'
  | 'ebookDetails';

interface AdsterraSlotProps {
  placement: AdPlacementType;
  className?: string;
  showBorder?: boolean;
}

export const AdsterraSlot: React.FC<AdsterraSlotProps> = ({
  placement,
  className = '',
  showBorder = true
}) => {
  const { config, isMobile } = useAdsterra();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Global switch check
  if (!config.enabled) {
    return null;
  }

  // 2. Device switch check
  if (isMobile && !config.mobileEnabled) {
    return null;
  }
  if (!isMobile && !config.desktopEnabled) {
    return null;
  }

  // 3. Placement specific switch check
  if (placement === 'homepage' && !config.homepageEnabled) return null;
  if (placement === 'blogListing' && !config.blogListingEnabled) return null;
  if (placement === 'blogArticle' && !config.blogArticleEnabled) return null;
  if (placement === 'ebookListing' && !config.ebookListingEnabled) return null;
  if (placement === 'ebookDetails' && !config.ebookDetailsEnabled) return null;

  // 4. Select Adsterra code (placement-specific priority, with fallback to device-specific code)
  let adCode = '';
  switch (placement) {
    case 'homepage':
      adCode = config.homepageAdCode?.trim() || '';
      break;
    case 'blogListing':
      adCode = config.blogListingAdCode?.trim() || '';
      break;
    case 'blogArticle':
      adCode = config.blogArticleAdCode?.trim() || '';
      break;
    case 'ebookListing':
      adCode = config.ebookListingAdCode?.trim() || '';
      break;
    case 'ebookDetails':
      adCode = config.ebookDetailsAdCode?.trim() || '';
      break;
  }

  // Fallback to mobile or desktop generic ad code if specific placement code is empty
  if (!adCode) {
    adCode = (isMobile ? config.mobileAdCode : config.desktopAdCode)?.trim() || '';
  }

  // If no official ad code has been pasted by the admin yet, do not render any empty or broken box
  if (!adCode) {
    return null;
  }

  // 5. Safe DOM Script Execution for Adsterra approved tags
  useEffect(() => {
    if (!containerRef.current || !adCode) return;
    const container = containerRef.current;
    container.innerHTML = '';

    try {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(adCode, 'text/html');

      // Append regular HTML elements (divs, iframes, etc.)
      Array.from(parsedDoc.body.childNodes).forEach((node) => {
        if (node.nodeName !== 'SCRIPT') {
          container.appendChild(node.cloneNode(true));
        }
      });

      // Execute scripts safely by creating fresh script tags
      const scripts = Array.from(parsedDoc.querySelectorAll('script'));
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.text = oldScript.text;
        container.appendChild(newScript);
      });
    } catch (err) {
      console.warn('Adsterra render notice:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [adCode]);

  return (
    <div
      className={`my-4 w-full flex flex-col items-center justify-center transition-all duration-300 ${
        showBorder
          ? 'bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs'
          : ''
      } ${className}`}
      data-adsterra-placement={placement}
    >
      {/* Visual Separation & Legitimate Publisher Advertising Notice (Bengali & English) */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>বিজ্ঞাপন • ADVERTISEMENT</span>
        </span>
        <span className="text-[9px] text-slate-500 hidden sm:inline">স্পনসরড কনটেন্ট</span>
      </div>

      {/* Target Container for Official Adsterra Unit */}
      <div
        ref={containerRef}
        className="w-full min-h-[50px] flex items-center justify-center overflow-hidden"
      />
    </div>
  );
};
