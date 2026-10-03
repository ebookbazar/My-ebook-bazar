import { db, ref, onValue, set, push, remove } from '../firebase';
import { BlogPost } from '../types';

/**
 * Standard categories defined by user request.
 * Blogger labels will be mapped or matched seamlessly.
 */
export const BLOG_PRESET_CATEGORIES = [
  'সব',
  'আত্মউন্নয়ন',
  'শিক্ষা',
  'উপন্যাস',
  'গল্প',
  'কবিতা',
  'ইসলামিক',
  'ব্যবসা ও উদ্যোক্তা',
  'ক্যারিয়ার',
  'প্রযুক্তি',
  'স্বাস্থ্য ও জীবনধারা',
  'ব্যক্তিগত অর্থনীতি',
  'শিশু-কিশোর',
  'অন্যান্য'
];

/**
 * Known Blogger Page URL paths or titles that must NEVER be shown as Blog Articles.
 * Strict PAGE exclusion filter.
 */
const KNOWN_PAGE_SLUGS = [
  'savings-calculator',
  'budget-calculator',
  'terms-conditions',
  'terms-and-conditions',
  'apps',
  'affiliate-earning',
  'about-ebookbazars',
  'about-us',
  'monthly-budget',
  'privacy-policy',
  'percentage-calculator',
  'contact',
  'contact-us',
  'disclaimer'
];

/**
 * Helper to check if an entry or post is a Blogger static PAGE or SOFT_TRASHED
 */
export function isExcludedBloggerItem(title: string, url: string = '', schemeCategories: any[] = []): boolean {
  const normTitle = (title || '').toLowerCase().trim();
  const normUrl = (url || '').toLowerCase();

  // 1. Check scheme categories for Blogger kind or status
  if (Array.isArray(schemeCategories)) {
    for (const c of schemeCategories) {
      const term = String(c?.term || '');
      const scheme = String(c?.scheme || '');
      // If Blogger explicitly marked kind#page
      if (term.includes('#page') || scheme.includes('#page')) {
        return true;
      }
      // If Blogger explicitly marked status as SOFT_TRASHED or DRAFT
      if (term.includes('SOFT_TRASHED') || term.includes('trashed') || term.includes('draft')) {
        return true;
      }
    }
  }

  // 2. Check if URL contains /p/ (Blogger static pages have format: domain.com/p/page-name.html)
  if (normUrl.includes('/p/')) {
    return true;
  }

  // 3. Check known page titles & slugs
  for (const pageSlug of KNOWN_PAGE_SLUGS) {
    if (normUrl.includes(`/${pageSlug}`) || normTitle === pageSlug.replace(/-/g, ' ')) {
      return true;
    }
  }

  // Check specific Bengali/English titles for Pages
  if (
    normTitle === 'terms & conditions' ||
    normTitle === 'terms and conditions' ||
    normTitle === 'privacy policy' ||
    normTitle === 'about ebookbazars' ||
    normTitle === 'affiliate earning' ||
    normTitle === 'apps' ||
    normTitle === 'savings-calculator' ||
    normTitle === 'budget-calculator' ||
    normTitle === 'monthly-budget' ||
    normTitle === 'percentage-calculator'
  ) {
    return true;
  }

  return false;
}

/**
 * Parse Blogger JSON feed entry into clean BlogPost object.
 * Enforces:
 * 1. blogger:type === 'POST' (never PAGE)
 * 2. blogger:status === 'LIVE' (never SOFT_TRASHED or DRAFT)
 */
