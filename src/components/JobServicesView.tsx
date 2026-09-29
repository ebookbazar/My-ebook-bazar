import React from 'react';
import { 
  Briefcase, 
  Youtube, 
  Globe, 
  ShoppingCart, 
  Layout, 
  Image as ImageIcon, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface JobServicesViewProps {
  onNavigateAffiliate: () => void;
  onNavigateHome: () => void;
}

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  highlight?: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  deliveryTime: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'yt-branding',
    title: 'YouTube চ্যানেল আর্ট, লোগো ও সম্পূর্ণ চ্যানেল SEO',
    category: 'ইউটিউব ব্র্যান্ডিং ও এসইও',
    price: 1500,
    icon: <Youtube className="w-6 h-6 text-red-600" />,
    description: 'প্রফেশনাল কাস্টম চ্যানেল আর্ট/ব্যানার, আকর্ষণীয় লোগো এবং ফুল চ্যানেল কীওয়ার্ড ও ভিডিও SEO সেটআপ।',
    features: [
      'হাই-কোয়ালিটি কাস্টম চ্যানেল ব্যানার (Art)',
      'প্রফেশনাল আইকনিক প্রোফাইল লোগো',
      'সম্পূর্ণ চ্যানেল ট্যাগ ও কীওয়ার্ড SEO',
      'ভিডিও র‍্যাঙ্কিং ও প্রফেশনাল চ্যানেল লেআউট'
    ],
    deliveryTime: '২৪-৪৮ ঘণ্টা'
  },
  {
    id: 'blogger-adsterra',
    title: 'Blogger Adsterra মনিটাইজেশন ওয়েবসাইট তৈরি',
    category: 'ব্লগার আর্নিং সল্যুশন',
    price: 800,
    icon: <Globe className="w-6 h-6 text-orange-500" />,
    description: 'ব্লগারের মাধ্যমে রেডিমেড ওয়েবসাইট তৈরি ও Adsterra হাই-সিপিএম অ্যাড প্লেসমেন্ট ফুল সেটআপ।',
    features: [
      'রেসপন্সিভ প্রিমিয়াম ব্লগার থিম সেটআপ',
      'Adsterra বিজ্ঞাপন কোড নির্ভুল ইন্টিগ্রেশন',
      'হাই-সিপিএম অ্যাড লেআউট ডিজাইন',
      'দ্রুত লোডিং স্পিড ও মোবাইল ফ্রেন্ডলি'
    ],
    deliveryTime: '২৪ ঘণ্টা'
  },
  {
    id: 'blogger-ecommerce',
    title: 'Blogger ই-কমার্স ওয়েবসাইট তৈরি ও সম্পূর্ণ সেটআপ',
    category: 'ই-কমার্স ওয়েবসাইট',
    price: 1500,
    highlight: '১ বছর ফ্রি প্রবলেম সল্যুশন ও টেকনিক্যাল সাপোর্ট',
    icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
    description: 'ব্লগারের মাধ্যমে ফুল ফাংশনাল ই-কমার্স ওয়েবসাইট তৈরি, পেমেন্ট অপশন ও ১ বছর সম্পূর্ণ ফ্রি প্রবলেম সল্যুশন।',
    features: [
      'সম্পূর্ণ প্রোডাক্ট ক্যাটালগ ও শপ পেজ',
      'বিকাশ ও নগদ সরাসরি অর্ডার গ্রহণ সিস্টেম',
      '১ বছর ফ্রি প্রবলেম সল্যুশন ও টেকনিক্যাল সাপোর্ট',
      'সহজ প্রোডাক্ট আপলোড ও অ্যাডমিন গাইড'
    ],
    deliveryTime: '২-৩ দিন'
  },
  {
    id: 'wp-portfolio',
    title: 'WordPress প্রোফাইল ও পোর্টফোলিও ওয়েবসাইট তৈরি',
    category: 'ওয়ার্ডপ্রেস ডেভেলপমেন্ট',
    price: 1500,
    icon: <Layout className="w-6 h-6 text-blue-600" />,
    description: 'নিজের প্রফেশনাল ক্যারিয়ার, সিভি, স্কিল ও কাজের নমুনা প্রদর্শনের জন্য আধুনিক পোর্টফোলিও ওয়েবসাইট।',
    features: [
      'আধুনিক ক্লিন ও পার্সোনাল পোর্টফোলিও ডিজাইন',
      'রেজুমে / সিভি ডাউনলোড সেকশন',
      'ডায়নামিক কন্টাক্ট ফর্ম ও সোশ্যাল লিংক',
      'এসইও ফ্রেন্ডলি ও আল্ট্রা ফাস্ট লোডিং'
    ],
    deliveryTime: '২ দিন'
  },
  {
    id: 'wp-ecommerce',
    title: 'WordPress সম্পূর্ণ ই-কমার্স ওয়েবসাইট তৈরি',
    category: 'প্রিমিয়াম ই-কমার্স',
    price: 5000,
    highlight: 'ফুল অটোমেটেড শপ ও সিকিউর গেটওয়ে',
    icon: <ShoppingCart className="w-6 h-6 text-indigo-600" />,
    description: 'সম্পূর্ণ স্বয়ংক্রিয় WooCommerce ই-কমার্স ওয়েবসাইট, অটোমেটেড কার্ট, চেকআউট ও পেমেন্ট গেটওয়ে।',
    features: [
      'সম্পূর্ণ WooCommerce ই-কমার্স আর্কিটেকচার',
      'বিকাশ, নগদ ও কার্ড পেমেন্ট গেটওয়ে সেটআপ',
      'ইনভেন্টরি ট্র্যাকিং, কুপন ও ডিসকাউন্ট সিস্টেম',
      'অ্যাডভান্সড স্পিড অপ্টিমাইজেশন ও সিকিউরিটি'
    ],
    deliveryTime: '৪-৫ দিন'
  },
  {
    id: 'social-branding',
    title: 'Facebook ও Instagram সোশ্যাল সাইট হেডার ও লোগো',
    category: 'গ্রাফিক ডিজাইন ও ব্র্যান্ডিং',
    price: 500,
    icon: <ImageIcon className="w-6 h-6 text-pink-600" />,
    description: 'ফেসবুক পেজ কভার/হেডার, ইনস্টাগ্রাম প্রোফাইল ও ব্র্যান্ডিং লোগো প্রিমিয়াম কোয়ালিটিতে তৈরি।',
    features: [
      'ফেসবুক বিজনেস পেজ প্রফেশনাল কভার/হেডার',
      'ইনস্টাগ্রাম প্রোফাইল ব্র্যান্ডিং গ্রাফিক্স',
      'ইউনিক হাই-রেজোলিউশন লোগো ডিজাইন',
      'আল্ট্রা HD এক্সপোর্ট (JPG & PNG ফরম্যাট)'
    ],
    deliveryTime: '১২-২৪ ঘণ্টা'
  }
];

