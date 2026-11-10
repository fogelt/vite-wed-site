import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  cloudinaryImage,
  preloadImage,
  scrollToSection,
  useImageLoaded,
} from '@/utils';

interface HeroPhoto {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mobileHero?: boolean;
}

interface HeroProps {
  photos: HeroPhoto[];
  isLoading?: boolean;
}

/** Wider than the centre strip needs, with headroom for retina screens. */
const CENTER_IMAGE_WIDTH = 1600;
const SIDE_IMAGE_WIDTH = 900;

export function Hero({ photos, isLoading }: HeroProps) {
  const [startIndex, setStartIndex] = useState(0);
  const isMobile = useIsMobile();

  // The photographer chooses the mobile hero rotation in the admin. If none
  // are marked yet, show the first photo without cycling.
  const selectedHeroPhotos = photos.filter((photo) => photo.mobileHero);
  const mobilePhotos = selectedHeroPhotos.length > 0
    ? selectedHeroPhotos
    : photos.slice(0, 1);

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

  // Desktop keeps the original still triptych: narrow left, wide centre,
  // narrow right. Only the phone version cycles.
  const desktopLeft = photos.length >= 2 ? photos[0] : undefined;
  const desktopCenter = photos.length >= 2 ? photos[1] : photos[0];
  const desktopRight = photos.length >= 3 ? photos[2] : undefined;

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
      preloadImage(cloudinaryImage(photo.url, { width: CENTER_IMAGE_WIDTH }));
    }
  }, [isMobile, nextMobilePhoto?.url, secondNextMobilePhoto?.url]);

  const left = isMobile ? undefined : desktopLeft;
  const center = isMobile ? mobilePhotos[mobileIndex] : desktopCenter;
  const right = isMobile ? undefined : desktopRight;
  const hasPhotos = !isLoading && Boolean(center?.url);
  const [centerVisible, setCenterVisible] = useState(false);
  const handleCenterVisible = useCallback(() => setCenterVisible(true), []);

  return (
    <section className="relative flex h-[calc(100svh-4rem)] min-h-[480px] w-full items-center justify-center overflow-hidden bg-white md:h-[78vh] md:max-h-[820px] md:min-h-[520px]">
      {/* Dim skeletons match the final triptych, so nothing shifts when photos arrive. */}
      {!hasPhotos && (
        <div className="absolute inset-0 flex gap-2" aria-hidden="true">
          <div className="hidden h-full w-[22%] animate-pulse bg-neutral-100 md:block" />
          <div className="h-full min-w-0 flex-1 animate-pulse bg-neutral-100" />
          <div className="hidden h-full w-[22%] animate-pulse bg-neutral-100 md:block" />
        </div>
      )}

      {hasPhotos && (
        /* The triptych */
        <div className="absolute inset-0" aria-hidden="true">
          <div className="flex h-full w-full gap-2">
            <HeroStrip
              photo={left}
              width={SIDE_IMAGE_WIDTH}
              zoom={isMobile}
              className="hidden h-full w-[22%] md:block"
            />
            <HeroStrip
              photo={center}
              width={CENTER_IMAGE_WIDTH}
              priority
              zoom={isMobile}
              onVisible={handleCenterVisible}
              className="h-full min-w-0 flex-1"
            />
            <HeroStrip
              photo={right}
              width={SIDE_IMAGE_WIDTH}
              zoom={isMobile}
              className="hidden h-full w-[22%] md:block"
            />
          </div>
        </div>
      )}

      {/* Soft scrim so the white type stays legible over the photo.
          It fades in only once the centre photo (or its blur) is visible, so it
          never darkens the loading skeleton. */}
      <div
        className={`pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(58%_52%_at_50%_50%,rgba(0,0,0,0.26),transparent_76%)] transition-opacity duration-700 ${centerVisible ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="mb-7 text-[11px] uppercase tracking-[0.5em] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_2px_18px_rgba(0,0,0,0.6)]">
          Bröllopsfotograf · Skåne
        </span>

        <h1 className="text-3xl font-light uppercase leading-tight tracking-[0.2em] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.55),0_4px_32px_rgba(0,0,0,0.65)] sm:text-4xl sm:tracking-[0.25em] md:text-5xl">
          <span className="sr-only">Bröllopsfotograf i Skåne — </span>
          Myelie Lendelund
        </h1>

        <span className="my-7 h-px w-16 bg-white/40" aria-hidden="true" />

        <p className="mb-11 max-w-xl text-sm font-light italic leading-relaxed text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.65),0_2px_20px_rgba(0,0,0,0.6)] md:text-base">
          Äkta ögonblick, varsamt bevarade
        </p>

        <button
          onClick={() => scrollToSection('utvalda-bilder')}
          className="w-full bg-white px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition-colors duration-300 hover:bg-white/90 sm:w-auto"
        >
          Se galleriet
        </button>
      </div>

      <button
        onClick={() => scrollToSection('valkommen')}
        aria-label="Scrolla vidare"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/65 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-colors duration-300 hover:text-white motion-safe:animate-bounce"
      >
        <ChevronDown size={22} strokeWidth={1.25} />
      </button>
    </section>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function HeroStrip({
  photo,
  width,
  priority = false,
  zoom = false,
  onVisible,
  className = '',
}: {
  photo?: HeroPhoto;
  width: number;
  /** Load immediately. Side strips stay lazy so they are not fetched on mobile. */
  priority?: boolean;
  /** Slow Ken Burns zoom. Only enabled for the mobile hero. */
  zoom?: boolean;
  /** Called once the blurred preview or the full photo is visible. */
  onVisible?: () => void;
  className?: string;
}) {
  const src = photo?.url ? cloudinaryImage(photo.url, { width }) : '';
  const placeholder = photo?.url ? cloudinaryImage(photo.url, { blur: true }) : '';
  const preview = useImageLoaded(placeholder);
  const image = useImageLoaded(src);
  const previousSrcRef = useRef(src);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [fadePrevious, setFadePrevious] = useState(false);
  const visible = preview.loaded || image.loaded || Boolean(previousSrc);

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
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {/* Very dim skeleton in the card's shape, replaced by the blur and then the photo. */}
      {!previousSrc && (
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
          {!previousSrc && (
            <img
              ref={preview.ref}
              src={placeholder}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              onLoad={preview.onLoad}
              onError={preview.onError}
              className={`pointer-events-none absolute inset-0 z-0 h-full w-full scale-105 object-cover object-[center_35%] transition-opacity duration-700 ease-out ${preview.loaded ? 'opacity-100' : 'opacity-0'
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
            className={`absolute inset-0 z-10 h-full w-full object-cover object-[center_35%] transition-[opacity,transform] duration-1000 ease-out ${
              previousSrc
                ? 'scale-100 opacity-100'
                : image.loaded
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
              className={`pointer-events-none absolute inset-0 z-20 h-full w-full object-cover object-[center_35%] transition-opacity [transition-duration:1800ms] ease-in-out [will-change:opacity] ${
                fadePrevious ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
