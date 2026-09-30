import React from 'react';
import { X, Calendar, Clock, User, Share2, BookOpen, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onExploreEbooks: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ post, onClose, onExploreEbooks }) => {
  if (!post) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('আর্টিকেল লিংক ক্লিপবোর্ডে কপি হয়েছে!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Cover Image */}
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                <span>{post.author} ({post.authorRole})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{post.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{post.readTime} পাঠ</span>
              </span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-sm sm:text-base text-emerald-950 font-bold leading-relaxed">
            {post.excerpt}
          </div>

          {/* Full Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            {post.content.map((p, idx) => (
              <p key={idx} className="text-justify leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Call to action */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-black text-slate-900 text-base sm:text-lg">সম্পর্কিত ই-বুক পড়ে নিজেকে প্রস্তুত করুন</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">eBookBazar মার্কেটপ্লেসে রয়েছে শত শত নির্ভরযোগ্য বাংলা ই-বুক।</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleShare}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 text-xs sm:text-sm font-bold"
                title="শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
                <span>শেয়ার</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onExploreEbooks();
                }}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>বই দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
