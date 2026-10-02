import { BlogPost } from '../types';

export interface SeoMetaTagOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  category?: string;
  keywords?: string[];
  allowIndex?: boolean;
}

const DEFAULT_SITE_TITLE = 'eBookBazar – ডিজিটাল বই মার্কেটপ্লেস ও লার্নিং হাব';
const DEFAULT_SITE_DESC = 'eBookBazar: বাংলা ই-বুক মার্কেটপ্লেস, ডিজিটাল পাবলিশিং, ক্যারিয়ার গাইড, অ্যাফিলিয়েট ও সেলার প্ল্যাটফর্ম।';

/**
 * Generates an SEO-friendly URL slug complying with user guidelines:
 * - lowercase
 * - English letters/numbers
 * - hyphen
 * - no spaces
 * - no unnecessary special characters
 */
export function generateSlug(title: string, fallbackId: string = ''): string {
  if (!title) return fallbackId ? `post-${fallbackId}` : `post-${Date.now()}`;

  // Basic Bengali-to-English common keyword transliteration mapping for common topics
  let processed = title.toLowerCase();

  // If there are English characters, extract and slugify them
  let englishSlug = processed
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  // If englishSlug has at least 3 characters, use it
  if (englishSlug && englishSlug.replace(/-/g, '').length >= 3) {
    return englishSlug.slice(0, 80);
  }

  // Fallback for purely Bengali titles: transliterate common keywords
  const bengaliKeywordMap: Record<string, string> = {
    'ই-বুক': 'ebook',
    'ইবুক': 'ebook',
    'পাবলিশ': 'publishing',
    'প্যাসিভ': 'passive',
    'ইনকাম': 'income',
    'আয়': 'earning',
    'ক্যারিয়ার': 'career',
    'প্রোগ্রামিং': 'programming',
    'কোডিং': 'coding',
    'টেকনোলজি': 'technology',
    'বিসিএস': 'bcs',
    'ব্যাংক': 'bank-job',
    'চাকরি': 'job-preparation',
    'সাধারণ জ্ঞান': 'general-knowledge',
    'রেফারেল': 'referral',
    'কমিশন': 'commission',
    'সোশ্যাল মিডিয়া': 'social-media',
    'মার্কেটিং': 'marketing',
    'ফ্রিল্যান্সিং': 'freelancing',
    'স্কিল': 'skills',
    'ডিজিটাল': 'digital',
    'শিক্ষা': 'education',
    'ব্যবসায়': 'business',
    'উদ্যোক্তা': 'entrepreneurship',
    'গাইড': 'guide',
    'কৌশল': 'strategy',
    'টিপস': 'tips',
    'বই': 'book'
  };

  const detectedTokens: string[] = [];
  for (const [bn, en] of Object.entries(bengaliKeywordMap)) {
    if (processed.includes(bn)) {
      detectedTokens.push(en);
    }
  }

  if (detectedTokens.length > 0) {
    const combined = detectedTokens.slice(0, 4).join('-');
    const suffix = fallbackId ? `-${fallbackId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)}` : '';
    return `${combined}${suffix}`;
  }

  // Final fallback
  const cleanId = (fallbackId || `${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `blog-post-${cleanId.slice(0, 10)}`;
}

/**
 * Ensures unique slug among existing posts
 */
export function ensureUniqueSlug(desiredSlug: string, currentPostId: string | undefined, allPosts: BlogPost[]): string {
  let slug = desiredSlug;
  let counter = 1;

  while (
    allPosts.some(
      p => (p.slug === slug || (!p.slug && p.id === slug)) && p.id !== currentPostId
    )
  ) {
    counter++;
    slug = `${desiredSlug}-${counter}`;
  }

  return slug;
}

/**
 * Updates DOM head elements with full Dynamic SEO metadata
 */
export function updateDocumentSeo(options: SeoMetaTagOptions): void {
  if (typeof document === 'undefined') return;

  // 1. Title Tag
  document.title = options.title ? `${options.title} | eBookBazar` : DEFAULT_SITE_TITLE;

  // Helper to get or create a meta tag
  const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
    let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Helper to get or create a link tag
  const setLinkTag = (rel: string, href: string) => {
    let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // 2. Standard Meta Description
  setMetaTag('name', 'description', options.description || DEFAULT_SITE_DESC);

  // 3. Robots Meta (Index / Noindex)
  const robotsDirective = options.allowIndex !== false ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow';
  setMetaTag('name', 'robots', robotsDirective);

  // 4. Canonical Link
  if (options.canonicalUrl) {
    setLinkTag('canonical', options.canonicalUrl);
  }

  // 5. Open Graph Meta Tags
  setMetaTag('property', 'og:site_name', 'eBookBazar');
  setMetaTag('property', 'og:title', options.title);
  setMetaTag('property', 'og:description', options.description || DEFAULT_SITE_DESC);
  setMetaTag('property', 'og:type', options.type || 'website');
  if (options.canonicalUrl) {
    setMetaTag('property', 'og:url', options.canonicalUrl);
  }
  if (options.imageUrl) {
    setMetaTag('property', 'og:image', options.imageUrl);
    if (options.imageAlt) {
      setMetaTag('property', 'og:image:alt', options.imageAlt);
    }
  }

  // Article Specific Open Graph tags
  if (options.type === 'article') {
    if (options.publishedAt) {
      setMetaTag('property', 'article:published_time', options.publishedAt);
    }
    if (options.updatedAt) {
      setMetaTag('property', 'article:modified_time', options.updatedAt);
    }
    if (options.authorName) {
      setMetaTag('property', 'article:author', options.authorName);
    }
    if (options.category) {
      setMetaTag('property', 'article:section', options.category);
    }
    if (options.keywords && options.keywords.length > 0) {
      setMetaTag('name', 'keywords', options.keywords.join(', '));
      options.keywords.forEach(kw => {
        setMetaTag('property', 'article:tag', kw);
      });
    }
  }

  // 6. Twitter / X Card Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', options.title);
  setMetaTag('name', 'twitter:description', options.description || DEFAULT_SITE_DESC);
  if (options.imageUrl) {
    setMetaTag('name', 'twitter:image', options.imageUrl);
    if (options.imageAlt) {
      setMetaTag('name', 'twitter:image:alt', options.imageAlt);
    }
  }

  // 7. Structured Data (JSON-LD) for BlogPosting
  injectArticleJsonLd(options);
}

/**
 * Injects Schema.org JSON-LD structured data for BlogPosting or Article
 */
function injectArticleJsonLd(options: SeoMetaTagOptions): void {
  if (typeof document === 'undefined') return;

  const scriptId = 'ebookbazar-article-jsonld';
  let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

  if (options.type !== 'article') {
    if (scriptElement) scriptElement.remove();
    return;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ebookbazar.com';
  const logoUrl = `${origin}/ebookbazar-logo.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.canonicalUrl
    },
    headline: options.title,
    description: options.description,
    image: options.imageUrl ? [options.imageUrl] : [logoUrl],
    datePublished: options.publishedAt || new Date().toISOString(),
    dateModified: options.updatedAt || options.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: options.authorName || 'eBookBazar Editor'
    },
    publisher: {
      '@type': 'Organization',
      name: 'eBookBazar',
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      }
    },
    articleSection: options.category || 'General',
    keywords: options.keywords && options.keywords.length > 0 ? options.keywords.join(', ') : undefined
  };

  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  scriptElement.text = JSON.stringify(structuredData, null, 2);
}

