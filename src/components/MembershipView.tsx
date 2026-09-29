import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  Smartphone, 
  Copy, 
  Check, 
  UploadCloud, 
  Sparkles,
  Award,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MembershipViewProps {
  onNavigateHome: () => void;
  onOpenSellerDashboard: () => void;
  onOpenAuth: (mode: 'user-register' | 'seller-register' | 'user-login') => void;
}

export const MembershipView: React.FC<MembershipViewProps> = ({
  onNavigateHome,
  onOpenSellerDashboard,
  onOpenAuth,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [copiedNumber, setCopiedNumber] = useState(false);
  const isSeller = userProfile?.role === 'seller';
  const PAYMENT_NUMBER = '01673860659';

  const copyPaymentNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Navigation Bar with Clear "← Home" Button */}
      <div className="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-black text-xs sm:text-sm transition bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 shadow-xs group"
          title="মূল হোম পেজে ফিরে যান"
        >
          <Home className="w-4 h-4 text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>← Home</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Crown className="w-4 h-4 text-amber-500" />
          <span>eBookBazar মেম্বারশিপ প্ল্যান</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#15803d] via-emerald-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md border border-amber-300/40 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" />
            <span>eBookBazar মেম্বারশিপ প্ল্যান</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            ই-বুক বিক্রি করুন ও গড়ে তুলুন স্থায়ী প্যাসিভ ইনকাম ক্যারিয়ার
          </h1>
          <p className="text-xs md:text-sm text-emerald-100 leading-relaxed font-medium">
            আপনার লেখা ও সংকলিত যেকোনো শিক্ষণীয়, স্কিল ডেভেলপমেন্ট বা গবেষণাধর্মী ই-বুক হাজার হাজার পাঠকের কাছে পৌঁছে দিন। আপনার জন্য উপযোগী মেম্বারশিপ প্ল্যান বেছে নিয়ে আজই শুরু করুন।
          </p>
        </div>
      </div>

      {/* 3 Main Membership Plans Detailed Grid */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            আমাদের মেম্বারশিপ প্ল্যান ও সুযোগ-সুবিধা
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            কোনো লুকানো চার্জ নেই। যেকোনো সময় আপনার প্রয়োজন অনুযায়ী প্ল্যান আপগ্রেড করার সম্পূর্ণ স্বাধীনতা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Plan 1: Free Starter */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-lg transition flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  STARTER
                </span>
                <span className="text-xs text-slate-400 font-bold">শুরু করার জন্য সেরা</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">ফ্রি সেলার (Free)</h3>
                <p className="text-xs text-slate-500 mt-1">নতুন লেখক ও প্রকাশকদের জন্য সম্পূর্ণ বিনামূল্যে</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">৳০</span>
                  <span className="text-xs text-slate-400 font-bold">/ আজীবন অ্যাক্সেস</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2 font-bold text-slate-900">
                  <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সর্বোচ্চ ৫টি ই-বুক আপলোড কোটা</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সম্পূর্ণ সক্রিয় সেলার ড্যাশবোর্ড</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>লাইভ সেলস ও অর্ডার ট্র্যাকিং</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>বিকাশ ও নগদ উইথড্র সুবিধা (ন্যূনতম ৫০৳)</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>স্ট্যান্ডার্ড ইমেইল সাপোর্ট</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              {isSeller ? (
                <button
                  onClick={onOpenSellerDashboard}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-2.5 rounded-xl text-xs transition"
                >
                  আপনার ড্যাশবোর্ডে যান
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('seller-register')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl text-xs transition shadow-sm"
                >
                  ফ্রি সেলার অ্যাকাউন্ট খুলুন
                </button>
              )}
            </div>
          </div>

          {/* Plan 2: Standard Plan */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-md hover:shadow-xl transition flex flex-col justify-between relative bg-emerald-50/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#15803d] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>মোস্ট পপুলার চয়েস</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  STANDARD
                </span>
                <span className="text-xs text-emerald-600 font-bold">৫০টি বই কোটা</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">স্ট্যান্ডার্ড সেলার (Standard)</h3>
                <p className="text-xs text-slate-500 mt-1">পেশাদার লেখক ও নিয়মিত ই-বুক নির্মাতাদের জন্য</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#15803d]">৳১৯৯</span>
                  <span className="text-xs text-slate-500 font-bold">/ এককালীন ফি</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2 font-bold text-slate-900">
                  <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>৫০টি পর্যন্ত ই-বুক আপলোড কোটা</span>
                </div>
                <div className="flex items-start gap-2 font-bold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>অগ্রাধিকার ভিত্তিতে দ্রুত বই অনুমোদন (Priority Approval)</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>প্রোফাইলে ভেরিফাইড সেলার গোল্ড ব্যাজ</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ফাস্ট-ট্র্যাক উইথড্রল প্রসেসিং</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সরাসরি হোয়াটসঅ্যাপ অ্যাডমিন সাপোর্ট</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-100">
              {isSeller ? (
                <button
                  onClick={onOpenSellerDashboard}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>স্ট্যান্ডার্ডে আপগ্রেড করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('seller-register')}
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>জয়েন করুন ও আপগ্রেড নিন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Plan 3: Premium VIP Plan */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-400 shadow-md hover:shadow-xl transition flex flex-col justify-between relative bg-amber-50/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-900 bg-amber-200 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-800" />
                  <span>PREMIUM VIP</span>
                </span>
                <span className="text-xs text-amber-700 font-bold">সর্বোচ্চ ভিজিবিলিটি</span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">প্রিমিয়াম ভিআইপি (Premium)</h3>
                <p className="text-xs text-slate-500 mt-1">প্রতিষ্ঠান, পাবলিশার্স ও টপ সেলারদের জন্য</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-800">৳৬৯৯</span>
                  <span className="text-xs text-slate-500 font-bold">/ এককালীন সাবস্ক্রিপশন</span>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/60 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2 font-bold text-slate-900">
                  <UploadCloud className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>২০০+ / আনলিমিটেড ই-বুক আপলোড সুবিধা</span>
                </div>
                <div className="flex items-start gap-2 font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>হোমপেইজ ব্যানার ও স্পেশাল ফিচারড প্রোমোশন</span>
                </div>
                <div className="flex items-start gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ইনস্ট্যান্ট উইথড্র ক্লিয়ারেন্স (সর্বোচ্চ অগ্রাধিকার)</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>সর্বনিম্ন প্ল্যাটফর্ম ফি কর্তন</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>২৪/৭ ডেডিকেটেড ভিআইপি সাপোর্ট ম্যানেজার</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-amber-200/60">
              {isSeller ? (
                <button
                  onClick={onOpenSellerDashboard}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>ভিআইপি প্রিমিয়ামে আপগ্রেড</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('seller-register')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>ভিআইপি সেলার রেজিস্ট্রেশন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How to Upgrade - Step-by-Step Payment Instructions */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900">
              কীভাবে মেম্বারশিপ আপগ্রেড করবেন? (পেমেন্ট ও সক্রিয়করণ নিয়ম)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              খুব সহজেই বিকাশ অথবা নগদের মাধ্যমে সেন্ড মানি করে আপনার প্ল্যান চালু করুন।
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">অফিসিয়াল পেমেন্ট নম্বর</span>
              <span className="font-mono font-black text-slate-900 text-sm">{PAYMENT_NUMBER}</span>
            </div>
            <button
              onClick={copyPaymentNumber}
              className="bg-[#15803d] hover:bg-emerald-800 text-white p-2 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
              title="নম্বর কপি করুন"
            >
              {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4 Step Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              ১
            </span>
            <h4 className="font-black text-slate-900 text-sm">প্ল্যান বেছে নিন</h4>
            <p className="text-slate-600 leading-relaxed">
              আপনার চাহিদা অনুযায়ী স্ট্যান্ডার্ড (৳১৯৯) বা প্রিমিয়াম ভিআইপি (৳৬৯৯) প্ল্যান নির্বাচন করুন।
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              ২
            </span>
            <h4 className="font-black text-slate-900 text-sm">Send Money করুন</h4>
            <p className="text-slate-600 leading-relaxed">
              বিকাশ বা নগদ থেকে আমাদের পার্সোনাল নম্বর <b className="font-mono text-slate-900">{PAYMENT_NUMBER}</b>-এ নির্ধারিত ফি পাঠিয়ে দিন।
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              ৩
            </span>
            <h4 className="font-black text-slate-900 text-sm">TrxID সাবমিট করুন</h4>
            <p className="text-slate-600 leading-relaxed">
              টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) ও প্রেরক নম্বর সেলার ড্যাশবোর্ডের আপগ্রেড ফর্মে দিন।
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              ৪
            </span>
            <h4 className="font-black text-slate-900 text-sm">তাৎক্ষণিক অ্যাক্টিভেশন</h4>
            <p className="text-slate-600 leading-relaxed">
              আমাদের ভেরিফিকেশন টিম সর্বোচ্চ ১৫-৩০ মিনিটের মধ্যে যাচাই করে আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে আপগ্রেড করে দেবে।
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions regarding Membership */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <span>মেম্বারশিপ সংক্রান্ত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-black text-slate-900 text-sm">১. ফ্রি সেলার অ্যাকাউন্টে কি কোনো মেয়াদ আছে?</h5>
            <p className="text-slate-600 leading-relaxed">
              না, ফ্রি সেলার অ্যাকাউন্ট আজীবন সক্রিয় থাকে। আপনি যেকোনো সময় সর্বোচ্চ ৫টি বই আপলোড করে বিক্রি করতে পারেন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-black text-slate-900 text-sm">২. মেম্বারশিপ ফি কি প্রতি মাসে দিতে হবে?</h5>
            <p className="text-slate-600 leading-relaxed">
              না, স্ট্যান্ডার্ড প্ল্যান (৳১৯৯) ও প্রিমিয়াম প্ল্যান (৳৬৯৯) একবার পরিশোধ করলেই দীর্ঘমেয়াদে নির্ধারিত কোটা অনুযায়ী বই আপলোডের পূর্ণ সুবিধা উপভোগ করবেন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-black text-slate-900 text-sm">৩. বিক্রয়লব্ধ টাকা কীভাবে তুলতে পারব?</h5>
            <p className="text-slate-600 leading-relaxed">
              আপনার ব্যালেন্সে ন্যূনতম ৫০ টাকা জমা হলেই সেলার ড্যাশবোর্ড থেকে বিকাশ অথবা নগদ অ্যাকাউন্টে উইথড্র রিকোয়েস্ট পাঠাতে পারবেন (সেলারদের প্রতিটি উত্তোলনে ফিক্সড ২০ টাকা প্রসেসিং ফি প্রযোজ্য)।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="font-black text-slate-900 text-sm">৪. আমার বই কি অন্য প্ল্যাটফর্মেও বিক্রি করতে পারব?</h5>
            <p className="text-slate-600 leading-relaxed">
              অবশ্যই! আপনার ই-বুকের পূর্ণ কপিরাইট ও স্বত্বাধিকার আপনার নিজের। eBookBazar কোনো এক্সক্লুসিভ স্বত্ব দাবি করে না।
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>সরাসরি সহযোগিতার জন্য হোয়াটসঅ্যাপ করুন: <b className="font-mono text-slate-900">+8801673860659</b></span>
          </div>
          <button
            onClick={onNavigateHome}
            className="text-emerald-700 hover:underline font-black text-xs flex items-center gap-1"
          >
            <span>মার্কেটপ্লেস বই ব্রাউজ করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
