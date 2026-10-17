import { db, ref, onValue, set, push, remove, runTransaction } from '../firebase';
import { BlogPost } from '../types';
import { formatBlogContentToHtml } from '../utils/blogFormatter';
import { BLOG_POSTS } from '../data/blogPosts';

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
      coverImage = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=70&auto=format&fm=webp&fit=crop';
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
      htmlContent: formatBlogContentToHtml(htmlContent),
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
      const coverImage = firstImg || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=70&auto=format&fm=webp&fit=crop';

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
        htmlContent: formatBlogContentToHtml(htmlContent),
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
/**
 * Normalizes legacy, Firebase RTDB, and DOM blog post records into a consistent BlogPost object.
 * Restores compatibility with older database formats where fields might differ:
 * - title / postTitle / name
 * - content / htmlContent / description / body / excerpt / summary
 * - date / publishedDate / publishedAt / createdAt
 * - category / labels / tags
 * - views / viewCount / totalViews
 * - author / creator / authorName / userName
 * - coverImage / thumbnail / image / imageUrl / featuredImage
 * - id / slug / url
 */
export function normalizeBlogPostRecord(raw: any, fallbackId: string = ''): BlogPost {
  const targetId = String(raw?.id || fallbackId || `blog-${Date.now()}`);
  const title = typeof raw?.title === 'string' && raw.title.trim() 
    ? raw.title.trim() 
    : (typeof raw?.postTitle === 'string' && raw.postTitle.trim() 
      ? raw.postTitle.trim() 
      : (typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : 'শিরোনামহীন ব্লগ পোস্ট'));
  
  // Safe author string extraction to prevent any charAt runtime crash
  const rawAuthor = raw?.author || raw?.creator || raw?.authorName || raw?.userName;
  const author = typeof rawAuthor === 'string' && rawAuthor.trim() ? rawAuthor.trim() : 'eBookBazar Editor';
  const authorRole = typeof raw?.authorRole === 'string' && raw.authorRole.trim() ? raw.authorRole.trim() : undefined;

  // Safe category and labels
  let category = typeof raw?.category === 'string' && raw.category.trim() ? raw.category.trim() : '';
  const labels: string[] = Array.isArray(raw?.labels) 
    ? raw.labels.filter(Boolean).map(String) 
    : (Array.isArray(raw?.tags) ? raw.tags.filter(Boolean).map(String) : []);
  if (!category) {
    category = labels[0] || 'অন্যান্য';
  }
  if (labels.length === 0 && category) {
    labels.push(category);
  }

  // Safe date
  let date = typeof raw?.date === 'string' && raw.date.trim() ? raw.date.trim() : '';
  if (!date && typeof raw?.publishedDate === 'string' && raw.publishedDate.trim()) {
    date = raw.publishedDate.trim();
  }
  if (!date && (raw?.createdAt || raw?.publishedAt)) {
    try {
      const ts = Number(raw.createdAt || raw.publishedAt);
      if (!isNaN(ts) && ts > 0) {
        date = new Date(ts).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch {}
  }
  if (!date) {
    date = 'সাম্প্রতিক';
  }

  // Safe cover image
  const coverImage = raw?.coverImage || raw?.thumbnail || raw?.image || raw?.imageUrl || raw?.featuredImage || '';

  // Safe content parsing
  let content: string[] = [];
  if (Array.isArray(raw?.content)) {
    content = raw.content.filter((c: any) => typeof c === 'string' && c.trim().length > 0);
  } else if (typeof raw?.content === 'string' && raw.content.trim()) {
    content = [raw.content.trim()];
  } else if (typeof raw?.body === 'string' && raw.body.trim()) {
    content = [raw.body.trim()];
  } else if (typeof raw?.description === 'string' && raw.description.trim()) {
    content = [raw.description.trim()];
  } else if (typeof raw?.htmlContent === 'string' && raw.htmlContent.trim()) {
    const stripped = raw.htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped) content = [stripped];
  }

  // Safe excerpt
  let excerpt = typeof raw?.excerpt === 'string' && raw.excerpt.trim() ? raw.excerpt.trim() : '';
  if (!excerpt && typeof raw?.summary === 'string' && raw.summary.trim()) {
    excerpt = raw.summary.trim();
  }
  if (!excerpt && content.length > 0) {
    excerpt = content[0].slice(0, 160) + (content[0].length > 160 ? '...' : '');
  }

  // Safe slug
  const slug = typeof raw?.slug === 'string' && raw.slug.trim() 
    ? raw.slug.trim() 
    : (typeof raw?.postSlug === 'string' && raw.postSlug.trim() ? raw.postSlug.trim() : targetId);

  // Safe views
  const rawViews = raw?.views ?? raw?.viewCount ?? raw?.view_count ?? raw?.totalViews;
  const views = typeof rawViews === 'number' && !isNaN(rawViews) ? rawViews : (Number(rawViews) || 0);

  return {
    ...raw,
    id: targetId,
    title,
    slug,
    author,
    authorRole,
    date,
    readTime: raw?.readTime || '৫ মিনিট',
    category,
    labels,
    coverImage,
    imageAlt: raw?.imageAlt || title,
    excerpt,
    content,
    htmlContent: raw?.htmlContent || undefined,
    url: raw?.url || undefined,
    isDemo: false,
    type: 'POST',
    status: raw?.status === 'DRAFT' || raw?.status === 'SOFT_TRASHED' ? raw.status : 'LIVE',
    views,
    viewCount: views,
    allowIndex: raw?.allowIndex !== false
  };
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
        .filter(item => item && typeof item === 'object' && (item.title || item.postTitle || item.name))
        .map(item => normalizeBlogPostRecord(item, item.id))
        .filter(item => !deletedSet.has(item.id) && !(item.slug && deletedSet.has(item.slug)));
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
 * Get initial posts merging base website BLOG_POSTS, Blogger DOM and Local Storage cache.
 * Restores user's existing posts so the public blog page never displays 'কোনো ব্লগ পোস্ট পাওয়া যায়নি' on open.
 */
export function getInitialBlogPosts(): BlogPost[] {
  const domPosts = extractBloggerPostsFromDOM();
  const localPosts = getLocalStoredBlogs();
  const deletedSet = new Set(getDeletedBlogIds());
  
  const map = new Map<string, BlogPost>();

  // 1. Base website published blog posts (Restores all original blog posts)
  BLOG_POSTS.forEach(p => {
    if (!deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))) {
      map.set(p.id, normalizeBlogPostRecord(p, p.id));
    }
  });

  // 2. Blogger DOM posts
  domPosts.forEach(p => {
    if (!deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))) {
      map.set(p.id, normalizeBlogPostRecord(p, p.id));
    }
  });

  // 3. Local storage cached posts (includes newly created or edited posts)
  localPosts.forEach(p => {
    if (!deletedSet.has(p.id) && !(p.slug && deletedSet.has(p.slug))) {
      map.set(p.id, normalizeBlogPostRecord(p, p.id));
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
  const status = post.status || 'LIVE';
  const allowIndex = post.allowIndex !== undefined ? post.allowIndex : (status === 'LIVE');
  const now = Date.now();

  const isExisting = Boolean(post.id && !post.id.startsWith('post-'));
  const targetId = isExisting ? (post.id as string) : (push(ref(db, 'ebooks/_blogs')).key || push(ref(db, 'blogs')).key || `blog-${now}`);

  // Preserve existing view count so editing or re-publishing NEVER resets views to 0 (Requirement 10)
  const existingLocal = getLocalStoredBlogs().find(p => p.id === targetId || (post.slug && p.slug === post.slug));
  const cachedViews = getLocalBlogViews()[targetId] || (post.slug ? getLocalBlogViews()[post.slug] : 0);
  const preservedViews = post.views !== undefined 
    ? post.views 
    : ((post as any).viewCount !== undefined 
      ? (post as any).viewCount 
      : Math.max(existingLocal?.views ?? 0, existingLocal?.viewCount ?? 0, cachedViews ?? 0));

  const completePost: BlogPost = {
    ...post,
    id: targetId,
    author: typeof post.author === 'string' && post.author.trim() ? post.author.trim() : 'eBookBazar Editor',
    authorRole: typeof post.authorRole === 'string' && post.authorRole.trim() ? post.authorRole.trim() : 'লেখক / ব্লগার',
    title: typeof post.title === 'string' && post.title.trim() ? post.title.trim() : 'শিরোনামহীন ব্লগ পোস্ট',
    createdAt: (post as any).createdAt || now,
    updatedAt: now,
    isDemo: false,
    type: 'POST',
    status,
    allowIndex,
    views: preservedViews,
    htmlContent: post.htmlContent ? formatBlogContentToHtml(post.htmlContent) : (post.content ? formatBlogContentToHtml(post.content) : undefined)
  };

  // 1. Immediate local cache write (Instant feedback on current device)
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

  // 3. Dual-Layer Write:
  // Write to ebooks/_blogs (Inherits .read: true on all browsers and devices)
  // AND write to blogs node (Primary node)
  let writeSuccess = false;
  let lastError: any = null;

  try {
    const mirrorRef = ref(db, `ebooks/_blogs/${targetId}`);
    await set(mirrorRef, payload);
    writeSuccess = true;
  } catch (err: any) {
    console.warn('Firebase /ebooks/_blogs write notice:', err?.message || err);
    lastError = err;
  }

  try {
    const singleRef = ref(db, `blogs/${targetId}`);
    await set(singleRef, payload);
    writeSuccess = true;
  } catch (err: any) {
    console.warn('Firebase /blogs write notice:', err?.message || err);
    if (!lastError) lastError = err;
  }

  // If both failed, alert caller so admin is not misled by a silent failure
  if (!writeSuccess && lastError) {
    console.error('All Firebase blog writes failed:', lastError);
    throw new Error(`Firebase ডাটাবেসে ব্লগ সেভ করা যায়নি: ${lastError?.message || 'Permission denied'}`);
  }

  return targetId;
}

/**
 * Automatically synchronizes any locally created posts on this device to shared Firebase nodes.
 * Used when an admin logs in to ensure posts authored on one machine propagate to all visitors.
 */
export async function syncLocalBlogsToFirebase(): Promise<number> {
  const localPosts = getLocalStoredBlogs();
  if (!localPosts || localPosts.length === 0) return 0;

  let synced = 0;
  for (const post of localPosts) {
    if (post.isDemo) continue;
    try {
      const payload = sanitizeObjectForFirebase(post);
      await Promise.allSettled([
        set(ref(db, `ebooks/_blogs/${post.id}`), payload),
        set(ref(db, `blogs/${post.id}`), payload)
      ]);
      synced++;
    } catch {}
  }
  return synced;
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

export const LOCAL_STORAGE_BLOG_VIEWS_KEY = 'ebookbazar_blog_views_cache';

/**
 * Retrieve cached blog view counts from localStorage
 */
export function getLocalBlogViews(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BLOG_VIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist cached blog view counts to localStorage
 */
export function saveLocalBlogViews(viewsMap: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_BLOG_VIEWS_KEY, JSON.stringify(viewsMap));
  } catch {}
}

/**
 * Atomically increments the view count for a specific blog post in Firebase Realtime Database.
 * Employs a 15-minute deduplication window per visitor per article to prevent accidental 
 * duplicate counts caused by React StrictMode, re-renders, or quick page reloads.
 * Does not count admin preview or unpublished draft views.
 */
export async function recordBlogArticleView(
  postId: string,
  options?: { isDraft?: boolean; isAdmin?: boolean }
): Promise<number | null> {
  if (!postId) return null;
  // Requirement 13: Do not count admin preview or unpublished drafts as public views
  if (options?.isDraft || options?.isAdmin) return null;

  const cleanId = String(postId).replace(/[.#$[\]]/g, '_').trim();
  if (!cleanId) return null;

  // 1. Session-based deduplication window (15 minutes per visitor per article)
  const sessionKey = `eb_viewed_blog_${cleanId}`;
  const now = Date.now();
  const DEDUPE_WINDOW_MS = 15 * 60 * 1000;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const lastRecorded = sessionStorage.getItem(sessionKey);
      if (lastRecorded && (now - Number(lastRecorded) < DEDUPE_WINDOW_MS)) {
        // Already recorded within deduplication window
        return null;
      }
      sessionStorage.setItem(sessionKey, String(now));
    } catch {}
  }

  let finalCount: number | null = null;

  // 2. Concurrency-safe atomic transaction on ebooks/_blogViews/${cleanId}
  // (Public node accessible to all visitors across devices)
  try {
    const mirrorRef = ref(db, `ebooks/_blogViews/${cleanId}`);
    const res = await runTransaction(mirrorRef, (current) => {
      const cur = Number(current) || 0;
      return cur + 1;
    });
    if (res.committed && res.snapshot.exists()) {
      finalCount = Number(res.snapshot.val()) || 1;
    }
  } catch (err) {
    console.warn('Firebase RTDB ebooks/_blogViews transaction notice:', err);
  }

  // 3. Concurrency-safe atomic transaction on primary blogViews/${cleanId}
  try {
    const viewRef = ref(db, `blogViews/${cleanId}`);
    const res2 = await runTransaction(viewRef, (current) => {
      const cur = Number(current) || 0;
      return cur + 1;
    });
    if ((finalCount === null || !finalCount) && res2.committed && res2.snapshot.exists()) {
      finalCount = Number(res2.snapshot.val()) || 1;
    }
  } catch (err) {
    // Primary node transaction note
  }

  // 4. Update local cache immediately
  if (finalCount !== null) {
    try {
      const localMap = getLocalBlogViews();
      localMap[cleanId] = finalCount;
      localMap[postId] = finalCount;
      saveLocalBlogViews(localMap);
    } catch {}
  }

  // 5. Dual-layer mirror to post document views field if permissions allow
  try {
    runTransaction(ref(db, `ebooks/_blogs/${cleanId}/views`), (c) => (Number(c) || 0) + 1).catch(() => {});
    runTransaction(ref(db, `blogs/${cleanId}/views`), (c) => (Number(c) || 0) + 1).catch(() => {});
  } catch {}

  return finalCount;
}

/**
 * Subscribes in real time to the blog views across all Firebase RTDB nodes
 * (ebooks/_blogViews and blogViews), ensuring all public cards and article pages 
 * display the same persistent total synchronized across all devices and browsers.
 */
export function subscribeToAllBlogViews(callback: (viewsMap: Record<string, number>) => void): () => void {
  const currentMap: Record<string, number> = { ...getLocalBlogViews() };

  const mergeAndNotify = (val: any) => {
    if (val && typeof val === 'object') {
      let changed = false;
      for (const [k, v] of Object.entries(val)) {
        const num = Number(v) || 0;
        if (num > (currentMap[k] || 0)) {
          currentMap[k] = num;
          changed = true;
        }
      }
      if (changed) {
        saveLocalBlogViews(currentMap);
        callback({ ...currentMap });
      }
    }
  };

  // Immediate callback with cached views to prevent UI delay
  callback({ ...currentMap });

  // 1. Listen to ebooks/_blogViews (publicly accessible node)
  const mirrorViewsRef = ref(db, 'ebooks/_blogViews');
  const unsubMirror = onValue(mirrorViewsRef, (snap) => {
    if (snap.exists()) {
      mergeAndNotify(snap.val());
    }
  }, (err) => {
    console.warn('Firebase RTDB ebooks/_blogViews listener note:', err?.message);
  });

  // 2. Listen to primary blogViews
  const primaryViewsRef = ref(db, 'blogViews');
  const unsubPrimary = onValue(primaryViewsRef, (snap) => {
    if (snap.exists()) {
      mergeAndNotify(snap.val());
    }
  }, (err) => {
    // Primary node restricted or pending rules
  });

  return () => {
    unsubMirror();
    unsubPrimary();
  };
}

