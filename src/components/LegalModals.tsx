import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle, AlertTriangle, Scale, Lock, DollarSign } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="font-black text-lg">গোপনীয়তা নীতি (Privacy Policy)</h3>
              <p className="text-xs text-white/80">সর্বশেষ আপডেট: মার্চ ২০২৬ • eBookBazar</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 text-slate-700 text-xs md:text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-emerald-900 font-medium">
              eBookBazar আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও সুরক্ষায় সর্বোচ্চ অগ্রাধিকার দেয়। আমাদের সেবা ব্যবহারের সময় সংগৃহীত তথ্যের ব্যবহার সম্পর্কে এই নীতিমালায় সুস্পষ্ট ব্যাখ্যা দেওয়া হলো।
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ১. তথ্য সংগ্রহ ও প্রক্রিয়াকরণ
            </h4>
            <p>
              অ্যাকাউন্ট নিবন্ধন, বই ক্রয়, সেলার রেজিস্ট্রেশন বা অ্যাফিলিয়েট প্রোগ্রামে অংশগ্রহণের জন্য আমরা আপনার নাম, ইমেইল এড্রেস, মোবাইল নম্বর, জেলা/ঠিকানা এবং বিকাশ/নগদ পেমেন্ট ট্রানজেকশন আইডি সংগ্রহ করি।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ২. পেমেন্ট ও ট্রানজেকশন ডেটা সুরক্ষা
            </h4>
            <p>
              আমরা কখনোই ব্যবহারকারীর বিকাশ বা নগদ পিন (PIN) অথবা ওটিপি (OTP) সংরক্ষণ বা জিজ্ঞাসা করি না। ব্যবহারকারী কেবল ম্যানুয়াল সেন্ড মানি করে প্রাপ্ত বৈধ ট্রানজেকশন আইডি সাবমিট করেন, যা অ্যাডমিন টিম কর্তৃক সুরক্ষিতভাবে ভেরিফাই করা হয়।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৩. রেফারেল ও অ্যাকাউন্ট অখণ্ডতা
            </h4>
            <p>
              নিবন্ধনকালে তৈরি হওয়া আপনার স্থায়ী রেফারেল কোড সিস্টেম ডাটাবেসে অপরিবর্তনীয় হিসেবে সংরক্ষিত থাকে। লগইন, লগআউট, রিফ্রেশ বা প্রোফাইল আপডেটে এটি কখনো পরিবর্তন বা বিলুপ্ত হয় না।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৪. তৃতীয় পক্ষের সাথে তথ্য শেয়ারিং
            </h4>
            <p>
              আমরা কোনো বাণিজ্যিক বিজ্ঞাপন সংস্থা বা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বা ফোন নম্বর বিক্রি, বিনিময় বা শেয়ার করি না।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৫. কুকিজ ও ডিভাইস সিকিউরিটি
            </h4>
            <p>
              ব্যবহারকারীর সেশন এবং শপিং কার্ট সতেজ রাখতে সুরক্ষিত লোকাল স্টোরেজ ব্যবহার করা হয়।
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
          >
            আমি বুঝেছি ও সম্মত
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsConditionsModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-[#15803d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="font-black text-lg">শর্তাবলি ও নিয়মাবলি (Terms & Conditions)</h3>
              <p className="text-xs text-white/80">সর্বশেষ আপডেট: মার্চ ২০২৬ • eBookBazar Marketplace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 text-slate-700 text-xs md:text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Highlight Notice on Referral Policy */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-black text-amber-950 text-sm">
                রেফারেল কমিশন উপার্জনের সুনির্দিষ্ট ও বাধ্যতামূলক নিয়ম
              </h4>
              <p className="text-amber-900 leading-normal font-medium">
                রেফারেল কোড ব্যবহারের মাধ্যমে ৫০ টাকা কমিশন পাওয়ার নিয়মটি <b>শুধুমাত্র অ্যাডমিন কর্তৃক প্রকাশিত ই-বুক ক্রয়ের ক্ষেত্রে প্রযোজ্য</b>। কোনো ক্রেতা আপনার রেফারেল কোড দিয়ে অ্যাডমিন ই-বুক সফলভাবে কিনলে এবং অ্যাডমিন অনুমোদন দিলে আপনার ওয়ালেটে ৫০ টাকা জমা হবে। <b>সেলারদের ব্যক্তিগত ই-বুক রেফারেল কোড দিয়ে কিনলে কোনো রেফারেল কমিশন যোগ হবে না</b> (উক্ত বইয়ের সম্পূর্ণ বিক্রয় মূল্য সরাসরি সংশ্লিষ্ট সেলারের অ্যাকাউন্টে জমা হবে)।
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ১. সাধারণ নিয়মাবলী ও অ্যাকাউন্ট দায়িত্ব
            </h4>
            <p>
              eBookBazar-এ সেবা গ্রহণে ব্যবহারকারীকে সঠিক নাম, সক্রিয় ইমেইল ও মোবাইল নম্বর দিতে হবে। কোনো অসত্য তথ্য বা প্রতারণামূলক ট্রানজেকশন আইডি প্রদানের ক্ষেত্রে তাৎক্ষণিকভাবে অ্যাকাউন্ট স্থগিত করা হবে।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ২. ডিজিটাল ডেলিভারি ও রিফান্ড নীতি
            </h4>
            <p>
              ই-বুক একটি ডিজিটাল ফাইল (PDF)। পেমেন্ট ভেরিফাই হওয়ার সাথে সাথে বই ইউজারের ড্যাশবোর্ডের লাইব্রেরিতে যুক্ত হয়। যেহেতু ফাইলটি ডাউনলোড ও রিড করার সুযোগ থাকে, তাই <b>একবার সফলভাবে ক্রয়ের পর কোনো মূল্য ফেরতযোগ্য (Non-refundable) নয়</b>। তবে ফাইল ডাউনলোড বা পড়তে কোনো সমস্যা হলে সাপোর্ট টিম তাৎক্ষণিক সমাধান দিবে।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৩. সেলার নীতিমালা ও মেম্বারশিপ সীমা
            </h4>
            <p>
              সেলাররা কেবল তাদের নিজস্ব মালিকানাধীন অথবা কপিরাইট মুক্ত বই আপলোড করতে পারবেন। কোনো পাইরেসি বা বেআইনি কন্টেন্ট আপলোড করা নিষিদ্ধ।
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><b>ফ্রি মেম্বারশিপ:</b> সর্বোচ্চ ৫টি বই আপলোড।</li>
              <li><b>স্ট্যান্ডার্ড মেম্বারশিপ (৳১৯৯):</b> সর্বোচ্চ ৫০টি বই আপলোড।</li>
              <li><b>প্রিমিয়াম মেম্বারশিপ (৳৬৯৯):</b> সর্বোচ্চ ২০০টি বই আপলোড।</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৪. উইথড্রয়াল নীতি ও প্রসেসিং ফি
            </h4>
            <p>
              অ্যাফিলিয়েট আর্নিং এবং সেলার বুক ব্যালেন্স উইথড্র করার <b>সর্বনিম্ন পরিমাণ ৫০ টাকা</b>। প্রতি উইথড্রল রিকোয়েস্টে <b>২০ টাকা প্রসেসিং চার্জ</b> কেটে রাখা হয় এবং অবশিষ্ট নেট টাকা বিকাশ অথবা নগদ নম্বরে ২৪-৪৮ ঘণ্টার মধ্যে পাঠানো হয়।
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              ৫. প্ল্যাটফর্মের শর্ত পরিবর্তনের অধিকার
            </h4>
            <p>
              eBookBazar কর্তৃপক্ষ যেকোনো সময় দেশের ডিজিটাল কমার্স আইন অনুসারে এই শর্তাবলীতে পরিবর্তন ও পরিমার্জন করার অধিকার সংরক্ষণ করে।
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#15803d] hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
          >
            আমি শর্তাবলীতে সম্মতি জানাচ্ছি
          </button>
        </div>
      </div>
    </div>
  );
};
