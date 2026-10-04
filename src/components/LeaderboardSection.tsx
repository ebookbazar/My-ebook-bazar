import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  MessageSquare, 
  Plus, 
  ShieldCheck, 
  User, 
  ShoppingBag, 
  CreditCard, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send,
  CornerDownRight,
  Filter,
  Check
} from 'lucide-react';
import { 
  LeaderboardPost, 
  LeaderboardRole, 
  LeaderboardPostType 
} from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeToApprovedLeaderboardPosts, 
  submitLeaderboardPost 
} from '../services/leaderboardService';

interface LeaderboardSectionProps {
  onOpenAuthModal: (mode?: 'user-login' | 'user-register') => void;
}

const POST_TYPES: { id: LeaderboardPostType; label: string; icon: string }[] = [
  { id: 'Payment Experience', label: 'পেমেন্ট অভিজ্ঞতা', icon: '💳' },
  { id: 'eBook Purchase Experience', label: 'ই-বুক ক্রয় অভিজ্ঞতা', icon: '📚' },
  { id: 'Seller Experience', label: 'সেলার অভিজ্ঞতা', icon: '💼' },
  { id: 'Problem / Issue', label: 'সমস্যা ও সমাধান', icon: '⚠️' },
  { id: 'Suggestion', label: 'পরামর্শ ও প্রস্তাব', icon: '💡' },
  { id: 'General Feedback', label: 'সাধারণ ফিডব্যাক', icon: '⭐' }
];

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ onOpenAuthModal }) => {
  const { currentUser, userProfile, isAdmin } = useAuth();

  const [posts, setPosts] = useState<LeaderboardPost[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    role: LeaderboardRole;
    postType: LeaderboardPostType;
    comment: string;
  }>({
    name: '',
    role: 'User',
    postType: 'eBook Purchase Experience',
    comment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subscribe to real-time approved posts from Firebase RTDB
  useEffect(() => {
    const unsub = subscribeToApprovedLeaderboardPosts((approvedList) => {
      setPosts(approvedList);
    });
    return () => unsub();
  }, []);

  // Update default name & role when modal opens
  const handleOpenModal = () => {
    if (!currentUser) {
      onOpenAuthModal('user-login');
      return;
    }

    const defaultRole: LeaderboardRole = 
      userProfile?.role === 'seller' ? 'Seller' : 'Buyer';

    const defaultName = 
      userProfile?.fullName || 
      userProfile?.username || 
      currentUser.displayName || 
      currentUser.email?.split('@')[0] || 
      'সম্মানিত পাঠক';

    setFormData({
      name: defaultName,
      role: defaultRole,
      postType: 'eBook Purchase Experience',
      comment: ''
    });
    setSubmitStatus(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal('user-login');
      return;
    }

    if (formData.comment.trim().length < 5) {
      setSubmitStatus({
        type: 'error',
        message: 'অনুগ্রহ করে অন্তত ৫ অক্ষরের অর্থবহ মন্তব্য লিখুন।'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitLeaderboardPost({
        userId: currentUser.uid,
        name: formData.name.trim() || 'সম্মানিত ইউজার',
        role: formData.role,
        postType: formData.postType,
        comment: formData.comment.trim()
      });

      setSubmitStatus({
        type: 'success',
        message: 'আপনার মূল্যবান মতামত সফলভাবে জমা হয়েছে! অ্যাডমিনের অনুমোদনের পর তা লিডারবোর্ডে প্রদর্শিত হবে।'
      });

      // Clear comment
      setFormData(prev => ({ ...prev, comment: '' }));

      // Auto close modal after 2.5 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus(null);
      }, 2500);
    } catch (err: any) {
      setSubmitStatus({
        type: 'error',
        message: err?.message || 'মতামত পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (selectedTypeFilter === 'all') return true;
    return p.postType === selectedTypeFilter;
  });

  const displayedPosts = showAll ? filteredPosts : filteredPosts.slice(0, 6);

  // Role Badge Helper
  const renderRoleBadge = (role: LeaderboardRole) => {
    switch (role) {
      case 'Seller':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            <ShoppingBag className="w-3 h-3 text-indigo-600" />
            <span>সেলার</span>
          </span>
        );
      case 'Buyer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CreditCard className="w-3 h-3 text-emerald-600" />
            <span>ক্রেতা (Buyer)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <User className="w-3 h-3 text-blue-600" />
            <span>ইউজার</span>
          </span>
        );
    }
  };

  // Post Type Badge Helper
  const getPostTypeLabel = (type: LeaderboardPostType) => {
    const found = POST_TYPES.find(t => t.id === type);
    return found ? `${found.icon} ${found.label}` : type;
  };

  return (
    <section id="leaderboard" aria-label="eBookBazar Leaderboard" className="pt-8 border-t border-slate-200 space-y-6 scroll-mt-24">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide mb-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>কমিউনিটি ফিডব্যাক ও অভিজ্ঞতা</span>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>🏆 eBookBazar Leaderboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            আমাদের User, Seller ও Buyer-দের বাস্তব অভিজ্ঞতা ও মতামত
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenModal}
          className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl transition shadow-md flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Share Your Experience</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedTypeFilter === 'all'
              ? 'bg-[#15803d] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          সকল মতামত ({posts.length})
        </button>

        {POST_TYPES.map((pt) => {
          const count = posts.filter(p => p.postType === pt.id).length;
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => setSelectedTypeFilter(pt.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedTypeFilter === pt.id
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{pt.icon}</span>
              <span>{pt.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  selectedTypeFilter === pt.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Posts Cards Grid */}
      {displayedPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <MessageSquare className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="font-black text-slate-900 text-base sm:text-lg">
            {selectedTypeFilter === 'all' 
              ? 'এখনও কোনো অনুমোদিত মতামত নেই' 
              : 'এই ক্যাটাগরিতে কোনো মতামত পাওয়া যায়নি'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            আপনার পেমেন্ট, বই পড়া বা সেলার অভিজ্ঞতা শেয়ার করে কমিউনিটির প্রথম মতামত দিন!
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="bg-[#15803d] hover:bg-emerald-800 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ অভিজ্ঞতা শেয়ার করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative"
            >
              {/* User Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {post.name ? post.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                          {post.name}
                        </h4>
                        {renderRoleBadge(post.role)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {new Date(post.approvedAt || post.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-xl shrink-0">
                    {getPostTypeLabel(post.postType)}
                  </span>
                </div>

                {/* User Comment */}
                <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/60">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-normal">
                    "{post.comment}"
                  </p>
                </div>
              </div>

              {/* Admin Reply Section (if present) */}
              {post.adminReply && (
                <div className="pt-2">
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>🛡️ eBookBazar Admin</span>
                      </div>
                      <span className="text-[10px] text-emerald-700/80 font-medium">
                        {new Date(post.adminReply.updatedAt || post.adminReply.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed whitespace-pre-wrap pl-5 font-medium">
                      {post.adminReply.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View All Toggle Button */}
      {filteredPosts.length > 6 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-800 border border-slate-300 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition shadow-xs inline-flex items-center gap-2"
          >
            <span>{showAll ? 'সংক্ষিপ্ত করুন' : `View All (${filteredPosts.length}টি সকল মতামত)`}</span>
          </button>
        </div>
      )}

      {/* SHARE YOUR EXPERIENCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg">Share Your Experience</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/80 hover:text-white transition"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitStatus && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
                  submitStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              {/* 1. Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার নাম (Name):
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
                  maxLength={60}
                />
              </div>

              {/* 2. Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  আপনার ভূমিকা (Role):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['User', 'Seller', 'Buyer'] as LeaderboardRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`p-2.5 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1.5 ${
                        formData.role === r
                          ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r === 'Seller' && <ShoppingBag className="w-3.5 h-3.5" />}
                      {r === 'Buyer' && <CreditCard className="w-3.5 h-3.5" />}
                      {r === 'User' && <User className="w-3.5 h-3.5" />}
                      <span>{r === 'User' ? 'ইউজার' : r === 'Seller' ? 'সেলার' : 'ক্রেতা'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Post Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মতামতের ধরন (Post Type):
                </label>
                <select
                  value={formData.postType}
                  onChange={(e) => setFormData({ ...formData, postType: e.target.value as LeaderboardPostType })}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 font-bold"
                >
                  {POST_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.icon} {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Comment / Message */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    আপনার অভিজ্ঞতা বা মতামত (Comment):
                  </label>
                  <span className={`text-[10px] font-bold ${
                    formData.comment.length > 550 ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {formData.comment.length} / ৬০০ অক্ষর
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="আপনার বাস্তব অভিজ্ঞতা, পেমেন্ট সংক্রান্ত অনুভূতি বা পরামর্শ বিস্তারিত লিখুন..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 leading-relaxed"
                  maxLength={600}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * স্প্যাম ও অপ্রীতিকর মন্তব্য রোধে আপনার পোস্টটি অ্যাডমিন কর্তৃক অনুমোদিত হওয়ার পর প্রকাশিত হবে।
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.comment.trim().length < 5}
                  className="bg-[#15803d] hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'জমা হচ্ছে...' : 'মতামত সাবমিট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