export const JobServicesView: React.FC<JobServicesViewProps> = ({ 
  onNavigateAffiliate, 
  onNavigateHome 
}) => {
  const WHATSAPP_NUMBER = '+8801911633056';
  const WHATSAPP_CLEAN = '8801911633056';

  const getWhatsAppLink = (serviceTitle: string, price: number) => {
    const text = `হ্যালো, আমি eBookBazar থেকে "${serviceTitle}" (৳${price}) সার্ভিসটি নিতে আগ্রহী। অনুগ্রহ করে অর্ডার ও বিস্তারিত জানাবেন।`;
    return `https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#14532d] via-slate-900 to-[#14532d] text-white rounded-3xl p-6 md:p-10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ডিজিটাল সেবা ও প্রফেশনাল সল্যুশন
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-snug">
            জব ও সেবা (Job & Digital Services)
          </h1>
          
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            ইউটিউব চ্যানেল ব্র্যান্ডিং, ব্লগার ও ওয়ার্ডপ্রেস ওয়েবসাইট ডেভেলপমেন্ট এবং সোশ্যাল মিডিয়া গ্রাফিক্স সেবা। সকল বিস্তারিত ও সরাসরি অর্ডারের জন্য হোয়াটসঅ্যাপে যোগাযোগ করুন।
          </p>

          {/* Prominent WhatsApp Contact Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a 
              href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent('হ্যালো, আমি আপনার জব ও ডিজিটাল সেবা সম্পর্কে বিস্তারিত জানতে চাই।')}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>WhatsApp অর্ডার করুন: {WHATSAPP_NUMBER}</span>
            </a>
            <span className="text-xs text-slate-300 font-medium">
              সরাসরি কল বা হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে সব তথ্য নিশ্চিত করুন
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid (6 Custom Services) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              আমাদের ডিজিটাল সার্ভিস প্যাকেজসমূহ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              নির্ধারিত মূল্য ও সময়মতো ডেলিভারির নিশ্চয়তা
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full hidden sm:inline-block">
            ১০০% নিরাপদ ও বিশ্বস্ত
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => (
            <div 
              key={s.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group hover:border-emerald-500/50"
            >
              <div className="space-y-4">
                {/* Header Icon + Price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#15803d]">৳{s.price}</span>
                    <span className="text-[10px] text-slate-400 block font-bold">ফিক্সড প্রাইস</span>
                  </div>
                </div>

                {/* Category & Title */}
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                    {s.category}
                  </span>
                  <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition">
                    {s.title}
                  </h3>
                </div>

                {/* Highlight Badge if any */}
                {s.highlight && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                    <Star className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-current" />
                    <span>{s.highlight}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.description}
                </p>

                {/* Features List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {s.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>ডেলিভারি সময়: <b>{s.deliveryTime}</b></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <a
                  href={getWhatsAppLink(s.title, s.price)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#15803d] hover:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>অর্ডার করুন (WhatsApp)</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online Job & Earning Opportunities */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
            ক্যারিয়ার ও ইনকাম অপরচুনিটি
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            অনলাইন পার্ট-টাইম জব ও অ্যাফিলিয়েট আর্নিং
          </h3>
          <p className="text-xs text-slate-500">
            eBookBazar প্ল্যাটফর্মে কাজ করে ঘরে বসে সৎ ও হালাল আয়ের সুযোগ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                রেফারেল প্রোগ্রাম
              </span>
              <h4 className="font-black text-slate-900 text-sm">
                ডিজিটাল বুক ক্যাম্পেইন ও অ্যাফিলিয়েট প্রোমোটার
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনার রেফারেল কোড বন্ধুদের সাথে শেয়ার করুন। যেকোনো ক্রেতা আপনার কোড দিয়ে অ্যাডমিন ই-বুক কিনলেই সাথে সাথে প্রতি সফল অর্ডারে ৫০ টাকা ক্যাশ কমিশন পাবেন।
              </p>
            </div>
            <button
              onClick={onNavigateAffiliate}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl transition shadow-sm text-center"
            >
              অ্যাফিলিয়েট প্রোগ্রামে যোগ দিন
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                রিমোট রাইটিং
              </span>
              <h4 className="font-black text-slate-900 text-sm">
                ই-বুক লেখক, অনুবাদক ও প্রুফ-রিডার
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                প্রোগ্রামিং, ফ্রিল্যান্সিং, ধর্মীয় কিংবা ক্যারিয়ার সহায়িকা বিষয়ে বই লিখতে পারেন? আপনার পান্ডুলিপি আমাদের নিকট পাঠিয়ে রয়্যালটি আয় করতে যোগাযোগ করুন।
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent('হ্যালো, আমি eBookBazar-এ লেখক বা অনুবাদক হিসেবে কাজ করতে আগ্রহী।')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#15803d] hover:bg-emerald-800 text-white font-black text-xs py-2.5 rounded-xl transition shadow-sm text-center flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>আবেদন করুন (হোয়াটসঅ্যাপ)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Direct Order Support Footer Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm md:text-base">সরাসরি অর্ডার ও কাস্টম কাজের জন্য</h4>
            <p className="text-xs text-slate-400">
              হোয়াটসঅ্যাপ নম্বর: <b className="font-mono text-emerald-400">{WHATSAPP_NUMBER}</b> — আপনার প্রয়োজনীয় সার্ভিস লিখে পাঠান
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/${WHATSAPP_CLEAN}?text=${encodeURIComponent('হ্যালো, আমি কাস্টম কাজের বিস্তারিত আলোচনা করতে চাই।')}`}
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl transition shrink-0 flex items-center gap-1.5"
        >
          <span>মেসেজ পাঠান</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
