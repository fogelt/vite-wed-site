import { loadEnv, type Plugin } from 'vite';
import { NAV_ITEMS } from './src/config/nav';

/**
 * Prerendered page text
 * ---------------------
 * The app renders entirely in the browser, so the HTML that is served would
 * otherwise contain an empty `<div id="root">`: no heading, no text, no prices
 * and no contact details for anything that reads the page without running
 * JavaScript (Bing and other search engines to varying degrees, link previews,
 * AI crawlers) and a longer wait before Google sees them.
 *
 * At build time this fetches the same texts the app loads from Supabase and
 * writes them into `#root` as plain semantic HTML. React replaces the contents
 * of `#root` on its first render and the loading curtain covers the page until
 * then, so visitors never see this markup; with JavaScript off it is the page.
 *
 * The texts are a snapshot from the latest deploy. An edit made in the admin
 * shows up for visitors straight away as before, and here after the next
 * deploy. A failed request only leaves that section out; it never fails the
 * build.
 */

const CONTACT_EMAIL = 'myelie@live.se';
const CONTACT_PHONE = '+46 72 16 82 019';
const REQUEST_TIMEOUT_MS = 8000;

interface WelcomeContent {
  title?: string | null;
  text?: string | null;
  process_eyebrow?: string | null;
  process_steps?: unknown;
}

interface WeddingPackage {
  name?: string | null;
  time?: string | null;
  includes?: string | null;
  images?: string | null;
  price?: string | null;
}

interface EngagementContent {
  title?: string | null;
  text?: string | null;
}

interface ContactContent {
  email?: string | null;
  phone?: string | null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Blank lines separate paragraphs; single line breaks are kept. */
function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function renderWelcome(content: WelcomeContent | null) {
  const title = clean(content?.title);
  const text = clean(content?.text);
  if (!title && !text) return '';

  const steps = (Array.isArray(content?.process_steps) ? content.process_steps : [])
    .map((step) => ({
      title: clean((step as Record<string, unknown> | null)?.title),
      text: clean((step as Record<string, unknown> | null)?.text),
    }))
    .filter((step) => step.title || step.text);

  const process = steps.length
    ? `<h3>${escapeHtml(clean(content?.process_eyebrow) || 'Så funkar det')}</h3><ol>${steps
      .map(
        (step) =>
          `<li><strong>${escapeHtml(step.title)}</strong> ${escapeHtml(step.text)}</li>`,
      )
      .join('')}</ol>`
    : '';

  return `<section id="valkommen"><h2>${escapeHtml(title || 'Välkomna hit')}</h2>${paragraphs(text)}${process}</section>`;
}

function renderPackages(packages: WeddingPackage[] | null) {
  const cards = (packages ?? [])
    .filter((pkg) => clean(pkg.name))
    .map((pkg) => {
      const details = [
        ['Tid', clean(pkg.time)],
        ['Ingår', clean(pkg.includes)],
        ['Leverans', clean(pkg.images)],
      ]
        .filter(([, value]) => value)
        .map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`)
        .join('');
      const price = clean(pkg.price);

      return (
        `<article><h3>${escapeHtml(clean(pkg.name))}</h3>` +
        (details ? `<dl>${details}</dl>` : '') +
        (price ? `<p>${escapeHtml(price)} inkl. moms</p>` : '') +
        `</article>`
      );
    })
    .join('');
  if (!cards) return '';

  return `<section id="priser"><h2>Bröllopspaket — en investering för livet</h2>${cards}</section>`;
}

function renderEngagement(content: EngagementContent | null) {
  const title = clean(content?.title);
  const text = clean(content?.text);
  if (!title && !text) return '';

  return `<section id="forlovning"><h2>${escapeHtml(title || 'Förlovningsfotografering')}</h2>${paragraphs(text)}</section>`;
}

function renderContact(content: ContactContent | null) {
  const email = clean(content?.email) || CONTACT_EMAIL;
  const phone = clean(content?.phone) || CONTACT_PHONE;

  return (
    `<section id="kontakt"><h2>Låt oss berätta er historia</h2>` +
    `<p>Skriv några rader här, så hör jag av mig.</p>` +
    `<p><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a> · ` +
    `<a href="tel:${escapeHtml(phone.replace(/\s/g, ''))}">${escapeHtml(phone)}</a></p></section>`
  );
}

export function prerenderContent(): Plugin {
  let supabaseUrl = '';
  let supabaseKey = '';

  async function rows<T>(query: string): Promise<T[] | null> {
    if (!supabaseUrl || !supabaseKey) return null;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as T[];
    } catch (error) {
      console.warn(`[prerender-content] ${query.split('?')[0]} left out: ${String(error)}`);
      return null;
    }
  }

  return {
    name: 'prerender-content',
    apply: 'build',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir || process.cwd(), 'VITE_');
      supabaseUrl = env.VITE_SUPABASE_URL ?? '';
      supabaseKey = env.VITE_SUPABASE_ANON_KEY ?? '';
    },
    async transformIndexHtml(html) {
      const [welcome, packages, engagement, contact] = await Promise.all([
        rows<WelcomeContent>('welcome_content?select=*&limit=1'),
        rows<WeddingPackage>('wedding_packages?select=*&order=sort_order.asc'),
        rows<EngagementContent>('engagement_content?select=*&limit=1'),
        rows<ContactContent>('about_content?select=email,phone&limit=1'),
      ]);

      // Only link to sections that made it into this markup.
      const sections = [
        renderWelcome(welcome?.[0] ?? null),
        renderPackages(packages),
        renderEngagement(engagement?.[0] ?? null),
        renderContact(contact?.[0] ?? null),
      ].join('');
      const nav = NAV_ITEMS.filter((item) => sections.includes(`id="${item.target}"`))
        .map((item) => `<a href="#${item.target}">${escapeHtml(item.label)}</a>`)
        .join(' · ');

      const content =
        `<div class="mx-auto max-w-3xl px-6 py-14">` +
        `<header><p>Bröllopsfotograf Myelie Lendelund</p><nav aria-label="Huvudmeny">${nav}</nav></header>` +
        `<main><section><h1>Bröllopsfotograf Skåne — Myelie Lendelund</h1>` +
        `<p>Äkta ögonblick, varsamt bevarade</p></section>${sections}</main>` +
        `<footer><p>Bröllopsfotograf i Skåne · ` +
        `<a href="https://www.instagram.com/myelielendelund/">Instagram</a> · ` +
        `<a href="https://myeliefoto.se">myeliefoto.se</a></p></footer>` +
        `</div>`;

      const marker = '<div id="root"></div>';
      if (!html.includes(marker)) {
        this.warn('`<div id="root"></div>` not found in index.html; page text was not prerendered.');
        return html;
      }
      return html.replace(marker, `<div id="root">${content}</div>`);
    },
  };
}
