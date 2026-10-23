import { Instagram, Linkedin } from 'lucide-react';
import { AdminButton } from '@/components/ui';
import { NAV_ITEMS } from '@/config/nav';
import { scrollToSection } from '@/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-xs font-light uppercase tracking-[0.3em] text-stone-900">
              Bröllopsfotograf <span className="font-medium">Myelie Lendelund</span>
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-stone-500">
              Bröllopsfotograf i Skåne — äkta känslor, varsamt bevarade.
            </p>
          </div>

          {/* Navigate */}
          <nav aria-label="Sidfot" className="md:justify-self-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400">Navigera</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.target}>
                  <button
                    onClick={() => scrollToSection(item.target)}
                    className="text-sm font-light text-stone-500 transition-colors duration-300 hover:text-black"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:justify-self-end md:text-right">
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400">Kontakt</p>
            <ul className="mt-5 space-y-3 text-sm font-light text-stone-500">
              <li>
                <a
                  href="mailto:myelie@live.se"
                  className="transition-colors duration-300 hover:text-black"
                >
                  myelie@live.se
                </a>
              </li>
              <li>
                <a
                  href="tel:+46721682019"
                  className="transition-colors duration-300 hover:text-black"
                >
                  +46 72 16 82 019
                </a>
              </li>
              <li>Skåne</li>
            </ul>

            <div className="mt-4 flex gap-5 text-gray-500 md:justify-end">
              <a
                href="https://www.instagram.com/myelielendelund/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-black"
                aria-label="Instagram (öppnas i ny flik)"
              >
                <Instagram size={16} strokeWidth={1.2} aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/in/myelie-lendelund-3696b3380/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-black"
                aria-label="LinkedIn (öppnas i ny flik)"
              >
                <Linkedin size={16} strokeWidth={1.2} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-between">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400">
            © {currentYear} Myelie Lendelund
          </p>
          <AdminButton />
        </div>
      </div>
    </footer>
  );
}
