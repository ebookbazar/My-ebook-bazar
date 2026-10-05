import { db, ref, set, get, remove, onValue } from '../firebase';
import { EbookRating, EbookRatingSummary, UserProfile, SellerProfile } from '../types';
import { User } from 'firebase/auth';

const LOCAL_STORAGE_SUMMARIES_KEY = 'ebookbazar_rating_summaries';
const LOCAL_STORAGE_RATINGS_KEY = 'ebookbazar_user_ratings';

// Local storage helpers
export function getLocalRatingSummaries(): Record<string, EbookRatingSummary> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SUMMARIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Error reading local rating summaries:', e);
    return {};
  }
}

export function saveLocalRatingSummaries(summaries: Record<string, EbookRatingSummary>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SUMMARIES_KEY, JSON.stringify(summaries));
  } catch (e) {
    console.warn('Error writing local rating summaries:', e);
  }
}

export function getLocalBookRatings(bookId: string): EbookRating[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_RATINGS_KEY}_${bookId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading local ratings for book:', e);
    return [];
  }
}

export function saveLocalBookRatings(bookId: string, ratings: EbookRating[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_RATINGS_KEY}_${bookId}`, JSON.stringify(ratings));
  } catch (e) {
    console.warn('Error writing local ratings for book:', e);
  }
}

/**
 * Computes an accurate summary from an array of ratings
 */
export function calculateRatingSummary(bookId: string, ratings: EbookRating[]): EbookRatingSummary {
  if (!ratings || ratings.length === 0) {
    return {
      bookId,
      averageRating: 0,
      totalRatings: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      lastUpdated: Date.now()
    };
  }

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  ratings.forEach(r => {
    const score = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
    ratingCounts[score] = (ratingCounts[score] || 0) + 1;
    sum += score;
  });

  const totalRatings = ratings.length;
  // Round accurately to 1 decimal place, e.g. 4.8
  const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

  return {
    bookId,
    averageRating,
    totalRatings,
    ratingCounts,
    lastUpdated: Date.now()
  };
}

/**
 * Submit or update a user rating for an eBook in Firebase RTDB
 * Prevents duplicate ratings by saving per user: ratings/${bookId}/${userId}
 */
export async function submitOrUpdateRating(params: {
  bookId: string;
  rating: number;
  review?: string;
  user: User;
  userProfile?: UserProfile | SellerProfile | null;
}): Promise<{ summary: EbookRatingSummary; rating: EbookRating }> {
  const { bookId, rating, review = '', user, userProfile } = params;

  if (!user || !user.uid) {
    throw new Error('Authentication required to rate an eBook.');
  }

  const validRating = Math.max(1, Math.min(5, Math.round(rating)));
  const displayName = 
    userProfile?.fullName || 
    userProfile?.username || 
    user.displayName || 
    user.email?.split('@')[0] || 
    'পাঠক';

  const newRatingItem: EbookRating = {
    bookId,
    userId: user.uid,
    userName: displayName,
    userEmail: user.email || '',
    rating: validRating,
    review: review.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 1. Update local cache immediately
  const existingLocal = getLocalBookRatings(bookId);
  const existingIndex = existingLocal.findIndex(r => r.userId === user.uid);
  if (existingIndex >= 0) {
    newRatingItem.createdAt = existingLocal[existingIndex].createdAt || Date.now();
    existingLocal[existingIndex] = newRatingItem;
  } else {
    existingLocal.unshift(newRatingItem);
  }
  saveLocalBookRatings(bookId, existingLocal);

  const localSummary = calculateRatingSummary(bookId, existingLocal);
  const allSummaries = getLocalRatingSummaries();
  allSummaries[bookId] = localSummary;
  saveLocalRatingSummaries(allSummaries);

  // 2. Write to Firebase RTDB with dual-layer fallback
  // Path A: /ratings/${bookId}/${user.uid}
  // Path B (mirror): /ebooks/_ratings/${bookId}/${user.uid}
  try {
    const ratingRefA = ref(db, `ratings/${bookId}/${user.uid}`);
    await set(ratingRefA, newRatingItem).catch(err => {
      console.warn('ratings path write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to ratings node:', e);
  }

  try {
    const ratingRefB = ref(db, `ebooks/_ratings/${bookId}/${user.uid}`);
    await set(ratingRefB, newRatingItem).catch(err => {
      console.warn('ebooks/_ratings path write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to ebooks/_ratings node:', e);
  }

  // 3. Fetch all current ratings from Firebase for accurate aggregated summary calculation
  let combinedRatings: EbookRating[] = [...existingLocal];
  try {
    const snapA = await get(ref(db, `ratings/${bookId}`)).catch(() => null);
    if (snapA && snapA.exists()) {
      const list: EbookRating[] = [];
      snapA.forEach(child => {
        const val = child.val() as EbookRating;
        if (val && val.userId) {
          list.push({ ...val, userId: child.key || val.userId });
        }
      });
      if (list.length > 0) combinedRatings = list;
    } else {
      const snapB = await get(ref(db, `ebooks/_ratings/${bookId}`)).catch(() => null);
      if (snapB && snapB.exists()) {
        const list: EbookRating[] = [];
        snapB.forEach(child => {
          const val = child.val() as EbookRating;
          if (val && val.userId) {
            list.push({ ...val, userId: child.key || val.userId });
          }
        });
        if (list.length > 0) combinedRatings = list;
      }
    }
  } catch (e) {
    console.warn('Could not fetch existing ratings for summary, using local combination:', e);
  }

  // Compute final summary
  const finalSummary = calculateRatingSummary(bookId, combinedRatings);

  // 4. Save summary in RTDB:
  // Path A: /ratingSummary/${bookId}
  // Path B (mirror): /ebooks/_ratingSummary/${bookId}
  try {
    await set(ref(db, `ratingSummary/${bookId}`), finalSummary).catch(err => {
      console.warn('ratingSummary write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to ratingSummary:', e);
  }

  try {
    await set(ref(db, `ebooks/_ratingSummary/${bookId}`), finalSummary).catch(err => {
      console.warn('ebooks/_ratingSummary write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to ebooks/_ratingSummary:', e);
  }

  // Sync back to local storage
  allSummaries[bookId] = finalSummary;
  saveLocalRatingSummaries(allSummaries);
  saveLocalBookRatings(bookId, combinedRatings);

  return { summary: finalSummary, rating: newRatingItem };
}

/**
 * Delete a user rating (used by Admin to remove inappropriate reviews, or user themselves)
 */
export async function deleteEbookRating(bookId: string, userId: string): Promise<EbookRatingSummary> {
  // 1. Remove from local cache
  const existingLocal = getLocalBookRatings(bookId).filter(r => r.userId !== userId);
  saveLocalBookRatings(bookId, existingLocal);

  // 2. Remove from Firebase
  try {
    await remove(ref(db, `ratings/${bookId}/${userId}`)).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to remove from ratings node:', e);
  }

  try {
    await remove(ref(db, `ebooks/_ratings/${bookId}/${userId}`)).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to remove from ebooks/_ratings node:', e);
  }

  // 3. Recalculate summary
  const updatedSummary = calculateRatingSummary(bookId, existingLocal);

  // Update summary in RTDB
  try {
    await set(ref(db, `ratingSummary/${bookId}`), updatedSummary).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to update ratingSummary:', e);
  }

  try {
    await set(ref(db, `ebooks/_ratingSummary/${bookId}`), updatedSummary).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to update ebooks/_ratingSummary:', e);
  }

  // Update local storage
  const allSummaries = getLocalRatingSummaries();
  allSummaries[bookId] = updatedSummary;
  saveLocalRatingSummaries(allSummaries);

  return updatedSummary;
}

/**
 * Subscribes to real-time reviews/ratings for a specific eBook
 */
export function subscribeToBookReviews(
  bookId: string, 
  callback: (ratings: EbookRating[]) => void
): () => void {
  let unsubscribed = false;

  const handleData = (snapList: EbookRating[]) => {
    if (unsubscribed) return;
    const local = getLocalBookRatings(bookId);
    const map = new Map<string, EbookRating>();
    
    // Seed with local
    local.forEach(r => map.set(r.userId, r));
    // Merge from Firebase
    snapList.forEach(r => map.set(r.userId, r));
    
    const combined = Array.from(map.values()).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    saveLocalBookRatings(bookId, combined);
    callback(combined);
  };

  // Listen to Path A: ratings/${bookId}
  const refA = ref(db, `ratings/${bookId}`);
  const unsubA = onValue(
    refA,
    (snap) => {
      if (snap.exists()) {
        const list: EbookRating[] = [];
        snap.forEach(child => {
          const val = child.val() as EbookRating;
          if (val) {
            list.push({
              ...val,
              userId: child.key || val.userId
            });
          }
        });
        handleData(list);
      }
    },
    (err) => {
      console.warn('ratings listener note:', err?.message);
    }
  );

  // Listen to Path B (mirror): ebooks/_ratings/${bookId}
  const refB = ref(db, `ebooks/_ratings/${bookId}`);
  const unsubB = onValue(
    refB,
    (snap) => {
      if (snap.exists()) {
        const list: EbookRating[] = [];
        snap.forEach(child => {
          const val = child.val() as EbookRating;
          if (val) {
            list.push({
              ...val,
              userId: child.key || val.userId
            });
          }
        });
        handleData(list);
      }
    },
    (err) => {
      console.warn('ebooks/_ratings listener note:', err?.message);
    }
  );

  // Immediate callback with local cache
  const initialLocal = getLocalBookRatings(bookId);
  callback(initialLocal);

  return () => {
    unsubscribed = true;
    unsubA();
    unsubB();
  };
}

/**
 * Subscribes to all eBook rating summaries across the application
 * (Homepage cards, category cards, search results, admin panel, seller dashboard)
 */
export function subscribeToAllRatingSummaries(
  callback: (summaries: Record<string, EbookRatingSummary>) => void
): () => void {
  let unsubscribed = false;
  let notifyTimer: any = null;
  const currentSummaries: Record<string, EbookRatingSummary> = { ...getLocalRatingSummaries() };

  // Immediate callback with cached summaries
  callback(currentSummaries);

  const mergeAndNotify = (newSummaries: Record<string, EbookRatingSummary>) => {
    if (unsubscribed) return;
    Object.assign(currentSummaries, newSummaries);
    if (notifyTimer) clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => {
      if (unsubscribed) return;
      saveLocalRatingSummaries(currentSummaries);
      callback({ ...currentSummaries });
    }, 40);
  };

  // 1. Listen to /ratingSummary
  const refA = ref(db, 'ratingSummary');
  const unsubA = onValue(
    refA,
    (snap) => {
      if (snap.exists()) {
        const incoming: Record<string, EbookRatingSummary> = {};
        snap.forEach(child => {
          const bookId = child.key;
          const val = child.val() as EbookRatingSummary;
          if (bookId && val) {
            incoming[bookId] = { ...val, bookId };
          }
        });
        mergeAndNotify(incoming);
      }
    },
    (err) => {
      console.warn('ratingSummary listener note:', err?.message);
    }
  );

  // 2. Listen to /ebooks/_ratingSummary (mirror)
  const refB = ref(db, 'ebooks/_ratingSummary');
  const unsubB = onValue(
    refB,
    (snap) => {
      if (snap.exists()) {
        const incoming: Record<string, EbookRatingSummary> = {};
        snap.forEach(child => {
          const bookId = child.key;
          const val = child.val() as EbookRatingSummary;
          if (bookId && val) {
            incoming[bookId] = { ...val, bookId };
          }
        });
        mergeAndNotify(incoming);
      }
    },
    (err) => {
      console.warn('ebooks/_ratingSummary listener note:', err?.message);
    }
  );

  return () => {
    unsubscribed = true;
    if (notifyTimer) clearTimeout(notifyTimer);
    unsubA();
    unsubB();
  };
}