/**
 * Resets document SEO back to general website defaults
 */
export function resetDocumentSeo(): void {
  if (typeof document === 'undefined') return;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ebookbazar.com';

  updateDocumentSeo({
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESC,
    canonicalUrl: origin,
    imageUrl: `${origin}/ebookbazar-logo.jpg`,
    imageAlt: 'eBookBazar Logo',
    type: 'website',
    allowIndex: true
  });

  const scriptElement = document.getElementById('ebookbazar-article-jsonld');
  if (scriptElement) {
    scriptElement.remove();
  }
}

/**
 * Validates and sanitizes internal or external URLs.
 * Strictly prevents javascript:, data:, vbscript:, and file: XSS vectors.
 */
export function validateAndSanitizeUrl(
  inputUrl: string,
  isInternal: boolean = false
): { safe: boolean; url: string; error?: string } {
  const trimmed = (inputUrl || '').trim();
  if (!trimmed) {
    return { safe: false, url: '', error: 'URL প্রদান করা আবশ্যক' };
  }

  // Reject dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.includes('<script')
  ) {
    return { safe: false, url: '', error: 'নিরাপত্তার স্বার্থে এই ধরনের ক্ষতিকর স্ক্রিপ্ট লিংক গ্রহণযোগ্য নয়' };
  }

  if (isInternal) {
    // If it's internal, ensure relative or root-relative path
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ebookbazar.com';
        if (parsed.origin === origin || parsed.hostname.includes('ebookbazar')) {
          // Normalize to pathname + search
          return { safe: true, url: parsed.pathname + parsed.search + parsed.hash };
        } else {
          return {
            safe: false,
            url: trimmed,
            error: 'এটি একটি বহিরাগত (External) লিংক। ইন্টারনাল লিংকের জন্য সাইটের ভেতরের পাথ (যেমন: /blog বা /) ব্যবহার করুন।'
          };
        }
      } catch {
        return { safe: false, url: trimmed, error: 'অকার্যকর লিংক ফরম্যাট' };
      }
    }

    if (!trimmed.startsWith('/') && !trimmed.startsWith('#')) {
      return { safe: true, url: `/${trimmed}` };
    }
    return { safe: true, url: trimmed };
  } else {
    // External link: must be http or https
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return {
        safe: false,
        url: trimmed,
        error: 'এক্সটারনাল লিংকের ক্ষেত্রে অবশ্যই http:// বা https:// সহ সম্পূর্ণ লিংক লিখুন'
      };
    }
    try {
      new URL(trimmed);
      return { safe: true, url: trimmed };
    } catch {
      return { safe: false, url: trimmed, error: 'অকার্যকর এক্সটারনাল URL ফরম্যাট' };
    }
  }
}

