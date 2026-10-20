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
  Eye
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EbookCard } from './components/EbookCard';
import { EbookSalesHero } from './components/EbookSalesHero';
import { EbookShareModal } from './components/EbookShareModal';
import { RealWebsiteStats } from './components/RealWebsiteStats';
import { HomeMarquee } from './components/HomeMarquee';
import { HomePrimaryNavCards } from './components/HomePrimaryNavCards';
import { EbooksCatalogView } from './components/EbooksCatalogView';
import { recordAppDownloadClick, formatAndValidateDownloadUrl } from './services/appDownloadService';

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
  getDeletedBlogIds,
  subscribeToAllBlogViews,
  getLocalBlogViews,
  syncLocalBlogsToFirebase,
  normalizeBlogPostRecord
} from './services/blogService';
import { Ebook, BlogPost, AppDownloadSettings, DEFAULT_APP_DOWNLOAD_SETTINGS, EbookRatingSummary, MarqueeSettings, DEFAULT_MARQUEE_SETTINGS } from './types';
import { INITIAL_EBOOKS } from './data/initialEbooks';
import { BLOG_POSTS } from './data/blogPosts';
import { db, ref, onValue, set, update } from './firebase';
import { subscribeToAllRatingSummaries, getLocalRatingSummaries } from './services/ratingService';
import { getOptimizedImageUrl } from './utils/imageOptimizer';
import { formatBlogViewCount, getEffectiveBlogViews } from './utils/blogFormatter';

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
  
  // Selected eBook for Share modal
  const [ebookToShare, setEbookToShare] = useState<Ebook | null>(null);
  
  // Direct item for Checkout
  const [directCheckoutItem, setDirectCheckoutItem] = useState<Ebook | null>(null);

  // PDF In-App Reader State
  const [readingPdf, setReadingPdf] = useState<{ url: string; title: string } | null>(null);

  // Dynamic Blog Posts (Blogger DOM Bridge + Local Storage Cache + Firebase RTDB + Demo fallback)
  const [hideDemoBlogs, setHideDemoBlogs] = useState<boolean>(() => getLocalHideDemoBlogs());
  const [isAdminBlogManagerOpen, setIsAdminBlogManagerOpen] = useState<boolean>(false);
  const [isBlogsLoading, setIsBlogsLoading] = useState<boolean>(true);
  const [blogsError, setBlogsError] = useState<string | null>(null);

  // Real-time Blog Views synchronized across all devices and browsers
  const [blogViews, setBlogViews] = useState<Record<string, number>>(() => getLocalBlogViews());

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const initialReal = getInitialBlogPosts();
    // Only return real published blog posts from database/cache/DOM, never demo fallback
    return initialReal.filter(p => !p.isDemo);
  });

  // Subscribe to real-time blog views
  useEffect(() => {
    const unsub = subscribeToAllBlogViews((map) => {
      setBlogViews(map);
    });
    return () => unsub();
  }, []);

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

  // Home Page Marquee Settings from Realtime Database & Local Cache
  const [marqueeSettings, setMarqueeSettings] = useState<MarqueeSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ebookbazar_marquee_settings');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return DEFAULT_MARQUEE_SETTINGS;
  });

  // Friendly in-app feedback toast for App Download
  const [appDownloadMessage, setAppDownloadMessage] = useState<string | null>(null);

  // Defer non-critical floating widgets (LiveChat, QuickSearch) slightly so initial FCP/LCP have 100% network bandwidth
  const [deferredWidgetsReady, setDeferredWidgetsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredWidgetsReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // Realtime synchronization for Marquee Announcement Settings
  useEffect(() => {
    const handleMarqueeSnap = (snap: any) => {
      if (snap.exists()) {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const merged: MarqueeSettings = {
            enabled: val.enabled !== false,
            text: val.text || DEFAULT_MARQUEE_SETTINGS.text,
            bgColor: val.bgColor || DEFAULT_MARQUEE_SETTINGS.bgColor,
            textColor: val.textColor || DEFAULT_MARQUEE_SETTINGS.textColor,
            speed: val.speed || DEFAULT_MARQUEE_SETTINGS.speed,
            updatedAt: val.updatedAt || Date.now()
          };
          setMarqueeSettings(merged);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ebookbazar_marquee_settings', JSON.stringify(merged));
            } catch {}
          }
        }
      }
    };

    const unsubMarquee0 = onValue(ref(db, 'ebooks/_marquee'), handleMarqueeSnap, () => {});
    const unsubMarquee1 = onValue(ref(db, 'settings/marquee'), handleMarqueeSnap, () => {});

    return () => {
      unsubMarquee0();
      unsubMarquee1();
    };
  }, []);
  
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

    let blogsReceived = false;
    let blogsErr = false;
    let mirrorErr = false;

    // Safety timeout: ensure loading state does not spin indefinitely
    const loadTimeout = setTimeout(() => {
      setIsBlogsLoading(false);
    }, 3000);

    // Common snapshot processor for Firebase blog nodes
    const handleFirebaseBlogsSnapshot = (snap: any) => {
      clearTimeout(loadTimeout);
      setIsBlogsLoading(false);
      setBlogsError(null);
      blogsReceived = true;
      if (!snap.exists()) return;
      const val = snap.val();
      if (!val || typeof val !== 'object') return;

      const deletedSet = new Set(getDeletedBlogIds());
      const fbPosts: BlogPost[] = Object.keys(val)
        .filter(key => !deletedSet.has(key))
        .map(key => normalizeBlogPostRecord(val[key], key))
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
      blogsErr = true;
      if (mirrorErr && !blogsReceived) {
        setIsBlogsLoading(false);
        setBlogsError('Firebase থেকে ব্লগ পোস্ট লোড করা যাচ্ছে না। পারমিশন বা নেটওয়ার্ক সমস্যা হতে পারে।');
      }
    });

    // 4. Dual-Layer Public Mirror /ebooks/_blogs listener (Publicly accessible in RTDB for all visitors & post-logout)
    const mirrorBlogsRef = ref(db, 'ebooks/_blogs');
    const unsubMirrorBlogs = onValue(mirrorBlogsRef, handleFirebaseBlogsSnapshot, (err) => {
      console.warn('Firebase RTDB /ebooks/_blogs mirror notice:', err?.message);
      mirrorErr = true;
      if (blogsErr && !blogsReceived) {
        setIsBlogsLoading(false);
        setBlogsError('Firebase থেকে ব্লগ পোস্ট লোড করা যাচ্ছে না। পারমিশন বা নেটওয়ার্ক সমস্যা হতে পারে।');
      }
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
      clearTimeout(loadTimeout);
      unsubBlogs();
      unsubMirrorBlogs();
      unsubHideDemo();
      unsubMirrorHideDemo();
    };
  }, []);

  // When admin is authenticated, automatically sync any local posts to Firebase nodes
  useEffect(() => {
    if (isAdmin) {
      syncLocalBlogsToFirebase().catch(() => {});
    }
  }, [isAdmin]);

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
      } else if (pathname === '/ebooks' || pathname.startsWith('/ebooks/')) {
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView('ebooks');
      } else if (pathname === '/affiliate' || pathname.startsWith('/affiliate/')) {
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView('affiliate');
      } else if (pathname === '/membership' || pathname.startsWith('/membership/')) {
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView('membership');
      } else if (pathname === '/tools' || pathname.startsWith('/tools/')) {
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView('tools');
        const sub = pathname.replace('/tools', '').replace(/^\//, '').replace(/\/$/, '').trim();
        if (sub) {
          setSelectedToolId(sub as ToolId);
        } else {
          setSelectedToolId(null);
        }
      } else if (pathname === '/' || pathname === '/home' || pathname === '') {
        setSelectedBlogPost(null);
        setBlogNotFoundSlug(null);
        setCurrentView('home');
      } else if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        setIsAdminOpen(true);
      } else if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
        setCurrentView('checkout');
      } else if (pathname === '/dashboard' || pathname === '/user-dashboard') {
        setCurrentView('user-dashboard');
      } else if (pathname === '/seller' || pathname === '/seller-dashboard') {
        setCurrentView('seller-dashboard');
      } else if (pathname === '/library') {
        setCurrentView('library');
      }

      // 4. Synchronize direct eBook Details URL (?ebook=id, ?book=id, or /ebook/id)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ebookParam = urlParams.get('ebook') || urlParams.get('book');
        let targetEbookId = ebookParam ? ebookParam.trim() : null;
        if (!targetEbookId && pathname.startsWith('/ebook/')) {
          targetEbookId = pathname.replace('/ebook/', '').replace(/\/$/, '').trim();
        }

        if (targetEbookId) {
          const matched = (ebooks && ebooks.length > 0 ? ebooks : INITIAL_EBOOKS).find(b => b.id === targetEbookId);
          if (matched) {
            setSelectedEbook(matched);
            setCurrentView('home');
          }
        }
      } catch {
        // Safe parameter parsing fallback
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [blogPosts, ebooks, currentUser, userProfile]);

  const handleSelectEbook = (book: Ebook | null) => {
    setSelectedEbook(book);
    if (typeof window !== 'undefined') {
      const basePath = getAppBaseUrl();
      if (book) {
        const targetUrl = `${basePath}/?ebook=${encodeURIComponent(book.id)}`;
        if (window.location.search !== `?ebook=${encodeURIComponent(book.id)}`) {
          window.history.pushState({ ebookId: book.id }, '', targetUrl);
        }
      } else {
        const search = window.location.search;
        if (search.includes('ebook=') || search.includes('book=') || window.location.pathname.includes('/ebook/')) {
          const homeUrl = basePath + '/' || '/';
          window.history.pushState({}, '', homeUrl);
        }
      }
    }
  };

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
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('ebookbazar_pending_ref', refCode.trim().toUpperCase());
      }
    } catch {
      // Private mode or storage unavailable
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

  // When User or Seller logs out, automatically show Home page.
  // When Admin logs out from AdminPanel, keep Admin Login form visible as required.
  const prevUserRef = React.useRef(currentUser);
  useEffect(() => {
    if (prevUserRef.current && !currentUser) {
      if (isAdminOpen) {
        // Explicitly keep the Admin Login form visible without closing or redirecting to home
      } else {
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    prevUserRef.current = currentUser;
  }, [currentUser, isAdminOpen]);

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
      <main className="flex-1 w-full container mx-auto px-3 sm:px-4 max-w-7xl pt-3 sm:pt-4 space-y-4 sm:space-y-6">
        {/* VIEW 1: HOME MARKETPLACE */}
        {currentView === 'home' && (
          <div className="space-y-3 sm:space-y-4 pb-2 sm:pb-3">
            {/* 1. Promotional Sales Hero Banner (Immediately below Header) */}
            <EbookSalesHero
              onExploreEbooks={() => {
                setCurrentView('ebooks');
                if (typeof window !== 'undefined') {
                  const ebooksUrl = `${getAppBaseUrl()}/ebooks`;
                  if (window.location.pathname !== ebooksUrl) {
                    window.history.pushState({}, '', ebooksUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSellEbook={() => {
                if (userProfile?.role === 'seller') {
                  setCurrentView('seller-dashboard');
                } else {
                  setAuthInitialMode('seller-register');
                  setIsAuthOpen(true);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewAffiliate={() => {
                setCurrentView('affiliate');
                if (typeof window !== 'undefined') {
                  const affiliateUrl = `${getAppBaseUrl()}/affiliate`;
                  if (window.location.pathname !== affiliateUrl) {
                    window.history.pushState({}, '', affiliateUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 2. Scrolling Announcement Marquee (Immediately below Hero Banner) */}
            <HomeMarquee
              settings={marqueeSettings}
              isAdmin={currentUser?.email === 'suma47083@gmail.com' || userProfile?.role === 'admin' || currentUser?.email === 'admin@ebookbazar.com' || currentUser?.email === 'redx0187@gmail.com'}
              onOpenAdminSettings={() => setIsAdminOpen(true)}
            />

            {/* 3. Six Main Navigation Cards */}
            <HomePrimaryNavCards
              onOpenEbooks={() => {
                setCurrentView('ebooks');
                if (typeof window !== 'undefined') {
                  const ebooksUrl = `${getAppBaseUrl()}/ebooks`;
                  if (window.location.pathname !== ebooksUrl) {
                    window.history.pushState({}, '', ebooksUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAffiliate={() => {
                setCurrentView('affiliate');
                if (typeof window !== 'undefined') {
                  const affiliateUrl = `${getAppBaseUrl()}/affiliate`;
                  if (window.location.pathname !== affiliateUrl) {
                    window.history.pushState({}, '', affiliateUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenMembership={() => {
                setCurrentView('membership');
                if (typeof window !== 'undefined') {
                  const membershipUrl = `${getAppBaseUrl()}/membership`;
                  if (window.location.pathname !== membershipUrl) {
                    window.history.pushState({}, '', membershipUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenBlog={() => {
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
              onOpenTools={() => {
                setSelectedToolId(null);
                setCurrentView('tools');
                if (typeof window !== 'undefined') {
                  const toolsUrl = `${getAppBaseUrl()}/tools`;
                  if (window.location.pathname !== toolsUrl) {
                    window.history.pushState({}, '', toolsUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAppDownload={() => {
                const rawUrl = (appDownloadSettings.downloadUrl || appDownloadSettings.url || appDownloadSettings.appDownloadUrl || '').trim();
                const validation = formatAndValidateDownloadUrl(rawUrl);
                const targetUrl = validation.isValid && validation.formattedUrl ? validation.formattedUrl : rawUrl;
                const isEnabled = appDownloadSettings.active !== false && appDownloadSettings.appDownloadEnabled !== false && Boolean(targetUrl);
                if (targetUrl && isEnabled) {
                  recordAppDownloadClick().catch(() => {});
                  window.open(targetUrl, '_blank', 'noopener,noreferrer');
                } else {
                  setAppDownloadMessage('এডমিন প্যানেলে এখনও App Download লিঙ্ক কনফিগার করা হয়নি অথবা নিষ্ক্রিয় আছে। খুব শীঘ্রই লিঙ্কটি সক্রিয় করা হবে।');
                }
              }}
              appDownloadSettings={appDownloadSettings}
            />
          </div>
        )}

        {/* VIEW 1b: DEDICATED EBOOKS LISTING PAGE */}
        {currentView === 'ebooks' && (
          <EbooksCatalogView
            ebooks={ebooks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={CATEGORIES}
            onViewDetails={handleSelectEbook}
            onBuyNow={handleBuyNow}
            onShare={(b) => setEbookToShare(b)}
            ratingSummaries={ratingSummaries}
            onNavigateHome={() => {
              setCurrentView('home');
              if (typeof window !== 'undefined') {
                const homeUrl = `${getAppBaseUrl()}/`;
                if (window.location.pathname !== homeUrl) {
                  window.history.pushState({}, '', homeUrl);
                }
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
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
                handleSelectEbook(b);
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
              blogViews={blogViews}
              isLoading={isBlogsLoading}
              error={blogsError}
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
              onNavigateHome={() => {
                setCurrentView('home');
                if (typeof window !== 'undefined') {
                  const homeUrl = `${getAppBaseUrl()}/`;
                  if (window.location.pathname !== homeUrl) {
                    window.history.pushState({}, '', homeUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
                if (typeof window !== 'undefined') {
                  const homeUrl = `${getAppBaseUrl()}/`;
                  if (window.location.pathname !== homeUrl) {
                    window.history.pushState({}, '', homeUrl);
                  }
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenBlog={handleOpenBlog}
              onViewEbook={(b) => handleSelectEbook(b)}
              onAddToCart={handleAddToCart}
              allBlogPosts={blogPosts}
              allEbooks={ebooks}
            />
          </Suspense>
        )}
      </main>

      {/* Floating Quick Search (Search across real eBooks & Blogs) - deferred to prioritize initial mobile paint */}
      {deferredWidgetsReady && (
        <Suspense fallback={null}>
          <FloatingSearch
            ebooks={ebooks}
            blogPosts={displayedBlogPosts}
            onSelectEbook={(b) => handleSelectEbook(b)}
            onSelectBlogPost={(p) => {
              handleOpenBlog(p);
            }}
          />
        </Suspense>
      )}

      {/* Floating Live Chat & Customer Support Widget ("Can I help you?") - deferred to prioritize initial mobile paint */}
      {deferredWidgetsReady && (
        <Suspense fallback={null}>
          <LiveChatWidget sellerOnlineCount={totalSellersCount} />
        </Suspense>
      )}

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
            onClose={() => handleSelectEbook(null)}
            onBuyNow={handleBuyNow}
            onOpenPreview={handleOpenPdfReader}
            onShare={(b) => setEbookToShare(b)}
            onOpenAuthModal={() => {
              setIsAuthOpen(true);
              setAuthInitialMode('user-login');
            }}
            ratingSummary={selectedEbook ? ratingSummaries[selectedEbook.id] : undefined}
          />
        </Suspense>
      )}

      {/* MODAL: UNIVERSAL EBOOK SHARE MODAL */}
      {ebookToShare && (
        <EbookShareModal
          ebook={ebookToShare}
          isOpen={Boolean(ebookToShare)}
          onClose={() => setEbookToShare(null)}
        />
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
            blogViews={blogViews}
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
            blogViews={blogViews}
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

      {/* In-App Feedback Toast for App Download */}
      {appDownloadMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn max-w-sm text-center">
          <span>{appDownloadMessage}</span>
          <button
            onClick={() => setAppDownloadMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 text-sm cursor-pointer p-1"
            aria-label="বার্তা বন্ধ করুন"
          >
            ✕
          </button>
        </div>
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
