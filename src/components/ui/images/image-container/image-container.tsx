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
  skeletonCount?: number;
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
  isLoading,
  skeletonCount = 11,
}: ImageContainerProps) {
  const displayPhotos = isLoading
    ? Array.from({ length: skeletonCount }).map((_, i) => ({ id: `skeleton-${i}`, url: '' })) as Photo[]
    : photos;

  const getSizingClasses = (index: number) => {
    if (variant === 'reportage') {
      return "w-full h-auto flex-grow md:w-auto xl:h-[265px]";
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
          return 'h-auto w-full md:aspect-[3/2] md:w-[calc(43%_-_11px)]';

        case 8:
        case 9: // the two landscapes in the closing --| row
          return 'h-auto w-full md:aspect-[3/2] md:w-[calc(41%_-_7px)]';

        case 10: // the portrait that closes the --| row
          return 'h-auto w-full md:aspect-[2/3] md:w-[calc(18%_-_3.5px)]';

        default: // the portraits in the two 4-photo rows
          return 'h-auto w-full md:aspect-[2/3] md:w-[calc(19%_-_5px)]';
      }
    }

    const pos = (index % 10) + 1;
    const base = "flex-grow h-auto";

    switch (pos) {
      case 1: case 2: case 3:
        return base + " w-full md:w-[28%] md:h-[70vh]";

      case 4: case 5: case 7: case 9: case 10:
        return base + " w-full md:w-[45%] md:h-[60vh]";

      case 6: case 8:
        return base + " w-full md:w-[18%] md:h-[60vh]";

      default:
        return base + " w-full md:w-[30%] md:h-[25em]";
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
              className={`${sizingClass} aspect-[3/2] bg-neutral-100 animate-pulse fade-in`}
            />
          );
        }
        if (renderItem) return renderItem(photo, index, sizingClass);

        return (
          <div key={photo.id} className={`${sizingClass} overflow-hidden bg-neutral-100`}>
            <ImageCard
              url={photo.url}
              alt={photo.alt}
              className={`w-full object-cover h-auto ${variant === 'reportage' ? 'xl:h-full' : 'md:h-full'}`}
              onClick={() => onItemClick?.(photo)}
              has_variant={photo.photo_variants?.length ? <Images size={15} /> : null}
            />
          </div>
        );
      })}
    </div>
  );
}
