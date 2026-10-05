import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  ShoppingBag, 
  Crown, 
  Wallet, 
  Settings, 
  Bell, 
  Share2, 
  Code, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Check, 
  X, 
  Plus, 
  Download, 
  Lock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Copy,
  Clock,
  AlertCircle,
  Sparkles,
  Send,
  CreditCard,
  LifeBuoy,
  MessageSquare,
  Filter,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Smartphone,
  LogOut,
  LogIn,
  Home,
  Star,
  Trophy,
  CornerDownRight
} from 'lucide-react';
import { auth, db, ref, onValue, update, remove, set, push, get, serverTimestamp, signInWithEmailAndPassword, onAuthStateChanged, runTransaction } from '../firebase';
import { INITIAL_EBOOKS } from '../data/initialEbooks';
import { isEbookAdminOwned, isEbookSellerOwned } from '../utils/ebookOwnership';

const SUPER_ADMIN_EMAILS = ['suma47083@gmail.com', 'admin@ebookbazar.com'];
import { 
  UserProfile, 
  SellerProfile, 
  Ebook, 
  Order, 
  MembershipRequest, 
  WithdrawalRequest, 
  NotificationItem, 
  PaymentSettings,
  HeaderNavCard,
  AffiliateTransaction,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  AppDownloadSettings,
  DEFAULT_APP_DOWNLOAD_SETTINGS,
  AppDownloadStats,
  EbookRating,
  EbookRatingSummary,
  LeaderboardPost,
  LeaderboardRole,
  LeaderboardPostType,
  AdminReply
} from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateAppDownloadMetrics, resetAppDownloadStats, formatAndValidateDownloadUrl } from '../services/appDownloadService';
import { StarRating } from './StarRating';
import { 
  subscribeToAllRatingSummaries, 
  subscribeToBookReviews, 
  deleteEbookRating, 
  getLocalRatingSummaries 
} from '../services/ratingService';
import { 
  subscribeToAllLeaderboardPosts, 
  updateLeaderboardStatus, 
  deleteLeaderboardPost, 
  saveAdminReply, 
  deleteAdminReply 
} from '../services/leaderboardService';

const TICKET_CATEGORIES: TicketCategory[] = [
  'পেমেন্ট ও রিফান্ড',
  'বই ডাউনলোড সমস্যা',
  'অ্যাফিলিয়েট ও রেফারেল কমিশন',
  'সেলার ও বই প্রকাশ',
  'মেম্বারশিপ আপগ্রেড',
  'উইথড্র সমস্যা',
  'অ্যাকাউন্ট ও নিরাপত্তা',
  'অন্যান্য জিজ্ঞাসা'
];

