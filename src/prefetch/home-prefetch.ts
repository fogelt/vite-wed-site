/**
 * Home prefetch
 * -------------
 * Inlined into index.html by the `inlineHomePrefetch` plugin in
 * vite.config.ts, so it runs while the HTML is still being parsed instead of
 * after the app bundle and the home route chunk have downloaded. On a phone
 * that is most of the time before the hero could otherwise appear.
 *
 * 1. A returning visitor's hero images are requested straight away, from the
 *    snapshot the Hero component saved on the last visit.
 * 2. The gallery data for the home page is requested now. `fetchPhotosByTag`
 *    picks up the pending result instead of asking again.
 * 3. As soon as that data is in, the current hero images are requested, so a
 *    first-time visitor's hero is not waiting on React either.
 *
 * Only `fetch` and the shared pure helpers are used here: no React, no
 * supabase-js. Every failure is silent and the app then fetches as usual.
 */
import {
  buildPhotos,
  cloudinaryListUrl,
  PHOTO_ORDER_SELECT,
  type CloudinaryResource,
  type RawPhotoData,
} from '../services/photo-builder';
import {
  heroFirstFrameUrls,
  loadHeroSnapshot,
  MOBILE_HERO_QUERY,
} from '../components/ui/hero/hero-frames';

const TAG = 'weddings_main';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isMobile = window.matchMedia(MOBILE_HERO_QUERY).matches;
const requested = new Set<string>();

/**
 * `<link rel=preload>` rather than `new Image()`: the browser treats it as a
 * high-priority fetch and hands the response to the hero's `<img>` when it
 * mounts. No `crossorigin`, to match the `<img>` and share the response.
 */
function preloadImages(urls: string[]) {
  for (const href of urls) {
    if (requested.has(href)) continue;
    requested.add(href);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }
}

async function supabaseRest<T>(path: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response.json() as Promise<T>;
}

/** The same three requests as `fetchPhotosByTag`, as plain REST calls. */
function prefetchGallery(): Promise<RawPhotoData | null> {
  return Promise.all([
    supabaseRest<{ photo_id: string }[]>('photo_blacklist?select=photo_id'),
    fetch(cloudinaryListUrl(TAG))
      .then((response) => (response.ok ? response.json() : { resources: [] }))
      .then((data: { resources: CloudinaryResource[] }) => data.resources)
      .catch(() => []),
    supabaseRest<unknown[]>(
      `photo_order?select=${encodeURIComponent(PHOTO_ORDER_SELECT)}` +
        `&tag=eq.${TAG}&order=position.asc`,
    ),
  ])
    .then(([blacklist, resources, order]) => ({ blacklist, resources, order }))
    .catch(() => null);
}

try {
  const snapshot = loadHeroSnapshot();
  if (snapshot) preloadImages(heroFirstFrameUrls(snapshot, isMobile));

  if (SUPABASE_URL && SUPABASE_KEY) {
    const gallery = prefetchGallery();
    window.__photoPrefetch = { ...window.__photoPrefetch, [TAG]: gallery };

    gallery.then((raw) => {
      if (raw) preloadImages(heroFirstFrameUrls(buildPhotos(TAG, raw), isMobile));
    });
  }
} catch {
  // Never let the prefetch break the page.
}
