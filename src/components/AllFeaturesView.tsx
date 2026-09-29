import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  BookOpen, 
  ShoppingBag, 
  Crown, 
  Wallet, 
  Settings, 
  Bell, 
  Share2, 
  Code, 
  Upload, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  UserCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AllFeaturesViewProps {
  onOpenAdmin: () => void;
  onNavigateSeller: () => void;
  onNavigateUser: () => void;
  onNavigateHome: () => void;
  onNavigateJob: () => void;
  onNavigateMembership: () => void;
}

export const AllFeaturesView: React.FC<AllFeaturesViewProps> = ({
  onOpenAdmin,
  onNavigateSeller,
  onNavigateUser,
  onNavigateHome,
  onNavigateJob,
  onNavigateMembership
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-2xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              সিস্টেম ফিচার এক্সপ্লোরার
            </span>
            <span className="bg-emerald-800/80 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600/60">
              অ্যাডমিন • সেলার • ইউজার • মার্কেটপ্লেস
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
            eBookBazar-এর সম্পূর্ণ কন্ট্রোল প্যানেল ও ফিচারসমূহ
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            এখানে অ্যাডমিন প্যানেলের ১২টি প্রশাসনিক টুল, সেলার ড্যাশবোর্ডের ৫টি ব্যবসায়িক ফিচার, এবং ইউজার ড্যাশবোর্ডের ৪টি ব্যক্তিগত ফিচার সরাসরি সাজানো রয়েছে। যেকোনো ফিচারে এক ক্লিকে প্রবেশ করুন।
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-emerald-800/60">
            <button
              onClick={onOpenAdmin}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 group"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-950" />
              <span>🛡️ অ্যাডমিন প্যানেল খুলুন</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={onNavigateSeller}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs md:text-sm px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 group"
            >
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span>💼 সেলার ড্যাশবোর্ড খুলুন</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={onNavigateUser}
              className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs md:text-sm px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 group border border-slate-600"
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>👤 ইউজার ড্যাশবোর্ড খুলুন</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={onNavigateHome}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>মার্কেটপ্লেস</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: ADMIN PANEL (12 ALL FEATURES) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">১. অ্যাডমিন প্যানেল (১২টি পূর্ণাঙ্গ ফিচার)</h2>
              <p className="text-xs text-slate-500">সম্পূর্ণ প্ল্যাটফর্ম নিয়ন্ত্রণ, অর্ডার অনুমোদন, ব্যবহারকারী ও অর্থ ব্যবস্থাপনা</p>
            </div>
          </div>
          <button
            onClick={onOpenAdmin}
            className="self-start sm:self-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <span>অ্যাডমিন প্যানেলে যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Admin Feature 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১. রিয়েলটাইম ওভারভিউ ও মেট্রিক্স</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              মোট ইউজার, সেলার সংখ্যা, মোট বিক্রিত ই-বুক, পেন্ডিং বুক ও অর্ডার, মেম্বারশিপ ও উইথড্রয়াল রিকোয়েস্ট এক নজরে পর্যবেক্ষণ।
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">লাইভ গ্রাফ ও মেট্রিক্স</span>
          </div>

          {/* Admin Feature 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">২. ইউজার ম্যানেজমেন্ট</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              নিবন্ধিত সকল গ্রাহকের প্রোফাইল অনুসন্ধান, রেফারেল কোড, অর্জিত রেফারেল ব্যালেন্স এবং অ্যাকাউন্ট স্ট্যাটাস নিয়ন্ত্রণ।
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">সার্চ ও ফিল্টার সুবিধা</span>
          </div>

          {/* Admin Feature 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৩. সেলার ম্যানেজমেন্ট ও লিমিট কন্ট্রোল</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              অনুমোদিত সেলারদের তালিকা, মেম্বারশিপ প্ল্যান, আপলোড লিমিট প্রদর্শন এবং অ্যাডমিন কর্তৃক ম্যানুয়ালি লিমিট বৃদ্ধির অপশন।
            </p>
            <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">কাস্টম আপলোড লিমিট</span>
          </div>

          {/* Admin Feature 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৪. ই-বুক অনুমোদন ও ক্যাটালগ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              সেলারদের আপলোড করা বইয়ের পিডিএফ রিভিউ, কভার প্রিভিউ, এক ক্লিকে অনুমোদন (Publish), বাতিলকরণ বা নতুন বই সরাসরি যুক্ত করা।
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ইন-অ্যাপ পিডিএফ রিভিউ</span>
          </div>

          {/* Admin Feature 5 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৫. অর্ডার ও পেমেন্ট ভেরিফিকেশন</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বিকাশ/নগদ ট্রানজেকশন আইডি মিলিয়ে অর্ডার অনুমোদন। অনুমোদন দিলে ক্রেতার লাইব্রেরিতে বই চলে যাবে ও রেফারেল বোনাস জমা হবে।
            </p>
            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">স্বয়ংক্রিয় লাইব্রেরি ডেলিভারি</span>
          </div>

          {/* Admin Feature 6 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৬. মেম্বারশিপ আপগ্রেড রিকোয়েস্ট</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              স্ট্যান্ডার্ড (৳১৯৯) ও প্রিমিয়াম (৳৬৯৯) সেলার মেম্বারশিপ ফি যাচাই করে অনুমোদন প্রদান। এতে সেলারদের ৫০ ও ২০০ বই লিমিট বৃদ্ধি পায়।
            </p>
            <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">স্বয়ংক্রিয় লিমিট বৃদ্ধি</span>
          </div>

          {/* Admin Feature 7 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৭. উইথড্রয়াল প্রসেসিং</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ইউজার ও সেলারদের বিকাশ/নগদে টাকা পাঠানোর পর রিকোয়েস্ট অনুমোদিত (Approved/Paid) চিহ্নিতকরণ ও অ্যাকাউন্ট ব্যালেন্স সমন্বয়।
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">পেমেন্ট হিস্ট্রি ট্র্যাকিং</span>
          </div>

          {/* Admin Feature 8 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৮. পেমেন্ট ও সিস্টেম সেটিংস</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              অফিশিয়াল বিকাশ ও নগদ নম্বর পরিবর্তন, পেমেন্ট গেটওয়ে চালু/বন্ধ, রেফারেল কমিশন রেট (৳৫০) ও উইথড্র চার্জ (৳২০) নির্ধারণ।
            </p>
            <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">লাইভ কনফিগারেশন</span>
          </div>

          {/* Admin Feature 9 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৯. গ্লোবাল নোটিফিকেশন ব্যানার</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ওয়েবসাইটের শীর্ষে তাৎক্ষণিক গুরুত্বপূর্ণ অফার, ইভেন্ট বা ঘোষণা ব্রডকাস্ট করা এবং এক ক্লিকে সক্রিয়/নিষ্ক্রিয় করার সুবিধা।
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">রিয়েলটাইম ব্রডকাস্ট</span>
          </div>

          {/* Admin Feature 10 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১০. অ্যাফিলিয়েট প্রোগ্রাম ওভারভিউ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              শীর্ষ রেফারারদের তালিকা, মোট প্রদেয় কমিশন এবং ব্যবহারকারীদের অর্জিত আয়ের স্বচ্ছ পরিসংখ্যান পর্যবেক্ষণ।
            </p>
            <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">রেফারেল পারফরম্যান্স</span>
          </div>

          {/* Admin Feature 11 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১১. সিকিউরিটি ও রুলস অডিট</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ফায়ারবেস রিয়েলটাইম ডেটাবেজের সুরক্ষা নীতি, রোল-ভিত্তিক অ্যাক্সেস এবং ব্যবহারকারীদের ডেটা প্রাইভেসি অডিট ভিউ।
            </p>
            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">ডেটাবেজ সিকিউরিটি</span>
          </div>

          {/* Admin Feature 12 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১২. XML এক্সপোর্ট ও সাইটম্যাপ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Blogger-এ ব্যাকআপ/রিস্টোর করার সম্পূর্ণ রেডি XML থিম কোড এবং Search Console-এর জন্য সাইটম্যাপ ফাইল দেখা ও ডাউনলোড।
            </p>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">১-ক্লিক কপি ও ডাউনলোড</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: SELLER DASHBOARD (5 ALL FEATURES) */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">২. সেলার ড্যাশবোর্ড (৫টি মূল ফিচার)</h2>
              <p className="text-xs text-slate-500">লেখক ও প্রকাশকদের বই বিক্রি, আপলোড লিমিট বৃদ্ধি এবং সরাসরি উইথড্রয়াল</p>
            </div>
          </div>
          <button
            onClick={onNavigateSeller}
            className="self-start sm:self-auto bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <span>সেলার ড্যাশবোর্ডে যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Seller Feature 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১. সেলস ও আর্নিং ওভারভিউ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              মোট আপলোডকৃত বই, অনুমোদিত বইয়ের সংখ্যা, বর্তমান ব্যালেন্স, মোট অর্জিত আয় এবং স্থায়ী সেলার রেফারেল কোড ডিসপ্লে।
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">ব্যালেন্স ট্র্যাকিং</span>
          </div>

          {/* Seller Feature 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">২. আপলোডকৃত বই ও স্টেটাস</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              নিজের আপলোড করা সব বইয়ের তালিকা, প্রতিটি বইয়ের স্ট্যাটাস (অ্যাপ্রুভড / পেন্ডিং), মূল্য ও সরাসরি প্রিভিউ সুবিধা।
            </p>
            <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">লাইভ স্টেটাস</span>
          </div>

          {/* Seller Feature 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৩. নতুন ই-বুক আপলোড ফর্ম</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বইয়ের শিরোনাম, ক্যাটাগরি, মূল্য, ডিসকাউন্ট মূল্য, কভার ফটো ইমেজ লিংক, গুগল ড্রাইভ/পিডিএফ লিংক ও বিবরণ দিয়ে সহজে বই জমা দিন।
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">সহজ আপলোড সিস্টেম</span>
          </div>

          {/* Seller Feature 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৪. মেম্বারশিপ আপগ্রেড (বই লিমিট বৃদ্ধি)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ফ্রি সেলার (৫টি বই) থেকে স্ট্যান্ডার্ড (৳১৯৯ তে ৫০টি বই) ও প্রিমিয়াম (৳৬৯৯ তে ২০০টি বই) আপগ্রেডের সরাসরি বিকাশ/নগদ পেমেন্ট ফর্ম।
            </p>
            <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">আনলিমিটেড আর্নিং</span>
          </div>

          {/* Seller Feature 5 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৫. ব্যালেন্স উইথড্রয়াল (বিকাশ / নগদ)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ন্যূনতম ৳৫০ ব্যালেন্স হলেই ২০ টাকা নির্ধারিত সার্ভার চার্জ বাদে বিকাশ বা নগদ একাউন্টে উইথড্র রিকোয়েস্ট পাঠানোর অপশন।
            </p>
            <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">দ্রুত ক্যাশ-আউট</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: USER DASHBOARD (4 ALL FEATURES) */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">৩. ইউজার ড্যাশবোর্ড (৪টি ব্যক্তিগত ফিচার)</h2>
              <p className="text-xs text-slate-500">বই পড়া, অর্ডার যাচাই, আজীবন রেফারেল ইনকাম ও ফ্রি উইথড্রয়াল</p>
            </div>
          </div>
          <button
            onClick={onNavigateUser}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <span>ইউজার ড্যাশবোর্ডে যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Feature 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">১. আমার লাইব্রেরি ও পিডিএফ রিডার</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ক্রয়কৃত সব বই চিরস্থায়ীভাবে সংরক্ষিত থাকে। সরাসরি অ্যাপের ভেতরে হাই-স্পিড পিডিএফ রিডারে বই পড়া ও ডাউনলোড করার সুবিধা।
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">ইন-অ্যাপ রিডার</span>
          </div>

          {/* User Feature 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">২. অর্ডার হিস্ট্রি ও ট্র্যাকিং</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              অর্ডারের তারিখ, পেমেন্ট ট্রানজেকশন আইডি (TrxID) এবং স্ট্যাটাস (পেন্ডিং / অ্যাপ্রুভড) লাইভ পর্যবেক্ষণ।
            </p>
            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">স্বচ্ছ ট্র্যাকিং</span>
          </div>

          {/* User Feature 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৩. রেফারেল ও ফ্রি উইথড্র ওয়ালেট</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রতি সফল রেফারেন্স ৫০ টাকা বোনাস। ইউজারের জন্য কোনো উইথড্র ফি নেই (০ টাকা চার্জ), ন্যূনতম ৫০ টাকা হলেই সরাসরি ক্যাশ-আউট।
            </p>
            <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">০% উইথড্র চার্জ</span>
          </div>

          {/* User Feature 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900">৪. প্রোফাইল ও বিকাশ/নগদ সেটিংস</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              নিজের নাম, ফোন নম্বর, ঠিকানা এবং রেফারেল বোনাস রিসিভ করার বিকাশ বা নগদ নম্বর যেকোনো সময় সহজে আপডেট করার সুবিধা।
            </p>
            <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">নিরাপদ তথ্য</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: DIGITAL SERVICES (6 PACKAGES) */}
      <section className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">আইটি সার্ভিস বোর্ড</span>
            <h2 className="text-xl font-black text-white">৪. জব ও সেবা (৬টি ডিজিটাল সার্ভিস প্যাকেজ)</h2>
            <p className="text-xs text-slate-400">YouTube, Blogger, WordPress ও সোশ্যাল মিডিয়া ব্র্যান্ডিং সেবা সরাসরি হোয়াটসঅ্যাপে অর্ডার</p>
          </div>
          <button
            onClick={onNavigateJob}
            className="bg-[#15803d] hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>সবগুলো প্যাকেজ দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳১,৫০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">YouTube আর্ট ও SEO</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳৮০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">Blogger Adsterra সাইট</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳১,৫০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">Blogger ই-কমার্স শপ</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳১,৫০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">WordPress পোর্টফোলিও</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳৫,০০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">WordPress ফুল ই-কমার্স</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-amber-400 text-xs font-black block">৳৫০০</span>
            <span className="text-[11px] font-bold text-slate-200 mt-1 block">Facebook/Insta ব্র্যান্ডিং</span>
          </div>
        </div>
      </section>
    </div>
  );
};
