import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, SECTION_IDS } from '@/config/nav';
import { scrollToSection, scrollToTop } from '@/utils';
import { useScrollProgress } from './scroll-progress';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);
  const progress = useScrollProgress();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (id: string) => {
    setIsOpen(false);
    // Let the overlay close before scrolling so positions are calculated correctly
    window.setTimeout(() => scrollToSection(id), 80);
  };

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-stone-200/80 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 md:px-8 md:py-10">
        <div className="relative">
          <button onClick={scrollToTop} className="group text-left" aria-label="Till toppen">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-stone-900 transition-colors duration-300 group-hover:text-stone-500 sm:text-xs md:text-base md:tracking-[0.3em]">
              Bröllopsfotograf <span className="font-medium">Myelie Lendelund</span>
            </span>
          </button>

          {/* Scroll progress under the logo, where the nav is hidden (phone/tablet) */}
          <div className="absolute inset-x-0 top-full mt-3 h-[2px] bg-stone-200 lg:hidden" aria-hidden="true">
            <div className="h-full bg-stone-900" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <nav className="flex items-center gap-7" aria-label="Huvudmeny">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavigate(item.target)}
                aria-current={activeSection === item.target ? 'true' : undefined}
                className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  activeSection === item.target ? 'font-semibold text-black' : 'text-gray-400 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Scroll progress, tucked just under the nav */}
          <div className="absolute inset-x-0 top-full mt-3 h-[2px] bg-stone-200" aria-hidden="true">
            <div className="h-full bg-stone-900" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <button
          className="z-[70] -mr-2 p-2 text-stone-600 lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Stäng meny' : 'Öppna meny'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[65] flex flex-col bg-white transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
        }`}
      >
        <nav
          className="flex flex-1 flex-col items-center justify-center gap-8"
          aria-label="Mobilmeny"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavigate(item.target)}
              className="text-lg font-light uppercase tracking-[0.2em] text-stone-900"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div
          className={`flex flex-col items-center gap-3 pb-14 transition-opacity duration-700 ${
            isOpen ? 'opacity-100 delay-300' : 'opacity-0'
          }`}
        >
          <a
            href="mailto:myelie@live.se"
            className="text-[11px] uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-black"
          >
            myelie@live.se
          </a>
          <a
            href="tel:+46721682019"
            className="text-[11px] uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-black"
          >
            +46 72 16 82 019
          </a>
        </div>
      </div>
    </header>
  );
}

/** Highlights the nav item for the section currently in the reading band. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let attempts = 0;
    const inBand = new Set<string>();

    // The sections live in a lazily-loaded route, so retry briefly until they exist.
    const attach = () => {
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length < ids.length && attempts < 40) {
        attempts += 1;
        window.setTimeout(attach, 150);
        return;
      }
      if (elements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) inBand.add(entry.target.id);
            else inBand.delete(entry.target.id);
          }

          const entered = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          // Light up the section being reached — and go quiet once none are in the band.
          if (entered[0]) setActive(entered[0].target.id);
          else if (inBand.size === 0) setActive(null);
        },
        { rootMargin: '-30% 0px -55% 0px' }
      );

      elements.forEach((el) => observer?.observe(el));
    };

    const timer = window.setTimeout(attach, 200);
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [ids]);

  return active;
}