export interface ContentSeoCheckResult {
  id: string;
  label: string;
  status: 'success' | 'warning' | 'info';
  message: string;
}

/**
 * Analyzes blog content and metadata to provide a lightweight, fact-based Content SEO Checklist.
 * Does not make fake or exaggerated ranking claims.
 */
export function analyzeContentSeo(params: {
  title: string;
  content: string;
  focusKeyword?: string;
  seoTitle?: string;
  metaDescription?: string;
  slug?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  allowIndex?: boolean;
}): {
  h1CountInBody: number;
  h2Count: number;
  h3Count: number;
  internalLinkCount: number;
  externalLinkCount: number;
  checks: ContentSeoCheckResult[];
} {
  const content = params.content || '';
  const title = (params.title || '').trim();
  const kw = (params.focusKeyword || '').trim().toLowerCase();

  // 1. H1 Count in content body
  const h1TagMatches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const h1MarkdownMatches = content.match(/(^|\n)#[ \t]+[^\n]+/g) || [];
  const h1CountInBody = h1TagMatches.length + h1MarkdownMatches.length;

  // 2. H2 Count
  const h2TagMatches = content.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
  const h2MarkdownMatches = content.match(/(^|\n)##[ \t]+[^\n]+/g) || [];
  const h2Count = h2TagMatches.length + h2MarkdownMatches.length;

  // 3. H3 Count
  const h3TagMatches = content.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi) || [];
  const h3MarkdownMatches = content.match(/(^|\n)###[ \t]+[^\n]+/g) || [];
  const h3Count = h3TagMatches.length + h3MarkdownMatches.length;

  // 4. Link counts
  // Internal: href starting with / or #
  const internalLinkMatches = content.match(/href=["'](\/[^"']*|#[^"']*)["']/gi) || [];
  const internalLinkCount = internalLinkMatches.length;

  // External: href starting with http:// or https://
  const externalLinkMatches = content.match(/href=["']https?:\/\/[^"']+["']/gi) || [];
  const externalLinkCount = externalLinkMatches.length;

  const checks: ContentSeoCheckResult[] = [];

  // Check 1: Primary H1
  if (h1CountInBody > 0) {
    checks.push({
      id: 'h1',
      label: 'Primary H1',
      status: 'warning',
      message: `Warning: Multiple H1 detected (${h1CountInBody}টি অতিরিক্ত H1 কনটেন্টে পাওয়া গেছে)। ব্লগের মূল টাইটেলই স্বয়ংক্রিয়ভাবে প্রধান H1, কনটেন্টের ভেতরে H2/H3 ব্যবহার করা সর্বোত্তম।`
    });
  } else {
    checks.push({
      id: 'h1',
      label: 'Primary H1',
      status: 'success',
      message: 'Primary H1: OK (ব্লগ শিরোনামটি মূল H1 হিসেবে কার্যকর)'
    });
  }

  // Check 2: Heading 2
  if (h2Count > 0) {
    checks.push({
      id: 'h2',
      label: 'H2 হেডিং',
      status: 'success',
      message: `H2 হেডিং পাওয়া গেছে (${h2Count}টি)`
    });
  } else {
    checks.push({
      id: 'h2',
      label: 'H2 হেডিং',
      status: 'warning',
      message: 'কোনো H2 হেডিং নেই (বড় অনুচ্ছেদগুলোকে H2 দিয়ে ভাগ করা উত্তম)'
    });
  }

  // Check 3: Heading 3
  if (h3Count > 0) {
    checks.push({
      id: 'h3',
      label: 'H3 সাব-হেডিং',
      status: 'info',
      message: `H3 সাব-হেডিং রয়েছে (${h3Count}টি)`
    });
  }

  // Check 4: Focus Keyword
  if (kw) {
    const inTitle = title.toLowerCase().includes(kw);
    const inContent = content.toLowerCase().includes(kw);
    if (inTitle && inContent) {
      checks.push({
        id: 'keyword',
        label: 'Focus Keyword',
        status: 'success',
        message: `কী-ওয়ার্ড "${params.focusKeyword}" টাইটেল এবং কনটেন্ট উভয়েই উপস্থিত রয়েছে`
      });
    } else if (inTitle) {
      checks.push({
        id: 'keyword',
        label: 'Focus Keyword',
        status: 'info',
        message: `কী-ওয়ার্ড "${params.focusKeyword}" টাইটেলে পাওয়া গেছে, তবে মূল কনটেন্টে আরও স্বাভাবিকভাবে ব্যবহার করা যেতে পারে`
      });
    } else {
      checks.push({
        id: 'keyword',
        label: 'Focus Keyword',
        status: 'warning',
        message: `কী-ওয়ার্ড "${params.focusKeyword}" ব্লগের টাইটেলে পাওয়া যায়নি`
      });
    }
  } else {
    checks.push({
      id: 'keyword',
      label: 'Focus Keyword',
      status: 'info',
      message: 'কোনো ফোকাস কী-ওয়ার্ড নির্ধারণ করা হয়নি (ঐচ্ছিক)'
    });
  }

  // Check 5: Internal Links
  if (internalLinkCount > 0) {
    checks.push({
      id: 'internal-link',
      label: 'Internal Link',
      status: 'success',
      message: `ইন্টারনাল লিংক যুক্ত আছে (${internalLinkCount}টি)`
    });
  } else {
    checks.push({
      id: 'internal-link',
      label: 'Internal Link',
      status: 'warning',
      message: 'কোনো ইন্টারনাল লিংক যুক্ত নেই (অন্যান্য পোস্ট বা ই-বুকের লিংক পাঠকদের ধরে রাখতে সাহায্য করে)'
    });
  }

  // Check 6: External Links
  if (externalLinkCount > 0) {
    checks.push({
      id: 'external-link',
      label: 'External Link',
      status: 'success',
      message: `এক্সটারনাল রেফারেন্স লিংক যুক্ত আছে (${externalLinkCount}টি)`
    });
  } else {
    checks.push({
      id: 'external-link',
      label: 'External Link',
      status: 'info',
      message: 'External source not added (প্রয়োজনে নির্ভরযোগ্য সূত্রের লিংক যুক্ত করতে পারেন)'
    });
  }

  // Check 7: Image ALT
  if (params.imageAlt && params.imageAlt.trim()) {
    checks.push({
      id: 'image-alt',
      label: 'Image ALT',
      status: 'success',
      message: `ছবির ALT Text যুক্ত আছে: "${params.imageAlt.slice(0, 30)}${params.imageAlt.length > 30 ? '...' : ''}"`
    });
  } else {
    checks.push({
      id: 'image-alt',
      label: 'Image ALT',
      status: 'warning',
      message: 'ছবির ALT Text খালি (Google Image সার্চ র‍্যাংকিংয়ের জন্য ALT Text দেওয়া জরুরি)'
    });
  }

  // Check 8: SEO Title
  const seoTitleLen = (params.seoTitle || title).length;
  if (seoTitleLen >= 40 && seoTitleLen <= 65) {
    checks.push({
      id: 'seo-title',
      label: 'SEO Title',
      status: 'success',
      message: `SEO Title আদর্শ দৈর্ঘ্যের (${seoTitleLen} অক্ষর)`
    });
  } else if (seoTitleLen > 65) {
    checks.push({
      id: 'seo-title',
      label: 'SEO Title',
      status: 'warning',
      message: `SEO Title ৬০ অক্ষরের বেশি (${seoTitleLen} অক্ষর), সার্চ রেজাল্টে কেটে যেতে পারে`
    });
  } else {
    checks.push({
      id: 'seo-title',
      label: 'SEO Title',
      status: 'info',
      message: `SEO Title কিছুটা সংক্ষিপ্ত (${seoTitleLen} অক্ষর)`
    });
  }

  // Check 9: Meta Description
  const metaDescLen = (params.metaDescription || '').length;
  if (metaDescLen >= 120 && metaDescLen <= 165) {
    checks.push({
      id: 'meta-desc',
      label: 'Meta Description',
      status: 'success',
      message: `Meta Description আদর্শ দৈর্ঘ্যের (${metaDescLen} অক্ষর)`
    });
  } else if (metaDescLen > 165) {
    checks.push({
      id: 'meta-desc',
      label: 'Meta Description',
      status: 'warning',
      message: `Meta Description ১৬০ অক্ষরের বেশি (${metaDescLen} অক্ষর)`
    });
  } else if (metaDescLen > 0) {
    checks.push({
      id: 'meta-desc',
      label: 'Meta Description',
      status: 'info',
      message: `Meta Description সংক্ষিপ্ত (${metaDescLen} অক্ষর)`
    });
  } else {
    checks.push({
      id: 'meta-desc',
      label: 'Meta Description',
      status: 'warning',
      message: 'Meta Description খালি রয়েছে'
    });
  }

  // Check 10: Indexing
  if (params.allowIndex !== false) {
    checks.push({
      id: 'robots',
      label: 'Robots Indexing',
      status: 'success',
      message: 'সার্চ ইঞ্জিনের জন্য Indexable (পাবলিক সার্চে প্রদর্শিত হবে)'
    });
  } else {
    checks.push({
      id: 'robots',
      label: 'Robots Indexing',
      status: 'warning',
      message: 'Noindex সক্রিয় (সার্চ ইঞ্জিনে ইনডেক্স হবে না)'
    });
  }

  return {
    h1CountInBody,
    h2Count,
    h3Count,
    internalLinkCount,
    externalLinkCount,
    checks
  };
}

/**
 * Returns the public blog URL based on actual deployed origin (window.location.origin)
 * and the post's unique slug (or id).
 * Never hard-codes domain names.
 */
export function getPublicBlogUrl(slugOrId?: string): string {
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : '';
  if (!slugOrId) return `${origin}/blog`;
  return `${origin}/blog/${slugOrId}`;
}

/**
 * Safely copies text to the user's clipboard across browsers and iframes
 * with graceful fallback to execCommand or user prompt.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Try modern navigator.clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // 2. Fallback using temporary textarea + execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch {
    // Fallback below
  }

  // 3. Graceful fallback prompt
  try {
    window.prompt('ব্লগের পাবলিক লিঙ্কটি কপি করতে Ctrl+C বা Cmd+C চাপুন:', text);
    return true;
  } catch {
    return false;
  }
}