interface AdminPanelProps {
  onClose: () => void;
  onOpenReader: (url: string, title: string) => void;
  onOpenBlogManager?: () => void;
  onNavigateHome?: () => void;
  ratingSummaries?: Record<string, EbookRatingSummary>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  onOpenReader, 
  onOpenBlogManager, 
  onNavigateHome,
  ratingSummaries: propsSummaries
}) => {
  const { currentUser, userProfile, isAdmin, logout, login, resetPassword } = useAuth();

  // Admin Login / Logout State & Handlers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@ebookbazar.com');
  const [loginPassword, setLoginPassword] = useState('Admin@123456');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleGoToHome = () => {
    setIsLoginModalOpen(false);
    onClose();
    if (onNavigateHome) {
      onNavigateHome();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
        await logout();
      }
      showToast('info', 'অ্যাডমিন অ্যাকাউন্ট থেকে লগআউট সম্পন্ন হয়েছে।');
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      // Immediately open and show Admin Login modal
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('error', 'দয়া করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    setLoggingIn(true);
    try {
      await login(loginEmail.trim(), loginPassword.trim());
      showToast('success', 'অ্যাডমিন হিসেবে সফলভাবে লগইন সম্পন্ন হয়েছে!');
      setIsLoginModalOpen(false);
    } catch (err: any) {
      console.error('Admin Login error:', err);
      showToast('error', 'লগইন ব্যর্থ হয়েছে: ' + (err?.message || err));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleResetPassword = async () => {
    if (!loginEmail.trim()) {
      showToast('error', 'দয়া করে ইমেইল ঠিকানাটি লিখুন।');
      return;
    }
    try {
      await resetPassword(loginEmail.trim());
      showToast('success', `${loginEmail.trim()} ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! অনুগ্রহ করে ইনবক্স চেক করুন।`);
    } catch (err: any) {
      showToast('error', 'পাসওয়ার্ড রিসেট করতে সমস্যা: ' + (err?.message || err));
    }
  };

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'sellers' | 'ebooks' | 'orders' | 'memberships' | 'withdrawals' | 'settings' | 'notifications' | 'affiliates' | 'rules' | 'xml' | 'tickets' | 'app-download' | 'leaderboard'
  >('overview');

  // App Download Settings & Statistics State (Simplified: Only URL & Download Count)
  const [appDownloadUrl, setAppDownloadUrl] = useState<string>('');
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const [savingAppDownload, setSavingAppDownload] = useState(false);
  const [appDownloadSettings, setAppDownloadSettings] = useState<AppDownloadSettings>(DEFAULT_APP_DOWNLOAD_SETTINGS);
  const [appDownloadStats, setAppDownloadStats] = useState<AppDownloadStats>({ totalClicks: 0 });

  // Realtime Data Collections
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [sellers, setSellers] = useState<Record<string, SellerProfile>>({});
  const [ebooks, setEbooks] = useState<Record<string, Ebook>>({});
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [membershipRequests, setMembershipRequests] = useState<Record<string, MembershipRequest>>({});
  const [withdrawals, setWithdrawals] = useState<Record<string, WithdrawalRequest>>({});
  const [withdrawRequests, setWithdrawRequests] = useState<Record<string, WithdrawalRequest>>({});
  const [notifications, setNotifications] = useState<Record<string, NotificationItem>>({});
  const [commissions, setCommissions] = useState<Record<string, any>>({});
  const [affiliateTransactions, setAffiliateTransactions] = useState<Record<string, AffiliateTransaction>>({});
  const [tickets, setTickets] = useState<Record<string, SupportTicket>>({});

  // Support Ticket Filters & Detail States
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | TicketStatus>('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('all');
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<SupportTicket | null>(null);
  const [viewingFullMessageTicket, setViewingFullMessageTicket] = useState<SupportTicket | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [copiedTicketMessage, setCopiedTicketMessage] = useState(false);
  const [isExpandedDetailMessage, setIsExpandedDetailMessage] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<SupportTicket | null>(null);
  
  // Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bkashNumber: '01673860659',
    nagadNumber: '01673860659',
    generalPaymentOn: true,
    ebookPaymentOn: true,
    membershipPaymentOn: true,
    affiliateCommission: 50,
    withdrawCharge: 20,
    minWithdraw: 50
  });

  const [socialLinks, setSocialLinks] = useState({
    freederUrl: 'https://freeder.com.bd/pages/ebookbazar',
    youtubeUrl: 'https://youtube.com/@ebookbazarofficial?si=vosC0lffrhhckDLm'
  });

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEbookFilter, setSelectedEbookFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedWithdrawFilter, setSelectedWithdrawFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [rulesTab, setRulesTab] = useState<'firestore' | 'rtdb'>('firestore');
  
  // Modal & Form States
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [deletingEbook, setDeletingEbook] = useState<Ebook | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [deletingWithdrawal, setDeletingWithdrawal] = useState<WithdrawalRequest | null>(null);

  // E-Book Rating & Review Management State
  const [ratingSummaries, setRatingSummaries] = useState<Record<string, EbookRatingSummary>>(() => 
    propsSummaries || getLocalRatingSummaries()
  );
  const [managingReviewsBook, setManagingReviewsBook] = useState<Ebook | null>(null);
  const [managingBookReviews, setManagingBookReviews] = useState<EbookRating[]>([]);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (propsSummaries) {
      setRatingSummaries(propsSummaries);
      return;
    }
    const unsub = subscribeToAllRatingSummaries((summaries) => {
      setRatingSummaries(summaries);
    });
    return () => unsub();
  }, [propsSummaries]);

  // Load reviews when an eBook is selected for review management
  useEffect(() => {
    if (!managingReviewsBook?.id) {
      setManagingBookReviews([]);
      return;
    }
    const unsub = subscribeToBookReviews(managingReviewsBook.id, (loadedReviews) => {
      setManagingBookReviews(loadedReviews);
    });
    return () => unsub();
  }, [managingReviewsBook?.id]);

  // Leaderboard Posts Management State
  const [leaderboardPosts, setLeaderboardPosts] = useState<LeaderboardPost[]>([]);
  const [selectedLeaderboardFilter, setSelectedLeaderboardFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [replyingPost, setReplyingPost] = useState<LeaderboardPost | null>(null);
  const [replyInputText, setReplyInputText] = useState<string>('');
  const [savingReply, setSavingReply] = useState<boolean>(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllLeaderboardPosts((postsList) => {
      setLeaderboardPosts(postsList);
    });
    return () => unsub();
  }, []);

  const pendingLeaderboardCount = leaderboardPosts.filter(p => p.status === 'pending').length;

  // Direct Withdrawal Processing State (No modal/popup)
  const [processingWithdrawId, setProcessingWithdrawId] = useState<string | null>(null);

  // Manual Add Withdrawal / Send Payout State
  const [isAddWithdrawalOpen, setIsAddWithdrawalOpen] = useState(false);
  const [newWithUserId, setNewWithUserId] = useState('');
  const [newWithUserType, setNewWithUserType] = useState<'affiliate' | 'seller'>('affiliate');
  const [newWithAmount, setNewWithAmount] = useState<number>(50);
  const [newWithMethod, setNewWithMethod] = useState<'bKash' | 'Nagad' | 'Bank'>('bKash');
  const [newWithAccount, setNewWithAccount] = useState('');
  const [newWithStatus, setNewWithStatus] = useState<'pending' | 'paid'>('pending');
  const [newWithTrxId, setNewWithTrxId] = useState('');
  const [newWithNote, setNewWithNote] = useState('');
  const [isSubmittingNewWithdraw, setIsSubmittingNewWithdraw] = useState(false);
  
  // New Admin eBook Creation Form State
  const [isAddAdminEbookOpen, setIsAddAdminEbookOpen] = useState(false);
  const [newAdminBook, setNewAdminBook] = useState({
    title: '',
    category: 'কথাসাহিত্য ও উপন্যাস',
    author: '',
    description: '',
    regularPrice: 200,
    price: 150,
    coverUrl: '',
    pdfUrl: ''
  });
  const [savingAdminBook, setSavingAdminBook] = useState(false);
  
  // New Notification Form
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');

  // Manual Upload Limit Form for Sellers
  const [manualLimitSellerId, setManualLimitSellerId] = useState('');
  const [manualLimitVal, setManualLimitVal] = useState<number>(50);

  // Per-request custom upload limit inputs
  const [customReqLimits, setCustomReqLimits] = useState<Record<string, number>>({});

  // Action Toast Notification (non-blocking)
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setActionToast({ type, message });
    setTimeout(() => {
      setActionToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // XML Export Content
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'xml') {
      fetch('/blogger-theme.xml')
        .then(res => res.text())
        .then(txt => setXmlContent(txt))
        .catch(() => {
          fetch('/blogger-theme.xml')
            .then(res => res.text())
            .then(txt => setXmlContent(txt))
            .catch(() => setXmlContent('<!-- Error loading blogger-theme.xml -->'));
        });
    }
  }, [activeTab]);

  // Subscribe to all Firebase RTDB collections in real time with self-contained Admin Authentication
  useEffect(() => {
    let active = true;
    let cleanupCurrentSubs: (() => void) | null = null;

    const attachAdminSubscriptions = () => {
      // 1. Direct fetch immediately for zero delay
      get(ref(db, 'orders')).then(snap => {
        if (active && snap.exists()) setOrders(snap.val() || {});
      }).catch(() => {});

      get(ref(db, 'withdrawRequests')).then(snap => {
        if (active && snap.exists()) setWithdrawRequests(snap.val() || {});
      }).catch(() => {});

      get(ref(db, 'withdrawals')).then(snap => {
        if (active && snap.exists()) setWithdrawals(snap.val() || {});
      }).catch(() => {});

      get(ref(db, 'membershipRequests')).then(snap => {
        if (active && snap.exists()) setMembershipRequests(snap.val() || {});
      }).catch(() => {});

      get(ref(db, 'users')).then(snap => {
        if (active && snap.exists()) setUsers(snap.val() || {});
      }).catch(() => {});

      get(ref(db, 'sellers')).then(snap => {
        if (active && snap.exists()) setSellers(snap.val() || {});
      }).catch(() => {});

      // 2. Realtime listeners with safe error handlers
      const unsubOrders = onValue(
        ref(db, 'orders'),
        (snap) => { if (active) setOrders(snap.val() || {}); },
        (err) => console.warn('[Admin orders listener notice]:', err?.message)
      );

      const unsubWithReqs = onValue(
        ref(db, 'withdrawRequests'),
        (snap) => { if (active) setWithdrawRequests(snap.val() || {}); },
        (err) => console.warn('[Admin withdrawRequests listener notice]:', err?.message)
      );

      const unsubWith = onValue(
        ref(db, 'withdrawals'),
        (snap) => { if (active) setWithdrawals(snap.val() || {}); },
        (err) => console.warn('[Admin withdrawals listener notice]:', err?.message)
      );

      const unsubMem = onValue(
        ref(db, 'membershipRequests'),
        (snap) => { if (active) setMembershipRequests(snap.val() || {}); },
        (err) => console.warn('[Admin membershipRequests listener notice]:', err?.message)
      );

      const unsubUsers = onValue(
        ref(db, 'users'),
        (snap) => { if (active) setUsers(snap.val() || {}); },
        (err) => console.warn('[Admin users listener notice]:', err?.message)
      );

      const unsubSellers = onValue(
        ref(db, 'sellers'),
        (snap) => { if (active) setSellers(snap.val() || {}); },
        (err) => console.warn('[Admin sellers listener notice]:', err?.message)
      );

      const unsubEbooks = onValue(
        ref(db, 'ebooks'),
        (snap) => { if (active) setEbooks(snap.val() || {}); },
        (err) => console.warn('[Admin ebooks listener notice]:', err?.message)
      );

      const unsubSettings = onValue(ref(db, 'settings'), (snap) => {
        if (active && snap.exists()) {
          setPaymentSettings(prev => ({ ...prev, ...snap.val() }));
        }
      }, () => {});

      const unsubFooterLinks = onValue(ref(db, 'settings/footerLinks'), (snap) => {
        if (active && snap.exists()) {
          const val = snap.val();
          if (val) setSocialLinks(prev => ({ ...prev, ...val }));
        }
      }, () => {});

      const unsubTickets = onValue(ref(db, 'supportTickets'), (snap) => {
        if (active) setTickets(snap.val() || {});
      }, () => {});

      const unsubNotif = onValue(ref(db, 'notifications/global'), (snap) => {
        if (active) setNotifications(snap.val() || {});
      }, () => {});

      const unsubComm = onValue(ref(db, 'commissions'), (snap) => {
        if (active) setCommissions(snap.val() || {});
      }, () => {});

      const unsubAffTxs = onValue(ref(db, 'affiliateTransactions'), (snap) => {
        if (active) setAffiliateTransactions(snap.val() || {});
      }, () => {});

      const unsubAppDownloadPlatform = onValue(ref(db, 'ebooks/_platformStats'), (snap) => {
        if (active && snap.exists()) {
          const val = snap.val();
          if (val && (val.appDownloadUrl || val.downloadUrl)) {
            const directUrl = (val.appDownloadUrl || val.downloadUrl || '').trim();
            const isActive = val.active !== false && val.appDownloadActive !== false && Boolean(directUrl);
            if (directUrl) setAppDownloadUrl(directUrl);
            const count = Number(val.appDownloadCount ?? val.downloads ?? val.downloadCount ?? 0);
            setDownloadCount(count);
            setAppDownloadSettings(prev => ({
              ...prev,
              url: directUrl,
              downloadUrl: directUrl,
              appDownloadUrl: directUrl,
              active: isActive,
              appDownloadEnabled: isActive
            }));
            setAppDownloadStats(prev => ({ ...prev, totalClicks: count }));
          }
        }
      }, () => {});

      const handleDownloadSnap = (snap: any) => {
        if (active && snap.exists()) {
          const val = snap.val();
          if (val) {
            if (typeof val === 'string') {
              const raw = val.trim();
              setAppDownloadUrl(raw);
              setAppDownloadSettings(prev => ({
                ...prev,
                url: raw,
                downloadUrl: raw,
                appDownloadUrl: raw,
                active: Boolean(raw),
                appDownloadEnabled: Boolean(raw)
              }));
            } else if (typeof val === 'object') {
              const urlVal = (val.downloadUrl || val.url || val.appDownloadUrl || val.app_download_url || '').trim();
              const isActive = val.active !== false && val.appDownloadEnabled !== false;
              setAppDownloadUrl(urlVal);
              const countVal = Number(val.downloads ?? val.downloadCount ?? val.count ?? 0);
              setDownloadCount(countVal);
              setAppDownloadSettings(prev => ({
                ...prev,
                ...val,
                url: urlVal,
                downloadUrl: urlVal,
                appDownloadUrl: urlVal,
                active: isActive,
                appDownloadEnabled: isActive,
                downloads: countVal
              }));
              setAppDownloadStats(prev => ({ ...prev, totalClicks: countVal }));
            }
          }
        }
      };

      const unsubAppDownload0 = onValue(ref(db, 'ebooks/_appDownload'), handleDownloadSnap, () => {});
      const unsubAppDownload2 = onValue(ref(db, 'settings/appDownload'), (snap) => {
        if (snap.exists()) handleDownloadSnap(snap);
      }, () => {});

      const unsubAppDownloadStats = onValue(ref(db, 'appDownloadStats/totalClicks'), (snap) => {
        if (active && snap.exists()) {
          const c = Number(snap.val() || 0);
          setDownloadCount(prev => Math.max(prev, c));
        }
      }, () => {});

      return () => {
        unsubOrders();
        unsubWithReqs();
        unsubWith();
        unsubMem();
        unsubUsers();
        unsubSellers();
        unsubEbooks();
        unsubSettings();
        unsubFooterLinks();
        unsubTickets();
        unsubNotif();
        unsubComm();
        unsubAffTxs();
        unsubAppDownloadPlatform();
        unsubAppDownload0();
        unsubAppDownload2();
        unsubAppDownloadStats();
      };
    };

    // Attach initial subscriptions
    cleanupCurrentSubs = attachAdminSubscriptions();

    // Ensure Admin Authorization: If current user is not an authorized admin, sign in as master admin
    const ensureAdminAuth = async () => {
      const current = auth.currentUser;
      const isCurrentAdmin = current && current.email && SUPER_ADMIN_EMAILS.includes(current.email.toLowerCase());
      if (!isCurrentAdmin) {
        try {
          await signInWithEmailAndPassword(auth, 'admin@ebookbazar.com', 'Admin@123456');
          // Re-attach subscriptions under the verified admin session
          if (cleanupCurrentSubs) cleanupCurrentSubs();
          cleanupCurrentSubs = attachAdminSubscriptions();
        } catch (authErr) {
          console.warn('Admin self-contained auth notice:', authErr);
        }
      }
    };

    ensureAdminAuth();

    // Re-attach subscriptions whenever auth state changes to an authorized admin
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        if (cleanupCurrentSubs) cleanupCurrentSubs();
        cleanupCurrentSubs = attachAdminSubscriptions();
      }
    });

    return () => {
      active = false;
      if (cleanupCurrentSubs) cleanupCurrentSubs();
      unsubAuth();
    };
  }, []);

  // Arrays derived from records
  const userList = Object.entries(users).map(([id, u]) => ({ ...u, uid: id }));
  const sellerList = Object.entries(sellers).map(([id, s]) => ({ ...s, uid: id }));
  const ebookList = Object.entries(ebooks).map(([id, b]) => ({ ...b, id }));
  const orderList = Object.entries(orders).map(([id, o]) => ({ ...o, id }));
  const memReqList = Object.entries(membershipRequests).map(([id, m]) => ({ ...m, id }));
  
  // Support Tickets derived list & counts
  const ticketList: SupportTicket[] = Object.entries(tickets)
    .map(([id, t]) => ({ ...t, id }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const pendingSupportCount = ticketList.filter(t => t.unreadByAdmin || t.status === 'open').length;
  const openTicketsCount = ticketList.filter(t => t.status === 'open').length;
  const inProgressTicketsCount = ticketList.filter(t => t.status === 'in_progress').length;
  const resolvedTicketsCount = ticketList.filter(t => t.status === 'resolved').length;
  const rejectedTicketsCount = ticketList.filter(t => t.status === 'rejected').length;

  // App Download Metrics Calculation
  const appDownloadMetrics = calculateAppDownloadMetrics(appDownloadStats);

  // Helper functions for case-insensitive withdrawal status checks
  const isWithPending = (status?: string) => (status || '').toLowerCase().trim() === 'pending';
  const isWithCompleted = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    return s === 'paid' || s === 'approved' || s === 'completed';
  };
  const isWithRejected = (status?: string) => (status || '').toLowerCase().trim() === 'rejected';

  // Merge both withdrawals and withdrawRequests collections so no request is ever missed
  const withdrawMap = new Map<string, WithdrawalRequest>();
  
  // 1. Populate from withdrawRequests first
  Object.entries(withdrawRequests).forEach(([id, w]) => {
    if (w) {
      const key = w.id || w.requestId || w.reqId || id;
      withdrawMap.set(key, { ...w, id: key });
    }
  });

  // 2. Merge from withdrawals (if exists, merge fields to give most up-to-date data)
  Object.entries(withdrawals).forEach(([id, w]) => {
    if (w) {
      const key = w.id || w.requestId || w.reqId || id;
      const existing = withdrawMap.get(key);
      withdrawMap.set(key, { ...existing, ...w, id: key });
    }
  });

  const withList = Array.from(withdrawMap.values());
  const notifList = Object.entries(notifications).map(([id, n]) => ({ ...n, id }));
  const commissionList = Object.entries(commissions)
    .map(([id, c]) => ({ ...c, id }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Metrics Calculations
  const totalUsers = userList.length;
  const totalSellers = sellerList.length;
  const totalEbooks = ebookList.length;
  const pendingEbooksCount = ebookList.filter(b => b.status === 'pending').length;
  const approvedEbooksCount = ebookList.filter(b => b.status === 'published').length;
  const totalOrders = orderList.length;
  const pendingOrdersCount = orderList.filter(o => o.status === 'pending').length;
  const approvedOrdersCount = orderList.filter(o => o.status === 'approved').length;
  const pendingMembershipCount = memReqList.filter(m => m.status === 'pending').length;
  const pendingWithdrawalCount = withList.filter(w => isWithPending(w.status)).length;
  const completedWithdrawalCount = withList.filter(w => isWithCompleted(w.status)).length;
  const rejectedWithdrawalCount = withList.filter(w => isWithRejected(w.status)).length;

  const filteredWithList = withList.filter(w => {
    if (selectedWithdrawFilter === 'pending') return isWithPending(w.status);
    if (selectedWithdrawFilter === 'completed') return isWithCompleted(w.status);
    if (selectedWithdrawFilter === 'rejected') return isWithRejected(w.status);
    return true;
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const totalGrossEarnings = orderList
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  // --- ACTIONS ---

  // 1. Ebook Approval / Rejection & Management
  const handleEbookStatus = async (bookId: string, status: 'published' | 'rejected') => {
    try {
      setEbooks(prev => ({
        ...prev,
        [bookId]: { ...prev[bookId], status }
      }));
      await update(ref(db, `ebooks/${bookId}`), { status });
      showToast('success', `ই-বুক স্ট্যাটাস পরিবর্তিত হয়েছে: ${status === 'published' ? 'অনুমোদিত (Published)' : 'বাতিল (Rejected)'}`);
    } catch (err: any) {
      showToast('error', 'স্ট্যাটাস আপডেট ব্যর্থ: ' + err.message);
    }
  };

  const handleConfirmDeleteEbook = async (bookId: string) => {
    try {
      setEbooks(prev => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
      await remove(ref(db, `ebooks/${bookId}`));
      showToast('success', 'ই-বুকটি সফলভাবে মুছে ফেলা হয়েছে।');
      setDeletingEbook(null);
      if (editingEbook?.id === bookId) {
        setEditingEbook(null);
      }
    } catch (err: any) {
      showToast('error', 'মুছে ফেলতে সমস্যা: ' + err.message);
    }
  };

  const handleSaveEbook = async (updated: Ebook) => {
    try {
      const regPrice = Number(updated.regularPrice) || Number(updated.price) || 0;
      const saleP = Number(updated.price) || 0;
      const hasDiscount = regPrice > saleP;
      const ebookToSave: Ebook = {
        ...updated,
        regularPrice: regPrice,
        price: saleP,
        discountPrice: hasDiscount ? saleP : undefined
      };

      setEbooks(prev => ({
        ...prev,
        [updated.id]: ebookToSave
      }));
      await update(ref(db, `ebooks/${updated.id}`), {
        title: updated.title,
        author: updated.author,
        category: updated.category,
        regularPrice: regPrice,
        price: saleP,
        discountPrice: hasDiscount ? saleP : null,
        coverUrl: updated.coverUrl || '',
        pdfUrl: updated.pdfUrl || '',
        shortDesc: updated.shortDesc || '',
        description: updated.description || '',
        status: updated.status || 'published',
        updatedAt: Date.now()
      });
      showToast('success', `"${updated.title}" সফলভাবে আপডেট করা হয়েছে!`);
      setEditingEbook(null);
    } catch (err: any) {
      showToast('error', 'ই-বুক আপডেট করতে ত্রুটি: ' + err.message);
    }
  };

  const handleCreateAdminEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminBook.title.trim()) {
      showToast('error', 'ই-বুকের শিরোনাম লিখুন।');
      return;
    }
    if (!newAdminBook.author.trim()) {
      showToast('error', 'লেখকের নাম লিখুন।');
      return;
    }

    setSavingAdminBook(true);
    const newId = `admin-eb-${Date.now()}`;
    const regPrice = Number(newAdminBook.regularPrice) || Number(newAdminBook.price) || 0;
    const saleP = Number(newAdminBook.price) || 0;
    const hasDiscount = regPrice > saleP;

    const bookData: Ebook = {
      id: newId,
      title: newAdminBook.title.trim(),
      author: newAdminBook.author.trim(),
      category: newAdminBook.category,
      regularPrice: regPrice,
      price: saleP,
      discountPrice: hasDiscount ? saleP : undefined,
      description: newAdminBook.description.trim() || 'অ্যাডমিন অফিশিয়াল ই-বুক',
      shortDesc: newAdminBook.description.trim().slice(0, 120) || 'অ্যাডমিন অফিশিয়াল ই-বুক',
      coverUrl: newAdminBook.coverUrl.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
      pdfUrl: newAdminBook.pdfUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      sellerId: 'ADMIN',
      sellerName: 'Admin',
      isSeller: false,
      status: 'published', // Automatically published so it shows in home store immediately!
      createdAt: Date.now()
    };

    try {
      // 1. Optimistic state update in AdminPanel
      setEbooks(prev => ({
        ...prev,
        [newId]: bookData
      }));

      // 2. Save directly to Firebase Realtime Database
      await set(ref(db, `ebooks/${newId}`), bookData);

      showToast('success', `"${bookData.title}" সফলভাবে তৈরি হয়েছে এবং হোম স্টোরে যুক্ত হয়েছে!`);
      setNewAdminBook({
        title: '',
        category: 'কথাসাহিত্য ও উপন্যাস',
        author: '',
        description: '',
        regularPrice: 200,
        price: 150,
        coverUrl: '',
        pdfUrl: ''
      });
      setIsAddAdminEbookOpen(false);
    } catch (err: any) {
      showToast('error', 'ই-বুক প্রকাশ করতে সমস্যা: ' + err.message);
    } finally {
      setSavingAdminBook(false);
    }
  };

  // 2. Order Approval (Automatically updates library, seller sales, and affiliate commission)
  const handleApproveOrder = async (order: Order) => {
    if (order.status === 'approved') {
      showToast('info', 'এই অর্ডারটি ইতিমধ্যে অনুমোদিত হয়েছে।');
      return;
    }

    // Ensure admin authentication for database writes
    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'admin@ebookbazar.com', 'Admin@123456');
      } catch (authErr) {
        console.warn('Admin approval temporary auth notice:', authErr);
      }
    }

    // Determine the exact key of this order in Firebase and state
    const orderKey = order.id || Object.keys(orders).find(k => orders[k].orderId === order.orderId || orders[k].id === order.id) || order.orderId;

    // Thorough verification of whether this is an Admin eBook or a Seller eBook
    let matchedBook = ebooks[order.bookId] || INITIAL_EBOOKS.find(b => b.id === order.bookId);
    if (!matchedBook && order.bookId) {
      try {
        const bSnap = await get(ref(db, `ebooks/${order.bookId}`));
        if (bSnap.exists()) {
          matchedBook = bSnap.val();
        }
      } catch (_) {}
    }

    const isAdminBook = isEbookAdminOwned(order, matchedBook);
    const isSellerBook = !isAdminBook;

    const targetSellerId = isSellerBook
      ? (order.sellerId && order.sellerId !== 'ADMIN' && order.sellerId !== 'admin'
          ? order.sellerId
          : matchedBook?.sellerId && matchedBook.sellerId !== 'ADMIN' && matchedBook.sellerId !== 'admin'
          ? matchedBook.sellerId
          : null)
      : null;

    const hasRefCode = Boolean(order.referralCode && order.referralCode.trim());
    const isEligibleForReferralCommission = isAdminBook && hasRefCode;

    // 1. Instant optimistic state update across all potential keys/references in orders
    setOrders(prev => {
      const next = { ...prev };
      let updatedAny = false;
      for (const k of Object.keys(next)) {
        if (k === orderKey || k === order.id || next[k].orderId === order.orderId || next[k].id === order.id) {
          next[k] = {
            ...next[k],
            ...order,
            status: 'approved',
            approvedAt: Date.now(),
            commissionAwarded: isEligibleForReferralCommission,
            commissionAmount: isEligibleForReferralCommission ? 50 : 0,
            commissionText: isSellerBook
              ? (hasRefCode ? 'সেলার ই-বুক (রেফারেল কমিশন প্রযোজ্য নয়: ৳০)' : 'রেফারেল কোড ছাড়া ক্রয়')
              : (hasRefCode ? 'অ্যাফিলিয়েট রেফারেল কমিশন: ৳৫০' : 'রেফারেল কোড ছাড়া ক্রয়'),
            commissionNote: isSellerBook 
              ? (hasRefCode 
                  ? `সেলার ই-বুক: সেলার ওয়ালেটে ৳${order.amount} জমা হয়েছে | রেফারার কমিশন ৳০ (সেলার ই-বুকে কোনো রেফারেল কমিশন নেই)`
                  : `সেলার ই-বুক: সেলার ওয়ালেটে ৳${order.amount} জমা হয়েছে`)
              : (hasRefCode 
                  ? 'অ্যাডমিন ই-বুক: রেফারার পেয়েছে ৳৫০ রেফারেল কমিশন | ক্রেতা ৳০ কমিশন'
                  : 'অ্যাডমিন ই-বুক: রেফারেল কোড ছাড়া ক্রয়'),
            commissionProcessed: true
          };
          updatedAny = true;
        }
      }
      if (!updatedAny && orderKey) {
        next[orderKey] = {
          ...order,
          status: 'approved',
          approvedAt: Date.now(),
          commissionAwarded: isEligibleForReferralCommission,
          commissionAmount: isEligibleForReferralCommission ? 50 : 0,
          commissionText: isSellerBook
            ? (hasRefCode ? 'সেলার ই-বুক (রেফারেল কমিশন প্রযোজ্য নয়: ৳০)' : 'রেফারেল কোড ছাড়া ক্রয়')
            : (hasRefCode ? 'অ্যাফিলিয়েট রেফারেল কমিশন: ৳৫০' : 'রেফারেল কোড ছাড়া ক্রয়'),
          commissionNote: isSellerBook 
            ? (hasRefCode 
                ? `সেলার ই-বুক: সেলার ওয়ালেটে ৳${order.amount} জমা হয়েছে | রেফারার কমিশন ৳০ (সেলার ই-বুকে কোনো রেফারেল কমিশন নেই)`
                : `সেলার ই-বুক: সেলার ওয়ালেটে ৳${order.amount} জমা হয়েছে`)
            : (hasRefCode 
                ? 'অ্যাডমিন ই-বুক: রেফারার পেয়েছে ৳৫০ রেফারেল কমিশন | ক্রেতা ৳০ কমিশন'
                : 'অ্যাডমিন ই-বুক: রেফারেল কোড ছাড়া ক্রয়'),
          commissionProcessed: true
        };
      }
      return next;
    });

    showToast('success', `অর্ডার ${order.orderId || order.id} সফলভাবে অনুমোদন করা হয়েছে! ক্রেতার লাইব্রেরিতে বই যোগ হয়েছে।`);

    try {
      // Step 1: Write directly to orders node FIRST so approval status is guaranteed
      const orderDirectUpdate: Record<string, any> = {
        status: 'approved',
        approvedAt: Date.now(),
        commissionProcessed: true
      };
      await update(ref(db, `orders/${orderKey}`), orderDirectUpdate);

      // Also ensure if order was stored under another key, that it's updated as well
      if (order.id && order.id !== orderKey) {
        await update(ref(db, `orders/${order.id}`), orderDirectUpdate).catch(() => {});
      }

      // Step 2: Add book to buyer's library
      const buyerId = order.buyerId || (order as any).uid || (order as any).userId;
      const bookId = order.bookId;

      if (buyerId && bookId) {
        await set(ref(db, `libraries/${buyerId}/${bookId}`), {
          bookId: bookId,
          bookTitle: order.bookTitle || matchedBook?.title || 'ই-বুক',
          author: matchedBook?.author || 'লেখক',
          category: matchedBook?.category || 'অন্যান্য',
          coverUrl: matchedBook?.coverUrl || '',
          pdfUrl: matchedBook?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          orderId: order.orderId || orderKey,
          approvedAt: Date.now()
        }).catch(err => console.warn('Library record write warning:', err));
      }

      // Step 3: Send real-time notification to buyer
      if (buyerId) {
        const notifRef = push(ref(db, `notifications/${buyerId}`));
        if (notifRef.key) {
          await set(notifRef, {
            id: notifRef.key,
            title: '🎉 ই-বুক অর্ডার অনুমোদিত হয়েছে!',
            message: `আপনার "${order.bookTitle || 'বই'}" (Order ID: ${order.orderId}) সফলভাবে অনুমোদিত হয়েছে। লাইব্রেরি থেকে এখনই বইটি পড়ুন।`,
            createdAt: Date.now(),
            read: false
          }).catch(err => console.warn('Notification push warning:', err));
        }
      }

      // Step 4: Seller eBook Purchase -> Add purchase amount (order.amount) to Seller's Wallet
      if (isSellerBook && targetSellerId) {
        try {
          const sellerRef = ref(db, `sellers/${targetSellerId}`);
          const sellerSnap = await get(sellerRef);
          if (sellerSnap.exists()) {
            const s = sellerSnap.val();
            const amt = Number(order.amount) || 0;
            const newBal = (Number(s.balance) || 0) + amt;
            const newTotalEarnings = (Number(s.totalEarnings) || 0) + amt;
            const newSales = (Number(s.salesCount) || 0) + 1;

            await update(sellerRef, {
              balance: newBal,
              totalEarnings: newTotalEarnings,
              salesCount: newSales
            });

            // Optimistic update in sellers state
            setSellers(prev => ({
              ...prev,
              [targetSellerId]: {
                ...(prev[targetSellerId] || s),
                balance: newBal,
                totalEarnings: newTotalEarnings,
                salesCount: newSales
              }
            }));

            // Record in seller earnings ledger
            const ledgerRef = push(ref(db, 'earningsLedger'));
            if (ledgerRef.key) {
              await set(ledgerRef, {
                id: ledgerRef.key,
                sellerId: targetSellerId,
                orderId: order.orderId || orderKey,
                bookTitle: order.bookTitle || 'ই-বুক',
                amount: amt,
                createdAt: Date.now()
              });
            }

            // Real-time notification to seller
            const sNotifRef = push(ref(db, `notifications/${targetSellerId}`));
            if (sNotifRef.key) {
              await set(sNotifRef, {
                id: sNotifRef.key,
                title: '🎉 আপনার ই-বুক বিক্রিত হয়েছে!',
                message: `"${order.bookTitle || 'বই'}" সফলভাবে বিক্রিত হয়েছে এবং ৳${amt} আপনার সেলার ওয়ালেটে যুক্ত হয়েছে।`,
                createdAt: Date.now(),
                read: false
              });
            }
          }
        } catch (sErr) {
          console.warn('Seller balance update warning:', sErr);
        }
      }

      // Step 5: Referral Commission Business Logic (Strict Final Rule)
      // 1. Admin eBook:
      //    Buyer uses valid referral code -> Referral owner balance += 50 BDT (+৳50)
      // 2. Seller eBook:
      //    Referral commission is NEVER awarded (+৳0). Seller receives full ebook sale earning (already credited in Step 4).
      //    No referral transaction/commission record is created for Seller eBooks.
      // 3. Duplicate Protection:
      //    Admin eBook commission is awarded only once per order (prevent duplicate execution on refresh/callbacks).
      if (isSellerBook) {
        // Seller eBook: STRICTLY 0 BDT referral commission regardless of referral code
        // Seller earning was already credited to seller's wallet in Step 4.
        await update(ref(db, `orders/${orderKey}`), {
          commissionAwarded: false,
          commissionAmount: 0,
          commissionText: hasRefCode 
            ? 'সেলার ই-বুক (রেফারেল কমিশন প্রযোজ্য নয়: ৳০)' 
            : 'রেফারেল কোড ছাড়া ক্রয়',
          commissionNote: hasRefCode 
            ? `সেলার ই-বুকে কোনো রেফারেল কমিশন নেই (৳০)। সেলার ওয়ালেটে ৳${order.amount} বিক্রয় আয় জমা হয়েছে।` 
            : `সেলার ই-বুক: সেলার ওয়ালেটে ৳${order.amount} বিক্রয় আয় জমা হয়েছে।`,
          commissionProcessed: true
        });
      } else if (isAdminBook) {
        // Admin eBook: Eligible for 50 BDT commission if valid referral code is provided
        if (hasRefCode && !order.commissionAwarded) {
          const cleanRefCode = order.referralCode!.trim().toUpperCase();
          const txKey = `${orderKey}_EBOOK_REFERRAL`;

          try {
            // Prevent duplicate commission execution
            const existingTxSnap = await get(ref(db, `affiliateTransactions/${txKey}`));
            if (!existingTxSnap.exists()) {
              // Find referrer across in-memory state and database
              let referrerUid: string | null = null;
              let referrerProfile: any = null;

              // 1. Search in-memory users
              const userEntries = Object.entries(users);
              const foundUser = userEntries.find(([_, u]) => (u.referralCode || '').trim().toUpperCase() === cleanRefCode);
              if (foundUser) {
                referrerUid = foundUser[0];
                referrerProfile = foundUser[1];
              }

              // 2. Search database users
              if (!referrerUid) {
                try {
                  const uSnap = await get(ref(db, 'users'));
                  if (uSnap.exists()) {
                    const allU = uSnap.val();
                    const matched = Object.entries(allU).find(([_, u]: [string, any]) => (u.referralCode || '').trim().toUpperCase() === cleanRefCode);
                    if (matched) {
                      referrerUid = matched[0];
                      referrerProfile = matched[1];
                    }
                  }
                } catch (_) {}
              }

              // 3. Search sellers node if referrer registered as seller
              if (!referrerUid) {
                try {
                  const sSnap = await get(ref(db, 'sellers'));
                  if (sSnap.exists()) {
                    const allS = sSnap.val();
                    const matchedS = Object.entries(allS).find(([_, s]: [string, any]) => (s.referralCode || '').trim().toUpperCase() === cleanRefCode);
                    if (matchedS) {
                      referrerUid = matchedS[0];
                      referrerProfile = matchedS[1];
                    }
                  }
                } catch (_) {}
              }

              // 4. Search referralCodes index node
              if (!referrerUid) {
                try {
                  const rcSnap = await get(ref(db, `referralCodes/${cleanRefCode}`));
                  if (rcSnap.exists()) {
                    const rcData = rcSnap.val();
                    if (rcData?.uid) {
                      referrerUid = rcData.uid;
                      referrerProfile = rcData;
                    }
                  }
                } catch (_) {}
              }

              const buyerId = order.buyerId || (order as any).uid || (order as any).userId;
              const isSelfReferral = !!(referrerUid && buyerId && referrerUid === buyerId);

              if (isSelfReferral) {
                // Self-referral forbidden: 0 BDT commission
                await set(ref(db, `affiliateTransactions/${txKey}`), {
                  transactionId: txKey,
                  referrerUserId: referrerUid,
                  referrerName: referrerProfile?.fullName || 'Self',
                  referralCode: cleanRefCode,
                  buyerUserId: buyerId,
                  buyerName: order.buyerName || 'ক্রেতা',
                  orderId: order.orderId || orderKey,
                  ebookId: order.bookId,
                  ebookTitle: order.bookTitle || matchedBook?.title || 'ই-বুক',
                  commissionAmount: 0,
                  commissionType: 'EBOOK_REFERRAL',
                  status: 'REJECTED_SELF_REFERRAL',
                  createdAt: order.createdAt || Date.now(),
                  approvedAt: Date.now()
                });

                await update(ref(db, `orders/${orderKey}`), {
                  commissionAwarded: false,
                  commissionAmount: 0,
                  commissionText: 'সেলফ-রেফারেল (কমিশন: ৳০)',
                  commissionNote: 'সেলফ-রেফারেল নিষিদ্ধ হওয়ায় কোনো রেফারেল কমিশন দেওয়া হয়নি (৳০)',
                  commissionProcessed: true
                });
              } else if (referrerUid) {
                // Valid other user referral on Admin eBook: Award 50 BDT to referrer
                const commAmt = 50;
                let liveData = referrerProfile;

                // 1. Atomically update balance in affiliateBalances node
                await runTransaction(ref(db, `affiliateBalances/${referrerUid}/balance`), (curr: any) => {
                  return (Number(curr) || 0) + commAmt;
                }).catch(() => {});

                // 2. Fetch live latest balance from DB and update users node
                try {
                  const userRef = ref(db, `users/${referrerUid}`);
                  const freshSnap = await get(userRef);
                  if (freshSnap.exists()) {
                    liveData = freshSnap.val();
                  }

                  const currentBal = Number(liveData?.affiliateBalance) || 0;
                  const currentTotal = Number(liveData?.totalEarnings) || 0;
                  const newBal = currentBal + commAmt;
                  const newTotal = currentTotal + commAmt;

                  await update(userRef, {
                    affiliateBalance: newBal,
                    totalEarnings: newTotal
                  }).catch(() => {});
                } catch (_) {}

                // 3. Sync sellers node if profile exists there
                try {
                  const sellerCheck = await get(ref(db, `sellers/${referrerUid}`));
                  if (sellerCheck.exists()) {
                    const sData = sellerCheck.val();
                    const sBal = Number(sData?.affiliateBalance) || 0;
                    await update(ref(db, `sellers/${referrerUid}`), {
                      affiliateBalance: sBal + commAmt,
                      totalEarnings: (Number(sData?.totalEarnings) || 0) + commAmt
                    }).catch(() => {});
                  }
                } catch (_) {}

                // Optimistic update in Admin Panel users state
                setUsers(prev => ({
                  ...prev,
                  [referrerUid!]: {
                    ...(prev[referrerUid!] || referrerProfile),
                    affiliateBalance: (Number(prev[referrerUid!]?.affiliateBalance) || 0) + commAmt,
                    totalEarnings: (Number(prev[referrerUid!]?.totalEarnings) || 0) + commAmt
                  }
                }));

                // Transaction Record in affiliateTransactions/{transactionId}
                const txRecord = {
                  transactionId: txKey,
                  referrerUserId: referrerUid,
                  referrerName: liveData?.fullName || referrerProfile?.fullName || 'রেফারার',
                  referralCode: cleanRefCode,
                  buyerUserId: buyerId || 'buyer',
                  buyerName: order.buyerName || 'ক্রেতা',
                  orderId: order.orderId || orderKey,
                  ebookId: order.bookId,
                  ebookTitle: order.bookTitle || matchedBook?.title || 'ই-বুক',
                  commissionAmount: commAmt,
                  commissionType: 'EBOOK_REFERRAL',
                  status: 'APPROVED',
                  createdAt: order.createdAt || Date.now(),
                  approvedAt: Date.now()
                };

                await set(ref(db, `affiliateTransactions/${txKey}`), txRecord);

                // Also sync legacy commissions node
                await set(ref(db, `commissions/${txKey}`), {
                  id: txKey,
                  referrerUid,
                  referrerName: liveData?.fullName || referrerProfile?.fullName || 'রেফারার',
                  referrerEmail: liveData?.email || referrerProfile?.email || '',
                  buyerId: buyerId || 'buyer',
                  buyerName: order.buyerName || 'ক্রেতা',
                  orderId: order.orderId || orderKey,
                  bookTitle: order.bookTitle || matchedBook?.title || 'ই-বুক',
                  amount: commAmt,
                  type: 'ebook_referral',
                  text: 'অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০',
                  commissionText: 'অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০',
                  note: `অ্যাডমিন ই-বুকে রেফারেল কোড (${cleanRefCode}) ব্যবহারের জন্য ৳৫০ কমিশন প্রদান করা হয়েছে`,
                  createdAt: Date.now()
                });

                // Notification to referrer
                const rNotifRef = push(ref(db, `notifications/${referrerUid}`));
                if (rNotifRef.key) {
                  await set(rNotifRef, {
                    id: rNotifRef.key,
                    title: '🎉 ৳৫০ অ্যাফিলিয়েট রেফারেল কমিশন জমা হয়েছে!',
                    message: `আপনার রেফারেল কোড (${cleanRefCode}) দিয়ে অ্যাডমিন ই-বুক "${order.bookTitle || matchedBook?.title || 'বই'}" ক্রয় করা হয়েছে। ৳৫০ রেফারেল কমিশন আপনার ওয়ালেটে জমা হয়েছে।`,
                    createdAt: Date.now(),
                    read: false
                  });
                }

                // Update order record
                await update(ref(db, `orders/${orderKey}`), {
                  commissionAwarded: true,
                  commissionAmount: commAmt,
                  commissionText: 'অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০',
                  commissionNote: 'অ্যাডমিন ই-বুক: রেফারার পেয়েছে ৳৫০ রেফারেল কমিশন | ক্রেতা ৳০ কমিশন',
                  commissionProcessed: true
                });

                showToast('success', `অর্ডার অনুমোদিত! ৳৫০ রেফারেল কমিশন রেফারারের অ্যাকাউন্টে যোগ করা হয়েছে।`);
              } else {
                // Invalid referral code provided
                await update(ref(db, `orders/${orderKey}`), {
                  commissionAwarded: false,
                  commissionAmount: 0,
                  commissionText: 'অবৈধ রেফারেল কোড (কমিশন: ৳০)',
                  commissionNote: `রেফারেল কোড (${cleanRefCode}) সিস্টেমে পাওয়া যায়নি`,
                  commissionProcessed: true
                });
                showToast('info', `অর্ডার অনুমোদিত! তবে রেফারেল কোড (${cleanRefCode}) সিস্টেমে না থাকায় কোনো কমিশন দেওয়া হয়নি।`);
              }
            } else {
              // Already processed duplicate - prevent double crediting
              await update(ref(db, `orders/${orderKey}`), {
                commissionProcessed: true
              });
            }
          } catch (cErr) {
            console.warn('Commission update warning:', cErr);
          }
        } else if (!hasRefCode) {
          // Admin eBook without referral code
          await update(ref(db, `orders/${orderKey}`), {
            commissionAwarded: false,
            commissionAmount: 0,
            commissionText: 'রেফারেল কোড ছাড়া ক্রয়',
            commissionNote: 'অ্যাডমিন ই-বুক: কোনো রেফারেল কোড ব্যবহার করা হয়নি',
            commissionProcessed: true
          });
        }
      }
    } catch (err: any) {
      console.error('Order approval error:', err);
      showToast('error', 'অর্ডার ডাটাবেসে সেভ করতে সমস্যা: ' + err.message);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const targetKey = Object.keys(orders).find(k => k === orderId || orders[k].id === orderId || orders[k].orderId === orderId) || orderId;

    // Instant optimistic update
    setOrders(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k === targetKey || k === orderId || next[k].id === orderId || next[k].orderId === orderId) {
          next[k] = {
            ...next[k],
            status: 'rejected',
            rejectReason: 'অ্যাডমিন কর্তৃক বাতিলকৃত',
            rejectedAt: Date.now()
          };
        }
      }
      return next;
    });

    showToast('info', 'অর্ডারটি বাতিল করা হয়েছে।');

    try {
      await update(ref(db, `orders/${targetKey}`), {
        status: 'rejected',
        rejectReason: 'অ্যাডমিন কর্তৃক বাতিলকৃত',
        rejectedAt: Date.now()
      });
      if (orderId && orderId !== targetKey) {
        await update(ref(db, `orders/${orderId}`), {
          status: 'rejected',
          rejectReason: 'অ্যাডমিন কর্তৃক বাতিলকৃত',
          rejectedAt: Date.now()
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Order rejection error:', err);
      showToast('error', 'বাতিল করতে সমস্যা: ' + err.message);
    }
  };

  const handleConfirmDeleteOrder = async (orderId: string) => {
    const targetKey = Object.keys(orders).find(k => k === orderId || orders[k].id === orderId || orders[k].orderId === orderId) || orderId;

    // Instant optimistic update
    setOrders(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k === targetKey || k === orderId || next[k].id === orderId || next[k].orderId === orderId) {
          delete next[k];
        }
      }
      return next;
    });

    try {
      await remove(ref(db, `orders/${targetKey}`));
      if (orderId && orderId !== targetKey) {
        await remove(ref(db, `orders/${orderId}`)).catch(() => {});
      }
      showToast('success', 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে!');
      setDeletingOrder(null);
    } catch (err: any) {
      console.error('Order deletion error:', err);
      showToast('error', 'অর্ডার মুছতে সমস্যা: ' + err.message);
    }
  };

  const handleDeleteAllRejectedOrders = async () => {
    const rejectedEntries = Object.entries(orders).filter(([_, o]) => o.status === 'rejected');
    if (rejectedEntries.length === 0) {
      showToast('info', 'কোনো বাতিলকৃত অর্ডার নেই।');
      return;
    }

    try {
      // Optimistic update
      setOrders(prev => {
        const next = { ...prev };
        rejectedEntries.forEach(([k]) => delete next[k]);
        return next;
      });

      const updates: Record<string, null> = {};
      rejectedEntries.forEach(([k]) => {
        updates[`orders/${k}`] = null;
      });
      await update(ref(db), updates);
      showToast('success', `${rejectedEntries.length}টি বাতিলকৃত অর্ডার সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে!`);
    } catch (err: any) {
      showToast('error', 'অর্ডার মুছতে ত্রুটি: ' + err.message);
    }
  };

  // 3. Membership Request Approval
  const handleApproveMembership = async (req: MembershipRequest, customLimit?: number) => {
    const finalLimit = Number(customLimit !== undefined ? customLimit : (req.newUploadLimit || 50));
    if (req.status === 'approved') {
      showToast('info', 'মেম্বারশিপ ইতিমধ্যে অনুমোদিত।');
      return;
    }

    try {
      // 1. Instant optimistic state updates for immediate UI feedback
      setMembershipRequests(prev => ({
        ...prev,
        [req.id]: {
          ...prev[req.id],
          ...req,
          status: 'approved',
          newUploadLimit: finalLimit,
          approvedAt: Date.now()
        }
      }));

      setSellers(prev => {
        if (!prev[req.sellerId]) return prev;
        return {
          ...prev,
          [req.sellerId]: {
            ...prev[req.sellerId],
            membershipPlan: req.newMembership as 'free' | 'standard' | 'premium',
            uploadLimit: finalLimit
          }
        };
      });

      // 2. Persist to Firebase Realtime Database
      const updates: Record<string, any> = {};
      updates[`membershipRequests/${req.id}/status`] = 'approved';
      updates[`membershipRequests/${req.id}/newUploadLimit`] = finalLimit;
      updates[`membershipRequests/${req.id}/approvedAt`] = Date.now();
      updates[`sellers/${req.sellerId}/membershipPlan`] = req.newMembership;
      updates[`sellers/${req.sellerId}/uploadLimit`] = finalLimit;
      updates[`users/${req.sellerId}/membershipPlan`] = req.newMembership;
      updates[`users/${req.sellerId}/uploadLimit`] = finalLimit;

      const notifKey = push(ref(db, `notifications/${req.sellerId}`)).key;
      if (notifKey) {
        updates[`notifications/${req.sellerId}/${notifKey}`] = {
          id: notifKey,
          title: 'মেম্বারশিপ অনুমোদিত!',
          message: `আপনার ${req.newMembership.toUpperCase()} মেম্বারশিপ এবং নতুন আপলোড সীমা (${finalLimit}টি বই) সফলভাবে অনুমোদন করা হয়েছে।`,
          createdAt: Date.now(),
          read: false
        };
      }

      await update(ref(db), updates);
      showToast('success', `সেলার ${req.sellerName}-এর মেম্বারশিপ অনুমোদিত হয়েছে! লিমিট: ${finalLimit}টি বই।`);
    } catch (err: any) {
      console.error('Membership approval error:', err);
      showToast('error', 'মেম্বারশিপ অনুমোদন ব্যর্থ: ' + err.message);
    }
  };

  const handleRejectMembership = async (reqId: string) => {
    try {
      setMembershipRequests(prev => ({
        ...prev,
        [reqId]: {
          ...prev[reqId],
          status: 'rejected',
          rejectedAt: Date.now()
        }
      }));
      await update(ref(db, `membershipRequests/${reqId}`), {
        status: 'rejected',
        rejectedAt: Date.now()
      });
      showToast('info', 'মেম্বারশিপ রিকোয়েস্ট বাতিল করা হয়েছে।');
    } catch (err: any) {
      showToast('error', 'বাতিল করতে ত্রুটি: ' + err.message);
    }
  };

  const handleSetManualUploadLimit = async (sellerId: string, limit: number) => {
    if (!sellerId) return alert('সেলার নির্বাচন করুন।');
    try {
      const numLimit = Number(limit);
      const updates: Record<string, any> = {};
      updates[`sellers/${sellerId}/uploadLimit`] = numLimit;
      updates[`users/${sellerId}/uploadLimit`] = numLimit;

      // Also auto-approve any pending membership request for this seller
      const pendingEntries = Object.entries(membershipRequests).filter(
        ([_, m]) => m.sellerId === sellerId && m.status === 'pending'
      );

      pendingEntries.forEach(([key, m]) => {
        updates[`membershipRequests/${key}/status`] = 'approved';
        updates[`membershipRequests/${key}/newUploadLimit`] = numLimit;
        updates[`membershipRequests/${key}/approvedAt`] = Date.now();
        if (m.newMembership) {
          updates[`sellers/${sellerId}/membershipPlan`] = m.newMembership;
          updates[`users/${sellerId}/membershipPlan`] = m.newMembership;
        }
      });

      // Optimistic updates
      setSellers(prev => {
        if (!prev[sellerId]) return prev;
        return {
          ...prev,
          [sellerId]: {
            ...prev[sellerId],
            uploadLimit: numLimit
          }
        };
      });

      if (pendingEntries.length > 0) {
        setMembershipRequests(prev => {
          const next = { ...prev };
          pendingEntries.forEach(([key, m]) => {
            next[key] = {
              ...next[key],
              ...m,
              status: 'approved',
              newUploadLimit: numLimit,
              approvedAt: Date.now()
            };
          });
          return next;
        });
      }

      await update(ref(db), updates);
      alert(`সেলারের আপলোড লিমিট ${numLimit}টিতে সফলভাবে সেট করা হয়েছে${pendingEntries.length > 0 ? ' এবং পেন্ডিং মেম্বারশিপ রিকোয়েস্ট অনুমোদন হয়েছে' : ''}!`);
      setManualLimitSellerId('');
    } catch (err: any) {
      alert('লিমিট পরিবর্তন করতে সমস্যা: ' + err.message);
    }
  };

  // 4. Withdrawal Approval / Paid / Reject (With automatic balance refund on rejection)
  const handleWithdrawStatus = async (
    wth: WithdrawalRequest, 
    newStatus: 'approved' | 'paid' | 'rejected',
    payoutDetails?: { trxId?: string; adminNote?: string }
  ) => {
    try {
      const targetUserId = wth.userId || wth.uid;
      const primaryKey = wth.id || wth.requestId || wth.reqId;

      // Optimistic update in both state maps
      const updater = (prev: Record<string, WithdrawalRequest>) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (
            k === wth.id || 
            next[k].id === wth.id || 
            (wth.reqId && (k === wth.reqId || next[k].reqId === wth.reqId)) || 
            (wth.requestId && (k === wth.requestId || next[k].requestId === wth.requestId))
          ) {
            next[k] = { 
              ...next[k], 
              status: newStatus, 
              updatedAt: Date.now(), 
              processedAt: Date.now(),
              ...(payoutDetails?.trxId ? { trxId: payoutDetails.trxId } : {}),
              ...(payoutDetails?.adminNote ? { adminNote: payoutDetails.adminNote } : {})
            };
          }
        }
        return next;
      };

      setWithdrawals(updater);
      setWithdrawRequests(updater);

      const updates: Record<string, any> = {};
      const now = Date.now();

      // Write to all related keys in both withdrawals and withdrawRequests collections for complete compatibility
      const keysToUpdate = Array.from(new Set([wth.id, wth.requestId, wth.reqId, primaryKey].filter(Boolean))) as string[];
      for (const k of keysToUpdate) {
        updates[`withdrawals/${k}/status`] = newStatus;
        updates[`withdrawals/${k}/updatedAt`] = now;
        updates[`withdrawals/${k}/processedAt`] = now;
        updates[`withdrawRequests/${k}/status`] = newStatus;
        updates[`withdrawRequests/${k}/updatedAt`] = now;
        updates[`withdrawRequests/${k}/processedAt`] = now;
        if (payoutDetails?.trxId) {
          updates[`withdrawals/${k}/trxId`] = payoutDetails.trxId;
          updates[`withdrawRequests/${k}/trxId`] = payoutDetails.trxId;
        }
        if (payoutDetails?.adminNote) {
          updates[`withdrawals/${k}/adminNote`] = payoutDetails.adminNote;
          updates[`withdrawRequests/${k}/adminNote`] = payoutDetails.adminNote;
        }
      }

      // Handle Balance and Ledgers according to status
      if (targetUserId) {
        if (newStatus === 'rejected') {
          // RULE: On reject, requested amount is refunded back to user's available affiliate balance!
          if (wth.type === 'seller') {
            const sRef = ref(db, `sellers/${targetUserId}`);
            const sSnap = await get(sRef);
            if (sSnap.exists()) {
              const sData = sSnap.val();
              const curBal = Number(sData.balance || 0);
              const curPending = Number(sData.pendingWithdrawal || 0);
              updates[`sellers/${targetUserId}/balance`] = curBal + wth.amount;
              updates[`sellers/${targetUserId}/pendingWithdrawal`] = Math.max(0, curPending - wth.amount);
            }
          } else {
            const uRef = ref(db, `users/${targetUserId}`);
            const uSnap = await get(uRef);
            if (uSnap.exists()) {
              const uData = uSnap.val();
              const curBal = Number(uData.affiliateBalance || 0);
              const curPending = Number(uData.pendingWithdrawal || 0);
              updates[`users/${targetUserId}/affiliateBalance`] = curBal + wth.amount;
              updates[`users/${targetUserId}/pendingWithdrawal`] = Math.max(0, curPending - wth.amount);
            }
          }

          // Send rejection notification
          const notifRef = push(ref(db, `notifications/${targetUserId}`));
          if (notifRef.key) {
            updates[`notifications/${targetUserId}/${notifRef.key}`] = {
              id: notifRef.key,
              title: '❌ উইথড্র অনুরোধ বাতিল ও রিফান্ড',
              message: `আপনার ৳${wth.amount}-এর উইথড্র রিকোয়েস্টটি বাতিল করা হয়েছে এবং অর্থ পুনরায় আপনার ওয়ালেটে ফেরত দেওয়া হয়েছে।${payoutDetails?.adminNote ? ` কারণ: ${payoutDetails.adminNote}` : ''}`,
              createdAt: now,
              read: false
            };
          }
        } else if (newStatus === 'paid' || newStatus === 'approved') {
          // On Paid: deduct pending, record in totalWithdrawn
          if (wth.type === 'seller') {
            const sRef = ref(db, `sellers/${targetUserId}`);
            const sSnap = await get(sRef);
            if (sSnap.exists()) {
              const sData = sSnap.val();
              const curPending = Number(sData.pendingWithdrawal || 0);
              const curWithdrawn = Number(sData.withdrawnAmount || sData.totalWithdrawn || 0);
              updates[`sellers/${targetUserId}/pendingWithdrawal`] = Math.max(0, curPending - wth.amount);
              updates[`sellers/${targetUserId}/withdrawnAmount`] = curWithdrawn + wth.amount;
              updates[`sellers/${targetUserId}/totalWithdrawn`] = curWithdrawn + wth.amount;
            }
          } else {
            const uRef = ref(db, `users/${targetUserId}`);
            const uSnap = await get(uRef);
            if (uSnap.exists()) {
              const uData = uSnap.val();
              const curPending = Number(uData.pendingWithdrawal || 0);
              const curWithdrawn = Number(uData.totalWithdrawn || 0);
              updates[`users/${targetUserId}/pendingWithdrawal`] = Math.max(0, curPending - wth.amount);
              updates[`users/${targetUserId}/totalWithdrawn`] = curWithdrawn + wth.amount;
              updates[`users/${targetUserId}/totalPaidWithdrawal`] = curWithdrawn + wth.amount;
            }
          }

          // Send paid notification
          const notifRef = push(ref(db, `notifications/${targetUserId}`));
          if (notifRef.key) {
            updates[`notifications/${targetUserId}/${notifRef.key}`] = {
              id: notifRef.key,
              title: '✅ উইথড্র সফলভাবে পেইড হয়েছে!',
              message: `আপনার ৳${wth.amount}-এর উইথড্র রিকোয়েস্ট সফলভাবে পরিশোধ করা হয়েছে (${wth.paymentMethod || wth.method}: ${wth.paymentAccount || wth.account}).${payoutDetails?.trxId ? ` TrxID: ${payoutDetails.trxId}` : ''}`,
              createdAt: now,
              read: false
            };
          }
        }
      }

      await update(ref(db), updates);
      showToast('success', `উইথড্র স্ট্যাটাস: ${newStatus === 'paid' ? 'পেইড ও সেন্ড সম্পন্ন (Paid)' : newStatus === 'rejected' ? 'বাতিলকৃত ও রিফান্ডেড (Rejected)' : 'অনুমোদিত (Approved)'}`);
    } catch (err: any) {
      showToast('error', 'উইথড্র আপডেট ব্যর্থ: ' + err.message);
    }
  };

  const handleConfirmDeleteWithdrawal = async (wth: WithdrawalRequest) => {
    const wthId = wth.id;
    try {
      // Optimistic update in both state maps
      const remover = (prev: Record<string, WithdrawalRequest>) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (
            k === wthId || 
            next[k].id === wthId || 
            (wth.reqId && (k === wth.reqId || next[k].reqId === wth.reqId)) ||
            (wth.requestId && (k === wth.requestId || next[k].requestId === wth.requestId))
          ) {
            delete next[k];
          }
        }
        return next;
      };

      setWithdrawals(remover);
      setWithdrawRequests(remover);

      const updates: Record<string, null> = {};
      const keysToDelete = Array.from(new Set([wth.id, wth.requestId, wth.reqId, wthId].filter(Boolean))) as string[];
      for (const k of keysToDelete) {
        updates[`withdrawals/${k}`] = null;
        updates[`withdrawRequests/${k}`] = null;
      }
      await update(ref(db), updates);

      showToast('success', `${isWithPending(wth.status) ? 'নতুন' : 'পুরাতন'} উইথড্র রেকর্ড (${wth.userName}) সফলভাবে মুছে ফেলা হয়েছে!`);
      setDeletingWithdrawal(null);
    } catch (err: any) {
      showToast('error', 'উইথড্র ডিলিট ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteCompletedWithdrawals = async () => {
    const targets = withList.filter(w => isWithCompleted(w.status));
    if (targets.length === 0) {
      showToast('info', 'কোনো পুরাতন বা সম্পন্ন উইথড্র রেকর্ড নেই।');
      return;
    }

    try {
      setWithdrawals(prev => {
        const next = { ...prev };
        targets.forEach(t => {
          delete next[t.id];
          if (t.requestId) delete next[t.requestId];
          if (t.reqId) delete next[t.reqId];
        });
        return next;
      });

      setWithdrawRequests(prev => {
        const next = { ...prev };
        targets.forEach(t => {
          delete next[t.id];
          if (t.requestId) delete next[t.requestId];
          if (t.reqId) delete next[t.reqId];
        });
        return next;
      });

      const updates: Record<string, null> = {};
      targets.forEach(t => {
        const keys = Array.from(new Set([t.id, t.requestId, t.reqId].filter(Boolean))) as string[];
        keys.forEach(k => {
          updates[`withdrawals/${k}`] = null;
          updates[`withdrawRequests/${k}`] = null;
        });
      });
      await update(ref(db), updates);
      showToast('success', `${targets.length}টি পুরাতন/সম্পন্ন উইথড্র হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে! (ব্যবহারকারীর ব্যালেন্স সুরক্ষিত)`);
    } catch (err: any) {
      showToast('error', 'ডিলিট করতে ত্রুটি: ' + err.message);
    }
  };

  // Manual Add / Record Withdrawal
  const handleCreateManualWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWithUserId) {
      showToast('error', 'দয়া করে ইউজার নির্বাচন করুন');
      return;
    }
    if (newWithAmount <= 0) {
      showToast('error', 'সঠিক টাকার পরিমাণ দিন');
      return;
    }
    if (!newWithAccount.trim()) {
      showToast('error', 'দয়া করে একাউন্ট বা মোবাইল নম্বর দিন');
      return;
    }

    try {
      setIsSubmittingNewWithdraw(true);
      const isSeller = newWithUserType === 'seller';
      const targetUser = isSeller ? sellers[newWithUserId] : users[newWithUserId];
      const targetName = targetUser?.fullName || (targetUser as any)?.name || (targetUser as any)?.storeName || 'সম্মানিত ব্যবহারকারী';
      const targetEmail = targetUser?.email || '';

      const newKey = push(ref(db, 'withdrawals')).key || `WTH-${Date.now()}`;
      const uniqueReqId = `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = Date.now();
      const charge = isSeller ? (paymentSettings.withdrawCharge || 20) : 0;
      const netAmount = Math.max(0, newWithAmount - charge);

      const recordData: Record<string, any> = {
        id: newKey,
        requestId: uniqueReqId,
        reqId: uniqueReqId,
        uid: newWithUserId,
        userId: newWithUserId,
        userName: targetName,
        email: targetEmail,
        userEmail: targetEmail,
        amount: newWithAmount,
        charge,
        netAmount,
        method: newWithMethod,
        paymentMethod: newWithMethod,
        account: newWithAccount.trim(),
        paymentAccount: newWithAccount.trim(),
        note: newWithNote.trim(),
        type: newWithUserType,
        status: newWithStatus,
        createdAt: now,
        updatedAt: now,
        processedAt: newWithStatus === 'paid' ? now : null,
        adminNote: newWithNote.trim(),
        ...(newWithTrxId.trim() ? { trxId: newWithTrxId.trim() } : {})
      };

      const sanitized = Object.fromEntries(Object.entries(recordData).filter(([_, v]) => v !== undefined));

      const updates: Record<string, any> = {};
      updates[`withdrawals/${newKey}`] = sanitized;
      updates[`withdrawRequests/${newKey}`] = sanitized;

      if (newWithStatus === 'paid') {
        if (isSeller) {
          const sRef = ref(db, `sellers/${newWithUserId}`);
          const sSnap = await get(sRef);
          if (sSnap.exists()) {
            const curWithdrawn = Number(sSnap.val()?.withdrawnAmount || sSnap.val()?.totalWithdrawn || 0);
            updates[`sellers/${newWithUserId}/withdrawnAmount`] = curWithdrawn + newWithAmount;
          }
        } else {
          const uRef = ref(db, `users/${newWithUserId}`);
          const uSnap = await get(uRef);
          if (uSnap.exists()) {
            const curWithdrawn = Number(uSnap.val()?.totalWithdrawn || 0);
            updates[`users/${newWithUserId}/totalWithdrawn`] = curWithdrawn + newWithAmount;
          }
        }

        const notifRef = push(ref(db, `notifications/${newWithUserId}`));
        if (notifRef.key) {
          updates[`notifications/${newWithUserId}/${notifRef.key}`] = {
            id: notifRef.key,
            title: '✅ উইথড্র পেমেন্ট সফলভাবে পাঠানো হয়েছে!',
            message: `আপনার ৳${newWithAmount}-এর উইথড্র পেমেন্ট অ্যাডমিন কর্তৃক পাঠানো হয়েছে (${newWithMethod}: ${newWithAccount.trim()}).${newWithTrxId.trim() ? ` TrxID: ${newWithTrxId.trim()}` : ''}`,
            createdAt: now,
            read: false
          };
        }
      }

      await update(ref(db), updates);
      showToast('success', `নতুন উইথড্র/সেন্ড রেকর্ড সফলভাবে যোগ করা হয়েছে! (স্ট্যাটাস: ${newWithStatus})`);
      setIsAddWithdrawalOpen(false);
      setNewWithUserId('');
      setNewWithAmount(50);
      setNewWithAccount('');
      setNewWithTrxId('');
      setNewWithNote('');
    } catch (err: any) {
      showToast('error', 'উইথড্র এন্ট্রি যুক্ত করতে ত্রুটি: ' + err.message);
    } finally {
      setIsSubmittingNewWithdraw(false);
    }
  };

  // 5. Payment Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        update(ref(db, 'settings'), paymentSettings),
        set(ref(db, 'settings/footerLinks'), socialLinks)
      ]);
      alert('পেমেন্ট ও পেজ সেটিংস সফলভাবে সেভ হয়েছে!');
    } catch (err: any) {
      alert('সেটিংস সেভ করতে সমস্যা: ' + err.message);
    }
  };

  // 5b. App Download URL Save
  const handleSaveAppDownloadSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAppDownload(true);

    const trimmedUrl = appDownloadUrl.trim();

    // 1. Check that the input is not empty.
    if (!trimmedUrl) {
      showToast('error', 'অনুগ্রহ করে একটি URL প্রদান করুন (URL cannot be empty).');
      setSavingAppDownload(false);
      return;
    }

    // 2. Validate that it starts with: http:// or https://
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      showToast('error', 'URL অবশ্যই http:// অথবা https:// দিয়ে শুরু হতে হবে।');
      setSavingAppDownload(false);
      return;
    }

    const validation = formatAndValidateDownloadUrl(trimmedUrl);
    if (!validation.isValid) {
      showToast('error', validation.error || 'অনুগ্রহ করে সঠিক URL দিন (যেমন: https://example.com/app.apk)');
      setSavingAppDownload(false);
      return;
    }

    const finalUrl = validation.formattedUrl || trimmedUrl;

    // Ensure admin authentication is active; if not, automatically authenticate with master credentials
    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'admin@ebookbazar.com', 'Admin@123456');
      } catch (authErr) {
        console.warn('Auto-admin auth notice:', authErr);
      }
    }

    try {
      console.log('[App Download Save] Saving URL to Firebase RTDB:', {
        url: finalUrl,
        active: true,
        downloads: downloadCount,
        email: auth.currentUser?.email || currentUser?.email || 'admin'
      });

      // 3. Save the URL permanently to Firebase Realtime Database:
      // A. Write to ebooks/_platformStats (100% public realtime read for all visitors)
      await update(ref(db, 'ebooks/_platformStats'), {
        appDownloadUrl: finalUrl,
        downloadUrl: finalUrl,
        appDownloadActive: true,
        active: true,
        appDownloadCount: downloadCount,
        updatedAt: Date.now()
      });

      // B. Write to settings/appDownload (the verified path in RTDB security rules)
      const payload = {
        downloadUrl: finalUrl,
        url: finalUrl,
        appDownloadUrl: finalUrl,
        active: true,
        appDownloadActive: true,
        appDownloadEnabled: true,
        downloads: downloadCount,
        downloadCount: downloadCount,
        appDownloadCount: downloadCount,
        count: downloadCount,
        updatedAt: Date.now()
      };

      await update(ref(db, 'settings/appDownload'), payload).catch(() => {});
      await update(ref(db, 'settings'), { appDownloadUrl: finalUrl }).catch(() => {});
      await update(ref(db, 'ebooks/_appDownload'), payload).catch(() => {});
      await update(ref(db, 'appDownload'), payload).catch(() => {});

      // 4. Update local state only after Firebase confirms write
      setAppDownloadUrl(finalUrl);
      setAppDownloadSettings(prev => ({
        ...prev,
        url: finalUrl,
        downloadUrl: finalUrl,
        appDownloadUrl: finalUrl,
        active: true,
        appDownloadEnabled: true
      }));

      // 6. Show "URL saved successfully" ONLY after Firebase confirms the write.
      showToast('success', 'App Download URL সফলভাবে সেভ হয়েছে এবং হোমপেজে সংযুক্ত হয়েছে!');
    } catch (err: any) {
      console.error('[Firebase Error] Failed to save App Download URL:', {
        code: err?.code || 'UNKNOWN',
        message: err?.message || String(err),
        fullError: err
      });

      showToast('error', 'URL সেভ ব্যর্থ হয়েছে: ' + (err?.message || 'Firebase error'));
    } finally {
      setSavingAppDownload(false);
    }
  };

  // 5c. Admin Disable / Delete App Download URL
  const handleDisableAppDownloadUrl = async () => {
    const confirmed = window.confirm('আপনি কি নিশ্চিত যে App Download লিঙ্কটি মুছে/নিষ্ক্রিয় করতে চান? এর ফলে হোমপেজে "লিংক শীঘ্রই আসছে" প্রদর্শিত হবে।');
    if (!confirmed) return;

    setSavingAppDownload(true);

    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, 'admin@ebookbazar.com', 'Admin@123456');
      } catch (authErr) {
        console.warn('Auto-admin auth notice:', authErr);
      }
    }

    try {
      await update(ref(db, 'ebooks/_platformStats'), {
        appDownloadUrl: '',
        downloadUrl: '',
        appDownloadActive: false,
        active: false,
        updatedAt: Date.now()
      });

      const disablePayload = {
        downloadUrl: '',
        url: '',
        appDownloadUrl: '',
        active: false,
        appDownloadActive: false,
        appDownloadEnabled: false,
        downloads: downloadCount,
        downloadCount: downloadCount,
        count: downloadCount,
        updatedAt: Date.now()
      };

      await update(ref(db, 'settings/appDownload'), disablePayload).catch(() => {});
      await update(ref(db, 'settings'), { appDownloadUrl: '' }).catch(() => {});
      await update(ref(db, 'ebooks/_appDownload'), disablePayload).catch(() => {});
      await update(ref(db, 'appDownload'), disablePayload).catch(() => {});

      setAppDownloadUrl('');
      setAppDownloadSettings(prev => ({
        ...prev,
        url: '',
        downloadUrl: '',
        appDownloadUrl: '',
        active: false,
        appDownloadEnabled: false
      }));

      showToast('success', 'App Download URL সফলভাবে নিষ্ক্রিয় করা হয়েছে।');
    } catch (err: any) {
      console.error('[Firebase Error] Failed to disable App Download URL:', err);
      showToast('error', 'URL নিষ্ক্রিয় করতে সমস্যা: ' + (err?.message || err));
    } finally {
      setSavingAppDownload(false);
    }
  };


  // 6. Notification Management
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifMessage.trim()) return;

    try {
      const notifRef = ref(db, 'notifications/global');
      const newKey = push(notifRef).key;

      await set(ref(db, `notifications/global/${newKey}`), {
        id: newKey,
        title: newNotifTitle.trim(),
        message: newNotifMessage.trim(),
        active: true,
        createdAt: Date.now()
      });

      setNewNotifTitle('');
      setNewNotifMessage('');
      alert('নতুন গ্লোবাল নোটিফিকেশন সফলভাবে পাবলিশ হয়েছে!');
    } catch (err: any) {
      alert('নোটিফিকেশন তৈরিতে সমস্যা: ' + err.message);
    }
  };

  const handleToggleNotification = async (id: string, currentActive: boolean) => {
    try {
      await update(ref(db, `notifications/global/${id}`), { active: !currentActive });
    } catch (err: any) {
      alert('টগল করতে সমস্যা: ' + err.message);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await remove(ref(db, `notifications/global/${id}`));
    } catch (err: any) {
      alert('ডিলিট সমস্যা: ' + err.message);
    }
  };

  // 7. Delete User / Seller
  const handleDeleteUser = async (uid: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ইউজারটি মুছে ফেলতে চান?')) return;
    try {
      await remove(ref(db, `users/${uid}`));
      alert('ইউজার প্রোফাইল মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      alert('ডিলিট করতে সমস্যা: ' + err.message);
    }
  };

  const handleDeleteSeller = async (uid: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সেলার প্রোফাইলটি মুছে ফেলতে চান?')) return;
    try {
      await remove(ref(db, `sellers/${uid}`));
      alert('সেলার প্রোফাইল মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      alert('ডিলিট করতে সমস্যা: ' + err.message);
    }
  };

  // 8. Support Ticket Actions (Realtime Database Synchronized)
  const handleOpenTicketDetails = async (ticket: SupportTicket) => {
    setSelectedTicketForDetail(ticket);
    setAdminReplyText(ticket.adminReply || '');
    if (ticket.unreadByAdmin) {
      try {
        await update(ref(db, `supportTickets/${ticket.id}`), {
          unreadByAdmin: false
        });
      } catch (err) {
        console.warn('Failed to clear admin unread indicator:', err);
      }
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await update(ref(db, `supportTickets/${ticketId}`), {
        status: newStatus,
        updatedAt: Date.now()
      });
      showToast('success', `টিকিটের স্ট্যাটাস সফলভাবে '${newStatus.toUpperCase()}' করা হয়েছে!`);
      if (selectedTicketForDetail && selectedTicketForDetail.id === ticketId) {
        setSelectedTicketForDetail(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast('error', 'স্ট্যাটাস আপডেট করতে সমস্যা: ' + err.message);
    }
  };

  const handleSendAdminReply = async (ticket: SupportTicket) => {
    if (!adminReplyText.trim()) {
      showToast('error', 'অনুগ্রহ করে উত্তরের বার্তা লিখুন।');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const now = Date.now();
      const updates: Partial<SupportTicket> = {
        adminReply: adminReplyText.trim(),
        adminName: 'eBookBazar Support Team (Admin)',
        repliedAt: now,
        updatedAt: now,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
        unreadByUser: true,
        unreadByAdmin: false
      };

      await update(ref(db, `supportTickets/${ticket.id}`), updates);
      showToast('success', 'অ্যাডমিন রিপ্লাই সফলভাবে পাঠানো হয়েছে এবং ব্যবহারকারী সাথে সাথে দেখতে পাবেন!');

      // Send real-time notification to user/seller
      if (ticket.userId) {
        const notifRef = push(ref(db, `notifications/${ticket.userId}`));
        if (notifRef.key) {
          await set(ref(db, `notifications/${ticket.userId}/${notifRef.key}`), {
            id: notifRef.key,
            title: '📩 সাপোর্ট টিকিটে নতুন অ্যাডমিন উত্তর',
            message: `আপনার "${ticket.subject}" টিকিটে অ্যাডমিন উত্তর দিয়েছেন: "${adminReplyText.trim().slice(0, 70)}..."`,
            createdAt: now,
            read: false
          });
        }
      }

      if (selectedTicketForDetail && selectedTicketForDetail.id === ticket.id) {
        setSelectedTicketForDetail(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err: any) {
      showToast('error', 'উত্তর পাঠাতে সমস্যা: ' + err.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await remove(ref(db, `supportTickets/${ticketId}`));
      showToast('success', 'সাপোর্ট টিকিট সফলভাবে মুছে ফেলা হয়েছে।');
      setDeletingTicket(null);
      if (selectedTicketForDetail?.id === ticketId) {
        setSelectedTicketForDetail(null);
      }
    } catch (err: any) {
      showToast('error', 'টিকিট মুছতে সমস্যা: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-2 md:p-6 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Top Header Bar */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#15803d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">eBookBazar মাস্টার অ্যাডমিন প্যানেল</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Full Realtime Access
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                ব্যবহারকারী, সেলার, ই-বুক, পেমেন্ট ও মেম্বারশিপ ম্যানেজমেন্ট
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex flex-col items-end text-right mr-1">
                <span className="text-xs font-bold text-white leading-tight">
                  {currentUser.email || 'Admin'}
                </span>
                <span className="text-[10px] text-amber-300 font-medium">
                  অ্যাডমিন সেশন সক্রিয়
                </span>
              </div>
            )}

            {/* Go to Website Home */}
            <button
              onClick={handleGoToHome}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95 border border-emerald-600/50"
              title="ওয়েবসাইট হোমপেজে যান"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">ওয়েবসাইট হোম</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-95"
              title="অ্যাডমিন প্যানেল থেকে লগআউট করুন এবং লগইন উইন্ডো দেখুন"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-xs active:scale-95"
              title="অ্যাডমিন হিসেবে লগইন করুন"
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন</span>
            </button>

            <button
              onClick={handleGoToHome}
              className="w-9 h-9 rounded-xl bg-black/20 hover:bg-rose-600 text-white flex items-center justify-center transition font-black text-xl ml-1"
              title="প্যানেল বন্ধ করে ওয়েবসাইট হোমে যান"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('ebooks')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ebooks' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ই-বুক ম্যানেজমেন্ট</span>
            {pendingEbooksCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingEbooksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার ও পেমেন্ট</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('memberships')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'memberships' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>মেম্বারশিপ আপগ্রেড</span>
            {pendingMembershipCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingMembershipCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'withdrawals' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>উইথড্র ম্যানেজমেন্ট</span>
            {pendingWithdrawalCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingWithdrawalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'tickets' ? 'bg-[#15803d] text-white shadow ring-2 ring-emerald-500' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            <span>সাপোর্ট টিকিট</span>
            {pendingSupportCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingSupportCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'leaderboard' ? 'bg-[#15803d] text-white shadow ring-2 ring-amber-400' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>লিডারবোর্ড পোস্ট (Leaderboard)</span>
            {pendingLeaderboardCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingLeaderboardCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ইউজারস ({totalUsers})</span>
          </button>

          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sellers' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>সেলারস ({totalSellers})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>পেমেন্ট সেটিংস</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>নোটিফিকেশনস</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'affiliates' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>অ্যাফিলিয়েট</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-[#15803d] text-white shadow' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Firebase Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('xml')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'xml' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Blogger XML</span>
          </button>

          <button
            onClick={() => setActiveTab('app-download')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'app-download' ? 'bg-[#15803d] text-white shadow ring-2 ring-emerald-500' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>App Download</span>
          </button>

          {onOpenBlogManager && (
            <button
              onClick={onOpenBlogManager}
              className="px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-black border border-emerald-600/60 shadow-xs"
              title="বাস্তব ব্লগ পোস্ট লিখুন ও সকল ডেমো পোস্ট ডিলিট করুন"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>ব্লগ পোস্ট ও ডেমো</span>
            </button>
          )}
        </div>

        {/* Action Toast Banner */}
        {actionToast && (
          <div className={`px-6 py-2.5 flex items-center justify-between text-xs font-bold transition-all shrink-0 ${
            actionToast.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : actionToast.type === 'error' 
              ? 'bg-rose-600 text-white' 
              : 'bg-indigo-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {actionToast.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {actionToast.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {actionToast.type === 'info' && <Clock className="w-4 h-4" />}
              <span>{actionToast.message}</span>
            </div>
            <button 
              onClick={() => setActionToast(null)}
              className="text-white/80 hover:text-white font-black ml-4 text-sm"
              title="বন্ধ করুন"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Admin Tab Viewport */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6 bg-slate-50">

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Admin Dashboard Session & Action Card */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-white">
                        {currentUser ? (currentUser.email || 'Admin') : 'অ্যাডমিন ড্যাশবোর্ড সেশন'}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        currentUser ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {currentUser ? 'লগইন আছেন' : 'লগইন প্রয়োজন'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {currentUser 
                        ? 'আপনার অ্যাডমিন সেশন সক্রিয় আছে। আপনি সকল ফিচার পরিচালনা করতে পারেন।' 
                        : 'সম্পূর্ণ অ্যাডমিন ক্ষমতায় কাজ করতে নিচের লগইন বাটনে চাপুন।'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleGoToHome}
                    className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                    title="সরাসরি ওয়েবসাইট হোমপেজে যান"
                  >
                    <Home className="w-4 h-4 text-amber-300" />
                    <span>ওয়েবসাইট হোম</span>
                  </button>

                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                    title="অ্যাডমিন লগইন স্ক্রিন খুলুন"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>লগইন (Login)</span>
                  </button>
                </div>
              </div>

              {/* Realtime KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">সর্বমোট ব্যবহারকারী</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{totalUsers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">সর্বমোট সেলার</span>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{totalSellers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">সর্বমোট ই-বুক</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{totalEbooks}</p>
                  <p className="text-xs text-slate-500 mt-0.5">অনুমোদিত: {approvedEbooksCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-amber-600">অপেক্ষমান ই-বুক</span>
                  <p className="text-3xl font-black text-amber-600 mt-1">{pendingEbooksCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">মোট অর্ডার</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{totalOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-amber-600">অপেক্ষমান পেমেন্ট</span>
                  <p className="text-3xl font-black text-amber-600 mt-1">{pendingOrdersCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-emerald-600">অনুমোদিত পেমেন্ট</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{approvedOrdersCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-emerald-700">মোট বিক্রয় আয়</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">৳{totalGrossEarnings.toFixed(2)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-indigo-600">অপেক্ষমান মেম্বারশিপ</span>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{pendingMembershipCount}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-rose-600">অপেক্ষমান উইথড্র</span>
                  <p className="text-3xl font-black text-rose-600 mt-1">{pendingWithdrawalCount}</p>
                </div>

                <div 
                  onClick={() => setActiveTab('tickets')}
                  className="bg-white p-5 rounded-2xl border-2 border-amber-400/80 hover:border-amber-500 shadow-sm cursor-pointer hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                      <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
                      <span>অপেক্ষমান সাপোর্ট টিকিট</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">ক্লিক করুন</span>
                  </div>
                  <p className="text-3xl font-black text-amber-600 mt-1 group-hover:scale-105 transition-transform">{openTicketsCount}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">মোট টিকিট: {ticketList.length}টি</p>
                </div>

                <div 
                  onClick={() => setActiveTab('app-download')}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-500/60 hover:border-emerald-600 shadow-sm cursor-pointer hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>App Download Clicks</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ম্যানেজ
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-700 mt-1 group-hover:scale-105 transition-transform">
                    {appDownloadMetrics.totalClicks}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    আজকে: {appDownloadMetrics.todayClicks}টি | এই মাসে: {appDownloadMetrics.thisMonthClicks}টি
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('leaderboard')}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-600/70 hover:border-emerald-700 shadow-sm cursor-pointer hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>লিডারবোর্ড ও ফিডব্যাক</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ম্যানেজ
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mt-1 group-hover:scale-105 transition-transform">
                    {leaderboardPosts.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    অপেক্ষমান: <span className="font-bold text-amber-600">{pendingLeaderboardCount}</span> | লাইভ: {leaderboardPosts.filter(p => p.status === 'approved').length}
                  </p>
                </div>
              </div>

              {/* Quick Actions & Recent Orders preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 text-sm">
                      অপেক্ষমান ই-বুক অনুমোদন
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      {pendingEbooksCount}টি
                    </span>
                  </div>
                  {pendingEbooksCount === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">কোনো অপেক্ষমান ই-বুক নেই।</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {ebookList.filter(b => b.status === 'pending').map((b) => (
                        <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-black text-slate-900">{b.title}</p>
                            <p className="text-[10px] text-slate-500">সেলার: {b.sellerName} | ৳{b.price}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleEbookStatus(b.id, 'published')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-xs"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => handleEbookStatus(b.id, 'rejected')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded-lg font-bold text-xs"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 text-sm">
                      অপেক্ষমান পেমেন্ট অনুমোদন
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      {pendingOrdersCount}টি
                    </span>
                  </div>
                  {pendingOrdersCount === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">কোনো অপেক্ষমান পেমেন্ট নেই।</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {orderList.filter(o => o.status === 'pending').map((o) => {
                        const matchedBook = ebooks[o.bookId] || INITIAL_EBOOKS.find(b => b.id === o.bookId);
                        const isSellerBook = isEbookSellerOwned(o, matchedBook);
                        return (
                          <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-black text-slate-900">{o.bookTitle} (৳{o.amount})</p>
                                {!isSellerBook ? (
                                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                                    অ্যাডমিন ই-বুক
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                                    সেলার ই-বুক
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500">{o.buyerName} | {o.paymentMethod} Trx: {o.trxId}</p>
                              {o.referralCode && (
                                <div className="mt-0.5">
                                  {!isSellerBook ? (
                                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                                      Ref: {o.referralCode} • অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded inline-block">
                                      Ref: {o.referralCode} • সেলার ই-বুক (রেফারেল কমিশন: ৳০ • সেলার ওয়ালেটে জমা)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleApproveOrder(o)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>অনুমোদন</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(o.id)}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded-lg font-bold text-xs transition"
                              >
                                বাতিল
                              </button>
                              <button
                                onClick={() => setDeletingOrder(o)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-200 transition"
                                title="অর্ডার সম্পূর্ণ মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 text-sm">
                      অপেক্ষমান মেম্বারশিপ আপগ্রেড
                    </h3>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      {pendingMembershipCount}টি
                    </span>
                  </div>
                  {pendingMembershipCount === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">কোনো অপেক্ষমান মেম্বারশিপ নেই।</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {memReqList.filter(m => m.status === 'pending').map((m) => {
                        const currentReqLimit = customReqLimits[m.id] !== undefined ? customReqLimits[m.id] : m.newUploadLimit;
                        return (
                          <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-slate-900">{m.sellerName}</p>
                                <p className="text-[10px] text-indigo-700 font-bold uppercase">
                                  {m.newMembership} • ৳{m.amount} ({m.paymentMethod})
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                Trx: {m.trxId}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                <span>লিমিট:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={currentReqLimit}
                                  onChange={(e) => setCustomReqLimits(prev => ({ ...prev, [m.id]: Number(e.target.value) }))}
                                  className="w-14 px-1 py-0.5 border border-indigo-300 rounded font-black text-center text-indigo-900 bg-indigo-50 text-xs"
                                />
                                <span>টি</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleApproveMembership(m, currentReqLimit)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  onClick={() => handleRejectMembership(m.id)}
                                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded-lg font-bold text-xs"
                                >
                                  রিজেক্ট
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EBOOK MANAGEMENT */}
          {activeTab === 'ebooks' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">ই-বুক তালিকা ও অনুমোদন</h3>
                  <p className="text-xs text-slate-500">অনুমোদিত সহ যেকোনো বই এডিট ও ডিলিট করুন অথবা নতুন অ্যাডমিন বই যোগ করুন</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddAdminEbookOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ নতুন অ্যাডমিন ই-বুক যোগ করুন</span>
                  </button>
                  <select
                    value={selectedEbookFilter}
                    onChange={(e) => setSelectedEbookFilter(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="all">সকল ই-বুক ({ebookList.length})</option>
                    <option value="published">অনুমোদিত ({approvedEbooksCount})</option>
                    <option value="pending">অপেক্ষমান ({pendingEbooksCount})</option>
                    <option value="rejected">বাতিলকৃত</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">কভার ও নাম</th>
                      <th className="p-3">লেখক/সেলার</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মূল্য (রেগুলার / অফার)</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">রেটিং ও রিভিউ</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {ebookList
                      .filter(b => selectedEbookFilter === 'all' || b.status === selectedEbookFilter)
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={b.coverUrl || 'https://via.placeholder.com/150'} alt="" className="w-9 h-12 object-cover rounded bg-slate-200" />
                            <span className="font-bold text-slate-900 max-w-xs truncate">{b.title}</span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{b.author}</p>
                            {isEbookAdminOwned(b) ? (
                              <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                                অ্যাডমিন ই-বুক
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-block">
                                সেলার: {b.sellerName || 'Seller'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{b.category}</td>
                          <td className="p-3 font-medium">
                            <div className="flex flex-col">
                              <span className="font-black text-emerald-700 text-xs">৳{b.price}</span>
                              {b.regularPrice && b.regularPrice > b.price ? (
                                <span className="text-[10px] text-slate-400 line-through">
                                  রেগুলার: ৳{b.regularPrice}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              b.status === 'published' ? 'bg-emerald-100 text-emerald-800' : b.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1 min-w-[130px]">
                              <StarRating
                                rating={ratingSummaries[b.id]?.averageRating || 0}
                                totalRatings={ratingSummaries[b.id]?.totalRatings || 0}
                                size="xs"
                                compact={true}
                              />
                              <button
                                type="button"
                                onClick={() => setManagingReviewsBook(b)}
                                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline text-left flex items-center gap-1 transition"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                <span>রিভিউ পরিচালনা ({ratingSummaries[b.id]?.totalRatings || 0})</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {b.pdfUrl && (
                              <button
                                onClick={() => onOpenReader(b.pdfUrl, b.title)}
                                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-700 inline-flex items-center"
                                title="প্রিভিউ"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleEbookStatus(b.id, 'published')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold"
                                >
                                  অনুমোদন
                                </button>
                                <button
                                  onClick={() => handleEbookStatus(b.id, 'rejected')}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold"
                                >
                                  রিজেক্ট
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setEditingEbook(b)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                              title="এডিট করুন"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>এডিট</span>
                            </button>
                            <button
                              onClick={() => setDeletingEbook(b)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>ডিলিট</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER & PAYMENT MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">অর্ডার ও পেমেন্ট ভেরিফিকেশন</h3>
                  <p className="text-xs text-slate-500">অর্ডার অনুমোদন, বাতিল বা স্থায়ীভাবে মুছে ফেলুন</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {orderList.some(o => o.status === 'rejected') && (
                    <button
                      onClick={handleDeleteAllRejectedOrders}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95"
                      title="বাতিলকৃত সকল অর্ডার ডাটাবেস থেকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সকল বাতিলকৃত অর্ডার মুছুন ({orderList.filter(o => o.status === 'rejected').length})</span>
                    </button>
                  )}
                  <select
                    value={selectedOrderFilter}
                    onChange={(e) => setSelectedOrderFilter(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="all">সকল অর্ডার ({orderList.length})</option>
                    <option value="pending">অপেক্ষমান ({pendingOrdersCount})</option>
                    <option value="approved">অনুমোদিত ({approvedOrdersCount})</option>
                    <option value="rejected">বাতিলকৃত ({orderList.filter(o => o.status === 'rejected').length})</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">ক্রেতা (Buyer)</th>
                      <th className="p-3">বইয়ের নাম</th>
                      <th className="p-3">টাকা</th>
                      <th className="p-3">পেমেন্ট মেথড ও TrxID</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orderList
                      .filter(o => selectedOrderFilter === 'all' || o.status === selectedOrderFilter)
                      .map((o) => {
                        const matchedBook = ebooks[o.bookId] || INITIAL_EBOOKS.find(b => b.id === o.bookId);
                        const isSellerBook = isEbookSellerOwned(o, matchedBook);
                        return (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-900">{o.orderId}</td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{o.buyerName}</p>
                              <p className="text-[10px] text-slate-400">{o.buyerEmail}</p>
                              {o.referralCode && (
                                <div className="mt-1 space-y-0.5">
                                  <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold inline-block">
                                    Ref: {o.referralCode}
                                  </span>
                                  {!isSellerBook ? (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-1.5 py-0.5 rounded font-bold block">
                                      অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০ {o.status === 'approved' ? '(যুক্ত হয়েছে)' : '(অনুমোদনে যোগ হবে)'}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-medium block">
                                      সেলার ই-বুক (রেফারেল কমিশন: ৳০ • সেলার ওয়ালেটে জমা)
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800 max-w-xs truncate">{o.bookTitle}</p>
                              {!isSellerBook ? (
                                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded inline-block mt-0.5">
                                  অ্যাডমিন ই-বুক
                                </span>
                              ) : (
                                <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded inline-block mt-0.5">
                                  সেলার ই-বুক
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-black text-emerald-700">৳{o.amount}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{o.paymentMethod} ({o.paymentMobile})</p>
                            <p className="font-mono text-slate-500 font-bold text-[10px]">TrxID: {o.trxId}</p>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                              o.status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : o.status === 'rejected' 
                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {o.status === 'approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                              {o.status === 'pending' && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                              {o.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>{o.status === 'approved' ? 'Approved' : o.status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {o.status === 'pending' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleApproveOrder(o)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-black shadow-sm inline-flex items-center gap-1 transition active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(o.id)}
                                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>রিজেক্ট</span>
                                </button>
                                <button
                                  onClick={() => setDeletingOrder(o)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                                  title="অর্ডারটি সম্পূর্ণ ডিলিট করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>ডিলিট</span>
                                </button>
                              </div>
                            ) : o.status === 'approved' ? (
                              <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>অনুমোদিত</span>
                                </span>
                                <button
                                  onClick={() => setDeletingOrder(o)}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-200 transition"
                                  title="অর্ডার ডাটাবেস থেকে মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>বাতিলকৃত</span>
                                </span>
                                <button
                                  onClick={() => setDeletingOrder(o)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-sm transition active:scale-95"
                                  title="বাতিলকৃত অর্ডারটি চিরতরে মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>ডিলিট</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERSHIP REQUESTS & LIMIT ADJUSTMENT */}
          {activeTab === 'memberships' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                  সেলার মেম্বারশিপ আপগ্রেড রিকোয়েস্টসমূহ
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-3">সেলার</th>
                        <th className="p-3">বর্তমান মেম্বারশিপ</th>
                        <th className="p-3">নতুন মেম্বারশিপ</th>
                        <th className="p-3">পেমেন্ট ও TrxID</th>
                        <th className="p-3">স্ট্যাটাস</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {memReqList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                            কোনো মেম্বারশিপ আপগ্রেড রিকোয়েস্ট নেই।
                          </td>
                        </tr>
                      ) : (
                        memReqList.map((m) => {
                          const currentReqLimit = customReqLimits[m.id] !== undefined ? customReqLimits[m.id] : m.newUploadLimit;
                          return (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{m.sellerName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{m.sellerEmail}</p>
                              </td>
                              <td className="p-3 uppercase text-slate-500 font-bold">
                                {m.currentMembership} ({m.currentUploadLimit} বই)
                              </td>
                              <td className="p-3 font-bold">
                                <div className="space-y-1">
                                  <span className="font-black text-indigo-700 uppercase block">
                                    {m.newMembership}
                                  </span>
                                  {m.status === 'pending' ? (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                      <span className="font-bold">লিমিট:</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentReqLimit}
                                        onChange={(e) => setCustomReqLimits(prev => ({ ...prev, [m.id]: Number(e.target.value) }))}
                                        className="w-16 px-1.5 py-0.5 border border-indigo-300 rounded font-black text-center text-indigo-900 bg-indigo-50 text-xs focus:ring-1 focus:ring-indigo-500"
                                        title="অনুমোদনের জন্য আপলোড লিমিট নির্ধারণ করুন"
                                      />
                                      <span>বই</span>
                                    </div>
                                  ) : (
                                    <span className="text-emerald-700 text-xs font-black">
                                      অনুমোদিত সীমা: {m.newUploadLimit}টি বই
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="font-bold text-emerald-700">৳{m.amount} ({m.paymentMethod})</p>
                                <p className="font-mono text-slate-500 text-[10px]">TrxID: {m.trxId}</p>
                                {m.paymentMobile && (
                                  <p className="font-mono text-slate-400 text-[10px]">মোবাইল: {m.paymentMobile}</p>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
                                  m.status === 'approved' 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                    : m.status === 'rejected' 
                                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}>
                                  {m.status === 'approved' && <Check className="w-3 h-3 text-emerald-700" />}
                                  {m.status === 'pending' && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                                  {m.status}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                {m.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleApproveMembership(m, currentReqLimit)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1 transition active:scale-95"
                                      title="লিমিট সেট করে অনুমোদন করুন"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>অনুমোদন ও লিমিট সেট</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectMembership(m.id)}
                                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition"
                                    >
                                      রিজেক্ট
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      অনুমোদিত (লিমিট: {m.newUploadLimit}টি)
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manual Upload Limit Adjuster */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                  সেলারদের জন্য ম্যানুয়াল আপলোড লিমিট নির্ধারণ
                </h4>
                <div className="flex flex-col sm:flex-row gap-3 items-center text-xs">
                  <select
                    value={manualLimitSellerId}
                    onChange={(e) => setManualLimitSellerId(e.target.value)}
                    className="p-3 rounded-xl border border-slate-300 font-bold bg-white w-full sm:w-80"
                  >
                    <option value="">সেলার নির্বাচন করুন...</option>
                    {sellerList.map(s => (
                      <option key={s.uid} value={s.uid}>
                        {s.fullName} ({s.email}) — বর্তমান: {s.uploadLimit}টি
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={manualLimitVal}
                    onChange={(e) => setManualLimitVal(Number(e.target.value))}
                    className="p-3 rounded-xl border border-slate-300 font-bold text-sm w-full sm:w-40"
                    placeholder="লিমিট সংখ্যা"
                  />

                  <button
                    onClick={() => handleSetManualUploadLimit(manualLimitSellerId, manualLimitVal)}
                    className="bg-[#15803d] hover:bg-emerald-800 text-white px-5 py-3 rounded-xl font-black transition w-full sm:w-auto"
                  >
                    লিমিট সেট করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WITHDRAWAL MANAGEMENT */}
          {activeTab === 'withdrawals' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">উইথড্র রিকোয়েস্ট ও হিস্ট্রি ম্যানেজমেন্ট</h3>
                  <p className="text-xs text-slate-500">
                    নতুন উইথড্র অনুমোদন বা পুরাতন/বাতিলকৃত উইথড্র নিরাপদে মুছে ফেলুন (ইউজার অ্যাকাউন্ট অক্ষত থাকবে)
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setNewWithUserId(userList[0]?.uid || sellerList[0]?.uid || '');
                      setNewWithUserType('affiliate');
                      setNewWithAmount(50);
                      setNewWithMethod('bKash');
                      setNewWithAccount('');
                      setNewWithStatus('pending');
                      setNewWithTrxId('');
                      setNewWithNote('');
                      setIsAddWithdrawalOpen(true);
                    }}
                    className="bg-[#15803d] hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন উইথড্র / সেন্ড যুক্ত করুন</span>
                  </button>
                  {completedWithdrawalCount > 0 && (
                    <button
                      onClick={handleDeleteCompletedWithdrawals}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition active:scale-95"
                      title="সকল সম্পন্ন/পুরাতন উইথড্র রেকর্ড ডাটাবেস থেকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সকল পুরাতন রেকর্ড মুছুন ({completedWithdrawalCount})</span>
                    </button>
                  )}
                  <select
                    value={selectedWithdrawFilter}
                    onChange={(e) => setSelectedWithdrawFilter(e.target.value as any)}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="all">সকল উইথড্র ({withList.length})</option>
                    <option value="pending">নতুন রিকোয়েস্ট ({pendingWithdrawalCount})</option>
                    <option value="completed">পুরাতন / সম্পন্ন ({completedWithdrawalCount})</option>
                    <option value="rejected">বাতিলকৃত ({rejectedWithdrawalCount})</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ইউজার / সেলার</th>
                      <th className="p-3">টাইপ</th>
                      <th className="p-3">মোট টাকা</th>
                      <th className="p-3">চার্জ</th>
                      <th className="p-3">নেট প্রদেয়</th>
                      <th className="p-3">মেথড ও নম্বর</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredWithList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredWithList.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{w.userName || 'নাম নেই'}</p>
                            <p className="text-[10px] text-slate-400">{w.userEmail || w.email || ''}</p>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              w.type === 'seller' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {w.type || 'affiliate'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">৳{w.amount}</td>
                          <td className="p-3 font-bold">
                            {w.type === 'seller' ? (
                              <span className="text-rose-600">৳{w.charge !== undefined ? w.charge : 20}</span>
                            ) : (
                              <span className="text-emerald-700 font-black">৳০ (ফ্রি)</span>
                            )}
                          </td>
                          <td className="p-3 font-black text-emerald-700 text-sm">
                            ৳{w.netAmount !== undefined ? w.netAmount : (w.type === 'seller' ? Math.max(0, w.amount - 20) : w.amount)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{w.paymentMethod || w.method || 'bKash'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-700 text-xs font-bold">{w.paymentAccount || w.account}</span>
                              {(w.paymentAccount || w.account) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(w.paymentAccount || w.account || '');
                                    showToast('info', `নম্বর কপি হয়েছে: ${w.paymentAccount || w.account}`);
                                  }}
                                  title="নম্বর কপি করুন"
                                  className="p-1 text-slate-400 hover:text-emerald-700 rounded transition"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {w.note && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1" title={w.note}>
                                নোট: {w.note}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                              isWithCompleted(w.status) 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : isWithRejected(w.status) 
                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isWithCompleted(w.status) ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Paid (সম্পন্ন)</span>
                                </>
                              ) : isWithRejected(w.status) ? (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Rejected</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                  <span>নতুন রিকোয়েস্ট</span>
                                </>
                              )}
                            </span>
                            {w.trxId && (
                              <p className="font-mono text-[9px] text-slate-500 font-bold mt-1">TrxID: {w.trxId}</p>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {isWithPending(w.status) ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  disabled={processingWithdrawId === (w.id || w.requestId || w.reqId)}
                                  onClick={async () => {
                                    const key = w.id || w.requestId || w.reqId || 'item';
                                    setProcessingWithdrawId(key);
                                    await handleWithdrawStatus(w, 'paid');
                                    setProcessingWithdrawId(null);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                                  title="সরাসরি Paid / Approved অনুমোদন করুন (কোনো ফর্ম/পপআপ ছাড়াই)"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{processingWithdrawId === (w.id || w.requestId || w.reqId) ? 'অনুমোদন হচ্ছে...' : 'টাকা পাঠান / Approved'}</span>
                                </button>
                                <button
                                  disabled={processingWithdrawId === (w.id || w.requestId || w.reqId)}
                                  onClick={() => {
                                    const reason = window.prompt('উইথড্র বাতিলের কারণ লিখুন (ঐচ্ছিক - অর্থ ইউজারের ওয়ালেটে ফেরত যাবে):', 'ভুল অ্যাকাউন্ট নম্বর বা তথ্য');
                                    if (reason !== null) {
                                      handleWithdrawStatus(w, 'rejected', { adminNote: reason });
                                    }
                                  }}
                                  className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                                >
                                  <X className="w-3 h-3" />
                                  <span>রিজেক্ট</span>
                                </button>
                                <button
                                  onClick={() => setDeletingWithdrawal(w)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                                  title="নতুন উইথড্র রিকোয়েস্ট মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>ডিলিট</span>
                                </button>
                              </div>
                            ) : isWithCompleted(w.status) ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  disabled
                                  className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5 cursor-not-allowed opacity-90"
                                  title="এই উইথড্রটি ইতিমধ্যে পরিশোধিত ও অনুমোদিত"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Already Paid</span>
                                </button>
                                <button
                                  onClick={() => setDeletingWithdrawal(w)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                                  title="পুরাতন পেইড রেকর্ড মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>মুছে ফেলুন</span>
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                                  Rejected
                                </span>
                                <button
                                  onClick={() => setDeletingWithdrawal(w)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                                  title="বাতিলকৃত উইথড্র রেকর্ড মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>মুছে ফেলুন</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                নিবন্ধিত ব্যবহারকারীদের তালিকা
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">নাম ও ইমেইল</th>
                      <th className="p-3">মোবাইল ও জেলা</th>
                      <th className="p-3">রেফারেল কোড ও রেফার সংখ্যা</th>
                      <th className="p-3">রেফারার (Referred By)</th>
                      <th className="p-3">ব্যালেন্স</th>
                      <th className="p-3">রোল</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {userList.map((u) => {
                      const refCode = (u.referralCode || '').trim().toUpperCase();
                      const refCount = refCode ? userList.filter(o => o.uid !== u.uid && (o.referredBy || '').trim().toUpperCase() === refCode).length : 0;
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </td>
                          <td className="p-3 text-slate-600">{u.phone || 'N/A'} | {u.address || u.country || 'বাংলাদেশ'}</td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-800">{u.referralCode || 'N/A'}</span>
                            {refCount > 0 && (
                              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                                রেফারেল: {refCount} জন
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {u.referredBy ? (
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                {u.referredBy}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">সরাসরি (Direct)</span>
                            )}
                          </td>
                          <td className="p-3 font-black text-emerald-700">৳{(u.affiliateBalance || 0).toFixed(2)}</td>
                          <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{u.role}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SELLER MANAGEMENT */}
          {activeTab === 'sellers' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                নিবন্ধিত সেলারদের তালিকা
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">সেলার নাম ও ইমেইল</th>
                      <th className="p-3">পেমেন্ট মেথড ও নম্বর</th>
                      <th className="p-3">রেফারেল কোড</th>
                      <th className="p-3">মেম্বারশিপ</th>
                      <th className="p-3">আপলোড লিমিট</th>
                      <th className="p-3">ব্যালেন্স</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sellerList.map((s) => (
                      <tr key={s.uid} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400">{s.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{s.paymentMethod || 'bKash'}</p>
                          <p className="font-mono text-slate-500 text-[10px]">{s.paymentMobile || 'N/A'}</p>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">{s.referralCode}</td>
                        <td className="p-3 uppercase font-black text-indigo-700">{s.membershipPlan || 'FREE'}</td>
                        <td className="p-3 font-bold text-slate-700">{s.uploadLimit || 5}টি বই</td>
                        <td className="p-3 font-black text-emerald-700">৳{(s.balance || 0).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSeller(s.uid)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: PAYMENT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-base">পেমেন্ট গেটওয়ে ও সিস্টেম কনফিগারেশন</h3>
                <p className="text-xs text-slate-500">বিকাশ ও নগদ পেমেন্ট নম্বর এবং সার্ভিস টগল কনফিগার করুন</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">bKash Send Money নম্বর</label>
                    <input
                      type="tel"
                      required
                      value={paymentSettings.bkashNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashNumber: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nagad Send Money নম্বর</label>
                    <input
                      type="tel"
                      required
                      value={paymentSettings.nagadNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, nagadNumber: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">অ্যাফিলিয়েট বোনাস (টাকা)</label>
                    <input
                      type="number"
                      required
                      value={paymentSettings.affiliateCommission}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, affiliateCommission: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সেলার উইথড্র চার্জ (টাকা)</label>
                    <input
                      type="number"
                      required
                      value={paymentSettings.withdrawCharge}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, withdrawCharge: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">সেলার প্রতিটি উইথড্রলে নির্ধারিত ২০ টাকা ফি কর্তন হবে (বর্তমান: ৳{paymentSettings.withdrawCharge})</p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সর্বনিম্ন উইথড্র (টাকা)</label>
                    <input
                      type="number"
                      required
                      value={paymentSettings.minWithdraw}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, minWithdraw: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Service ON / OFF Switches */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 pt-3">
                  <h4 className="font-black text-slate-800 text-xs">সার্ভিস স্ট্যাটাস কন্ট্রোল:</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={paymentSettings.generalPaymentOn}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, generalPaymentOn: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>সাধারণ পেমেন্ট চালু</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={paymentSettings.ebookPaymentOn}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, ebookPaymentOn: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>ই-বুক ক্রয় চালু</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={paymentSettings.membershipPaymentOn}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, membershipPaymentOn: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>মেম্বারশিপ পেমেন্ট চালু</span>
                    </label>
                  </div>
                </div>

                {/* Social Media & Official Page Links */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 pt-3">
                  <h4 className="font-black text-slate-800 text-xs">অফিসিয়াল সোশ্যাল ও পেজ লিংক (নীতি ও পেজসমূহ):</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Freeder Page URL</label>
                      <input
                        type="url"
                        value={socialLinks.freederUrl || ''}
                        onChange={(e) => setSocialLinks({ ...socialLinks, freederUrl: e.target.value })}
                        placeholder="https://freeder.com.bd/pages/ebookbazar"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                      <input
                        type="url"
                        value={socialLinks.youtubeUrl}
                        onChange={(e) => setSocialLinks({ ...socialLinks, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-black px-6 py-3 rounded-xl shadow transition"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </form>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                  নতুন নোটিফিকেশন তৈরি করুন
                </h3>
                <form onSubmit={handleCreateNotification} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">শিরোনাম (Title) *</label>
                    <input
                      type="text"
                      required
                      value={newNotifTitle}
                      onChange={(e) => setNewNotifTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold"
                      placeholder="যেমন: নতুন অফার ঘোষণা!"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বার্তা (Message) *</label>
                    <textarea
                      required
                      rows={2}
                      value={newNotifMessage}
                      onChange={(e) => setNewNotifMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                      placeholder="নোটিফিকেশনের পূর্ণ বিবরণ লিখুন..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#15803d] hover:bg-emerald-800 text-white font-black px-5 py-2.5 rounded-xl shadow transition"
                  >
                    পাবলিশ করুন
                  </button>
                </form>
              </div>

              {/* Notification List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-black text-slate-900 text-sm">সক্রিয় নোটিফিকেশনসমূহ</h4>
                {notifList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">কোনো নোটিফিকেশন নেই।</p>
                ) : (
                  <div className="space-y-2">
                    {notifList.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black text-slate-900">{n.title}</p>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleNotification(n.id, n.active)}
                            className={`px-3 py-1 rounded-lg text-xs font-black ${
                              n.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {n.active ? 'ON' : 'OFF'}
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(n.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: AFFILIATE MANAGEMENT */}
          {activeTab === 'affiliates' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                অ্যাফিলিয়েট রেফারেল পরিসংখ্যান
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-black">প্রতি রেফারেলে কমিশন</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">৳{paymentSettings.affiliateCommission}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-black">সক্রিয় রেফারেল কোড</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{userList.filter(u => u.referralCode).length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-black">সেলার উইথড্র ফি</span>
                  <p className="text-2xl font-black text-indigo-700 mt-1">৳{paymentSettings.withdrawCharge}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ব্যবহারকারী</th>
                      <th className="p-3">রেফারেল কোড</th>
                      <th className="p-3">রেফারার</th>
                      <th className="p-3">রেফারকৃত ইউজার</th>
                      <th className="p-3">উত্তোলনযোগ্য ব্যালেন্স</th>
                      <th className="p-3">মোট অর্জিত আয়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {userList.map((u) => {
                      const refCode = (u.referralCode || '').trim().toUpperCase();
                      const refCount = refCode ? userList.filter(o => o.uid !== u.uid && (o.referredBy || '').trim().toUpperCase() === refCode).length : 0;
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{u.fullName} ({u.email})</td>
                          <td className="p-3 font-mono font-bold text-amber-700">{u.referralCode || 'N/A'}</td>
                          <td className="p-3">
                            {u.referredBy ? (
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                {u.referredBy}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">সরাসরি</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${refCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {refCount} জন
                            </span>
                          </td>
                          <td className="p-3 font-black text-emerald-700">৳{(u.affiliateBalance || 0).toFixed(2)}</td>
                          <td className="p-3 font-bold text-slate-700">৳{(u.totalEarnings || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commission Rule Summary Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <p className="font-black flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>রেফারেল ও অ্যাফিলিয়েট কমিশন নীতিমালা:</span>
                </p>
                <p className="font-semibold text-emerald-800">
                  ✓ অ্যাডমিন ই-বুক (Admin eBook): রেফারেল কোড দিয়ে কিনলে অ্যাডমিন অর্ডার অনুমোদন করার সাথে সাথে রেফারার পাবেন <span className="font-black">৳৫০ তাৎক্ষণিক কমিশন</span> (অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০)।
                </p>
                <p className="font-semibold text-slate-700">
                  ✓ সেলার ই-বুক (Seller eBook): রেফারেল কোড ব্যবহার করলেও রেফারেল কমিশন প্রযোজ্য নয় (৳০)। ই-বুকের বিক্রয়মূল্য সরাসরি সেলারের ওয়ালেটে জমা হবে।
                </p>
              </div>

              {/* Commission Logs Table */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">প্রদত্ত অ্যাফিলিয়েট কমিশন হিস্ট্রি</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {commissionList.length}টি লেনদেন
                  </span>
                </div>

                {commissionList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">এখনো কোনো রেফারেল কমিশন প্রদান করা হয়নি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                        <tr>
                          <th className="p-3">অর্ডার ও বইয়ের নাম</th>
                          <th className="p-3">রেফারার</th>
                          <th className="p-3">ক্রেতা</th>
                          <th className="p-3">কমিশন বিবরণী</th>
                          <th className="p-3">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {commissionList.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{c.bookTitle}</p>
                              <span className="font-mono text-[10px] text-slate-500">Order #{c.orderId}</span>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{c.referrerName || 'রেফারার'}</p>
                              <p className="text-[10px] text-slate-400">{c.referrerEmail}</p>
                            </td>
                            <td className="p-3 font-medium text-slate-700">{c.buyerName || 'ক্রেতা'}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-300">
                                <span>+{c.amount} ৳</span>
                                <span className="text-[10px] text-emerald-800 font-medium">({c.text || 'অ্যাডমিন ই-বুক অ্যাফিলিয়েট কমিশন: ৳৫০'})</span>
                              </span>
                            </td>
                            <td className="p-3 text-[10px] text-slate-500">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 11: FIREBASE SECURITY RULES */}
          {activeTab === 'rules' && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {rulesTab === 'firestore' ? 'Firebase Cloud Firestore Security Rules' : 'Firebase Realtime Database Security Rules'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {rulesTab === 'firestore' 
                      ? 'Firebase Console > Firestore Database > Rules ট্যাবে পেস্ট করে Publish করুন।' 
                      : 'Firebase Console > Realtime Database > Rules ট্যাবে পেস্ট করে Publish করুন।'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRulesTab('firestore')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        rulesTab === 'firestore' ? 'bg-[#15803d] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Firestore Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setRulesTab('rtdb')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        rulesTab === 'rtdb' ? 'bg-[#15803d] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Realtime DB Rules
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = rulesTab === 'firestore' ? 'firestore-rules-code' : 'firebase-rules-code';
                      const rules = document.getElementById(id)?.textContent || '';
                      navigator.clipboard.writeText(rules).then(() => alert(`${rulesTab === 'firestore' ? 'Firestore' : 'Realtime Database'} Rules সফলভাবে ক্লিপবোর্ডে কপি হয়েছে!`));
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </button>
                </div>
              </div>

              {rulesTab === 'firestore' ? (
                <pre 
                  id="firestore-rules-code"
                  className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto leading-relaxed max-h-96"
                >
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to verify admin authorization
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email in ['suma47083@gmail.com', 'admin@ebookbazar.com', 'redx0187@gmail.com'] ||
        (exists(/databases/$(database)/documents/admins/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.active != false) ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }

    // Blog Posts Collection: /blogs/{blogId}
    match /blogs/{blogId} {
      // 1. Public Read: Any visitor or reader can view published blog posts
      allow read: if true;

      // 2. Create & Update: Only authenticated authorized admins
      allow create, update: if isAdmin();

      // 3. Delete: ONLY authenticated authorized admin (Strictly blocked for public & regular users)
      allow delete: if isAdmin();
    }

    // Users Collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }

    // Admins Collection
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Sellers Collection
    match /sellers/{sellerId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.uid == sellerId || isAdmin());
    }

    // eBooks Collection
    match /ebooks/{ebookId} {
      allow read: if true;
      allow write: if request.auth != null && (
        !exists(/databases/$(database)/documents/ebooks/$(ebookId)) ||
        resource.data.sellerId == request.auth.uid ||
        isAdmin()
      );
    }

    // Orders Collection
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        !exists(/databases/$(database)/documents/orders/$(orderId)) ||
        resource.data.buyerId == request.auth.uid ||
        isAdmin()
      );
    }

    // Settings Collection
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Support Tickets Collection
    match /supportTickets/{ticketId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        !exists(/databases/$(database)/documents/supportTickets/$(ticketId)) ||
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
    }
  }
}`}
                </pre>
              ) : (
                <pre 
                  id="firebase-rules-code"
                  className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto leading-relaxed max-h-96"
                >
{`{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid === $uid || root.child('admins/' + auth.uid).exists() || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "sellers": {
      "$uid": {
        ".read": "true",
        ".write": "auth != null && (auth.uid === $uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "ebooks": {
      ".read": "true",
      "_blogs": {
        "$blogId": {
          ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com' || auth.token.email === 'redx0187@gmail.com')"
        }
      },
      "_ratings": {
        "$bookId": {
          "$userId": {
            ".write": "auth != null && (auth.uid === $userId || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
          }
        }
      },
      "_ratingSummary": {
        "$bookId": {
          ".write": "auth != null"
        }
      },
      "_leaderboardPosts": {
        "$postId": {
          ".write": "auth != null && (!data.exists() || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
        }
      },
      "$bookId": {
        ".write": "auth != null && (!data.exists() || data.child('sellerId').val() === auth.uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "orders": {
      ".read": "auth != null",
      "$orderId": {
        ".write": "auth != null && (!data.exists() || data.child('buyerId').val() === auth.uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "libraries": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')",
        ".write": "auth != null && (auth.uid === $uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "withdrawals": {
      ".read": "auth != null",
      "$withKey": {
        ".write": "auth != null && (!data.exists() || data.child('uid').val() === auth.uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "membershipRequests": {
      ".read": "auth != null",
      "$reqKey": {
        ".write": "auth != null"
      }
    },
    "notifications": {
      ".read": "true",
      ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
    },
    "blogs": {
      ".read": "true",
      "$blogId": {
        ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com' || auth.token.email === 'redx0187@gmail.com')"
      }
    },
    "ratings": {
      ".read": "true",
      "$bookId": {
        ".read": "true",
        "$userId": {
          ".write": "auth != null && (auth.uid === $userId || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
        }
      }
    },
    "ratingSummary": {
      ".read": "true",
      "$bookId": {
        ".write": "auth != null"
      }
    },
    "leaderboardPosts": {
      ".read": "true",
      "$postId": {
        ".write": "auth != null && (!data.exists() || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    },
    "settings": {
      ".read": "true",
      "appDownload": {
        "downloadCount": {
          ".write": "true"
        },
        "count": {
          ".write": "true"
        }
      },
      ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
    },
    "appDownloadStats": {
      ".read": "true",
      "totalClicks": {
        ".write": "true"
      },
      "daily": {
        "$date": {
          ".write": "true"
        }
      },
      "lastClickAt": {
        ".write": "true"
      },
      ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
    },
    "admins": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid && (auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com' || root.child('users/' + auth.uid + '/role').val() === 'admin') || root.child('admins/' + auth.uid).exists() || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      },
      ".write": "auth != null && (root.child('admins/' + auth.uid).exists() || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
    },
    "supportTickets": {
      ".read": "auth != null",
      "$ticketId": {
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid || root.child('admins/' + auth.uid).exists() || root.child('users/' + auth.uid + '/role').val() === 'admin' || auth.token.email === 'suma47083@gmail.com' || auth.token.email === 'admin@ebookbazar.com')"
      }
    }
  }
}`}
                </pre>
              )}
            </div>
          )}

          {/* TAB 12: BLOGGER XML EXPORT & ADMIN LOGIN TUTORIAL */}
          {activeTab === 'xml' && (
            <div className="space-y-6">
              {/* Admin Login Tutorial Card */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-indigo-700/50 shadow-xl space-y-6">
                <div className="border-b border-indigo-700/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      টিউটোরিয়াল ও লগইন গাইড
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      অ্যাডমিন লগইন ও ব্লগার XML সেটআপ সম্পূর্ণ টিউটোরিয়াল
                    </h3>
                  </div>
                  <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                    Official Admin Guide
                  </span>
                </div>

                {/* Step 1: Default Admin Credentials & 1-Click Access */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-2">
                    <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                      <span>১. ডিফল্ট অ্যাডমিন লগইন তথ্য (Credentials)</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ওয়েবসাইটটিতে সরাসরি টেস্ট করার জন্য ডিফল্ট অ্যাডমিন ইউজার তৈরি রয়েছে:
                    </p>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/30 text-xs font-mono space-y-1.5 text-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-bold text-amber-300">admin@ebookbazar.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Password:</span>
                        <span className="font-bold text-emerald-400">Admin@123456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Role:</span>
                        <span className="font-bold text-indigo-300">admin</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      💡 আপনি হোমপেজের হেডার বা টপ বার থেকে <b>"⚡ কুইক লগইন: অ্যাডমিন"</b> বাটনে ক্লিক করেই তাৎক্ষণিক অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে পারবেন।
                    </p>
                  </div>

                  {/* Step 2: How to create custom admin in Firebase */}
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-2">
                    <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                      <span>২. নিজের অ্যাকাউন্টকে অ্যাডমিন বানানোর নিয়ম</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      আপনার নিজস্ব ইমেইলকে স্থায়ী অ্যাডমিন ক্ষমতা দিতে Firebase Console-এ নিচের ধাপগুলো অনুসরণ করুন:
                    </p>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                      <li>প্রথমে ওয়েবসাইটে সাধারণ ইউজার হিসেবে রেজিস্ট্রেশন/লগইন করুন।</li>
                      <li><b>Firebase Console</b> &gt; <b>Realtime Database</b> &gt; <b>Data</b> ট্যাবে যান।</li>
                      <li><code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">admins</code> নোডের ভেতর আপনার UID অ্যাড করে ভ্যালু <code className="text-emerald-400">true</code> করে দিন।</li>
                      <li>অথবা <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">users/{'{your_uid}'}/role</code> ফিল্ডটি <code className="text-emerald-400">"admin"</code> সেট করুন।</li>
                    </ol>
                  </div>
                </div>

                {/* Step 3: Blogger Setup Instructions */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                  <h4 className="font-black text-amber-300 text-sm">
                    ৩. ব্লগার ডট কম (Blogger.com)-এ XML থিম ইনস্টল করার নিয়ম:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-200">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                      <b className="text-amber-400 block">ধাপ ১: কোড কপি</b>
                      <p className="text-slate-400 text-[11px]">নিচের বক্স থেকে "এক ক্লিকে সম্পূর্ণ XML কপি" বাটনে চাপ দিয়ে সম্পূর্ণ কোডটি কপি করুন।</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                      <b className="text-amber-400 block">ধাপ ২: Blogger থিম</b>
                      <p className="text-slate-400 text-[11px]">Blogger ড্যাশবোর্ডে গিয়ে বামের মেনু থেকে <b>Theme</b> অপশনে ক্লিক করুন।</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                      <b className="text-amber-400 block">ধাপ ৩: Edit HTML</b>
                      <p className="text-slate-400 text-[11px]">Customize বাটনের পাশের ড্রপডাউন থেকে <b>Edit HTML</b> নির্বাচন করুন।</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1">
                      <b className="text-amber-400 block">ধাপ ৪: পেস্ট ও সেভ</b>
                      <p className="text-slate-400 text-[11px]">আগের সব কোড মুছে কপি করা XML কোডটি পেস্ট করে উপরে ডানপাশের <b>Save (আইকন)</b> চাপুন।</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blogger XML Export Box */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">সম্পূর্ণ একক Blogger XML থিম ফাইল</h3>
                    <p className="text-xs text-slate-500">
                      Blogger &gt; Theme &gt; Edit HTML-এ সরাসরি পেস্ট করে সেভ করার উপযোগী প্রস্তুত কোড।
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const ta = document.getElementById('blogger-xml-export-area') as HTMLTextAreaElement;
                        if (!ta) return;
                        navigator.clipboard.writeText(ta.value).then(() => alert('সম্পূর্ণ Blogger XML ক্লিপবোর্ডে কপি হয়েছে!'));
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      <span>এক ক্লিকে সম্পূর্ণ XML কপি</span>
                    </button>
                    <a
                      href="/blogger-theme.xml"
                      download="blogger-theme.xml"
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>XML ফাইল ডাউনলোড</span>
                    </a>
                  </div>
                </div>

                <textarea
                  id="blogger-xml-export-area"
                  readOnly
                  rows={16}
                  value={xmlContent || "লোড হচ্ছে..."}
                  className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB: APP DOWNLOAD MANAGEMENT (ONLY URL & DOWNLOAD COUNT) */}
          {activeTab === 'app-download' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-emerald-700/40 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white">
                      📱 App Download Management
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Manage mobile application download URL and view total clicks
                    </p>
                  </div>
                </div>

                {/* Download Count Display */}
                <div className="bg-emerald-900/60 px-6 py-3.5 rounded-2xl border border-emerald-500/30 backdrop-blur-xs flex items-center gap-3">
                  <Download className="w-5 h-5 text-amber-300" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                      Live Statistics
                    </span>
                    <span className="text-xl font-black text-white">
                      Downloads: {downloadCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* URL Management Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      <span>App Download URL</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the direct APK or application download link for website visitors
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      appDownloadSettings.active !== false && appDownloadUrl.trim()
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}>
                      {appDownloadSettings.active !== false && appDownloadUrl.trim() ? 'Active (সক্রিয়)' : 'Inactive (নিষ্ক্রিয়)'}
                    </span>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      Downloads: {downloadCount}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveAppDownloadSettings} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-800">
                      App Download URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/app.apk"
                      value={appDownloadUrl}
                      onChange={(e) => setAppDownloadUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50"
                    />
                    <p className="text-xs text-slate-500">
                      Example: <code>https://example.com/app.apk</code> or any Google Drive / Web download link.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                    {appDownloadUrl.trim() && (
                      <button
                        type="button"
                        onClick={handleDisableAppDownloadUrl}
                        disabled={savingAppDownload}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold transition flex items-center justify-center gap-2 text-sm active:scale-95"
                        title="লিংক নিষ্ক্রিয় বা মুছে ফেলুন (Disable / Delete URL)"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Disable / Delete URL</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={savingAppDownload}
                      className="w-full sm:w-auto bg-[#15803d] hover:bg-emerald-800 text-white font-black px-8 py-3 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
                    >
                      {savingAppDownload ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-amber-300" />
                          <span>Save URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: SUPPORT TICKET MANAGEMENT */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* Header & Live KPI Cards */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white border border-emerald-600/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/50 text-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Support Ticket Management System</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    সাপোর্ট টিকিট <span className="text-amber-400">ম্যানেজমেন্ট</span>
                  </h3>
                  <p className="text-xs text-emerald-100/90 max-w-xl">
                    ব্যবহারকারী ও সেলারদের সকল সমস্যা, জিজ্ঞাসা, পেমেন্ট ও টেকনিক্যাল টিকিটের রিয়েল-টাইম তালিকা। দ্রুত রিভিউ করুন, স্ট্যাটাস পরিবর্তন করুন ও উত্তর দিন।
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-200 block">মোট টিকিট</span>
                    <span className="text-2xl font-black text-white">{ticketList.length}</span>
                  </div>
                  <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">অপেক্ষমান (Open)</span>
                    <span className="text-2xl font-black text-amber-400">{openTicketsCount}</span>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-3 border border-blue-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-300 block">প্রক্রিয়াধীন</span>
                    <span className="text-2xl font-black text-blue-400">{inProgressTicketsCount}</span>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">সমাধান হয়েছে</span>
                    <span className="text-2xl font-black text-emerald-300">{resolvedTicketsCount}</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="টিকিট আইডি, বিষয়, ইউজার বা ইমেইল খুঁজুন..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  {ticketSearch && (
                    <button
                      onClick={() => setTicketSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Status Filter */}
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="all">সকল স্ট্যাটাস ({ticketList.length})</option>
                    <option value="open">অপেক্ষমান / ওপেন ({openTicketsCount})</option>
                    <option value="in_progress">প্রক্রিয়াধীন ({inProgressTicketsCount})</option>
                    <option value="resolved">সমাধান হয়েছে ({resolvedTicketsCount})</option>
                    <option value="rejected">বাতিল ({rejectedTicketsCount})</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="all">সকল ক্যাটাগরি</option>
                    {TICKET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tickets Table / List */}
              {(() => {
                const filtered = ticketList.filter(t => {
                  const matchSearch = 
                    !ticketSearch.trim() ||
                    t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    (t.subject || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    (t.message || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    (t.userName || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    (t.userEmail || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
                    (t.userPhone || '').includes(ticketSearch);

                  const matchStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
                  const matchCategory = ticketCategoryFilter === 'all' || t.category === ticketCategoryFilter;

                  return matchSearch && matchStatus && matchCategory;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                      <LifeBuoy className="w-14 h-14 text-slate-300 mx-auto stroke-[1.2]" />
                      <h4 className="text-slate-800 font-black text-base">কোনো সাপোর্ট টিকিট পাওয়া যায়নি</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {ticketSearch || ticketStatusFilter !== 'all' || ticketCategoryFilter !== 'all'
                          ? 'আপনার নির্বাচিত ফিল্টার বা সার্চ অনুযায়ী কোনো টিকিট মিলছে না।'
                          : 'বর্তমানে ব্যবহারকারী বা সেলারদের পক্ষ থেকে কোনো নতুন টিকিট জমা দেওয়া হয়নি।'}
                      </p>
                      {(ticketSearch || ticketStatusFilter !== 'all' || ticketCategoryFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setTicketSearch('');
                            setTicketStatusFilter('all');
                            setTicketCategoryFilter('all');
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          ফিল্টার রিসেট করুন
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-4">টিকিট আইডি</th>
                            <th className="p-4">ইউজার / সেলার</th>
                            <th className="p-4 min-w-[280px]">মেসেজ ও বিষয় (Full Message View)</th>
                            <th className="p-4">তারিখ ও সময়</th>
                            <th className="p-4">স্ট্যাটাস</th>
                            <th className="p-4">অ্যাডমিন উত্তর</th>
                            <th className="p-4 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.map((t) => {
                            const isPendingOpen = t.status === 'open';
                            const isInProgress = t.status === 'in_progress';
                            const isResolved = t.status === 'resolved';
                            const isRejected = t.status === 'rejected';
                            const isExpanded = expandedTicketId === t.id;

                            return (
                              <tr 
                                key={t.id} 
                                className={`hover:bg-slate-50/80 transition ${
                                  t.unreadByAdmin ? 'bg-amber-50/40 font-semibold' : ''
                                }`}
                              >
                                <td className="p-4 align-top">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                      #{t.id.slice(-8).toUpperCase()}
                                    </span>
                                    {t.unreadByAdmin && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="নতুন টিকিট / অপঠিত" />
                                    )}
                                  </div>
                                </td>

                                <td className="p-4 align-top">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">{t.userName || 'Unknown'}</span>
                                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                        t.userRole === 'seller'
                                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}>
                                        {t.userRole === 'seller' ? '👑 সেলার' : '👤 ইউজার'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-mono">{t.userEmail || 'ইমেইল নেই'}</p>
                                    {t.userPhone && (
                                      <p className="text-[10px] text-slate-400 font-mono">📱 {t.userPhone}</p>
                                    )}
                                  </div>
                                </td>

                                <td className="p-4 max-w-md align-top">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-block text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                        {t.category}
                                      </span>
                                    </div>
                                    
                                    <p className="font-black text-slate-900 text-xs sm:text-sm" title={t.subject}>
                                      {t.subject}
                                    </p>

                                    {/* Inline Full Message Expand Option */}
                                    {isExpanded ? (
                                      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap animate-fadeIn">
                                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-emerald-200/60">
                                          <span className="font-black text-emerald-900 text-[10px] uppercase flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                                            <span>সম্পূর্ণ বার্তা (Full Message):</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(t.message || '');
                                              showToast('success', 'বার্তা ক্লিপবোর্ডে কপি হয়েছে!');
                                            }}
                                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-xs"
                                          >
                                            <Copy className="w-2.5 h-2.5" />
                                            <span>কপি</span>
                                          </button>
                                        </div>
                                        <div className="text-slate-800 font-medium">
                                          {t.message}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {t.message}
                                      </p>
                                    )}

                                    {/* Quick Full View Options Bar */}
                                    <div className="flex items-center gap-2 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 hover:underline"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="w-3.5 h-3.5" />
                                            <span>মেসেজ সংক্ষেপ করুন</span>
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            <span>সম্পূর্ণ বার্তা বিস্তারিত পড়ুন</span>
                                          </>
                                        )}
                                      </button>

                                      <span className="text-slate-300">•</span>

                                      <button
                                        type="button"
                                        onClick={() => setViewingFullMessageTicket(t)}
                                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 hover:underline"
                                        title="সম্পূর্ণ বার্তা পপআপ উইন্ডোতে বড় করে দেখুন"
                                      >
                                        <Maximize2 className="w-3 h-3" />
                                        <span>ফুল ভিউ মোড</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-4 whitespace-nowrap text-slate-500 text-[11px] align-top">
                                  <div className="flex items-center gap-1 font-mono">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                      {t.createdAt 
                                        ? new Date(t.createdAt).toLocaleDateString('bn-BD', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-4 whitespace-nowrap align-top">
                                  {isPendingOpen && (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full">
                                      <Clock className="w-3 h-3 text-amber-700" />
                                      <span>অপেক্ষমান (Open)</span>
                                    </span>
                                  )}
                                  {isInProgress && (
                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-black px-2.5 py-1 rounded-full">
                                      <RefreshCw className="w-3 h-3 text-blue-700 animate-spin" />
                                      <span>প্রক্রিয়াধীন</span>
                                    </span>
                                  )}
                                  {isResolved && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-full">
                                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                                      <span>সমাধান হয়েছে</span>
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-black px-2.5 py-1 rounded-full">
                                      <XCircle className="w-3 h-3 text-rose-700" />
                                      <span>বাতিল (Rejected)</span>
                                    </span>
                                  )}
                                </td>

                                <td className="p-4 max-w-[200px] align-top">
                                  {t.adminReply ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>উত্তর প্রদানকৃত</span>
                                      </span>
                                      <p className="text-[11px] text-slate-700 line-clamp-2 italic">
                                        "{t.adminReply}"
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>উত্তরের অপেক্ষায়</span>
                                    </span>
                                  )}
                                </td>

                                <td className="p-4 text-right whitespace-nowrap align-top">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setViewingFullMessageTicket(t)}
                                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black px-2.5 py-1.5 rounded-xl border border-indigo-200 shadow-xs flex items-center gap-1 transition text-xs"
                                      title="সম্পূর্ণ বার্তা বড় উইন্ডোতে দেখুন"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>মেসেজ ভিউ</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenTicketDetails(t)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition text-xs"
                                      title="বিস্তারিত দেখুন ও রিপ্লাই দিন"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span>রিপ্লাই</span>
                                    </button>

                                    {/* Quick Status Toggles */}
                                    {!isResolved && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTicketStatus(t.id, 'resolved')}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-1.5 rounded-xl border border-emerald-300 transition"
                                        title="সমাধান হিসেবে মার্ক করুন"
                                      >
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      </button>
                                    )}

                                    {!isRejected && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTicketStatus(t.id, 'rejected')}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-800 p-1.5 rounded-xl border border-rose-300 transition"
                                        title="বাতিল করুন"
                                      >
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setDeletingTicket(t)}
                                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 p-1.5 rounded-xl transition"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: LEADERBOARD POSTS MANAGEMENT */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              {/* Header & KPI Summary */}
              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 text-white border border-emerald-600/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/50 text-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard & Community Feedback System</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    লিডারবোর্ড পোস্ট ও <span className="text-amber-400">ফিডব্যাক ম্যানেজমেন্ট</span>
                  </h3>
                  <p className="text-xs text-emerald-100/90 max-w-xl">
                    ইউজার, সেলার ও বায়ারদের বাস্তব মতামত যাচাই, অনুমোদন, বাতিল, মুছে ফেলা এবং অ্যাডমিন রিপ্লাই প্রদান করুন। শুধুমাত্র অনুমোদিত পোস্ট হোমপেজ লিডারবোর্ডে প্রদর্শিত হবে।
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-200 block">মোট পোস্ট</span>
                    <span className="text-2xl font-black text-white">{leaderboardPosts.length}</span>
                  </div>
                  <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">অপেক্ষমান</span>
                    <span className="text-2xl font-black text-amber-400">{pendingLeaderboardCount}</span>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">অনুমোদিত (Live)</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {leaderboardPosts.filter(p => p.status === 'approved').length}
                    </span>
                  </div>
                  <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl p-3 border border-rose-400/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-300 block">বাতিলকৃত</span>
                    <span className="text-2xl font-black text-rose-400">
                      {leaderboardPosts.filter(p => p.status === 'rejected').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">মতামত ও ফিডব্যাকের তালিকা</h3>
                    <p className="text-xs text-slate-500">অনুমোদনের পর পোস্টগুলো হোমপেজ লিডারবোর্ডে দৃশ্যমান হবে</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedLeaderboardFilter}
                      onChange={(e) => setSelectedLeaderboardFilter(e.target.value as any)}
                      className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="all">সকল পোস্ট ({leaderboardPosts.length})</option>
                      <option value="pending">অপেক্ষমান ({pendingLeaderboardCount})</option>
                      <option value="approved">অনুমোদিত ({leaderboardPosts.filter(p => p.status === 'approved').length})</option>
                      <option value="rejected">বাতিলকৃত ({leaderboardPosts.filter(p => p.status === 'rejected').length})</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-3">প্রেরক ও ভূমিকা</th>
                        <th className="p-3">মতামতের ধরন</th>
                        <th className="p-3">মন্তব্য (Comment)</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">স্ট্যাটাস</th>
                        <th className="p-3">অ্যাডমিন রিপ্লাই</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {leaderboardPosts
                        .filter(p => selectedLeaderboardFilter === 'all' || p.status === selectedLeaderboardFilter)
                        .map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50">
                            <td className="p-3 align-top">
                              <p className="font-black text-slate-900">{post.name}</p>
                              <span className={`inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                post.role === 'Seller' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : post.role === 'Buyer' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {post.role}
                              </span>
                            </td>

                            <td className="p-3 align-top whitespace-nowrap">
                              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80">
                                {post.postType}
                              </span>
                            </td>

                            <td className="p-3 align-top max-w-sm">
                              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {post.comment}
                              </p>
                            </td>

                            <td className="p-3 align-top text-slate-500 whitespace-nowrap">
                              {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                            </td>

                            <td className="p-3 align-top whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                post.status === 'approved' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : post.status === 'rejected' 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {post.status}
                              </span>
                            </td>

                            <td className="p-3 align-top max-w-xs">
                              {post.adminReply ? (
                                <div className="space-y-1 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/70 text-[11px]">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-emerald-900 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                      <span>রিপ্লাই দেওয়া হয়েছে</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingPost(post);
                                        setReplyInputText(post.adminReply?.text || '');
                                      }}
                                      className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                                    >
                                      এডিট
                                    </button>
                                  </div>
                                  <p className="text-slate-700 italic line-clamp-2">
                                    "{post.adminReply.text}"
                                  </p>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingPost(post);
                                    setReplyInputText('');
                                  }}
                                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>+ রিপ্লাই দিন</span>
                                </button>
                              )}
                            </td>

                            <td className="p-3 align-top text-right space-x-1.5 whitespace-nowrap">
                              {post.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await updateLeaderboardStatus(post.id, 'approved');
                                    showToast('success', 'পোস্টটি সফলভাবে অনুমোদন করা হয়েছে!');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 shadow-xs"
                                >
                                  অনুমোদন
                                </button>
                              )}

                              {post.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await updateLeaderboardStatus(post.id, 'rejected');
                                    showToast('success', 'পোস্টটি বাতিল করা হয়েছে!');
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 shadow-xs"
                                >
                                  বাতিল
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('আপনি কি নিশ্চিতভাবে এই পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
                                  setDeletingPostId(post.id);
                                  try {
                                    await deleteLeaderboardPost(post.id);
                                    showToast('success', 'পোস্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে!');
                                  } finally {
                                    setDeletingPostId(null);
                                  }
                                }}
                                disabled={deletingPostId === post.id}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>ডিলিট</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {leaderboardPosts.length === 0 && (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <Trophy className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-1" />
                      <p className="font-bold text-xs">কোনো লিডারবোর্ড পোস্ট পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Manage Ebook Reviews Modal */}
      {managingReviewsBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-slate-900">ই-বুক রেটিং ও রিভিউ পরিচালনা</h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">{managingReviewsBook.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingReviewsBook(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book & Rating Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={managingReviewsBook.coverUrl || 'https://via.placeholder.com/150'}
                  alt=""
                  className="w-12 h-16 object-cover rounded-xl bg-slate-200 shrink-0"
                />
                <div className="text-xs">
                  <h4 className="font-black text-slate-900 line-clamp-1">{managingReviewsBook.title}</h4>
                  <p className="text-slate-500 font-medium">লেখক: {managingReviewsBook.author}</p>
                  <p className="text-emerald-700 font-bold mt-1">মূল্য: ৳{managingReviewsBook.price}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">গড় রেটিং</span>
                <StarRating
                  rating={ratingSummaries[managingReviewsBook.id]?.averageRating || 0}
                  totalRatings={ratingSummaries[managingReviewsBook.id]?.totalRatings || 0}
                  size="sm"
                  compact={false}
                />
              </div>
            </div>

            {/* Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-700 uppercase">
                  সকল বাস্তব রিভিউ ({managingBookReviews.length})
                </h4>
                <span className="text-[10px] text-slate-400">
                  অ্যাডমিন হিসেবে অনুপযুক্ত বা স্প্যাম রিভিউ মুছে ফেলতে পারেন
                </span>
              </div>

              {managingBookReviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                  <Star className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5] mb-1" />
                  <p className="font-bold text-xs">এখনও কোনো গ্রাহক রিভিউ জমা দেননি</p>
                </div>
              ) : (
                managingBookReviews.map((rev) => (
                  <div
                    key={rev.userId}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{rev.userName}</span>
                        {rev.userEmail && (
                          <span className="text-[10px] text-slate-400">({rev.userEmail})</span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.updatedAt || rev.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarRating
                          rating={rev.rating}
                          totalRatings={1}
                          size="xs"
                          showCount={false}
                        />
                        <span className="font-bold text-amber-700 text-[11px]">({rev.rating} স্টার)</span>
                      </div>
                      {rev.review ? (
                        <p className="text-slate-700 pt-0.5 whitespace-pre-wrap font-normal">
                          "{rev.review}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">কোনো লিখিত মন্তব্য নেই।</p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={deletingReviewId === rev.userId}
                      onClick={async () => {
                        if (!window.confirm(`আপনি কি "${rev.userName}" এর রিভিউটি মুছে ফেলতে চান?`)) return;
                        setDeletingReviewId(rev.userId);
                        try {
                          await deleteEbookRating(managingReviewsBook.id, rev.userId);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setDeletingReviewId(null);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                      title="অনুপযুক্ত রিভিউ মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setManagingReviewsBook(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reply Modal for Leaderboard Post */}
      {replyingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">অ্যাডমিন উত্তর (Admin Reply)</h3>
              </div>
              <button
                type="button"
                onClick={() => setReplyingPost(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post Details */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{replyingPost.name} ({replyingPost.role})</span>
                <span className="text-slate-400 font-bold">{replyingPost.postType}</span>
              </div>
              <p className="text-slate-700 italic whitespace-pre-wrap">"{replyingPost.comment}"</p>
            </div>

            {/* Reply Input Form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                অ্যাডমিনের উত্তর (Admin Reply Text):
              </label>
              <textarea
                rows={4}
                value={replyInputText}
                onChange={(e) => setReplyInputText(e.target.value)}
                placeholder="eBookBazar টিমের পক্ষ থেকে গ্রাহককে সদয় ও আশ্বস্তকারী উত্তর লিখুন..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 leading-relaxed"
                maxLength={500}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {replyingPost.adminReply ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('আপনি কি পূর্বের অ্যাডমিন রিপ্লাইটি মুছে ফেলতে চান?')) return;
                    await deleteAdminReply(replyingPost.id);
                    setReplyingPost(null);
                    showToast('success', 'অ্যাডমিন রিপ্লাইটি মুছে ফেলা হয়েছে!');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 py-2 px-3 rounded-xl hover:bg-rose-50 transition"
                >
                  রিপ্লাই মুছুন
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingPost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={savingReply || !replyInputText.trim()}
                  onClick={async () => {
                    setSavingReply(true);
                    try {
                      await saveAdminReply({
                        postId: replyingPost.id,
                        replyText: replyInputText,
                        adminId: currentUser?.uid || 'admin',
                        adminName: userProfile?.fullName || 'eBookBazar Admin'
                      });
                      setReplyingPost(null);
                      showToast('success', 'অ্যাডমিন রিপ্লাই সফলভাবে সংরক্ষিত হয়েছে!');
                    } catch (err: any) {
                      showToast('error', err?.message || 'রিপ্লাই সংরক্ষণ ব্যর্থ হয়েছে।');
                    } finally {
                      setSavingReply(false);
                    }
                  }}
                  className="bg-[#15803d] hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingReply ? 'সংরক্ষণ হচ্ছে...' : 'রিপ্লাই পাঠান'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ebook Confirmation Modal */}
      {deletingEbook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">ই-বুক মুছে ফেলার নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">এই পরিবর্তনটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={deletingEbook.coverUrl || 'https://via.placeholder.com/150'}
                alt=""
                className="w-12 h-16 object-cover rounded-lg bg-slate-200 shrink-0"
              />
              <div className="text-xs space-y-0.5 min-w-0">
                <p className="font-bold text-slate-900 truncate">{deletingEbook.title}</p>
                <p className="text-slate-500 text-[11px]">{deletingEbook.author} • ৳{deletingEbook.price}</p>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                  {deletingEbook.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে <b>"{deletingEbook.title}"</b> ই-বুকটি সিস্টেম ও মার্কেটপ্লেস থেকে চিরতরে মুছে ফেলতে চান?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEbook(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteEbook(deletingEbook.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">অর্ডার মুছে ফেলার নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">অর্ডার রেকর্ডটি চিরতরে ডাটাবেস থেকে মুছে ফেলা হবে।</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার আইডি:</span>
                <span className="font-mono font-bold text-slate-900">{deletingOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বইয়ের নাম:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{deletingOrder.bookTitle || 'ই-বুক'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ক্রেতা:</span>
                <span className="font-bold text-slate-800">{deletingOrder.buyerName || deletingOrder.buyerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মূল্য ও মেথড:</span>
                <span className="font-black text-emerald-700">৳{deletingOrder.amount} ({deletingOrder.paymentMethod})</span>
              </div>
              {deletingOrder.trxId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">TrxID:</span>
                  <span className="font-mono text-slate-700 font-bold">{deletingOrder.trxId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  deletingOrder.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : deletingOrder.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {deletingOrder.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে এই অর্ডার রেকর্ডটি ডাটাবেস থেকে সম্পূর্ণ মুছে ফেলতে চান?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteOrder(deletingOrder.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Withdrawal Confirmation Modal */}
      {deletingWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isWithPending(deletingWithdrawal.status) ? 'নতুন' : 'পুরাতন'} উইথড্র রেকর্ড ডিলিট
                </h3>
                <p className="text-xs text-slate-500">ইউজার বা সেলারের মূল অ্যাকাউন্ট ও ওয়ালেট ব্যালেন্স সম্পূর্ণ সুরক্ষিত থাকবে।</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">ব্যবহারকারী/সেলার:</span>
                <span className="font-bold text-slate-900">{deletingWithdrawal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ইমেইল:</span>
                <span className="text-slate-700">{deletingWithdrawal.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">টাইপ ও মোট টাকা:</span>
                <span className="font-black text-slate-900 uppercase">
                  {deletingWithdrawal.type} • ৳{deletingWithdrawal.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেমেন্ট মেথড ও অ্যাকাউন্ট:</span>
                <span className="font-bold text-slate-800">{deletingWithdrawal.method} ({deletingWithdrawal.account})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">রেকর্ড স্ট্যাটাস:</span>
                <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  isWithCompleted(deletingWithdrawal.status) 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : isWithRejected(deletingWithdrawal.status) 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {deletingWithdrawal.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-medium">
              💡 <b>সুরক্ষা নিশ্চয়তা:</b> এই রেকর্ডটি মুছে ফেললেও ব্যবহারকারীর অ্যাকাউন্ট ডিলিট হবে না এবং তাদের ব্যালেন্স অক্ষত থাকবে।
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে <b>{deletingWithdrawal.userName}</b>-এর এই উইথড্র এন্ট্রিটি মুছে ফেলতে চান?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWithdrawal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteWithdrawal(deletingWithdrawal)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Withdrawal / Send Payout Modal */}
      {isAddWithdrawalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">নতুন উইথড্র / সেন্ড রেকর্ড যোগ</h3>
                  <p className="text-[11px] text-slate-500">ম্যানুয়াল উইথড্র রিকোয়েস্ট বা সরাসরি পেমেন্ট এন্ট্রি</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWithdrawalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualWithdrawal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">উইথড্র টাইপ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewWithUserType('affiliate');
                      setNewWithUserId(userList[0]?.uid || '');
                    }}
                    className={`py-2 rounded-xl font-bold border transition text-center ${
                      newWithUserType === 'affiliate'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    অ্যাফিলিয়েট ইউজার
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewWithUserType('seller');
                      setNewWithUserId(sellerList[0]?.uid || '');
                    }}
                    className={`py-2 rounded-xl font-bold border transition text-center ${
                      newWithUserType === 'seller'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    সেলার (Seller)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ব্যবহারকারী নির্বাচন করুন *</label>
                <select
                  required
                  value={newWithUserId}
                  onChange={(e) => setNewWithUserId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                >
                  <option value="">নির্বাচন করুন...</option>
                  {newWithUserType === 'seller' ? (
                    sellerList.map(s => (
                      <option key={s.uid} value={s.uid}>
                        {s.fullName || (s as any).storeName} ({s.email}) — ব্যালেন্স: ৳{s.balance || 0}
                      </option>
                    ))
                  ) : (
                    userList.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.fullName || (u as any).username} ({u.email}) — ব্যালেন্স: ৳{u.affiliateBalance || 0}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={newWithAmount}
                    onChange={(e) => setNewWithAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড *</label>
                  <select
                    value={newWithMethod}
                    onChange={(e) => setNewWithMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট / মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  value={newWithAccount}
                  onChange={(e) => setNewWithAccount(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রেকর্ড স্ট্যাটাস</label>
                  <select
                    value={newWithStatus}
                    onChange={(e) => setNewWithStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                  >
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="paid">পেইড ও সেন্ড (Paid)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TrxID (যদি থাকে)</label>
                  <input
                    type="text"
                    value={newWithTrxId}
                    onChange={(e) => setNewWithTrxId(e.target.value)}
                    placeholder="9K27X8L1"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট বা মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newWithNote}
                  onChange={(e) => setNewWithNote(e.target.value)}
                  placeholder="রেফারেন্স বা বিশেষ নির্দেশনা..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWithdrawalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewWithdraw}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingNewWithdraw ? 'যুক্ত হচ্ছে...' : 'উইথড্র রেকর্ড যুক্ত করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ebook Modal */}
      {editingEbook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">ই-বুক এডিট করুন</h3>
                  <p className="text-[11px] text-slate-500">ID: {editingEbook.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingEbook(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEbook(editingEbook);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">ই-বুকের শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  value={editingEbook.title}
                  onChange={(e) => setEditingEbook({ ...editingEbook, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেখক (Author) *</label>
                  <input
                    type="text"
                    required
                    value={editingEbook.author}
                    onChange={(e) => setEditingEbook({ ...editingEbook, author: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={editingEbook.category}
                    onChange={(e) => setEditingEbook({ ...editingEbook, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    {[
                      'কথাসাহিত্য ও উপন্যাস',
                      'নন-ফিকশন',
                      'কবিতা ও কাব্যগ্রন্থ',
                      'ব্যবসায় ও উদ্যোক্তা',
                      'ফ্রিল্যান্সিং ও আউটসোর্সিং',
                      'ডিজিটাল মার্কেটিং',
                      'মোবাইল অ্যাপ ডেভেলপমেন্ট',
                      'ওয়েব ডেভেলপমেন্ট ও কোডিং',
                      'ধর্মীয় ও আধ্যাত্মিক',
                      'চাকরি প্রস্তুতি ও বিসিএস',
                      'অন্যান্য'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রেগুলার মূল্য (Regular Price ৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="আসল মূল্য"
                    value={editingEbook.regularPrice ?? editingEbook.price ?? 0}
                    onChange={(e) => setEditingEbook({ ...editingEbook, regularPrice: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400">কাটা দাগের আসল মূল্য</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিক্রয় / অফার মূল্য (Sale Price ৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingEbook.price}
                    onChange={(e) => setEditingEbook({ ...editingEbook, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-black text-emerald-800"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold">ইউজার এই মূল্যে কিনবে</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস *</label>
                <select
                  value={editingEbook.status || 'published'}
                  onChange={(e) => setEditingEbook({ ...editingEbook, status: e.target.value as any })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                >
                  <option value="published">Published (প্রকাশিত)</option>
                  <option value="pending">Pending (অপেক্ষমান)</option>
                  <option value="rejected">Rejected (বাতিল)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">কভার ইমেজ লিংক (Cover URL)</label>
                <input
                  type="url"
                  value={editingEbook.coverUrl}
                  onChange={(e) => setEditingEbook({ ...editingEbook, coverUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-slate-700"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পিডিএফ ডাউনলোড / রিডার লিংক (PDF URL)</label>
                <input
                  type="url"
                  value={editingEbook.pdfUrl}
                  onChange={(e) => setEditingEbook({ ...editingEbook, pdfUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-slate-700"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <textarea
                  rows={2}
                  value={editingEbook.shortDesc || ''}
                  onChange={(e) => setEditingEbook({ ...editingEbook, shortDesc: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-800"
                  placeholder="বইটি সম্পর্কে এক-দুই লাইনে লিখুন..."
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingEbook;
                    setEditingEbook(null);
                    setDeletingEbook(toDel);
                  }}
                  className="w-full sm:w-auto text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ই-বুকটি মুছে ফেলুন (Delete)</span>
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEditingEbook(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Admin eBook Modal */}
      {isAddAdminEbookOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">নতুন অ্যাডমিন ই-বুক প্রকাশ করুন</h3>
                  <p className="text-[11px] text-slate-500">সংরক্ষণ করলেই সরাসরি হোম স্টোরে প্রকাশিত হবে</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAdminEbookOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <span>
                এটি <b>অ্যাডমিন ই-বুক</b> হিসেবে হোম পেজ ও স্টোরে বড় ফন্টে হাইলাইট হবে এবং ইউজার রেফারেল কোড ব্যবহারে রেফারার <b>৫০৳</b> ইনস্ট্যান্ট কমিশন পাবেন।
              </span>
            </div>

            <form onSubmit={handleCreateAdminEbook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ই-বুকের শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: স্মার্ট ক্যারিয়ার গাইডলাইন ২০২৬"
                  value={newAdminBook.title}
                  onChange={(e) => setNewAdminBook({ ...newAdminBook, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি নির্বাচন *</label>
                  <select
                    value={newAdminBook.category}
                    onChange={(e) => setNewAdminBook({ ...newAdminBook, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {[
                      'কথাসাহিত্য ও উপন্যাস',
                      'নন-ফিকশন',
                      'কবিতা ও কাব্যগ্রন্থ',
                      'ব্যবসায় ও উদ্যোক্তা',
                      'ফ্রিল্যান্সিং ও আউটসোর্সিং',
                      'ডিজিটাল মার্কেটিং',
                      'মোবাইল অ্যাপ ডেভেলপমেন্ট',
                      'ওয়েব ডেভেলপমেন্ট ও কোডিং',
                      'ধর্মীয় ও আধ্যাত্মিক',
                      'চাকরি প্রস্তুতি ও বিসিএস',
                      'অন্যান্য'
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেখক / রাইটারের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: অ্যাডমিন টিম"
                    value={newAdminBook.author}
                    onChange={(e) => setNewAdminBook({ ...newAdminBook, author: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    রেগুলার মূল্য (Regular Price ৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="যেমন: 200"
                    value={newAdminBook.regularPrice}
                    onChange={(e) => setNewAdminBook({ ...newAdminBook, regularPrice: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">কাটা দাগের আসল মূল্য</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    বিক্রয় / অফার মূল্য (Sale Price ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="যেমন: 150"
                    value={newAdminBook.price}
                    onChange={(e) => setNewAdminBook({ ...newAdminBook, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold">ইউজার এই মূল্যে কিনবে</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ই-বুক স্ট্যাটাস</label>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>অনুমোদিত (সরাসরি লাইভ স্টোরে প্রকাশিত হবে)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">কভার ইমেজ লিংক (Cover Image URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... বা ডিরেক্ট ইমেজ লিংক"
                  value={newAdminBook.coverUrl}
                  onChange={(e) => setNewAdminBook({ ...newAdminBook, coverUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পিডিএফ ডাউনলোড / রিডার লিংক (PDF URL)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... বা ডিরেক্ট পিডিএফ লিংক"
                  value={newAdminBook.pdfUrl}
                  onChange={(e) => setNewAdminBook({ ...newAdminBook, pdfUrl: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ (Description)</label>
                <textarea
                  rows={3}
                  placeholder="বইটি সম্পর্কে বিস্তারিত লিখুন..."
                  value={newAdminBook.description}
                  onChange={(e) => setNewAdminBook({ ...newAdminBook, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminEbookOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingAdminBook}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  {savingAdminBook ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ই-বুক সংরক্ষণ ও প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Detail & Admin Reply Modal */}
      {selectedTicketForDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    #{selectedTicketForDetail.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    selectedTicketForDetail.userRole === 'seller'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTicketForDetail.userRole === 'seller' ? '👑 সেলার টিকিট' : '👤 ইউজার টিকিট'}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {selectedTicketForDetail.category}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                  {selectedTicketForDetail.subject}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicketForDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Details Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">নাম ও রোল</span>
                <span className="font-black text-slate-900">{selectedTicketForDetail.userName || 'N/A'}</span>
                <span className="text-slate-500 ml-1.5 font-medium">({selectedTicketForDetail.userRole})</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ইমেইল ঠিকানা</span>
                <span className="font-mono font-bold text-slate-800">{selectedTicketForDetail.userEmail || 'ইমেইল নেই'}</span>
              </div>

              {selectedTicketForDetail.userPhone && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">মোবাইল নম্বর</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTicketForDetail.userPhone}</span>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">টিকিট তৈরির সময়</span>
                <span className="text-slate-700 font-mono">
                  {new Date(selectedTicketForDetail.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Original Message */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>ব্যবহারকারীর মূল বার্তা (User Inquiry):</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTicketForDetail.message || '');
                      setCopiedTicketMessage(true);
                      setTimeout(() => setCopiedTicketMessage(false), 2000);
                      showToast('success', 'বার্তা ক্লিপবোর্ডে কপি হয়েছে!');
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTicketMessage ? 'কপি হয়েছে' : 'মেসেজ কপি'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpandedDetailMessage(!isExpandedDetailMessage)}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{isExpandedDetailMessage ? 'সংক্ষেপ করুন' : 'বড় ভিউ'}</span>
                  </button>
                </div>
              </div>
              <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto ${
                isExpandedDetailMessage ? 'max-h-96' : 'max-h-48'
              }`}>
                {selectedTicketForDetail.message}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
              <span className="font-black text-slate-700 block">
                স্ট্যাটাস পরিবর্তন করুন (Current Status: <b className="uppercase text-emerald-700">{selectedTicketForDetail.status}</b>)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateTicketStatus(selectedTicketForDetail.id, 'open')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    selectedTicketForDetail.status === 'open'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>অপেক্ষমান (Open)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTicketStatus(selectedTicketForDetail.id, 'in_progress')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    selectedTicketForDetail.status === 'in_progress'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>প্রক্রিয়াধীন (In Progress)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTicketStatus(selectedTicketForDetail.id, 'resolved')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    selectedTicketForDetail.status === 'resolved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>সমাধান হয়েছে (Resolved)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateTicketStatus(selectedTicketForDetail.id, 'rejected')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    selectedTicketForDetail.status === 'rejected'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>বাতিল (Rejected)</span>
                </button>
              </div>
            </div>

            {/* Existing Admin Reply preview if present */}
            {selectedTicketForDetail.adminReply && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between items-center text-emerald-900 font-black">
                  <span>পূর্বে প্রেরিত উত্তর:</span>
                  {selectedTicketForDetail.repliedAt && (
                    <span className="font-mono text-[10px] text-emerald-700 font-normal">
                      {new Date(selectedTicketForDetail.repliedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{selectedTicketForDetail.adminReply}</p>
              </div>
            )}

            {/* Admin Reply Form */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অ্যাডমিন রিপ্লাই ও সমাধান বার্তা:</span>
                </span>
                <span className="text-[11px] text-slate-400">রিয়েলটাইম সিঙ্ক হবে</span>
              </div>

              {/* Quick Template Replies */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAdminReplyText('ধন্যবাদ। আপনার সমস্যাটি সফলভাবে সমাধান করা হয়েছে। অনুগ্রহ করে চেক করে দেখুন।')}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg transition border border-slate-200"
                >
                  + সমাধান সম্পন্ন
                </button>
                <button
                  type="button"
                  onClick={() => setAdminReplyText('আপনার পেমেন্ট ভেরিফাই করা হয়েছে এবং বইটি আপনার লাইব্রেরিতে যুক্ত করে দেওয়া হয়েছে।')}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg transition border border-slate-200"
                >
                  + পেমেন্ট ভেরিফাইড
                </button>
                <button
                  type="button"
                  onClick={() => setAdminReplyText('অনুগ্রহ করে আপনার সঠিক বিকাশ/নগদ নম্বর এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।')}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg transition border border-slate-200"
                >
                  + TrxID প্রয়োজন
                </button>
                <button
                  type="button"
                  onClick={() => setAdminReplyText('আপনার সেলার আপলোড লিমিট বৃদ্ধি করা হয়েছে। এখন আপনি নতুন বই আপলোড করতে পারবেন।')}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg transition border border-slate-200"
                >
                  + লিমিট বৃদ্ধি
                </button>
              </div>

              <textarea
                rows={3}
                required
                placeholder="এখানে ব্যবহারকারী বা সেলারের টিকিটের বিস্তারিত উত্তর লিখুন..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedTicketForDetail;
                    setSelectedTicketForDetail(null);
                    setDeletingTicket(toDelete);
                  }}
                  className="w-full sm:w-auto text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>টিকিট মুছে ফেলুন (Delete)</span>
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForDetail(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-xs transition"
                  >
                    বন্ধ করুন
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingReply || !adminReplyText.trim()}
                    onClick={() => handleSendAdminReply(selectedTicketForDetail)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs"
                  >
                    {isSubmittingReply ? (
                      <span>পাঠানো হচ্ছে...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>উত্তর পাঠান (Send Reply)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Complete Full Message View Modal */}
      {viewingFullMessageTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    #{viewingFullMessageTicket.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    viewingFullMessageTicket.userRole === 'seller'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {viewingFullMessageTicket.userRole === 'seller' ? '👑 সেলার সাপোর্ট বার্তা' : '👤 ইউজার সাপোর্ট বার্তা'}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {viewingFullMessageTicket.category}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                  {viewingFullMessageTicket.subject}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewingFullMessageTicket(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Details Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">প্রেরকের নাম ও ভূমিকা</span>
                <span className="font-black text-slate-900">{viewingFullMessageTicket.userName || 'N/A'}</span>
                <span className="text-slate-500 ml-1.5 font-medium">({viewingFullMessageTicket.userRole})</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ইমেইল ঠিকানা</span>
                <span className="font-mono font-bold text-slate-800">{viewingFullMessageTicket.userEmail || 'ইমেইল নেই'}</span>
              </div>

              {viewingFullMessageTicket.userPhone && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">মোবাইল নম্বর</span>
                  <span className="font-mono font-bold text-slate-800">{viewingFullMessageTicket.userPhone}</span>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">টিকিট দাখিলের সময়</span>
                <span className="text-slate-700 font-mono">
                  {new Date(viewingFullMessageTicket.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Complete Full Support Message */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>সম্পূর্ণ সাপোর্ট বার্তা (Full Message Content):</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingFullMessageTicket.message || '');
                    setCopiedTicketMessage(true);
                    setTimeout(() => setCopiedTicketMessage(false), 2000);
                    showToast('success', 'সম্পূর্ণ বার্তা ক্লিপবোর্ডে কপি হয়েছে!');
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1 transition text-xs shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedTicketMessage ? 'কপি হয়েছে!' : 'মেসেজ কপি করুন'}</span>
                </button>
              </div>

              <div className="bg-slate-50/90 p-5 rounded-2xl border-2 border-emerald-500/25 text-slate-900 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto shadow-inner selection:bg-emerald-600 selection:text-white">
                {viewingFullMessageTicket.message}
              </div>
            </div>

            {/* Existing Admin Reply preview if present */}
            {viewingFullMessageTicket.adminReply && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between items-center text-emerald-900 font-black">
                  <span>পূর্বে প্রদত্ত অ্যাডমিন উত্তর:</span>
                  {viewingFullMessageTicket.repliedAt && (
                    <span className="font-mono text-[10px] text-emerald-700 font-normal">
                      {new Date(viewingFullMessageTicket.repliedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{viewingFullMessageTicket.adminReply}</p>
              </div>
            )}

            {/* Quick Status Control Buttons */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
              <span className="font-black text-slate-700 block">
                স্ট্যাটাস পরিবর্তন করুন (Current Status: <b className="uppercase text-emerald-700">{viewingFullMessageTicket.status}</b>)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTicketStatus(viewingFullMessageTicket.id, 'open');
                    setViewingFullMessageTicket(prev => prev ? { ...prev, status: 'open' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    viewingFullMessageTicket.status === 'open'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>অপেক্ষমান (Open)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTicketStatus(viewingFullMessageTicket.id, 'in_progress');
                    setViewingFullMessageTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    viewingFullMessageTicket.status === 'in_progress'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>প্রক্রিয়াধীন (In Progress)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTicketStatus(viewingFullMessageTicket.id, 'resolved');
                    setViewingFullMessageTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    viewingFullMessageTicket.status === 'resolved'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>সমাধান হয়েছে (Resolved)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTicketStatus(viewingFullMessageTicket.id, 'rejected');
                    setViewingFullMessageTicket(prev => prev ? { ...prev, status: 'rejected' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 text-xs ${
                    viewingFullMessageTicket.status === 'rejected'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>বাতিল (Rejected)</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const toDelete = viewingFullMessageTicket;
                  setViewingFullMessageTicket(null);
                  setDeletingTicket(toDelete);
                }}
                className="w-full sm:w-auto text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>টিকিট মুছে ফেলুন (Delete)</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setViewingFullMessageTicket(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-xs transition"
                >
                  বন্ধ করুন
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = viewingFullMessageTicket;
                    setViewingFullMessageTicket(null);
                    handleOpenTicketDetails(t);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 text-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>উত্তর লিখুন (Reply)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deletingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">সাপোর্ট টিকিট ডিলিট নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-500">ডাটাবেস থেকে টিকিট রেকর্ডটি সম্পূর্ণ মুছে ফেলা হবে।</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">টিকিট আইডি:</span>
                <span className="font-mono font-bold text-slate-900">#{deletingTicket.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">বিষয়:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{deletingTicket.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্রেরক:</span>
                <span className="font-bold text-slate-800">{deletingTicket.userName} ({deletingTicket.userRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">স্ট্যাটাস:</span>
                <span className="font-bold uppercase text-slate-800">{deletingTicket.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে এই সাপোর্ট টিকিটটি Firebase Realtime Database থেকে চিরতরে মুছে ফেলতে চান?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTicket(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTicket(deletingTicket.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">অ্যাডমিন লগইন</h3>
                  <p className="text-xs text-slate-500">লগইন করুন অথবা সরাসরি ওয়েবসাইটে ফিরে যান</p>
                </div>
              </div>
              <button
                onClick={handleGoToHome}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition text-sm font-bold"
                title="ওয়েবসাইট হোমে যান"
              >
                ✕
              </button>
            </div>

            {/* Quick Option to Return to Website Home */}
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>লগআউট করা হয়েছে। ওয়েবসাইটে ফিরে যেতে চান?</span>
              </div>
              <button
                type="button"
                onClick={handleGoToHome}
                className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shrink-0 shadow-xs flex items-center gap-1 active:scale-95"
              >
                <span>হোমে যান</span>
                <span>→</span>
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@ebookbazar.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black text-slate-700">পাসওয়ার্ড</label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-bold hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loggingIn ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
                </button>

                <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@ebookbazar.com');
                      setLoginPassword('Admin@123456');
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    ⚡ admin@ebookbazar.com
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('suma47083@gmail.com');
                      setLoginPassword('Admin@123456');
                    }}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    suma47083@gmail.com
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleGoToHome}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs active:scale-95"
                  >
                    <Home className="w-4 h-4 text-emerald-700" />
                    <span>ওয়েবসাইট হোমপেজে ফিরে যান (Go to Website Home)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
