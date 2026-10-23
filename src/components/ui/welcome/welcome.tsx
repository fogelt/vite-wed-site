import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services';
import { SectionDivider } from '../divider';
import { Reveal } from '../reveal';
import { SectionHeading } from '../section-heading';

const FALLBACK_TITLE = "Välkomna hit";
const FALLBACK_TEXT =
  "Vad roligt att ni hittat hit! Jag heter Myelie och fotograferar bröllop med fokus på äkta känslor och de små ögonblicken som annars bara passerar. Bläddra runt bland bilderna nedan, lär känna mig lite bättre och kika på mina bröllopspaket — hör sedan gärna av er så berättar jag mer.";

export function WelcomeSection() {
  const { data: content } = useQuery({
    queryKey: ["welcome_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("welcome_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    },
  });

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <SectionHeading
            eyebrow="Välkommen"
            title={content?.title || FALLBACK_TITLE}
          />
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-2xl whitespace-pre-line text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
            {content?.text || FALLBACK_TEXT}
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-10 flex justify-center">
            <SectionDivider />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
