import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: "Galleri", target: "galleri" },
  { label: "Välkommen", target: "valkommen" },
  { label: "Om mig", target: "om-mig" },
  { label: "Bröllopspaket", target: "priser" },
  { label: "Förlovning", target: "forlovning" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    // Wait for the menu close so the scroll position is calculated correctly
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="w-full border-b border-stone-200 bg-white sticky top-0 z-[60] overflow-x-hidden">
      <header className="flex items-center justify-between px-4 md:px-8 py-6 md:py-8 w-full max-w-7xl mx-auto">

        <div className="z-[70] flex-shrink-0">
          <h1 className="text-[10px] sm:text-xs md:text-base font-light tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Fotograf <span className="font-medium">Myelie Lendelund</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="md:hidden z-[70] p-2 flex-shrink-0 -mr-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Meny"
        >
          {isOpen ? <X size={20} className="text-stone-600" /> : <Menu size={20} className="text-stone-600" />}
        </button>

        <div className={`
          fixed inset-0 bg-white z-[65] flex flex-col items-center justify-center transition-all duration-300 ease-in-out md:hidden
          ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}
        `}>
          <nav className="flex flex-col items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="text-lg tracking-[0.2em] uppercase font-light text-stone-600 hover:text-black transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
}
