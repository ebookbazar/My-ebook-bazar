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

/**
 * Saves a real blog post to Firebase RTDB
 */
export async function saveBlogPostToFirebase(post: Omit<BlogPost, 'id'> & { id?: string }): Promise<string> {
  const blogsRef = ref(db, 'blogs');
  const status = post.status || 'LIVE';
  const allowIndex = post.allowIndex !== undefined ? post.allowIndex : (status === 'LIVE');

  if (post.id && !post.id.startsWith('post-')) {
    // update existing
    const singleRef = ref(db, `blogs/${post.id}`);
    const payload = sanitizeObjectForFirebase({ 
      ...post, 
      updatedAt: Date.now(), 
      isDemo: false, 
      type: 'POST', 
      status,
      allowIndex
    });
    await set(singleRef, payload);
    return post.id;
  } else {
    // create new
    const newRef = push(blogsRef);
    const newId = newRef.key as string;
    const payload = sanitizeObjectForFirebase({
      ...post,
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDemo: false,
      type: 'POST',
      status,
      allowIndex
    });
    await set(newRef, payload);
    return newId;
  }
}

/**
 * Deletes a blog post from Firebase RTDB
 */
export async function deleteBlogPostFromFirebase(id: string): Promise<void> {
  const postRef = ref(db, `blogs/${id}`);
  await remove(postRef);
}

/**
 * Permanently hides / deletes all demo blog posts in system settings
 */
export async function setHideDemoBlogsSetting(hide: boolean): Promise<void> {
  const settingRef = ref(db, 'settings/hideDemoBlogs');
  await set(settingRef, hide);
}
