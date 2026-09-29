import React from 'react';
import { BookOpen, Users, Briefcase, CheckCircle2 } from 'lucide-react';

interface RealWebsiteStatsProps {
  totalEbooks: number | null;
  totalUsers: number | null;
  totalSellers: number | null;
}

const toBanglaDigits = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '০';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
};

export const RealWebsiteStats: React.FC<RealWebsiteStatsProps> = ({
  totalEbooks,
  totalUsers,
  totalSellers
}) => {
  const ebooksCount = totalEbooks ?? 7;
  const usersCount = totalUsers ?? 17;
  const sellersCount = totalSellers ?? 7;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-3 sm:p-4 md:p-5">
        <div className="grid grid-cols-3 divide-x divide-slate-200/80">
          {/* Stat 1: Total eBooks */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 text-center sm:text-left">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                {toBanglaDigits(ebooksCount)}টি
              </div>
              <div className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <span>মোট ই-বুক</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-600 hidden sm:inline" />
              </div>
            </div>
          </div>

          {/* Stat 2: Total Readers/Users */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 text-center sm:text-left">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                {toBanglaDigits(usersCount)} জন
              </div>
              <div className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <span>পাঠক ও ইউজার</span>
                <CheckCircle2 className="w-3 h-3 text-blue-600 hidden sm:inline" />
              </div>
            </div>
          </div>

          {/* Stat 3: Total Sellers */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 text-center sm:text-left">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                {toBanglaDigits(sellersCount)} জন
              </div>
              <div className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <span>ভেরিফাইড সেলার</span>
                <CheckCircle2 className="w-3 h-3 text-amber-600 hidden sm:inline" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
