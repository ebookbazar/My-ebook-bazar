import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  ArrowLeft,
  MessageCircle,
  Copy,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartItem, Ebook } from '../types';
import { db, push, set, ref, serverTimestamp } from '../firebase';

interface CheckoutViewProps {
  directItem: Ebook | null;
  onBack: () => void;
  onSuccess: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  directItem,
  onBack,
  onSuccess,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { cart, clearCart, totalAmount } = useCart();

  const itemsToBuy: Array<{
    id: string;
    title: string;
    price: number;
    qty: number;
    sellerId?: string;
    sellerName?: string;
    sellerEmail?: string;
    sellerReferralCode?: string;
    isSeller?: boolean;
  }> = directItem ? [{
    id: directItem.id,
    title: directItem.title,
    price: directItem.discountPrice || directItem.price,
    qty: 1,
    sellerId: directItem.sellerId,
    sellerName: directItem.sellerName,
    sellerEmail: directItem.sellerEmail,
    sellerReferralCode: directItem.sellerReferralCode,
    isSeller: Boolean(
      directItem.isSeller === true || 
      (directItem.sellerId && directItem.sellerId !== 'ADMIN' && directItem.sellerId !== 'admin')
    ),
  }] : cart.map(i => ({
    id: i.id,
    title: i.title,
    price: i.price,
    qty: i.qty,
    sellerId: i.sellerId,
    sellerName: i.sellerName,
    sellerEmail: i.sellerEmail,
    sellerReferralCode: i.sellerReferralCode,
    isSeller: Boolean(
      i.isSeller === true || 
      (i.sellerId && i.sellerId !== 'ADMIN' && i.sellerId !== 'admin')
    ),
  }));

  const calculatedTotal = directItem 
    ? (directItem.discountPrice || directItem.price) 
    : totalAmount;

