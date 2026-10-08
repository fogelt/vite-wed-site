import { useQuery } from '@tanstack/react-query';
import { AboutSection } from '@/components/ui';
import { fetchPhotosByTag } from '@/services/photo-fetcher';
import { useSEO } from '@/utils';

export default function AboutRoute() {
  useSEO({
    title: 'Om mig | Bröllopsfotograf Myelie Lendelund',
    description: 'Lär känna Myelie Lendelund — bröllopsfotograf i Skåne som fångar äkta känslor, utbildningar, utställningar och kontaktuppgifter.',
    keywords: 'bröllopsfotograf, om mig, Myelie Lendelund, kontakt',
    canonical: 'https://fogelt.github.io/vite-wed-site/om-mig',
  });
  const { data: photos = [] } = useQuery({
    queryKey: ['photos', 'about'],
    queryFn: () => fetchPhotosByTag('about'),
  });

  const first = photos[0];

  return (
    <AboutSection
      image={first ? { url: first.url, alt: first.alt || "Myelie Lendelund" } : undefined}
    />
  );
}
