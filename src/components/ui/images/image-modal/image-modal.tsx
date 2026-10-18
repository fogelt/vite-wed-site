import { useEffect, useCallback, useState } from 'react';

interface PhotoVariant {
  id: string;
  url: string;
}

interface Photo {
  id: string;
  url: string;
  alt?: string;
  description?: string;
  photo_variants?: PhotoVariant[];
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export const ImageModal = ({ isOpen, onClose, photos, currentIndex, setCurrentIndex }: ImageModalProps) => {
  const currentPhoto = photos[currentIndex];
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentPhoto) setActiveUrl(currentPhoto.url);
  }, [currentIndex, currentPhoto]);

  const goNext = useCallback(() => setCurrentIndex((currentIndex + 1) % photos.length), [currentIndex, photos.length, setCurrentIndex]);
  const goPrev = useCallback(() => setCurrentIndex((currentIndex - 1 + photos.length) % photos.length), [currentIndex, photos.length, setCurrentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || !currentPhoto) return null;

  const allRelated = [
    { id: 'main', url: currentPhoto.url },
    ...(currentPhoto.photo_variants || [])
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 transition-all duration-300">

      {/* Header */}
      <div className="z-[120] flex items-center justify-between p-6 md:px-10">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">
          {currentIndex + 1} / {photos.length}
        </div>
        <button
          onClick={onClose}
          aria-label="Stäng"
          className="text-3xl leading-none text-white/40 transition-colors hover:text-white"
        >
          &times;
        </button>
      </div>

      {/* Main Image Viewport */}
      <div className="relative flex flex-grow items-center justify-center px-4 md:px-20" onClick={onClose}>

        {/* Navigation Buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          aria-label="Föregående bild"
          className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 p-4 text-5xl text-white/20 transition-colors hover:text-white md:left-10"
        >
          &#8249;
        </button>

        <div className="group relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>

          {/* Variants - floating above the image */}
          {allRelated.length > 1 && (
            <div className="absolute -top-16 left-1/2 z-[120] flex -translate-x-1/2 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              {allRelated.map((img) => {
                const isActive = activeUrl === img.url;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveUrl(img.url)}
                    aria-label="Visa variant"
                    className="transition-transform active:scale-95"
                  >
                    <div className={`
                      h-10 w-10 overflow-hidden border transition-all duration-300 md:h-12 md:w-12
                      ${isActive
                        ? 'scale-110 border-2 border-white shadow-lg'
                        : 'border-white/20 opacity-40 blur-[0.5px] hover:opacity-100 hover:blur-0'
                      }
                    `}>
                      <img src={img.url} className="h-full w-full object-cover" alt="" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Image */}
          <img
            key={activeUrl}
            src={activeUrl || currentPhoto.url}
            alt={currentPhoto?.alt || ''}
            className="max-h-[65vh] max-w-full object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-500 md:max-h-[70vh]"
          />
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          aria-label="Nästa bild"
          className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 p-4 text-5xl text-white/20 transition-colors hover:text-white md:right-10"
        >
          &#8250;
        </button>
      </div>

      {/* Photo Description - Bottom */}
      <div
        className="z-[120] flex min-h-[120px] w-full items-center justify-center py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {currentPhoto.description && (
          <div className="max-w-xl px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="text-[11px] font-light uppercase italic leading-relaxed tracking-[0.15em] text-white/50 md:text-xs">
              {currentPhoto.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
