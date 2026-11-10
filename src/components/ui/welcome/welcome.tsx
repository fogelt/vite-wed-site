import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services';
import { SectionDivider } from '../divider';
import { HowItWorksPanel, type HowItWorksStep } from '../how-it-works';
import { Reveal } from '../reveal';

const FALLBACK_TITLE = "Välkomna hit";
const FALLBACK_TEXT =
  "Vad roligt att ni hittat hit! Jag heter Myelie och fotograferar bröllop med fokus på äkta känslor och de små ögonblicken som annars bara passerar. Bläddra runt bland bilderna nedan, lär känna mig lite bättre och kika på mina bröllopspaket — hör sedan gärna av er så berättar jag mer.";

function normalizeProcessSteps(value: unknown): HowItWorksStep[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((step): step is Record<string, unknown> =>
      Boolean(step) && typeof step === 'object'
    )
    .map((step) => ({
      title: typeof step.title === 'string' ? step.title : '',
      text: typeof step.text === 'string' ? step.text : '',
    }))
    .filter((step) => step.title.trim() !== '' || step.text.trim() !== '');
}

export function WelcomeSection() {
  const { data: content } = useQuery({
    queryKey: ["welcome_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("welcome_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    },
  });

  const welcomeText = content?.text || FALLBACK_TEXT;
  const processSteps = normalizeProcessSteps(content?.process_steps);
  const processEyebrow =
    typeof content?.process_eyebrow === 'string' && content.process_eyebrow.trim()
      ? content.process_eyebrow
      : undefined;

  return (
    <div className="overflow-hidden py-14 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="text-[11px] uppercase tracking-[0.45em] text-stone-400">
              Välkommen
            </span>

            <h2 className="mt-5 text-balance text-2xl font-light leading-tight text-stone-900 md:text-4xl">
              {content?.title || FALLBACK_TITLE}
            </h2>

            <div className="mt-8 h-px w-16 bg-stone-300" aria-hidden="true" />
          </div>
        </Reveal>

        <div className="mt-12 border-y border-stone-200 py-10 md:mt-16 md:py-14">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <Reveal className="flex-1">
              <p className="whitespace-pre-line text-[15px] font-light leading-relaxed text-stone-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-normal first-letter:leading-[0.78] md:text-base">
                {welcomeText}
              </p>
            </Reveal>

            <div
              className="hidden w-px self-stretch bg-stone-200 md:block"
              aria-hidden="true"
            />

            <Reveal delay={140} className="md:w-[42%] md:flex-none">
              <HowItWorksPanel
                eyebrow={processEyebrow}
                steps={processSteps.length > 0 ? processSteps : undefined}
              />
            </Reveal>
          </div>
        </div>

        <Reveal delay={220}>
          <div className="mt-10 flex justify-center">
            <SectionDivider />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