export function parseBloggerFeedEntry(entry: any): BlogPost | null {
  try {
    if (!entry) return null;

    const schemeCategory = entry.category || [];
    const title = entry.title?.$t?.trim() || '';
    const alternateLink = entry.link?.find((l: any) => l.rel === 'alternate');
    const url = alternateLink?.href || '';

    // STRICT CHECK: Reject PAGE and SOFT_TRASHED
    if (isExcludedBloggerItem(title, url, schemeCategory)) {
      return null;
    }

    // Extract ID (e.g., tag:blogger.com,1999:blog-xxx.post-yyy)
    const rawId = entry.id?.$t || '';
    const idMatch = rawId.match(/post-(\d+)/);
    const id = idMatch ? idMatch[1] : (rawId || `blogger-post-${Date.now()}`);

    // Dates
    const publishedAt = entry.published?.$t || '';
    const publishedDate = publishedAt ? new Date(publishedAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'সাম্প্রতিক';

    // Author
    const authorObj = entry.author && entry.author[0];
    const author = authorObj?.name?.$t || 'eBookBazar Editor';

    // Labels / Categories
    const labels: string[] = [];
    schemeCategory.forEach((c: any) => {
      const term = c?.term;
      if (term && !term.includes('schemas.google.com') && !term.includes('blogger.com')) {
        labels.push(term);
      }
    });

    const category = labels[0] || 'অন্যান্য';

    // Content / HTML Body (Preserve complete original Bengali text and structure)
    const htmlContent = entry.content?.$t || entry.summary?.$t || '';

    // First image from Blogger entry (media$thumbnail or from HTML)
    let coverImage = '';
    if (entry.media$thumbnail?.url) {
      // Blogger thumbnail has s72-c, replace with high-res s1600 or w1200
      coverImage = entry.media$thumbnail.url.replace(/\/s72-c(-[^\/]+)?\//, '/s1600/');
    }

    if (!coverImage && htmlContent) {
      const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        coverImage = match[1];
      }
    }

    // Fallback safe placeholder only if completely empty
    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop';
    }

    // Excerpt extraction
    let cleanText = '';
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      cleanText = div.textContent || div.innerText || '';
    } else {
      cleanText = htmlContent.replace(/<[^>]+>/g, ' ');
    }
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    const excerpt = cleanText ? (cleanText.slice(0, 160) + (cleanText.length > 160 ? '...' : '')) : (title || 'ব্লগ আর্টিকেল');

    // Split paragraphs
    const paragraphs: string[] = cleanText
      ? cleanText.split(/(?<=\।|\.|\!)\s+/).filter((s: string) => s.trim().length > 0)
      : [excerpt];

    return {
      id,
      title: title || 'শিরোনামহীন পোস্ট',
      slug: id,
      author,
      authorRole: 'লেখক / ব্লগার',
      date: publishedDate,
      publishedAt,
      readTime: '৪ মিনিট',
      category,
      labels,
      coverImage,
      excerpt,
      content: paragraphs.slice(0, 10),
      htmlContent,
      url,
      isDemo: false,
      type: 'POST',
      status: 'LIVE'
    };
  } catch (err) {
    console.error('Failed to parse blogger feed entry:', err);
    return null;
  }
}

/**
 * Extracts real blog posts rendered by Blogger engine in the DOM bridge if hosted on Blogger.
 * Distinguishes between PAGE and POST, and filters out SOFT_TRASHED content.
 */
