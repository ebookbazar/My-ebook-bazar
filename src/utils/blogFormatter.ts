/**
 * Blog Article Content Formatter, Sanitizer & View Count Utility
 * 
 * Objectives:
 * 1. Preserves separate Bengali & English paragraphs, intentional line breaks, headings, lists, bold, italics, links.
 * 2. Prevents merging into continuous walls of text.
 * 3. Prevents duplicate line breaks during editing and republishing.
 * 4. Safely sanitizes untrusted HTML.
 * 5. Provides consistent Bengali/English view-count formatting.
 */

const DANGEROUS_TAGS_REGEX = /<\/?(?:script|style|iframe|object|embed|applet|form|input|button|textarea|select|canvas|svg|meta|link)\b[^>]*>/gi;
const ON_EVENT_ATTRS_REGEX = /\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const JAVASCRIPT_URL_REGEX = /(?:href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi;

/**
 * Escapes raw plain text for safe HTML rendering
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips executable scripts, event handlers, and unsafe URLs from HTML strings
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return '';
  let sanitized = html
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(ON_EVENT_ATTRS_REGEX, '')
    .replace(JAVASCRIPT_URL_REGEX, 'href="#"');

  // Enforce secure rel on external links
  sanitized = sanitized.replace(/<a\b([^>]*?)>/gi, (match, attrs) => {
    if (/href\s*=\s*["']https?:\/\//i.test(attrs) && !/rel\s*=/i.test(attrs)) {
      return `<a ${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });

  return sanitized;
}

/**
 * Converts raw content (HTML or plain text) into clean, standard semantic HTML
 * with explicit <p> paragraph wrappers, headings, lists, and line breaks.
 */
export function formatBlogContentToHtml(content: string | string[] | undefined | null): string {
  if (!content) return '';

  let raw = Array.isArray(content) ? content.join('\n\n') : String(content).trim();
  if (!raw) return '';

  // If already contains multiple <p> tags, verify if it needs paragraph wrapping
  const hasParagraphTags = /<p\b[^>]*>/i.test(raw);
  const hasBlockTags = /<(?:h[1-6]|ul|ol|blockquote|table|pre|div)\b[^>]*>/i.test(raw);

  // If content already has <p> tags and no unformatted raw text blocks, sanitize and return
  if (hasParagraphTags && !/\n\s*\n/.test(raw.replace(/<[^>]+>/g, ''))) {
    return sanitizeBlogHtml(raw);
  }

  // Regex matching block elements: headings, lists, blockquotes, tables, pre, hr, img, etc.
  const blockPattern = /(<(?:h[1-6]|ul|ol|blockquote|pre|table|hr|img)[^>]*>[\s\S]*?<\/(?:h[1-6]|ul|ol|blockquote|pre|table|hr|img)>|<(?:hr|img)[^>]*>)/gi;

  const parts = raw.split(blockPattern);
  const resultBlocks: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // If this part is already a block tag (e.g. <h2>...</h2>, <ul>...</ul>)
    if (/^<(?:h[1-6]|ul|ol|blockquote|pre|table|hr|img)\b/i.test(trimmed)) {
      resultBlocks.push(sanitizeBlogHtml(trimmed));
      continue;
    }

    // If this part is already wrapped in <p>...</p>
    if (/^<p\b[\s\S]*<\/p>$/i.test(trimmed)) {
      resultBlocks.push(sanitizeBlogHtml(trimmed));
      continue;
    }

    // Split text segments into paragraphs by double newlines (\n\s*\n)
    const rawParagraphs = trimmed.split(/\r?\n\s*\r?\n/);

    for (const p of rawParagraphs) {
      const pClean = p.trim();
      if (!pClean) continue;

      // Check if Markdown heading
      if (pClean.startsWith('## ')) {
        resultBlocks.push(`<h2>${sanitizeBlogHtml(pClean.replace(/^##\s+/, '').trim())}</h2>`);
        continue;
      }
      if (pClean.startsWith('### ')) {
        resultBlocks.push(`<h3>${sanitizeBlogHtml(pClean.replace(/^###\s+/, '').trim())}</h3>`);
        continue;
      }

      // Check if bullet list (* or -)
      if (/^[*-]\s+/m.test(pClean)) {
        const lines = pClean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const listItems = lines
          .map(l => l.replace(/^[*-]\s+/, '').trim())
          .filter(Boolean)
          .map(it => `<li>${sanitizeBlogHtml(it)}</li>`)
          .join('');
        if (listItems) {
          resultBlocks.push(`<ul>${listItems}</ul>`);
          continue;
        }
      }

      // Check if numbered list (1. 2.)
      if (/^\d+\.\s+/m.test(pClean)) {
        const lines = pClean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const listItems = lines
          .map(l => l.replace(/^\d+\.\s+/, '').trim())
          .filter(Boolean)
          .map(it => `<li>${sanitizeBlogHtml(it)}</li>`)
          .join('');
        if (listItems) {
          resultBlocks.push(`<ol>${listItems}</ol>`);
          continue;
        }
      }

      // Intentional single line breaks within a paragraph become <br />
      const pWithBr = pClean
        .split(/\r?\n/)
        .map(line => sanitizeBlogHtml(line.trim()))
        .filter(Boolean)
        .join('<br />');

      if (pWithBr) {
        resultBlocks.push(`<p>${pWithBr}</p>`);
      }
    }
  }

  return resultBlocks.join('\n');
}

