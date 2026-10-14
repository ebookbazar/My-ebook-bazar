import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, Smartphone } from 'lucide-react';
import { Ebook } from '../types';
import { 
  getPublicEbookUrl, 
  generateEbookShareText, 
  copyEbookLink, 
  shareViaNative, 
  getWhatsAppShareUrl, 
  getFacebookShareUrl 
} from '../utils/ebookShare';

interface EbookShareModalProps {
  ebook: Ebook | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EbookShareModal: React.FC<EbookShareModalProps> = ({
  ebook,
  isOpen,
  onClose
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen || !ebook) return null;

  const publicUrl = getPublicEbookUrl(ebook.id);
  const shareText = generateEbookShareText(ebook.title, publicUrl);
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopyLink = async () => {
    const success = await copyEbookLink(publicUrl);
    if (success) {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } else {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const handleNativeShare = async () => {
    const res = await shareViaNative({
      title: ebook.title,
      text: shareText,
      url: publicUrl
    });
    if (res === 'shared') {
      onClose();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = getWhatsAppShareUrl(shareText);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const fbUrl = getFacebookShareUrl(publicUrl);
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                eBook শেয়ার করুন
              </h3>
              <p className="text-xs text-slate-500 font-medium">বন্ধুদের সাথে বইয়ের লিংক শেয়ার করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book Preview Card */}
        <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <img 
            src={ebook.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f'} 
            alt={ebook.title} 
            className="w-14 h-18 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
          />
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md w-fit mb-1">
              {ebook.category || 'eBook'}
            </span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug">
              {ebook.title}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 truncate font-medium">
              লেখক: <span className="font-bold text-slate-800">{ebook.author || 'অজ্ঞাতনামা'}</span>
            </p>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 block">
            পাবলিক বুক লিংক
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={publicUrl} 
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95 ${
                copyStatus === 'success'
                  ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {copyStatus === 'success' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>লিংক কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Copy Feedback */}
          {copyStatus === 'success' && (
            <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>বইয়ের লিংক কপি হয়েছে!</span>
            </p>
          )}
          {copyStatus === 'error' && (
            <p className="text-xs text-rose-600 font-bold animate-fadeIn">
              লিংক কপি করা যায়নি। আবার চেষ্টা করুন।
            </p>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-black text-slate-700 block">
            সরাসরি অ্যাপে শেয়ার করুন
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপ (WhatsApp)</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleFacebookShare}
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>ফেসবুক (Facebook)</span>
            </button>
          </div>

          {/* Native Device Share (Android / iOS / Desktop browser share) */}
          {hasNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>অন্যান্য অ্যাপে শেয়ার করুন (ডিভাইস শেয়ার)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
