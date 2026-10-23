import { useQuery } from '@tanstack/react-query';
import { WeddingsLayout } from '@/components/layouts/weddings-layout';
import { fetchPhotosByTag } from '@/services/photo-fetcher';
import { useSEO } from '@/utils';

export default function HomeRoute() {
  useSEO({
    title: 'Bröllopsfotograf i Skåne | Myelie Lendelund',
    description: 'Bröllopsfotograf i Skåne som fångar äkta känslor och de små ögonblicken. Se portfolio och bröllopspaket, eller hör av dig för att boka er stora dag.',
    keywords: 'bröllopsfotograf Skåne, bröllopsfotograf, bröllopsfotografering Skåne, förlovningsfotograf Skåne',
    canonical: 'https://fogelt.github.io/vite-wed-site/'
  });
  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['photos', 'weddings_main'],
    queryFn: () => fetchPhotosByTag('weddings_main'),
  });

  if (error) return;

  return (
    <WeddingsLayout photos={photos} isLoading={isLoading} />
  );
}
