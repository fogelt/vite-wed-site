export function SectionDivider() {
  return (
    <div className="flex w-full max-w-[9rem] items-center justify-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-stone-300/80" />
      <span className="h-1.5 w-1.5 rotate-45 border border-stone-300" />
      <span className="h-px flex-1 bg-stone-300/80" />
    </div>
  );
}
