import React from 'react';
import { 
  Scale, 
  Home, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  BookOpen, 
  ArrowLeft 
} from 'lucide-react';

interface TermsViewProps {
  onNavigateHome: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
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
          <Scale className="w-4 h-4 text-emerald-700" />
          <span>ব্যবহারকারীর নিয়ম ও শর্তাবলি</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-sm space-y-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-700" />
            <span>অফিসিয়াল নীতিমালা</span>
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            শর্তাবলি ও নিয়মাবলি (Terms & Conditions)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            সর্বশেষ আপডেট: মার্চ ২০২৬ • eBookBazar Marketplace
          </p>
        </div>

        {/* Highlight Notice on Referral Policy */}
        <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-start gap-3.5 shadow-xs">
          <DollarSign className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-amber-950 text-sm md:text-base">
              রেফারেল কমিশন উপার্জনের সুনির্দিষ্ট ও বাধ্যতামূলক নিয়ম
            </h4>
            <p className="text-amber-900 text-xs sm:text-sm leading-relaxed font-medium">
              রেফারেল কোড ব্যবহারের মাধ্যমে ৫০ টাকা কমিশন পাওয়ার নিয়মটি <b>শুধুমাত্র অ্যাডমিন কর্তৃক প্রকাশিত ই-বুক ক্রয়ের ক্ষেত্রে প্রযোজ্য</b>। কোনো ক্রেতা আপনার রেফারেল কোড দিয়ে অ্যাডমিন ই-বুক সফলভাবে কিনলে এবং অ্যাডমিন অনুমোদন দিলে আপনার ওয়ালেটে ৫০ টাকা জমা হবে। <b>সেলারদের ব্যক্তিগত ই-বুক রেফারেল কোড দিয়ে কিনলে কোনো রেফারেল কমিশন যোগ হবে না</b> (উক্ত বইয়ের সম্পূর্ণ বিক্রয় মূল্য সরাসরি সংশ্লিষ্ট সেলারের অ্যাকাউন্টে জমা হবে)।
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-slate-700 text-xs sm:text-sm md:text-base leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>১. সাধারণ নিয়মাবলী ও অ্যাকাউন্ট দায়িত্ব</span>
            </h3>
            <p className="text-slate-600 pl-4">
              eBookBazar-এ সেবা গ্রহণে ব্যবহারকারীকে সঠিক নাম, সক্রিয় ইমেইল ও মোবাইল নম্বর দিতে হবে। কোনো অসত্য তথ্য বা প্রতারণামূলক ট্রানজেকশন আইডি প্রদানের ক্ষেত্রে তাৎক্ষণিকভাবে অ্যাকাউন্ট স্থায়ীভাবে স্থগিত করা হবে।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>২. ডিজিটাল ডেলিভারি ও রিফান্ড নীতি</span>
            </h3>
            <p className="text-slate-600 pl-4">
              ই-বুক একটি ডিজিটাল ফাইল (PDF)। পেমেন্ট ভেরিফাই হওয়ার সাথে সাথে বই ইউজারের ড্যাশবোর্ডের লাইব্রেরিতে যুক্ত হয়। যেহেতু ফাইলটি তাত্ক্ষণিক ডাউনলোড ও রিড করার সুযোগ থাকে, তাই <b>একবার সফলভাবে ক্রয়ের পর কোনো মূল্য ফেরতযোগ্য (Non-refundable) নয়</b>। তবে ফাইল ডাউনলোড বা পড়তে কোনো প্রযুক্তিগত সমস্যা হলে সাপোর্ট টিম ২৪ ঘণ্টার মধ্যে সমাধান দিবে।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>৩. সেলার নীতিমালা ও মেম্বারশিপ সীমা</span>
            </h3>
            <p className="text-slate-600 pl-4">
              সেলাররা কেবল তাদের নিজস্ব মালিকানাধীন অথবা কপিরাইট মুক্ত বৈধ বই আপলোড করতে পারবেন। কোনো পাইরেসি বা বেআইনি কন্টেন্ট আপলোড করা সম্পূর্ণ নিষিদ্ধ।
            </p>
            <div className="pl-4 pt-1">
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                <li><b>ফ্রি মেম্বারশিপ:</b> সর্বোচ্চ ৫টি বই আপলোড ও প্ল্যাটফর্মে বিক্রির সুযোগ।</li>
                <li><b>স্ট্যান্ডার্ড মেম্বারশিপ (৳১৯৯):</b> সর্বোচ্চ ৫০টি বই আপলোড ও অগ্রাধিকারভিত্তিক অনুমোদন।</li>
                <li><b>প্রিমিয়াম মেম্বারশিপ (৳৬৯৯):</b> সর্বোচ্চ ২০০টি বই আপলোড, আনলিমিটেড লাইব্রেরি অ্যাক্সেস ও ভিআইপি সাপোর্ট।</li>
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>৪. উইথড্রয়াল নীতি ও প্রসেসিং ফি</span>
            </h3>
            <p className="text-slate-600 pl-4">
              অ্যাফিলিয়েট আর্নিং এবং সেলার বুক ব্যালেন্স উইথড্র করার <b>সর্বনিম্ন পরিমাণ ৫০ টাকা</b>। প্রতি উইথড্রল রিকোয়েস্টে <b>২০ টাকা প্রসেসিং চার্জ</b> কেটে রাখা হয় এবং অবশিষ্ট নেট টাকা বিকাশ অথবা নগদ নম্বরে ২৪–৪৮ ঘণ্টার মধ্যে সফলভাবে পরিশোধ করা হয়।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>৫. প্ল্যাটফর্মের শর্ত পরিবর্তনের অধিকার</span>
            </h3>
            <p className="text-slate-600 pl-4">
              eBookBazar কর্তৃপক্ষ যেকোনো সময় দেশের ডিজিটাল কমার্স আইন অনুসারে এই শর্তাবলীতে পরিবর্তন ও পরিমার্জন করার অধিকার সংরক্ষণ করে।
            </p>
          </section>
        </div>

        {/* Bottom Home Action Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            যেকোনো অতিরিক্ত তথ্যের জন্য আমাদের লাইভ চ্যাট অথবা সাধারণ জিজ্ঞাসা (FAQ) দেখুন।
          </p>
          <button
            onClick={onNavigateHome}
            className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
          >
            <Home className="w-4 h-4" />
            <span>← Home-এ ফিরে যান</span>
          </button>
        </div>
      </div>
    </div>
  );
};
