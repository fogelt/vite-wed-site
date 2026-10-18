import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services";
import { Mail, Phone } from 'lucide-react';
import { Reveal } from '../reveal';

const FALLBACK_EMAIL = "myelie@live.se";
const FALLBACK_PHONE = "+46 72 16 82 019";

export function ContactCTA() {
  const { data: content } = useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("about_content").select("*").maybeSingle();
      if (error) return null;
      return data;
    },
  });

  const email = content?.email || FALLBACK_EMAIL;
  const phone = content?.phone || FALLBACK_PHONE;

  return (
    <section id="kontakt" className="scroll-mt-24 border-t border-stone-200 bg-white md:scroll-mt-28">
      <div className="mx-auto max-w-3xl px-6 py-14 text-center md:py-20">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.4em] text-stone-400">Förfrågan</p>

          <h2 className="mt-4 text-2xl font-light leading-tight text-stone-900 md:text-3xl">
            Låt oss berätta <span className="italic">er historia</span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-stone-600 md:text-base">
            Berätta om era planer så tar vi det därifrån — datum, plats och era tankar.
            Jag svarar alltid personligt, oftast inom ett par dagar.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("Förfrågan om bröllopsfotografering")}`}
              className="inline-flex w-full items-center justify-center gap-3 border border-black px-10 py-3.5 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition-colors duration-300 hover:bg-stone-50 sm:w-auto"
            >
              <Mail size={14} strokeWidth={1.5} aria-hidden="true" />
              Skicka e-post
            </a>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex w-full items-center justify-center gap-3 border border-stone-300 px-10 py-3.5 text-[11px] uppercase tracking-[0.28em] text-stone-500 transition-colors duration-300 hover:border-stone-400 hover:text-stone-900 sm:w-auto"
            >
              <Phone size={14} strokeWidth={1.5} aria-hidden="true" />
              {phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
