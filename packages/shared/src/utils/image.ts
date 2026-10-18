/**
 * Responsive image URLs. Cloudinary URLs get f_auto,q_auto,w_… transformations inserted
 * after /upload/. Unsplash (seed data) gets equivalent query params. Others pass through.
 */
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

export const IMAGE_WIDTHS = [320, 480, 640, 828, 1080, 1440, 1920] as const;

export interface ImageOptions {
  width?: number;
  /** Aspect ratio as width/height, e.g. 0.8 for 4:5. Crops with gravity auto. */
  aspect?: number;
  quality?: 'auto' | number;
}

export function imageUrl(
  src: string,
  { width, aspect, quality = 'auto' }: ImageOptions = {},
): string {
  if (!src) return src;
  const cld = src.match(CLOUDINARY_UPLOAD);
  if (cld) {
    const t = ['f_auto', `q_${quality}`];
    if (width) t.push(`w_${width}`);
    if (width && aspect) t.push(`h_${Math.round(width / aspect)}`, 'c_fill', 'g_auto');
    else if (width) t.push('c_limit');
    return `${cld[1]}${t.join(',')}/${cld[2]}`;
  }
  if (src.startsWith('https://images.unsplash.com/')) {
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('q', typeof quality === 'number' ? String(quality) : '75');
    if (width) url.searchParams.set('w', String(width));
    if (width && aspect) {
      url.searchParams.set('h', String(Math.round(width / aspect)));
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('crop', 'faces,entropy');
    }
    return url.toString();
  }
  return src;
}

export function imageSrcSet(
  src: string,
  opts: Omit<ImageOptions, 'width'> = {},
  maxWidth = 1920,
): string {
  return IMAGE_WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${imageUrl(src, { ...opts, width: w })} ${w}w`)
    .join(', ');
}
