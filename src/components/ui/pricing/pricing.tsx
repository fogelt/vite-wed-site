import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services';
import { Reveal } from '../reveal';
import { SectionHeading } from '../section-heading';

interface WeddingPackage {
  id: string;
  name: string;
  time: string;
  includes: string;
  images: string;
  price: string;
  highlight: boolean;
}

const CONTACT_EMAIL = 'myelie@live.se';

export function PricingSection() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ['wedding_packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wedding_packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as WeddingPackage[];
    },
  });

  return (
    <section id="priser" className="scroll-mt-24 py-12 md:scroll-mt-28 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Bröllopspaket"
            title="En investering för livet"
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse bg-neutral-100" />
              ))
            : packages?.map((pkg, index) => (
                <Reveal key={pkg.id} delay={index * 120} className="h-full">
                  <article
                    className={`relative flex h-full flex-col border border-stone-200 p-8 transition-all duration-700 ${
                      pkg.highlight
                        ? 'z-10 scale-[1.02] bg-stone-50/50 shadow-sm ring-1 ring-stone-200 md:scale-105'
                        : 'bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {pkg.highlight && (
                      <span className="absolute right-8 top-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 md:right-10 md:top-10">
                        Populärast
                      </span>
                    )}

                    <h3 className="text-base font-light uppercase tracking-[0.2em] text-stone-800">{pkg.name}</h3>

                    <div className="mt-8 flex-1 space-y-6 text-xs leading-relaxed text-stone-600">
                      <PackageDetail label="Tid" value={pkg.time} />
                      <PackageDetail label="Ingår" value={pkg.includes} />
                      <PackageDetail label="Leverans" value={pkg.images} />
                    </div>

                    <div className="mt-10 border-t border-stone-300 pt-6">
                      <p className="text-lg font-light tracking-tight text-stone-900">{pkg.price}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
                        inkl. moms
                      </p>

                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                          `Förfrågan om bröllopspaket — ${pkg.name}`
                        )}`}
                        className="mt-7 inline-flex w-full items-center justify-center border border-stone-300 py-3.5 text-[10px] uppercase tracking-[0.3em] text-stone-800 transition-colors duration-300 hover:border-stone-500 hover:bg-stone-50"
                      >
                        Boka paketet
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}

          {/* Inbjudan till helt skräddarsytt */}
          <Reveal delay={360} className="h-full md:col-span-3">
            <div className="flex h-full flex-col items-center justify-center border border-stone-200 bg-white p-8 text-center shadow-sm md:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                Helt skräddarsytt
              </p>
              <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
                Drömmer ni om något utöver paketen — fler timmar, flera dagar eller ett upplägg
                helt i er stil? Berätta vad ni ser framför er, så bygger vi paketet tillsammans
                från grunden.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Förfrågan om skräddarsytt paket')}`}
                className="mt-7 inline-flex items-center justify-center border border-stone-300 px-10 py-3.5 text-[10px] uppercase tracking-[0.3em] text-stone-800 transition-colors duration-300 hover:border-stone-500 hover:bg-stone-50"
              >
                Berätta om era planer
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PackageDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="whitespace-pre-line leading-relaxed">{value}</p>
    </div>
  );
}
