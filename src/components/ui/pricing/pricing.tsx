import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services';
import { Reveal } from '../reveal';
import { SectionHeading } from '../section-heading';

interface WeddingPackage {
  id: string;
  name: string;
  time: string;
  includes: string;
  images: string;
  price: string;
  highlight: boolean;
}

const CONTACT_EMAIL = 'myelie@live.se';

export function PricingSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: packages, isLoading } = useQuery({
    queryKey: ['wedding_packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wedding_packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as WeddingPackage[];
    },
  });

  const total = packages?.length ?? 0;

  /** Which card is closest to the centre of the viewport? */
  const syncActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !packages?.length) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const centre = scrollerRect.left + scrollerRect.width / 2;

    let best = 0;
    let bestDistance = Infinity;

    packages.forEach((pkg, index) => {
      const card = cardRefs.current[pkg.id];
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - centre);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });

    setActiveIndex(best);
  }, [packages]);

  // On phones the cards are a horizontal carousel. Open on the highlighted
  // package (Silver) so it is centred and visible without swiping.
  useEffect(() => {
    if (!packages?.length) return;

    const scroller = scrollerRef.current;
    const target =
      packages.find((pkg) => pkg.name.toLowerCase().includes('silver')) ?? packages[0];
    const card = target ? cardRefs.current[target.id] : null;
    if (!scroller || !card) return;

    const center = () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const offset =
        cardRect.left + cardRect.width / 2 - (scrollerRect.left + scrollerRect.width / 2);
      scroller.scrollLeft += offset;
      syncActiveIndex();
    };

    // Wait one frame so the reveal wrappers have their final layout.
    const frame = window.requestAnimationFrame(center);
    return () => window.cancelAnimationFrame(frame);
  }, [packages, syncActiveIndex]);

  // Keep the little node indicator in step with the swipe.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncActiveIndex();
      });
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [syncActiveIndex]);

  return (
    <section id="priser" className="scroll-mt-24 py-12 md:scroll-mt-28 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Bröllopspaket"
            title="En investering för livet"
          />
        </Reveal>

        <div className="mt-8 flex items-center justify-center gap-3 text-stone-400 md:hidden">
          <ChevronLeft size={14} strokeWidth={1.5} className="motion-safe:animate-[swipe-hint-left_1.6s_ease-in-out_infinite]" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Svep för att se alla paket</span>
          <ChevronRight size={14} strokeWidth={1.5} className="motion-safe:animate-[swipe-hint_1.6s_ease-in-out_infinite]" aria-hidden="true" />
        </div>

        {/* Minimal node indicator under the hint */}
        <div className="mt-3 flex justify-center md:hidden" aria-hidden="true">
          <div className="relative h-[2px] w-28 bg-stone-200">
            {packages?.map((pkg, index) => (
              <span
                key={pkg.id}
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300 bg-white"
                style={{
                  left: total > 1 ? `${(index / (total - 1)) * 100}%` : '50%',
                }}
              />
            ))}

            {/* Filled dot that glides to the active node */}
            <span
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 transition-[left] duration-300 ease-out"
              style={{
                left: total > 1 ? `${(activeIndex / (total - 1)) * 100}%` : '50%',
              }}
            />
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-6 mt-4 flex snap-x snap-mandatory scroll-px-[7.5%] items-stretch gap-4 overflow-x-auto px-[7.5%] pb-4 md:mx-0 md:mt-14 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0"
        >
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] w-[85%] shrink-0 snap-center animate-pulse bg-neutral-100 md:w-auto"
                />
              ))
            : packages?.map((pkg, index) => (
                <Reveal
                  key={pkg.id}
                  delay={index * 120}
                  className="w-[85%] shrink-0 snap-center md:w-auto"
                >
                  <article
                    ref={(node) => {
                      cardRefs.current[pkg.id] = node;
                    }}
                    className={`relative flex h-full flex-col border border-stone-200 p-8 transition-all duration-700 ${
                      pkg.highlight
                        ? 'z-10 bg-stone-50/50 shadow-sm ring-1 ring-stone-200 md:scale-105'
                        : 'bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {pkg.highlight && (
                      <span className="absolute right-8 top-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 md:right-10 md:top-10">
                        Populärast
                      </span>
                    )}

                    <h3 className="text-base font-light uppercase tracking-[0.2em] text-stone-800">{pkg.name}</h3>

                    <div className="mt-8 flex-1 space-y-6 text-xs leading-relaxed text-stone-600">
                      <PackageDetail label="Tid" value={pkg.time} />
                      <PackageDetail label="Ingår" value={pkg.includes} />
                      <PackageDetail label="Leverans" value={pkg.images} />
                    </div>

                    <div className="mt-10 border-t border-stone-300 pt-6">
                      <p className="text-lg font-light tracking-tight text-stone-900">{pkg.price}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                        inkl. moms
                      </p>

                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                          `Förfrågan om bröllopspaket — ${pkg.name}`
                        )}`}
                        className="mt-7 inline-flex w-full items-center justify-center border border-stone-300 py-3.5 text-[10px] uppercase tracking-[0.3em] text-stone-800 transition-colors duration-300 hover:border-stone-500 hover:bg-stone-50"
                      >
                        Boka paketet
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}

        </div>

        {/* Inbjudan till helt skräddarsytt */}
        <Reveal delay={360} className="mt-6 md:mt-8">
          <div className="flex h-full flex-col items-center justify-center border border-stone-200 bg-white p-8 text-center shadow-sm md:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Helt skräddarsytt
            </p>
            <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
              Drömmer ni om något utöver paketen — fler timmar, flera dagar eller ett upplägg
              helt i er stil? Berätta vad ni ser framför er, så bygger vi paketet tillsammans
              från grunden.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Förfrågan om skräddarsytt paket')}`}
              className="mt-7 inline-flex items-center justify-center border border-stone-300 px-10 py-3.5 text-[10px] uppercase tracking-[0.3em] text-stone-800 transition-colors duration-300 hover:border-stone-500 hover:bg-stone-50"
            >
              Berätta om era planer
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PackageDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="whitespace-pre-line leading-relaxed">{value}</p>
    </div>
  );
}
