/**
 * Image URL Optimization Helper
 * Dynamically delivers appropriately sized, compressed WebP assets for external CDNs (Unsplash)
 * while preserving aspect ratios and original image sources.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) return '';

  const { width = 360, quality = 72, format = 'webp' } = options;

  // Unsplash dynamic image optimization
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('w', width.toString());
      if (options.height) {
        parsed.searchParams.set('h', options.height.toString());
      }
      parsed.searchParams.set('q', quality.toString());
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fm', format);
      parsed.searchParams.set('fit', 'crop');
      return parsed.toString();
    } catch {
      // If URL parsing fails, string replacement fallback
      return trimmed
        .replace(/([?&])w=\d+/, `$1w=${width}`)
        .replace(/([?&])q=\d+/, `$1q=${quality}`);
    }
  }

  return trimmed;
}
