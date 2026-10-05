import { db, ref, set, get, remove, onValue, push, update } from '../firebase';
import { LeaderboardPost, LeaderboardRole, LeaderboardPostType, AdminReply } from '../types';

export const INITIAL_LEADERBOARD_POSTS: LeaderboardPost[] = [
  {
    id: 'lb_init_01',
    userId: 'user_mahmud_01',
    name: 'মাহমুদুল হাসান',
    role: 'Buyer',
    postType: 'Payment Experience',
    comment: 'bKash দিয়ে খুব সহজে ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট হ্যান্ডবুকটি কিনেছি। ট্রানজ্যাকশন আইডি দেওয়ার সাথে সাথে ইনস্ট্যান্ট ডাউনলোড লিংক পেয়ে গিয়েছি। বইটির প্রিন্ট কোয়ালিটি এবং কোডিং উদাহরণগুলো অসাধারণ!',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    approvedAt: Date.now() - 1000 * 60 * 60 * 46,
    status: 'approved',
    adminReply: {
      text: 'ধন্যবাদ মাহমুদুল হাসান ভাই! আপনার সফল কোডিং ও প্রজেক্ট জার্নির জন্য eBookBazar-এর পক্ষ থেকে শুভকামনা।',
      adminId: 'admin',
      adminName: 'eBookBazar Admin',
      createdAt: Date.now() - 1000 * 60 * 60 * 45,
      updatedAt: Date.now() - 1000 * 60 * 60 * 45
    }
  },
  {
    id: 'lb_init_02',
    userId: 'seller_tanveer_01',
    name: 'তানভীর আহমেদ (ভেরিফাইড সেলার)',
    role: 'Seller',
    postType: 'Seller Experience',
    comment: 'eBookBazar-এ আমার \'জিরো ক্যাপিটাল স্টার্টআপ\' বইটি পাবলিশ করার পর গত সপ্তাহে ১২টি কপি বিক্রি হয়েছে। সেলার ড্যাশবোর্ড থেকে তাৎক্ষণিক সেলস ও কমিশন রিপোর্ট দেখা যায়। উইথড্র রিকোয়েস্ট দেওয়ার ২৪ ঘণ্টার মধ্যে বিকাশ নম্বরে টাকা পেয়েছি।',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    approvedAt: Date.now() - 1000 * 60 * 60 * 70,
    status: 'approved',
    adminReply: {
      text: 'অভিনন্দন তানভীর ভাই! একজন সফল লেখক ও উদ্যোক্তা হিসেবে আপনার অংশগ্রহণ আমাদের প্ল্যাটফর্মকে সমৃদ্ধ করেছে।',
      adminId: 'admin',
      adminName: 'eBookBazar Admin',
      createdAt: Date.now() - 1000 * 60 * 60 * 69,
      updatedAt: Date.now() - 1000 * 60 * 60 * 69
    }
  },
  {
    id: 'lb_init_03',
    userId: 'user_nusrat_02',
    name: 'নুসরাত জাহান',
    role: 'Buyer',
    postType: 'eBook Purchase Experience',
    comment: 'বিসিএস ও সরকারি চাকরি প্রস্তুতি বইটির সাজানো ম্যাটেরিয়াল এবং শর্টকাট টেকনিকগুলো পড়াশোনা অনেক সহজ করে দিয়েছে। মোবাইলেও দারুণভাবে পড়া যায়।',
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    approvedAt: Date.now() - 1000 * 60 * 60 * 94,
    status: 'approved',
    adminReply: {
      text: 'ধন্যবাদ নুসরাত আপু! আপনার প্রস্তুতিতে বইটি সহায়ক হওয়ায় আমরা আনন্দিত। শুভকামনা আপনার ক্যারিয়ারের জন্য।',
      adminId: 'admin',
      adminName: 'eBookBazar Admin',
      createdAt: Date.now() - 1000 * 60 * 60 * 93,
      updatedAt: Date.now() - 1000 * 60 * 60 * 93
    }
  },
  {
    id: 'lb_init_04',
    userId: 'user_rakib_03',
    name: 'রাকিবুল ইসলাম',
    role: 'User',
    postType: 'Suggestion',
    comment: 'ওয়েবসাইটে ডার্ক মোড অপশন এবং বুক রিডার মোড যুক্ত করলে রাতে বই পড়তে আরও সুবিধা হতো। সামগ্রিক সেবা খুব ভালো লেগেছে!',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    status: 'pending',
    adminReply: null
  }
];

