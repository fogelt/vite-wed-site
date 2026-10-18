import { useState } from "react";
import { ImageCard } from '@/components/ui';
import { Images } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  alt?: string;
  description?: string;
  photo_variants?: { id: string; url: string }[];
}

interface ImageContainerProps {
  photos: Photo[];
  variant?: 'default' | 'weddings' | 'reportage';
  onItemClick?: (photo: Photo) => void;
  renderItem?: (photo: Photo, index: number, className: string) => React.ReactNode;
  isLoading?: boolean;
}

/**
 * The signature mosaic gallery. The "weddings" variant cycles three editorial
 * row rhythms every 11 photos — ||-|, |-|| and --| (| = 2:3 portrait,
 * - = 3:2 landscape) — while the default variant keeps the original landscape
 * pattern.
 */
export function ImageContainer({
  photos,
  variant = 'default',
  onItemClick,
  renderItem,
  isLoading
}: ImageContainerProps) {
  const displayPhotos = isLoading
    ? Array.from({ length: 11 }).map((_, i) => ({ id: `skeleton-${i}`, url: '' })) as Photo[]
    : photos;
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getSizingClasses = (index: number) => {
    if (variant === 'reportage') {
      return "xl:h-[265px] w-auto flex-grow";
    }

    if (variant === 'weddings') {
      // Editorial mosaic: three row rhythms cycle every 11 photos —
      // ||-|, |-|| and --| (| = 2:3 portrait, - = 3:2 landscape).
      // Widths are proportional to each tile's aspect so all tiles in a row
      // share one height; the px subtractions cover the 8px gaps plus a small
      // rounding margin, letting rows fill the container without wrapping.
      switch (index % 11) {
        case 2:
        case 5: // the landscape in the two 4-photo rows (||-| and |-||)
          return 'h-[60vh] w-full md:h-auto md:aspect-[3/2] md:w-[calc(43%_-_11px)]';

        case 8:
        case 9: // the two landscapes in the closing --| row
          return 'h-[60vh] w-full md:h-auto md:aspect-[3/2] md:w-[calc(41%_-_7px)]';

        case 10: // the portrait that closes the --| row
          return 'h-[60vh] w-full md:h-auto md:aspect-[2/3] md:w-[calc(18%_-_3.5px)]';

        default: // the portraits in the two 4-photo rows
          return 'h-[60vh] w-full md:h-auto md:aspect-[2/3] md:w-[calc(19%_-_5px)]';
      }
    }

    const pos = (index % 10) + 1;
    const base = "flex-grow h-auto";

    switch (pos) {
      case 1: case 2: case 3:
        return base + "h-[70vh] w-full md:w-[28%]";

      case 4: case 5: case 7: case 9: case 10:
        return base + "h-[60vh] w-full md:w-[45%]";

      case 6: case 8:
        return base + "h-[60vh] w-full md:w-[18%]";

      default:
        return base + "h-[25em] w-[30%]";
    }
  };

  return (
    <div className={`flex flex-wrap p-2 w-[93%] mx-auto justify-center ${variant === 'reportage' ? ' gap-1 max-w-[1000px]' : ' gap-2 max-w-[2000px]'
      }`}>
      {displayPhotos.map((photo, index) => {
        const sizingClass = getSizingClasses(index);

        if (isLoading) {
          return (
            <div
              key={photo.id}
              className={`${sizingClass} bg-stone-200 animate-pulse fade-in`}
            />
          );
        }
        const hasLoaded = loadedImages[photo.id];

        if (renderItem) return renderItem(photo, index, sizingClass);

        return (
          <div
            key={photo.id}
            className={`${sizingClass} overflow-hidden bg-stone-50 transition-opacity duration-1000 ${hasLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <ImageCard
              url={photo.url}
              alt={photo.alt}
              className={`w-full object-cover ${variant === 'reportage' ? 'h-auto md:h-full' : 'h-full'
                } ${hasLoaded
                  ? 'animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both'
                  : 'opacity-0'
                }`}
              style={{
                animationDelay: `${index * 150}ms`,
              }}
              onClick={() => onItemClick?.(photo)}
              onLoad={() => handleImageLoad(photo.id)}
              has_variant={photo.photo_variants?.length ? <Images size={15} /> : null}
            />
          </div>
        );
      })}
    </div>
  );
}
