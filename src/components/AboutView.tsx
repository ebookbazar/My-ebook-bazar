import React from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  Home, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Award, 
  HeartHandshake, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Lock, 
  ArrowRight
} from 'lucide-react';

interface AboutViewProps {
  onNavigateHome: () => void;
  onNavigateAffiliate?: () => void;
  onNavigateMembership?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateHome,
  onNavigateAffiliate,
  onNavigateMembership
}) => {
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
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>eBookBazar • অফিসিয়াল পোর্টাল</span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-[#0f4325] via-slate-900 to-[#14532d] text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden border border-emerald-700/60">
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md border border-amber-300/40 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>আমাদের পরিচিতি ও লক্ষ্য</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            eBook<span className="text-amber-300">Bazar</span> সম্পর্কে জানুন
          </h1>
          <p className="text-sm md:text-base text-emerald-100 leading-relaxed font-medium">
            বাংলাদেশের পাঠক, লেখক ও উদ্যোক্তাদের জন্য একটি আধুনিক, সুরক্ষিত ও নির্ভরযোগ্য ডিজিটাল ই-বুক মার্কেটপ্লেস। ঘরে বসেই যেকোনো ডিভাইসে শিক্ষণীয়, স্কিল ডেভেলপমেন্ট ও ক্যারিয়ার সহায়ক বই পড়ার সুবর্ণ সুযোগ।
          </p>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
            <BookOpen className="w-6 h-6 text-[#15803d]" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">সমৃদ্ধ ডিজিটাল লাইব্রেরি</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            প্রোগ্রামিং, ফ্রিল্যান্সিং, আত্মউন্নয়ন, ইসলাম ও ক্যারিয়ার প্রস্তুতির শত শত প্রিমিয়াম বাংলা ই-বুক। সরাসরি ব্রাউজারে পড়ার পাশাপাশি আজীবন PDF ডাউনলোডের নিশ্চয়তা।
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
            <TrendingUp className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">লেখক ও সেলারদের আয়</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            যেকোনো লেখক বা সংকলক সহজেই সেলার হিসেবে যুক্ত হয়ে বই বিক্রি করতে পারেন। ফ্রেন্ডলি মেম্বারশিপ প্ল্যান ও স্বচ্ছ উইথড্রল সিস্টেমে সহজে বিকাশ/নগদে আয় গ্রহণ করুন।
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
            <HeartHandshake className="w-6 h-6 text-purple-700" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">আজীবন অ্যাফিলিয়েট প্রোগ্রাম</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            প্রতিটি ব্যবহারকারীর জন্য অনন্য স্থায়ী রেফারেল কোড। আপনার লিংকে অ্যাডমিন বই বিক্রি হলে সাথে সাথে ৫০ টাকা নিশ্চিত কমিশন এবং সহজ উইথড্র সুবিধা।
          </p>
        </div>
      </div>

      {/* Trust & Guarantees */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">আমাদের নিরাপত্তা ও প্রতিশ্রুতি</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">কেন eBookBazar ব্যবহার করবেন?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">তাত্ক্ষণিক ডেলিভারি</h4>
              <p className="text-xs text-slate-600 mt-0.5">পেমেন্ট ভেরিফিকেশন সফল হওয়ার সাথে সাথে ড্যাশবোর্ডের লাইব্রেরিতে বই যুক্ত হয়।</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">১০০% সুরক্ষিত লেনদেন</h4>
              <p className="text-xs text-slate-600 mt-0.5">বিকাশ ও নগদ ম্যানুয়াল সেন্ড মানিতে স্বচ্ছ ও নিরাপদ ভেরিফিকেশন সিস্টেম।</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">কপিরাইট সুরক্ষা</h4>
              <p className="text-xs text-slate-600 mt-0.5">পাইরেসি রোধে কঠোর মনিটরিং এবং শুধুমাত্র মানসম্পন্ন বইয়ের প্রকাশনা।</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">২৪/৭ কাস্টমার সাপোর্ট</h4>
              <p className="text-xs text-slate-600 mt-0.5">যেকোনো প্রশ্ন, অর্ডার অনুসন্ধান বা বই সংক্রান্ত সহায়তায় আমাদের টিম সক্রিয়।</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer with Home Return */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-black">আমাদের সাথে যুক্ত হয়ে নতুন কিছু শিখুন</h3>
          <p className="text-xs sm:text-sm text-slate-300">হোম পেজে ফিরে গিয়ে আমাদের আকর্ষণীয় বইগুলোর ক্যাটালগ ঘুরে দেখুন।</p>
        </div>
        <button
          onClick={onNavigateHome}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition shadow-md flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>← Home-এ ফিরে যান</span>
        </button>
      </div>
    </div>
  );
};
