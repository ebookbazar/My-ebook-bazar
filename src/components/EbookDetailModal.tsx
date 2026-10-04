import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Zap, 
  BookOpen, 
  Crown, 
  ShoppingBag, 
  ShieldCheck, 
  Star, 
  User as UserIcon, 
  Trash2, 
  Send, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { Ebook, EbookRating, EbookRatingSummary } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { isEbookAdminOwned } from '../utils/ebookOwnership';
import { StarRating } from './StarRating';
import { 
  subscribeToBookReviews, 
  submitOrUpdateRating, 
  deleteEbookRating,
  calculateRatingSummary 
} from '../services/ratingService';

interface EbookDetailModalProps {
  ebook: Ebook | null;
  onClose: () => void;
  onBuyNow: (ebook: Ebook) => void;
  onOpenPreview?: (url: string, title: string) => void;
  onOpenAuthModal?: () => void;
  ratingSummary?: EbookRatingSummary;
}

export const EbookDetailModal: React.FC<EbookDetailModalProps> = ({
  ebook,
  onClose,
  onBuyNow,
  onOpenPreview,
  onOpenAuthModal,
  ratingSummary: initialSummary,
}) => {
  const { addToCart } = useCart();
  const { currentUser, userProfile, isAdmin } = useAuth();

  const [reviews, setReviews] = useState<EbookRating[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Rating input state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Subscribe to real-time ratings for this ebook
  useEffect(() => {
    if (!ebook?.id) return;
    setStatusMessage(null);
    setIsEditing(false);

    const unsub = subscribeToBookReviews(ebook.id, (loadedReviews) => {
      setReviews(loadedReviews);
    });

    return () => unsub();
  }, [ebook?.id]);

  // Find if current logged-in user already rated
  const existingUserReview = currentUser 
    ? reviews.find(r => r.userId === currentUser.uid) 
    : null;

  // Sync user's existing rating into form
  useEffect(() => {
    if (existingUserReview) {
      setUserRating(existingUserReview.rating);
      setUserComment(existingUserReview.review || '');
    } else {
      setUserRating(5);
      setUserComment('');
      setIsEditing(false);
    }
  }, [existingUserReview]);

  if (!ebook) return null;

  // Compute live rating summary
  const computedSummary = calculateRatingSummary(ebook.id, reviews);
  const currentSummary = computedSummary.totalRatings > 0 
    ? computedSummary 
    : (initialSummary || computedSummary);

  const isAdminBook = isEbookAdminOwned(ebook);
  const regularPrice = ebook.regularPrice || (ebook.discountPrice && ebook.discountPrice < ebook.price ? ebook.price : ebook.price);
  const salePrice = ebook.discountPrice ? Math.min(ebook.discountPrice, ebook.price) : (ebook.regularPrice && ebook.regularPrice > ebook.price ? ebook.price : ebook.price);
  const oldPrice = Math.max(regularPrice, ebook.price);
  const isDiscounted = oldPrice > salePrice;

  const handleAddToCart = () => {
    addToCart({
      id: ebook.id,
      title: ebook.title,
      author: ebook.author,
      coverUrl: ebook.coverUrl,
      price: salePrice,
      qty: 1,
      sellerId: ebook.sellerId,
      sellerName: ebook.sellerName,
      sellerEmail: ebook.sellerEmail,
      sellerReferralCode: ebook.sellerReferralCode,
      isSeller: !isAdminBook
    });
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (userRating < 1 || userRating > 5) {
      setStatusMessage({ type: 'error', text: 'অনুগ্রহ করে ১ থেকে ৫ স্টার নির্বাচন করুন।' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await submitOrUpdateRating({
        bookId: ebook.id,
        rating: userRating,
        review: userComment,
        user: currentUser,
        userProfile
      });

      setStatusMessage({ 
        type: 'success', 
        text: existingUserReview 
          ? 'আপনার রেটিং ও রিভিউ সফলভাবে আপডেট হয়েছে!' 
          : 'আপনার ৫-স্টার রেটিং দেওয়ার জন্য ধন্যবাদ!' 
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err?.message || 'রেটিং সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (userId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?')) return;
    setDeletingUserId(userId);
    try {
      await deleteEbookRating(ebook.id, userId);
      setStatusMessage({ type: 'success', text: 'রিভিউটি সফলভাবে মুছে ফেলা হয়েছে।' });
    } catch (err) {
      console.error('Failed to delete review:', err);
      setStatusMessage({ type: 'error', text: 'রিভিউ মুছতে সমস্যা হয়েছে।' });
    } finally {
      setDeletingUserId(null);
    }
  };

  // Helper for star percentage breakdown
  const getRatingPercentage = (starNum: number) => {
    if (!currentSummary.totalRatings || currentSummary.totalRatings === 0) return 0;
    const count = currentSummary.ratingCounts?.[starNum as 1 | 2 | 3 | 4 | 5] || 0;
    return Math.round((count / currentSummary.totalRatings) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-base sm:text-lg">ই-বুক বিস্তারিত বিবরণ ও রিভিউ</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 sm:px-6 gap-2 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-black transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-[#15803d] text-[#15803d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বইয়ের বিবরণ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-black transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#15803d] text-[#15803d]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>রেটিং ও রিভিউ ({currentSummary.totalRatings})</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
              {/* Cover Column */}
              <div className="space-y-3">
                <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  <img 
                    src={ebook.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'} 
                    alt={ebook.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {ebook.pdfUrl && onOpenPreview && (
                  <button
                    type="button"
                    onClick={() => onOpenPreview(ebook.pdfUrl, ebook.title)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-sm py-2.5 rounded-2xl border border-emerald-300 flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>বই প্রিভিউ পড়ুন</span>
                  </button>
                )}

                {/* Rating summary snapshot on left card */}
                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/70 transition space-y-1"
                >
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide block">
                    গ্রাহক মূল্যায়ন
                  </span>
                  <StarRating
                    rating={currentSummary.averageRating}
                    totalRatings={currentSummary.totalRatings}
                    size="sm"
                    compact={false}
                  />
                  <span className="text-[11px] text-emerald-800 font-bold hover:underline block pt-0.5">
                    রিভিউ দেখুন বা রেটিং দিন →
                  </span>
                </div>
              </div>

              {/* Details Column */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdminBook ? (
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Crown className="w-4 h-4 fill-slate-950 text-slate-950" />
                        <span>অ্যাডমিন ই-বুক (৫০৳ রেফারেল বোনাস)</span>
                      </span>
                    ) : (
                      <span className="bg-indigo-600 text-white text-xs sm:text-sm font-black px-3.5 py-1 rounded-xl shadow-md border-2 border-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                        <ShoppingBag className="w-4 h-4" />
                        <span>সেলার ই-বুক</span>
                      </span>
                    )}
                    <span className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black px-3 py-1 rounded-full">
                      {ebook.category}
                    </span>
                    {ebook.level && (
                      <span className="bg-amber-100 text-amber-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
                        {ebook.level}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {ebook.title}
                  </h2>

                  <p className="text-sm md:text-base text-slate-700 font-bold">
                    লেখক: <span className="text-slate-950 font-black">{ebook.author || 'অজ্ঞাতনামা'}</span>
                  </p>

                  {ebook.sellerName && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      প্রকাশক / বিক্রেতা: <span className="font-bold text-slate-700">{ebook.sellerName}</span>
                    </p>
                  )}

                  {/* 5-Star Rating Row */}
                  <div className="py-1">
                    <StarRating
                      rating={currentSummary.averageRating}
                      totalRatings={currentSummary.totalRatings}
                      size="md"
                      compact={false}
                    />
                  </div>

                  {/* Pricing Box */}
                  <div className="flex items-baseline gap-3 py-1.5">
                    {isDiscounted && (
                      <span className="text-sm sm:text-base text-slate-400 line-through font-bold">
                        ৳{oldPrice}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                      ৳{salePrice}
                    </span>
                    {isDiscounted && (
                      <span className="bg-rose-100 text-rose-700 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg">
                        সেভ ৳{oldPrice - salePrice}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-xs sm:text-sm text-slate-800 mb-2">বইয়ের বিবরণ:</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                      {ebook.description || 'এই বইটির জন্য বিস্তারিত বিবরণ যোগ করা হয়নি।'}
                    </p>
                  </div>

                  {/* Referral Earning Rule Badge */}
                  <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                    isAdminBook 
                      ? 'bg-amber-50 border-amber-300 text-amber-950' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  }`}>
                    {isAdminBook ? (
                      <p>
                        ⭐ <b>৫০৳ রেফারেল কমিশন প্রযোজ্য:</b> এটি অ্যাডমিন ই-বুক। কোনো ক্রেতা আপনার রেফারেল কোড ব্যবহার করে এটি কিনলে এবং অ্যাডমিন অনুমোদন দিলে আপনার অ্যাকাউন্টে ৫০ টাকা জমা হবে।
                      </p>
                    ) : (
                      <p>
                        ℹ️ <b>সেলার ই-বুক:</b> এটি সেলার কর্তৃক প্রকাশিত বই। নিয়ম অনুযায়ী সেলার ই-বুক ক্রয়ের ক্ষেত্রে কোনো রেফারেল কমিশন প্রযোজ্য নয়।
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 pt-1 font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>অর্ডার অনুমোদনের পর সরাসরি লাইব্রেরি থেকে PDF ডাউনলোড ও পড়ার সুবিধা</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-2xl transition shadow flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>কার্টে রাখুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBuyNow(ebook);
                    }}
                    className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm py-3 rounded-2xl transition shadow flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>এখনই কিনুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* REVIEWS & RATINGS TAB */
            <div className="space-y-6">
              {/* Summary Showcase Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Overall Rating */}
                <div className="text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full inline-block">
                    গ্রাহক রেটিং বিশ্লেষণ
                  </span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {currentSummary.averageRating > 0 ? currentSummary.averageRating.toFixed(1) : '০.০'}
                    </span>
                    <span className="text-base text-slate-400 font-bold">/ ৫.০</span>
                  </div>

                  <div className="flex justify-center md:justify-start">
                    <StarRating
                      rating={currentSummary.averageRating}
                      totalRatings={currentSummary.totalRatings}
                      size="md"
                      showCount={false}
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    {currentSummary.totalRatings > 0 
                      ? `সর্বমোট ${currentSummary.totalRatings}টি বাস্তব রেটিং এর উপর ভিত্তি করে`
                      : 'এখনও কোনো রেটিং প্রদান করা হয়নি। আপনিই প্রথম রেটিং দিন!'}
                  </p>
                </div>

                {/* Right: 5-Star Breakdown Bars */}
                <div className="space-y-1.5 text-xs font-bold text-slate-600">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = getRatingPercentage(star);
                    const count = currentSummary.ratingCounts?.[star as 1 | 2 | 3 | 4 | 5] || 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-12 text-slate-700 flex items-center gap-0.5 shrink-0 font-black">
                          {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-slate-400 font-medium text-[11px] shrink-0">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Message Notification */}
              {statusMessage && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* User Rating Box (Submission / Edit) */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{existingUserReview && !isEditing ? 'আপনার দেওয়া রেটিং' : 'আপনার ৫-স্টার রেটিং প্রদান করুন'}</span>
                  </h4>
                  {existingUserReview && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>রেটিং পরিবর্তন করুন</span>
                    </button>
                  )}
                </div>

                {!currentUser ? (
                  /* Prompt to Log In */
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      বইটিতে ৫-স্টার রেটিং বা রিভিউ দিতে আপনার অ্যাকাউন্টে লগইন করুন।
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAuthModal) onOpenAuthModal();
                      }}
                      className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow transition active:scale-95"
                    >
                      লগইন করুন
                    </button>
                  </div>
                ) : existingUserReview && !isEditing ? (
                  /* Existing User Rating Display */
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {existingUserReview.userName}
                        </span>
                        <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-black px-2 py-0.5 rounded-md">
                          ভেরিফাইড রেটিং
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(existingUserReview.updatedAt || existingUserReview.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <StarRating
                        rating={existingUserReview.rating}
                        totalRatings={1}
                        size="sm"
                        showCount={false}
                      />
                      <span className="text-xs font-black text-amber-700">
                        ({existingUserReview.rating} স্টার)
                      </span>
                    </div>

                    {existingUserReview.review ? (
                      <p className="text-xs sm:text-sm text-slate-700 italic pt-1 whitespace-pre-wrap">
                        "{existingUserReview.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">কোনো লিখিত মন্তব্য প্রদান করা হয়নি।</p>
                    )}
                  </div>
                ) : (
                  /* Form to Rate / Update */
                  <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ১ থেকে ৫ স্টার নির্বাচন করুন:
                      </label>
                      <StarRating
                        interactive={true}
                        value={userRating}
                        onChange={(r) => setUserRating(r)}
                        size="md"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        আপনার পর্যালোচনা ও মতামত (ঐচ্ছিক):
                      </label>
                      <textarea
                        rows={3}
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="বইটি কেমন লেগেছে? আপনার সৎ মতামত লিখুন..."
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                        maxLength={500}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                          বাতিল
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#15803d] hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : existingUserReview ? 'রেটিং আপডেট করুন' : 'রেটিং জমা দিন'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* All Customer Reviews List */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>পাঠকদের মন্তব্য ও পর্যালোচনা ({reviews.length})</span>
                </h4>

                {reviews.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 space-y-1">
                    <Star className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                    <p className="font-bold text-xs sm:text-sm">এখনও কোনো লিখিত পর্যালোচনা নেই</p>
                    <p className="text-xs">বইটি পড়ে প্রথম মতামত দিন!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => {
                      const isOwner = currentUser && rev.userId === currentUser.uid;
                      return (
                        <div 
                          key={rev.userId} 
                          className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 transition space-y-2 relative group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h5 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                                  <span>{rev.userName}</span>
                                  {isOwner && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                      আপনি
                                    </span>
                                  )}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <StarRating
                                    rating={rev.rating}
                                    totalRatings={1}
                                    size="xs"
                                    showCount={false}
                                  />
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(rev.updatedAt || rev.createdAt).toLocaleDateString('bn-BD')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Admin or Owner Delete Option */}
                            {(isAdmin || isOwner) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.userId)}
                                disabled={deletingUserId === rev.userId}
                                title={isAdmin ? "অনুপযুক্ত রিভিউ মুছে ফেলুন (অ্যাডমিন)" : "আপনার রিভিউ মুছুন"}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {rev.review && (
                            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap pl-10 leading-relaxed font-normal">
                              {rev.review}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
