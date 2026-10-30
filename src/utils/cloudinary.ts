interface CloudinaryImageOptions {
  /** Target width in pixels. Ignored when `blur` is set. */
  width?: number;
  /** Return a tiny blurred placeholder instead of the full-size image. */
  blur?: boolean;
}

const UPLOAD_PATH = '/image/upload/';

/**
 * Rewrites a Cloudinary delivery URL with width/quality transformations.
 * Non-Cloudinary URLs (or URLs that already point elsewhere) are returned as-is.
 */
export function cloudinaryImage(
  url: string,
  { width = 1600, blur = false }: CloudinaryImageOptions = {}
) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes(UPLOAD_PATH)) {
    return url;
  }

  const [base, rest] = url.split(UPLOAD_PATH);
  const slash = rest.indexOf('/');

  // `rest` looks like either `v123/id.jpg`, `f_auto,q_auto/id.jpg` or `id.jpg`.
  // Drop any existing transformation segment and keep the version + filename.
  let tail = rest;
  if (slash !== -1) {
    const first = rest.slice(0, slash);
    if (!/^v\d+$/.test(first)) tail = rest.slice(slash + 1);
  }

  const transform = blur
    ? 'w_40,c_limit,e_blur:600,q_auto,f_auto'
    : `w_${width},c_limit,f_auto,q_auto`;

  return `${base}${UPLOAD_PATH}${transform}/${tail}`;
}
