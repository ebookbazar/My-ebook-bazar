import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, BookOpen, Save, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { BlogPost } from '../types';
import { saveBlogPostToFirebase, deleteBlogPostFromFirebase, setHideDemoBlogsSetting } from '../services/blogService';

interface AdminBlogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPost[];
  onRefresh: () => void;
  hideDemoBlogs: boolean;
}

export const AdminBlogManagerModal: React.FC<AdminBlogManagerModalProps> = ({
  isOpen,
  onClose,
  posts,
  onRefresh,
  hideDemoBlogs
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('অ্যাডমিন / এডিটর');
  const [authorRole, setAuthorRole] = useState<string>('কন্টেন্ট টিম');
  const [category, setCategory] = useState<string>('সেলার টিপস');
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop');
  const [excerpt, setExcerpt] = useState<string>('');
  const [contentBody, setContentBody] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditId(null);
    setTitle('');
    setAuthor('অ্যাডমিন / এডিটর');
    setAuthorRole('কন্টেন্ট টিম');
    setCategory('সেলার টিপস');
    setCoverImage('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop');
    setExcerpt('');
    setContentBody('');
  };

  const handleOpenEdit = (post: BlogPost) => {
    setIsEditing(true);
    setEditId(post.id);
    setTitle(post.title);
    setAuthor(post.author);
    setAuthorRole(post.authorRole || 'কন্টেন্ট টিম');
    setCategory(post.category);
    setCoverImage(post.coverImage);
    setExcerpt(post.excerpt);
    setContentBody(post.htmlContent || post.content.join('\n\n'));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('অনুগ্রহ করে ব্লগের শিরোনাম লিখুন!');
      return;
    }
    if (!contentBody.trim()) {
      alert('অনুগ্রহ করে ব্লগের মূল কনটেন্ট লিখুন!');
      return;
    }

    setSaving(true);
    try {
      const paragraphs = contentBody
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const generatedExcerpt = excerpt.trim() || paragraphs[0].slice(0, 150) + '...';

      await saveBlogPostToFirebase({
        id: editId || undefined,
        title: title.trim(),
        author: author.trim(),
        authorRole: authorRole.trim(),
        category: category.trim(),
        coverImage: coverImage.trim(),
        excerpt: generatedExcerpt,
        content: paragraphs,
        htmlContent: contentBody.includes('<') ? contentBody : undefined,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        readTime: `${Math.max(2, Math.round(contentBody.length / 500))} মিনিট`
      });

      setMsg({ text: 'ব্লগ পোস্ট সফলভাবে সংরক্ষণ করা হয়েছে!', type: 'success' });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      console.error('Error saving post:', err);
      setMsg({ text: 'সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই ব্লগ পোস্টটি মুছে ফেলতে চান?')) return;
    try {
      await deleteBlogPostFromFirebase(id);
      setMsg({ text: 'পোস্ট মুছে ফেলা হয়েছে', type: 'success' });
      onRefresh();
    } catch (err: any) {
      alert('মুছে ফেলা ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteAllDemo = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে সকল ডেমো ব্লগ পোস্ট স্থায়ীভাবে ডিলিট করতে চান? এরপর শুধু আপনার তৈরি বাস্তব পোস্ট প্রদর্শিত হবে।')) return;
    try {
      await setHideDemoBlogsSetting(true);
      setMsg({ text: 'সকল ডেমো পোস্ট সফলভাবে ডিলিট ও লুকানো হয়েছে!', type: 'success' });
      onRefresh();
    } catch (err: any) {
      alert('ব্যর্থ: ' + err.message);
    }
  };

  const handleRestoreDemo = async () => {
    try {
      await setHideDemoBlogsSetting(false);
      setMsg({ text: 'ডেমো পোস্ট রিস্টোর করা হয়েছে', type: 'success' });
      onRefresh();
    } catch (err: any) {
      alert('ব্যর্থ: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black">ব্লগ পোস্ট ম্যানেজমেন্ট প্যানেল</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {msg && (
          <div className={`px-6 py-2.5 text-xs font-bold text-center ${
            msg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-300' : 'bg-red-100 text-red-900 border-b border-red-300'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">সকল প্রকাশিত ও ডেমো পোস্ট</h3>
                  <p className="text-xs text-slate-500">মোট পোস্ট: {posts.length}টি</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {!hideDemoBlogs ? (
                    <button
                      onClick={handleDeleteAllDemo}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      title="সকল ডেমো পোস্ট এক ক্লিকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>সকল ডেমো পোস্ট ডিলিট করুন</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRestoreDemo}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      ডেমো পোস্ট রিস্টোর করুন
                    </button>
                  )}

                  <button
                    onClick={handleOpenCreate}
                    className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>নতুন ব্লগ পোস্ট লিখুন</span>
                  </button>
                </div>
              </div>

              {/* Posts Table / List */}
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">কোনো পোস্ট পাওয়া যায়নি</p>
                    <button
                      onClick={handleOpenCreate}
                      className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
                    >
                      + প্রথম বাস্তব পোস্ট যোগ করুন
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {post.category}
                            </span>
                            {post.isDemo && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                ডেমো পোস্ট
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                            {post.title}
                          </h4>
                          <span className="text-xs text-slate-400 font-semibold block">
                            লেখক: {post.author} • {post.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!post.isDemo ? (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleDeleteAllDemo}
                            className="text-[11px] font-bold text-red-600 hover:underline px-2"
                            title="সকল ডেমো মুছে ফেলুন"
                          >
                            ডেমো মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">
                  {editId ? 'ব্লগ পোস্ট সম্পাদনা' : 'নতুন বাস্তব ব্লগ পোস্ট তৈরি'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ফিরে যান
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্লগ পোস্টের শিরোনাম *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ২০২৬ সালে ডিজিটাল ই-বুক দিয়ে ক্যারিয়ার শুরু করার কৌশল..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
                  >
                    <option value="আত্মউন্নয়ন">আত্মউন্নয়ন</option>
                    <option value="শিক্ষা">শিক্ষা</option>
                    <option value="উপন্যাস">উপন্যাস</option>
                    <option value="গল্প">গল্প</option>
                    <option value="কবিতা">কবিতা</option>
                    <option value="ইসলামিক">ইসলামিক</option>
                    <option value="ব্যবসা ও উদ্যোক্তা">ব্যবসা ও উদ্যোক্তা</option>
                    <option value="ক্যারিয়ার">ক্যারিয়ার</option>
                    <option value="প্রযুক্তি">প্রযুক্তি</option>
                    <option value="স্বাস্থ্য ও জীবনধারা">স্বাস্থ্য ও জীবনধারা</option>
                    <option value="ব্যক্তিগত অর্থনীতি">ব্যক্তিগত অর্থনীতি</option>
                    <option value="শিশু-কিশোর">শিশু-কিশোর</option>
                    <option value="সেলার টিপস">সেলার টিপস</option>
                    <option value="ফ্রিল্যান্সিং">ফ্রিল্যান্সিং</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লেখকের নাম
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="মাহমুদুল হাসান"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কভার ছবি URL (Direct Image URL)
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="পাঠকদের আকৃষ্ট করতে ২-৩ লাইনের সংক্ষিপ্ত সারমর্ম..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মূল আর্টিকেল কনটেন্ট (Full Content) *
                </label>
                <textarea
                  rows={8}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="এখানে সম্পূর্ণ ব্লগ পোস্টের প্যারাগ্রাফসমূহ বা HTML ফরম্যাট লিখুন। প্রতিটি প্যারার মাঝে এন্টার চাপুন..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs px-6 py-2.5 rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ব্লগ পোস্ট প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