export function extractBloggerPostsFromDOM(): BlogPost[] {
  if (typeof document === 'undefined') return [];

  const postElements = document.querySelectorAll('.blogger-raw-post');
  if (!postElements || postElements.length === 0) return [];

  const realPosts: BlogPost[] = [];

  postElements.forEach((el, index) => {
    try {
      const type = (el.getAttribute('data-type') || 'POST').toUpperCase();
      const status = (el.getAttribute('data-status') || 'LIVE').toUpperCase();
      const titleEl = el.querySelector('.blogger-raw-title');
      const title = titleEl?.textContent?.trim() || el.getAttribute('data-title') || '';
      const url = el.getAttribute('data-url') || '';

      // STRICT USER REQUIREMENT:
      // blogger:type = POST and blogger:status = LIVE
      // Never show PAGE, never show SOFT_TRASHED
      if (type === 'PAGE' || status === 'SOFT_TRASHED' || status === 'DRAFT') {
        return;
      }

      if (isExcludedBloggerItem(title, url)) {
        return;
      }

      const id = el.getAttribute('data-id') || `blogger-post-${index + 1}`;
      const bodyEl = el.querySelector('.blogger-raw-body');
      const htmlContent = bodyEl?.innerHTML?.trim() || '';

      // Extract labels
      const rawLabels = el.getAttribute('data-labels') || '';
      const labelsSpan = el.querySelectorAll('.blogger-raw-labels .raw-label');
      let labels: string[] = [];
      if (labelsSpan && labelsSpan.length > 0) {
        labelsSpan.forEach(sp => {
          const t = sp.textContent?.trim();
          if (t) labels.push(t);
        });
      } else if (rawLabels) {
        labels = rawLabels.split(',').map(s => s.trim()).filter(Boolean);
      }

      const category = labels[0] || el.getAttribute('data-category') || 'অন্যান্য';

      // Find first image for cover
      const firstImg = el.getAttribute('data-firstimage') || bodyEl?.querySelector('img')?.getAttribute('src');
      const coverImage = firstImg || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop';

      // Extract clean text paragraphs
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      const paragraphs: string[] = [];
      const pTags = tempDiv.querySelectorAll('p');
      if (pTags && pTags.length > 0) {
        pTags.forEach(p => {
          const txt = p.textContent?.trim();
          if (txt) paragraphs.push(txt);
        });
      }

      if (paragraphs.length === 0) {
        const fullText = tempDiv.textContent?.trim() || '';
        if (fullText) {
          fullText.split(/\n+/).forEach(line => {
            const clean = line.trim();
            if (clean) paragraphs.push(clean);
          });
        }
      }

      const excerpt = paragraphs[0] 
        ? (paragraphs[0].slice(0, 160) + (paragraphs[0].length > 160 ? '...' : ''))
        : (title || '');

      const date = el.getAttribute('data-date') || 'আজকের পোস্ট';
      const author = el.getAttribute('data-author') || 'eBookBazar Editor';

      realPosts.push({
        id,
        title: title || 'শিরোনামহীন পোস্ট',
        slug: id,
        author,
        authorRole: 'লেখক / ব্লগার',
        date,
        readTime: '৪ মিনিট',
        category,
        labels,
        coverImage,
        excerpt,
        content: paragraphs.length > 0 ? paragraphs : [excerpt],
        htmlContent,
        url: url || undefined,
        isDemo: false,
        type: 'POST',
        status: 'LIVE'
      });
    } catch (err) {
      console.warn('Error extracting Blogger post:', err);
    }
  });

  return realPosts;
}

/**
 * Dynamically fetches Blogger real posts using Blogger public JSON feed endpoint.
 * This runs automatically on Blogger domain or when a Blogger feed/url is available.
 * Filters strictly for LIVE POSTs, excluding PAGE and SOFT_TRASHED.
 */
export async function fetchBloggerFeedPosts(bloggerBaseUrl?: string): Promise<BlogPost[]> {
  try {
    let blogDomain = '';

    if (bloggerBaseUrl) {
      blogDomain = bloggerBaseUrl.replace(/\/$/, '');
    } else if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.includes('blogspot.com') || (window as any).__BLOGGER_URL__) {
        blogDomain = window.location.origin;
      }
    }

    if (!blogDomain) {
      return [];
    }

    // Fetch lightweight feed limited to 50 latest posts to avoid duplicate/heavy requests
    const feedEndpoint = `${blogDomain}/feeds/posts/default?alt=json&max-results=50`;

    const res = await fetch(feedEndpoint);
    if (!res.ok) {
      console.warn('Blogger feed response not ok:', res.status);
      return [];
    }

    const data = await res.json();
    const entries = data?.feed?.entry || [];
    const posts: BlogPost[] = [];

    for (const entry of entries) {
      const p = parseBloggerFeedEntry(entry);
      if (p && p.type === 'POST' && p.status === 'LIVE') {
        posts.push(p);
      }
    }

    return posts;
  } catch (err) {
    console.warn('Failed to fetch from Blogger feed endpoint:', err);
    return [];
  }
}