  // Checkout form fields
  const [buyerName, setBuyerName] = useState(userProfile?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  const [buyerCountry, setBuyerCountry] = useState(userProfile?.country || 'Bangladesh');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [paymentMobile, setPaymentMobile] = useState('');
  const [trxId, setTrxId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const PAYMENT_NUMBER = '01673860659';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER).then(() => {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('অর্ডার করার জন্য অনুগ্রহ করে প্রথমে লগইন করুন।');
      return;
    }

    if (!paymentMobile || !trxId) {
      alert('অনুগ্রহ করে আপনার পেমেন্ট নম্বর এবং Transaction ID (TrxID) সঠিকভাবে প্রদান করুন।');
      return;
    }

    if (itemsToBuy.length === 0) {
      alert('অর্ডার করার কোনো বই পাওয়া যায়নি।');
      return;
    }

    setSubmitting(true);
    try {
      // Create separate order entries or bundled entry with unique Order ID
      const ordersRef = ref(db, 'orders');
      
      for (const item of itemsToBuy) {
        const orderKey = push(ordersRef).key || `ORD-${Date.now()}`;
        const uniqueOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const orderData = {
          id: orderKey,
          orderId: uniqueOrderId,
          buyerId: currentUser.uid,
          buyerName: buyerName.trim() || currentUser.displayName || 'Buyer',
          buyerEmail: buyerEmail.trim() || currentUser.email || '',
          buyerCountry: buyerCountry.trim(),
          bookId: item.id,
          bookTitle: item.title,
          amount: item.price * item.qty,
          sellerId: item.sellerId || 'ADMIN',
          sellerName: item.sellerName || 'eBookBazar Admin',
          sellerEmail: item.sellerEmail || 'admin@ebookbazar.com',
          sellerReferralCode: item.sellerReferralCode || '',
          isSeller: !!item.isSeller,
          paymentMethod,
          paymentMobile: paymentMobile.trim(),
          trxId: trxId.trim().toUpperCase(),
          referralCode: referralCode.trim().toUpperCase() || null,
          status: 'pending',
          commissionProcessed: false,
          createdAt: Date.now()
        };

        await set(ref(db, `orders/${orderKey}`), orderData);
      }

      if (!directItem) {
        clearCart();
      }

      setSubmitting(false);
      onSuccess();
    } catch (err: any) {
      console.error('Order submission error:', err);
      alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>পূর্ববর্তী পেজে ফিরে যান</span>
      </button>

      {/* Main Checkout Container */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            SECURE CHECKOUT
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            পেমেন্ট ও অর্ডার সম্পন্ন করুন
          </h2>
          <p className="text-xs text-slate-500">
            বিকাশ বা নগদ সেন্ড মানি করে অর্ডার সাবমিট করুন। অ্যাডমিন অনুমোদনের পর সাথে সাথে লাইব্রেরিতে পেয়ে যাবেন।
          </p>
        </div>

        {/* Order Summary Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
            অর্ডারকৃত ই-বুক বিবরণ:
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {itemsToBuy.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-bold text-slate-900">{item.title} (×{item.qty})</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.isSeller ? (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        সেলার ই-বুক (রেফারেল বোনাস মুক্ত)
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        অ্যাডমিন ই-বুক (৫০৳ রেফারেল প্রযোজ্য)
                      </span>
                    )}
                    {item.sellerName && (
                      <span className="text-[10px] text-slate-500">• {item.sellerName}</span>
                    )}
                  </div>
                </div>
                <span className="font-black text-emerald-700">৳{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black">
            <span className="text-slate-800 text-sm">সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-2xl text-emerald-700">৳{calculatedTotal}</span>
          </div>
        </div>

        {/* Payment Instructions (bKash / Nagad) */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <span>Send Money পেমেন্ট নির্দেশনা:</span>
          </div>
          <p className="leading-relaxed">
            আপনার বিকাশ অথবা নগদ অ্যাকাউন্ট থেকে নিচের নম্বরে <b>Send Money</b> করুন:
          </p>
          <div className="bg-white p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ব্যক্তিগত পেমেন্ট নম্বর (Send Money)</span>
              <span className="text-lg md:text-xl font-mono font-black text-slate-900 tracking-wider">
                {PAYMENT_NUMBER}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600">
            টাকা পাঠানোর পর প্রাপ্ত <b>Transaction ID (TrxID)</b> ও আপনার <b>বিকাশ/নগদ নম্বর</b> নিচের ফর্মে লিখে অর্ডার জমা দিন।
          </p>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">আপনার পূর্ণ নাম *</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                placeholder="নাম লিখুন"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ইমেইল অ্যাড্রেস *</label>
              <input
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">দেশ (Country)</label>
              <input
                type="text"
                value={buyerCountry}
                onChange={(e) => setBuyerCountry(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                placeholder="Bangladesh"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">রেফারেল কোড (ঐচ্ছিক)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm uppercase font-mono font-bold text-emerald-800"
                placeholder="রেফারেল কোড (যেমন: REF-XXXXX)"
              />
              {referralCode.trim() && userProfile?.referralCode && referralCode.trim().toUpperCase() === userProfile.referralCode.toUpperCase() ? (
                <p className="text-[11px] text-rose-600 font-bold mt-1 leading-snug">
                  ⚠️ এটি আপনার নিজস্ব রেফারেল কোড। সেলফ-রেফারেল (Self-referral) নিষিদ্ধ। নিজের কোড দিয়ে বই কিনলে রেফারেল কমিশন প্রযোজ্য হবে না (৳০)।
                </p>
              ) : (
                <p className="text-[11px] text-emerald-800 font-medium mt-1 leading-snug">
                  💡 অ্যাডমিন ই-বুক ক্রয়ের ক্ষেত্রে রেফারেল কোড দিলে অর্ডার অনুমোদনের পর কোডের মালিক ৳৫০ কমিশন পাবেন (সেলার ই-বুকে রেফারেল কমিশন নেই)। ক্রেতা কোনো কমিশন পাবেন না (৳০)।
                </p>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড নির্বাচন করুন *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                paymentMethod === 'bKash' ? 'border-pink-500 bg-pink-50/50' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === 'bKash'}
                    onChange={() => setPaymentMethod('bKash')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <span className="font-black text-slate-900 text-sm">bKash (বিকাশ)</span>
                </div>
                <span className="text-[10px] bg-pink-500 text-white font-bold px-2 py-0.5 rounded">01673860659</span>
              </label>

              <label className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition ${
                paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === 'Nagad'}
                    onChange={() => setPaymentMethod('Nagad')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-black text-slate-900 text-sm">Nagad (নগদ)</span>
                </div>
                <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded">01673860659</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">যে নম্বর থেকে টাকা পাঠিয়েছেন *</label>
              <input
                type="tel"
                required
                value={paymentMobile}
                onChange={(e) => setPaymentMobile(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Transaction ID (TrxID) *</label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono uppercase font-bold"
                placeholder="e.g. 9J87X..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#15803d] hover:bg-emerald-800 text-white py-3.5 rounded-xl font-black text-sm md:text-base transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'অর্ডার প্রসেস হচ্ছে...' : `৳${calculatedTotal} পেমেন্ট জমা দিন`}</span>
            </button>
          </div>

          {/* Instant WhatsApp Verification Assist */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/8801673860659?text=${encodeURIComponent(`Assalamu Alaikum, I have made a payment on eBookBazar.\nAmount: ৳${calculatedTotal}\nTrxID: ${trxId || 'N/A'}\nMethod: ${paymentMethod}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>জরুরি প্রয়োজনে WhatsApp-এ সরাসরি পেমেন্ট স্লিপ পাঠান</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
