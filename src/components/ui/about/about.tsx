import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services";
import { Reveal } from '../reveal';
import { SectionHeading } from '../section-heading';

interface AboutSectionProps {
  image?: { url: string; alt: string };
  isLoading?: boolean;
}

const CATEGORIES = ["Utbildningar", "Utställningar", "Meriter"];
const FALLBACK_WELCOME =
  "Vad roligt att ni hittat hit! Jag heter Myelie och fotograferar bröllop med fokus på äkta känslor och de små ögonblicken som annars bara passerar. Bläddra runt bland bilderna nedan, lär känna mig lite bättre och kika på mina bröllopspaket — hör sedan gärna av er så berättar jag mer.";

export function AboutSection({ image }: AboutSectionProps) {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);

  const { data: content, isLoading: isTextLoading } = useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("about_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    }
  });

  // The welcome greeting now lives inside this intro section
  const { data: welcome } = useQuery({
    queryKey: ["welcome_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("welcome_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    },
  });

  const { data: credentials, isLoading: isCredsLoading } = useQuery({
    queryKey: ["about_credentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_credentials")
        .select("*")
        .order('sort_order', { ascending: true });
      if (error) return [];
      return data || [];
    }
  });

  const isDataFetching = isTextLoading || isCredsLoading;
  const activeItems = credentials?.filter(item => item.category === activeTab) || [];
  const portraitAlt = image?.alt || content?.name || "Myelie Lendelund";
  const welcomeText = welcome?.text || FALLBACK_WELCOME;

  return (
    <section id="om-mig" className="scroll-mt-24 py-12 md:scroll-mt-28 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">

          {/* Portrait (desktop) */}
          <Reveal className="hidden md:block">
            <Portrait image={image} alt={portraitAlt} className="max-w-[380px]" />
          </Reveal>

          {/* Text column */}
          <div>
            <Reveal className="mb-8 md:hidden">
              <Portrait image={image} alt={portraitAlt} className="max-w-[180px]" />
            </Reveal>

            <Reveal>
              <SectionHeading
                align="left"
                size="compact"
                eyebrow="Om mig"
                title={content?.name || "Myelie Lendelund"}
              />
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-5 space-y-4 text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
                <p>{welcomeText}</p>
                {content?.bio_p1 && <p>{content.bio_p1}</p>}
                {content?.bio_p2 && <p>{content.bio_p2}</p>}
              </div>
            </Reveal>

            {/* Meriter */}
            <Reveal delay={150}>
              <div className="mt-8">
                <div className="flex gap-6 border-b border-stone-200 sm:gap-10">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`-mb-px border-b pb-2.5 text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 ${
                        activeTab === cat
                          ? 'border-black text-stone-900'
                          : 'border-transparent text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="min-h-[90px] pt-5">
                  {isDataFetching ? (
                    <div className="space-y-4">
                      <div className="h-3 w-2/3 animate-pulse bg-stone-200/60" />
                      <div className="h-3 w-1/2 animate-pulse bg-stone-200/60" />
                    </div>
                  ) : (
                    <div
                      key={activeTab}
                      className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500"
                    >
                      {activeItems.length > 0 ? (
                        activeItems.map((item) => (
                          <div key={item.id}>
                            <p className="text-sm text-stone-800">{item.title}</p>
                            {item.subtitle && (
                              <p className="mt-1 text-xs font-light italic text-stone-400">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-light italic text-stone-400">
                          Information uppdateras snart.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portrait({
  image,
  alt,
  className = '',
}: {
  image?: { url: string; alt: string };
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!image?.url) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute -bottom-3 -left-3 hidden h-full w-full border border-stone-300/70 md:block"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden bg-stone-50">
        <img
          src={image.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`aspect-[4/5] w-full object-cover transition-opacity duration-1000 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
}
