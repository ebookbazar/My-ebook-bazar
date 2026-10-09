import React, { useState, useEffect, useMemo } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  Tag, 
  Percent, 
  Store, 
  Calculator, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  ArrowRight, 
  Search, 
  Share2, 
  Sparkles, 
  CheckCircle, 
  ShoppingBag, 
  Info,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { FreeToolConfig, ToolId } from '../types/freeTools';
import { DEFAULT_FREE_TOOLS } from '../data/defaultFreeTools';
import { BlogPost, Ebook } from '../types';
import { updateDocumentSeo } from '../utils/blogSeo';

interface FreeToolsViewProps {
  tools?: FreeToolConfig[];
  selectedToolId?: ToolId | null;
  onSelectTool?: (toolId: ToolId | null) => void;
  onNavigateHome: () => void;
  onOpenBlog?: (post: BlogPost) => void;
  onViewEbook?: (book: Ebook) => void;
  onAddToCart?: (book: Ebook) => void;
  allBlogPosts?: BlogPost[];
  allEbooks?: Ebook[];
}

export const FreeToolsView: React.FC<FreeToolsViewProps> = ({
  tools = DEFAULT_FREE_TOOLS,
  selectedToolId: propSelectedToolId = null,
  onSelectTool,
  onNavigateHome,
  onOpenBlog,
  onViewEbook,
  onAddToCart,
  allBlogPosts = [],
  allEbooks = []
}) => {
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(propSelectedToolId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedText, setCopiedText] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (propSelectedToolId !== undefined) {
      setActiveToolId(propSelectedToolId);
    }
  }, [propSelectedToolId]);

  const handleToolChange = (id: ToolId | null) => {
    setActiveToolId(id);
    if (onSelectTool) {
      onSelectTool(id);
    }
    if (typeof window !== 'undefined') {
      if (id) {
        window.history.pushState(null, '', `#tools/${id}`);
      } else {
        window.history.pushState(null, '', '#tools');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTool = useMemo(() => {
    if (!activeToolId) return null;
    return tools.find(t => t.id === activeToolId || t.slug === activeToolId);
  }, [tools, activeToolId]);

  // Dynamic SEO sync for Free Tools and individual calculators
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;

    if (activeTool) {
      const canonical = `${origin}/tools/${activeTool.slug || activeTool.id}`;
      updateDocumentSeo({
        title: activeTool.seoTitle || `${activeTool.name} — ফ্রি অনলাইন ক্যালকুলেটর`,
        description: activeTool.metaDescription || activeTool.description,
        canonicalUrl: canonical,
        keywords: activeTool.keywords || [activeTool.name, activeTool.shortName, 'ফ্রি ক্যালকুলেটর', 'eBookBazar']
      });
    } else {
      const canonical = `${origin}/tools`;
      updateDocumentSeo({
        title: 'ফ্রি অনলাইন ক্যালকুলেটর ও স্মার্ট টুলস — সঞ্চয়, লাভ, ছাড় ও শতকরা হিসাব',
        description: 'eBookBazar ফ্রি স্মার্ট টুলস: কোনো লগইন বা রেজিস্ট্রেশন ছাড়াই সঞ্চয়, মুনাফা, ছাড়, শতকরা ও দোকান লাভ মুহূর্তেই বের করার আধুনিক ফ্রি টুলস।',
        canonicalUrl: canonical,
        keywords: ['ফ্রি টুলস', 'সঞ্চয় ক্যালকুলেটর', 'মুনাফা ক্যালকুলেটর', 'ছাড় ক্যালকুলেটর', 'শতকরা ক্যালকুলেটর', 'দোকান লাভ ক্যালকুলেটর', 'eBookBazar']
      });
    }
  }, [activeTool]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach(t => {
      if (t.enabled && t.category) set.add(t.category);
    });
    return ['all', ...Array.from(set)];
  }, [tools]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    return tools
      .filter(t => t.enabled)
      .filter(t => {
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          t.name.toLowerCase().includes(q) ||
          t.shortName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.keywords && t.keywords.some(k => k.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [tools, selectedCategory, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Render Tool Icon dynamically
  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'PiggyBank': return <PiggyBank className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Tag': return <Tag className={className} />;
      case 'Percent': return <Percent className={className} />;
      case 'Store': return <Store className={className} />;
      default: return <Calculator className={className} />;
    }
  };

  return (
    <div className="space-y-8 animate-soft-fade-in pb-16">
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-10 text-white shadow-xl overflow-hidden border border-emerald-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>১০০% ফ্রি অনলাইন ক্যালকুলেটর ও টুলস</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            eBookBazar <span className="text-amber-300">ফ্রি স্মার্ট টুলস</span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            কোনো রেজিস্ট্রেশন বা লগইন ছাড়াই হিসাব করুন আপনার মাসিক সঞ্চয়, ব্যবসার নিট মুনাফা, কেনাকাটার ছাড়, শতকরা হার ও দোকানের প্রকৃত লাভ।
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleToolChange(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                !activeToolId ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>সব টুলস দেখুন</span>
            </button>

            {tools.filter(t => t.enabled).map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  activeToolId === tool.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                }`}
              >
                {renderIcon(tool.icon, "w-3.5 h-3.5")}
                <span>{tool.shortName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      {!activeTool ? (
        /* TOOL DIRECTORY / GRID */
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="টুলসের নাম বা কীওয়ার্ড খুঁজুন (যেমন: সঞ্চয়, লাভ, ছাড়, শতকরা)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-[#15803d] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'সকল বিভাগ' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
              >
                {tool.featured && (
                  <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                    জনপ্রিয়
                  </span>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-[#15803d] group-hover:text-white transition-all shadow-xs">
                    {renderIcon(tool.icon, "w-6 h-6")}
                  </div>

                  <div>
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider block mb-1">
                      {tool.category}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#15803d] transition">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-700">
                  <span>হিসাব করুন</span>
                  <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-[#15803d] group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">কোনো টুল পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500">অন্য কোনো নাম দিয়ে সার্চ করুন অথবা ফিল্টার পরিবর্তন করুন।</p>
            </div>
          )}
        </div>
      ) : (
        /* INDIVIDUAL TOOL VIEW */
        <div className="space-y-8">
          {/* Back button and breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleToolChange(null)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>সকল ফ্রি টুলস-এ ফিরে যান</span>
            </button>

            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              ক্যাটাগরি: <strong className="text-emerald-700">{activeTool.category}</strong>
            </span>
          </div>

          {/* If the tool is turned OFF by Admin, show friendly unavailable message */}
          {!activeTool.enabled ? (
            <div className="bg-white rounded-3xl border border-amber-200/80 p-8 sm:p-12 text-center shadow-md space-y-5 animate-scale-up">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                <Info className="w-8 h-8 text-amber-600" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeTool.name} সাময়িকভাবে অনুপলব্ধ
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  অ্যাডমিন কর্তৃক এই টুলটির সেবা বর্তমানে বন্ধ রাখা হয়েছে। আপনি অন্যান্য চালু ফ্রি ক্যালকুলেটরসমূহ স্বচ্ছন্দে ব্যবহার করতে পারেন।
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleToolChange(null)}
                  className="bg-[#15803d] hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md transition active:scale-95 inline-flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>অন্যান্য চালু ফ্রি টুলস দেখুন</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ACTIVE TOOL CARD / CALCULATOR */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-md">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#15803d] flex items-center justify-center">
                      {renderIcon(activeTool.icon, "w-5 h-5")}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {activeTool.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {activeTool.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Render Specific Calculator Component */}
                {activeTool.id === 'savings-calculator' && <SavingsCalculator onCopy={copyToClipboard} copiedText={copiedText} />}
                {activeTool.id === 'profit-calculator' && <ProfitCalculator onCopy={copyToClipboard} copiedText={copiedText} />}
                {activeTool.id === 'discount-calculator' && <DiscountCalculator onCopy={copyToClipboard} copiedText={copiedText} />}
                {activeTool.id === 'percentage-calculator' && <PercentageCalculator onCopy={copyToClipboard} copiedText={copiedText} />}
                {activeTool.id === 'shop-profit-calculator' && <ShopProfitCalculator onCopy={copyToClipboard} copiedText={copiedText} />}
              </div>

              {/* FUTURE ADMOB PLACEHOLDER (Only rendered if showAdPlaceholder is true) */}
              {activeTool.showAdPlaceholder && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    বিজ্ঞাপন স্থান (Ad Placement — Future Android App)
                  </span>
                  <p className="text-xs text-slate-400">এই স্থানটি ভবিষ্যতের মোবাইল অ্যাপ ভার্সনের জন্য সংরক্ষিত।</p>
                </div>
              )}

              {/* RELATED CONTENT: BLOG POSTS */}
              <RelatedBlogSection 
                blogPosts={allBlogPosts} 
                activeTool={activeTool} 
                onOpenBlog={onOpenBlog} 
              />

              {/* RELATED CONTENT: EBOOKS */}
              <RelatedEbookSection 
                ebooks={allEbooks} 
                activeTool={activeTool} 
                onViewEbook={onViewEbook}
                onAddToCart={onAddToCart}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. SAVINGS CALCULATOR (সঞ্চয় ক্যালকুলেটর)
// ==========================================
const SavingsCalculator: React.FC<{ onCopy: (text: string) => void; copiedText: boolean }> = ({ onCopy, copiedText }) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(45000);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(28000);
  const [otherExpense, setOtherExpense] = useState<number>(5000);

  const totalExpense = Math.max(0, (monthlyExpense || 0) + (otherExpense || 0));
  const monthlySavings = Math.max(0, (monthlyIncome || 0) - totalExpense);
  const yearlySavings = monthlySavings * 12;
  const savingsPercentage = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

  const handleReset = () => {
    setMonthlyIncome(0);
    setMonthlyExpense(0);
    setOtherExpense(0);
  };

  const handleSample = () => {
    setMonthlyIncome(50000);
    setMonthlyExpense(30000);
    setOtherExpense(5000);
  };

  const summaryText = `eBookBazar সঞ্চয় হিসাব:\nমাসিক আয়: ৳${monthlyIncome}\nমোট মাসিক খরচ: ৳${totalExpense}\nমাসিক নিট সঞ্চয়: ৳${monthlySavings}\nবাৎসরিক সঞ্চয়: ৳${yearlySavings}\nসঞ্চয়ের হার: ${savingsPercentage}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input 1 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">মাসিক আয় (Monthly Income) ৳</label>
          <input
            type="number"
            min="0"
            value={monthlyIncome || ''}
            onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৫০,০০০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        {/* Input 2 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">মাসিক নিয়মিত খরচ (Regular Expense) ৳</label>
          <input
            type="number"
            min="0"
            value={monthlyExpense || ''}
            onChange={(e) => setMonthlyExpense(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৩০,০০০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        {/* Input 3 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">অন্যান্য / বিবিধ খরচ (Other Expense) ৳</label>
          <input
            type="number"
            min="0"
            value={otherExpense || ''}
            onChange={(e) => setOtherExpense(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৫,০০০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSample}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition"
        >
          💡 নমুনা তথ্য দিয়ে দেখুন
        </button>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট (Reset)</span>
        </button>
      </div>

      {/* RESULTS DISPLAY */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-6 border border-emerald-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
          <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <span>সঞ্চয়ের ফলাফল ও পরিসংখ্যান</span>
          </h3>
          <button
            onClick={() => onCopy(summaryText)}
            className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition flex items-center gap-1.5 shadow-xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'কপি হয়েছে!' : 'হিসাব কপি করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মাসিক নিট সঞ্চয়</span>
            <span className="text-2xl font-black text-emerald-700">৳{monthlySavings.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-slate-400 block mt-1">আয় থেকে খরচ বাদে</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">বাৎসরিক মোট সঞ্চয়</span>
            <span className="text-2xl font-black text-teal-800">৳{yearlySavings.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-slate-400 block mt-1">১২ মাসে মোট জমা</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">সঞ্চয়ের শতকরা হার</span>
            <span className="text-2xl font-black text-amber-600">{savingsPercentage}%</span>
            <span className="text-[11px] text-slate-400 block mt-1">মোট আয়ের সাপেক্ষে</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>সঞ্চয় অনুপাত অগ্রগতি</span>
            <span>{savingsPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                savingsPercentage >= 30 ? 'bg-emerald-600' : savingsPercentage >= 15 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, savingsPercentage))}%` }}
            />
          </div>
        </div>

        {/* Tip */}
        <div className="text-xs font-medium text-emerald-900 bg-emerald-100/60 p-3 rounded-xl border border-emerald-200">
          💡 <strong>পরামর্শ:</strong> আদর্শ অর্থনৈতিক নিয়ম অনুসারে আয়ের কমপক্ষে ২০% থেকে ৩০% নিয়মিত সঞ্চয় করা উচিত।
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PROFIT CALCULATOR (মুনাফা ক্যালকুলেটর)
// ==========================================
const ProfitCalculator: React.FC<{ onCopy: (text: string) => void; copiedText: boolean }> = ({ onCopy, copiedText }) => {
  const [purchasePrice, setPurchasePrice] = useState<number>(450);
  const [sellingPrice, setSellingPrice] = useState<number>(650);
  const [quantity, setQuantity] = useState<number>(15);

  const totalCost = (purchasePrice || 0) * (quantity || 0);
  const totalSales = (sellingPrice || 0) * (quantity || 0);
  const totalProfit = totalSales - totalCost;
  const unitProfit = (sellingPrice || 0) - (purchasePrice || 0);
  const profitPercentage = totalCost > 0 ? Math.round((totalProfit / totalCost) * 100 * 10) / 10 : 0;

  const handleReset = () => {
    setPurchasePrice(0);
    setSellingPrice(0);
    setQuantity(0);
  };

  const summaryText = `eBookBazar মুনাফা হিসাব:\nক্রয় মূল্য: ৳${purchasePrice}\nবিক্রয় মূল্য: ৳${sellingPrice}\nপরিমাণ: ${quantity} টি\nমোট ক্রয় খরচ: ৳${totalCost}\nমোট বিক্রয় মূল্য: ৳${totalSales}\nমোট নিট লাভ: ৳${totalProfit}\nমুনাফার হার: ${profitPercentage}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">ক্রয় মূল্য (প্রতি ইউনিট) ৳</label>
          <input
            type="number"
            min="0"
            value={purchasePrice || ''}
            onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৪৫০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">বিক্রয় মূল্য (প্রতি ইউনিট) ৳</label>
          <input
            type="number"
            min="0"
            value={sellingPrice || ''}
            onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৬৫০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">পরিমাণ (Quantity)</label>
          <input
            type="number"
            min="1"
            value={quantity || ''}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            placeholder="যেমন: ১৫"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setPurchasePrice(500); setSellingPrice(750); setQuantity(20); }}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition"
        >
          💡 নমুনা তথ্য দিয়ে দেখুন
        </button>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-6 border border-emerald-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
          <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>মুনাফার হিসাব ও বিশ্লেষণ</span>
          </h3>
          <button
            onClick={() => onCopy(summaryText)}
            className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition flex items-center gap-1.5 shadow-xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'কপি হয়েছে!' : 'হিসাব কপি করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মোট ক্রয় খরচ</span>
            <span className="text-xl font-black text-slate-800">৳{totalCost.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মোট বিক্রয় মূল্য</span>
            <span className="text-xl font-black text-slate-800">৳{totalSales.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মোট নিট লাভ</span>
            <span className={`text-xl font-black ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              ৳{totalProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ইউনিট প্রতি ৳{unitProfit}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মুনাফার হার (Margin)</span>
            <span className={`text-xl font-black ${profitPercentage >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {profitPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. DISCOUNT CALCULATOR (ছাড় ক্যালকুলেটর)
// ==========================================
const DiscountCalculator: React.FC<{ onCopy: (text: string) => void; copiedText: boolean }> = ({ onCopy, copiedText }) => {
  const [originalPrice, setOriginalPrice] = useState<number>(1200);
  const [discountPercent, setDiscountPercent] = useState<number>(20);

  const discountAmount = Math.round(((originalPrice || 0) * (discountPercent || 0)) / 100);
  const finalPrice = Math.max(0, (originalPrice || 0) - discountAmount);

  const handleReset = () => {
    setOriginalPrice(0);
    setDiscountPercent(0);
  };

  const summaryText = `eBookBazar ছাড় হিসাব:\nআসল মূল্য: ৳${originalPrice}\nছাড়ের হার: ${discountPercent}%\nছাড়ের পরিমাণ: ৳${discountAmount}\nপরিশোধযোগ্য মূল্য: ৳${finalPrice}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">আসল মূল্য (Original Price) ৳</label>
          <input
            type="number"
            min="0"
            value={originalPrice || ''}
            onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ১২০০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">ছাড়ের হার (Discount %) </label>
          <input
            type="number"
            min="0"
            max="100"
            value={discountPercent || ''}
            onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
            placeholder="যেমন: ২০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[10, 15, 20, 25, 30, 50].map(pct => (
          <button
            key={pct}
            onClick={() => setDiscountPercent(pct)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              discountPercent === pct ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {pct}%
          </button>
        ))}
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition ml-auto"
        >
          রিসেট
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-white rounded-2xl p-6 border border-amber-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" />
            <span>ছাড়ের ফলাফল</span>
          </h3>
          <button
            onClick={() => onCopy(summaryText)}
            className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition flex items-center gap-1.5 shadow-xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'কপি হয়েছে!' : 'হিসাব কপি করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-xs">
            <span className="text-xs text-rose-600 font-black block mb-1">মোট সাশ্রয় / ছাড়</span>
            <span className="text-3xl font-black text-rose-600">৳{discountAmount.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 block mt-1">আপনি মোট এই টাকা বাঁচিয়েছেন</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-xs text-emerald-700 font-black block mb-1">চূড়ান্ত পরিশোধযোগ্য মূল্য</span>
            <span className="text-3xl font-black text-emerald-700">৳{finalPrice.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 block mt-1">ছাড়ের পর আসল দাম</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. PERCENTAGE CALCULATOR (শতকরা ক্যালকুলেটর)
// ==========================================
const PercentageCalculator: React.FC<{ onCopy: (text: string) => void; copiedText: boolean }> = ({ onCopy, copiedText }) => {
  const [calcMode, setCalcMode] = useState<'of' | 'increase' | 'decrease' | 'diff'>('of');

  // Mode 1: X% of Y
  const [valX, setValX] = useState<number>(15);
  const [valY, setValY] = useState<number>(500);

  // Mode 2 & 3: Increase / Decrease
  const [baseVal, setBaseVal] = useState<number>(1000);
  const [rateVal, setRateVal] = useState<number>(20);

  // Mode 4: Difference
  const [numA, setNumA] = useState<number>(250);
  const [numB, setNumB] = useState<number>(300);

  // Results
  const resultOf = ((valX || 0) / 100) * (valY || 0);
  const incAmount = ((baseVal || 0) * (rateVal || 0)) / 100;
  const resultInc = (baseVal || 0) + incAmount;
  const decAmount = ((baseVal || 0) * (rateVal || 0)) / 100;
  const resultDec = Math.max(0, (baseVal || 0) - decAmount);
  const diffPercent = numA > 0 ? Math.round(Math.abs(((numB - numA) / numA) * 100) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Function Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        <button
          onClick={() => setCalcMode('of')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'of' ? 'bg-[#15803d] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ১. X% of Y (শতাংশ নির্ণয়)
        </button>
        <button
          onClick={() => setCalcMode('increase')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'increase' ? 'bg-[#15803d] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ২. শতকরা বৃদ্ধি
        </button>
        <button
          onClick={() => setCalcMode('decrease')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'decrease' ? 'bg-[#15803d] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ৩. শতকরা হ্রাস
        </button>
        <button
          onClick={() => setCalcMode('diff')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'diff' ? 'bg-[#15803d] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ৪. শতকরা পার্থক্য
        </button>
      </div>

      {/* Mode 1 */}
      {calcMode === 'of' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">শতকরা হার (X %)</label>
              <input
                type="number"
                value={valX || ''}
                onChange={(e) => setValX(Number(e.target.value))}
                placeholder="যেমন: ১৫"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">মূল সংখ্যা (Y)</label>
              <input
                type="number"
                value={valY || ''}
                onChange={(e) => setValY(Number(e.target.value))}
                placeholder="যেমন: ৫০০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-center space-y-1">
            <span className="text-xs text-emerald-800 font-bold">{valY} এর {valX}% হলো:</span>
            <span className="text-3xl font-black text-emerald-900 block">{resultOf}</span>
          </div>
        </div>
      )}

      {/* Mode 2: Increase */}
      {calcMode === 'increase' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">প্রারম্ভিক মান (Initial Value)</label>
              <input
                type="number"
                value={baseVal || ''}
                onChange={(e) => setBaseVal(Number(e.target.value))}
                placeholder="যেমন: ১০০০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">বৃদ্ধির হার (Increase %)</label>
              <input
                type="number"
                value={rateVal || ''}
                onChange={(e) => setRateVal(Number(e.target.value))}
                placeholder="যেমন: ২০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex items-center justify-around text-center">
            <div>
              <span className="text-xs text-slate-500 font-bold block">বৃদ্ধির পরিমাণ</span>
              <span className="text-2xl font-black text-emerald-700">+{incAmount}</span>
            </div>
            <div className="border-l border-emerald-200 pl-6">
              <span className="text-xs text-slate-500 font-bold block">চূড়ান্ত মান</span>
              <span className="text-2xl font-black text-emerald-950">{resultInc}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Decrease */}
      {calcMode === 'decrease' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">প্রারম্ভিক মান (Initial Value)</label>
              <input
                type="number"
                value={baseVal || ''}
                onChange={(e) => setBaseVal(Number(e.target.value))}
                placeholder="যেমন: ১০০০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">হ্রাসের হার (Decrease %)</label>
              <input
                type="number"
                value={rateVal || ''}
                onChange={(e) => setRateVal(Number(e.target.value))}
                placeholder="যেমন: ২০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 flex items-center justify-around text-center">
            <div>
              <span className="text-xs text-slate-500 font-bold block">হ্রাসের পরিমাণ</span>
              <span className="text-2xl font-black text-rose-600">-{decAmount}</span>
            </div>
            <div className="border-l border-rose-200 pl-6">
              <span className="text-xs text-slate-500 font-bold block">চূড়ান্ত মান</span>
              <span className="text-2xl font-black text-rose-950">{resultDec}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Difference */}
      {calcMode === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">মান ১ (Value 1)</label>
              <input
                type="number"
                value={numA || ''}
                onChange={(e) => setNumA(Number(e.target.value))}
                placeholder="যেমন: ২৫০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">মান ২ (Value 2)</label>
              <input
                type="number"
                value={numB || ''}
                onChange={(e) => setNumB(Number(e.target.value))}
                placeholder="যেমন: ৩০০"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center space-y-1">
            <span className="text-xs text-amber-900 font-bold">
              {numA} থেকে {numB} এর শতকরা পরিবর্তন ({numB >= numA ? 'বৃদ্ধি' : 'হ্রাস'}):
            </span>
            <span className="text-3xl font-black text-amber-900 block">{diffPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. SHOP PROFIT CALCULATOR (দোকান লাভ)
// ==========================================
const ShopProfitCalculator: React.FC<{ onCopy: (text: string) => void; copiedText: boolean }> = ({ onCopy, copiedText }) => {
  const [productName, setProductName] = useState<string>('সুতির পাঞ্জাবি');
  const [purchasePrice, setPurchasePrice] = useState<number>(380);
  const [sellingPrice, setSellingPrice] = useState<number>(650);
  const [quantity, setQuantity] = useState<number>(35);

  const totalCost = (purchasePrice || 0) * (quantity || 0);
  const totalSales = (sellingPrice || 0) * (quantity || 0);
  const totalProfit = totalSales - totalCost;
  const unitProfit = (sellingPrice || 0) - (purchasePrice || 0);
  const profitPercentage = totalCost > 0 ? Math.round((totalProfit / totalCost) * 100 * 10) / 10 : 0;

  const handleReset = () => {
    setProductName('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setQuantity(0);
  };

  const summaryText = `eBookBazar দোকান লাভ হিসাব:\nপণ্য: ${productName || 'নির্দিষ্ট পণ্য'}\nপাইকারি ক্রয় খরচ: ৳${totalCost}\nখুচরা বিক্রয় আয়: ৳${totalSales}\nনিট লাভ: ৳${totalProfit}\nমুনাফার হার: ${profitPercentage}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">পণ্যের নাম (Product Name)</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="যেমন: টি-শার্ট / বই"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">পাইকারি ক্রয় মূল্য ৳</label>
          <input
            type="number"
            min="0"
            value={purchasePrice || ''}
            onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৩৮০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">খুচরা বিক্রয় মূল্য ৳</label>
          <input
            type="number"
            min="0"
            value={sellingPrice || ''}
            onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
            placeholder="যেমন: ৬৫০"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700">বিক্রিত পরিমাণ (সংখ্যা)</label>
          <input
            type="number"
            min="1"
            value={quantity || ''}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            placeholder="যেমন: ৩৫"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setProductName('চামড়ার মানিব্যাগ'); setPurchasePrice(220); setSellingPrice(450); setQuantity(40); }}
          className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition"
        >
          💡 নমুনা হিসাব দেখুন
        </button>
        <button
          onClick={handleReset}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-6 border border-emerald-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
          <h3 className="text-base font-black text-emerald-950 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" />
            <span>{productName || 'নির্দিষ্ট পণ্য'} — দোকানের বিক্রয় হিসাব বিবরণী</span>
          </h3>
          <button
            onClick={() => onCopy(summaryText)}
            className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition flex items-center gap-1.5 shadow-xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'কপি হয়েছে!' : 'হিসাব কপি করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মোট পাইকারি ব্যয়</span>
            <span className="text-xl font-black text-slate-800">৳{totalCost.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মোট খুচরা বিক্রয়</span>
            <span className="text-xl font-black text-slate-800">৳{totalSales.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">নিট ব্যবসায়িক লাভ</span>
            <span className="text-xl font-black text-emerald-700">৳{totalProfit.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">প্রতিটিতে লাভ ৳{unitProfit}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold block mb-1">মুনাফার হার</span>
            <span className="text-xl font-black text-amber-600">{profitPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// RELATED CONTENT: BLOGS
// ==========================================
const RelatedBlogSection: React.FC<{
  blogPosts: BlogPost[];
  activeTool: FreeToolConfig;
  onOpenBlog?: (post: BlogPost) => void;
}> = ({ blogPosts, activeTool, onOpenBlog }) => {
  const relatedPosts = useMemo(() => {
    if (!blogPosts || blogPosts.length === 0) return [];
    // Prioritize if admin configured relatedBlogSlug
    if (activeTool.relatedBlogSlug) {
      const match = blogPosts.find(p => p.slug === activeTool.relatedBlogSlug || p.id === activeTool.relatedBlogSlug);
      if (match) return [match];
    }
    // Fallback: search by category / finance / skill keywords
    const matches = blogPosts.filter(p => {
      const text = (p.title + ' ' + p.category + ' ' + p.excerpt).toLowerCase();
      if (activeTool.id.includes('savings') || activeTool.id.includes('profit')) {
        return text.includes('ব্যবসা') || text.includes('টাকা') || text.includes('ইনভেস্ট') || text.includes('ক্যারিয়ার') || text.includes('আয়');
      }
      return true;
    });
    return matches.slice(0, 2);
  }, [blogPosts, activeTool]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h3 className="text-lg font-black text-slate-900">সম্পর্কিত ক্যারিয়ার ও বিজনেস ব্লগ পোস্ট</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onOpenBlog && onOpenBlog(post)}
            className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition cursor-pointer group"
          >
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                {post.category}
              </span>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition truncate">
                {post.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// RELATED CONTENT: EBOOKS
// ==========================================
const RelatedEbookSection: React.FC<{
  ebooks: Ebook[];
  activeTool: FreeToolConfig;
  onViewEbook?: (book: Ebook) => void;
  onAddToCart?: (book: Ebook) => void;
}> = ({ ebooks, activeTool, onViewEbook, onAddToCart }) => {
  const relatedBooks = useMemo(() => {
    if (!ebooks || ebooks.length === 0) return [];
    if (activeTool.relatedBookId) {
      const match = ebooks.find(b => b.id === activeTool.relatedBookId);
      if (match) return [match];
    }
    // Fallback: pick 2 relevant ebooks (Business / Freelancing / Finance)
    const matches = ebooks.filter(b => {
      const text = (b.title + ' ' + b.category + ' ' + b.description).toLowerCase();
      return text.includes('ব্যবসা') || text.includes('মার্কেটিং') || text.includes('ফ্রিল্যান্সিং') || text.includes('টাকা') || text.includes('দক্ষতা');
    });
    return (matches.length > 0 ? matches : ebooks).slice(0, 2);
  }, [ebooks, activeTool]);

  if (relatedBooks.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-700" />
          <h3 className="text-lg font-black text-slate-900">সম্পর্কিত প্রয়োজনীয় ই-বুক</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedBooks.map(book => (
          <div
            key={book.id}
            className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition group items-center"
          >
            {book.coverUrl && (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-16 h-22 rounded-lg object-cover shadow-xs shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                onClick={() => onViewEbook && onViewEbook(book)}
                loading="lazy"
              />
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                {book.category}
              </span>
              <h4 
                onClick={() => onViewEbook && onViewEbook(book)}
                className="text-sm font-black text-slate-900 hover:text-emerald-700 transition truncate cursor-pointer"
              >
                {book.title}
              </h4>
              <p className="text-xs text-slate-500 truncate">লেখক: {book.author}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-emerald-700">৳{book.price}</span>
                <div className="flex items-center gap-2">
                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(book)}
                      className="bg-[#15803d] hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition active:scale-95 shadow-xs"
                    >
                      অর্ডার করুন
                    </button>
                  )}
                  {onViewEbook && (
                    <button
                      onClick={() => onViewEbook(book)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                    >
                      বিস্তারিত
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
