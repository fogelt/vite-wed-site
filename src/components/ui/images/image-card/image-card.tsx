import { useImageLoaded } from '@/utils/use-image-loaded';

interface ImageCardProps {
  url: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  has_variant?: React.ReactNode;
}

const DEFAULT_IMG_CLASS =
  'relative h-full w-full object-cover object-[center_70%] transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04]';

export function ImageCard({
  url,
  alt,
  className,
  imgClassName,
  style,
  onClick,
  onLoad: onLoadProp,
  has_variant,
}: ImageCardProps) {
  const image = useImageLoaded(url);

  const handleLoad = () => {
    image.onLoad();
    onLoadProp?.();
  };

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onClick={onClick}
      style={style}
    >
      {has_variant && (
        <div
          className="pointer-events-auto absolute top-4 right-4 z-20 flex items-center gap-2 group/icon"
        >
          <span className="whitespace-nowrap rounded-md bg-black/40 px-2 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 -translate-x-2 group-hover/icon:translate-x-0 group-hover/icon:opacity-100">
            Bilden har varianter
          </span>

          <div className="flex cursor-pointer flex-row rounded-md bg-black/40 px-1 py-1 text-xs font-medium text-white opacity-65 drop-shadow-md backdrop-blur-md transition-transform duration-300 group-hover/icon:scale-110 group-hover/icon:opacity-100">
            Fler bilder
            <div className="ml-2">
              {has_variant}
            </div>
          </div>
        </div>
      )}

      {/* Very dim skeleton in the card's shape until the photo fades in. */}
      <div
        className={`pointer-events-none absolute inset-0 bg-neutral-100 transition-opacity duration-700 ${
          image.loaded ? 'opacity-0' : 'animate-pulse'
        }`}
        aria-hidden="true"
      />

      <img
        ref={image.ref}
        src={url}
        alt={alt || "Fotografi Myelie Lendelund"}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={image.onError}
        className={`${imgClassName ?? DEFAULT_IMG_CLASS} ${image.loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
