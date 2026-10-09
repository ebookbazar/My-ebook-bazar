import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  PiggyBank, 
  TrendingUp, 
  Tag, 
  Percent, 
  Store, 
  Settings, 
  Check, 
  RotateCcw, 
  Edit3, 
  Eye, 
  EyeOff, 
  Star, 
  Sparkles, 
  Save, 
  X, 
  BookOpen, 
  ShoppingBag, 
  Search,
  ExternalLink,
  Layers,
  Globe
} from 'lucide-react';
import { db, ref, onValue, update, set } from '../firebase';
import { FreeToolConfig, ToolId } from '../types/freeTools';
import { DEFAULT_FREE_TOOLS } from '../data/defaultFreeTools';
import { BlogPost, Ebook } from '../types';

interface AdminFreeToolsManagerProps {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  blogPosts?: BlogPost[];
  ebooks?: Record<string, Ebook>;
}

export const AdminFreeToolsManager: React.FC<AdminFreeToolsManagerProps> = ({
  showToast,
  blogPosts = [],
  ebooks = {}
}) => {
  const [tools, setTools] = useState<FreeToolConfig[]>(DEFAULT_FREE_TOOLS);
  const [editingTool, setEditingTool] = useState<FreeToolConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Listen to Firebase Realtime Database for Free Tools configuration
  useEffect(() => {
    const toolsRef = ref(db, 'freeTools');
    const unsub = onValue(toolsRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        // Merge with defaults to ensure all 5 tools exist
        const merged: FreeToolConfig[] = DEFAULT_FREE_TOOLS.map(def => {
          if (val[def.id]) {
            return { ...def, ...val[def.id] };
          }
          return def;
        });
        setTools(merged.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setTools(DEFAULT_FREE_TOOLS);
      }
    }, (err) => {
      console.warn('Firebase freeTools listener notice:', err);
    });

    return () => unsub();
  }, []);

  // 2. Toggle Tool ON / OFF
  const handleToggleEnabled = async (toolId: ToolId, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await update(ref(db, `freeTools/${toolId}`), {
        enabled: newStatus,
        updatedAt: Date.now()
      });
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, enabled: newStatus } : t));
      showToast(
        newStatus ? 'success' : 'info',
        `টুলটি ${newStatus ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'} করা হয়েছে।`
      );
    } catch (err: any) {
      showToast('error', 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে: ' + (err.message || err));
    }
  };

  // 3. Toggle Tool Featured Status
  const handleToggleFeatured = async (toolId: ToolId, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    try {
      await update(ref(db, `freeTools/${toolId}`), {
        featured: newFeatured,
        updatedAt: Date.now()
      });
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, featured: newFeatured } : t));
      showToast('success', `ফিচার্ড স্ট্যাটাস আপডেট হয়েছে।`);
    } catch (err: any) {
      showToast('error', 'আপডেট ব্যর্থ হয়েছে: ' + (err.message || err));
    }
  };

  // 4. Toggle Future Ad Placeholder
  const handleToggleAdPlaceholder = async (toolId: ToolId, currentAd: boolean) => {
    const newAd = !currentAd;
    try {
      await update(ref(db, `freeTools/${toolId}`), {
        showAdPlaceholder: newAd,
        updatedAt: Date.now()
      });
      setTools(prev => prev.map(t => t.id === toolId ? { ...t, showAdPlaceholder: newAd } : t));
      showToast('info', `ভবিষ্যৎ Ad Placeholder: ${newAd ? 'ON' : 'OFF'}`);
    } catch (err: any) {
      showToast('error', 'আপডেট ব্যর্থ: ' + (err.message || err));
    }
  };

  // 5. Save Edited Tool
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    setIsSaving(true);
    try {
      const toolRef = ref(db, `freeTools/${editingTool.id}`);
      await update(toolRef, {
        ...editingTool,
        updatedAt: Date.now()
      });

      setTools(prev => prev.map(t => t.id === editingTool.id ? editingTool : t));
      showToast('success', `"${editingTool.shortName}" সেটিংস সফলভাবে সংরক্ষিত হয়েছে!`);
      setEditingTool(null);
    } catch (err: any) {
      showToast('error', 'টুল সংরক্ষণ ব্যর্থ হয়েছে: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Reset to Default Tools
  const handleResetDefaults = async () => {
    const confirmed = window.confirm('আপনি কি নিশ্চিত যে সকল ফ্রি টুলসের সেটিংস ডিফল্ট মানে ফিরিয়ে আনতে চান?');
    if (!confirmed) return;

    try {
      const updates: Record<string, any> = {};
      DEFAULT_FREE_TOOLS.forEach(t => {
        updates[`freeTools/${t.id}`] = t;
      });
      await update(ref(db), updates);
      setTools(DEFAULT_FREE_TOOLS);
      showToast('success', 'সকল ফ্রি টুলস ডিফল্ট মানে রিসেট করা হয়েছে!');
    } catch (err: any) {
      showToast('error', 'রিসেট ব্যর্থ হয়েছে: ' + (err.message || err));
    }
  };

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'PiggyBank': return <PiggyBank className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Tag': return <Tag className={className} />;
      case 'Percent': return <Percent className={className} />;
      case 'Store': return <Store className={className} />;
      default: return <Calculator className={className} />;
    }
  };

  const ebooksList = Object.values(ebooks);

  const filteredTools = tools.filter(t => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white border border-emerald-700/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-500/40 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Free Tools Management & Future WebIntoApp Config</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">
            🛠️ ফ্রি টুলস ম্যানেজমেন্ট সিস্টেম
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            টুল অন/অফ, নাম, বিবরণ, এসইও মেটাডাটা, সংশ্লিষ্ট ব্লগ/ই-বুক এবং ভবিষ্যৎ অ্যাপ সেটিংস পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 active:scale-95 shadow-xs"
            title="সব টুলসের সেটিংস ডিফল্ট মানে ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>ডিফল্ট রিসেট</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Summary */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="টুলসের নাম বা ক্যাটাগরি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <span>মোট টুলস: <strong className="text-slate-900">{tools.length}</strong> টি</span>
          <span>সক্রিয়: <strong className="text-emerald-700">{tools.filter(t => t.enabled).length}</strong> টি</span>
          <span>নিষ্ক্রিয়: <strong className="text-rose-600">{tools.filter(t => !t.enabled).length}</strong> টি</span>
        </div>
      </div>

      {/* 3. Tools Cards / Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md ${
              tool.enabled ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20 opacity-80'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Icon, Name & Meta */}
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  tool.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}>
                  {renderIcon(tool.icon, "w-6 h-6")}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-black text-slate-900">
                      {tool.name}
                    </h4>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ক্রম #{tool.sortOrder}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {tool.category}
                    </span>
                    {tool.featured && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>ফিচার্ড</span>
                      </span>
                    )}
                    {tool.showAdPlaceholder && (
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Ad Slot Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl font-medium">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
                    <span>Slug: <code className="text-emerald-700 bg-emerald-50 px-1 rounded">/tools/{tool.slug}</code></span>
                    {tool.relatedBlogSlug && <span>সংশ্লিষ্ট ব্লগ সংযুক্ত</span>}
                    {tool.relatedBookId && <span>সংশ্লিষ্ট ই-বুক সংযুক্ত</span>}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* Enable / Disable Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(tool.id, tool.enabled)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 ${
                    tool.enabled 
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900' 
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-900'
                  }`}
                  title={tool.enabled ? 'টুলটি নিষ্ক্রিয় করতে ক্লিক করুন' : 'টুলটি সক্রিয় করতে ক্লিক করুন'}
                >
                  {tool.enabled ? <Eye className="w-4 h-4 text-emerald-700" /> : <EyeOff className="w-4 h-4 text-rose-600" />}
                  <span>{tool.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}</span>
                </button>

                {/* Featured Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(tool.id, tool.featured)}
                  className={`p-2 rounded-xl text-xs font-bold transition active:scale-95 border ${
                    tool.featured 
                      ? 'bg-amber-50 border-amber-300 text-amber-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  title="হোমে ফিচার্ড করতে ক্লিক করুন"
                >
                  <Star className={`w-4 h-4 ${tool.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setEditingTool(tool)}
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
                  title="নাম, এসইও, বিবরণ ও সংশ্লিষ্ট কন্টেন্ট সম্পাদনা করুন"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>সম্পাদনা (Edit)</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. EDIT MODAL */}
      {editingTool && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs p-4 overflow-y-auto flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {renderIcon(editingTool.icon, "w-5 h-5")}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    টুল সেটিংস সম্পাদনা — {editingTool.shortName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    নাম, এসইও মেটাডাটা, সংশ্লিষ্ট কন্টেন্ট ও ভবিষ্যৎ অ্যাপ কনফিগারেশন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tool Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">টুলের পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    value={editingTool.name}
                    onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Short Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">সংক্ষিপ্ত নাম (Short Name)</label>
                  <input
                    type="text"
                    required
                    value={editingTool.shortName}
                    onChange={(e) => setEditingTool({ ...editingTool, shortName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700">টুলের বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  required
                  value={editingTool.description}
                  onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">ক্যাটাগরি</label>
                  <input
                    type="text"
                    required
                    value={editingTool.category}
                    onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Icon Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">টুল আইকন (Icon)</label>
                  <select
                    value={editingTool.icon}
                    onChange={(e) => setEditingTool({ ...editingTool, icon: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="PiggyBank">PiggyBank (সঞ্চয় ব্যাংক)</option>
                    <option value="TrendingUp">TrendingUp (মুনাফা গ্রোথ)</option>
                    <option value="Tag">Tag (ছাড় / ডিসকাউন্ট)</option>
                    <option value="Percent">Percent (শতকরা / শতাংশ)</option>
                    <option value="Store">Store (দোকান / ব্যবসা)</option>
                    <option value="Calculator">Calculator (ক্যালকুলেটর)</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">ক্রম (Sort Order)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTool.sortOrder}
                    onChange={(e) => setEditingTool({ ...editingTool, sortOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingTool.slug}
                    onChange={(e) => setEditingTool({ ...editingTool, slug: e.target.value.trim().toLowerCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* SEO Title & Meta Description */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>SEO অপটিমাইজেশন (SEO Metadata)</span>
                </span>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">SEO Title</label>
                  <input
                    type="text"
                    value={editingTool.seoTitle}
                    onChange={(e) => setEditingTool({ ...editingTool, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingTool.metaDescription}
                    onChange={(e) => setEditingTool({ ...editingTool, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Related Blog & eBook Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Related Blog */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সংশ্লিষ্ট ব্লগ পোস্ট</span>
                  </label>
                  <select
                    value={editingTool.relatedBlogSlug || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, relatedBlogSlug: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">স্বয়ংক্রিয় নির্বাচন (Auto)</option>
                    {blogPosts.map(p => (
                      <option key={p.id} value={p.slug || p.id}>
                        {p.title.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related eBook */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-700 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>সংশ্লিষ্ট ই-বুক</span>
                  </label>
                  <select
                    value={editingTool.relatedBookId || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, relatedBookId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">স্বয়ংক্রিয় নির্বাচন (Auto)</option>
                    {ebooksList.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title.slice(0, 45)}... (৳{b.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Future AdMob Placeholder Toggle */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-amber-950 block">
                    ভবিষ্যৎ মোবাইল অ্যাপ Ad Placement
                  </span>
                  <p className="text-[11px] text-amber-800">
                    ভবিষ্যতে WebIntoApp দিয়ে Android App তৈরির সময় এই টুলের নিচে বিজ্ঞাপন প্রদর্শন করবেন কি না।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={editingTool.showAdPlaceholder || false}
                    onChange={(e) => setEditingTool({ ...editingTool, showAdPlaceholder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#15803d] hover:bg-emerald-800 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন (Save Changes)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
