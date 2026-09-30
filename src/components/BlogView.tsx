import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Check, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  PlusCircle,
  Tag
} from 'lucide-react';
import { BlogPost, Ebook } from '../types';

interface BlogViewProps {
  posts: BlogPost[];
  allEbooks?: Ebook[];
  activePost: BlogPost | null;
  setActivePost: (post: BlogPost | null) => void;
  onNavigateHome: () => void;
  isAdmin?: boolean;
  onDeleteDemo?: () => void;
  onOpenAdminBlogManager?: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  posts,
  allEbooks = [],
  activePost,
  setActivePost,
  onNavigateHome,
  isAdmin = false,
  onDeleteDemo,
  onOpenAdminBlogManager
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Extract real labels present in the actual posts (Ensures: Post-এর প্রকৃত Label না থাকলে নিজে থেকে fake category তৈরি করবেন না)
  const actualPostLabels = Array.from(new Set(
    posts.flatMap(p => [p.category, ...(p.labels || [])]).filter(Boolean)
  ));
  
  // Display 'সব', followed only by actual labels found in real posts
  const categories = ['সব', ...actualPostLabels];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'সব') return true;
    if (post.category === selectedCategory) return true;
    if (post.labels && post.labels.includes(selectedCategory)) return true;
    return false;
  });

  const handleShare = (post: BlogPost) => {
    const url = post.url || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // 1. FULL BLOG POST CONTENT VIEW (When an article is active)
  if (activePost) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => {
              setActivePost(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল ব্লগ পোস্টে ফিরে যান</span>
          </button>

          <div className="flex items-center gap-2">
            {activePost.url && (
              <a
                href={activePost.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
                title="Blogger-এর মূল লিংকে দেখুন"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>মূল লিংক</span>
              </a>
            )}

            <button
              onClick={() => handleShare(activePost)}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition"
              title="পোস্ট শেয়ার করুন"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">লিংক কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Full Blog Post Content Card */}
        <article className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200 shadow-sm space-y-8">
          {/* Category & Labels */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#15803d] text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-xs">
                {activePost.category || 'ব্লগ পোস্ট'}
              </span>
              {activePost.labels && activePost.labels.length > 0 && activePost.labels.filter(l => l !== activePost.category).map(label => (
                <span key={label} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-xl border border-slate-200">
                  #{label}
                </span>
              ))}
            </div>

            {activePost.isDemo && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
                ডেমো কনটেন্ট
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug tracking-tight">
            {activePost.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 font-semibold border-y border-slate-100 py-3.5">
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                {activePost.author.charAt(0)}
              </div>
              <div>
                <span className="text-slate-900 font-bold block">{activePost.author}</span>
                {activePost.authorRole && (
                  <span className="text-[11px] text-slate-400 block -mt-0.5">{activePost.authorRole}</span>
                )}
              </div>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{activePost.date}</span>
            </span>

            {activePost.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{activePost.readTime} পাঠ</span>
              </span>
            )}
          </div>

          {/* Featured Cover Image (with safe responsive layout) */}
          {activePost.coverImage && (
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={activePost.coverImage}
                alt={activePost.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt Lead Box */}
          {activePost.excerpt && (
            <div className="p-5 sm:p-6 bg-emerald-50/70 border-l-4 border-[#15803d] rounded-r-2xl text-emerald-950 font-bold text-base sm:text-lg leading-relaxed shadow-xs">
              {activePost.excerpt}
            </div>
          )}

          {/* FULL BLOG POST CONTENT (Preserve original formatting, Bengali text, paragraphs, headings and images) */}
          <div className="space-y-6 text-slate-800 text-base sm:text-lg leading-relaxed">
            {activePost.htmlContent ? (
              <div 
                className="prose prose-emerald max-w-none space-y-4 leading-relaxed font-normal [&>p]:leading-relaxed [&>p]:mb-4 [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-slate-900 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>img]:rounded-2xl [&>img]:my-6 [&>img]:max-w-full [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
                dangerouslySetInnerHTML={{ __html: activePost.htmlContent }}
              />
            ) : (
              <div className="space-y-5">
                {activePost.content && activePost.content.map((paragraph, idx) => (
                  <p key={idx} className="text-justify leading-relaxed font-normal text-slate-800">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action Banner inside Post */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1 max-w-lg">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ই-বুক মার্কেটপ্লেস
              </span>
              <h3 className="text-lg sm:text-xl font-black">
                বাস্তব জ্ঞানের বই পড়ে নিজের ক্যারিয়ার গড়ুন
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                আমাদের প্ল্যাটফর্মে রয়েছে শত শত প্রিমিয়াম বাংলা ই-বুক ও ক্যারিয়ার গাইড।
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl transition shadow flex items-center gap-2 shrink-0"
            >
              <span>ই-বুক মার্কেটপ্লেস দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </article>

        {/* Related Articles Suggestions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>অন্যান্য গুরুত্বপূর্ণ ব্লগ পোস্টসমূহ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts
              .filter(p => p.id !== activePost.id)
              .slice(0, 4)
              .map(related => (
                <div
                  key={related.id}
                  onClick={() => {
                    setActivePost(related);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer flex gap-4 items-center group"
                >
                  <img
                    src={related.coverImage}
                    alt={related.title}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                      {related.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-semibold block mt-1">
                      {related.date}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. BLOG LISTING VIEW
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Blog Hub Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#15803d] text-xs font-black">
              <BookOpen className="w-4 h-4" />
              <span>অফিসিয়াল ব্লগ ও লার্নিং হাব</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              ডিজিটাল স্কিল, ক্যারিয়ার ও ই-বুক পাবলিশিং ব্লগ
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              অনলাইন স্কিল ডেভেলপমেন্ট, ফ্রিল্যান্সিং ক্যারিয়ার, ই-বুক প্রকাশনা এবং আধুনিক প্রযুক্তির বাস্তবসম্মত নির্দেশিকা। যেকোনো আর্টিকেলের সম্পূর্ণ তথ্য পড়তে নিচে ক্লিক করুন।
            </p>
          </div>

          {/* Quick Admin Actions if Admin is viewing */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && onDeleteDemo && (
              <button
                onClick={onDeleteDemo}
                className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                title="ডেমো পোস্টগুলো মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>ডেমো পোস্ট ডিলিট করুন</span>
              </button>
            )}
            {isAdmin && onOpenAdminBlogManager && (
              <button
                onClick={onOpenAdminBlogManager}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>নতুন ব্লগ পোস্ট লিখুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Structured according to user's Bangla category presets & Blogger labels) */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#15803d] text-white shadow-sm ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <BookOpen className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">কোনো ব্লগ পোস্ট পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            এই ক্যাটাগরিতে এখনো কোনো পোস্ট প্রকাশিত হয়নি। অন্য কোনো ক্যাটাগরি বেছে নিন অথবা 'সব' ক্যাটাগরিতে দেখুন।
          </p>
          <button
            onClick={() => setSelectedCategory('সব')}
            className="mt-2 bg-[#15803d] text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            সব পোস্ট দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const isExpanded = expandedCardId === post.id;
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Image */}
                  <div 
                    onClick={() => {
                      setActivePost(post);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="aspect-[16/10] overflow-hidden bg-slate-100 relative cursor-pointer"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#15803d]/95 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl shadow-md border border-emerald-500/30">
                      {post.category}
                    </span>
                    {post.isDemo && (
                      <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
                        ডেমো
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{post.date}</span>
                      </span>
                      {post.readTime && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{post.readTime}</span>
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => {
                        setActivePost(post);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="font-black text-slate-900 text-base sm:text-lg lg:text-xl leading-snug group-hover:text-emerald-700 transition cursor-pointer"
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>

                    {/* INLINE EXPANDED CONTENT PREVIEW */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 text-xs sm:text-sm text-slate-700 animate-fadeIn bg-slate-50 p-3 rounded-2xl border">
                        <div className="font-bold text-emerald-900 text-xs">ব্লগ পোস্টের মূল কনটেন্ট:</div>
                        {post.htmlContent ? (
                          <div 
                            className="space-y-2 max-h-60 overflow-y-auto leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                          />
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {post.content.map((par, pIdx) => (
                              <p key={pIdx} className="leading-relaxed text-justify">{par}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                  {/* Inline quick preview toggle */}
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : post.id)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-100 transition"
                    title="পোস্টের সম্পূর্ণ কনটেন্ট প্রিভিউ দেখুন"
                  >
                    <span>{isExpanded ? 'সংক্ষেপ করুন' : 'কনটেন্ট প্রিভিউ'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Full Post Reader Button */}
                  <button
                    onClick={() => {
                      setActivePost(post);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-[#15803d] border border-emerald-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition shadow-xs group-hover:bg-[#15803d] group-hover:text-white group-hover:border-transparent"
                  >
                    <span>সম্পূর্ণ পড়ুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
