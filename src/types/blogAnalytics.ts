/**
 * Blog Traffic Analytics Types
 * Strictly compatible with existing BlogPost IDs and Firebase Realtime Database.
 */

export interface BlogTrafficEvent {
  id?: string;
  postId: string;
  postTitle?: string;
  timestamp: number; // Unix timestamp in ms
  date: string; // YYYY-MM-DD in Asia/Dhaka
  sessionId: string; // Browser session identifier
  source: 'google' | 'bing' | 'facebook' | 'youtube' | 'social_other' | 'external' | 'direct' | 'unknown';
  sourceLabel: string;
  referrerHost?: string;
  country: string; // Verified country or 'Unavailable'
  path?: string;
}

export interface ActiveVisitorSession {
  sessionId: string;
  lastActive: number; // Unix timestamp in ms
  currentPostId?: string;
  currentPostTitle?: string;
  currentPath: string;
  country: string; // 'Unavailable' or detected country
  source: string;
}

export interface BlogAnalyticsSummary {
  totalLifetimeViews: number; // Sum of persistent lifetime views across all posts
  todayViews: number; // Today in Asia/Dhaka
  last7DaysViews: number; // Rolling 7 days (last 168 hours)
  last30DaysViews: number; // Rolling 30 days (last 720 hours)
  currentMonthViews: number; // Current calendar month in Asia/Dhaka
  currentYearViews: number; // Current calendar year in Asia/Dhaka
  activeVisitorsCount: number; // Public visitors active in the past 5 minutes
  totalPublishedPosts: number;
  totalTrackedEvents: number; // Count of granular event records
}

export interface PostAnalyticsRow {
  postId: string;
  title: string;
  slug?: string;
  publishedDate?: string;
  lifetimeViews: number;
  todayViews: number;
  last7DaysViews: number;
  last30DaysViews: number;
  currentMonthViews: number;
  currentYearViews: number;
}

export interface TrafficSourceMetric {
  sourceKey: string;
  sourceName: string;
  count: number;
  percentage: number;
}

export interface CountryMetric {
  country: string;
  viewsCount: number;
  activeVisitorsCount: number;
}
