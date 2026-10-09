import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Mail, Lock, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'user-login' | 'user-register' | 'seller-register' | 'admin-login';
  onLoginSuccess?: (role: 'admin' | 'seller' | 'user') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'user-login',
  onLoginSuccess
}) => {
  const { login, registerUser, registerSeller } = useAuth();
  const [mode, setMode] = useState<'user-login' | 'user-register' | 'seller-register' | 'admin-login'>(initialMode);
  
  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('বাংলাদেশ');
  const [district, setDistrict] = useState('ঢাকা');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [paymentMobile, setPaymentMobile] = useState('');
  const [referredBy, setReferredBy] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'user-login' || mode === 'admin-login') {
        const result = await login(email, password);
        setLoading(false);
        onClose();
        if (onLoginSuccess) {
          const role = (result?.isAdmin || result?.profile?.role === 'admin')
            ? 'admin'
            : (result?.profile?.role === 'seller' ? 'seller' : 'user');
          onLoginSuccess(role);
        }
      } else if (mode === 'user-register') {
        if (!fullName.trim() || !phone.trim()) {
          throw new Error('নাম এবং মোবাইল নম্বর অবশ্যই প্রদান করতে হবে।');
        }
        await registerUser({
          username: email.split('@')[0],
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country,
          address: district,
          paymentMethod,
          paymentMobile: (paymentMobile.trim() || phone.trim()),
          pass: password,
          referredBy: referredBy.trim()
        });
        setLoading(false);
        alert('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! আপনার একটি অনন্য রেফারেল কোড তৈরি হয়েছে।');
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess('user');
        }
      } else if (mode === 'seller-register') {
        if (!fullName.trim() || !paymentMobile.trim()) {
          throw new Error('সেলার নাম এবং পেমেন্ট নম্বর অবশ্যই প্রদান করতে হবে।');
        }
        await registerSeller({
          sellerName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || paymentMobile.trim(),
          paymentMethod,
          paymentMobile: paymentMobile.trim(),
          pass: password,
          referredBy: referredBy.trim()
        });
        setLoading(false);
        alert('সেলার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এখন আপনি সেলার ড্যাশবোর্ডে প্রবেশ করতে পারবেন।');
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess('seller');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'একটি ত্রুটি ঘটেছে, আবার চেষ্টা করুন।');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-[#15803d] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg">
              {mode === 'user-login' && 'লগইন করুন'}
              {mode === 'admin-login' && 'অ্যাডমিন লগইন'}
              {mode === 'user-register' && 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              {mode === 'seller-register' && 'সেলার হিসেবে রেজিস্ট্রেশন'}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              {mode === 'seller-register' 
                ? 'ই-বুক বিক্রি করে আয় করুন' 
                : mode === 'admin-login'
                ? 'সুরক্ষিত অ্যাডমিনিস্ট্রেশন পোর্টাল'
                : 'eBookBazar মার্কেটপ্লেসে স্বাগতম'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-rose-600 text-white flex items-center justify-center transition font-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 text-xs font-black">
          <button
            type="button"
            onClick={() => { setMode('user-login'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'user-login' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500'
            }`}
          >
            লগইন
          </button>
          <button
            type="button"
            onClick={() => { setMode('user-register'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'user-register' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500'
            }`}
          >
            ইউজার সাইন-আপ
          </button>
          <button
            type="button"
            onClick={() => { setMode('seller-register'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              mode === 'seller-register' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30' : 'border-transparent text-slate-500'
            }`}
          >
            সেলার সাইন-আপ
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name for Registration */}
          {(mode === 'user-register' || mode === 'seller-register') && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {mode === 'seller-register' ? 'সেলার নাম (Seller Name) *' : 'পূর্ণ নাম (Full Name) *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                  placeholder="আপনার নাম লিখুন"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা (Email) *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                placeholder="name@example.com"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">পাসওয়ার্ড (Password) *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600"
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* User Registration specific fields */}
          {mode === 'user-register' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                    placeholder="01XXXXXXXXX"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">দেশ (Country)</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">জেলা / শহর</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">কারো রেফারেল কোড থাকলে দিন (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase font-bold text-amber-700"
                  placeholder="রেফারেল কোড (যেমন: EBK12345)"
                />
              </div>

              {/* Payment method selection & mobile number for User referral earnings */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 text-xs">
                    রেফারেল ও পেমেন্ট মেথড (কমিশন উত্তোলনের জন্য)
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                    ৫০৳ বোনাস
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="bKash">বিকাশ (bKash)</option>
                      <option value="Nagad">নগদ (Nagad)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বিকাশ / নগদ নম্বর *</label>
                    <input
                      type="tel"
                      value={paymentMobile}
                      onChange={(e) => setPaymentMobile(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                      placeholder={phone || '01XXXXXXXXX'}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  অ্যাডমিন ই-বুক রেফার করে অর্জিত ৫০ টাকা কমিশন এই বিকাশ বা নগদ নম্বরে ট্রান্সফার করা হবে।
                </p>
              </div>
            </>
          )}

          {/* Seller Registration specific fields */}
          {mode === 'seller-register' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড (Payment Method) *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value="bKash">bKash (বিকাশ Personal)</option>
                  <option value="Nagad">Nagad (নগদ Personal)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট রিসিভ মোবাইল নম্বর *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={paymentMobile}
                    onChange={(e) => setPaymentMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold"
                    placeholder="01XXXXXXXXX"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  বিক্রয়লব্ধ আয়ের টাকা এই নম্বরে প্রদান করা হবে।
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow-lg transition text-sm disabled:opacity-50 mt-2 active:scale-[0.99]"
          >
            {loading ? 'প্রসেসিং হচ্ছে...' : (
              mode === 'user-login' ? 'লগইন করুন' :
              mode === 'admin-login' ? 'অ্যাডমিন প্রবেশ' :
              mode === 'user-register' ? 'অ্যাকাউন্ট তৈরি করুন' : 'সেলার অ্যাকাউন্ট রেজিস্টার করুন'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