/**
 * Recursively cleans and removes any undefined fields from objects or arrays,
 * preventing Firebase Realtime Database "set failed: value argument contains undefined" errors.
 */
export function sanitizeObjectForFirebase<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeObjectForFirebase(item)) as any;
  }
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        result[key] = sanitizeObjectForFirebase(value);
      }
    }
    return result;
  }
  return data;
}

export const LOCAL_STORAGE_BLOGS_KEY = 'ebookbazar_saved_blogs';
export const LOCAL_STORAGE_HIDE_DEMO_KEY = 'ebookbazar_hide_demo_blogs';
export const LOCAL_STORAGE_DELETED_KEY = 'ebookbazar_deleted_blog_ids';

/**
 * Retrieve list of deleted blog post IDs/slugs to prevent re-appearance
 */
export function getDeletedBlogIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record a deleted blog post ID or slug
 */
export function addDeletedBlogId(id: string, slug?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedBlogIds();
    const set = new Set(current);
    if (id) set.add(id);
    if (slug) set.add(slug);
    localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Failed to add deleted blog ID:', err);
  }
}

/**
 * Retrieve saved blog posts from local storage cache
 */
export function getLocalStoredBlogs(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BLOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const deletedSet = new Set(getDeletedBlogIds());

    if (Array.isArray(parsed)) {
      return parsed
        .filter(item => item && typeof item === 'object' && item.title)
        .filter(item => !deletedSet.has(item.id) && !(item.slug && deletedSet.has(item.slug)))
        .map(item => ({
          ...item,
          isDemo: false,
          type: item.type || 'POST',
          status: item.status || 'LIVE'
        }));
    }
  } catch (err) {
    console.warn('Failed to parse locally stored blogs:', err);
  }
  return [];
}

/**
 * Persist blog posts array to local storage cache
 */
export function saveLocalStoredBlogs(posts: BlogPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    const realPosts = posts.filter(p => !p.isDemo);
    localStorage.setItem(LOCAL_STORAGE_BLOGS_KEY, JSON.stringify(realPosts));
  } catch (err) {
    console.warn('Failed to save blogs to localStorage:', err);
  }
}

/**
 * Retrieve hideDemoBlogs preference from local storage cache
 */
export function getLocalHideDemoBlogs(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LOCAL_STORAGE_HIDE_DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persist hideDemoBlogs preference to local storage cache
 */
export function setLocalHideDemoBlogs(hide: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_HIDE_DEMO_KEY, hide ? 'true' : 'false');
  } catch {}
}

/**
 * Get initial posts merging Blogger DOM and Local Storage cache
 */
export function getInitialBlogPosts(): BlogPost[] {
  const domPosts = extractBloggerPostsFromDOM();
  const localPosts = getLocalStoredBlogs();
  const deletedSet = new Set(getDeletedBlogIds());
  
  const map = new Map<string, BlogPost>();
  domPosts.forEach(p => {
    if (!deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))) {
      map.set(p.id, p);
    }
  });
  localPosts.forEach(p => {
    if (!deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))) {
      map.set(p.id, p);
    }
  });
  
  return Array.from(map.values());
}

/**
 * Saves a real blog post with Dual-Layer Persistence:
 * 1. Synchronously updates local storage cache (never lost on logout, reload, or network interruption)
 * 2. Writes to Firebase RTDB primary path (/blogs)
 * 3. Also mirrors to Firebase RTDB public node (/ebooks/_blogs) for unauthenticated / logged-out visitors
 */
