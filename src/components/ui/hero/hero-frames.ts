/**
 * Which photos the hero shows and at what size.
 *
 * Shared by the Hero component and the inline home prefetch script
 * (`src/prefetch/home-prefetch.ts`), which preloads the exact same URLs before
 * the app bundle has loaded. Keep this file free of React and of `@/` imports
 * so the prefetch script can bundle it on its own.
 */
import {
  cloudinaryImage,
  HERO_PHONE_SIZE,
  HERO_STANDING_WIDTH,
} from '../../../utils/cloudinary';

export interface HeroPhoto {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mobileHero?: boolean;
}

export const MOBILE_HERO_QUERY = '(max-width: 767px)';

/*
 * Sizes come from `cloudinary.ts` (HERO_PHONE_SIZE, HERO_STANDING_WIDTH), so
 * the main site's admin and warm script pre-create exactly these URLs. The
 * phone frame is capped at 1600 on the long side: a portrait comes out
 * 1067x1600, sharp at 2x on a phone-height frame and under half the pixels of
 * the 1600x2400 a plain 1600 width gave.
 */

/** The phone rotation, chosen by the photographer in the admin. */
export function mobileHeroPhotos<T extends HeroPhoto>(photos: T[]) {
  // If none are marked yet, show the first photo without cycling.
  const selected = photos.filter((photo) => photo.mobileHero);
  return selected.length > 0 ? selected : photos.slice(0, 1);
}

/** Desktop shows three standing frames side by side; only phones cycle. */
export function desktopHeroPhotos<T extends HeroPhoto>(photos: T[]) {
  return {
    left: photos.length >= 2 ? photos[0] : undefined,
    center: photos.length >= 2 ? photos[1] : photos[0],
    right: photos.length >= 3 ? photos[2] : undefined,
  };
}

export function heroImageSrc(url: string, isMobile: boolean) {
  return cloudinaryImage(
    url,
    isMobile ? HERO_PHONE_SIZE : { width: HERO_STANDING_WIDTH },
  );
}

/** The image URLs on screen the moment the hero appears, centre first. */
export function heroFirstFrameUrls(photos: HeroPhoto[], isMobile: boolean) {
  const frames = isMobile
    ? [mobileHeroPhotos(photos)[0]]
    : (({ left, center, right }) => [center, left, right])(desktopHeroPhotos(photos));

  return frames
    .filter((photo): photo is HeroPhoto => Boolean(photo?.url))
    .map((photo) => heroImageSrc(photo.url, isMobile));
}

// --- Snapshot ---------------------------------------------------------------
//
// The hero photos from the last visit, so a returning visitor's hero renders
// (and its images are requested) before the gallery data has arrived.

const SNAPSHOT_KEY = 'hero-snapshot-v1';

/**
 * Everything the hero needs and nothing more: the three desktop frames plus the
 * phone rotation, in gallery order so both pickers above give the same result.
 */
export function saveHeroSnapshot(photos: HeroPhoto[]) {
  const picked = [
    ...photos.slice(0, 3),
    ...photos.slice(3).filter((photo) => photo.mobileHero),
  ].map(({ id, url, alt, width, height, mobileHero }) => ({
    id, url, alt, width, height, mobileHero,
  }));

  try {
    const value = JSON.stringify(picked);
    if (localStorage.getItem(SNAPSHOT_KEY) !== value) {
      localStorage.setItem(SNAPSHOT_KEY, value);
    }
  } catch {
    // Storage full or blocked (private mode): the hero just loads normally.
  }
}

export function loadHeroSnapshot(): HeroPhoto[] | null {
  try {
    const value = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) ?? 'null');
    return Array.isArray(value) && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}
