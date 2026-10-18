import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { scrollToSection } from '@/utils';

interface HeroPhoto {
  id: string;
  url: string;
  alt?: string;
}

interface HeroProps {
  photos: HeroPhoto[];
  isLoading?: boolean;
}

export function Hero({ photos, isLoading }: HeroProps) {
  // Like the original triptych: narrow left, wide center, narrow right.
  const left = photos.length >= 2 ? photos[0] : undefined;
  const center = photos.length >= 2 ? photos[1] : photos[0];
  const right = photos.length >= 3 ? photos[2] : undefined;
  const hasPhotos = !isLoading && Boolean(center?.url);

  return (
    <section className="relative flex h-[88vh] max-h-[920px] min-h-[560px] w-full items-center justify-center overflow-hidden bg-white">
      {hasPhotos ? (
        /* The triptych */
        <div className="absolute inset-0" aria-hidden="true">
          <div className="flex h-full w-full gap-2">
            <HeroStrip photo={left} className="hidden h-full w-[22%] md:block" />
            <HeroStrip photo={center} className="h-full min-w-0 flex-1" />
            <HeroStrip photo={right} className="hidden h-full w-[22%] md:block" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-stone-900" aria-hidden="true" />
      )}

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="mb-7 text-[11px] uppercase tracking-[0.5em] text-white/65">
          Bröllopsfotograf · Skåne
        </span>

        <h1 className="text-3xl font-light uppercase leading-tight tracking-[0.2em] text-white sm:text-4xl sm:tracking-[0.25em] md:text-5xl">
          Myelie Lendelund
        </h1>

        <span className="my-7 h-px w-16 bg-white/40" aria-hidden="true" />

        <p className="mb-11 max-w-xl text-sm font-light italic leading-relaxed text-white/85 md:text-base">
          Äkta ögonblick, varsamt bevarade
        </p>

        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <button
            onClick={() => scrollToSection('galleri')}
            className="w-full bg-white px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition-colors duration-300 hover:bg-white/90 sm:w-auto"
          >
            Se galleriet
          </button>
          <button
            onClick={() => scrollToSection('kontakt')}
            className="w-full border border-white/35 px-10 py-4 text-[11px] uppercase tracking-[0.28em] text-white/90 transition-colors duration-300 hover:border-white/70 hover:bg-white/10 sm:w-auto"
          >
            Berätta om era planer
          </button>
        </div>
      </div>

      <button
        onClick={() => scrollToSection('valkommen')}
        aria-label="Scrolla vidare"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/60 transition-colors duration-300 hover:text-white motion-safe:animate-bounce"
      >
        <ChevronDown size={22} strokeWidth={1.25} />
      </button>
    </section>
  );
}

function HeroStrip({ photo, className = '' }: { photo?: HeroPhoto; className?: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!photo?.url) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        key={photo.url}
        src={photo.url}
        alt={photo.alt || 'Bröllopsfotograf Myelie Lendelund'}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover object-[center_35%] transition-[opacity,transform] duration-1000 ease-out ${
          loaded ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0'
        }`}
      />
      {/* Scrim sits on each strip so the cuts between them stay crisp */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65"
        aria-hidden="true"
      />
    </div>
  );
}
