import React, { useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  Filter, 
  Layers, 
  TrendingUp, 
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { Ebook, EbookRatingSummary } from '../types';
import { EbookCard } from './EbookCard';

interface EbooksCatalogViewProps {
  ebooks: Ebook[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedLevel: string;
  setSelectedLevel: (lvl: string) => void;
  sortBy: 'latest' | 'price-low' | 'price-high';
  setSortBy: (sort: 'latest' | 'price-low' | 'price-high') => void;
  categories: string[];
  onViewDetails: (book: Ebook) => void;
  onBuyNow: (book: Ebook) => void;
  onShare: (book: Ebook) => void;
  ratingSummaries: Record<string, EbookRatingSummary>;
  onNavigateHome: () => void;
}

export const EbooksCatalogView: React.FC<EbooksCatalogViewProps> = React.memo(({
  ebooks,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  sortBy,
  setSortBy,
  categories,
  onViewDetails,
  onBuyNow,
  onShare,
  ratingSummaries,
  onNavigateHome
}) => {
  // Filter eBooks
  const filteredEbooks = useMemo(() => {
    let list = [...ebooks];

    // Category filter
    if (selectedCategory && selectedCategory !== 'সব বই') {
      list = list.filter(b => b.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel && selectedLevel !== 'all') {
      list = list.filter(b => (b.level || 'Beginner') === selectedLevel);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // 'latest' default: descending by createdAt or id
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return list;
  }, [ebooks, selectedCategory, selectedLevel, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-3 sm:pb-4 animate-fadeIn">
      {/* Top Navigation Bar with Back to Home Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-xs sm:text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-300 shadow-xs group cursor-pointer active:scale-95"
          title="মূল হোম পেজে ফিরে যান"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← মূল হোম পেজ (Home)</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>eBookBazar ডিজিটাল ই-বুক ক্যাটালগ ({filteredEbooks.length}টি বই উপলব্ধ)</span>
        </div>
      </div>

      {/* Main Filter & Search Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ডিজিটাল লাইব্রেরি ও মার্কেটপ্লেস</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              সকল বাংলা ই-বুক ক্যাটালগ
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1 font-medium">
              স্কিল ডেভেলপমেন্ট, প্রোগ্রামিং, সাহিত্য ও ক্যারিয়ার প্রস্তুতিমূলক ডিজিটাল বই সংগ্রহ
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-88">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বইয়ের নাম বা লেখক খুঁজুন..."
              className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label="সার্চ ক্লিয়ার করুন"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Scrolling Badges */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
              জনপ্রিয় বিভাগ অনুযায়ী দেখুন
            </h2>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none text-sm font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 shadow-xs cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#15803d] text-white shadow-emerald-700/25 ring-2 ring-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Level & Sort Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500">লেভেল:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    selectedLevel === lvl 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {lvl === 'all' ? 'সকল লেভেল' : lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="latest">নতুন বই আগে</option>
              <option value="price-low">মূল্য: কম থেকে বেশি</option>
              <option value="price-high">মূল্য: বেশি থেকে কম</option>
            </select>
          </div>
        </div>
      </div>

      {/* eBook Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-800">
            {selectedCategory === 'সব বই' ? 'সকল বই তালিকা' : `${selectedCategory} ক্যাটাগরির বই`}
            <span className="text-sm font-bold text-slate-500 ml-2">({filteredEbooks.length}টি)</span>
          </h2>
        </div>

        {filteredEbooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-800 text-xl">কোনো বই পাওয়া যায়নি</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              আপনার সার্চ কি-ওয়ার্ড অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('সব বই');
                setSearchQuery('');
                setSelectedLevel('all');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black px-6 py-3 rounded-2xl transition shadow-md active:scale-95 cursor-pointer"
            >
              সব বই পুনরায় দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {filteredEbooks.map((book) => (
              <EbookCard
                key={book.id}
                ebook={book}
                onViewDetails={onViewDetails}
                onBuyNow={onBuyNow}
                onShare={onShare}
                ratingSummary={ratingSummaries[book.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
