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
  photo_variants?: { id: string; url: string }[];
}

export function WeddingsLayout({ photos, isLoading }: { photos: Photo[]; isLoading?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Image for the engagement section (uploaded under the "engagement" tag)
  const { data: engagementPhotos = [] } = useQuery({
    queryKey: ['photos', 'engagement'],
    queryFn: () => fetchPhotosByTag('engagement'),
  });

  const openPhoto = (photo: Photo) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    if (index !== -1) setSelectedIndex(index);
  };

  const introPhotos = photos.slice(3, 11);
  const galleryPhotos = photos.slice(11);
  const showGallery = isLoading || galleryPhotos.length > 0;

  return (
    <div className="flex w-full flex-col bg-white">
      <Hero photos={photos} isLoading={isLoading} />

      {/* Välkommen: the welcome text together with the first eight photos */}
      <section id="valkommen" className="scroll-mt-24 pb-12 md:scroll-mt-28 md:pb-16">
        <WelcomeSection />
        <ImageContainer
          photos={introPhotos}
          variant="weddings"
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
            variant="weddings"
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
      />
    </div>
  );
}
