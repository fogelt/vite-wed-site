interface SectionHeadingProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  size?: 'default' | 'compact';
  className?: string;
}

/**
 * The shared eyebrow + heading combination used by every section,
 * so the whole page keeps one consistent typographic rhythm.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  size = 'default',
  className = '',
}: SectionHeadingProps) {
  const isCentered = align === 'center';
  const titleClasses =
    size === 'compact'
      ? 'text-lg md:text-xl'
      : 'text-xl md:text-2xl';

  return (
    <div
      className={`flex flex-col gap-3 ${
        isCentered ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
    >
      {eyebrow && (
        <span className="text-[11px] uppercase tracking-[0.4em] text-stone-400">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className={`text-balance font-light leading-tight text-stone-900 ${titleClasses}`}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm font-light italic text-stone-500">{subtitle}</p>
      )}
    </div>
  );
}
