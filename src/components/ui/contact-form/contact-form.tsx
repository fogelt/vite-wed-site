import { useId, useRef, useState, type FormEvent } from 'react';
import { Check, TriangleAlert } from 'lucide-react';

/**
 * The form posts to the sign site (the contract-signer API), which owns the
 * service@myeliefoto.se mailbox: it mails the enquiry to the photographer and
 * a receipt to the sender. Point VITE_CONTACT_API_URL at a local API
 * (http://localhost:5051/api/contact) to try it without sending real mail.
 */
const CONTACT_API_URL =
  import.meta.env.VITE_CONTACT_API_URL || 'https://sign.myeliefoto.se/api/contact';

/** A stalled request is given up on, so the button never waits forever. */
const REQUEST_TIMEOUT_MS = 30_000;

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface ContactFormProps {
  /** Shown as the fallback when the form cannot send. */
  email: string;
  phone: string;
}

const labelClasses = 'text-[10px] uppercase tracking-[0.3em] text-stone-500';
/** Label on the left, the field's message (when there is one) on the right. */
const labelRowClasses = 'flex items-baseline justify-between gap-4';
const fieldClasses =
  'mt-2 block w-full rounded-none border-0 border-b border-stone-300 bg-transparent px-0 py-2 text-[15px] font-light text-stone-900 transition-colors duration-300 focus:border-stone-900 focus:outline-none focus:ring-0';

const invalidClasses = 'border-stone-900';

interface FieldErrors {
  email?: string;
  message?: string;
}

