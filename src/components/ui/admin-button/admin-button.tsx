export function AdminButton() {
  return (
    <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-[70]">
      <a
        href="https://myeliefoto.se/admin"
        className="flex flex-col items-center gap-1 opacity-0 hover:opacity-100 transition-opacity duration-500 cursor-default group"
      >
        <div className="w-7 h-7 rounded-full border border-stone-100 flex items-center justify-center">
          <div className="w-1 h-1 bg-stone-200 rounded-full" />
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em] text-stone-300">
          Admin
        </p>
      </a>
    </div>
  );
}
