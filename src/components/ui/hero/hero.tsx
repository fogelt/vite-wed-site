import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  cloudinaryImage,
  isSiteCurtainVisible,
  markSiteMounted,
  preloadImage,
  revealSiteCurtain,
  scrollToSection,
  useImageLoaded,
  waitForImages,
} from '@/utils';
import {
  desktopHeroPhotos,
  heroFirstFrameUrls,
  heroImageSrc,
  loadHeroSnapshot,
  MOBILE_HERO_QUERY,
  mobileHeroPhotos,
  saveHeroSnapshot,
  type HeroPhoto,
} from './hero-frames';

interface HeroProps {
  photos: HeroPhoto[];
  isLoading?: boolean;
}

/** Fallback portrait ratio when a photo has no stored dimensions. */
const FALLBACK_ASPECT = 2 / 3;

function photoAspect(photo?: HeroPhoto) {
  if (!photo?.width || !photo?.height) return FALLBACK_ASPECT;
  return photo.width / photo.height;
}

export function Hero({ photos: loadedPhotos, isLoading: isDataLoading }: HeroProps) {
  const [startIndex, setStartIndex] = useState(0);
  const isMobile = useIsMobile();

  // While the gallery data loads, a returning visitor sees the hero from their
  // last visit (its images were already requested by the inline prefetch
  // script) instead of a skeleton. The fresh list takes over once it is in.
  const [snapshot] = useState(loadHeroSnapshot);
  const showSnapshot = Boolean(isDataLoading && snapshot);
  const photos = showSnapshot && snapshot ? snapshot : loadedPhotos;
  const isLoading = isDataLoading && !showSnapshot;

  useEffect(() => {
    if (!isDataLoading && loadedPhotos.length > 0) saveHeroSnapshot(loadedPhotos);
  }, [isDataLoading, loadedPhotos]);

  // The photographer chooses the mobile hero rotation in the admin.
  const mobilePhotos = mobileHeroPhotos(photos);

  useEffect(() => {
    if (!isMobile || isLoading || mobilePhotos.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setStartIndex((index) => (index + 1) % mobilePhotos.length);
      }
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isMobile, isLoading, mobilePhotos.length]);

  // Desktop shows three standing frames side by side, in the order we always
  // had. Only the phone version cycles.
  const {
    left: desktopLeft,
    center: desktopCenter,
    right: desktopRight,
  } = desktopHeroPhotos(photos);

  // Each desktop frame follows its own photo's aspect ratio. The row is sized
  // so the three frames share one height and always fit, which means nothing
  // has to be cropped and no white bands appear inside the frames.
  const desktopAspectSum = [desktopLeft, desktopCenter, desktopRight]
    .filter((photo): photo is HeroPhoto => Boolean(photo?.url))
    .map(photoAspect)
    .reduce((sum, ratio) => sum + ratio, 0) || FALLBACK_ASPECT;

  const mobileIndex = mobilePhotos.length > 0
    ? startIndex % mobilePhotos.length
    : 0;

  const nextMobilePhoto = mobilePhotos.length > 1
    ? mobilePhotos[(mobileIndex + 1) % mobilePhotos.length]
    : undefined;
  const secondNextMobilePhoto = mobilePhotos.length > 2
    ? mobilePhotos[(mobileIndex + 2) % mobilePhotos.length]
    : undefined;

  // Warm the upcoming full-size hero frames so a cross-fade never exposes a
  // loading state when the rotation advances.
  useEffect(() => {
    if (!isMobile) return;

    for (const photo of [nextMobilePhoto, secondNextMobilePhoto]) {
      if (!photo?.url) continue;
      preloadImage(heroImageSrc(photo.url, true));
    }
  }, [isMobile, nextMobilePhoto?.url, secondNextMobilePhoto?.url]);

  const left = isMobile ? undefined : desktopLeft;
  const center = isMobile ? mobilePhotos[mobileIndex] : desktopCenter;
  const right = isMobile ? undefined : desktopRight;
  const hasPhotos = !isLoading && Boolean(center?.url);

  // The white curtain from index.html stays up until the frames that will be on
  // screen are fully loaded, then waves away from the top-left corner. Waiting
  // for the whole viewport means the page is never revealed half-empty, while
  // the curtain hides the wait (and adds its spinner only if it takes a while).
  const firstFrameKey = isLoading ? '' : heroFirstFrameUrls(photos, isMobile).join('\n');

  useEffect(() => {
    // From here on the curtain may give up on a photo that never finishes.
    markSiteMounted();
    if (isLoading) return;

    // Nothing to wait for (an empty gallery): show the page right away.
    const srcs = firstFrameKey ? firstFrameKey.split('\n') : [];
    if (srcs.length === 0) {
      revealSiteCurtain();
      return;
    }

    let cancelled = false;
    void waitForImages(srcs).then(() => {
      if (!cancelled) revealSiteCurtain();
    });

    return () => {
      cancelled = true;
    };
  }, [isLoading, firstFrameKey]);

  return (
    // The hero fills the viewport below the sticky header: 4rem on phones and
    // 6.5rem on desktop, where the header is taller (py-10 + logo line).
    <section className="relative flex h-[calc(100svh-4rem)] min-h-[480px] w-full items-center justify-center overflow-hidden bg-white [container-type:size] md:h-[calc(100svh-6.5rem)] md:min-h-[560px]">
      {/* The frames sit inside a thin white frame: full bleed on phones, 94%
          of the viewport height and a white bar down each side on desktop. The
          row shrinks to the largest block that fits, with each frame keeping
          its photo's own ratio, so nothing is cut. */}
      <div
        className="relative flex h-full w-full items-center justify-center gap-2 md:h-[min(94cqh,calc((100cqw_-_3rem)/var(--hero-ratios)))] md:w-[min(calc(100cqw_-_2rem),calc(94cqh*var(--hero-ratios)_+_1rem))]"
        style={{ '--hero-ratios': desktopAspectSum } as CSSProperties}
      >
        {/* Skeletons mirror the three standing columns so the layout never jumps on load. */}
        {!hasPhotos && (
          <div className="absolute inset-0 flex items-center justify-center gap-2" aria-hidden="true">
            <div className="hidden h-full animate-pulse bg-neutral-100 md:block md:w-auto md:aspect-[2/3]" />
            <div className="h-full w-full animate-pulse bg-neutral-100 md:w-auto md:aspect-[2/3]" />
            <div className="hidden h-full animate-pulse bg-neutral-100 md:block md:w-auto md:aspect-[2/3]" />
          </div>
        )}

        {hasPhotos && (
          /* Three standing frames, one shared height, each at its photo's ratio */
          <div className="absolute inset-0 flex items-center justify-center gap-2" aria-hidden="true">
            <HeroStrip
              photo={left}
              isMobile={isMobile}
              priority={!isMobile}
              zoom={isMobile}
              fit={isMobile ? 'cover' : 'contain'}
              className="hidden h-full md:block"
              style={{ aspectRatio: photoAspect(desktopLeft) }}
            />
            <HeroStrip
              photo={center}
              isMobile={isMobile}
              priority
              zoom={isMobile}
              fit={isMobile ? 'cover' : 'contain'}
              className="h-full w-full md:w-auto"
              style={{ aspectRatio: photoAspect(desktopCenter) }}
            />
            <HeroStrip
              photo={right}
              isMobile={isMobile}
              priority={!isMobile}
              zoom={isMobile}
              fit={isMobile ? 'cover' : 'contain'}
              className="hidden h-full md:block"
              style={{ aspectRatio: photoAspect(desktopRight) }}
            />
          </div>
        )}

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-between px-6 pt-6 pb-12 text-center md:pt-8 md:pb-16">
          <div className="flex flex-col items-center">
            <h1 className="mb-2.5 text-3xl font-light uppercase leading-tight tracking-[0.2em] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.55),0_4px_32px_rgba(0,0,0,0.65)] sm:text-4xl sm:tracking-[0.25em] md:mb-3 md:text-5xl">
              <span className="sr-only">Bröllopsfotograf Skåne — </span>
              <span className="block">Myelie</span>
              <span className="block">Lendelund</span>
            </h1>

            <span className="mb-2 h-px w-16 bg-white/40 md:mb-2.5" aria-hidden="true" />

            <span className="text-[11px] uppercase tracking-[0.35em] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_2px_18px_rgba(0,0,0,0.6)] sm:tracking-[0.5em]">
              Bröllopsfotograf · Skåne
            </span>
          </div>

          <div className="flex flex-col items-center gap-5 md:gap-6">
            <p className="max-w-xl text-sm font-light italic leading-relaxed text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_2px_20px_rgba(0,0,0,0.6)] md:text-base">
              Äkta ögonblick, varsamt bevarade
            </p>

            <button
              onClick={() => scrollToSection('utvalda-bilder')}
              className="pointer-events-auto w-full bg-white px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition-colors duration-300 hover:bg-white/90 sm:w-auto"
            >
              Se bilder
            </button>
          </div>
        </div>

        <button
          onClick={() => scrollToSection('valkommen')}
          aria-label="Scrolla vidare"
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/65 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-colors duration-300 hover:text-white motion-safe:animate-bounce"
        >
          <ChevronDown size={22} strokeWidth={1.25} />
        </button>
      </div>
    </section>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_HERO_QUERY).matches
      : false,
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_HERO_QUERY);
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function HeroStrip({
  photo,
  isMobile,
  priority = false,
  zoom = false,
  fit = 'cover',
  onVisible,
  className = '',
  style,
}: {
  photo?: HeroPhoto;
  /** Picks the full-bleed phone size or the standing desktop size. */
  isMobile: boolean;
  /** Load immediately. Side strips only load eagerly on desktop, never on phones. */
  priority?: boolean;
  /** Slow Ken Burns zoom. Only enabled for the mobile hero. */
  zoom?: boolean;
  /** Crop to fill the frame, or show the whole photo with white space around it. */
  fit?: 'cover' | 'contain';
  /** Called once the blurred preview or the full photo is visible. */
  onVisible?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const src = photo?.url ? heroImageSrc(photo.url, isMobile) : '';
  const placeholder = photo?.url ? cloudinaryImage(photo.url, { blur: true }) : '';
  const preview = useImageLoaded(placeholder);
  const image = useImageLoaded(src);
  const previousSrcRef = useRef(src);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [fadePrevious, setFadePrevious] = useState(false);

  /**
   * The photo was already downloaded when the hero mounted (preloaded by the
   * inline prefetch script, or cached from a previous visit). Show it as is:
   * the skeleton, blur and fade-in exist to cover a wait that did not happen.
   * Runs before the first paint, so not even one empty frame is shown.
   */
  const [instant, setInstant] = useState(false);
  useLayoutEffect(() => {
    const img = image.ref.current;
    if (img?.complete && img.naturalWidth > 0) setInstant(true);
    // Only the first frame can be instant; later rotations cross-fade.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * On the first load the white curtain covers the page, so the photos do not
   * need a fade of their own: they can pop in behind it and the curtain's wave
   * becomes the only entrance. Rotations after the reveal still cross-fade.
   */
  const [behindCurtain] = useState(isSiteCurtainVisible);

  const shown = instant || image.loaded;
  const noFirstFade = instant || behindCurtain;
  const visible = preview.loaded || shown || Boolean(previousSrc);
  const fitClass = fit === 'contain'
    ? 'object-contain object-center'
    : 'object-cover object-[center_35%]';

  useLayoutEffect(() => {
    if (previousSrcRef.current === src) return;

    setPreviousSrc(previousSrcRef.current);
    setFadePrevious(false);
    previousSrcRef.current = src;
  }, [src]);

  useEffect(() => {
    if (!previousSrc) return;

    if (image.loaded) {
      // Wait one painted frame so the old frame is definitely visible before
      // the fade starts, even when the new image comes straight from cache.
      const frame = window.requestAnimationFrame(() => setFadePrevious(true));
      return () => window.cancelAnimationFrame(frame);
    }

    // Safety net if decoding is unusually slow: still reveal the new frame.
    const fallback = window.setTimeout(() => setFadePrevious(true), 1200);
    return () => window.clearTimeout(fallback);
  }, [previousSrc, image.loaded]);

  useEffect(() => {
    if (!previousSrc || !fadePrevious) return;

    const timer = window.setTimeout(() => {
      setPreviousSrc(null);
      setFadePrevious(false);
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [previousSrc, fadePrevious]);

  useEffect(() => {
    if (visible) onVisible?.();
  }, [visible, onVisible]);

  if (!photo?.url) return null;

  return (
    <div className={`relative overflow-hidden bg-white ${className}`} style={style}>
      {/* Very dim skeleton in the card's shape, replaced by the blur and then the photo. */}
      {!previousSrc && !instant && (
        <div
          className={`absolute inset-0 bg-neutral-100 transition-opacity duration-700 ${visible ? 'opacity-0' : 'animate-pulse'
            }`}
          aria-hidden="true"
        />
      )}

      <div
        className={`absolute inset-0 origin-[center_35%] ${
          zoom
            ? 'motion-safe:animate-[hero-zoom_3s_ease-out_forwards]'
            : ''
        }`}
      >
        <div
          className={`absolute inset-0 ${
            zoom
              ? 'motion-safe:animate-[hero-pan_20s_ease-in-out_3s_infinite]'
              : ''
          }`}
        >
          {/* The 1 KB blurred Cloudinary preview appears first and blends into the photo. */}
          {!previousSrc && !instant && (
            <img
              ref={preview.ref}
              src={placeholder}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              onLoad={preview.onLoad}
              onError={preview.onError}
              className={`pointer-events-none absolute inset-0 z-0 h-full w-full scale-105 transition-opacity duration-700 ease-out ${fitClass} ${preview.loaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
          )}

          {/* The incoming frame sits underneath, fully opaque, ready to be revealed. */}
          <img
            key={src}
            ref={image.ref}
            src={src}
            alt={photo.alt || 'Bröllopsfotograf Myelie Lendelund'}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={image.onLoad}
            onError={image.onError}
            className={`absolute inset-0 z-10 h-full w-full ${fitClass} ${noFirstFade ? '' : 'transition-[opacity,transform] duration-1000 ease-out'} ${
              previousSrc
                ? 'scale-100 opacity-100'
                : shown
                  ? 'scale-100 opacity-100'
                  : 'scale-[1.04] opacity-0'
            }`}
          />

          {/* The old frame sits on top and fades out once the new one is ready. */}
          {previousSrc && (
            <img
              src={previousSrc}
              alt=""
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-20 h-full w-full ${fitClass} transition-opacity [transition-duration:1800ms] ease-in-out [will-change:opacity] ${
                fadePrevious ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
