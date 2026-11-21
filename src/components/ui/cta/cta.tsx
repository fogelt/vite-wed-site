import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services";
import { Mail, Phone } from 'lucide-react';
import { ContactForm } from '../contact-form';
import { Reveal } from '../reveal';

const FALLBACK_EMAIL = "myelie@live.se";
const FALLBACK_PHONE = "+46 72 16 82 019";

const linkClasses =
  'inline-flex items-center gap-2.5 whitespace-nowrap border-b border-transparent pb-0.5 text-sm font-light text-stone-600 transition-colors duration-300 hover:border-stone-400 hover:text-stone-900';

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
            <strong>Berätta om era planer så tar vi det därifrån. datum, plats och era tankar.</strong>
          </p>

          {/* The address and number are shown as what they are, not as buttons
              with a verb: the only "send" on the page is the form's own. */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-10">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("Förfrågan om bröllopsfotografering")}`}
              className={linkClasses}
            >
              <Mail size={14} strokeWidth={1.5} aria-hidden="true" />
              {email}
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className={linkClasses}>
              <Phone size={14} strokeWidth={1.5} aria-hidden="true" />
              {phone}
            </a>
          </div>

          <p className="mt-12 text-[10px] uppercase tracking-[0.35em] text-stone-400">
            Eller skriv direkt här
          </p>

          <ContactForm email={email} phone={phone} />
        </Reveal>
      </div>
    </section>
  );
}
