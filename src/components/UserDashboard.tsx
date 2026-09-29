import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  ShoppingBag, 
  Wallet, 
  Bell, 
  Copy, 
  Check, 
  Share2, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  LogOut,
  Edit2,
  Sparkles,
  X,
  ArrowUpRight,
  CheckCircle,
  CreditCard,
  Smartphone,
  Send,
  Building,
  LifeBuoy,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, ref, onValue, push, set, update } from '../firebase';
import { Ebook, Order, WithdrawalRequest, NotificationItem, AffiliateTransaction } from '../types';
import { INITIAL_EBOOKS } from '../data/initialEbooks';
import { SupportTicketSection } from './SupportTicketSection';

interface UserDashboardProps {
  onOpenReader: (url: string, title: string) => void;
  onNavigateHome: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onOpenReader, onNavigateHome }) => {
  const { currentUser, userProfile, updateProfileData, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'orders' | 'wallet' | 'profile' | 'tickets'>('library');
  const [unreadTicketCount, setUnreadTicketCount] = useState<number>(0);
  
  // Data states
  const [libraryEbooks, setLibraryEbooks] = useState<Ebook[]>(!currentUser ? INITIAL_EBOOKS.slice(0, 2) : []);
  const [userOrders, setUserOrders] = useState<Order[]>(!currentUser ? [
    {
      id: 'ORD-DEMO-001',
      orderId: 'ORD-001',
      buyerId: 'demo-user',
      buyerName: 'ডেমো ব্যবহারকারী',
      buyerEmail: 'user.demo@gmail.com',
      bookId: 'bk-1',
      bookTitle: 'কম্পিউটার প্রোগ্রামিং ১ম খণ্ড (তামিম শাহরিয়ার সুবিন)',
      amount: 120,
      paymentMethod: 'bKash',
      paymentMobile: '01712345678',
      trxId: 'TRX9A8B7C6D',
      status: 'approved',
      createdAt: Date.now() - 86400000
    },
    {
      id: 'ORD-DEMO-002',
      orderId: 'ORD-002',
      buyerId: 'demo-user',
      buyerName: 'ডেমো ব্যবহারকারী',
      buyerEmail: 'user.demo@gmail.com',
      bookId: 'bk-2',
      bookTitle: 'পাইথন দিয়ে প্রোগ্রামিং শেখা',
      amount: 150,
      paymentMethod: 'Nagad',
      paymentMobile: '01812345678',
      trxId: 'TRX4E5F6G7H',
      status: 'pending',
      createdAt: Date.now() - 3600000
    }
  ] : []);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [copiedRef, setCopiedRef] = useState(false);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.fullName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editCountry, setEditCountry] = useState(userProfile?.country || 'Bangladesh');
  const [editAddress, setEditAddress] = useState(userProfile?.address || '');

  // Withdrawal form states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Bank' | 'Other'>('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');
  const [myAffiliateTransactions, setMyAffiliateTransactions] = useState<AffiliateTransaction[]>([]);
  const [referredUsers, setReferredUsers] = useState<Array<{ uid: string; fullName: string; email: string; createdAt?: number }>>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // User withdrawal charge is 0 Tk (Free for users)
  const WITHDRAW_CHARGE = 0;
  const MIN_WITHDRAW = 50;

  // Sync profile edits when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.fullName || '');
      setEditPhone(userProfile.phone || '');
      setEditCountry(userProfile.country || 'Bangladesh');
      setEditAddress(userProfile.address || '');

      // Pre-fill withdrawal mobile number/account if not already typed
      if (!withdrawAccount) {
        if (userProfile.paymentMobile) {
          setWithdrawAccount(userProfile.paymentMobile);
        } else if (userProfile.phone) {
          setWithdrawAccount(userProfile.phone);
        }
      }
      if (userProfile.paymentMethod && (userProfile.paymentMethod === 'bKash' || userProfile.paymentMethod === 'Nagad')) {
        setWithdrawMethod(userProfile.paymentMethod);
      }
    }
  }, [userProfile]);

  // Load Purchased Ebooks from libraries/${uid} and Orders
  useEffect(() => {
    if (!currentUser) return;

    const libRef = ref(db, `libraries/${currentUser.uid}`);
    const unsubLib = onValue(libRef, (snap) => {
      if (snap.exists()) {
        const libData = snap.val();
        const bookIds = Object.keys(libData);
        const booksMap = new Map<string, Ebook>();

        // Pre-fill with INITIAL_EBOOKS or library node metadata
        bookIds.forEach((bid) => {
          const initMatch = INITIAL_EBOOKS.find(b => b.id === bid);
          const item = libData[bid] || {};
          booksMap.set(bid, {
            id: bid,
            title: item.bookTitle || initMatch?.title || 'ই-বুক',
            author: item.author || initMatch?.author || 'লেখক',
            category: item.category || initMatch?.category || 'অন্যান্য',
            price: initMatch?.price || 0,
            pdfUrl: item.pdfUrl || initMatch?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            coverUrl: item.coverUrl || initMatch?.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop',
            shortDesc: initMatch?.shortDesc || 'অনুমোদিত ই-বুক',
            description: initMatch?.description || 'অনুমোদিত ই-বুক',
            sellerId: initMatch?.sellerId || item.sellerId || 'ADMIN',
            status: 'published',
            createdAt: initMatch?.createdAt || item.approvedAt || Date.now()
          });
        });

        // Also fetch from ebooks node to get latest real-time updates
        const promises = bookIds.map((bid) => {
          return new Promise<void>((resolve) => {
            onValue(ref(db, `ebooks/${bid}`), (bSnap) => {
              if (bSnap.exists()) {
                const existing = booksMap.get(bid);
                booksMap.set(bid, { ...existing, ...bSnap.val(), id: bid });
              }
              resolve();
            }, { onlyOnce: true });
          });
        });

        Promise.all(promises).then(() => {
          setLibraryEbooks(Array.from(booksMap.values()));
        });
      } else {
        setLibraryEbooks([]);
      }
    });

    // Load Orders in real-time
    const ordersRef = ref(db, 'orders');
    const unsubOrders = onValue(ordersRef, (snap) => {
      if (snap.exists()) {
        const all: Order[] = [];
        snap.forEach((ch) => {
          const o = ch.val() as Order;
          if (!o || typeof o !== 'object') return;
          const isMyOrder = 
            o.buyerId === currentUser.uid ||
            Boolean(currentUser.email && o.buyerEmail && typeof o.buyerEmail === 'string' && o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase());
          
          if (isMyOrder) {
            all.push({ ...o, id: ch.key as string });
          }
        });
        all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setUserOrders(all);

        // Immediate cross-sync: If any order is approved, ensure its book appears in library
        const approvedOrders = all.filter(o => o.status === 'approved');
        if (approvedOrders.length > 0) {
          setLibraryEbooks(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newBooks = [...prev];
            approvedOrders.forEach(o => {
              if (!existingIds.has(o.bookId)) {
                const initMatch = INITIAL_EBOOKS.find(b => b.id === o.bookId);
                newBooks.push({
                  id: o.bookId,
                  title: o.bookTitle || initMatch?.title || 'ই-বুক',
                  author: initMatch?.author || 'লেখক',
                  category: initMatch?.category || 'অন্যান্য',
                  price: o.amount || 0,
                  pdfUrl: initMatch?.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  coverUrl: initMatch?.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop',
                  shortDesc: initMatch?.shortDesc || 'অনুমোদিত ই-বুক',
                  description: initMatch?.description || 'অনুমোদিত ই-বুক',
                  sellerId: o.sellerId || initMatch?.sellerId || 'ADMIN',
                  status: 'published',
                  createdAt: o.createdAt || Date.now()
                });
                existingIds.add(o.bookId);
              }
            });
            return newBooks;
          });
        }
      } else {
        setUserOrders([]);
      }
    });

    // Load Withdrawals from both withdrawals and withdrawRequests
    const mapWith = new Map<string, WithdrawalRequest>();
    const unsubWith = onValue(ref(db, 'withdrawals'), (snap) => {
      if (snap.exists()) {
        snap.forEach((ch) => {
          const w = ch.val() as WithdrawalRequest;
          if (w && (w.uid === currentUser.uid || w.userId === currentUser.uid)) {
            const key = w.id || w.requestId || w.reqId || ch.key;
            mapWith.set(key, { ...w, id: ch.key as string });
          }
        });
        setWithdrawals(Array.from(mapWith.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      }
    });

    const unsubWithReqs = onValue(ref(db, 'withdrawRequests'), (snap) => {
      if (snap.exists()) {
        snap.forEach((ch) => {
          const w = ch.val() as WithdrawalRequest;
          if (w && (w.uid === currentUser.uid || w.userId === currentUser.uid)) {
            const key = w.id || w.requestId || w.reqId || ch.key;
            const existing = mapWith.get(key);
            mapWith.set(key, { ...existing, ...w, id: ch.key as string });
          }
        });
        setWithdrawals(Array.from(mapWith.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      }
    });

    // Load Affiliate Transactions for this user
    const unsubAff = onValue(ref(db, 'affiliateTransactions'), (snap) => {
      if (snap.exists()) {
        const myTxs: AffiliateTransaction[] = [];
        snap.forEach((ch) => {
          const val = ch.val() as AffiliateTransaction;
          if (val && val.referrerUserId === currentUser.uid) {
            myTxs.push({ ...val, id: ch.key as string });
          }
        });
        myTxs.sort((a, b) => (b.approvedAt || b.createdAt || 0) - (a.approvedAt || a.createdAt || 0));
        setMyAffiliateTransactions(myTxs);
      } else {
        setMyAffiliateTransactions([]);
      }
    });

    // Load users who registered using this user's referral code
    const unsubUsers = onValue(ref(db, 'users'), (snap) => {
      if (snap.exists() && userProfile?.referralCode) {
        const myCode = userProfile.referralCode.trim().toUpperCase();
        const list: Array<{ uid: string; fullName: string; email: string; createdAt?: number }> = [];
        snap.forEach((ch) => {
          const u = ch.val();
          if (u && (u.referredBy || '').trim().toUpperCase() === myCode && ch.key !== currentUser.uid) {
            list.push({
              uid: ch.key as string,
              fullName: u.fullName || 'User',
              email: u.email || '',
              createdAt: u.createdAt || 0
            });
          }
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setReferredUsers(list);
      } else {
        setReferredUsers([]);
      }
    });

    // Load Support Tickets unread replies count
    const unsubTickets = onValue(ref(db, 'supportTickets'), (snap) => {
      if (snap.exists()) {
        let count = 0;
        snap.forEach((ch) => {
          const val = ch.val();
          if (val && val.userId === currentUser.uid && val.unreadByUser) {
            count++;
          }
        });
        setUnreadTicketCount(count);
      } else {
        setUnreadTicketCount(0);
      }
    });

    return () => {
      unsubLib();
      unsubOrders();
      unsubWith();
      unsubWithReqs();
      unsubAff();
      unsubUsers();
      unsubTickets();
    };
  }, [currentUser, userProfile?.referralCode]);

  const handleCopyReferral = () => {
    if (!userProfile?.referralCode) return;
    navigator.clipboard.writeText(userProfile.referralCode).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileData({
        fullName: editName.trim(),
        phone: editPhone.trim(),
        country: editCountry.trim(),
        address: editAddress.trim()
      });
      setIsEditing(false);
      alert('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।');
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawErrorMsg('');
    setWithdrawSuccessMsg('');

    if (!currentUser || !userProfile) {
      setWithdrawErrorMsg('উইথড্র রিকোয়েস্ট করতে অনুগ্রহ করে লগইন করুন।');
      return;
    }

    const currentBal = Number(userProfile.affiliateBalance) || 0;
    if (withdrawAmount < MIN_WITHDRAW) {
      setWithdrawErrorMsg(`সর্বনিম্ন উত্তোলনের পরিমাণ ৳${MIN_WITHDRAW}।`);
      return;
    }

    if (withdrawAmount > currentBal) {
      setWithdrawErrorMsg(`আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${currentBal}`);
      return;
    }

    if (!withdrawAccount || withdrawAccount.trim().length < 5) {
      setWithdrawErrorMsg('অনুগ্রহ করে সঠিক অ্যাকাউন্ট বা মোবাইল নম্বর দিন (কমপক্ষে ৫ অক্ষর)।');
      return;
    }

    setWithdrawing(true);
    try {
      const netAmount = withdrawAmount; // User withdraw charge is 0
      const reqRef = ref(db, 'withdrawRequests');
      const newKey = push(reqRef).key || `WTH-${Date.now()}`;
      const uniqueReqId = `WTH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Transactional balance logic: balance is moved to pending withdrawal without permanent deletion
      const newAvailable = Math.max(0, currentBal - withdrawAmount);
      const newPending = (Number(userProfile.pendingWithdrawal) || 0) + withdrawAmount;

      const withdrawData: Record<string, any> = {
        id: newKey,
        requestId: uniqueReqId,
        reqId: uniqueReqId,
        uid: currentUser.uid,
        userId: currentUser.uid,
        userName: userProfile.fullName || currentUser.displayName || 'সম্মানিত ইউজার',
        email: currentUser.email || '',
        userEmail: currentUser.email || '',
        amount: withdrawAmount,
        charge: 0,
        netAmount,
        method: withdrawMethod,
        paymentMethod: withdrawMethod,
        account: withdrawAccount.trim(),
        paymentAccount: withdrawAccount.trim(),
        note: withdrawNote.trim() || '',
        type: 'affiliate',
        status: 'pending',
        createdAt: Date.now(),
        adminNote: ''
      };

      // Ensure no undefined property exists before saving to Firebase Realtime Database
      const sanitizedData = Object.fromEntries(
        Object.entries(withdrawData).filter(([_, v]) => v !== undefined)
      );

      // 1. Write request to withdrawRequests
      await set(ref(db, `withdrawRequests/${newKey}`), sanitizedData);
      
      // 2. Also sync to withdrawals node for complete backwards compatibility
      await set(ref(db, `withdrawals/${newKey}`), sanitizedData);

      // 3. Atomically update user's available affiliate balance and pending withdrawal
      await update(ref(db, `users/${currentUser.uid}`), {
        affiliateBalance: newAvailable,
        pendingWithdrawal: newPending
      });

      // 4. Update in AuthContext
      await updateProfileData({
        affiliateBalance: newAvailable,
        pendingWithdrawal: newPending
      });

      setWithdrawing(false);
      setIsWithdrawModalOpen(false);
      setWithdrawNote('');
      setWithdrawSuccessMsg(`উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে! ৳${withdrawAmount} পেন্ডিং উত্তোলনে রাখা হয়েছে (ফি ৳০)। অ্যাডমিন ভেরিফাই করে পেমেন্ট পাঠিয়ে দিবেন।`);
    } catch (err: any) {
      setWithdrawing(false);
      setWithdrawErrorMsg('উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onNavigateHome();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Quick Navigation Bar with Home & Logout */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-xs sm:text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-300 shadow-xs group"
          title="eBookBazar হোম পেজে ফিরে যান"
        >
          <Home className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
          <span>← হোমে ফিরে যান (Home)</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            eBookBazar ইউজার ড্যাশবোর্ড
          </span>
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              title="লগআউট করে সরাসরি হোম পেজে যান"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          )}
        </div>
      </div>
      {/* Preview Notice if not logged in */}
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs md:text-sm">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-black">আপনি ইউজার ড্যাশবোর্ড প্রিভিউ করছেন:</span>{' '}
              <span className="text-slate-600">লাইব্রেরি, পিডিএফ রিডার, অর্ডার ট্র্যাকিং ও ফ্রি উইথড্র ওয়ালেট সরাসরি কাজ করছে।</span>
            </div>
          </div>
          <button
            onClick={() => login('user.demo@gmail.com', '12345678')}
            className="bg-[#15803d] hover:bg-emerald-800 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow transition shrink-0"
          >
            ১-ক্লিকে টেস্ট ইউজার সাইন ইন
          </button>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 text-2xl font-black shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black">
                  {userProfile?.fullName || 'User Profile'}
                </h1>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {userProfile?.role === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 font-mono">
                {currentUser?.email}
              </p>
              <p className="text-xs text-emerald-300 mt-1">
                মোবাইল: {userProfile?.phone || 'যোগ করা হয়নি'} | জেলা: {userProfile?.address || userProfile?.country || 'বাংলাদেশ'}
              </p>
            </div>
          </div>

          {/* Permanent Referral Code Box */}
          <div className="bg-emerald-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-600/60 w-full md:w-auto min-w-[280px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                স্থায়ী রেফারেল কোড
              </span>
              <span className="text-[10px] font-bold text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded-full">
                রেফারকৃত: {referredUsers.length} জন
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xl font-mono font-black tracking-widest text-white">
                {userProfile?.referralCode || 'EBK00000'}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-sm"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'কপি হয়েছে' : 'কোড কপি'}</span>
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-700/60 flex items-center justify-between gap-2 text-[10px]">
              <span className="text-emerald-200">
                রেফারার: <b className="text-white font-mono">{userProfile?.referredBy ? userProfile.referredBy : 'সরাসরি (Direct)'}</b>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!userProfile?.referralCode) return;
                  const link = `${window.location.origin}/?ref=${userProfile.referralCode}`;
                  navigator.clipboard.writeText(link);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-amber-300 hover:text-amber-200 font-bold underline"
              >
                {copiedLink ? 'লিংক কপি হয়েছে!' : 'রেফারেল লিংক কপি'}
              </button>
            </div>
            <p className="text-[10px] text-emerald-200 mt-1">
              বন্ধু আপনার রেফারেল কোড দিয়ে অ্যাডমিন ই-বুক কিনলে অর্ডার অনুমোদনের পর সাথে সাথে ৫০৳ অ্যাফিলিয়েট কমিশন যোগ হবে!
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'library'
              ? 'bg-[#15803d] text-white shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>আমার লাইব্রেরি ({libraryEbooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'orders'
              ? 'bg-[#15803d] text-white shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>আমার অর্ডারসমূহ ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'wallet'
              ? 'bg-[#15803d] text-white shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>অ্যাফিলিয়েট ওয়ালেট ও উইথড্র</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm relative ${
            activeTab === 'tickets'
              ? 'bg-[#15803d] text-white shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>সাপোর্ট টিকিট</span>
          {unreadTicketCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {unreadTicketCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'profile'
              ? 'bg-[#15803d] text-white shadow-emerald-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>প্রোফাইল তথ্য</span>
        </button>
      </div>

      {/* TAB 1: PURCHASED EBOOK LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-black text-slate-900 text-base">অনুমোদিত ই-বুক লাইব্রেরি</h3>
              <p className="text-xs text-slate-500">আপনার ক্রয়কৃত অনুমোদিত বইগুলো সরাসরি পড়ুন ও ডাউনলোড করুন</p>
            </div>
            <button
              onClick={onNavigateHome}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition"
            >
              + নতুন বই খুঁজুন
            </button>
          </div>

          {libraryEbooks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto stroke-[1.2]" />
              <h4 className="text-slate-800 font-black text-base">আপনার লাইব্রেরিতে এখনও কোনো অনুমোদিত বই নেই</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                মার্কেটপ্লেস থেকে বই অর্ডার করুন। অ্যাডমিন পেমেন্ট যাচাই করে অনুমোদন দিলে বইটি স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।
              </p>
              <button
                onClick={onNavigateHome}
                className="bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow hover:bg-emerald-800 transition"
              >
                মার্কেটপ্লেস দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryEbooks.map((b) => (
                <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="flex gap-3">
                    <img 
                      src={b.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'} 
                      alt={b.title} 
                      className="w-16 h-22 object-cover rounded-xl bg-slate-100 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded">
                        {b.category}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug line-clamp-2">
                        {b.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">লেখক: {b.author}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {b.pdfUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenReader(b.pdfUrl, b.title)}
                          className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>অনলাইনে পড়ুন</span>
                        </button>
                        <a
                          href={b.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center block"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF ডাউনলোড করুন</span>
                        </a>
                      </>
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-1 font-bold">PDF লিংক প্রক্রিয়াধীন</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
            আপনার সকল অর্ডারের তালিকা
          </h3>

          {userOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">আপনি এখনও কোনো অর্ডার সাবমিট করেননি।</p>
          ) : (
            <div className="space-y-3">
              {userOrders.map((o) => (
                <div 
                  key={o.id} 
                  className={`p-4 rounded-2xl bg-white border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs transition shadow-sm ${
                    o.status === 'approved' 
                      ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20' 
                      : o.status === 'rejected' 
                      ? 'border-rose-200 bg-rose-50/20' 
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">{o.orderId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        o.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : o.status === 'rejected' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {o.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {o.status === 'pending' && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                        {o.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{o.status === 'approved' ? 'Approved (অনুমোদিত)' : o.status === 'rejected' ? 'Rejected (বাতিল)' : 'Pending (অপেক্ষমান)'}</span>
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm leading-snug">{o.bookTitle}</h4>
                    <p className="text-slate-600 text-xs">
                      পেমেন্ট মেথড: <span className="font-bold text-slate-800">{o.paymentMethod}</span> ({o.paymentMobile}) | TrxID: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{o.trxId}</span>
                    </p>

                    {o.status === 'approved' ? (
                      <p className="text-emerald-700 text-[11px] font-bold flex items-center gap-1.5 mt-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>অর্ডারটি অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে। বইটি এখন আপনার লাইব্রেরিতে উন্মুক্ত!</span>
                      </p>
                    ) : o.status === 'pending' ? (
                      <p className="text-amber-800 text-[11px] font-medium flex items-center gap-1.5 mt-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>অ্যাডমিন পেমেন্ট TrxID যাচাই করছেন। অনুমোদন হলেই স্ট্যাটাস 'Approved' দেখাবে এবং লাইব্রেরিতে যুক্ত হবে।</span>
                      </p>
                    ) : (
                      <p className="text-rose-700 text-[11px] font-medium flex items-center gap-1.5 mt-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>অর্ডারটি বাতিল করা হয়েছে। {o.rejectReason ? `কারণ: ${o.rejectReason}` : ''}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-0 pt-2 md:pt-0 border-slate-200 gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-700">৳{o.amount}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    {o.status === 'approved' && (
                      <button
                        onClick={() => {
                          setActiveTab('library');
                          const matched = libraryEbooks.find(b => b.id === o.bookId);
                          if (matched && matched.pdfUrl) {
                            onOpenReader(matched.pdfUrl, matched.title);
                          }
                        }}
                        className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>লাইব্রেরিতে পড়ুন</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WALLET & WITHDRAW (RULE 6, 9, 10, 11) */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Header Bar with Action Button */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-700" />
                <span>অ্যাফিলিয়েট রেফারেল ও ওয়ালেট</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার রেফারেল কমিশন ও ব্যালেন্স হিস্ট্রি। উইথড্র ফি ৳০ (সম্পূর্ণ ফ্রি)।
              </p>
            </div>
            
            {/* Withdraw Request Button (Rule 9) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('withdraw-form-card');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  const input = el.querySelector('input');
                  if (input) input.focus();
                } else {
                  setIsWithdrawModalOpen(true);
                }
              }}
              className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-900/10 hover:shadow-xl transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Request (উত্তোলন অনুরোধ)</span>
            </button>
          </div>

          {/* Balance Cards (Rule 6) */}
          {(() => {
            const availableBal = Number(userProfile?.affiliateBalance) || 0;
            const pendingWith = withdrawals
              .filter(w => (w.status || '').toLowerCase() === 'pending')
              .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
            const paidWith = withdrawals
              .filter(w => (w.status || '').toLowerCase() === 'paid' || (w.status || '').toLowerCase() === 'approved')
              .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
            const approvedComm = myAffiliateTransactions
              .filter(t => t.status === 'APPROVED')
              .reduce((sum, t) => sum + (Number(t.commissionAmount) || 50), 0);
            const totalComm = Math.max(approvedComm, Number(userProfile?.totalEarnings) || 0);

            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">উত্তোলনযোগ্য ব্যালেন্স</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">৳{availableBal.toFixed(2)}</p>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Available Balance</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">মোট কমিশন</span>
                  <p className="text-xl font-black text-amber-600 mt-1">৳{totalComm.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Total Commission</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">অনুমোদিত কমিশন</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">৳{approvedComm.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Approved Commission</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">পেন্ডিং কমিশন</span>
                  <p className="text-xl font-black text-slate-500 mt-1">৳0.00</p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Pending Commission</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">উত্তোলিত অর্থ</span>
                  <p className="text-xl font-black text-indigo-700 mt-1">৳{paidWith.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Withdrawn Amount</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">প্রক্রিয়াধীন উইথড্র</span>
                  <p className="text-xl font-black text-rose-600 mt-1">৳{pendingWith.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Pending Withdraw</span>
                </div>
              </div>
            );
          })()}

          {/* DEDICATED EMBEDDED AFFILIATE WALLET WITHDRAW FORM */}
          <div id="withdraw-form-card" className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/5 space-y-6 relative overflow-hidden transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wide mb-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অ্যাফিলিয়েট ব্যালেন্স উত্তোলন</span>
                </div>
                <h4 className="font-black text-slate-900 text-lg md:text-xl flex items-center gap-2">
                  <span>উইথড্র রিকোয়েস্ট ফর্ম</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার রেফারেল আর্নিং থেকে সরাসরি বিকাশ, নগদ বা ব্যাংক একাউন্টে টাকা উত্তোলন করুন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  উইথড্র ফি: ৳০ (ফ্রি)
                </span>
                <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200">
                  সর্বনিম্ন: ৳{MIN_WITHDRAW}
                </span>
              </div>
            </div>

            {withdrawSuccessMsg && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl flex items-start gap-3 text-xs animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-sm text-emerald-800">{withdrawSuccessMsg}</p>
                  <p className="text-slate-600">
                    অ্যাডমিন ভেরিফিকেশন সম্পন্ন হলে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেওয়া হবে। নিচের "পূর্ববর্তী উইথড্র হিস্ট্রি" সেকশনে স্ট্যাটাস দেখতে পারবেন।
                  </p>
                </div>
              </div>
            )}

            {withdrawErrorMsg && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-2xl flex items-start gap-2.5 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-bold">{withdrawErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-5">
              {/* 1. User Balance Information Highlight Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gradient-to-r from-emerald-50/80 to-emerald-100/50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block">বর্তমান উত্তোলনযোগ্য ব্যালেন্স</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono">
                      ৳{(Number(userProfile?.affiliateBalance) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-start sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
                  <div className="sm:text-right">
                    <span className="text-[11px] font-bold text-slate-600 block">প্রক্রিয়াধীন উইথড্র (Pending)</span>
                    <span className="text-base font-black text-amber-700 font-mono">
                      ৳{(Number(userProfile?.pendingWithdrawal) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Withdraw Amount Input & Quick Chips */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-1">
                  <label className="block font-black text-slate-800 text-xs">
                    উত্তোলনের পরিমাণ (Withdraw Amount) *
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
                    সর্বনিম্ন ৳{MIN_WITHDRAW} | ওয়ালেটে আছে ৳{(Number(userProfile?.affiliateBalance) || 0).toFixed(2)}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-black text-base">৳</span>
                  <input
                    type="number"
                    min={MIN_WITHDRAW}
                    max={Number(userProfile?.affiliateBalance) || 0}
                    required
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(Number(e.target.value));
                      setWithdrawErrorMsg('');
                    }}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                    placeholder={`৳${MIN_WITHDRAW} বা তদূর্ধ্ব`}
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400">কুইক অ্যামাউন্ট:</span>
                  {[50, 100, 200, 500].map((amt) => {
                    const maxBal = Number(userProfile?.affiliateBalance) || 0;
                    const isDisabled = amt > maxBal;
                    return (
                      <button
                        key={amt}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setWithdrawAmount(amt);
                          setWithdrawErrorMsg('');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                          withdrawAmount === amt
                            ? 'bg-[#15803d] text-white shadow-xs'
                            : isDisabled
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    );
                  })}
                  {Number(userProfile?.affiliateBalance) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawAmount(Math.floor(Number(userProfile?.affiliateBalance) || 0));
                        setWithdrawErrorMsg('');
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                    >
                      সব ব্যালেন্স (৳{Math.floor(Number(userProfile?.affiliateBalance) || 0)})
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Payment Method Select */}
              <div className="space-y-2">
                <label className="block font-black text-slate-800 text-xs">
                  পেমেন্ট মেথড নির্বাচন করুন (Select Payment Method) *
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'bKash', name: 'বিকাশ', sub: 'bKash Personal', color: 'border-pink-500 bg-pink-50/40 text-pink-900', active: 'border-pink-600 bg-pink-600 text-white shadow-md' },
                    { id: 'Nagad', name: 'নগদ', sub: 'Nagad Personal', color: 'border-orange-500 bg-orange-50/40 text-orange-900', active: 'border-orange-600 bg-orange-600 text-white shadow-md' },
                    { id: 'Rocket', name: 'রকেট', sub: 'Rocket Personal', color: 'border-purple-500 bg-purple-50/40 text-purple-900', active: 'border-purple-600 bg-purple-600 text-white shadow-md' },
                    { id: 'Bank', name: 'ব্যাংক', sub: 'Bank Transfer', color: 'border-blue-500 bg-blue-50/40 text-blue-900', active: 'border-blue-600 bg-blue-600 text-white shadow-md' },
                  ].map((m) => {
                    const isSelected = withdrawMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setWithdrawMethod(m.id as any);
                          setWithdrawErrorMsg('');
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected ? m.active : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="font-black text-sm">{m.name}</span>
                        <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                          {m.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Mobile Number / Account Number Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-black text-slate-800 text-xs">
                    {withdrawMethod === 'Bank' 
                      ? 'ব্যাংক একাউন্ট বিবরণ (Account No, Bank Name, Branch) *' 
                      : `মোবাইল নম্বর (${withdrawMethod === 'bKash' ? 'বিকাশ' : withdrawMethod === 'Nagad' ? 'নগদ' : 'রকেট'} পার্সোনাল নম্বর) *`}
                  </label>
                  {(userProfile?.paymentMobile || userProfile?.phone) && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAccount(userProfile?.paymentMobile || userProfile?.phone || '')}
                      className="text-[11px] text-emerald-700 font-bold hover:underline"
                    >
                      প্রোফাইল নম্বর ব্যবহার করুন
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    {withdrawMethod === 'Bank' ? <Building className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={withdrawAccount}
                    onChange={(e) => {
                      setWithdrawAccount(e.target.value);
                      setWithdrawErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                    placeholder={
                      withdrawMethod === 'Bank'
                        ? 'হিসাব নম্বর, ব্যাংকের নাম, ব্রাঞ্চ (যেমন: AC: 123456789, DBBL, Dhanmondi Branch)'
                        : '01XXXXXXXXX (১১ ডিজিটের মোবাইল নম্বর)'
                    }
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {withdrawMethod === 'Bank'
                    ? 'ব্যাংক একাউন্ট বিবরণ নির্ভুলভাবে লিখুন যাতে পেমেন্ট প্রদানে বিলম্ব না হয়।'
                    : `অ্যাডমিন এই ${withdrawMethod} নম্বরে আপনার উত্তোলনের টাকা সেন্ড মানি বা ক্যাশ আউট করে দিবেন।`}
                </p>
              </div>

              {/* 5. Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={withdrawing || (Number(userProfile?.affiliateBalance) || 0) < MIN_WITHDRAW}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-900/15 hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {withdrawing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>রিকোয়েস্ট সাবমিট হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>উইথড্র রিকোয়েস্ট সাবমিট করুন (Submit Withdraw Request)</span>
                    </>
                  )}
                </button>

                {(Number(userProfile?.affiliateBalance) || 0) < MIN_WITHDRAW && (
                  <p className="text-center text-[11px] text-amber-700 font-bold mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>উত্তোলনের জন্য ওয়ালেটে সর্বনিম্ন ৳{MIN_WITHDRAW} ব্যালেন্স প্রয়োজন। আপনার রেফারেল কোড শেয়ার করে কমিশন আর্ন করুন!</span>
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Business Rules Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1 shadow-sm">
            <p className="font-black flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>রেফারেল ও উইথড্র নীতিমালা:</span>
            </p>
            <p className="font-medium text-slate-700">
              • শুধুমাত্র অ্যাডমিন ই-বুক ক্রয়ে ভ্যালিড রেফারেল কোড ব্যবহার করলে রেফারেল কোডের মালিক <b className="text-emerald-800">৳৫০ অ্যাফিলিয়েট কমিশন</b> পাবেন।
            </p>
            <p className="font-medium text-slate-700">
              • সেলারের ই-বুক ক্রয়ে কোনো রেফারেল কমিশন প্রযোজ্য নয় (৳০)। সেলার তাঁর বইয়ের বিক্রয়মূল্য পূর্ণাঙ্গভাবে পাবেন।
            </p>
            <p className="font-medium text-slate-700">
              • যে ক্রেতা রেফারেল কোড ব্যবহার করেছেন, তিনি নিজে কোনো কমিশন পাবেন না (৳০)।
            </p>
            <p className="font-medium text-slate-700">
              • নিজের রেফারেল কোড নিজে ব্যবহার করে বই কিনলে কমিশন প্রযোজ্য হবে না (Self-referral নিষিদ্ধ)।
            </p>
          </div>

          {/* Affiliate Referral Earnings History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-black text-slate-900 text-sm">অ্যাফিলিয়েট রেফারেল কমিশন হিস্ট্রি</h4>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {myAffiliateTransactions.length}টি রেফারেল
              </span>
            </div>
            {myAffiliateTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">এখনও কোনো রেফারেল কমিশন হিস্ট্রি পাওয়া যায়নি। আপনার রেফারেল কোড শেয়ার করুন!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ই-বুক ও অর্ডার</th>
                      <th className="p-3">ক্রেতা</th>
                      <th className="p-3">কমিশন</th>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {myAffiliateTransactions.map((tx) => (
                      <tr key={tx.id || tx.transactionId} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{tx.ebookTitle}</p>
                          <span className="font-mono text-[10px] text-slate-400">Order #{tx.orderId}</span>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{tx.buyerName}</td>
                        <td className="p-3 font-black text-emerald-700">
                          +{tx.commissionAmount} ৳
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {tx.approvedAt ? new Date(tx.approvedAt).toLocaleDateString('bn-BD') : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Referred Members Network */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>আমার রেফারেল নেটওয়ার্ক ও মেম্বার তালিকা</span>
                </h4>
                <p className="text-[11px] text-slate-500">আপনার স্থায়ী রেফারেল কোড ব্যবহার করে রেজিস্ট্রেশনকারী ইউজারগণ</p>
              </div>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                মোট মেম্বার: {referredUsers.length} জন
              </span>
            </div>

            {referredUsers.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-400">আপনার রেফারেল কোড দিয়ে এখনও কেউ অ্যাকাউন্ট তৈরি করেনি।</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!userProfile?.referralCode) return;
                    const link = `${window.location.origin}/?ref=${userProfile.referralCode}`;
                    navigator.clipboard.writeText(link);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200 transition inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'রেফারেল লিংক কপি করে ইনভাইট করুন'}</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ইউজার / নাম</th>
                      <th className="p-3">ইমেইল</th>
                      <th className="p-3">যুক্ত হওয়ার তারিখ</th>
                      <th className="p-3 text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {referredUsers.map((ru) => (
                      <tr key={ru.uid} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{ru.fullName}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{ru.email}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {ru.createdAt ? new Date(ru.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            সক্রিয় মেম্বার
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Withdrawals History List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">পূর্ববর্তী উইথড্র হিস্ট্রি</h4>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">এখনও কোনো উইথড্র রেকর্ড নেই।</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.map((w) => {
                  const normStatus = (w.status || 'pending').toLowerCase();
                  return (
                    <div key={w.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">৳{w.amount}</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {w.paymentMethod || w.method || 'bKash'}
                          </span>
                        </div>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                          হিসাব নম্বর: <span className="font-bold text-slate-700">{w.paymentAccount || w.account}</span>
                          {w.note && <span className="text-slate-400 ml-2">({w.note})</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(w.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          normStatus === 'paid' || normStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : normStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {normStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Professional Withdraw Request Modal (Rule 9, 10, 11) */}
          {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="bg-[#15803d] text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-300" />
                    <h3 className="font-black text-base">উইথড্র রিকোয়েস্ট ফর্ম</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4 text-xs">
                  {/* Available Balance Display */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700">বর্তমান উত্তোলনযোগ্য ব্যালেন্স:</span>
                    <span className="text-base font-black text-emerald-800 font-mono">
                      ৳{(userProfile?.affiliateBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      উত্তোলনের পরিমাণ (টাকা) * <span className="text-slate-400 text-[10px]">(সর্বনিম্ন ৳৫০)</span>
                    </label>
                    <input
                      type="number"
                      min={MIN_WITHDRAW}
                      max={Number(userProfile?.affiliateBalance) || 0}
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="৳50 বা তদূর্ধ্ব"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড নির্বাচন করুন *</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="bKash">bKash (বিকাশ Personal)</option>
                      <option value="Nagad">Nagad (নগদ Personal)</option>
                      <option value="Bank">Bank Transfer (ব্যাংক একাউন্ট)</option>
                      <option value="Other">Other (অন্যান্য মেথড)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {withdrawMethod === 'Bank' ? 'ব্যাংক একাউন্ট বিবরণ (Account No, Bank Name, Branch) *' : 'মোবাইল নম্বর (বিকাশ/নগদ) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder={withdrawMethod === 'Bank' ? 'AC: XXXXXXXXXX, Dutch-Bangla Bank, Dhanmondi Branch' : '01XXXXXXXXX'}
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex justify-between">
                    <span>উইথড্র প্রসেসিং ফি:</span>
                    <span className="font-bold text-emerald-700">৳০ (সম্পূর্ণ ফ্রি)</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={withdrawing || (Number(userProfile?.affiliateBalance) || 0) < withdrawAmount}
                      className="flex-1 py-3 bg-[#15803d] hover:bg-emerald-800 text-white font-black rounded-xl shadow transition disabled:opacity-50"
                    >
                      {withdrawing ? 'সাবমিট হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">প্রোফাইল তথ্য ও অ্যাকাউন্ট ম্যানেজমেন্ট</h3>
              <p className="text-xs text-slate-500">আপনার ব্যক্তিগত তথ্য নিরাপদে সংরক্ষণ ও আপডেট করুন</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>এডিট করুন</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ইউজারনেম (Username)</label>
              <input
                type="text"
                disabled
                value={userProfile?.username || currentUser?.email?.split('@')[0] || ''}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস (Email)</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম (Full Name) *</label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm ${
                  isEditing ? 'border-slate-300 focus:ring-2 focus:ring-emerald-600 bg-white' : 'border-slate-200 bg-slate-50'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone)</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm ${
                    isEditing ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50'
                  }`}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">দেশ (Country)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm ${
                    isEditing ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50'
                  }`}
                  placeholder="Bangladesh"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ঠিকানা / জেলা (Address)</label>
              <textarea
                disabled={!isEditing}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                rows={2}
                className={`w-full p-3 rounded-xl border text-sm ${
                  isEditing ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50'
                }`}
                placeholder="আপনার পূর্ণ ঠিকানা লিখুন..."
              />
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-black px-6 py-2.5 rounded-xl shadow transition"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition"
                >
                  বাতিল
                </button>
              </div>
            )}
          </form>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500">অ্যাকাউন্ট স্ট্যাটাস: <b className="text-emerald-700">সক্রিয়</b></span>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKET MANAGEMENT */}
      {activeTab === 'tickets' && (
        <SupportTicketSection
          userId={currentUser?.uid || ''}
          userRole="user"
          userName={userProfile?.fullName || currentUser?.email || 'User'}
          userEmail={currentUser?.email || ''}
          userPhone={userProfile?.phone}
        />
      )}
    </div>
  );
};
