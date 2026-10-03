import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="w-full border-b border-stone-200 bg-white sticky top-0 z-[60] overflow-x-hidden">
      <header className="flex items-center justify-center px-4 md:px-8 py-6 md:py-10 w-full max-w-7xl mx-auto">
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-[10px] sm:text-xs md:text-base font-light tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Fotograf <span className="font-medium">Myelie Lendelund</span>
          </h1>
        </Link>
      </header>
    </div>
  );
}
