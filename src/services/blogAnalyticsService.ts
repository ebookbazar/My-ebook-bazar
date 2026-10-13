/**
 * Blog Traffic Analytics Service
 * 
 * Objectives:
 * 1. Accurately records date-based view events alongside lifetime view counters.
 * 2. Employs session-based deduplication (one view event per article per browser session).
 * 3. Classifies incoming traffic sources (Google, Bing, Facebook, YouTube, Other Social, External, Direct, Unknown).
 * 4. Maintains lightweight presence heartbeat for Active Visitors (5-minute rolling TTL).
 * 5. Uses Asia/Dhaka timezone for consistent daily, monthly, and yearly aggregations.
 * 6. Never fabricates numbers or invents historical periods when events did not exist.
 * 7. Graceful degradation: never breaks public article reading if offline or rules block write.
 */

import { db, ref, set, push, onValue, remove, runTransaction } from '../firebase';
import { 
  BlogTrafficEvent, 
  ActiveVisitorSession, 
  BlogAnalyticsSummary, 
  PostAnalyticsRow, 
  TrafficSourceMetric, 
  CountryMetric 
} from '../types/blogAnalytics';
import { BlogPost } from '../types';

export const DHAKA_TIMEZONE = 'Asia/Dhaka';
const ACTIVE_VISITOR_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Returns formatted date components in Asia/Dhaka timezone
 */
export function getDhakaDateParts(timestamp: number = Date.now()): {
  year: number;
  month: number; // 1-12
  day: number;
  dateString: string; // YYYY-MM-DD
  monthString: string; // YYYY-MM
  yearString: string; // YYYY
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: DHAKA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date(timestamp));
    const year = Number(parts.find(p => p.type === 'year')?.value) || new Date().getFullYear();
    const month = Number(parts.find(p => p.type === 'month')?.value) || 1;
    const day = Number(parts.find(p => p.type === 'day')?.value) || 1;

    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return {
      year,
      month,
      day,
      dateString: `${year}-${mm}-${dd}`,
      monthString: `${year}-${mm}`,
      yearString: String(year)
    };
  } catch {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return {
      year,
      month,
      day,
      dateString: `${year}-${mm}-${dd}`,
      monthString: `${year}-${mm}`,
      yearString: String(year)
    };
  }
}

/**
 * Generates or retrieves a persistent eligible browser session ID
 */
export function getBrowserSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  const STORAGE_KEY = 'eb_analytics_session_id';
  try {
    let sid = sessionStorage.getItem(STORAGE_KEY);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem(STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    return 'anon_' + Date.now().toString(36);
  }
}

/**
 * Classifies incoming traffic source using document.referrer and UTM tags
 */
export function classifyTrafficSource(): {
  source: 'google' | 'bing' | 'facebook' | 'youtube' | 'social_other' | 'external' | 'direct' | 'unknown';
  sourceLabel: string;
  referrerHost: string;
} {
  if (typeof window === 'undefined') {
    return { source: 'unknown', sourceLabel: 'Unknown', referrerHost: '' };
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = (urlParams.get('utm_source') || '').toLowerCase().trim();
    const utmMedium = (urlParams.get('utm_medium') || '').toLowerCase().trim();

    if (utmSource) {
      if (utmSource.includes('google')) return { source: 'google', sourceLabel: 'Google (Campaign)', referrerHost: 'utm:google' };
      if (utmSource.includes('bing')) return { source: 'bing', sourceLabel: 'Bing Search (Campaign)', referrerHost: 'utm:bing' };
      if (utmSource.includes('facebook') || utmSource.includes('fb')) return { source: 'facebook', sourceLabel: 'Facebook (Campaign)', referrerHost: 'utm:facebook' };
      if (utmSource.includes('youtube')) return { source: 'youtube', sourceLabel: 'YouTube (Campaign)', referrerHost: 'utm:youtube' };
      if (/twitter|x\.com|instagram|linkedin|tiktok|pinterest|whatsapp|telegram/.test(utmSource)) {
        return { source: 'social_other', sourceLabel: `Social (${utmSource})`, referrerHost: `utm:${utmSource}` };
      }
      return { source: 'external', sourceLabel: `External (${utmSource})`, referrerHost: `utm:${utmSource}` };
    }

    const referrer = document.referrer ? document.referrer.trim() : '';
    if (!referrer) {
      // No referrer: if navigated within same host it's direct; if first landing with no referrer it's Direct
      return { source: 'direct', sourceLabel: 'Direct (সরাসরি ভিজিট)', referrerHost: 'direct' };
    }

    let refUrl: URL;
    try {
      refUrl = new URL(referrer);
    } catch {
      return { source: 'unknown', sourceLabel: 'Unknown Referrer', referrerHost: 'invalid' };
    }

    const host = refUrl.hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    // Internal navigation within the app
    if (host === currentHost || host === 'localhost' || host === '127.0.0.1') {
      return { source: 'direct', sourceLabel: 'Direct (অভ্যন্তরীণ বা সরাসরি)', referrerHost: host };
    }

    // Google Search
    if (host.includes('google.') || host === 'google.com') {
      return { source: 'google', sourceLabel: 'Google Search', referrerHost: host };
    }

    // Bing and Other Search Engines
    if (host.includes('bing.com') || host.includes('yahoo.') || host.includes('duckduckgo.') || host.includes('yandex.')) {
      return { source: 'bing', sourceLabel: 'Bing / Search Engines', referrerHost: host };
    }

    // Facebook
    if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('m.facebook.com') || host.includes('l.facebook.com')) {
      return { source: 'facebook', sourceLabel: 'Facebook', referrerHost: host };
    }

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { source: 'youtube', sourceLabel: 'YouTube', referrerHost: host };
    }

    // Other Social Media
    if (
      host.includes('instagram.com') ||
      host.includes('t.co') ||
      host.includes('twitter.com') ||
      host.includes('x.com') ||
      host.includes('linkedin.com') ||
      host.includes('pinterest.com') ||
      host.includes('tiktok.com') ||
      host.includes('reddit.com') ||
      host.includes('whatsapp.com') ||
      host.includes('telegram.org') ||
      host.includes('t.me')
    ) {
      return { source: 'social_other', sourceLabel: 'Other Social Media', referrerHost: host };
    }

    // External Website
    return { source: 'external', sourceLabel: `External (${host})`, referrerHost: host };
  } catch {
    return { source: 'unknown', sourceLabel: 'Unknown', referrerHost: 'error' };
  }
}