/**
 * Converts stored HTML back into natural text for the Full Content editor textarea,
 * so the admin sees clean paragraphs with blank lines between them, preserving
 * headings, lists, bold, and links without duplicating line breaks on save/edit cycles.
 */
export function htmlToEditorText(html: string | string[] | undefined | null): string {
  if (!html) return '';

  if (Array.isArray(html)) {
    return html.join('\n\n');
  }

  let text = String(html).trim();
  if (!text) return '';

  // Add spacing before and after block elements
  text = text.replace(/<(h[1-6]|ul|ol|blockquote|table|pre)\b[^>]*>/gi, '\n\n$0');
  text = text.replace(/<\/(h[1-6]|ul|ol|blockquote|table|pre)>/gi, '$0\n\n');

  // Convert <br /> to single newline
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert </p> to double newlines
  text = text.replace(/<\/p>\s*/gi, '\n\n');

  // Remove opening <p> tags
  text = text.replace(/<p\b[^>]*>/gi, '');

  // Normalize excessive blank lines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Formats a view count with Bengali thousands separator and label.
 * Example: 1245 -> "১,২৪৫ বার দেখা হয়েছে"
 * Fallback: 0 -> "০ বার দেখা হয়েছে"
 */
export function formatBlogViewCount(count?: number | null): string {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  try {
    const formattedNum = safeCount.toLocaleString('bn-BD');
    return `${formattedNum} বার দেখা হয়েছে`;
  } catch {
    return `${safeCount.toLocaleString()} বার দেখা হয়েছে`;
  }
}

/**
 * Compact view count format for space-constrained mobile badges.
 * Example: 1245 -> "১,২৪৫ ভিউ"
 */
export function formatBlogViewCountShort(count?: number | null): string {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  try {
    const formattedNum = safeCount.toLocaleString('bn-BD');
    return `${formattedNum} ভিউ`;
  } catch {
    return `${safeCount.toLocaleString()} ভিউ`;
  }
}

/**
 * Resolves the effective view count from real-time database views map or post document
 */
export function getEffectiveBlogViews(
  post?: { id: string; slug?: string; views?: number; viewCount?: number } | null, 
  blogViews?: Record<string, number>
): number {
  if (!post) return 0;
  if (blogViews) {
    if (typeof blogViews[post.id] === 'number') {
      return blogViews[post.id];
    }
    if (post.slug && typeof blogViews[post.slug] === 'number') {
      return blogViews[post.slug];
    }
  }
  return Number(post.views ?? post.viewCount ?? 0) || 0;
}
