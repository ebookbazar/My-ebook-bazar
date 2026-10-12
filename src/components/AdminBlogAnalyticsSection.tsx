import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  Globe, 
  Search, 
  ArrowUpRight, 
  RefreshCw, 
  Share2, 
  Radio, 
  Eye, 
  ShieldAlert, 
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  BlogTrafficEvent, 
  ActiveVisitorSession, 
  BlogAnalyticsSummary, 
  PostAnalyticsRow, 
  TrafficSourceMetric, 
  CountryMetric 
} from '../types/blogAnalytics';
import { DHAKA_TIMEZONE } from '../services/blogAnalyticsService';
import { formatBlogViewCount } from '../utils/blogFormatter';

interface AdminBlogAnalyticsSectionProps {
  summary: BlogAnalyticsSummary;
  postRows: PostAnalyticsRow[];
  trafficSources: TrafficSourceMetric[];
  countries: CountryMetric[];
  activeVisitors: ActiveVisitorSession[];
  recentEvents: BlogTrafficEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenBlogEditor?: () => void;
}

export const AdminBlogAnalyticsSection: React.FC<AdminBlogAnalyticsSectionProps> = ({
  summary,
  postRows,
  trafficSources,
  countries,
  activeVisitors,
  recentEvents,
  isLoading,
  onRefresh,
  onOpenBlogEditor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'lifetimeViews' | 'todayViews' | 'last7DaysViews' | 'last30DaysViews' | 'currentMonthViews'>('lifetimeViews');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'live' | 'sources'>('overview');

  const filteredPosts = useMemo(() => {
    let list = postRows.filter(p => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q)) || p.postId.toLowerCase().includes(q);
    });

    list.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    });

    return list;
  }, [postRows, searchTerm, sortField, sortDirection]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-emerald-700/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/50 text-emerald-200 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Blog Traffic Analytics • {DHAKA_TIMEZONE}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <span>ব্লগ ট্রাফিক ও ভিজিটর অ্যানালিটিক্স</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            লাইভ রিয়েল-টাইম পাবলিক ভিজিটর উপস্থিতি, আজ ও বিগত ৩০ দিনের সঠিক ভিউ সংখ্যা এবং ট্রাফিক সোর্স রিপোর্ট। কোনো মনগড়া বা ডেমো সংখ্যা ছাড়া আসল ডেটা।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            title="নতুন অ্যানালিটিক্স রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          {onOpenBlogEditor && (
            <button
              onClick={onOpenBlogEditor}
              className="bg-[#15803d] hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>ব্লগ পোস্ট ম্যানেজার</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards (8 Core Summary Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Blog Views (Persistent Lifetime) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-600/30 shadow-xs hover:border-emerald-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">1. Total Blog Views</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.totalLifetimeViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            সর্বমোট স্থায়ী লাইফটাইম ভিউ
          </span>
        </div>

        {/* Metric 2: Today's Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">2. Today's Views</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
            {summary.todayViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            আজকের ভিউ ({DHAKA_TIMEZONE})
          </span>
        </div>

        {/* Metric 3: Last 7 Days' Views (Rolling 168 hrs) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">3. Last 7 Days</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.last7DaysViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            বিগত ৭ দিন (রোলিং ১৬৮ ঘণ্টা)
          </span>
        </div>

        {/* Metric 4: Last 30 Days' Views (Rolling 720 hrs) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">4. Last 30 Days</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.last30DaysViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            বিগত ৩০ দিন (রোলিং ৭২০ ঘণ্টা)
          </span>
        </div>

        {/* Metric 5: Current Calendar Month's Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">5. Current Month</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.currentMonthViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            চলতি ক্যালেন্ডার মাস
          </span>
        </div>

        {/* Metric 6: Current Calendar Year's Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">6. Current Year</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.currentYearViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            চলতি ক্যালেন্ডার বছর ({new Date().getFullYear()})
          </span>
        </div>

        {/* Metric 7: Current Active Visitors (Live 5-min heartbeat) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-400/80 shadow-xs hover:border-amber-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>7. Active Visitors</span>
            </span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-0.5 flex items-center gap-2">
            <span>{summary.activeVisitorsCount}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            লাইভ সক্রিয় ভিজিটর (বিগত ৫ মিনিট)
          </span>
        </div>

        {/* Metric 8: Total Published Blog Posts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">8. Published Posts</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {summary.totalPublishedPosts}টি
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            লাইভ প্রকাশিত মোট পোস্ট
          </span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'overview' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ওভারভিউ ও ট্রাফিক সোর্স
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'posts' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>পোস্ট ভিত্তিক পরিসংখ্যান ({filteredPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'live' ? 'bg-[#15803d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>রিয়েল-টাইম ভিজিটর সেশন ({activeVisitors.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Overview & Traffic Sources */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources Classification Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Traffic Sources (আগমনের মাধ্যম)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  রেকর্ডকৃত ইভেন্টের ভিত্তিতে ভিজিটরদের আসার উৎস শ্রেণিবিভাগ
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                মোট ইভেন্ট: {summary.totalTrackedEvents}
              </span>
            </div>

            {trafficSources.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                এখনও কোনো সোর্স ডেটা রেকর্ড হয়নি। ভিজিটররা ব্লগে ঢুকলে এখানে রিয়েল-টাইম আপডেট হবে।
              </div>
            ) : (
              <div className="space-y-3">
                {trafficSources.map((src) => (
                  <div key={src.sourceKey} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>{src.sourceName}</span>
                      </span>
                      <span className="text-slate-900 font-black">
                        {src.count.toLocaleString()} ভিউ ({src.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, src.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>শ্রেণিবিভাগ নীতি:</strong> Google, Bing, Facebook, YouTube, সোশ্যাল মিডিয়া ও বাহ্যিক ওয়েবসাইটসমূহ Referrer ও UTM ট্যাগ দ্বারা আলাদা করা হয়। ব্রাউজারের প্রাইভেসি পলিসি বা ডাইরেক্ট ব্রাউজিংয়ের ক্ষেত্রে উৎস 'Direct' বা 'Unknown' হিসেবে তালিকাভুক্ত থাকে।
              </span>
            </div>
          </div>

          {/* Visitor Country Analytics Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Visitor Country Analytics (দেশভিত্তিক পরিসংখ্যান)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নির্ভরযোগ্য দেশ ও লোকেশন ডেটার প্রাপ্যতা স্ট্যাটাস
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {countries.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-black text-slate-800">{c.country}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      সক্রিয় লাইভ ভিজিটর: {c.activeVisitorsCount} জন
                    </p>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 font-bold text-slate-700">
                    {c.viewsCount.toLocaleString()} ভিউ
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>সার্ভার-সাইড কান্ট্রি ডিটেকশন সীমাবদ্ধতা:</strong>
                <p className="mt-0.5 text-amber-800">
                  বর্তমান ক্লায়েন্ট-সাইড SPA ও Firebase RTDB আর্কিটেকচারে কোনো এক্সটারনাল পেইড জিও-লোকেটিং সার্ভিস ছাড়া নিখুঁত দেশ নির্ধারণ সম্ভব নয়। কোনো অনুমান বা ডিভাইসের ভাষা দিয়ে দেশ মনগড়া করা হয় না। বিশ্বস্ত ডেটা নিশ্চিত করতে এটি সততার সাথে <code className="bg-amber-100 px-1 rounded font-bold">Unavailable</code> হিসেবে প্রদর্শিত হচ্ছে।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Individual Blog Post Statistics Table */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base">
                পোস্ট ভিত্তিক অ্যানালিটিক্স তালিকা
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রতিটি ব্লগের লাইফটাইম ভিউ ও রোলিং পিরিয়ডের সঠিক ভিউ পরিসংখ্যান
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="শিরোনাম বা স্লাগ খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-black border-y border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">ব্লগ পোস্ট শিরোনাম</th>
                  <th 
                    onClick={() => toggleSort('lifetimeViews')}
                    className="p-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Total Views</span>
                      {sortField === 'lifetimeViews' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-emerald-600" />)}
                    </span>
                  </th>
                  <th 
                    onClick={() => toggleSort('todayViews')}
                    className="p-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Today</span>
                      {sortField === 'todayViews' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-emerald-600" />)}
                    </span>
                  </th>
                  <th 
                    onClick={() => toggleSort('last7DaysViews')}
                    className="p-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Last 7 Days</span>
                      {sortField === 'last7DaysViews' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-emerald-600" />)}
                    </span>
                  </th>
                  <th 
                    onClick={() => toggleSort('last30DaysViews')}
                    className="p-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Last 30 Days</span>
                      {sortField === 'last30DaysViews' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-emerald-600" />)}
                    </span>
                  </th>
                  <th 
                    onClick={() => toggleSort('currentMonthViews')}
                    className="p-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>This Month</span>
                      {sortField === 'currentMonthViews' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3 text-emerald-600" /> : <ChevronUp className="w-3 h-3 text-emerald-600" />)}
                    </span>
                  </th>
                  <th className="p-3.5 whitespace-nowrap text-center">প্রকাশনা তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      কোনো পোস্ট পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.postId} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 pl-4 max-w-xs">
                        <div className="font-black text-slate-900 line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {post.postId.slice(0, 14)}... • /blog/{post.slug || post.postId}
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                        {post.lifetimeViews.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {post.todayViews.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {post.last7DaysViews.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {post.last30DaysViews.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {post.currentMonthViews.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center text-slate-500 text-xs whitespace-nowrap">
                        {post.publishedDate || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            💡 <strong>পিরিয়ড ডেটা নোট:</strong> মোট ভিউ (Total Views) বিদ্যমান ডাটাবেজের সম্পূর্ণ লাইফটাইম কাউন্টার থেকে প্রদর্শিত। আজ, ৭ দিন ও ৩০ দিনের হিসেব নতুন ট্রাফিক ইভেন্ট রেকর্ডিং শুরুর পর থেকে গণনা করা হয় যাতে কোনো মিথ্যা ইতিহাস বা ভুয়া অনুমান প্রদর্শন না হয়।
          </div>
        </div>
      )}

      {/* 6. Tab 3: Real-Time Active Visitors (Live 5-min heartbeat) */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>রিয়েল-টাইম ভিজিটর সেশন (Live Visitors)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বিগত ৫ মিনিটের মধ্যে ওয়েবসাইটে পাবলিক পেজ পড়ছেন এমন ভিজিটরদের তালিকা
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              বর্তমানে সক্রিয়: {activeVisitors.length} জন
            </span>
          </div>

          {activeVisitors.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">গত ৫ মিনিটে কোনো নতুন পাবলিক ভিজিটর সক্রিয় নেই।</p>
              <p className="text-[11px] text-slate-400">ভিজিটররা কোনো ব্লগ আর্টিকেল খুললে স্বয়ংক্রিয়ভাবে এখানে শো করবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeVisitors.map((v) => {
                const elapsedSec = Math.floor((Date.now() - (v.lastActive || 0)) / 1000);
                return (
                  <div key={v.sessionId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                        {v.sessionId.slice(0, 16)}...
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>{elapsedSec < 60 ? `${elapsedSec} সেকেন্ড আগে সক্রিয়` : `${Math.floor(elapsedSec / 60)} মিনিট আগে সক্রিয়`}</span>
                      </span>
                    </div>

                    <div className="font-bold text-slate-800">
                      পেজ: <span className="text-emerald-700 font-black">{v.currentPostTitle || v.currentPath || 'ব্লগ ভিজিট'}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
                      <span>সোর্স: {v.source || 'Direct'}</span>
                      <span>দেশ: {v.country || 'Unavailable'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
