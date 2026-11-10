import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { scrollToSection } from '@/utils';
import { Reveal } from '../reveal';

const DEFAULT_EYEBROW = 'Så funkar det';

export interface HowItWorksStep {
  title: string;
  text: string;
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    title: 'Hör av er',
    text: 'Berätta om datum, plats och vad ni drömmer om. Vi börjar med ett samtal där ni får ställa alla frågor.',
  },
  {
    title: 'Vi planerar tillsammans',
    text: 'Vi går igenom tider, platser och vilka ögonblick som är viktigast för er. Inga detaljer är för små.',
  },
  {
    title: 'Bröllopsdagen',
    text: 'Jag fotograferar närvarande och lugnt, med plats för både det stora och det lilla som händer runtomkring.',
  },
  {
    title: 'Bilderna',
    text: 'Ett genomtänkt urval av redigerade bilder levereras digitalt, redo att sparas och återvända till i många år.',
  },
];

export function HowItWorksPanel({
  eyebrow = DEFAULT_EYEBROW,
  steps,
  className = '',
}: {
  eyebrow?: string;
  steps?: HowItWorksStep[];
  className?: string;
}) {
  const visibleSteps = steps && steps.length > 0 ? steps : DEFAULT_STEPS;
  const stepCount = visibleSteps.length;
  const panelRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [reachedCount, setReachedCount] = useState(1);

  useEffect(() => {
    const panel = panelRef.current;
    const fill = fillRef.current;
    if (!panel || !fill) return;

    let frame = 0;

    const measure = () => {
      frame = 0;

      const rect = panel.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = viewport * 0.85;
      // Finish while the bottom of the panel is still comfortably on screen.
      const end = viewport * 0.55;
      const distance = rect.height + (start - end);
      const progress = distance > 0
        ? Math.min(1, Math.max(0, (start - rect.top) / distance))
        : 0;

      // Update the line directly so it never trails the scroll position.
      fill.style.transform = `scaleY(${progress})`;

      let nextCount = 1;
      for (let index = 1; index < stepCount; index++) {
        if (progress >= index / (stepCount - 1) - 0.05) {
          nextCount = index + 1;
        }
      }

      setReachedCount((previous) =>
        previous === nextCount ? previous : nextCount
      );
    };

    const requestMeasure = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    requestMeasure();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);

    const observer = new ResizeObserver(requestMeasure);
    observer.observe(panel);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      observer.disconnect();
    };
  }, [stepCount]);

  return (
    <div
      id="sa-funkar-det"
      ref={panelRef}
      className={`scroll-mt-24 md:scroll-mt-28 ${className}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-[0.35em] text-stone-400">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-stone-200" aria-hidden="true" />
      </div>

      <div className="relative mt-8">
        <div
          className="absolute bottom-1 left-[6px] top-1 w-px bg-stone-200"
          aria-hidden="true"
        >
          <div
            ref={fillRef}
            className="h-full w-full origin-top bg-stone-900"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>

        <ol className="space-y-8">
          {visibleSteps.map((step, index) => {
            const isReached = index < reachedCount;
            const isActive = isReached;

            return (
              <li key={`${index}-${step.title}`} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 flex h-3 w-3 items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className={`absolute inset-0 rotate-45 border transition-colors duration-200 ${
                      isReached
                        ? 'border-stone-900 bg-stone-900'
                        : 'border-stone-300 bg-white'
                    }`}
                  />
                  {isReached && (
                    <Check
                      size={7}
                      strokeWidth={3}
                      className="relative text-white"
                    />
                  )}
                </span>

                <span
                  className={`text-[9px] uppercase tracking-[0.3em] transition-colors duration-200 ${
                    isActive ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3
                  className={`mt-1 text-base font-light leading-snug transition-colors duration-200 ${
                    isActive ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {step.title}
                </h3>

                <p
                  className={`mt-2 text-sm font-light leading-relaxed transition-colors duration-200 ${
                    isActive ? 'text-stone-600' : 'text-stone-400'
                  }`}
                >
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <Reveal delay={240}>
        <button
          type="button"
          onClick={() => scrollToSection('kontakt')}
          className="group mt-9 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-stone-900"
        >
          <span className="border-b border-stone-300 pb-1 transition-colors duration-300 group-hover:border-black">
            Boka ett samtal
          </span>
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </Reveal>
    </div>
  );
}
