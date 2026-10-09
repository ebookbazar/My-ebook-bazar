import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  Tag, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  Briefcase,
  ChevronDown,
  Layers,
  ShoppingBag,
  Copy,
  Check,
  Calendar,
  Clock,
  Trophy
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EbookCard } from './components/EbookCard';
import { ImageSlideshow } from './components/ImageSlideshow';
import { HomeFeatureCards } from './components/HomeFeatureCards';
import { RealWebsiteStats } from './components/RealWebsiteStats';
import { CuratedPicksSection } from './components/CuratedPicksSection';
import { LeaderboardSection } from './components/LeaderboardSection';
import { AppDownloadBanner } from './components/AppDownloadBanner';

// Dynamic lazy-loaded views, widgets & heavy modals for lightning-fast initial page load
const EbookDetailModal = lazy(() => import('./components/EbookDetailModal').then(m => ({ default: m.EbookDetailModal })));
const CartModal = lazy(() => import('./components/CartModal').then(m => ({ default: m.CartModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const BlogModal = lazy(() => import('./components/BlogModal').then(m => ({ default: m.BlogModal })));
const FloatingSearch = lazy(() => import('./components/FloatingSearch').then(m => ({ default: m.FloatingSearch })));
const LiveChatWidget = lazy(() => import('./components/LiveChatWidget').then(m => ({ default: m.LiveChatWidget })));
const CheckoutView = lazy(() => import('./components/CheckoutView').then(m => ({ default: m.CheckoutView })));
const UserDashboard = lazy(() => import('./components/UserDashboard').then(m => ({ default: m.UserDashboard })));
const SellerDashboard = lazy(() => import('./components/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const PdfReaderModal = lazy(() => import('./components/PdfReaderModal').then(m => ({ default: m.PdfReaderModal })));
const TermsConditionsModal = lazy(() => import('./components/LegalModals').then(m => ({ default: m.TermsConditionsModal })));
const PrivacyPolicyModal = lazy(() => import('./components/LegalModals').then(m => ({ default: m.PrivacyPolicyModal })));
const MembershipView = lazy(() => import('./components/MembershipView').then(m => ({ default: m.MembershipView })));
const JobServicesView = lazy(() => import('./components/JobServicesView').then(m => ({ default: m.JobServicesView })));
const AllFeaturesView = lazy(() => import('./components/AllFeaturesView').then(m => ({ default: m.AllFeaturesView })));
const AboutView = lazy(() => import('./components/AboutView').then(m => ({ default: m.AboutView })));
const TermsView = lazy(() => import('./components/TermsView').then(m => ({ default: m.TermsView })));
const BlogView = lazy(() => import('./components/BlogView').then(m => ({ default: m.BlogView })));
const AdminBlogManagerModal = lazy(() => import('./components/AdminBlogManagerModal').then(m => ({ default: m.AdminBlogManagerModal })));
const FreeToolsView = lazy(() => import('./components/FreeToolsView').then(m => ({ default: m.FreeToolsView })));
import { HomeFreeToolsSection } from './components/HomeFreeToolsSection';
import { FreeToolConfig, ToolId } from './types/freeTools';
import { DEFAULT_FREE_TOOLS } from './data/defaultFreeTools';

// Lightweight smooth loader for lazy views
const ViewLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-3">
    <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-bold text-slate-500 animate-pulse">লোড হচ্ছে...</p>
  </div>
);
import { 
  extractBloggerPostsFromDOM, 
  fetchBloggerFeedPosts, 
  setHideDemoBlogsSetting,
  getLocalStoredBlogs,
  saveLocalStoredBlogs,
  getLocalHideDemoBlogs,
  setLocalHideDemoBlogs,
  getInitialBlogPosts,
  getDeletedBlogIds
} from './services/blogService';
import { Ebook, BlogPost, AppDownloadSettings, DEFAULT_APP_DOWNLOAD_SETTINGS, EbookRatingSummary } from './types';
import { INITIAL_EBOOKS } from './data/initialEbooks';
import { BLOG_POSTS } from './data/blogPosts';
import { db, ref, onValue, set, update } from './firebase';
import { subscribeToAllRatingSummaries, getLocalRatingSummaries } from './services/ratingService';

const CATEGORIES = [
  'সব বই',
  'কথাসাহিত্য ও উপন্যাস',
  'নন-ফিকশন',
  'কবিতা ও কাব্যগ্রন্থ',
  'ব্যবসায় ও উদ্যোক্তা',
  'ফ্রিল্যান্সিং ও আউটসোর্সিং',
  'ডিজিটাল মার্কেটিং',
  'মোবাইল অ্যাপ ডেভেলপমেন্ট',
  'ওয়েব ডেভেলপমেন্ট ও কোডিং',
  'ধর্মীয় ও আধ্যাত্মিক',
  'চাকরি প্রস্তুতি ও বিসিএস'
];

function MainApp() {
  const { currentUser, userProfile, isAdmin, login } = useAuth();
  const { isCartOpen, setIsCartOpen, addToCart } = useCart();

  // Navigation View
  const [currentView, setCurrentView] = useState<string>('home');

  // Free Tools State
  const [freeTools, setFreeTools] = useState<FreeToolConfig[]>(DEFAULT_FREE_TOOLS);
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);

  // Sync Free Tools settings from Firebase RTDB in real time
  useEffect(() => {
    const unsubTools = onValue(ref(db, 'freeTools'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const merged = DEFAULT_FREE_TOOLS.map(def => {
          if (val[def.id]) {
            return { ...def, ...val[def.id] };
          }
          return def;
        });
        setFreeTools(merged.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setFreeTools(DEFAULT_FREE_TOOLS);
      }
    }, () => {});
    return () => unsubTools();
  }, []);

  const handleAddToCart = (book: Ebook) => {
    addToCart({
      id: book.id,
      title: book.title,
      price: book.price,
      coverUrl: book.coverUrl,
      author: book.author,
      qty: 1,
      isSeller: Boolean(book.isSeller),
      sellerId: book.sellerId,
      sellerEmail: book.sellerEmail,
      sellerReferralCode: book.sellerReferralCode
    });
    setIsCartOpen(true);
  };

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'user-login' | 'user-register' | 'seller-register' | 'admin-login'>('user-login');
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [blogNotFoundSlug, setBlogNotFoundSlug] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('সব');
  
  // Selected eBook for detail modal
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  
  // Direct item for Checkout
  const [directCheckoutItem, setDirectCheckoutItem] = useState<Ebook | null>(null);

  // PDF In-App Reader State
  const [readingPdf, setReadingPdf] = useState<{ url: string; title: string } | null>(null);

  // Dynamic Blog Posts (Blogger DOM Bridge + Local Storage Cache + Firebase RTDB + Demo fallback)
  const [hideDemoBlogs, setHideDemoBlogs] = useState<boolean>(() => getLocalHideDemoBlogs());
  const [isAdminBlogManagerOpen, setIsAdminBlogManagerOpen] = useState<boolean>(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const initialReal = getInitialBlogPosts();
    // Only return real published blog posts from database/cache/DOM, never demo fallback
    return initialReal.filter(p => !p.isDemo);
  });

  // Ebooks from Firebase + Initial Fallback
  const [ebooks, setEbooks] = useState<Ebook[]>(INITIAL_EBOOKS);

  // Realtime 5-Star Rating Summaries for all eBooks across marketplace
  const [ratingSummaries, setRatingSummaries] = useState<Record<string, EbookRatingSummary>>(() => 
    getLocalRatingSummaries()
  );

  // Subscribe to realtime rating summaries (deferred slightly to prioritize FCP/LCP)
  useEffect(() => {
    let unsubRatings = () => {};
    const timer = setTimeout(() => {
      unsubRatings = subscribeToAllRatingSummaries((summaries) => {
        setRatingSummaries(summaries);
      });
    }, 350);
    return () => {
      clearTimeout(timer);
      unsubRatings();
    };
  }, []);

  // Real Website Stats from Firebase RTDB (Total users, sellers, ebooks)
  const [totalUsersCount, setTotalUsersCount] = useState<number>(17);
  const [totalSellersCount, setTotalSellersCount] = useState<number>(7);

  // App Download Settings from Realtime Database
  const [appDownloadSettings, setAppDownloadSettings] = useState<AppDownloadSettings>(DEFAULT_APP_DOWNLOAD_SETTINGS);

  // Listen to Realtime counts of users and sellers from public _platformStats
  useEffect(() => {
    // 1. Public realtime stats (works for all visitors without auth barrier)
    const statsRef = ref(db, 'ebooks/_platformStats');
    const unsubStats = onValue(statsRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val.totalUsers === 'number') setTotalUsersCount(val.totalUsers);
        if (val && typeof val.totalSellers === 'number') setTotalSellersCount(val.totalSellers);

        // Instant real-time public App Download sync without auth barrier
        if (val && (val.appDownloadUrl || val.downloadUrl || typeof val.appDownloadActive === 'boolean')) {
          const directUrl = (val.appDownloadUrl || val.downloadUrl || '').trim();
          const isActive = val.active !== false && val.appDownloadActive !== false && Boolean(directUrl);
          setAppDownloadSettings(prev => ({
            ...prev,
            url: directUrl,
            downloadUrl: directUrl,
            appDownloadUrl: directUrl,
            active: isActive,
            appDownloadEnabled: isActive,
            downloads: Number(val.appDownloadCount ?? val.downloads ?? val.downloadCount ?? prev.downloads ?? 0)
          }));
        }
      }
    });

    // 2. Direct listeners when authenticated as Admin (syncs latest counts to _platformStats)
    let unsubUsers = () => {};
    let unsubSellers = () => {};
    if (isAdmin) {
      const usersRef = ref(db, 'users');
      unsubUsers = onValue(usersRef, (snap) => {
        if (snap.exists()) {
          const count = Object.keys(snap.val() || {}).length;
          setTotalUsersCount(count);
          try {
            update(ref(db, 'ebooks/_platformStats'), { totalUsers: count, updatedAt: Date.now() }).catch(() => {});
          } catch {
            // ignore
          }
        }
      }, () => {});

      const sellersRef = ref(db, 'sellers');
      unsubSellers = onValue(sellersRef, (snap) => {
        if (snap.exists()) {
          const count = Object.keys(snap.val() || {}).length;
          setTotalSellersCount(count);
          try {
            update(ref(db, 'ebooks/_platformStats'), { totalSellers: count, updatedAt: Date.now() }).catch(() => {});
          } catch {
            // ignore
          }
        }
      }, () => {});
    }

    // Listen to App Download Settings from Realtime Database (Optimized single-stream listener)
    const handleDownloadSnap = (snap: any) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val) {
          if (typeof val === 'string') {
            const raw = val.trim();
            setAppDownloadSettings(prev => ({
              ...prev,
              url: raw,
              downloadUrl: raw,
              appDownloadUrl: raw,
              active: Boolean(raw),
              appDownloadEnabled: Boolean(raw)
            }));
          } else if (typeof val === 'object') {
            const resolvedUrl = (val.downloadUrl || val.url || val.appDownloadUrl || val.app_download_url || '').trim();
            const isActive = val.active !== false && val.appDownloadEnabled !== false && Boolean(resolvedUrl);
            setAppDownloadSettings(prev => ({
              ...prev,
              ...val,
              url: resolvedUrl,
              downloadUrl: resolvedUrl,
              appDownloadUrl: resolvedUrl,
              active: isActive,
              appDownloadEnabled: isActive,
              downloads: Number(val.downloads ?? val.downloadCount ?? val.count ?? 0)
            }));
          }
        }
      }
    };

    const unsubAppDownload0 = onValue(ref(db, 'ebooks/_appDownload'), handleDownloadSnap, () => {});
    const unsubAppDownload2 = onValue(ref(db, 'settings/appDownload'), (snap) => {
      if (snap.exists()) handleDownloadSnap(snap);
    }, () => {});

    return () => {
      unsubStats();
      unsubUsers();
      unsubSellers();
      unsubAppDownload0();
      unsubAppDownload2();
    };
  }, [isAdmin]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব বই');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price-low' | 'price-high'>('latest');

  // Load Ebooks from Firebase Realtime Database
  useEffect(() => {
    const ebooksRef = ref(db, 'ebooks');
    const unsub = onValue(ebooksRef, (snap) => {
      if (snap.exists()) {
        const books: Ebook[] = [];
        snap.forEach((child) => {
          if (typeof child.key === 'string' && child.key.startsWith('_')) return;
          const val = child.val() as Ebook;
          if (!val || typeof val !== 'object' || !val.title) return;
          // Only show published books or admin books on the marketplace
          if (val.status === 'published' || !val.status) {
            books.push({ ...val, id: child.key as string });
          }
        });
        if (books.length > 0) {
          setEbooks(books);
        } else {
          // If node exists but empty, seed initial books
          INITIAL_EBOOKS.forEach(b => {
            set(ref(db, `ebooks/${b.id}`), b);
          });
          setEbooks(INITIAL_EBOOKS);
        }
      } else {
        // Seed initial books into Firebase
        INITIAL_EBOOKS.forEach(b => {
          set(ref(db, `ebooks/${b.id}`), b);
        });
        setEbooks(INITIAL_EBOOKS);
      }
    });

    return () => unsub();
  }, []);

  // Realtime sync for Blog Posts from Blogger DOM Bridge, Blogger Public Feed API, Local Cache & Firebase RTDB
  useEffect(() => {
    // 1. Check Blogger DOM Bridge (Instant)
    const domPosts = extractBloggerPostsFromDOM();
    if (domPosts.length > 0) {
      setBlogPosts(prev => {
        const map = new Map<string, BlogPost>();
        domPosts.forEach(p => map.set(p.id, p));
        prev.forEach(p => {
          if (!map.has(p.id)) map.set(p.id, p);
        });
        const updated = Array.from(map.values());
        saveLocalStoredBlogs(updated.filter(p => !p.isDemo));
        return updated;
      });
    }

    // 2. Fetch Blogger Public Feed (Auto-discovers new posts without manual rebuilds)
    fetchBloggerFeedPosts().then((feedPosts) => {
      if (feedPosts && feedPosts.length > 0) {
        setBlogPosts(prev => {
          const map = new Map<string, BlogPost>();
          feedPosts.forEach(p => map.set(p.id, p));
          prev.filter(p => !p.isDemo).forEach(p => map.set(p.id, p));
          const updated = Array.from(map.values());
          saveLocalStoredBlogs(updated.filter(p => !p.isDemo));
          return updated;
        });
      }
    }).catch(() => {});

    // Common snapshot processor for Firebase blog nodes
    const handleFirebaseBlogsSnapshot = (snap: any) => {
      if (!snap.exists()) return;
      const val = snap.val();
      if (!val || typeof val !== 'object') return;

      const deletedSet = new Set(getDeletedBlogIds());
      const fbPosts: BlogPost[] = Object.keys(val)
        .filter(key => !deletedSet.has(key))
        .map(key => ({
          ...val[key],
          id: key,
          isDemo: false
        }))
        .filter(p => !deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug)));

      setBlogPosts(prev => {
        const map = new Map<string, BlogPost>();
        // Keep existing real posts from Blogger DOM / feed / local
        prev.filter(p => !p.isDemo && !deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))).forEach(p => map.set(p.id, p));
        // Add or update from Firebase
        fbPosts.forEach(p => map.set(p.id, p));
        const merged = Array.from(map.values());
        // Save merged real posts to local cache
        saveLocalStoredBlogs(merged);
        return merged;
      });
    };

    // 3. Primary Firebase RTDB /blogs listener (with error handler for unauthenticated state)
    const blogsRef = ref(db, 'blogs');
    const unsubBlogs = onValue(blogsRef, handleFirebaseBlogsSnapshot, (err) => {
      console.warn('Firebase RTDB /blogs read restricted (using mirror/cache fallback):', err?.message);
    });

    // 4. Dual-Layer Public Mirror /ebooks/_blogs listener (Publicly accessible in RTDB for all visitors & post-logout)
    const mirrorBlogsRef = ref(db, 'ebooks/_blogs');
    const unsubMirrorBlogs = onValue(mirrorBlogsRef, handleFirebaseBlogsSnapshot, (err) => {
      console.warn('Firebase RTDB /ebooks/_blogs mirror notice:', err?.message);
    });

    // 5. Settings for hideDemoBlogs (Both primary and mirror nodes)
    const handleHideDemoSnap = (snap: any) => {
      if (snap.exists()) {
        const val = Boolean(snap.val());
        setHideDemoBlogs(val);
        setLocalHideDemoBlogs(val);
      }
    };
    const unsubHideDemo = onValue(ref(db, 'settings/hideDemoBlogs'), handleHideDemoSnap, () => {});
    const unsubMirrorHideDemo = onValue(ref(db, 'ebooks/_settings/hideDemoBlogs'), handleHideDemoSnap, () => {});

    // 6. Blogger post item route detection
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__BLOGGER_PAGE_TYPE__ === 'item' && win.__BLOGGER_POST_ID__) {
        const activeDomPosts = extractBloggerPostsFromDOM();
        const target = activeDomPosts.find(p => p.id === win.__BLOGGER_POST_ID__) || activeDomPosts[0];
        if (target) {
          setSelectedBlogPost(target);
          setCurrentView('blog');
        }
      }
    }

    return () => {
      unsubBlogs();
      unsubMirrorBlogs();
      unsubHideDemo();
      unsubMirrorHideDemo();
    };
  }, []);

  // Filter blog posts (Displays ONLY REAL published posts from database, strictly excludes demo, PAGE, and SOFT_TRASHED/DRAFT)
  const displayedBlogPosts = useMemo(() => {
    return blogPosts.filter(p => {
      // Must not be demo or sample
      if (p.isDemo) return false;
      // Must not be PAGE
      if (p.type === 'PAGE') return false;
      // Must not be SOFT_TRASHED or DRAFT
      if (p.status && (p.status === 'SOFT_TRASHED' || p.status === 'DRAFT')) return false;
      return true;
    });
  }, [blogPosts]);

  // Synchronize URL routing for /blog and /blog/:slug with HTML5 history and popstate
  const getAppBaseUrl = () => (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  useEffect(() => {
    const handleUrlRoute = () => {
      if (typeof window === 'undefined') return;
      const basePath = getAppBaseUrl();
      let pathname = window.location.pathname;
      if (basePath && pathname.startsWith(basePath)) {
        pathname = pathname.slice(basePath.length);
      }
      if (!pathname.startsWith('/')) {
        pathname = '/' + pathname;
      }

      if (pathname.startsWith('/blog/') || pathname === '/blog') {
        setCurrentView('blog');
        if (pathname.startsWith('/blog/')) {
          const rawSlug = pathname.replace('/blog/', '').replace(/\/$/, '').trim();
          if (rawSlug) {
            const target = blogPosts.find(p => (p.slug && p.slug === rawSlug) || p.id === rawSlug);
            const isUserAdmin = currentUser?.email === 'suma47083@gmail.com' || userProfile?.role === 'admin' || currentUser?.email === 'admin@ebookbazar.com' || currentUser?.email === 'redx0187@gmail.com';
            if (target) {
              if (target.status === 'DRAFT' && !isUserAdmin) {
                setBlogNotFoundSlug(rawSlug);
                setSelectedBlogPost(null);
              } else {
                setSelectedBlogPost(target);
                setBlogNotFoundSlug(null);
              }
            } else if (blogPosts.length > 0) {
              setBlogNotFoundSlug(rawSlug);
              setSelectedBlogPost(null);
            }
          } else {
            setSelectedBlogPost(null);
            setBlogNotFoundSlug(null);
          }
        } else {
          setSelectedBlogPost(null);
          setBlogNotFoundSlug(null);
        }
      } else if (pathname === '/' || pathname === '/home' || pathname === '') {
        // Only reset if currently on blog view
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView(prev => (prev === 'blog' ? 'home' : prev));
      } else if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        setIsAdminOpen(true);
      } else if (pathname === '/tools' || pathname.startsWith('/tools/')) {
        setCurrentView('tools');
        const sub = pathname.replace('/tools', '').replace(/^\//, '').replace(/\/$/, '').trim();
        if (sub) {
          setSelectedToolId(sub as ToolId);
        } else {
          setSelectedToolId(null);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [blogPosts, currentUser, userProfile]);

  const handleOpenBlog = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setBlogNotFoundSlug(null);
    setCurrentView('blog');
    const slug = post.slug || post.id;
    if (typeof window !== 'undefined') {
      const targetUrl = `${getAppBaseUrl()}/blog/${slug}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ blogSlug: slug }, '', targetUrl);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetSelectedBlogPost = (post: BlogPost | null) => {
    setSelectedBlogPost(post);
    setBlogNotFoundSlug(null);
    if (typeof window !== 'undefined') {
      const base = getAppBaseUrl();
      if (post) {
        const slug = post.slug || post.id;
        const targetUrl = `${base}/blog/${slug}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({ blogSlug: slug }, '', targetUrl);
        }
      } else {
        if (window.location.pathname.includes('/blog/')) {
          window.history.pushState({}, '', `${base}/blog`);
        }
      }
    }
  };

  const handleNavigateHomeFromBlog = () => {
    setSelectedBlogPost(null);
    setBlogNotFoundSlug(null);
    setCurrentView('home');
    if (typeof window !== 'undefined' && window.location.pathname.includes('/blog')) {
      const homeUrl = getAppBaseUrl() + '/' || '/';
      window.history.pushState({}, '', homeUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to URL hash for direct links (e.g. #admin, #seller, #dashboard, #features)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#features' || hash === '#all-features') {
        setCurrentView('all-features');
      } else if (hash === '#admin') {
        setIsAdminOpen(true);
      } else if (hash === '#seller') {
        setCurrentView('seller-dashboard');
      } else if (hash === '#dashboard' || hash === '#user') {
        setCurrentView('user-dashboard');
      } else if (hash === '#tools' || hash.startsWith('#tools/')) {
        setCurrentView('tools');
        const sub = hash.replace('#tools', '').replace(/^\//, '').trim();
        if (sub) {
          setSelectedToolId(sub as ToolId);
        } else {
          setSelectedToolId(null);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Capture referral code from URL query (?ref=CODE) and persist
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('ebookbazar_pending_ref', refCode.trim().toUpperCase());
    }
  }, []);

  // Open AuthModal immediately if user navigates to login or register
  useEffect(() => {
    if (currentView === 'login') {
      setAuthInitialMode('user-login');
      setIsAuthOpen(true);
    } else if (currentView === 'register') {
      setAuthInitialMode('user-register');
      setIsAuthOpen(true);
    }
  }, [currentView]);

  // When User, Seller, or Admin logs out, automatically show Home page and close admin panel
  const prevUserRef = React.useRef(currentUser);
  useEffect(() => {
    if (prevUserRef.current && !currentUser) {
      setCurrentView('home');
      setIsAdminOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  // Filtered & Sorted Ebooks
  const filteredEbooks = (ebooks || []).filter((b) => {
    if (!b || !b.title) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    const title = (b.title || '').toLowerCase();
    const author = (b.author || '').toLowerCase();
    const category = (b.category || '').toLowerCase();

    const matchesSearch = 
      !q ||
      title.includes(q) ||
      author.includes(q) ||
      category.includes(q);

    const matchesCategory = 
      selectedCategory === 'সব বই' || b.category === selectedCategory;

    const matchesLevel = 
      selectedLevel === 'all' || b.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'price-low') {
      const pA = a.discountPrice || a.price;
      const pB = b.discountPrice || b.price;
      return pA - pB;
    }
    if (sortBy === 'price-high') {
      const pA = a.discountPrice || a.price;
      const pB = b.discountPrice || b.price;
      return pB - pA;
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const handleBuyNow = (ebook: Ebook) => {
    setDirectCheckoutItem(ebook);
    setSelectedEbook(null);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPdfReader = (url: string, title: string) => {
    setReadingPdf({ url, title });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Universal Top Header (1. Header / Logo / Navigation + 2. Announcement Bar) */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          setIsAdminOpen(true);
        }}
        onOpenNotifications={() => {
          setCurrentView('home');
        }}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode);
          setIsAuthOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 max-w-7xl pt-4 space-y-6">
        {/* VIEW 1: HOME MARKETPLACE */}
        {currentView === 'home' && (
          <div className="space-y-6 md:space-y-8 animate-soft-fade-in">
            {/* Frontend App Download Section (Header-এর ঠিক নিচে ও Homepage-এর মূল কন্টেন্ট শুরুর আগে) */}
            <AppDownloadBanner
              title={appDownloadSettings.appDownloadTitle}
              text={appDownloadSettings.appDownloadText}
              url={appDownloadSettings.downloadUrl || appDownloadSettings.url || appDownloadSettings.appDownloadUrl || ''}
              active={appDownloadSettings.active !== false && appDownloadSettings.appDownloadEnabled !== false}
              enabled={appDownloadSettings.active !== false && appDownloadSettings.appDownloadEnabled !== false}
            />

            {/* 1. Existing Slideshow / Hero Banner (Preserved layout, rounded corners, subtle shadow) */}
            <div className="pt-1">
              <ImageSlideshow />
            </div>

            {/* 2. Real Website Stats (Firebase Realtime Database: eBooks, Readers/Users, Sellers) */}
            <RealWebsiteStats
              totalEbooks={ebooks ? ebooks.length : null}
              totalUsers={totalUsersCount}
              totalSellers={totalSellersCount}
            />

            {/* 3. Existing 6 Home Feature Cards (BELOW Slideshow & Stats) */}
            <HomeFeatureCards
              currentView={currentView}
              setCurrentView={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 5. আজকের বাছাই (Top 3 Real Curated eBooks from Firebase) */}
            <CuratedPicksSection
              ebooks={ebooks}
              onViewDetails={(book) => setSelectedEbook(book)}
              onBuyNow={handleBuyNow}
              ratingSummaries={ratingSummaries}
            />

            {/* 5.1 ফ্রি ক্যালকুলেটর ও স্মার্ট টুলস (Free Tools Section) */}
            <HomeFreeToolsSection
              tools={freeTools}
              onOpenTool={(toolId) => {
                setSelectedToolId(toolId);
                setCurrentView('tools');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAllTools={() => {
                setSelectedToolId(null);
                setCurrentView('tools');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 6. জনপ্রিয় বিভাগ ও ফিল্টার সার্চ */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    সেরা বাংলা ই-বুক মার্কেটপ্লেস
                  </h1>
                  <p className="text-sm md:text-base text-slate-600 mt-1 font-medium">
                    স্কিল ডেভেলপমেন্ট, প্রোগ্রামিং, সাহিত্য ও ক্যারিয়ার প্রস্তুতিমূলক ডিজিটাল বই
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-88">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="বইয়ের নাম বা লেখক খুঁজুন..."
                    className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3 text-sm font-bold text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* জনপ্রিয় বিভাগ (Categories Scrolling Badges) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
                    জনপ্রিয় বিভাগ
                  </h3>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none text-sm font-bold">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 shadow-xs ${
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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">লেভেল:</span>
                  <div className="flex gap-1.5">
                    {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
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
                    className="bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="latest">নতুন বই আগে</option>
                    <option value="price-low">মূল্য: কম থেকে বেশি</option>
                    <option value="price-high">মূল্য: বেশি থেকে কম</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. নতুন eBook (Ebooks Grid) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>মার্কেটপ্লেস ক্যাটালগ</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>নতুন eBook</span>
                    <span className="text-sm md:text-base font-bold text-slate-500">
                      ({filteredEbooks.length}টি)
                    </span>
                  </h2>
                </div>
              </div>

              {filteredEbooks.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-black text-slate-800 text-lg">কোনো বই পাওয়া যায়নি</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    আপনার সার্চ কি-ওয়ার্ড অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </p>
                  <button
                    onClick={() => { setSelectedCategory('সব বই'); setSearchQuery(''); setSelectedLevel('all'); }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
                  >
                    সব বই দেখুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                  {filteredEbooks.map((book) => (
                    <EbookCard
                      key={book.id}
                      ebook={book}
                      onViewDetails={(b) => setSelectedEbook(b)}
                      onBuyNow={handleBuyNow}
                      ratingSummary={ratingSummaries[book.id]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 7.5. 🏆 Leaderboard + Community Feedback Section */}
            <LeaderboardSection
              onOpenAuthModal={(mode) => {
                setAuthInitialMode(mode || 'user-login');
                setIsAuthOpen(true);
              }}
            />

            {/* 8. সর্বশেষ লেখা (Featured Real Blog Posts Section on Home, exactly 3 latest articles) */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ব্লগার লাইভ পোস্ট</span>
                  </div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2.5">
                    <span>সর্বশেষ লেখা</span>
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 mt-1 font-medium">
                    ক্যারিয়ার, স্কিল ডেভেলপমেন্ট ও বাস্তব অভিজ্ঞতার সর্বশেষ ৩টি প্রকাশিত ব্লগ
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentView('blog');
                    setSelectedBlogPost(null);
                    setBlogNotFoundSlug(null);
                    if (typeof window !== 'undefined') {
                      const blogUrl = `${getAppBaseUrl()}/blog`;
                      if (window.location.pathname !== blogUrl) {
                        window.history.pushState({}, '', blogUrl);
                      }
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-emerald-800 hover:text-emerald-950 font-black text-sm md:text-base flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-5 py-2.5 rounded-2xl transition shadow-xs"
                >
                  <span>সব ব্লগ পোস্ট দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {displayedBlogPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 space-y-4 shadow-xs">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">এখনও কোনো ব্লগ পোস্ট প্রকাশিত হয়নি</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    খুব শীঘ্রই আমাদের নতুন তথ্যবহুল ব্লগ পোস্ট ও ক্যারিয়ার গাইড প্রকাশিত হবে।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedBlogPosts.slice(0, 3).map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenBlog(post)}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1 subtle-card-hover"
                    >
                      <div>
                        <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                          <img 
                            src={post.coverImage} 
                            alt={post.imageAlt || post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            loading="lazy"
                          />
                          <span className="absolute top-3 left-3 bg-[#15803d]/95 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl shadow-md border border-emerald-500/30">
                            {post.category}
                          </span>
                        </div>

                        <div className="p-5 sm:p-6 space-y-3">
                          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              <span>{post.date}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span>{post.readTime}</span>
                            </span>
                          </div>

                          <h3 className="font-black text-slate-900 text-base sm:text-lg lg:text-xl leading-snug group-hover:text-emerald-700 transition">
                            {post.title}
                          </h3>

                          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed line-clamp-3 font-medium">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm md:text-base">
                        <span className="text-xs sm:text-sm text-slate-500 font-bold">{post.author}</span>
                        <span className="text-emerald-700 font-black flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                          সম্পূর্ণ পড়ুন <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: BLOG */}
        {currentView === 'blog' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <BlogView
              posts={displayedBlogPosts}
              allEbooks={ebooks}
              activePost={selectedBlogPost}
              setActivePost={handleSetSelectedBlogPost}
              onNavigateHome={handleNavigateHomeFromBlog}
              onSelectEbook={(b) => {
                setSelectedEbook(b);
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isAdmin={currentUser?.email === 'suma47083@gmail.com' || userProfile?.role === 'admin' || currentUser?.email === 'admin@ebookbazar.com' || currentUser?.email === 'redx0187@gmail.com'}
              notFoundSlug={blogNotFoundSlug}
              onClearNotFound={() => {
                setBlogNotFoundSlug(null);
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/blog');
                }
              }}
              onDeleteDemo={async () => {
                if (window.confirm('আপনি কি নিশ্চিত যে সকল ডেমো ব্লগ পোস্ট ডিলিট করতে চান? এরপর শুধু আপনার তৈরি বাস্তব পোস্ট প্রদর্শিত হবে।')) {
                  await setHideDemoBlogsSetting(true);
                  setHideDemoBlogs(true);
                  alert('সকল ডেমো পোস্ট সফলভাবে ডিলিট ও লুকানো হয়েছে!');
                }
              }}
              onOpenAdminBlogManager={() => setIsAdminBlogManagerOpen(true)}
            />
          </Suspense>
        )}

        {/* VIEW 3: AFFILIATE */}
        {currentView === 'affiliate' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Navigation Bar with Clear "← Home" Button */}
            <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <button
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-xs sm:text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 shadow-xs group"
                title="মূল হোম পেজে ফিরে যান"
              >
                <span>← Home</span>
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>eBookBazar অ্যাফিলিয়েট ও রেফারেল প্রোগ্রাম</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-10 shadow-xl space-y-4">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                আজীবন রেফারেল প্রোগ্রাম
              </span>
              <h1 className="text-2xl md:text-4xl font-black">
                রেফার করুন ও প্রতি সফল অর্ডারে ৫০ টাকা আয় করুন!
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                আপনার অনন্য স্থায়ী রেফারেল কোড বন্ধু ও সোশ্যাল মিডিয়ায় শেয়ার করুন। কোনো ক্রেতা আপনার কোড দিয়ে অ্যাডমিনের বই কিনলে সাথে সাথে ৫০ টাকা কমিশন অর্জন করুন।
              </p>
              
              {userProfile?.referralCode ? (
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase block">আপনার স্থায়ী রেফারেল কোড</span>
                      <span className="text-2xl font-mono font-black tracking-widest text-white">{userProfile.referralCode}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userProfile.referralCode);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedRef ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                    </button>
                  </div>
                  
                  {/* Shareable Link Box */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-300 truncate font-mono">
                      {window.location.origin}{getAppBaseUrl()}/?ref={userProfile.referralCode}
                    </span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}${getAppBaseUrl()}/?ref=${userProfile.referralCode}`;
                        navigator.clipboard.writeText(link);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="text-amber-300 hover:underline shrink-0 text-xs font-bold"
                    >
                      লিংক কপি
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-amber-200">
                    রেফারেল কোড পেতে ও আয় শুরু করতে ফ্রি অ্যাকাউন্ট রেজিস্টার করুন।
                  </p>
                  <button
                    onClick={() => { setAuthInitialMode('user-register'); setIsAuthOpen(true); }}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow transition"
                  >
                    ফ্রি অ্যাকাউন্ট খুলে রেফারেল কোড পান
                  </button>
                </div>
              )}
            </div>

            {/* CRITICAL AFFILIATE RULE NOTICE */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-amber-950 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">!</span>
                <h3 className="font-black text-sm md:text-base text-amber-900">
                  রেফারেল কমিশন ৫০ টাকা পাওয়ার আবশ্যিক শর্তাবলী:
                </h3>
              </div>
              <ul className="text-xs space-y-1.5 pl-8 list-disc font-medium text-amber-950 leading-relaxed">
                <li>
                  <b>শুধুমাত্র অ্যাডমিন ই-বুক:</b> ক্রেতা যদি আপনার রেফারেল কোড ব্যবহার করে <u>শুধুমাত্র eBookBazar অ্যাডমিনের প্রকাশিত ই-বুক</u> ক্রয় করেন, তবেই আপনি ৫০ টাকা কমিশন পাবেন।
                </li>
                <li>
                  <b>সেলার ই-বুকে প্রযোজ্য নয়:</b> কোনো ক্রেতা রেফারেল কোড দিয়ে কোনো <u>সেলার বা লেখকের নিজস্ব ই-বুক</u> ক্রয় করলে রেফারারের অ্যাকাউন্টে ৫০ টাকা যোগ হবে না।
                </li>
                <li>
                  <b>অ্যাডমিন অনুমোদন:</b> ক্রেতা বিকাশ বা নগদে টাকা পাঠিয়ে TrxID সাবমিট করার পর অ্যাডমিন প্যানেল থেকে অর্ডার ভেরিফাই করে অনুমোদন (Approve) করলেই আপনার ব্যালেন্সে ৫০ টাকা স্বয়ংক্রিয়ভাবে জমা হবে।
                </li>
                <li>
                  <b>সহজ ও সম্পূর্ণ ফ্রি উইথড্র:</b> ব্যালেন্স ৫০ টাকা বা তার বেশি হলেই বিকাশ অথবা নগদের মাধ্যমে কোনো চার্জ ছাড়াই (উইথড্র চার্জ ০ টাকা) পুরো টাকা উইথড্র করতে পারবেন।
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">১</span>
                <h4 className="font-black text-slate-900 text-sm">কোড শেয়ার করুন</h4>
                <p className="text-xs text-slate-500">আপনার নিজস্ব রেফারেল লিংক বা কোড বন্ধুদের সাথে শেয়ার করুন।</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">২</span>
                <h4 className="font-black text-slate-900 text-sm">অ্যাডমিন বই ক্রয়</h4>
                <p className="text-xs text-slate-500">চেকআউটে রেফারেল কোড ব্যবহার করে ক্রেতা অ্যাডমিনের বই কিনবেন।</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">৩</span>
                <h4 className="font-black text-slate-900 text-sm">৫০ টাকা ব্যালেন্সে জমা</h4>
                <p className="text-xs text-slate-500">অ্যাডমিন অর্ডার অনুমোদন করলেই ৫০ টাকা সাথে সাথে জমা ও উইথড্র সুবিধা।</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: FAQ */}
        {currentView === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Top Navigation Bar with Clear "← Home" Button */}
            <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <button
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-xs sm:text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 shadow-xs group"
                title="মূল হোম পেজে ফিরে যান"
              >
                <span>← Home</span>
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h1 className="text-2xl font-black text-slate-900">সাধারণ জিজ্ঞাসা (FAQ)</h1>
              <p className="text-xs text-slate-500 mt-1">পেমেন্ট, ডাউনলোড ও সেলার সংক্রান্ত প্রশ্নাবলীর উত্তর</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'বই কেনার পর কীভাবে PDF ডাউনলোড করব?',
                  a: 'পেমেন্ট অনুমোদিত হওয়ার পর আপনার ইউজার ড্যাশবোর্ডের "লাইব্রেরি" ট্যাবে বইটি যুক্ত হবে। সেখানে "PDF পড়ুন" ও "ডাউনলোড" বাটনে ক্লিক করে সাথে সাথে বই পড়তে ও ডাউনলোড করতে পারবেন।'
                },
                {
                  q: 'পেমেন্ট করার কতক্ষণ পর বই লাইব্রেরিতে যুক্ত হয়?',
                  a: 'বিকাশ বা নগদ ট্রানজেকশন আইডি সাবমিট করার পর আমাদের টিম সর্বোচ্চ ১৫ থেকে ৩০ মিনিটের মধ্যে ভেরিফাই করে অনুমোদন সম্পন্ন করে।'
                },
                {
                  q: 'সেলার হিসেবে কীভাবে বই বিক্রি শুরু করব?',
                  a: 'সেলার রেজিস্ট্রেশন সম্পন্ন করুন। সেলার প্যানেল থেকে আপনার বইয়ের বিবরণ, মূল্য এবং পিডিএফ ড্রাইভ লিঙ্ক দিয়ে আপলোড করুন। অ্যাডমিন অনুমোদনের পর তা মার্কেটপ্লেসে লাইভ হবে।'
                },
                {
                  q: 'উইথড্র করার নিয়ম ও চার্জ কী?',
                  a: 'ন্যূনতম উইথড্র পরিমাণ ৫০ টাকা। সাধারণ ইউজারদের রেফারেল উইথড্রলে কোনো চার্জ নেই (উইথড্র চার্জ ০ টাকা, পুরো টাকা প্রদেয়)। সেলারদের বিক্রয়লব্ধ আয় উত্তোলনে প্রতি উইথড্রলে ফিক্সড ২০ টাকা প্রসেসিং ফি কর্তন করা হয় এবং বাকি নেট টাকা বিকাশ বা নগদ নম্বরে পাঠানো হয়।'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AboutView
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateAffiliate={() => {
                setCurrentView('affiliate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateMembership={() => {
                setCurrentView('membership');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        )}

        {/* VIEW: TERMS & CONDITIONS */}
        {currentView === 'terms' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TermsView
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        )}

        {/* VIEW 5: JOB & SERVICES */}
        {currentView === 'job' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <JobServicesView
              onNavigateAffiliate={() => {
                setCurrentView('affiliate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        )}

        {/* VIEW 6: OFFER */}
        {currentView === 'offer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-700 text-white rounded-3xl p-6 md:p-8 shadow-lg space-y-2">
              <span className="bg-black/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">সীমিত সময়ের ধামাকা</span>
              <h1 className="text-2xl md:text-3xl font-black">ঈদ ও বিশেষ ডিসকাউন্ট কম্বো প্যাক</h1>
              <p className="text-xs text-white/90">একত্রে একাধিক বই ক্রয় করলে পাচ্ছেন স্পেশাল ৫০% পর্যন্ত ছাড়!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ebooks.filter(b => b.discountPrice && b.discountPrice < b.price).map(book => (
                <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={book.coverUrl || 'https://via.placeholder.com/150'} alt="" className="w-14 h-20 object-cover rounded-xl bg-slate-200 shrink-0" />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-snug">{book.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-black text-emerald-700">৳{book.discountPrice}</span>
                        <span className="text-xs text-slate-400 line-through">৳{book.price}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyNow(book)}
                    className="bg-[#15803d] hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-sm shrink-0"
                  >
                    কিনুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: CHECKOUT */}
        {currentView === 'checkout' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <CheckoutView
              directItem={directCheckoutItem}
              onBack={() => setCurrentView('home')}
              onSuccess={() => {
                setDirectCheckoutItem(null);
                setCurrentView('user-dashboard');
              }}
            />
          </Suspense>
        )}

        {/* VIEW 8: USER DASHBOARD */}
        {currentView === 'user-dashboard' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <UserDashboard
              onOpenReader={handleOpenPdfReader}
              onNavigateHome={() => setCurrentView('home')}
            />
          </Suspense>
        )}

        {/* VIEW 9: SELLER DASHBOARD */}
        {currentView === 'seller-dashboard' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <SellerDashboard
              onOpenReader={handleOpenPdfReader}
              ratingSummaries={ratingSummaries}
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        )}

        {/* VIEW 10: MEMBERSHIP DETAILS */}
        {currentView === 'membership' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <MembershipView
              onNavigateHome={() => setCurrentView('home')}
              onOpenSellerDashboard={() => setCurrentView('seller-dashboard')}
              onOpenAuth={(mode) => {
                setAuthInitialMode(mode);
                setIsAuthOpen(true);
              }}
            />
          </Suspense>
        )}

        {/* VIEW 11: USER LIBRARY */}
        {currentView === 'library' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <UserDashboard
              onOpenReader={handleOpenPdfReader}
              onNavigateHome={() => setCurrentView('home')}
            />
          </Suspense>
        )}

        {/* VIEW 12: DEDICATED LOGIN / SIGNUP CARD */}
        {(currentView === 'login' || currentView === 'register') && (
          <div className="max-w-md mx-auto py-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {currentView === 'login' ? 'eBookBazar অ্যাকাউন্টে লগইন' : 'নতুন অ্যাকাউন্ট রেজিস্ট্রেশন'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentView === 'login' 
                  ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।' 
                  : 'রেজিস্ট্রেশন করে আজীবন ৫০ টাকা রেফারেল কমিশন ও ই-বুক সুবিধা গ্রহণ করুন।'}
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setAuthInitialMode(currentView === 'login' ? 'user-login' : 'user-register');
                    setIsAuthOpen(true);
                  }}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black text-sm py-3.5 rounded-xl shadow transition"
                >
                  {currentView === 'login' ? 'লগইন ফর্ম খুলুন' : 'রেজিস্ট্রেশন ফর্ম খুলুন'}
                </button>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      const newMode = currentView === 'login' ? 'user-register' : 'user-login';
                      setAuthInitialMode(newMode);
                      setCurrentView(currentView === 'login' ? 'register' : 'login');
                      setIsAuthOpen(true);
                    }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    {currentView === 'login' ? 'নতুন অ্যাকাউন্ট খুলতে চান? রেজিস্ট্রেশন' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন'}
                  </button>
                  <button
                    onClick={() => {
                      setAuthInitialMode('seller-register');
                      setIsAuthOpen(true);
                    }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    সেলার রেজিস্ট্রেশন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 13: ALL FEATURES HUB (ADMIN, SELLER, USER & PLATFORM) */}
        {currentView === 'all-features' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AllFeaturesView
              onOpenAdmin={() => setIsAdminOpen(true)}
              onNavigateSeller={() => { setCurrentView('seller-dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNavigateUser={() => { setCurrentView('user-dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNavigateHome={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNavigateJob={() => { setCurrentView('job'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNavigateMembership={() => { setCurrentView('membership'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onNavigateTools={() => { setCurrentView('tools'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </Suspense>
        )}

        {/* VIEW 14: FREE TOOLS & SMART CALCULATORS */}
        {currentView === 'tools' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <FreeToolsView
              tools={freeTools}
              selectedToolId={selectedToolId}
              onSelectTool={(toolId) => setSelectedToolId(toolId)}
              onNavigateHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenBlog={handleOpenBlog}
              onViewEbook={(b) => setSelectedEbook(b)}
              onAddToCart={handleAddToCart}
              allBlogPosts={blogPosts}
              allEbooks={ebooks}
            />
          </Suspense>
        )}
      </main>

      {/* Floating Quick Search (Search across real eBooks & Blogs) */}
      <Suspense fallback={null}>
        <FloatingSearch
          ebooks={ebooks}
          blogPosts={displayedBlogPosts}
          onSelectEbook={(b) => setSelectedEbook(b)}
          onSelectBlogPost={(p) => {
            handleOpenBlog(p);
          }}
        />
      </Suspense>

      {/* Floating Live Chat & Customer Support Widget ("Can I help you?") */}
      <Suspense fallback={null}>
        <LiveChatWidget sellerOnlineCount={totalSellersCount} />
      </Suspense>

      {/* Universal Footer */}
      <Footer 
        setCurrentView={setCurrentView} 
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* MODAL 1: EBOOK DETAIL MODAL */}
      {selectedEbook && (
        <Suspense fallback={null}>
          <EbookDetailModal
            ebook={selectedEbook}
            onClose={() => setSelectedEbook(null)}
            onBuyNow={handleBuyNow}
            onOpenPreview={handleOpenPdfReader}
            onOpenAuthModal={() => {
              setIsAuthOpen(true);
              setAuthInitialMode('user-login');
            }}
            ratingSummary={selectedEbook ? ratingSummaries[selectedEbook.id] : undefined}
          />
        </Suspense>
      )}

      {/* MODAL 2: CART MODAL */}
      {isCartOpen && (
        <Suspense fallback={null}>
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setDirectCheckoutItem(null);
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* MODAL 3: AUTH MODAL */}
      {isAuthOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authInitialMode}
            onLoginSuccess={(role) => {
              setIsAuthOpen(false);
              if (role === 'admin') {
                setIsAdminOpen(true);
              } else if (role === 'seller') {
                setCurrentView('seller-dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setCurrentView('user-dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </Suspense>
      )}

      {/* MODAL 4: ADMIN PANEL */}
      {isAdminOpen && (
        <Suspense fallback={<ViewLoadingFallback />}>
          <AdminPanel
            onClose={() => {
              setIsAdminOpen(false);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setIsAdminOpen(false);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenReader={handleOpenPdfReader}
            onOpenBlogManager={() => setIsAdminBlogManagerOpen(true)}
            ratingSummaries={ratingSummaries}
            blogPosts={blogPosts}
          />
        </Suspense>
      )}

      {/* MODAL: ADMIN BLOG MANAGER & DEMO CLEANUP */}
      {isAdminBlogManagerOpen && (
        <Suspense fallback={null}>
          <AdminBlogManagerModal
            isOpen={isAdminBlogManagerOpen}
            onClose={() => setIsAdminBlogManagerOpen(false)}
            posts={blogPosts}
            allEbooks={ebooks}
            onRefresh={() => {
              const localPosts = getLocalStoredBlogs();
              const domPosts = extractBloggerPostsFromDOM();
              const map = new Map<string, BlogPost>();
              domPosts.forEach(p => map.set(p.id, p));
              localPosts.forEach(p => map.set(p.id, p));
              setBlogPosts(Array.from(map.values()));
            }}
            hideDemoBlogs={hideDemoBlogs}
          />
        </Suspense>
      )}

      {/* MODAL 5: IN-APP PDF READER */}
      {readingPdf && (
        <Suspense fallback={null}>
          <PdfReaderModal
            url={readingPdf.url}
            title={readingPdf.title}
            onClose={() => setReadingPdf(null)}
          />
        </Suspense>
      )}

      {/* MODAL 6: BLOG FULL ARTICLE READER (Quick modal fallback if viewed outside dedicated blog page) */}
      {selectedBlogPost && currentView !== 'blog' && (
        <Suspense fallback={null}>
          <BlogModal
            post={selectedBlogPost}
            onClose={() => setSelectedBlogPost(null)}
            onExploreEbooks={() => {
              setSelectedBlogPost(null);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* MODAL 7: TERMS & CONDITIONS */}
      {(isTermsOpen || currentView === 'terms') && (
        <Suspense fallback={null}>
          <TermsConditionsModal
            isOpen={isTermsOpen || currentView === 'terms'}
            onClose={() => {
              setIsTermsOpen(false);
              if (currentView === 'terms') setCurrentView('home');
            }}
          />
        </Suspense>
      )}

      {/* MODAL 8: PRIVACY POLICY */}
      {(isPrivacyOpen || currentView === 'privacy') && (
        <Suspense fallback={null}>
          <PrivacyPolicyModal
            isOpen={isPrivacyOpen || currentView === 'privacy'}
            onClose={() => {
              setIsPrivacyOpen(false);
              if (currentView === 'privacy') setCurrentView('home');
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
