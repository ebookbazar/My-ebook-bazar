import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, BookOpen, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Ebook, BlogPost } from '../types';

interface FloatingSearchProps {
  ebooks: Ebook[];
  blogPosts: BlogPost[];
  onSelectEbook: (ebook: Ebook) => void;
  onSelectBlogPost: (post: BlogPost) => void;
}

export const FloatingSearch: React.FC<FloatingSearchProps> = ({
  ebooks,
  blogPosts,
  onSelectEbook,
  onSelectBlogPost
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ebook' | 'blog'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const cleanQ = query.trim().toLowerCase();

  const matchingEbooks = useMemo(() => {
    if (!cleanQ) return [];
    return (ebooks || [])
      .filter(b => 
        (b.title || '').toLowerCase().includes(cleanQ) ||
        (b.author || '').toLowerCase().includes(cleanQ) ||
        (b.category || '').toLowerCase().includes(cleanQ)
      )
      .slice(0, 5);
  }, [cleanQ, ebooks]);

  const matchingBlogs = useMemo(() => {
    if (!cleanQ) return [];
    return (blogPosts || [])
      .filter(p => 
        (p.title || '').toLowerCase().includes(cleanQ) ||
        (p.category || '').toLowerCase().includes(cleanQ) ||
        (p.excerpt || '').toLowerCase().includes(cleanQ)
      )
      .slice(0, 4);
  }, [cleanQ, blogPosts]);

  const hasResults = matchingEbooks.length > 0 || matchingBlogs.length > 0;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="ই-বুক ও ব্লগ খুঁজুন"
        className="fixed bottom-24 right-6 z-40 bg-emerald-700/95 hover:bg-emerald-800 text-white p-3.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg shadow-emerald-950/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-emerald-500/40 group backdrop-blur-sm"
      >
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-200" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          দ্রুত খুঁজুন
        </span>
      </button>

      {/* Search Overlay Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] transition-all transform animate-in zoom-in-95 duration-200"
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
              <Search className="w-5 h-5 text-emerald-700 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ই-বুক, লেখক বা ব্লগের বিষয় খুঁজুন..."
                className="w-full bg-transparent text-slate-800 text-base sm:text-lg font-medium focus:outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg bg-slate-200/60 transition shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Filter Tabs */}
            {query && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/70 border-b border-slate-200/60 text-xs font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === 'all'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সব ({matchingEbooks.length + matchingBlogs.length})
                </button>
                <button
                  onClick={() => setFilterType('ebook')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === 'ebook'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ই-বুক ({matchingEbooks.length})
                </button>
                <button
                  onClick={() => setFilterType('blog')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === 'blog'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ব্লগ পোস্ট ({matchingBlogs.length})
                </button>
              </div>
            )}

            {/* Results Area */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {!cleanQ ? (
                <div className="text-center py-8 space-y-2 text-slate-500">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">যেকোনো ই-বুক বা ব্লগের নাম লিখুন</p>
                  <p className="text-xs text-slate-400">
                    বাস্তব ই-বুক ডাটাবেজ ও ব্লগার পোস্ট থেকে তাৎক্ষণিক ফলাফল দেখানো হবে
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="text-center py-8 space-y-2 text-slate-500">
                  <p className="text-sm font-bold text-slate-700">
                    &ldquo;{query}&rdquo; এর সাথে কোনো ফলাফল মেলেনি
                  </p>
                  <p className="text-xs text-slate-400">
                    দয়া করে বানান পরীক্ষা করুন বা অন্য কোনো কী-ওয়ার্ড দিয়ে চেষ্টা করুন
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matching Ebooks */}
                  {(filterType === 'all' || filterType === 'ebook') && matchingEbooks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>ই-বুকসমূহ ({matchingEbooks.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {matchingEbooks.map((book) => (
                          <div
                            key={book.id}
                            onClick={() => {
                              onSelectEbook(book);
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 cursor-pointer flex items-center justify-between gap-3 transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'}
                                alt={book.title}
                                className="w-10 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                                  {book.title}
                                </h4>
                                <p className="text-xs text-slate-500 truncate">
                                  লেখক: {book.author || 'অজ্ঞাতনামা'} • {book.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                                ৳{book.discountPrice || book.price}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Blogs */}
                  {(filterType === 'all' || filterType === 'blog') && matchingBlogs.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5" />
                        <span>ব্লগ পোস্টসমূহ ({matchingBlogs.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {matchingBlogs.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => {
                              onSelectBlogPost(post);
                              setIsOpen(false);
                            }}
                            className="p-2.5 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 cursor-pointer flex items-center justify-between gap-3 transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=200&auto=format&fit=crop'}
                                alt={post.title}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-slate-500 truncate">
                                  {post.category} • {post.date}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