export async function saveBlogPostToFirebase(post: Omit<BlogPost, 'id'> & { id?: string }): Promise<string> {
  const blogsRef = ref(db, 'blogs');
  const status = post.status || 'LIVE';
  const allowIndex = post.allowIndex !== undefined ? post.allowIndex : (status === 'LIVE');
  const now = Date.now();

  const isExisting = Boolean(post.id && !post.id.startsWith('post-'));
  const targetId = isExisting ? (post.id as string) : (push(blogsRef).key || `blog-${now}`);

  const completePost: BlogPost = {
    ...post,
    id: targetId,
    createdAt: (post as any).createdAt || now,
    updatedAt: now,
    isDemo: false,
    type: 'POST',
    status,
    allowIndex
  };

  // 1. Immediate local cache write (Dual-Layer persistence guarantee)
  try {
    const existing = getLocalStoredBlogs();
    const map = new Map<string, BlogPost>();
    existing.forEach(p => map.set(p.id, p));
    map.set(targetId, completePost);
    saveLocalStoredBlogs(Array.from(map.values()));
  } catch (err) {
    console.warn('Failed to mirror post to local storage cache:', err);
  }

  // 2. Prepare sanitized payload for Firebase RTDB
  const payload = sanitizeObjectForFirebase(completePost);

  // 3. Write to primary /blogs node
  const singleRef = ref(db, `blogs/${targetId}`);
  const primaryWrite = set(singleRef, payload).catch((err) => {
    console.warn('Primary Firebase /blogs write notice:', err);
  });

  // 4. Dual-layer mirror to /ebooks/_blogs node (since /ebooks has public read in RTDB)
  const mirrorRef = ref(db, `ebooks/_blogs/${targetId}`);
  const mirrorWrite = set(mirrorRef, payload).catch((err) => {
    console.warn('Mirror Firebase /ebooks/_blogs write notice:', err);
  });

  await Promise.allSettled([primaryWrite, mirrorWrite]);

  return targetId;
}

/**
 * Deletes a blog post from both Local Storage cache and Firebase RTDB
 * Accepts either post ID string or entire BlogPost object
 */
export async function deleteBlogPostFromFirebase(target: string | BlogPost): Promise<void> {
  const id = typeof target === 'string' ? target : target.id;
  const slug = typeof target === 'string' ? undefined : target.slug;

  // 1. Record in deleted list to permanently prevent ghost re-appearance from feeds/DOM
  addDeletedBlogId(id, slug);

  // 2. Delete from local storage cache immediately
  try {
    const existing = getLocalStoredBlogs();
    const filtered = existing.filter(p => p.id !== id && (!slug || p.slug !== slug));
    saveLocalStoredBlogs(filtered);
  } catch (err) {
    console.warn('Failed to delete from local cache:', err);
  }

  // 3. Delete from Firebase RTDB nodes
  const postRef = ref(db, `blogs/${id}`);
  const mirrorRef = ref(db, `ebooks/_blogs/${id}`);
  const deletedLogRef = ref(db, `ebooks/_deletedBlogs/${id}`);
  
  await Promise.allSettled([
    remove(postRef).catch((err) => console.warn('Firebase /blogs delete notice:', err)),
    remove(mirrorRef).catch((err) => console.warn('Firebase /ebooks/_blogs delete notice:', err)),
    set(deletedLogRef, true).catch(() => {})
  ]);
}

/**
 * Permanently hides / deletes all demo blog posts in system settings & local cache
 */
export async function setHideDemoBlogsSetting(hide: boolean): Promise<void> {
  setLocalHideDemoBlogs(hide);

  const settingRef = ref(db, 'settings/hideDemoBlogs');
  const mirrorSettingRef = ref(db, 'ebooks/_settings/hideDemoBlogs');

  await Promise.allSettled([
    set(settingRef, hide).catch(() => {}),
    set(mirrorSettingRef, hide).catch(() => {})
  ]);
}
