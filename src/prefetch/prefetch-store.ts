import type { RawPhotoData } from '../services/photo-builder';

declare global {
  interface Window {
    /** Gallery data requested by the inline home prefetch script, by tag. */
    __photoPrefetch?: Record<string, Promise<RawPhotoData | null>>;
  }
}

/**
 * Hand over the prefetched data for `tag`, once: later fetches (refetches,
 * other tags) go to the network as usual. Resolves to null when nothing was
 * prefetched or the prefetch failed, so the caller fetches normally.
 */
export function takePrefetchedPhotos(tag: string): Promise<RawPhotoData | null> | null {
  const store = typeof window === 'undefined' ? undefined : window.__photoPrefetch;
  const pending = store?.[tag];
  if (!pending) return null;

  delete store[tag];
  return pending;
}