const LOCAL_STORAGE_POSTS_KEY = 'ebookbazar_local_leaderboard_posts';

// Local storage caching helpers
export function getLocalLeaderboardPosts(): LeaderboardPost[] {
  if (typeof window === 'undefined') return INITIAL_LEADERBOARD_POSTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (!raw) {
      saveLocalLeaderboardPosts(INITIAL_LEADERBOARD_POSTS);
      return INITIAL_LEADERBOARD_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveLocalLeaderboardPosts(INITIAL_LEADERBOARD_POSTS);
      return INITIAL_LEADERBOARD_POSTS;
    }
    return parsed;
  } catch (e) {
    console.warn('Error reading local leaderboard posts:', e);
    return INITIAL_LEADERBOARD_POSTS;
  }
}

export function saveLocalLeaderboardPosts(posts: LeaderboardPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('Error saving local leaderboard posts:', e);
  }
}

/**
 * Submit a new Leaderboard / Community feedback post
 * Starts with status = "pending" and requires Admin approval
 */
export async function submitLeaderboardPost(data: {
  userId: string;
  name: string;
  role: LeaderboardRole;
  postType: LeaderboardPostType;
  comment: string;
}): Promise<string> {
  const { userId, name, role, postType, comment } = data;

  const trimmedComment = comment.trim();
  if (trimmedComment.length < 5) {
    throw new Error('অনুগ্রহ করে অন্তত ৫ অক্ষরের অর্থবহ মন্তব্য লিখুন।');
  }
  if (trimmedComment.length > 600) {
    throw new Error('মন্তব্য সর্বোচ্চ ৬০০ অক্ষরের মধ্যে সীমাবদ্ধ রাখুন।');
  }

  const postId = `lb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPost: LeaderboardPost = {
    id: postId,
    userId,
    name: name.trim() || 'সম্মানিত ইউজার',
    role,
    postType,
    comment: trimmedComment,
    createdAt: Date.now(),
    status: 'pending',
    adminReply: null
  };

  // 1. Update local cache immediately
  const localPosts = getLocalLeaderboardPosts();
  localPosts.unshift(newPost);
  saveLocalLeaderboardPosts(localPosts);

  // 2. Dual-layer Firebase RTDB persistence:
  // Path A: /leaderboardPosts/${postId}
  // Path B: /ebooks/_leaderboardPosts/${postId}
  try {
    await set(ref(db, `leaderboardPosts/${postId}`), newPost).catch(err => {
      console.warn('leaderboardPosts write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to leaderboardPosts node:', e);
  }

  try {
    await set(ref(db, `ebooks/_leaderboardPosts/${postId}`), newPost).catch(err => {
      console.warn('ebooks/_leaderboardPosts write note:', err?.message);
    });
  } catch (e) {
    console.warn('Could not write to ebooks/_leaderboardPosts node:', e);
  }

  return postId;
}

/**
 * Approve or Reject a Leaderboard post (Admin only)
 */
export async function updateLeaderboardStatus(
  postId: string, 
  status: 'approved' | 'rejected'
): Promise<void> {
  const updatePayload: Partial<LeaderboardPost> = {
    status,
    ...(status === 'approved' ? { approvedAt: Date.now() } : { rejectedAt: Date.now() })
  };

  // 1. Update local cache
  const localPosts = getLocalLeaderboardPosts();
  const index = localPosts.findIndex(p => p.id === postId);
  if (index >= 0) {
    localPosts[index] = { ...localPosts[index], ...updatePayload };
    saveLocalLeaderboardPosts(localPosts);
  }

  // 2. Update Firebase paths
  try {
    await update(ref(db, `leaderboardPosts/${postId}`), updatePayload).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to update status on leaderboardPosts:', e);
  }

  try {
    await update(ref(db, `ebooks/_leaderboardPosts/${postId}`), updatePayload).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to update status on ebooks/_leaderboardPosts:', e);
  }
}

/**
 * Permanently delete a Leaderboard post (Admin only)
 */
export async function deleteLeaderboardPost(postId: string): Promise<void> {
  // 1. Remove from local cache
  const localPosts = getLocalLeaderboardPosts().filter(p => p.id !== postId);
  saveLocalLeaderboardPosts(localPosts);

  // 2. Remove from Firebase
  try {
    await remove(ref(db, `leaderboardPosts/${postId}`)).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to remove from leaderboardPosts:', e);
  }

  try {
    await remove(ref(db, `ebooks/_leaderboardPosts/${postId}`)).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to remove from ebooks/_leaderboardPosts:', e);
  }
}

/**
 * Save or update an Admin Reply for a post
 */
export async function saveAdminReply(params: {
  postId: string;
  replyText: string;
  adminId: string;
  adminName: string;
}): Promise<AdminReply> {
  const { postId, replyText, adminId, adminName } = params;

  const trimmedText = replyText.trim();
  if (!trimmedText) {
    throw new Error('অ্যাডমিন উত্তরের বিবরণ খালি রাখা যাবে না।');
  }

  const replyData: AdminReply = {
    text: trimmedText,
    adminId,
    adminName: adminName || 'eBookBazar Admin',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 1. Update local cache
  const localPosts = getLocalLeaderboardPosts();
  const index = localPosts.findIndex(p => p.id === postId);
  if (index >= 0) {
    const existingReply = localPosts[index].adminReply;
    if (existingReply?.createdAt) {
      replyData.createdAt = existingReply.createdAt;
    }
    localPosts[index].adminReply = replyData;
    saveLocalLeaderboardPosts(localPosts);
  }

  // 2. Update Firebase
  try {
    await update(ref(db, `leaderboardPosts/${postId}`), { adminReply: replyData }).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to save adminReply on leaderboardPosts:', e);
  }

  try {
    await update(ref(db, `ebooks/_leaderboardPosts/${postId}`), { adminReply: replyData }).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to save adminReply on ebooks/_leaderboardPosts:', e);
  }

  return replyData;
}

/**
 * Delete an Admin Reply from a post
 */
export async function deleteAdminReply(postId: string): Promise<void> {
  // 1. Update local cache
  const localPosts = getLocalLeaderboardPosts();
  const index = localPosts.findIndex(p => p.id === postId);
  if (index >= 0) {
    localPosts[index].adminReply = null;
    saveLocalLeaderboardPosts(localPosts);
  }

  // 2. Update Firebase
  try {
    await set(ref(db, `leaderboardPosts/${postId}/adminReply`), null).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to delete adminReply from leaderboardPosts:', e);
  }

  try {
    await set(ref(db, `ebooks/_leaderboardPosts/${postId}/adminReply`), null).catch(e => console.warn(e));
  } catch (e) {
    console.warn('Failed to delete adminReply from ebooks/_leaderboardPosts:', e);
  }
}

/**
 * Subscribe to approved Leaderboard posts for Homepage display
 * Only posts with status === 'approved' are returned!
 */
export function subscribeToApprovedLeaderboardPosts(
  callback: (posts: LeaderboardPost[]) => void
): () => void {
  let unsubscribed = false;
  let timer: any = null;

  const handleSnap = (rawPosts: LeaderboardPost[]) => {
    if (unsubscribed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (unsubscribed) return;
      const local = getLocalLeaderboardPosts();
      const map = new Map<string, LeaderboardPost>();

      // Seed local approved
      local.filter(p => p.status === 'approved').forEach(p => map.set(p.id, p));
      // Merge Firebase approved
      rawPosts.filter(p => p.status === 'approved').forEach(p => map.set(p.id, p));

      const combined = Array.from(map.values()).sort(
        (a, b) => (b.approvedAt || b.createdAt || 0) - (a.approvedAt || a.createdAt || 0)
      );
      callback(combined);
    }, 40);
  };

  // Immediate callback from cached approved posts
  const initialLocal = getLocalLeaderboardPosts().filter(p => p.status === 'approved');
  callback(initialLocal);

  // Path A: /leaderboardPosts
  const refA = ref(db, 'leaderboardPosts');
  const unsubA = onValue(
    refA,
    (snap) => {
      if (snap.exists()) {
        const list: LeaderboardPost[] = [];
        snap.forEach(child => {
          const val = child.val() as LeaderboardPost;
          if (val) {
            list.push({ ...val, id: child.key || val.id });
          }
        });
        handleSnap(list);
      }
    },
    (err) => console.warn('leaderboardPosts listener note:', err?.message)
  );

  // Path B (mirror): /ebooks/_leaderboardPosts
  const refB = ref(db, 'ebooks/_leaderboardPosts');
  const unsubB = onValue(
    refB,
    (snap) => {
      if (snap.exists()) {
        const list: LeaderboardPost[] = [];
        snap.forEach(child => {
          const val = child.val() as LeaderboardPost;
          if (val) {
            list.push({ ...val, id: child.key || val.id });
          }
        });
        handleSnap(list);
      }
    },
    (err) => console.warn('ebooks/_leaderboardPosts listener note:', err?.message)
  );

  return () => {
    unsubscribed = true;
    if (timer) clearTimeout(timer);
    unsubA();
    unsubB();
  };
}

/**
 * Subscribe to all Leaderboard posts (used in Admin Panel)
 */
export function subscribeToAllLeaderboardPosts(
  callback: (posts: LeaderboardPost[]) => void
): () => void {
  let unsubscribed = false;
  let timer: any = null;

  const handleSnap = (rawPosts: LeaderboardPost[]) => {
    if (unsubscribed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (unsubscribed) return;
      const local = getLocalLeaderboardPosts();
      const map = new Map<string, LeaderboardPost>();

      // Seed local
      local.forEach(p => map.set(p.id, p));
      // Merge Firebase
      rawPosts.forEach(p => map.set(p.id, p));

      const combined = Array.from(map.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      saveLocalLeaderboardPosts(combined);
      callback(combined);
    }, 40);
  };

  const initialLocal = getLocalLeaderboardPosts();
  callback(initialLocal);

  // Path A: /leaderboardPosts
  const refA = ref(db, 'leaderboardPosts');
  const unsubA = onValue(
    refA,
    (snap) => {
      if (snap.exists()) {
        const list: LeaderboardPost[] = [];
        snap.forEach(child => {
          const val = child.val() as LeaderboardPost;
          if (val) {
            list.push({ ...val, id: child.key || val.id });
          }
        });
        handleSnap(list);
      }
    },
    (err) => console.warn('leaderboardPosts all listener note:', err?.message)
  );

  // Path B (mirror): /ebooks/_leaderboardPosts
  const refB = ref(db, 'ebooks/_leaderboardPosts');
  const unsubB = onValue(
    refB,
    (snap) => {
      if (snap.exists()) {
        const list: LeaderboardPost[] = [];
        snap.forEach(child => {
          const val = child.val() as LeaderboardPost;
          if (val) {
            list.push({ ...val, id: child.key || val.id });
          }
        });
        handleSnap(list);
      }
    },
    (err) => console.warn('ebooks/_leaderboardPosts all listener note:', err?.message)
  );

  return () => {
    unsubscribed = true;
    if (timer) clearTimeout(timer);
    unsubA();
    unsubB();
  };
}
