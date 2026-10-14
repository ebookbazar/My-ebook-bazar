/**
 * eBook Sharing Utilities
 * Provides public URL generation, share text formatting, native Web Share,
 * WhatsApp / Facebook deep-linking, and fallback clipboard copy.
 */

/**
 * Returns the canonical public URL for an individual eBook
 */
export function getPublicEbookUrl(bookId: string): string {
  if (!bookId) return '';
  const cleanId = String(bookId).trim();
  
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    return `${origin}${basePath}/?ebook=${encodeURIComponent(cleanId)}`;
  }
  
  // Static SSR / fallback URL
  return `https://ebookbazar.github.io/My-ebook-bazar/?ebook=${encodeURIComponent(cleanId)}`;
}

/**
 * Generates the standardized dynamic share text
 */
export function generateEbookShareText(title: string, url: string): string {
  const cleanTitle = (title || 'ডিজিটাল বই').trim();
  return `এই eBook-টি দেখে নিতে পারেন:\n${cleanTitle}\n\nবিস্তারিত দেখুন:\n${url}`;
}

/**
 * Copies the eBook link to clipboard with browser fallback
 */
export async function copyEbookLink(url: string): Promise<boolean> {
  if (!url) return false;

  // Modern Async Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Legacy execCommand fallback (works in iframes & older mobile browsers)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Triggers Native Browser Share API if supported
 */
export async function shareViaNative(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url
      });
      return 'shared';
    } catch (err: any) {
      if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
        return 'cancelled';
      }
      return 'unsupported';
    }
  }
  return 'unsupported';
}

/**
 * Builds WhatsApp share link
 */
export function getWhatsAppShareUrl(shareText: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
}

/**
 * Builds Facebook share dialog URL
 */
export function getFacebookShareUrl(publicUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;
}
