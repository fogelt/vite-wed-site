import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Check,
  Circle,
  Clock,
  FileText,
  Flower2,
  Gem,
  HeartHandshake,
  Images,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { scrollToSection } from '@/utils';
import { Reveal } from '../reveal';

const DEFAULT_EYEBROW = 'Så funkar det';

export interface HowItWorksStep {
  title: string;
  text: string;
  icon?: string;
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    title: 'Hör av er',
    text: 'Datum, plats och önskemål.',
    icon: 'messages',
  },
  {
    title: 'Överenskommelse',
    text: 'Avtal och datum bokas.',
    icon: 'file',
  },
  {
    title: 'Bröllopsdagen',
    text: 'Jag fotograferar er dag.',
    icon: 'camera',
  },
  {
    title: 'Bilderna',
    text: 'Redigerade bilder levereras digitalt.',
    icon: 'images',
  },
];

const PROCESS_ICONS: Record<string, LucideIcon> = {
  messages: MessagesSquare,
  calendar: CalendarCheck,
  camera: Camera,
  images: Images,
  heart: HeartHandshake,
  gem: Gem,
  users: Users,
  file: FileText,
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  clock: Clock,
  sparkles: Sparkles,
  flower: Flower2,
};

const FALLBACK_ICONS: LucideIcon[] = [
  MessagesSquare,
  CalendarCheck,
  Camera,
  Images,
  HeartHandshake,
  Sparkles,
  Check,
  Circle,
];

function getStepIcon(icon: string | undefined, index: number) {
  return (icon ? PROCESS_ICONS[icon] : undefined) ??
    FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

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
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const panel = panelRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!panel || !track || !fill) return;

    let frame = 0;

    const measure = () => {
      frame = 0;

      const viewport = window.innerHeight;
      const container = track.parentElement;
      const firstMarker = markerRefs.current[0];
      const lastMarker = markerRefs.current[stepCount - 1];
      if (!container || !firstMarker || !lastMarker) return;

      const containerRect = container.getBoundingClientRect();
      const firstRect = firstMarker.getBoundingClientRect();
      const lastRect = lastMarker.getBoundingClientRect();
      const firstCentre = firstRect.top + firstRect.height / 2 - containerRect.top;
      const lastCentre = lastRect.top + lastRect.height / 2 - containerRect.top;
      const trackHeight = Math.max(1, lastCentre - firstCentre);

      // Run the line from the first icon centre to the last so it never pokes
      // out above or below the nodes.
      track.style.top = `${firstCentre}px`;
      track.style.height = `${trackHeight}px`;

      // Let the progress edge follow the viewport. A node lights once it
      // passes 60% of the screen, so its card finishes fading in before it is
      // centred and fades out again on the way back up.
      const anchor = viewport * 0.6 - containerRect.top;
      const fillProgress = Math.min(
        1,
        Math.max(0, (anchor - firstCentre) / trackHeight)
      );

      fill.style.transform = `scaleY(${fillProgress})`;

      for (let index = 0; index < stepCount; index++) {
        const marker = markerRefs.current[index];
        if (!marker) continue;

        const markerRect = marker.getBoundingClientRect();
        const markerCentre =
          markerRect.top + markerRect.height / 2 - containerRect.top;
        const reached = markerCentre <= anchor + 0.5;
        const step = marker.closest<HTMLElement>('[data-process-step]');

        if (step) {
          step.dataset.reached = reached ? 'true' : 'false';
        }
      }
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
          ref={trackRef}
          className="absolute left-[15px] w-px bg-stone-200"
          aria-hidden="true"
        >
          <div
            ref={fillRef}
            className="h-full w-full origin-top bg-stone-900"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>

        <ol className="space-y-5">
          {visibleSteps.map((step, index) => {
            const Icon = getStepIcon(step.icon, index);

            return (
              <li
                key={`${index}-${step.title}`}
                data-process-step="true"
                data-reached="false"
                className="process-step relative pl-14"
              >
                <span
                  ref={(element) => {
                    markerRefs.current[index] = element;
                  }}
                  className="process-icon absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-400"
                  aria-hidden="true"
                >
                  <Icon size={15} strokeWidth={1.5} />
                  <span className="process-check absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 opacity-0">
                    <Check size={8} strokeWidth={3} />
                  </span>
                </span>

                <div className="process-card rounded-sm bg-stone-200/40 p-4">
                  <span className="process-number text-[9px] uppercase tracking-[0.3em] text-stone-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h3 className="process-title mt-1 text-base font-light leading-snug text-stone-400">
                    {step.title}
                  </h3>

                  <p className="process-text mt-2 text-sm font-light leading-relaxed text-stone-400">
                    {step.text}
                  </p>
                </div>
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
