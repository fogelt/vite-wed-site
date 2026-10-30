import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from 'lucide-react';
import { supabase } from "@/services";
import { scrollToSection } from "@/utils";
import { Reveal } from '../reveal';
import { SectionHeading } from '../section-heading';

interface EngagementSectionProps {
  image?: { url: string; alt: string };
  isLoading?: boolean;
}

const FALLBACK_TITLE = "Innan den stora dagen";
const FALLBACK_TEXT =
  "Innan den stora dagen kommer ögonblicket då allt börjar — förlovningen. En förlovningsfotografering är ett avslappnat sätt att lära känna varandra framför kameran, och ni får vackra bilder att spara och dela medan ni längtar efter bröllopet.";

export function EngagementSection({ image }: EngagementSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: content, isLoading: isTextLoading } = useQuery({
    queryKey: ["engagement_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("engagement_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    },
  });

  if (isTextLoading) return null;

  return (
    <section id="forlovning" className="scroll-mt-24 py-12 md:scroll-mt-28 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Text */}
          <Reveal className="order-1">
            <SectionHeading
              align="left"
              eyebrow="Förlovningsfotografering"
              title={content?.title || FALLBACK_TITLE}
            />
            <p className="mt-5 whitespace-pre-line text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
              {content?.text || FALLBACK_TEXT}
            </p>
            <button
              onClick={() => scrollToSection('kontakt')}
              className="group mt-7 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-stone-900"
            >
              <span className="border-b border-stone-300 pb-1 transition-colors duration-300 group-hover:border-black">
                Berätta om era planer
              </span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </Reveal>

          {/* Image */}
          {image?.url && (
            <Reveal delay={150} className="order-2">
              <div className="relative">
                <div
                  className="absolute -bottom-4 -right-4 hidden h-full w-full border border-stone-300/70 md:block"
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden bg-neutral-100">
                  <img
                    src={image.url}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={`h-auto w-full transition-opacity duration-1000 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