/** Deliberately loose: the API has the final say on what is a usable address. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(address: string, message: string): FieldErrors {
  return {
    email: !address
      ? 'Fyll i er e-postadress.'
      : !EMAIL_PATTERN.test(address)
        ? 'E-postadressen ser inte rätt ut.'
        : undefined,
    message: !message ? 'Skriv ett meddelande.' : undefined,
  };
}

export function ContactForm({ email, phone }: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  // A form that cannot send points to mail and phone; a field to correct does not.
  const [offerFallback, setOfferFallback] = useState(true);
  const [confirmationSent, setConfirmationSent] = useState(true);
  const [sentTo, setSentTo] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const resultRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  /** Shows the messages and puts the cursor in the first field that needs fixing. */
  function showFieldErrors(errors: FieldErrors) {
    setFieldErrors(errors);
    if (errors.email) emailRef.current?.focus();
    else if (errors.message) messageRef.current?.focus();
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    const address = value('email');

    // The browser's own validation bubbles are switched off (noValidate), so the
    // form checks itself and shows its messages under the fields.
    const errors = validate(address, value('message'));
    if (errors.email || errors.message) {
      setStatus('idle');
      setError('');
      showFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus('sending');
    setError('');

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: address,
          message: value('message'),
          website: value('website'),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 400) {
        // The API checks the same things more strictly; its messages are Swedish
        // and belong under the same fields.
        const rejected = await readFieldErrors(response);
        if (rejected.email || rejected.message) {
          setStatus('idle');
          showFieldErrors(rejected);
          return;
        }
      }

      if (!response.ok) {
        setError(describeFailure(response.status));
        setOfferFallback(response.status !== 400);
        setStatus('error');
        return;
      }

      const result = (await response.json().catch(() => null)) as
        | { confirmationSent?: boolean }
        | null;
      setConfirmationSent(result?.confirmationSent !== false);
      setSentTo(address);
      setStatus('sent');
      // Move focus to the result so a screen reader announces it.
      window.requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setError('Meddelandet kunde inte skickas just nu.');
      setOfferFallback(true);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="mx-auto mt-10 max-w-xl border border-stone-200 px-8 py-12 text-center focus:outline-none"
      >
        <Check size={22} strokeWidth={1.25} className="mx-auto text-stone-500" aria-hidden="true" />
        <p className="mt-5 text-xl font-light text-stone-900">Tack för ert meddelande!</p>
        <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-stone-600">
          {confirmationSent
            ? `Det har kommit fram, och jag hör av mig så snart jag kan. En bekräftelse är på väg till ${sentTo}.`
            : 'Det har kommit fram, och jag hör av mig så snart jag kan.'}
        </p>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 max-w-xl text-left">
      <div className="space-y-7">
        <div>
          <div className={labelRowClasses}>
            <label htmlFor={`${id}-email`} className={labelClasses}>
              E-post <RequiredMark />
            </label>
            <FieldError id={`${id}-email-error`} message={fieldErrors.email} />
          </div>
          <input
            id={`${id}-email`}
            name="email"
            ref={emailRef}
            type="email"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${id}-email-error` : undefined}
            onInput={() => clearFieldError('email')}
            maxLength={254}
            autoComplete="email"
            className={`${fieldClasses} ${fieldErrors.email ? invalidClasses : ''}`}
          />
        </div>

        <div>
          <div className={labelRowClasses}>
            <label htmlFor={`${id}-message`} className={labelClasses}>
              Meddelande <RequiredMark />
            </label>
            <FieldError id={`${id}-message-error`} message={fieldErrors.message} />
          </div>
          <textarea
            id={`${id}-message`}
            name="message"
            ref={messageRef}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? `${id}-message-error` : undefined}
            onInput={() => clearFieldError('message')}
            rows={5}
            maxLength={4000}
            className={`${fieldClasses} resize-none leading-relaxed ${
              fieldErrors.message ? invalidClasses : ''
            }`}
          />
        </div>
      </div>

      {/* Left empty by people (it is off-screen and skipped by the keyboard and
          by screen readers); a robot that fills every field gives itself away. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Lämna tomt</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div role="alert">
        {status === 'error' && (
          <p className="mt-7 border-l-2 border-stone-900 pl-4 text-sm font-light leading-relaxed text-stone-900">
            {error}
            {offerFallback && (
              <>
                {' '}
                Mejla{' '}
                <a href={`mailto:${email}`} className="underline underline-offset-4">
                  {email}
                </a>{' '}
                eller ring{' '}
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="whitespace-nowrap underline underline-offset-4"
                >
                  {phone}
                </a>{' '}
                i stället.
              </>
            )}
          </p>
        )}
      </div>

      <div className="mt-9 flex justify-center">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex w-full items-center justify-center border border-black px-12 py-4 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition-colors duration-300 hover:bg-stone-50 disabled:cursor-wait disabled:border-stone-300 disabled:text-stone-400 sm:w-auto"
        >
          {sending ? 'Skickar…' : 'Skicka meddelande'}
        </button>
      </div>
    </form>
  );
}

/** Marks a required field. Screen readers already announce `required`. */
function RequiredMark() {
  return (
    <span className="text-stone-900" aria-hidden="true">
      *
    </span>
  );
}

/**
 * The message beside a field's label. The wrapper is always on the page so the
 * text is announced when it appears.
 */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} role="alert" className="text-right text-xs leading-snug text-stone-900">
      {message && (
        <span className="inline-flex items-center gap-1.5">
          <TriangleAlert size={13} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
          {message}
        </span>
      )}
    </p>
  );
}

/** The API's validation answer (ASP.NET ProblemDetails), by form field. */
async function readFieldErrors(response: Response): Promise<FieldErrors> {
  const problem = (await response.json().catch(() => null)) as
    | { errors?: Record<string, string[]> }
    | null;
  const first = (field: string) =>
    Object.entries(problem?.errors ?? {}).find(
      ([key]) => key.toLowerCase() === field,
    )?.[1]?.[0];

  return { email: first('email'), message: first('message') };
}

/** A Swedish sentence for a failed request, without the server's own wording. */
function describeFailure(status: number) {
  if (status === 429) {
    return 'Det har skickats flera meddelanden härifrån på kort tid, så formuläret pausar en stund.';
  }

  if (status === 400) return 'Något i formuläret gick inte att läsa.';

  return 'Meddelandet kunde inte skickas just nu.';
}
