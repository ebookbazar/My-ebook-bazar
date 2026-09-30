import React, { useState } from 'react';
import { Smartphone, Download, AlertCircle, Sparkles } from 'lucide-react';
import { recordAppDownloadClick, formatAndValidateDownloadUrl } from '../services/appDownloadService';

interface AppDownloadBannerProps {
  title?: string;
  text?: string;
  url?: string;
  enabled?: boolean;
  active?: boolean;
}

export const AppDownloadBanner: React.FC<AppDownloadBannerProps> = ({
  title = '📱 eBookBazar App Download',
  text = 'মোবাইলে eBookBazar আরও সহজে ব্যবহার করতে App Download করুন।',
  url = '',
  enabled = true,
  active = true
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const rawUrl = (url || '').trim();
  const validation = formatAndValidateDownloadUrl(rawUrl);
  const targetUrl = validation.isValid && validation.formattedUrl ? validation.formattedUrl : rawUrl;
  
  // The button is active ONLY if:
  // 1. downloadUrl exists
  // 2. active === true (and enabled !== false)
  // 3. valid http:// or https:// URL format
  const isButtonActive = Boolean(
    active !== false &&
    enabled !== false &&
    targetUrl &&
    (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))
  );

  const handleDownloadClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isButtonActive) {
      e.preventDefault();
      return;
    }

    if (isProcessing) {
      e.preventDefault();
      return;
    }

    setIsProcessing(true);

    try {
      // Record download button click count atomically in Firebase
      await recordAppDownloadClick();
    } catch (err) {
      console.error('App download click tracking notice:', err);
    } finally {
      // Re-enable after delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-emerald-300">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200">
          <Smartphone className="w-6 h-6 text-emerald-700" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>মোবাইল অ্যাপ</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {text}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center sm:self-center">
        {isButtonActive ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownloadClick}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-emerald-800 text-white font-black px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-xs sm:text-sm whitespace-nowrap ${
              isProcessing ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Download App"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download App</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              alert('অ্যাপ্লিকেশন ডাউনলোড লিঙ্ক শীঘ্রই অ্যাডমিন প্যানেল থেকে সক্রিয় করা হবে।');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition active:scale-95 cursor-pointer"
            title="App Download লিঙ্ক শীঘ্রই অ্যাডমিন প্যানেল থেকে যুক্ত করা হবে"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>লিংক শীঘ্রই আসছে</span>
          </button>
        )}
      </div>
    </div>
  );
};
