import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  UploadCloud, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Wallet, 
  Copy, 
  Check, 
  Plus, 
  Lock,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  AlertCircle,
  LifeBuoy,
  Home,
  LogOut
} from 'lucide-react';
import { useAuth, cleanFirebaseData } from '../context/AuthContext';
import { db, ref, onValue, push, set, update, serverTimestamp } from '../firebase';
import { Ebook, SellerProfile, WithdrawalRequest, MembershipRequest } from '../types';
import { SupportTicketSection } from './SupportTicketSection';

interface SellerDashboardProps {
  onOpenReader: (url: string, title: string) => void;
  onNavigateHome: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onOpenReader, onNavigateHome }) => {
  const { currentUser, userProfile, updateProfileData, login, logout } = useAuth();
  const rawSeller = userProfile as SellerProfile | null;

  // Realtime seller profile state that updates dynamically when Admin approves membership or changes limit
  const [liveSeller, setLiveSeller] = useState<SellerProfile | null>(rawSeller);
  const [unreadTicketCount, setUnreadTicketCount] = useState<number>(0);

  useEffect(() => {
    if (userProfile) {
      setLiveSeller(userProfile as SellerProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser) return;
    const sellerRef = ref(db, `sellers/${currentUser.uid}`);
    const unsub = onValue(sellerRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setLiveSeller(prev => ({
          ...(prev || {}),
          ...val,
          uid: currentUser.uid
        } as SellerProfile));
      }
    });
    return () => unsub();
  }, [currentUser]);

  const seller = liveSeller || rawSeller;

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'ebooks' | 'upload' | 'membership' | 'withdraw' | 'tickets'>('overview');

  // eBooks list & statistics
  const [sellerEbooks, setSellerEbooks] = useState<Ebook[]>(!currentUser ? [
    {
      id: 'demo-seller-1',
      title: 'আধুনিক ফ্রিল্যান্সিং ও ক্যারিয়ার গাইড',
      author: 'তানভীর আহমেদ',
      category: 'ফ্রিল্যান্সিং ও ক্যারিয়ার',
      level: 'Beginner',
      price: 180,
      discountPrice: 135,
      coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'অনলাইন মার্কেটপ্লেস ও আউটসোর্সিং এর কমপ্লিট হ্যান্ডবুক।',
      sellerId: 'demo-seller',
      sellerName: 'তানভীর আহমেদ',
      status: 'published',
      createdAt: Date.now() - 172800000
    },
    {
      id: 'demo-seller-2',
      title: 'গ্রাফিক ডিজাইন ও ক্যানভা মাস্টারক্লাস',
      author: 'তানভীর আহমেদ',
      category: 'ডিজাইন ও আর্ট',
      level: 'Intermediate',
      price: 220,
      discountPrice: 180,
      coverUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'সোশ্যাল মিডিয়া ব্যানার এবং পোস্টার তৈরির গাইডলাইন।',
      sellerId: 'demo-seller',
      sellerName: 'তানভীর আহমেদ',
      status: 'pending',
      createdAt: Date.now() - 43200000
    }
  ] : []);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>(!currentUser ? [
    {
      id: 'demo-mem-req',
      sellerId: 'demo-seller',
      sellerName: 'তানভীর আহমেদ',
      sellerEmail: 'seller@ebookbazar.com',
      currentMembership: 'free',
      newMembership: 'standard',
      currentUploadLimit: 5,
      newUploadLimit: 50,
      amount: 199,
      paymentMethod: 'bKash',
      paymentMobile: '01711223344',
      trxId: 'TRX778899',
      status: 'pending',
      createdAt: Date.now() - 1800000
    }
  ] : []);
  const [copiedRef, setCopiedRef] = useState(false);

  // Ebook Upload Form States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState(seller?.fullName || '');
  const [uploadCategory, setUploadCategory] = useState('কথাসাহিত্য ও উপন্যাস');
  const [uploadLevel, setUploadLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [uploadPrice, setUploadPrice] = useState<number>(100);
  const [uploadDiscount, setUploadDiscount] = useState<number>(0);
  const [uploadCover, setUploadCover] = useState('');
  const [uploadPdf, setUploadPdf] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  // Membership Upgrade Form States
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');
  const [memMethod, setMemMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [memMobile, setMemMobile] = useState('');
  const [memTrxId, setMemTrxId] = useState('');
  const [memSubmitting, setMemSubmitting] = useState(false);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Dynamic Payment / Withdraw Settings (Default 20 BDT per seller withdraw)
  const [withdrawCharge, setWithdrawCharge] = useState<number>(20);
  const [minWithdraw, setMinWithdraw] = useState<number>(50);
  const PAYMENT_NUMBER = '01673860659';

  // Load seller's eBooks
  useEffect(() => {
    if (!currentUser) return;

    const ebooksRef = ref(db, 'ebooks');
    const unsubBooks = onValue(ebooksRef, (snap) => {
      if (snap.exists()) {
        const books: Ebook[] = [];
        snap.forEach((ch) => {
          const b = ch.val() as Ebook;
          if (b.sellerId === currentUser.uid) {
            books.push({ ...b, id: ch.key as string });
          }
        });
        books.sort((a, b) => b.createdAt - a.createdAt);
        setSellerEbooks(books);
      } else {
        setSellerEbooks([]);
      }
    });

    // Load seller's withdrawals from both withdrawals and withdrawRequests
    const mapWith = new Map<string, WithdrawalRequest>();
    const syncWithdrawals = () => {
      setWithdrawals(Array.from(mapWith.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };

    const unsubWith = onValue(ref(db, 'withdrawals'), (snap) => {
      if (snap.exists()) {
        snap.forEach((ch) => {
          const w = ch.val() as WithdrawalRequest;
          if ((w.uid === currentUser.uid || w.userId === currentUser.uid) && w.type === 'seller') {
            const key = w.id || w.requestId || w.reqId || ch.key;
            mapWith.set(key, { ...w, id: ch.key as string });
          }
        });
        syncWithdrawals();
      }
    });

    const unsubWithReqs = onValue(ref(db, 'withdrawRequests'), (snap) => {
      if (snap.exists()) {
        snap.forEach((ch) => {
          const w = ch.val() as WithdrawalRequest;
          if ((w.uid === currentUser.uid || w.userId === currentUser.uid) && w.type === 'seller') {
            const key = w.id || w.requestId || w.reqId || ch.key;
            const existing = mapWith.get(key);
            mapWith.set(key, { ...existing, ...w, id: ch.key as string });
          }
        });
        syncWithdrawals();
      }
    });

    // Load seller's membership requests
    const memRef = ref(db, 'membershipRequests');
    const unsubMem = onValue(memRef, (snap) => {
      if (snap.exists()) {
        const reqs: MembershipRequest[] = [];
        snap.forEach((ch) => {
          const m = ch.val() as MembershipRequest;
          if (m.sellerId === currentUser.uid) {
            reqs.push({ ...m, id: ch.key as string });
          }
        });
        reqs.sort((a, b) => b.createdAt - a.createdAt);
        setMembershipRequests(reqs);
      } else {
        setMembershipRequests([]);
      }
    });

    // Load payment settings (withdraw charge & min withdraw)
    const paySetRef = ref(db, 'settings/paymentSettings');
    const unsubPay = onValue(paySetRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data.withdrawCharge !== undefined && Number(data.withdrawCharge) >= 0) {
          setWithdrawCharge(Number(data.withdrawCharge));
        } else {
          setWithdrawCharge(20);
        }
        if (data.minWithdraw !== undefined && Number(data.minWithdraw) > 0) {
          setMinWithdraw(Number(data.minWithdraw));
        }
      }
    });

    // Load Support Tickets unread replies count for this seller
    const ticketsRef = ref(db, 'supportTickets');
    const unsubTickets = onValue(ticketsRef, (snap) => {
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
      unsubBooks();
      unsubWith();
      unsubWithReqs();
      unsubMem();
      unsubPay();
      unsubTickets();
    };
  }, [currentUser]);

  // Derived statistics
  const totalUploaded = sellerEbooks.length;
  const approvedEbooks = sellerEbooks.filter(b => b.status === 'published').length;
  const pendingEbooks = sellerEbooks.filter(b => b.status === 'pending').length;
  const uploadLimit = Number(seller?.uploadLimit || 5);
  const remainingUploads = Math.max(0, uploadLimit - totalUploaded);
  const progressPercent = Math.min(100, Math.round((totalUploaded / uploadLimit) * 100));

  const handleCopyReferral = () => {
    if (!seller?.referralCode) return;
    navigator.clipboard.writeText(seller.referralCode).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  };

  // Handle eBook Upload with limit enforcement
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !seller) return;

    if (totalUploaded >= uploadLimit) {
      alert(`আপনার মেম্বারশিপ অনুযায়ী বই আপলোড লিমিট (${uploadLimit}টি) পূর্ণ হয়েছে! আরও বই আপলোড করতে মেম্বারশিপ আপগ্রেড করুন।`);
      setActiveTab('membership');
      return;
    }

    if (!uploadTitle.trim() || !uploadPrice || !uploadCover.trim() || !uploadPdf.trim()) {
      alert('অনুগ্রহ করে বইয়ের নাম, মূল্য, কভার ফটো ও PDF লিঙ্ক সঠিকভাবে পূরণ করুন।');
      return;
    }

    setUploading(true);
    try {
      const bookRef = ref(db, 'ebooks');
      const newKey = push(bookRef).key;

      const newEbook: Ebook = {
        id: newKey || `BK-${Date.now()}`,
        title: uploadTitle.trim(),
        author: uploadAuthor.trim() || seller.fullName,
        category: uploadCategory,
        level: uploadLevel,
        price: uploadPrice,
        coverUrl: uploadCover.trim(),
        pdfUrl: uploadPdf.trim(),
        description: uploadDesc.trim(),
        sellerId: currentUser.uid,
        sellerName: seller.fullName,
        sellerEmail: currentUser.email || '',
        sellerReferralCode: seller.referralCode || '',
        isSeller: true,
        status: 'pending',
        createdAt: Date.now()
      };

      if (uploadDiscount > 0) {
        newEbook.discountPrice = uploadDiscount;
      }

      await set(ref(db, `ebooks/${newKey}`), cleanFirebaseData(newEbook));
      setUploading(false);
      
      // Reset form
      setUploadTitle('');
      setUploadCover('');
      setUploadPdf('');
      setUploadDesc('');
      alert('ই-বুক সফলভাবে আপলোড হয়েছে! অ্যাডমিন পর্যালোচনার পর এটি মার্কেটপ্লেসে প্রকাশিত হবে।');
      setActiveTab('ebooks');
    } catch (err: any) {
      setUploading(false);
      alert('আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  // Handle Membership Upgrade Request
  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !seller) return;

    if (!memMobile || !memTrxId) {
      alert('পেমেন্ট নম্বর ও Transaction ID দিন।');
      return;
    }

    const planPrices = { standard: 199, premium: 699 };
    const planLimits = { standard: 50, premium: 200 };
    const amount = planPrices[selectedPlan];
    const newLimit = planLimits[selectedPlan];

    setMemSubmitting(true);
    try {
      const reqRef = ref(db, 'membershipRequests');
      const newKey = push(reqRef).key;

      const memData: MembershipRequest = {
        id: newKey || `MEM-${Date.now()}`,
        sellerId: currentUser.uid,
        sellerName: seller.fullName,
        sellerEmail: currentUser.email || '',
        currentMembership: seller.membershipPlan || 'free',
        newMembership: selectedPlan,
        currentUploadLimit: uploadLimit,
        newUploadLimit: newLimit,
        amount,
        paymentMethod: memMethod,
        paymentMobile: memMobile.trim(),
        trxId: memTrxId.trim().toUpperCase(),
        status: 'pending',
        createdAt: Date.now()
      };

      await set(ref(db, `membershipRequests/${newKey}`), memData);
      setMemSubmitting(false);
      setMemMobile('');
      setMemTrxId('');
      alert(`মেম্বারশিপ রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন পেমেন্ট যাচাই করে অনুমোদন দিলে লিমিট স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।`);
    } catch (err: any) {
      setMemSubmitting(false);
      alert('রিকোয়েস্ট জমা দিতে ত্রুটি: ' + err.message);
    }
  };

  // Handle Seller Withdrawal Submit (min ৳50, charge ৳20)
  // Strict Formula:
  // Seller Payout Amount = Withdrawal Amount − ৳20
  // Remaining Withdrawable Balance = Previous Balance − Withdrawal Amount
  // ৳20 charge withdrawal amount-এর মধ্য থেকেই কাটা হবে (Never deduct ৳470)
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !seller || withdrawing) return;

    const currentBal = Number(seller.balance) || 0;
    const finalMin = minWithdraw || 50;
    const finalCharge = withdrawCharge !== undefined ? withdrawCharge : 20;

    if (withdrawAmount < finalMin) {
      alert(`সর্বনিম্ন উত্তোলনের পরিমাণ ৳${finalMin}।`);
      return;
    }

    if (withdrawAmount > currentBal) {
      alert(`আপনার সেলার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${currentBal.toFixed(2)}`);
      return;
    }

    if (!withdrawAccount || withdrawAccount.trim().length < 11) {
      alert('সঠিক ১১ ডিজিটের বিকাশ/নগদ নম্বর প্রদান করুন।');
      return;
    }

    setWithdrawing(true);
    try {
      // 1. Calculations according to rule
      const payoutAmount = Math.max(0, withdrawAmount - finalCharge);
      const remainingBal = Math.max(0, currentBal - withdrawAmount);
      const currentPending = Number(seller.pendingWithdrawal) || 0;
      const newPending = currentPending + withdrawAmount;

      // 2. Generate unique transaction / withdrawal ID for duplicate protection
      const newKey = push(ref(db, 'withdrawals')).key || `WTH-${Date.now()}`;
      const uniqueReqId = `WTH-SEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const now = Date.now();

      const withdrawData: Record<string, any> = {
        id: newKey,
        reqId: uniqueReqId,
        requestId: uniqueReqId,
        transactionId: uniqueReqId,
        uid: currentUser.uid,
        userId: currentUser.uid,
        userName: seller.fullName || 'সেলার',
        userEmail: currentUser.email || '',
        email: currentUser.email || '',
        amount: withdrawAmount,
        charge: finalCharge,
        netAmount: payoutAmount,
        payoutAmount: payoutAmount,
        previousBalance: currentBal,
        remainingBalance: remainingBal,
        method: withdrawMethod,
        paymentMethod: withdrawMethod,
        account: withdrawAccount.trim(),
        paymentAccount: withdrawAccount.trim(),
        type: 'seller',
        status: 'pending',
        createdAt: now
      };

      const sanitized = Object.fromEntries(
        Object.entries(withdrawData).filter(([_, v]) => v !== undefined)
      );

      // 3. Atomically update withdrawals, withdrawRequests, and seller balance in Firebase
      const updates: Record<string, any> = {};
      updates[`withdrawals/${newKey}`] = sanitized;
      updates[`withdrawRequests/${newKey}`] = sanitized;
      updates[`sellers/${currentUser.uid}/balance`] = remainingBal;
      updates[`sellers/${currentUser.uid}/pendingWithdrawal`] = newPending;

      await update(ref(db), updates);

      // 4. Optimistic UI update
      setLiveSeller(prev => prev ? {
        ...prev,
        balance: remainingBal,
        pendingWithdrawal: newPending
      } : prev);

      setWithdrawing(false);
      setWithdrawAccount('');
      alert(`উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!\n\n• উত্তোলনের পরিমাণ: ৳${withdrawAmount}\n• উইথড্রল চার্জ: ৳${finalCharge}\n• আপনি পাবেন (Payout): ৳${payoutAmount}\n• অবশিষ্ট ওয়ালেট ব্যালেন্স: ৳${remainingBal.toFixed(2)}`);
    } catch (err: any) {
      setWithdrawing(false);
      alert('ত্রুটি: ' + err.message);
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
    <div className="max-w-6xl mx-auto space-y-6">
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
            eBookBazar সেলার প্যানেল
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

      {/* Preview Notice if not logged in as seller */}
      {(!currentUser || userProfile?.role !== 'seller') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs md:text-sm">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-black">আপনি সেলার ড্যাশবোর্ড প্রিভিউ করছেন:</span>{' '}
              <span className="text-slate-600">বই আপলোড, সেলস অ্যানালিটিক্স, মেম্বারশিপ আপগ্রেড ও উইথড্র সিস্টেম সরাসরি পরীক্ষা করুন।</span>
            </div>
          </div>
          <button
            onClick={() => login('tanveer.startup@gmail.com', '12345678')}
            className="bg-[#15803d] hover:bg-emerald-800 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow transition shrink-0"
          >
            ১-ক্লিকে টেস্ট সেলার সাইন ইন
          </button>
        </div>
      )}

      {/* Seller Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-900/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black">
                {seller?.fullName || 'সেলার প্যানেল'}
              </h1>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                {seller?.membershipPlan?.toUpperCase() || 'FREE'} SELLER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ইমেইল: <span className="text-slate-200">{currentUser?.email}</span> | মোবাইল: <span className="text-slate-200">{seller?.paymentMobile || seller?.phone}</span>
            </p>
            <p className="text-xs text-emerald-300 mt-0.5">
              পেমেন্ট রিসিভ মেথড: <b className="text-white">{seller?.paymentMethod || 'bKash'}</b> ({seller?.paymentMobile || 'নম্বর যুক্ত নেই'})
            </p>
            {/* Quick in-banner action pills */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition active:scale-95"
                title="মূল হোম পেজে যান"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>হোম পেজ</span>
              </button>
              {currentUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-400/30 flex items-center gap-1.5 transition active:scale-95"
                  title="লগআউট করে হোমে যান"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              )}
            </div>
          </div>

          {/* Seller Referral Code */}
          <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-700/60 w-full md:w-auto min-w-[260px]">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
              স্থায়ী সেলার রেফারেল কোড
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xl font-mono font-black text-white tracking-widest">
                {seller?.referralCode || 'EBK00000'}
              </span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Limit Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">বর্তমান মেম্বারশিপ:</span>
            <h4 className="font-black text-slate-900 text-sm">
              👑 {seller?.membershipPlan?.toUpperCase() || 'FREE'} (আপলোড সীমা: {uploadLimit}টি বই)
            </h4>
          </div>
          <button
            onClick={() => setActiveTab('membership')}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>আপগ্রেড করুন</span>
          </button>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div 
            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>মোট আপলোড: <b className="text-slate-900">{totalUploaded} / {uploadLimit}</b> ({progressPercent}%)</span>
          <span className="text-emerald-700">বাকি আছে: <b>{remainingUploads}টি বই</b></span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">উত্তোলনযোগ্য ব্যালেন্স</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">৳{(seller?.balance || 0).toFixed(2)}</p>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block mt-2 self-start">
            প্রতি উইথড্রলে চার্জ ৳{withdrawCharge}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">প্রক্রিয়াধীন উইথড্র</span>
          <p className="text-2xl font-black text-rose-600 mt-1">৳{(Number(seller?.pendingWithdrawal) || 0).toFixed(2)}</p>
          <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Pending Withdrawal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">মোট বিক্রয় আয়</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">৳{(seller?.totalEarnings || 0).toFixed(2)}</p>
          <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Total Earnings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">অনুমোদিত ই-বুক</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{approvedEbooks}</p>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Published</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">অপেক্ষমান ই-বুক</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingEbooks}</p>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Under Review</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'overview' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>সারসংক্ষেপ</span>
        </button>

        <button
          onClick={() => setActiveTab('ebooks')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'ebooks' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>আমার বইসমূহ ({totalUploaded})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'upload' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>নতুন বই আপলোড</span>
        </button>

        <button
          onClick={() => setActiveTab('membership')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'membership' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>মেম্বারশিপ আপগ্রেড</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
            activeTab === 'withdraw' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>উইথড্র রিকোয়েস্ট</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm relative ${
            activeTab === 'tickets' ? 'bg-[#15803d] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
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
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                সম্প্রতি আপলোডকৃত ই-বুক
              </h3>
              {sellerEbooks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">এখনও কোনো বই আপলোড করেননি।</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {sellerEbooks.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="truncate pr-2">
                        <p className="font-black text-slate-900 truncate">{b.title}</p>
                        <p className="text-[10px] text-slate-500">মূল্য: ৳{b.price} | {b.category}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        b.status === 'published' ? 'bg-emerald-100 text-emerald-800' : b.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                সেলার নিয়মাবলি ও নির্দেশিকা
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc pl-4">
                <li>সবসময় আপনার নিজস্ব রচিত বা কপিরাইট অনুমোদিত বই আপলোড করবেন।</li>
                <li>বই আপলোড করার পর অ্যাডমিন রিভিউ করে স্ট্যাটাস <b>Approved / Published</b> করবে।</li>
                <li>বই বিক্রির টাকা অনুমোদনের পর সাথে সাথে সেলার ব্যালেন্সে যোগ হবে।</li>
                <li>ন্যূনতম উইথড্র ৫০ টাকা। প্রতি উত্তোলনে ২০ টাকা প্রসেসিং চার্জ কর্তন করা হবে।</li>
                <li>আপলোড লিমিট বৃদ্ধি করতে মেম্বারশিপ প্ল্যান আপগ্রেড করুন।</li>
              </ul>
            </div>
          </div>

          {/* Quick Support Ticket Card in Overview */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-600/40 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg">
                <LifeBuoy className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-base text-white flex items-center gap-2">
                  <span>সেলার হেল্প ডেস্ক ও সাপোর্ট টিকিট</span>
                  {unreadTicketCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {unreadTicketCount}টি নতুন উত্তর
                    </span>
                  )}
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  বই অনুমোদন, আপলোড লিমিট, সেলস আর্নিং বা উইথড্র বিষয়ে সরাসরি অ্যাডমিনের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>সাপোর্ট টিকিট খুলুন →</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MY EBOOKS LIST */}
      {activeTab === 'ebooks' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">আপনার আপলোডকৃত সকল বই</h3>
              <p className="text-xs text-slate-500">স্ট্যাটাস ও বিবরণী পর্যালোচনা করুন</p>
            </div>
            <button
              onClick={() => setActiveTab('upload')}
              className="bg-[#15803d] hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন বই যোগ করুন</span>
            </button>
          </div>

          {sellerEbooks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-12 h-12 mx-auto stroke-[1.2]" />
              <p className="font-bold">কোনো বই পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerEbooks.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="flex gap-3">
                    <img 
                      src={b.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'} 
                      alt={b.title} 
                      className="w-14 h-20 object-cover rounded-xl bg-slate-200 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block mb-1 ${
                        b.status === 'published' ? 'bg-emerald-100 text-emerald-800' : b.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm leading-snug truncate">{b.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">৳{b.price} | {b.category}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex gap-2">
                    {b.pdfUrl && (
                      <button
                        type="button"
                        onClick={() => onOpenReader(b.pdfUrl, b.title)}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-1.5 rounded-lg text-xs font-bold text-center"
                      >
                        PDF প্রিভিউ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD EBOOK (LIMIT ENFORCED) */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-900 text-base">নতুন ই-বুক আপলোড ফর্ম</h3>
              <p className="text-xs text-slate-500">
                স্বয়ংক্রিয়ভাবে যুক্ত হবে: সেলার UID, নাম, ইমেইল এবং রেফারেল কোড
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              বাকি কোটা: {remainingUploads}টি বই
            </span>
          </div>

          {remainingUploads <= 0 ? (
            <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <Lock className="w-10 h-10 text-amber-600 mx-auto" />
              <h4 className="font-black text-slate-900 text-base">আপলোড লিমিট পূর্ণ হয়েছে!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                আপনার বর্তমান মেম্বারশিপ সীমার সর্বোচ্চ বই আপলোড করা হয়েছে। নতুন বই যোগ করতে মেম্বারশিপ আপগ্রেড করুন।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('membership')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs shadow transition"
              >
                মেম্বারশিপ আপগ্রেড করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ই-বুক শিরোনাম (Title) *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                    placeholder="বইয়ের পূর্ণ নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেখকের নাম (Author) *</label>
                  <input
                    type="text"
                    required
                    value={uploadAuthor}
                    onChange={(e) => setUploadAuthor(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="কথাসাহিত্য ও উপন্যাস">কথাসাহিত্য ও উপন্যাস</option>
                    <option value="নন-ফিকশন">নন-ফিকশন</option>
                    <option value="কবিতা ও কাব্যগ্রন্থ">কবিতা ও কাব্যগ্রন্থ</option>
                    <option value="ব্যবসায় ও উদ্যোক্তা">ব্যবসায় ও উদ্যোক্তা</option>
                    <option value="ফ্রিল্যান্সিং ও আউটসোর্সিং">ফ্রিল্যান্সিং ও আউটসোর্সিং</option>
                    <option value="ডিজিটাল মার্কেটিং">ডিজিটাল মার্কেটিং</option>
                    <option value="মোবাইল অ্যাপ ডেভেলপমেন্ট">মোবাইল অ্যাপ ডেভেলপমেন্ট</option>
                    <option value="ওয়েব ডেভেলপমেন্ট ও কোডিং">ওয়েব ডেভেলপমেন্ট ও কোডিং</option>
                    <option value="ধর্মীয় ও আধ্যাত্মিক">ধর্মীয় ও আধ্যাত্মিক</option>
                    <option value="চাকরি প্রস্তুতি ও বিসিএস">চাকরি প্রস্তুতি ও বিসিএস</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেভেল (Level)</label>
                  <select
                    value={uploadLevel}
                    onChange={(e) => setUploadLevel(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                  >
                    <option value="Beginner">Beginner (শিক্ষানবিস)</option>
                    <option value="Intermediate">Intermediate (মধ্যম)</option>
                    <option value="Advanced">Advanced (উচ্চতর)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={uploadPrice}
                    onChange={(e) => setUploadPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডিসকাউন্ট অফার মূল্য (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    min={0}
                    value={uploadDiscount}
                    onChange={(e) => setUploadDiscount(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কভার ফটো URL (JPG/PNG) *</label>
                  <input
                    type="url"
                    required
                    value={uploadCover}
                    onChange={(e) => setUploadCover(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">PDF ফাইল ডিরেক্ট URL *</label>
                  <input
                    type="url"
                    required
                    value={uploadPdf}
                    onChange={(e) => setUploadPdf(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                    placeholder="https://drive.google.com/... or direct PDF link"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বইয়ের বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  rows={3}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                  placeholder="বইটির পাঠকপ্রিয় অধ্যায় ও বৈশিষ্ট্য লিখুন..."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                স্বয়ংক্রিয়ভাবে যুক্ত হবে: সেলার UID: <b className="font-mono">{currentUser?.uid}</b>, নাম: <b>{seller?.fullName}</b>, ইমেইল: <b>{currentUser?.email}</b>, রেফারেল কোড: <b>{seller?.referralCode}</b>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3.5 rounded-xl shadow-lg transition text-sm disabled:opacity-50"
              >
                {uploading ? 'আপলোড হচ্ছে...' : 'ই-বুক সাবমিট করুন (অ্যাডমিন অনুমোদনের জন্য)'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: MEMBERSHIP PLANS & UPGRADE (3 Tiers, bKash/Nagad 01673860659) */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          {/* Active Membership & Approved Limit Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  বর্তমান সক্রিয় মেম্বারশিপ ও সীমা
                </span>
                <h3 className="text-base font-black text-slate-900">
                  👑 {seller?.membershipPlan?.toUpperCase() || 'FREE'} প্যাকেজ — আপলোড সীমা: <span className="text-emerald-700 font-black">{uploadLimit}টি বই</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  মোট আপলোড করা হয়েছে {totalUploaded}টি বই | বাকি আছে {remainingUploads}টি বই
                </p>
              </div>
            </div>
            {membershipRequests.some(r => r.status === 'approved') && (
              <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1 shadow-sm shrink-0">
                <Check className="w-4 h-4 text-emerald-200" />
                অ্যাডমিন অনুমোদিত
              </span>
            )}
          </div>

          {/* 3 Tiers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500">STARTER</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Free Seller</h3>
                <p className="text-2xl font-black text-slate-800 mt-2">৳০ <span className="text-xs text-slate-400 font-normal">/ আজীবন</span></p>
                <ul className="mt-4 text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> সর্বোচ্চ ৫টি ই-বুক আপলোড</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> সাধারণ ড্যাশবোর্ড ও সেলস ট্র্যাকিং</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 block text-center">ডিফল্ট প্ল্যান</span>
              </div>
            </div>

            {/* Standard */}
            <div className={`bg-white p-6 rounded-3xl border-2 shadow-md flex flex-col justify-between relative ${
              selectedPlan === 'standard' ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600">POPULAR</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Standard Seller</h3>
                <p className="text-2xl font-black text-emerald-700 mt-2">৳১৯৯ <span className="text-xs text-slate-400 font-normal">/ এককালীন</span></p>
                <ul className="mt-4 text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> ৫০টি বই আপলোড কোটা</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> অগ্রাধিকারভিত্তিক ই-বুক অনুমোদন</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan('standard')}
                className={`mt-6 py-2.5 rounded-xl font-black text-xs transition shadow-sm ${
                  selectedPlan === 'standard' ? 'bg-[#15803d] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedPlan === 'standard' ? '✓ নির্বাচিত' : 'নির্বাচন করুন'}
              </button>
            </div>

            {/* Premium */}
            <div className={`bg-white p-6 rounded-3xl border-2 shadow-md flex flex-col justify-between relative ${
              selectedPlan === 'premium' ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600">MAXIMUM</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Premium Seller</h3>
                <p className="text-2xl font-black text-emerald-700 mt-2">৳৬৯৯ <span className="text-xs text-slate-400 font-normal">/ এককালীন</span></p>
                <ul className="mt-4 text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> ২০০টি বই আপলোড সুবিধা</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> VIP ফিচার্ড প্রোমোশন সুবিধা</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan('premium')}
                className={`mt-6 py-2.5 rounded-xl font-black text-xs transition shadow-sm ${
                  selectedPlan === 'premium' ? 'bg-[#15803d] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedPlan === 'premium' ? '✓ নির্বাচিত' : 'নির্বাচন করুন'}
              </button>
            </div>
          </div>

          {/* Upgrade Payment Submission Box */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                নির্বাচিত প্ল্যান: <span className="text-emerald-700 uppercase">{selectedPlan}</span> (৳{selectedPlan === 'standard' ? 199 : 699})
              </h3>
              <p className="text-xs text-slate-500">
                বিকাশ বা নগদ নম্বরে <b>Send Money</b> করে TrxID প্রদান করুন।
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="block font-bold">পেমেন্ট নম্বর (Send Money):</span>
                <span className="text-lg font-mono font-black text-slate-900">{PAYMENT_NUMBER}</span>
              </div>
              <span className="text-[11px] text-slate-600">bKash / Nagad Personal</span>
            </div>

            <form onSubmit={handleMembershipSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড *</label>
                <select
                  value={memMethod}
                  onChange={(e) => setMemMethod(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">যে নম্বর থেকে টাকা পাঠিয়েছেন *</label>
                <input
                  type="tel"
                  required
                  value={memMobile}
                  onChange={(e) => setMemMobile(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Transaction ID (TrxID) *</label>
                <input
                  type="text"
                  required
                  value={memTrxId}
                  onChange={(e) => setMemTrxId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono uppercase font-bold"
                  placeholder="TrxID দিন"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={memSubmitting}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow transition text-sm disabled:opacity-50"
                >
                  {memSubmitting ? 'প্রসেসিং হচ্ছে...' : `৳${selectedPlan === 'standard' ? 199 : 699} মেম্বারশিপ আপগ্রেড রিকোয়েস্ট পাঠান`}
                </button>
              </div>
            </form>
          </div>

          {/* Previous Membership Requests */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-sm">মেম্বারশিপ আপগ্রেড রিকোয়েস্ট হিস্ট্রি</h4>
            {membershipRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">কোনো আপগ্রেড রিকোয়েস্ট নেই।</p>
            ) : (
              <div className="space-y-2">
                {membershipRequests.map((r) => (
                  <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        প্ল্যান: {r.newMembership.toUpperCase()} (৳{r.amount})
                      </p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {r.paymentMethod} {r.paymentMobile ? `(${r.paymentMobile})` : ''} • TrxID: {r.trxId}
                      </p>
                      {r.status === 'approved' && (
                        <p className="text-emerald-700 font-black text-[11px] mt-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          অনুমোদিত আপলোড সীমা: {r.newUploadLimit}টি বই সক্রিয় হয়েছে
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
                      r.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : r.status === 'rejected' 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {r.status === 'approved' && <Check className="w-3 h-3 text-emerald-700" />}
                      {r.status === 'pending' && <Clock className="w-3 h-3 text-amber-700" />}
                      {r.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-700" />}
                      {r.status === 'approved' ? 'Approved (অনুমোদিত)' : r.status === 'rejected' ? 'Rejected (বাতিল)' : 'Pending (অপেক্ষমান)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SELLER WITHDRAW (MIN ৳50, CHARGE ৳20) */}
      {activeTab === 'withdraw' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-slate-900 text-lg">সেলার বিক্রয় আয় উইথড্র করুন</h3>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-black shadow-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>প্রতিটি উইথড্রলে ফিক্সড চার্জ: ৳{withdrawCharge}</span>
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1.5">
                সর্বনিম্ন উত্তোলন: ৳{minWithdraw}। <b>সেলার প্রতিটি উইথড্রলে ফিক্সড ২০৳ প্রসেসিং চার্জ প্রযোজ্য।</b> বই বিক্রয়ের অর্থ সরাসরি আপনার ওয়ালেটে জমা হয়।
              </p>
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs md:text-sm font-medium flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  <b>উইথড্রল ফি নিয়ম (Seller Policy):</b> প্রতিটি সেলার উত্তোলনে <b>৳{withdrawCharge} ফিক্সড অ্যাডমিন চার্জ</b> প্রযোজ্য। নেট প্রদেয় = (উত্তোলনের মোট পরিমাণ − ৳{withdrawCharge})।
                </span>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">উত্তোলনের পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  min={minWithdraw}
                  max={Number(seller?.balance) || 0}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm md:text-base font-bold text-emerald-800"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>সর্বনিম্ন ৳{minWithdraw}</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(Math.max(0, Math.floor(Number(seller?.balance) || 0)))}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    সর্বোচ্চ (৳{(Number(seller?.balance) || 0).toFixed(2)})
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড *</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm md:text-base font-bold bg-white"
                >
                  <option value="bKash">bKash (বিকাশ পার্সোনাল)</option>
                  <option value="Nagad">Nagad (নগদ পার্সোনাল)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (বিকাশ/নগদ) *</label>
                <input
                  type="tel"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm md:text-base font-mono"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              {/* Real Earn / Payout Information Box */}
              <div className="md:col-span-3 bg-emerald-50/80 p-4 md:p-5 rounded-2xl border-2 border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-800 font-black">
                    <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      Withdrawal: <b className="text-slate-900 font-mono">৳{withdrawAmount}</b>
                    </span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-1 rounded-lg">
                      Charge: <b className="text-rose-600 font-mono">৳{withdrawCharge}</b>
                    </span>
                    <span className="text-slate-400 font-normal">|</span>
                    <span className="bg-emerald-100 border border-emerald-300 text-emerald-950 px-2.5 py-1 rounded-lg">
                      Received (Payout): <b className="text-emerald-700 font-mono font-black text-sm md:text-base">৳{Math.max(0, withdrawAmount - withdrawCharge)}</b>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <p>
                      • উইথড্রল সাবমিট করার পর অবশিষ্ট ব্যালেন্স: <b className="text-slate-900 font-mono font-bold">৳{Math.max(0, (Number(seller?.balance) || 0) - withdrawAmount).toFixed(2)}</b> (৳২০ চার্জ উইথড্রল এমাউন্ট থেকেই কাটা হবে, ব্যালেন্স থেকে অতিরিক্ত কাটা হবে না)।
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={withdrawing || withdrawAmount < minWithdraw || withdrawAmount > (Number(seller?.balance) || 0)}
                  className="bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-xl shadow transition disabled:opacity-50 active:scale-95 whitespace-nowrap"
                >
                  {withdrawing ? 'সাবমিট হচ্ছে...' : 'উইথড্র রিকোয়েস্ট পাঠান'}
                </button>
              </div>
            </form>
          </div>

          {/* Seller Withdrawal History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-base">সেলার উইথড্র হিস্ট্রি</h4>
                <p className="text-xs text-slate-500">আপনার পূর্ববর্তী সকল উত্তোলন অনুরোধ ও পেমেন্ট রেকর্ড</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                মোট: {withdrawals.length}টি
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <p className="text-xs md:text-sm text-slate-400 py-6 text-center">এখনও কোনো উইথড্র রেকর্ড নেই।</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => {
                  const itemCharge = w.charge !== undefined ? w.charge : 20;
                  const itemPayout = w.payoutAmount !== undefined ? w.payoutAmount : (w.netAmount !== undefined ? w.netAmount : Math.max(0, w.amount - itemCharge));
                  const itemRemaining = w.remainingBalance !== undefined ? w.remainingBalance : (w.previousBalance !== undefined ? Math.max(0, w.previousBalance - w.amount) : null);
                  const txId = w.reqId || w.requestId || w.transactionId || w.id;
                  const normStatus = (w.status || 'pending').toLowerCase();

                  return (
                    <div key={w.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs md:text-sm transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                            ID: {txId}
                          </span>
                          <span className="font-bold text-slate-700">
                            {w.paymentMethod || w.method || 'bKash'} ({w.paymentAccount || w.account})
                          </span>
                          {w.trxId && (
                            <span className="font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                              TrxID: {w.trxId}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">
                            Withdrawal: <b className="text-slate-900 font-black">৳{w.amount}</b>
                          </span>
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-rose-800 font-semibold">
                            Charge: <b className="text-rose-600 font-bold">৳{itemCharge}</b>
                          </span>
                          <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-950 font-semibold">
                            Seller Payout: <b className="text-emerald-700 font-black">৳{itemPayout}</b>
                          </span>
                          {itemRemaining !== null && (
                            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold">
                              Remaining Balance: <b className="text-slate-800 font-mono">৳{itemRemaining}</b>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                          তারিখ ও সময়: {w.createdAt ? new Date(w.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                        </p>
                      </div>

                      <div className="self-end md:self-center shrink-0">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase inline-flex items-center gap-1.5 ${
                          normStatus === 'paid' || normStatus === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : normStatus === 'rejected' 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {normStatus === 'paid' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid (পরিশোধিত)</span>
                            </>
                          ) : normStatus === 'approved' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approved</span>
                            </>
                          ) : normStatus === 'rejected' ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Rejected (বাতিল)</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending (অপেক্ষমান)</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT TICKET MANAGEMENT */}
      {activeTab === 'tickets' && (
        <SupportTicketSection
          userId={currentUser?.uid || ''}
          userRole="seller"
          userName={seller?.fullName || currentUser?.email || 'Seller'}
          userEmail={currentUser?.email || ''}
          userPhone={seller?.phone || seller?.paymentMobile}
        />
      )}
    </div>
  );
};