/**
 * Records a rich blog view event in addition to the atomic lifetime counter.
 * Session deduplicated: exactly one event per post ID per browser session.
 */
export async function recordBlogTrafficEvent(postId: string, postTitle?: string): Promise<void> {
  if (!postId || typeof window === 'undefined') return;

  const cleanId = String(postId).replace(/[.#$[\]]/g, '_').trim();
  if (!cleanId) return;

  // Deduplication guard
  const sessionDedupeKey = `eb_analytics_event_done_${cleanId}`;
  try {
    if (sessionStorage.getItem(sessionDedupeKey)) {
      return; // Already recorded in this browser session
    }
    sessionStorage.setItem(sessionDedupeKey, String(Date.now()));
  } catch {}

  const now = Date.now();
  const dateParts = getDhakaDateParts(now);
  const sessionId = getBrowserSessionId();
  const sourceInfo = classifyTrafficSource();

  const eventPayload: BlogTrafficEvent = {
    postId: cleanId,
    postTitle: (postTitle || '').slice(0, 120),
    timestamp: now,
    date: dateParts.dateString,
    sessionId,
    source: sourceInfo.source,
    sourceLabel: sourceInfo.sourceLabel,
    referrerHost: sourceInfo.referrerHost,
    country: 'Unavailable', // Client-side cannot reliably obtain country without external paid geo API
    path: window.location.pathname.slice(0, 100)
  };

  // 1. Store in local cache for immediate availability
  try {
    const LOCAL_EVENTS_KEY = 'eb_local_traffic_events';
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    const events: BlogTrafficEvent[] = raw ? JSON.parse(raw) : [];
    events.push(eventPayload);
    // Keep last 500 events locally
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {}

  // 2. Persist to Firebase Realtime Database
  try {
    const eventsRef = ref(db, 'blogAnalytics/events');
    const newEventRef = push(eventsRef);
    set(newEventRef, eventPayload).catch(() => {});
  } catch (err) {
    // Non-blocking: analytics never breaks reader experience
  }
}

/**
 * Lightweight heartbeat for Active Visitors (5-minute TTL).
 * Does not store IP or sensitive personal info.
 */
let heartbeatInterval: any = null;

export function startVisitorHeartbeat(opts: {
  postId?: string;
  postTitle?: string;
  path?: string;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  const sessionId = getBrowserSessionId();
  const sendHeartbeat = () => {
    try {
      const visitorRef = ref(db, `blogAnalytics/activeVisitors/${sessionId}`);
      const sourceInfo = classifyTrafficSource();
      const payload: ActiveVisitorSession = {
        sessionId,
        lastActive: Date.now(),
        currentPostId: opts.postId ? String(opts.postId).replace(/[.#$[\]]/g, '_') : undefined,
        currentPostTitle: opts.postTitle ? opts.postTitle.slice(0, 100) : undefined,
        currentPath: opts.path || window.location.pathname,
        country: 'Unavailable',
        source: sourceInfo.sourceLabel
      };
      set(visitorRef, payload).catch(() => {});
    } catch {}
  };

  // Initial heartbeat
  sendHeartbeat();

  // Pulse every 60 seconds
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(sendHeartbeat, 60000);

  // Clean-up hook on unmount
  return () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };
}

/**
 * Admin: Subscribes to recent blogAnalytics/events and active visitors in Firebase RTDB.
 */
export function subscribeToBlogTrafficData(callback: (data: {
  events: BlogTrafficEvent[];
  activeVisitors: ActiveVisitorSession[];
}) => void): () => void {
  const eventsRef = ref(db, 'blogAnalytics/events');
  const visitorsRef = ref(db, 'blogAnalytics/activeVisitors');

  let currentEvents: BlogTrafficEvent[] = [];
  let currentVisitors: ActiveVisitorSession[] = [];

  // Read local cache as instant fallback
  try {
    const raw = localStorage.getItem('eb_local_traffic_events');
    if (raw) currentEvents = JSON.parse(raw);
  } catch {}

  const unsubEvents = onValue(eventsRef, (snap) => {
    if (snap.exists()) {
      const val = snap.val() || {};
      const list: BlogTrafficEvent[] = [];
      for (const [key, item] of Object.entries(val)) {
        if (item && typeof item === 'object') {
          list.push({ id: key, ...(item as any) });
        }
      }
      list.sort((a, b) => b.timestamp - a.timestamp);
      currentEvents = list;
    }
    callback({ events: currentEvents, activeVisitors: currentVisitors });
  }, () => {
    // If permission or network issue, serve local cached events
    callback({ events: currentEvents, activeVisitors: currentVisitors });
  });

  const unsubVisitors = onValue(visitorsRef, (snap) => {
    const now = Date.now();
    const activeList: ActiveVisitorSession[] = [];
    if (snap.exists()) {
      const val = snap.val() || {};
      for (const [key, item] of Object.entries(val)) {
        if (item && typeof item === 'object') {
          const v = item as ActiveVisitorSession;
          // Filter to only eligible active visitors (active in previous 5 minutes)
          if (now - (v.lastActive || 0) <= ACTIVE_VISITOR_TTL_MS) {
            activeList.push({ ...v, sessionId: key });
          }
        }
      }
    }
    currentVisitors = activeList;
    callback({ events: currentEvents, activeVisitors: currentVisitors });
  }, () => {
    callback({ events: currentEvents, activeVisitors: currentVisitors });
  });

  return () => {
    unsubEvents();
    unsubVisitors();
  };
}

/**
 * Calculates aggregated summary metrics from lifetime views and tracked events
 */
export function computeBlogAnalyticsMetrics(
  events: BlogTrafficEvent[] = [],
  activeVisitors: ActiveVisitorSession[] = [],
  blogPosts: BlogPost[] = [],
  lifetimeViewsMap: Record<string, number> = {}
): {
  summary: BlogAnalyticsSummary;
  postRows: PostAnalyticsRow[];
  trafficSources: TrafficSourceMetric[];
  countries: CountryMetric[];
} {
  const safeEvents = Array.isArray(events) ? events : [];
  const safeVisitors = Array.isArray(activeVisitors) ? activeVisitors : [];
  const safePosts = Array.isArray(blogPosts) ? blogPosts : [];
  const safeLifetimeViewsMap = (lifetimeViewsMap && typeof lifetimeViewsMap === 'object') ? lifetimeViewsMap : {};

  const now = Date.now();
  const dhakaNow = getDhakaDateParts(now);

  const startOf7DaysMs = now - 7 * 24 * 60 * 60 * 1000;
  const startOf30DaysMs = now - 30 * 24 * 60 * 60 * 1000;

  // Track counts per post
  const postTodayMap: Record<string, number> = {};
  const post7dMap: Record<string, number> = {};
  const post30dMap: Record<string, number> = {};
  const postMonthMap: Record<string, number> = {};
  const postYearMap: Record<string, number> = {};

  // Track sources
  const sourceCountMap: Record<string, { name: string; count: number }> = {};
  // Track countries
  const countryCountMap: Record<string, number> = {};

  let todayViewsCount = 0;
  let last7DaysCount = 0;
  let last30DaysCount = 0;
  let currentMonthCount = 0;
  let currentYearCount = 0;

  // Process unique recorded events
  for (const ev of safeEvents) {
    if (!ev || typeof ev !== 'object') continue;
    const evTs = Number(ev.timestamp) || 0;
    const evParts = getDhakaDateParts(evTs);
    const pid = String(ev.postId || '');
    if (!pid) continue;

    // Today (same YYYY-MM-DD in Asia/Dhaka)
    if (evParts.dateString === dhakaNow.dateString) {
      todayViewsCount++;
      postTodayMap[pid] = (postTodayMap[pid] || 0) + 1;
    }

    // Last 7 days (rolling 168 hours)
    if (evTs >= startOf7DaysMs) {
      last7DaysCount++;
      post7dMap[pid] = (post7dMap[pid] || 0) + 1;
    }

    // Last 30 days (rolling 720 hours)
    if (evTs >= startOf30DaysMs) {
      last30DaysCount++;
      post30dMap[pid] = (post30dMap[pid] || 0) + 1;
    }

    // Current Month (same YYYY-MM in Asia/Dhaka)
    if (evParts.monthString === dhakaNow.monthString) {
      currentMonthCount++;
      postMonthMap[pid] = (postMonthMap[pid] || 0) + 1;
    }

    // Current Year (same YYYY in Asia/Dhaka)
    if (evParts.yearString === dhakaNow.yearString) {
      currentYearCount++;
      postYearMap[pid] = (postYearMap[pid] || 0) + 1;
    }

    // Traffic Source categorization
    const sKey = ev.source || 'unknown';
    const sName = ev.sourceLabel || 'Unknown';
    if (!sourceCountMap[sKey]) {
      sourceCountMap[sKey] = { name: sName, count: 0 };
    }
    sourceCountMap[sKey].count++;

    // Country
    const cName = ev.country || 'Unavailable';
    countryCountMap[cName] = (countryCountMap[cName] || 0) + 1;
  }

  // Calculate total lifetime views across all published posts
  let totalLifetimeViews = 0;
  const publishedPosts = safePosts.filter(p => p && p.status !== 'DRAFT');

  for (const post of publishedPosts) {
    if (!post) continue;
    const cleanId = String(post.id || '').replace(/[.#$[\]]/g, '_');
    const views = safeLifetimeViewsMap[cleanId] ?? safeLifetimeViewsMap[post.id] ?? post.views ?? post.viewCount ?? 0;
    totalLifetimeViews += Number(views) || 0;
  }

  // Build per-post analytics rows
  const postRows: PostAnalyticsRow[] = publishedPosts.map((post) => {
    const cleanId = String(post.id).replace(/[.#$[\]]/g, '_');
    const lifetime = lifetimeViewsMap[cleanId] ?? lifetimeViewsMap[post.id] ?? post.views ?? post.viewCount ?? 0;
    return {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      publishedDate: post.date,
      lifetimeViews: lifetime,
      todayViews: postTodayMap[cleanId] || 0,
      last7DaysViews: post7dMap[cleanId] || 0,
      last30DaysViews: post30dMap[cleanId] || 0,
      currentMonthViews: postMonthMap[cleanId] || 0,
      currentYearViews: postYearMap[cleanId] || 0
    };
  });

  // Sort post rows by lifetime views descending
  postRows.sort((a, b) => b.lifetimeViews - a.lifetimeViews);

  // Build Traffic Source metrics
  const totalClassifiedEvents = events.length;
  const trafficSources: TrafficSourceMetric[] = Object.entries(sourceCountMap).map(([key, info]) => ({
    sourceKey: key,
    sourceName: info.name,
    count: info.count,
    percentage: totalClassifiedEvents > 0 ? Math.round((info.count / totalClassifiedEvents) * 100) : 0
  }));
  trafficSources.sort((a, b) => b.count - a.count);

  // Build Country metrics
  const countries: CountryMetric[] = Object.entries(countryCountMap).map(([cName, count]) => ({
    country: cName,
    viewsCount: count,
    activeVisitorsCount: activeVisitors.filter(v => (v.country || 'Unavailable') === cName).length
  }));
  if (countries.length === 0) {
    countries.push({
      country: 'Unavailable (অপ্রাপ্য)',
      viewsCount: totalClassifiedEvents,
      activeVisitorsCount: activeVisitors.length
    });
  }

  const summary: BlogAnalyticsSummary = {
    totalLifetimeViews,
    todayViews: todayViewsCount,
    last7DaysViews: last7DaysCount,
    last30DaysViews: last30DaysCount,
    currentMonthViews: currentMonthCount,
    currentYearViews: currentYearCount,
    activeVisitorsCount: activeVisitors.length,
    totalPublishedPosts: publishedPosts.length,
    totalTrackedEvents: events.length
  };

  return { summary, postRows, trafficSources, countries };
}
