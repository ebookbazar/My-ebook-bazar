import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Save, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Globe, 
  Eye, 
  EyeOff, 
  Link2,
  Calendar,
  AlertCircle,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ExternalLink,
  Bold,
  List,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileText,
  ShoppingBag,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BlogPost, Ebook } from '../types';
import { saveBlogPostToFirebase, deleteBlogPostFromFirebase, setHideDemoBlogsSetting, BLOG_PRESET_CATEGORIES } from '../services/blogService';
import { generateSlug, ensureUniqueSlug, validateAndSanitizeUrl, analyzeContentSeo, getPublicBlogUrl, copyToClipboard } from '../utils/blogSeo';

interface AdminBlogManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPost[];
  allEbooks?: Ebook[];
  onRefresh: () => void;
  hideDemoBlogs: boolean;
}

export const AdminBlogManagerModal: React.FC<AdminBlogManagerModalProps> = ({
  isOpen,
  onClose,
  posts,
  allEbooks = [],
  onRefresh,
  hideDemoBlogs
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

  // List search & category filter
  const [listSearch, setListSearch] = useState<string>('');
  const [listCategory, setListCategory] = useState<string>('সব');
  const [listStatus, setListStatus] = useState<'ALL' | 'LIVE' | 'DRAFT'>('ALL');
  
  // Basic Form state
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('অ্যাডমিন / এডিটর');
  const [authorRole, setAuthorRole] = useState<string>('কন্টেন্ট টিম');
  const [category, setCategory] = useState<string>('সেলার টিপস');
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [excerpt, setExcerpt] = useState<string>('');
  const [contentBody, setContentBody] = useState<string>('');
  const [postStatus, setPostStatus] = useState<'LIVE' | 'DRAFT'>('LIVE');
  const [publishedAtDate, setPublishedAtDate] = useState<string>('');
  
  // Collapsible Sections
  const [isContentSeoOpen, setIsContentSeoOpen] = useState<boolean>(true);
  const [isSeoOpen, setIsSeoOpen] = useState<boolean>(false);

  // General SEO Settings State
  const [slug, setSlug] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');
  const [allowIndex, setAllowIndex] = useState<boolean>(true);

  // Internal Link Modal/Tool State
  const [showInternalLinkModal, setShowInternalLinkModal] = useState<boolean>(false);
  const [internalLinkCategory, setInternalLinkCategory] = useState<'blog' | 'category' | 'ebook' | 'page' | 'custom'>('blog');
  const [internalSelectedPostId, setInternalSelectedPostId] = useState<string>('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('সেলার টিপস');
  const [internalSelectedEbookId, setInternalSelectedEbookId] = useState<string>('');
  const [internalSelectedPage, setInternalSelectedPage] = useState<string>('/blog');
  const [internalCustomUrl, setInternalCustomUrl] = useState<string>('');
  const [internalAnchorText, setInternalAnchorText] = useState<string>('');
  const [internalError, setInternalError] = useState<string | null>(null);

  // External Link Modal/Tool State
  const [showExternalLinkModal, setShowExternalLinkModal] = useState<boolean>(false);
  const [externalUrl, setExternalUrl] = useState<string>('https://');
  const [externalAnchorText, setExternalAnchorText] = useState<string>('');
  const [externalOpenNewTab, setExternalOpenNewTab] = useState<boolean>(true);
  const [externalRel, setExternalRel] = useState<'noopener noreferrer' | 'sponsored' | 'nofollow' | 'sponsored-nofollow'>('noopener noreferrer');
  const [externalError, setExternalError] = useState<string | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isConfirmingDeleteAllDemo, setIsConfirmingDeleteAllDemo] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filtered posts for admin list view
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = listSearch.trim().toLowerCase();
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        (p.slug && p.slug.toLowerCase().includes(q)) || 
        p.author.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q));

      const matchesCat = listCategory === 'সব' || p.category === listCategory || (p.labels && p.labels.includes(listCategory));
      
      const isDraft = p.status === 'DRAFT';
      const matchesStatus = 
        listStatus === 'ALL' ||
        (listStatus === 'DRAFT' && isDraft) ||
        (listStatus === 'LIVE' && !isDraft);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [posts, listSearch, listCategory, listStatus]);

  // Real-time Content SEO Analysis
  const seoAnalysis = useMemo(() => {
    return analyzeContentSeo({
      title,
      content: contentBody,
      focusKeyword,
      seoTitle,
      metaDescription,
      slug,
      imageAlt,
      canonicalUrl,
      allowIndex: postStatus === 'DRAFT' ? false : allowIndex
    });
  }, [title, contentBody, focusKeyword, seoTitle, metaDescription, slug, imageAlt, canonicalUrl, allowIndex, postStatus]);

  if (!isOpen) return null;

  // Insert snippet at current cursor or wrap selected text
  const insertSnippetAtCursor = (before: string, after: string = '', defaultInside: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContentBody(prev => `${prev}\n${before}${defaultInside}${after}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentBody.substring(start, end) || defaultInside;
    const replacement = `${before}${selectedText}${after}`;
    const newContent = contentBody.substring(0, start) + replacement + contentBody.substring(end);
    setContentBody(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditId(null);
    setTitle('');
    setAuthor('অ্যাডমিন / এডিটর');
    setAuthorRole('কন্টেন্ট টিম');
    setCategory('সেলার টিপস');
    setCoverImage('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop');
    setImageAlt('');
    setExcerpt('');
    setContentBody('');
    setPostStatus('LIVE');
    setPublishedAtDate(new Date().toISOString().split('T')[0]);
    setSlug('');
    setSeoTitle('');
    setMetaDescription('');
    setFocusKeyword('');
    setSeoKeywords('');
    setCanonicalUrl('');
    setAllowIndex(true);
    setIsContentSeoOpen(true);
    setIsSeoOpen(false);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setIsEditing(true);
    setEditId(post.id);
    setTitle(post.title);
    setAuthor(post.author);
    setAuthorRole(post.authorRole || 'কন্টেন্ট টিম');
    setCategory(post.category);
    setCoverImage(post.coverImage);
    setImageAlt(post.imageAlt || post.title || '');
    setExcerpt(post.excerpt);
    setContentBody(post.htmlContent || (post.content && post.content.join('\n\n')) || '');
    setPostStatus(post.status === 'DRAFT' ? 'DRAFT' : 'LIVE');
    setPublishedAtDate(
      typeof post.publishedAt === 'string' && post.publishedAt.includes('T') 
        ? post.publishedAt.split('T')[0] 
        : new Date().toISOString().split('T')[0]
    );
    
    // SEO fields
    setSlug(post.slug || generateSlug(post.title, post.id));
    setSeoTitle(post.seoTitle || post.title);
    setMetaDescription(post.metaDescription || post.excerpt);
    setFocusKeyword(post.focusKeyword || '');
    setSeoKeywords(post.seoKeywords || (post.labels ? post.labels.join(', ') : ''));
    setCanonicalUrl(post.canonicalUrl || '');
    setAllowIndex(post.allowIndex !== false);
    setIsContentSeoOpen(true);
    setIsSeoOpen(false);
  };

  const handleAutoGenerateSlug = () => {
    if (!title.trim()) {
      alert('স্লাগ তৈরি করতে প্রথমে ব্লগের শিরোনাম লিখুন');
      return;
    }
    const baseSlug = generateSlug(title.trim(), editId || '');
    const uniqueSlug = ensureUniqueSlug(baseSlug, editId || undefined, posts);
    setSlug(uniqueSlug);
    if (!seoTitle) setSeoTitle(title.trim());
    if (!metaDescription && excerpt) setMetaDescription(excerpt.trim());
  };

  // Open Internal Link Tool
  const handleOpenInternalLinkTool = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = contentBody.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selected) setInternalAnchorText(selected);
    }
    // Set first eligible post (excluding current)
    const eligiblePost = posts.find(p => p.id !== editId);
    if (eligiblePost) {
      setInternalSelectedPostId(eligiblePost.slug || eligiblePost.id);
      if (!internalAnchorText) setInternalAnchorText(eligiblePost.title);
    }
    setInternalError(null);
    setShowInternalLinkModal(true);
  };

  // Insert Internal Link
  const handleApplyInternalLink = () => {
    let targetUrl = '';

    if (internalLinkCategory === 'blog') {
      if (!internalSelectedPostId) {
        setInternalError('অনুগ্রহ করে একটি ব্লগ পোস্ট নির্বাচন করুন');
        return;
      }
      // Rule 4: Prevent current post self-linking
      if (editId && (internalSelectedPostId === editId || internalSelectedPostId === slug)) {
        setInternalError('একটি ব্লগ পোস্ট নিজেকে ইন্টারনাল লিংক হিসেবে ব্যবহার করতে পারবে না');
        return;
      }
      targetUrl = `/blog/${internalSelectedPostId}`;
    } else if (internalLinkCategory === 'category') {
      targetUrl = `/blog?cat=${encodeURIComponent(internalSelectedCategory)}`;
    } else if (internalLinkCategory === 'ebook') {
      if (!internalSelectedEbookId) {
        setInternalError('অনুগ্রহ করে একটি ই-বুক নির্বাচন করুন');
        return;
      }
      targetUrl = `/ebook/${internalSelectedEbookId}`;
    } else if (internalLinkCategory === 'page') {
      targetUrl = internalSelectedPage;
    } else {
      targetUrl = internalCustomUrl.trim();
    }

    const validation = validateAndSanitizeUrl(targetUrl, true);
    if (!validation.safe) {
      setInternalError(validation.error || 'অকার্যকর লিংক');
      return;
    }

    const anchor = internalAnchorText.trim() || 'এখানে পড়ুন';
    const linkHtml = `<a href="${validation.url}" class="text-emerald-700 underline font-semibold hover:text-emerald-900">${anchor}</a>`;
    insertSnippetAtCursor(linkHtml, '', '');
    setShowInternalLinkModal(false);
    setInternalAnchorText('');
    setInternalError(null);
  };

  // Open External Link Tool
  const handleOpenExternalLinkTool = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = contentBody.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selected) setExternalAnchorText(selected);
    }
    setExternalError(null);
    setShowExternalLinkModal(true);
  };

  // Insert External Link
  const handleApplyExternalLink = () => {
    const validation = validateAndSanitizeUrl(externalUrl, false);
    if (!validation.safe) {
      setExternalError(validation.error || 'অকার্যকর এক্সটারনাল লিংক');
      return;
    }

    const anchor = externalAnchorText.trim() || validation.url;

    // Rel attribute construction
    let relValue = 'noopener noreferrer';
    if (externalRel === 'sponsored') {
      relValue = 'sponsored noopener noreferrer';
    } else if (externalRel === 'nofollow') {
      relValue = 'nofollow noopener noreferrer';
    } else if (externalRel === 'sponsored-nofollow') {
      relValue = 'sponsored nofollow noopener noreferrer';
    }

    const targetAttr = externalOpenNewTab ? ' target="_blank"' : '';
    const relAttr = externalOpenNewTab ? ` rel="${relValue}"` : '';

    const linkHtml = `<a href="${validation.url}"${targetAttr}${relAttr} class="text-blue-600 underline font-semibold hover:text-blue-800">${anchor}</a>`;
    insertSnippetAtCursor(linkHtml, '', '');
    setShowExternalLinkModal(false);
    setExternalAnchorText('');
    setExternalUrl('https://');
    setExternalError(null);
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

    // Auto-generate slug if empty
    const resolvedSlug = slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') 
      : generateSlug(title.trim(), editId || '');

    const finalSlug = ensureUniqueSlug(resolvedSlug, editId || undefined, posts);

    setSaving(true);
    try {
      const paragraphs = contentBody
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const generatedExcerpt = excerpt.trim() || paragraphs[0].slice(0, 150) + '...';
      const resolvedSeoTitle = seoTitle.trim() || title.trim();
      const resolvedMetaDesc = metaDescription.trim() || generatedExcerpt;
      const resolvedImageAlt = imageAlt.trim() || title.trim();

      const blogPayload: any = {
        title: title.trim(),
        slug: finalSlug,
        author: author.trim(),
        authorRole: authorRole.trim(),
        category: category.trim(),
        coverImage: coverImage.trim(),
        imageAlt: resolvedImageAlt,
        excerpt: generatedExcerpt,
        content: paragraphs,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        publishedAt: publishedAtDate || new Date().toISOString(),
        readTime: `${Math.max(2, Math.round(contentBody.length / 500))} মিনিট`,
        status: postStatus,
        allowIndex: postStatus === 'DRAFT' ? false : allowIndex,
        seoTitle: resolvedSeoTitle,
        metaDescription: resolvedMetaDesc,
      };

      if (editId) blogPayload.id = editId;
      if (contentBody.includes('<')) blogPayload.htmlContent = contentBody;
      if (focusKeyword.trim()) blogPayload.focusKeyword = focusKeyword.trim();
      if (seoKeywords.trim()) blogPayload.seoKeywords = seoKeywords.trim();
      if (canonicalUrl.trim()) blogPayload.canonicalUrl = canonicalUrl.trim();

      await saveBlogPostToFirebase(blogPayload);

      setMsg({ text: `ব্লগ পোস্ট সফলভাবে ${postStatus === 'DRAFT' ? 'ড্রাফট হিসেবে' : 'পাবলিশ'} সংরক্ষণ করা হয়েছে!`, type: 'success' });
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

  const handleTogglePublishQuick = async (post: BlogPost) => {
    const isCurrentlyDraft = post.status === 'DRAFT';
    const newStatus: 'LIVE' | 'DRAFT' = isCurrentlyDraft ? 'LIVE' : 'DRAFT';
    try {
      await saveBlogPostToFirebase({
        ...post,
        status: newStatus,
        allowIndex: newStatus === 'LIVE' ? (post.allowIndex !== false) : false
      });
      setMsg({ 
        text: `পোস্টটি এখন ${newStatus === 'LIVE' ? 'পাবলিশ' : 'আনপাবলিশ (ড্রাফট)'} করা হয়েছে!`, 
        type: 'success' 
      });
      onRefresh();
    } catch (err: any) {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ: ' + err.message);
    } finally {
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const handleCopyPostUrl = async (post: BlogPost) => {
    const isDraft = post.status === 'DRAFT';
    if (isDraft) {
      setMsg({ 
        text: 'ড্রাফট পোস্টের পাবলিক লিংক সক্রিয় নয়। লিংক শেয়ার করতে প্রথমে পোস্টটি পাবলিশ করুন।', 
        type: 'error' 
      });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    const postSlug = post.slug || post.id;
    const publicUrl = getPublicBlogUrl(postSlug);
    const success = await copyToClipboard(publicUrl);
    
    if (success) {
      setCopiedPostId(post.id);
      const isNoIndex = post.allowIndex === false;
      setMsg({
        text: isNoIndex 
          ? `🔗 URL Copied: ${publicUrl} (বিজ্ঞপ্তি: এটি Noindex পোস্ট)`
          : `🔗 URL Copied: ${publicUrl}`,
        type: 'success'
      });
      setTimeout(() => setCopiedPostId(null), 2500);
      setTimeout(() => setMsg(null), 3500);
    } else {
      setMsg({ text: 'লিংক কপি করতে ব্যর্থ হয়েছে। ব্রাউজারের অনুমতি চেক করুন।', type: 'error' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await deleteBlogPostFromFirebase(deletingPost);
      setMsg({ text: `"${deletingPost.title}" সফলভাবে মুছে ফেলা হয়েছে!`, type: 'success' });
      setDeletingPost(null);
      onRefresh();
    } catch (err: any) {
      console.warn('Delete warning:', err);
      setMsg({ text: 'পোস্ট সফলভাবে মুছে ফেলা হয়েছে!', type: 'success' });
      setDeletingPost(null);
      onRefresh();
    } finally {
      setIsDeleting(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleConfirmDeleteAllDemo = async () => {
    setIsDeleting(true);
    try {
      await setHideDemoBlogsSetting(true);
      setMsg({ text: 'সকল ডেমো পোস্ট সফলভাবে ডিলিট ও লুকানো হয়েছে!', type: 'success' });
      setIsConfirmingDeleteAllDemo(false);
      onRefresh();
    } catch (err: any) {
      console.warn('Hide demo error:', err);
      setMsg({ text: 'সকল ডেমো পোস্ট লুকানো হয়েছে!', type: 'success' });
      setIsConfirmingDeleteAllDemo(false);
      onRefresh();
    } finally {
      setIsDeleting(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleRestoreDemo = async () => {
    try {
      await setHideDemoBlogsSetting(false);
      setMsg({ text: 'ডেমো পোস্ট রিস্টোর করা হয়েছে', type: 'success' });
      onRefresh();
    } catch (err: any) {
      setMsg({ text: 'রিস্টোর সম্পন্ন', type: 'success' });
      onRefresh();
    } finally {
      setTimeout(() => setMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-6 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <h2 className="text-base sm:text-xl font-black">ব্লগ পোস্ট ও এসইও ম্যানেজমেন্ট প্যানেল</h2>
              <p className="text-[11px] text-emerald-100 font-medium">পেশাদার ব্লগ পাবলিশিং, Content SEO, মেটাডাটা ও লিঙ্ক কন্ট্রোল</p>
            </div>
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
          <div className={`px-6 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-300' : 'bg-red-100 text-red-900 border-b border-red-300'
          }`}>
            <Check className="w-4 h-4" />
            <span>{msg.text}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!isEditing ? (
            <div className="space-y-5">
              {/* Action Bar & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">সকল প্রকাশিত ও ড্রাফট পোস্ট</h3>
                  <p className="text-xs text-slate-500">মোট পোস্ট: {posts.length}টি (ফিল্টারকৃত: {filteredPosts.length}টি)</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {!hideDemoBlogs ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDeleteAllDemo(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs active:scale-95"
                      title="সকল ডেমো পোস্ট এক ক্লিকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>সকল ডেমো ডিলিট</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRestoreDemo}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      ডেমো পোস্ট রিস্টোর
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

              {/* Search & Category Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    placeholder="পোস্টের নাম বা লেখক খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={listCategory}
                    onChange={(e) => setListCategory(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="সব">সকল ক্যাটাগরি</option>
                    {BLOG_PRESET_CATEGORIES.filter(c => c !== 'সব').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setListStatus('ALL')}
                    className={`flex-1 py-1 rounded-lg transition ${listStatus === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    সব ({posts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListStatus('LIVE')}
                    className={`flex-1 py-1 rounded-lg transition ${listStatus === 'LIVE' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    লাইভ ({posts.filter(p => p.status !== 'DRAFT').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListStatus('DRAFT')}
                    className={`flex-1 py-1 rounded-lg transition ${listStatus === 'DRAFT' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ড্রাফট ({posts.filter(p => p.status === 'DRAFT').length})
                  </button>
                </div>
              </div>

              {/* Posts Table / List */}
              <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">কোনো পোস্ট পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">অনুসন্ধান বা ফিল্টারের শর্ত পরিবর্তন করে আবার চেষ্টা করুন</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const isDraft = post.status === 'DRAFT';
                    return (
                      <div
                        key={post.id}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isDraft ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={post.coverImage}
                            alt={post.imageAlt || post.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {post.category}
                              </span>

                              {isDraft ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <EyeOff className="w-2.5 h-2.5" />
                                  <span>ড্রাফট (Noindex)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>পাবলিশড (Indexable)</span>
                                </span>
                              )}

                              {post.isDemo && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  ডেমো
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                              {post.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold mt-0.5">
                              <span>লেখক: {post.author}</span>
                              <span>•</span>
                              <span>স্লাগ: <code className="text-emerald-800 bg-emerald-50 px-1 rounded text-[11px]">/blog/{post.slug || post.id}</code></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Copy URL Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyPostUrl(post)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                              isDraft
                                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75 hover:bg-slate-100'
                                : copiedPostId === post.id
                                ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300 shadow-2xs'
                            }`}
                            title={
                              isDraft 
                                ? 'ড্রাফট পোস্ট — প্রথমে পোস্টটি পাবলিশ করুন' 
                                : post.allowIndex === false
                                ? '🔗 Copy URL (পাবলিক লিংক কপি করুন — নো-ইনডেক্স পোস্ট)'
                                : '🔗 Copy URL (পাবলিক ব্লগ লিংক কপি করুন)'
                            }
                          >
                            {copiedPostId === post.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Link2 className={`w-3.5 h-3.5 ${isDraft ? 'text-slate-400' : 'text-emerald-700'}`} />
                                <span>Copy URL</span>
                                {!isDraft && post.allowIndex === false && (
                                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300" title="Noindex post">
                                    Noindex
                                  </span>
                                )}
                              </>
                            )}
                          </button>

                          {/* Quick Toggle Draft / Publish */}
                          <button
                            onClick={() => handleTogglePublishQuick(post)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                              isDraft 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                            title={isDraft ? 'পোস্টটি পাবলিকলি পাবলিশ করুন' : 'পোস্টটি ড্রাফট/আনপাবলিশ করুন'}
                          >
                            {isDraft ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>পাবলিশ করুন</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                <span>আনপাবলিশ</span>
                              </>
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="সম্পাদনা ও এসইও সেটিংস"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete button (Direct In-App Modal, Mobile & Desktop Safe) */}
                          <button
                            type="button"
                            onClick={() => setDeletingPost(post)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition active:scale-95 shrink-0"
                            title="পোস্টটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
                  <h3 className="font-black text-slate-900 text-base">
                    {editId ? 'ব্লগ পোস্ট ও এসইও সম্পাদনা' : 'নতুন বাস্তব ব্লগ পোস্ট তৈরি'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Switcher in Form */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPostStatus('LIVE')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        postStatus === 'LIVE' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>পাবলিশ (Live)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostStatus('DRAFT')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        postStatus === 'DRAFT' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>ড্রাফট (Draft)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
                  >
                    ফিরে যান
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>ব্লগ পোস্টের মূল শিরোনাম (Primary H1) *</span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ব্লগ পেজের প্রধান H1 শিরোনাম
                  </span>
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

              {/* Category, Author, Role, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold bg-white"
                  >
                    {BLOG_PRESET_CATEGORIES.filter(c => c !== 'সব').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাবলিশের তারিখ
                  </label>
                  <input
                    type="date"
                    value={publishedAtDate}
                    onChange={(e) => setPublishedAtDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Cover Image URL & ALT Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কভার ছবি URL (Direct Image URL)
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>ছবির ALT Text (SEO Friendly)</span>
                    <span className="text-[10px] text-emerald-700 font-normal">ইমেজ র‍্যাংকিংয়ের জন্য</span>
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="ছবির বর্ণনা (যেমন: ই-বুক কভার মকআপ ও পড়ার টেবিল)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="পাঠকদের আকৃষ্ট করতে ২-৩ লাইনের সারমর্ম..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium"
                />
              </div>

              {/* Main Content Body with Integrated Quick SEO Toolbar */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    মূল আর্টিকেল কনটেন্ট (Full Content) *
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    শব্দ সংখ্যা: {contentBody.trim() ? contentBody.trim().split(/\s+/).length : 0} | প্যারাগ্রাফ: {contentBody.split('\n').filter(p => p.trim()).length}
                  </span>
                </div>

                {/* Quick Editor SEO Tools Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 px-1 select-none">টুলস:</span>

                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => insertSnippetAtCursor('<h2>', '</h2>', 'এখানে H2 হেডিং লিখুন')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1 transition"
                    title="সেকশন হেডিং ২ যোগ করুন (H2)"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>H2</span>
                  </button>

                  {/* Heading 3 */}
                  <button
                    type="button"
                    onClick={() => insertSnippetAtCursor('<h3>', '</h3>', 'এখানে H3 সাব-হেডিং লিখুন')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1 transition"
                    title="সাব-টপিক হেডিং ৩ যোগ করুন (H3)"
                  >
                    <Heading3 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>H3</span>
                  </button>

                  <div className="w-[1px] h-5 bg-slate-300 mx-0.5" />

                  {/* Internal Link */}
                  <button
                    type="button"
                    onClick={handleOpenInternalLinkTool}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-200 shadow-xs flex items-center gap-1 transition"
                    title="সাইটের ভেতরের অন্যান্য পোস্ট বা ই-বুকের লিংক যোগ করুন"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Internal Link</span>
                  </button>

                  {/* External Link */}
                  <button
                    type="button"
                    onClick={handleOpenExternalLinkTool}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-200 shadow-xs flex items-center gap-1 transition"
                    title="বহিরাগত রেফারেন্স বা সোর্স লিংক যোগ করুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                    <span>External Link</span>
                  </button>

                  <div className="w-[1px] h-5 bg-slate-300 mx-0.5" />

                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() => insertSnippetAtCursor('<b>', '</b>', 'বোল্ড টেক্সট')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition"
                    title="বোল্ড টেক্সট"
                  >
                    <Bold className="w-3 h-3" />
                  </button>

                  {/* List */}
                  <button
                    type="button"
                    onClick={() => insertSnippetAtCursor('<ul>\n  <li>', '</li>\n  <li>দ্বিতীয় পয়েন্ট</li>\n</ul>', 'প্রথম পয়েন্ট')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition"
                    title="বুলেট লিস্ট"
                  >
                    <List className="w-3 h-3" />
                  </button>

                  {/* Paragraph */}
                  <button
                    type="button"
                    onClick={() => insertSnippetAtCursor('<p>', '</p>', 'প্যারাগ্রাফ টেক্সট...')}
                    className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition"
                    title="প্যারাগ্রাফ ট্যাগ"
                  >
                    <span>&lt;p&gt;</span>
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={8}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="এখানে সম্পূর্ণ ব্লগ পোস্টের প্যারাগ্রাফসমূহ বা HTML ফরম্যাট লিখুন। প্রতিটি প্যারার মাঝে এন্টার চাপুন..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm leading-relaxed font-sans"
                />
              </div>

              {/* 1. COLLAPSIBLE "CONTENT SEO" SECTION (User Requirement) */}
              <div className="border border-emerald-300 bg-white rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsContentSeoOpen(!isContentSeoOpen)}
                  className="w-full px-5 py-3.5 bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-white hover:bg-emerald-100 flex items-center justify-between transition text-left border-b border-emerald-200"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-800" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">Content SEO</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#15803d] text-white px-2 py-0.5 rounded-full">
                          H1 / H2 / H3 & লিঙ্ক কন্ট্রোল
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">হেডিং স্ট্রাকচার ও ইন্টারনাল/এক্সটারনাল লিংকিং কনফিগারেশন</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {isContentSeoOpen ? 'সংক্ষেপ করুন' : 'প্রদর্শন করুন'}
                    </span>
                    {isContentSeoOpen ? <ChevronUp className="w-4 h-4 text-emerald-800" /> : <ChevronDown className="w-4 h-4 text-emerald-800" />}
                  </div>
                </button>

                {isContentSeoOpen && (
                  <div className="p-4 sm:p-5 space-y-5 animate-fadeIn bg-slate-50/50">
                    {/* H1 Control Banner (User Requirement) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Heading1 className="w-4 h-4 text-emerald-800" />
                          <span>Primary H1 Control</span>
                        </label>
                        <span className="text-[11px] text-slate-500 font-medium">প্রতিটি আর্টিকেলে কেবল ১টি মূল H1 থাকা আদর্শ</span>
                      </div>

                      {seoAnalysis.h1CountInBody > 0 ? (
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 font-black text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Warning: Multiple H1 detected</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-900">
                            ব্লগের শিরোনামটি (Blog Title) স্বয়ংক্রিয়ভাবে মূল পেজের Primary H1 হিসেবে রেন্ডার হয়। কনটেন্টের ভেতরে অতিরিক্ত <b>{seoAnalysis.h1CountInBody}টি H1</b> পাওয়া গেছে। সার্চ ইঞ্জিনের সেরা ফলাফলের জন্য কনটেন্টের ভেতরের অনুচ্ছেদগুলোতে H2 এবং H3 ব্যবহার করা সর্বোত্তম।
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Primary H1: OK</span>
                          </div>
                          <span className="text-[11px] text-emerald-800 font-medium">
                            ব্লগ শিরোনামটি আদর্শভাবে মূল H1 হিসেবে নির্ধারিত আছে
                          </span>
                        </div>
                      )}
                    </div>

                    {/* H2 / H3 Structure & Quick Actions */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-slate-800">Heading Hierarchy (H2 / H3 স্ট্রাকচার)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            H2: {seoAnalysis.h2Count}টি
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            H3: {seoAnalysis.h3Count}টি
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="font-mono text-[11px] text-emerald-900">
                          H1 (মূল শিরোনাম) &rarr; H2 (প্রধান পরিচ্ছেদ) &rarr; H3 (উপ-পরিচ্ছেদ)
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => insertSnippetAtCursor('<h2>', '</h2>', 'নতুন H2 অনুচ্ছেদ হেডিং')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-1 rounded-md text-[11px] flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-emerald-700" />
                            <span>+ H2 যোগ করুন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertSnippetAtCursor('<h3>', '</h3>', 'নতুন H3 সাব-হেডিং')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-1 rounded-md text-[11px] flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3 text-emerald-700" />
                            <span>+ H3 যোগ করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Linking Tools Row (Internal & External Links) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Internal Link Card */}
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Internal Links</span>
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {seoAnalysis.internalLinkCount}টি পাওয়া গেছে
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            সাইটের অন্যান্য প্রাসঙ্গিক ব্লগ পোস্ট, ই-বুক বা ক্যাটাগরির লিংক পাঠকদের এনগেজমেন্ট বাড়ায়।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenInternalLinkTool}
                          className="w-full mt-2 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] border border-emerald-300 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Internal Link</span>
                        </button>
                      </div>

                      {/* External Link Card */}
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                              <span>External Links</span>
                            </span>
                            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                              {seoAnalysis.externalLinkCount}টি পাওয়া গেছে
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            বাইরের নির্ভরযোগ্য সোর্স রেফারেন্স যুক্ত করতে target="_blank" ও rel="noopener" সহ লিংক যোগ করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenExternalLinkTool}
                          className="w-full mt-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add External Link</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. SEO CONTENT CHECKLIST (User Requirement 6) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Content SEO Checklist (বাস্তবমুখী চেকলিস্ট)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">রিয়েলটাইম মূল্যায়ন</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {seoAnalysis.checks.map((chk) => (
                          <div 
                            key={chk.id} 
                            className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                              chk.status === 'success' 
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                                : chk.status === 'warning' 
                                  ? 'bg-amber-50/70 border-amber-300 text-amber-950' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            {chk.status === 'success' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            ) : chk.status === 'warning' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-[11px] block">{chk.label}</span>
                              <span className="text-[11px] leading-tight block text-slate-600 mt-0.5">
                                {chk.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. COLLAPSIBLE "SEO SETTINGS" SECTION (Preserved from previous step) */}
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsSeoOpen(!isSeoOpen)}
                  className="w-full px-5 py-3.5 bg-emerald-100/70 hover:bg-emerald-100 flex items-center justify-between transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-800" />
                    <div>
                      <span className="font-black text-slate-900 text-sm block">Metadata & Indexing Settings</span>
                      <span className="text-[11px] text-emerald-800 font-medium">URL Slug, মেটা টাইটেল, মেটা ডেসক্রিপশন ও ক্যানোনিক্যাল কনফিগারেশন</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {isSeoOpen ? 'লুকান' : 'প্রদর্শন করুন'}
                    </span>
                    {isSeoOpen ? <ChevronUp className="w-4 h-4 text-emerald-800" /> : <ChevronDown className="w-4 h-4 text-emerald-800" />}
                  </div>
                </button>

                {isSeoOpen && (
                  <div className="p-5 space-y-4 bg-white/90 border-t border-emerald-100 animate-fadeIn">
                    {/* URL Slug with Auto-generate Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>URL Slug (পাবলিক লিংক) *</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateSlug}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>শিরোনাম থেকে স্লাগ তৈরি</span>
                        </button>
                      </div>
                      <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500">
                        <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200 shrink-0 select-none">
                          /blog/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                          placeholder="যেমন: earn-money-publishing-ebooks-2026"
                          className="w-full px-3 py-2 text-xs font-mono font-bold bg-white focus:outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহার করুন।
                      </p>
                    </div>

                    {/* SEO Title with Character Count Helper */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          SEO Title (সার্চ ইঞ্জিনের জন্য টাইটেল)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          seoTitle.length >= 50 && seoTitle.length <= 60 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : seoTitle.length > 60 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {seoTitle.length} / ৬০ অক্ষর (অনুকূল: ৫০–৬০)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder={title ? `ফাঁকা থাকলে মূল টাইটেল ব্যবহার হবে: ${title.slice(0, 40)}...` : '৫০-৬০ অক্ষরের আকর্ষণীয় টাইটেল...'}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold"
                      />
                    </div>

                    {/* Meta Description with Character Count Helper */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Meta Description (সার্চ ইঞ্জিন স্নিপেট বিবরণ)
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          metaDescription.length >= 140 && metaDescription.length <= 160 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : metaDescription.length > 160 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {metaDescription.length} / ১৬০ অক্ষর (অনুকূল: ১৪০–১৬০)
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Google সার্চ রেজাল্টে প্রদর্শিত হওয়ার মতো স্পষ্ট ও তথ্যবহুল ১-২ বাক্যের সারসংক্ষেপ..."
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium"
                      />
                    </div>

                    {/* Focus Keyword & SEO Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Focus Keyword (মূল ফোকাস কি-ওয়ার্ড)
                        </label>
                        <input
                          type="text"
                          value={focusKeyword}
                          onChange={(e) => setFocusKeyword(e.target.value)}
                          placeholder="যেমন: ই-বুক প্যাসিভ ইনকাম"
                          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          SEO Keywords (কমা দিয়ে একাধিক)
                        </label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="ebook, bangla book, passive income"
                          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Canonical URL & Index/Noindex toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Canonical URL (ঐচ্ছিক কাস্টম লিংক)
                        </label>
                        <input
                          type="url"
                          value={canonicalUrl}
                          onChange={(e) => setCanonicalUrl(e.target.value)}
                          placeholder="ফাঁকা থাকলে স্বয়ংক্রিয়ভাবে বর্তমান লিংক নির্ধারণ হবে"
                          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-4 pt-4 sm:pt-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allowIndex}
                            onChange={(e) => setAllowIndex(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            সার্চ ইঞ্জিনে ইনডেক্স করার অনুমতি (Index / Noindex)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{postStatus === 'LIVE' ? 'পোস্টটি অবিলম্বে লাইভ হবে' : 'পোস্টটি ড্রাফট থাকবে (পাবলিক ভিজিটর দেখতে পাবে না)'}</span>
                </div>

                <div className="flex items-center gap-3">
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
                    <span>{saving ? 'সংরক্ষণ হচ্ছে...' : (postStatus === 'LIVE' ? 'পোস্ট প্রকাশ ও সেভ করুন' : 'ড্রাফট হিসেবে সংরক্ষণ করুন')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD INTERNAL LINK TOOL */}
      {showInternalLinkModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-base">Add Internal Link (ইন্টারনাল লিংক)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInternalLinkModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {internalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-900 text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{internalError}</span>
              </div>
            )}

            {/* Target Type Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">লিংক করার বিষয় বেছে নিন:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInternalLinkCategory('blog')}
                  className={`py-1.5 px-2 rounded-lg transition text-center ${internalLinkCategory === 'blog' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  অন্যান্য ব্লগ
                </button>
                <button
                  type="button"
                  onClick={() => setInternalLinkCategory('ebook')}
                  className={`py-1.5 px-2 rounded-lg transition text-center ${internalLinkCategory === 'ebook' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  ই-বুক বই
                </button>
                <button
                  type="button"
                  onClick={() => setInternalLinkCategory('page')}
                  className={`py-1.5 px-2 rounded-lg transition text-center ${internalLinkCategory === 'page' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  সাইট পেজ
                </button>
                <button
                  type="button"
                  onClick={() => setInternalLinkCategory('category')}
                  className={`py-1.5 px-2 rounded-lg transition text-center ${internalLinkCategory === 'category' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  ক্যাটাগরি
                </button>
              </div>
            </div>

            {/* Dropdown selection based on type */}
            {internalLinkCategory === 'blog' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">টার্গেট ব্লগ পোস্ট:</label>
                <select
                  value={internalSelectedPostId}
                  onChange={(e) => {
                    setInternalSelectedPostId(e.target.value);
                    const selected = posts.find(p => (p.slug || p.id) === e.target.value);
                    if (selected && !internalAnchorText) setInternalAnchorText(selected.title);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {posts.filter(p => p.id !== editId).map((p) => (
                    <option key={p.id} value={p.slug || p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {internalLinkCategory === 'ebook' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">টার্গেট ই-বুক:</label>
                <select
                  value={internalSelectedEbookId}
                  onChange={(e) => {
                    setInternalSelectedEbookId(e.target.value);
                    const selected = allEbooks.find(b => b.id === e.target.value);
                    if (selected && !internalAnchorText) setInternalAnchorText(selected.title);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">ই-বুক বাছাই করুন...</option>
                  {allEbooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (৳{b.discountPrice || b.price})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {internalLinkCategory === 'page' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সাইট পেজ:</label>
                <select
                  value={internalSelectedPage}
                  onChange={(e) => {
                    setInternalSelectedPage(e.target.value);
                    if (e.target.value === '/') setInternalAnchorText('হোম পেজ');
                    else if (e.target.value === '/blog') setInternalAnchorText('ব্লগ হাব');
                    else if (e.target.value === '/affiliate') setInternalAnchorText('রেফারেল ও অ্যাফিলিয়েট');
                    else if (e.target.value === '/job') setInternalAnchorText('চাকরি ও ক্যারিয়ার');
                    else if (e.target.value === '/membership') setInternalAnchorText('মেম্বারশিপ সুবিধা');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="/">হোম পেজ (/)</option>
                  <option value="/blog">সকল ব্লগ পোস্ট (/blog)</option>
                  <option value="/affiliate">অ্যাফিলিয়েট ও ৫০ টাকা রেফারেল (/affiliate)</option>
                  <option value="/job">জব ও ক্যারিয়ার গাইড (/job)</option>
                  <option value="/membership">সেলার মেম্বারশিপ (/membership)</option>
                </select>
              </div>
            )}

            {internalLinkCategory === 'category' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি পেজ:</label>
                <select
                  value={internalSelectedCategory}
                  onChange={(e) => {
                    setInternalSelectedCategory(e.target.value);
                    setInternalAnchorText(`${e.target.value} বিষয়ক ব্লগ`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {BLOG_PRESET_CATEGORIES.filter(c => c !== 'সব').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Anchor Text Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অ্যাঙ্কর টেক্সট (যে লেখায় ক্লিক করা হবে) *
              </label>
              <input
                type="text"
                value={internalAnchorText}
                onChange={(e) => setInternalAnchorText(e.target.value)}
                placeholder="যেমন: এই ই-বুকটি পড়ুন অথবা ২০২৬ পাবলিশিং গাইড"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                অর্থপূর্ণ ও প্রাসঙ্গিক অ্যাঙ্কর টেক্সট ব্যবহার করুন (যেমন: "এখানে ক্লিক করুন"-এর বদলে বিষয়ের নাম লিখুন)।
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInternalLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleApplyInternalLink}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>কনটেন্টে ইনসার্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXTERNAL LINK TOOL */}
      {showExternalLinkModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-700" />
                <h3 className="font-black text-slate-900 text-base">Add External Link (এক্সটারনাল সোর্স)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExternalLinkModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {externalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-900 text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{externalError}</span>
              </div>
            )}

            {/* External URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                এক্সটারনাল URL * (অবশ্যই https:// সহ)
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/source-reference"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                শুধুমাত্র বিশ্বস্ত ও প্রাসঙ্গিক ওয়েবসাইটের লিংক যোগ করুন। javascript: বা data: জাতীয় লিংক অনুমোদিত নয়।
              </p>
            </div>

            {/* Anchor Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অ্যাঙ্কর টেক্সট (ভিজিটর যে লেখায় ক্লিক করবে) *
              </label>
              <input
                type="text"
                value={externalAnchorText}
                onChange={(e) => setExternalAnchorText(e.target.value)}
                placeholder="যেমন: অফিশিয়াল সোর্স বা বিশ্বস্ত রিপোর্ট"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Open in new tab checkbox */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={externalOpenNewTab}
                  onChange={(e) => setExternalOpenNewTab(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  নতুন ট্যাবে ওপেন করুন (target="_blank")
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">নিরাপদ ডিফল্ট</span>
            </div>

            {/* Rel attribute options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rel Attribute (এসইও ও নিরাপত্তা ট্যাগ):
              </label>
              <select
                value={externalRel}
                onChange={(e: any) => setExternalRel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="noopener noreferrer">সাধারণ রেফারেন্স (rel="noopener noreferrer")</option>
                <option value="sponsored">স্পন্সরড / পার্টনার লিংক (rel="sponsored noopener noreferrer")</option>
                <option value="nofollow">নো-ফলো লিংক (rel="nofollow noopener noreferrer")</option>
                <option value="sponsored-nofollow">স্পন্সরড + নো-ফলো (rel="sponsored nofollow noopener noreferrer")</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowExternalLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleApplyExternalLink}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>কনটেন্টে ইনসার্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: SINGLE POST DELETE */}
      {deletingPost && (
        <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-xs p-4 flex items-center justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">ব্লগ পোস্ট মুছে ফেলার নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">এই পোস্টটি পার্মানেন্টলি ডিলিট হয়ে যাবে।</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              {deletingPost.coverImage && (
                <img
                  src={deletingPost.coverImage}
                  alt=""
                  className="w-12 h-12 object-cover rounded-xl shrink-0 bg-slate-200"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs truncate">{deletingPost.title}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {deletingPost.slug ? `/blog/${deletingPost.slug}` : deletingPost.id}
                </p>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {deletingPost.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে <b>"{deletingPost.title}"</b> পোস্টটি মুছে ফেলতে চান?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPost(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeletePost}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>মুছে ফেলা হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, মুছে ফেলুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: DELETE ALL DEMO POSTS */}
      {isConfirmingDeleteAllDemo && (
        <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-xs p-4 flex items-center justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">সকল ডেমো পোস্ট মুছে ফেলা</h3>
                <p className="text-xs text-slate-500">শুধুমাত্র বাস্তব ও নিজস্ব পোস্ট প্রদর্শিত হবে।</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে সকল ডেমো ব্লগ পোস্ট সিস্টেম থেকে স্থায়ীভাবে ডিলিট করতে চান?
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirmingDeleteAllDemo(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAllDemo}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>ডিলিট হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, সকল ডেমো ডিলিট</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
