import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPhotosByTag } from '@/services/photo-fetcher';
import {
  ContactCTA,
  EngagementSection,
  Hero,
  ImageContainer,
  ImageModal,
  PricingSection,
  WelcomeSection,
} from '@/components/ui';

interface Photo {
  id: string;
  url: string;
  alt?: string;
  description?: string;
  width?: number;
  height?: number;
  mobileHero?: boolean;
  photo_variants?: { id: string; url: string }[];
}

export function WeddingsLayout({ photos, isLoading }: { photos: Photo[]; isLoading?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ id: string; src: string } | null>(null);

  // Image for the engagement section (uploaded under the "engagement" tag)
  const { data: engagementPhotos = [] } = useQuery({
    queryKey: ['photos', 'engagement'],
    queryFn: () => fetchPhotosByTag('engagement'),
  });

  const openPhoto = (photo: Photo, previewSrc?: string) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    if (index === -1) return;
    setSelectedIndex(index);
    setPreview(previewSrc ? { id: photo.id, src: previewSrc } : null);
  };

  const introPhotos = photos.slice(3, 11);
  const galleryPhotos = photos.slice(11);
  const showGallery = isLoading || galleryPhotos.length > 0;

  return (
    <div className="flex w-full flex-col bg-white">
      <Hero photos={photos} isLoading={isLoading} />

      {/* Välkommen: the welcome text */}
      <section id="valkommen" className="scroll-mt-24 md:scroll-mt-28">
        <WelcomeSection />
      </section>

      {/* De första åtta bilderna har en egen sektion så man kan hoppa direkt dit */}
      <section id="utvalda-bilder" className="scroll-mt-24 pb-12 md:scroll-mt-28 md:pb-16">
        <ImageContainer
          photos={introPhotos}
          variant="editorial"
          onItemClick={openPhoto}
          isLoading={isLoading}
          skeletonCount={8}
        />
      </section>

      <PricingSection />

      <EngagementSection
        image={
          engagementPhotos[0]
            ? {
              url: engagementPhotos[0].url,
              alt: engagementPhotos[0].alt || 'Förlovningsfotografering',
            }
            : undefined
        }
      />

      {/* Galleriet fortsätter efter förlovningen */}
      {showGallery && (
        <section id="galleri" className="scroll-mt-24 pb-12 pt-2 md:scroll-mt-28 md:pb-16 md:pt-6">
          <ImageContainer
            photos={galleryPhotos}
            variant="editorial"
            onItemClick={openPhoto}
            isLoading={isLoading}
          />
        </section>
      )}

      <ContactCTA />

      <ImageModal
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        photos={photos}
        currentIndex={selectedIndex ?? 0}
        setCurrentIndex={setSelectedIndex}
        preview={preview}
      />
    </div>
  );
}
