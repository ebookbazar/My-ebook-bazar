import { db, ref, runTransaction } from '../firebase';

/**
 * Record an actual click on the App Download button atomically in Firebase Realtime Database
 */
export const recordAppDownloadClick = async (): Promise<boolean> => {
  try {
    const p0 = runTransaction(ref(db, 'ebooks/_appDownload/downloads'), (cur) => (Number(cur) || 0) + 1).catch(() => {});
    const p1 = runTransaction(ref(db, 'appDownload/downloads'), (cur) => (Number(cur) || 0) + 1).catch(() => {});
    const p2 = runTransaction(ref(db, 'appDownload/downloadCount'), (cur) => (Number(cur) || 0) + 1).catch(() => {});
    const p3 = runTransaction(ref(db, 'settings/appDownload/downloadCount'), (cur) => (Number(cur) || 0) + 1).catch(() => {});
    const p4 = runTransaction(ref(db, 'settings/appDownload/downloads'), (cur) => (Number(cur) || 0) + 1).catch(() => {});
    const p5 = runTransaction(ref(db, 'appDownloadStats/totalClicks'), (cur) => (Number(cur) || 0) + 1).catch(() => {});

    await Promise.all([p0, p1, p2, p3, p4, p5]);
    return true;
  } catch (err) {
    console.error('[App Download] Failed to increment download count:', err);
    return false;
  }
};

/**
 * Basic URL validation and cleanup for App Download URL
 */
export const formatAndValidateDownloadUrl = (
  rawUrl: string
): { isValid: boolean; formattedUrl: string; error?: string } => {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { isValid: true, formattedUrl: '' };
  }

  let testUrl = trimmed;
  if (!/^https?:\/\//i.test(testUrl)) {
    testUrl = 'https://' + testUrl;
  }

  try {
    const parsed = new URL(testUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, formattedUrl: '', error: 'URL অবশ্যই http:// অথবা https:// দিয়ে শুরু হতে হবে।' };
    }
    return { isValid: true, formattedUrl: testUrl };
  } catch {
    return { isValid: false, formattedUrl: '', error: 'অনুগ্রহ করে সঠিক URL দিন (যেমন: https://example.com/app.apk)' };
  }
};

// Backward-compatible stubs if imported elsewhere
export const calculateAppDownloadMetrics = (stats?: any) => ({
  totalClicks: Number(stats?.totalClicks || stats?.downloadCount || stats?.count || 0),
  todayClicks: 0,
  yesterdayClicks: 0,
  thisWeekClicks: 0,
  thisMonthClicks: 0,
  last7DaysClicks: 0,
  last30DaysClicks: 0
});

export const resetAppDownloadStats = async (): Promise<boolean> => {
  try {
    const countRef = ref(db, 'settings/appDownload/downloadCount');
    await runTransaction(countRef, () => 0);
    return true;
  } catch {
    return false;
  }
};
