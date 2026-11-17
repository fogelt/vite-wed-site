import { useEffect, useState, type RefObject } from 'react';

/**
 * Where a section counts as "reached", as a fraction of the viewport height from the top.
 * Matches the bottom edge of the active-section band in the header (rootMargin -55% bottom),
 * so the bar arrives under a link at the same moment the link lights up.
 */
const REACH_LINE = 0.45;

interface Anchor {
  scroll: number;
  x: number;
}

/**
 * Progress bar width (px) for the desktop nav, mapped piecewise onto the links:
 * when a section is reached, the bar ends under the centre of its link; between
 * sections it eases across the gap; at the bottom of the page it fills the nav.
 */
export function useNavProgress(navRef: RefObject<HTMLElement | null>, ids: string[]) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let frame = 0;
    let anchors: Anchor[] = [];

    function layout() {
      const nav = navRef.current;
      if (!nav) return;
      const navBox = nav.getBoundingClientRect();
      const links = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-target]'));
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const reach = window.innerHeight * REACH_LINE;

      const next: Anchor[] = [{ scroll: 0, x: 0 }];
      for (const id of ids) {
        const section = document.getElementById(id);
        const link = links.find((el) => el.dataset.navTarget === id);
        if (!section || !link) continue;

        const linkBox = link.getBoundingClientRect();
        const x = linkBox.left - navBox.left + linkBox.width / 2;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const scroll = Math.min(max, Math.max(0, top - reach));

        // Keep anchors strictly increasing; a later section that can't be scrolled
        // further (e.g. the last one near the page bottom) replaces the previous anchor.
        const prev = next[next.length - 1];
        if (scroll > prev.scroll) next.push({ scroll, x });
        else next[next.length - 1] = { scroll: prev.scroll, x: Math.max(prev.x, x) };
      }

      const last = next[next.length - 1];
      if (max > last.scroll) next.push({ scroll: max, x: navBox.width });
      else next[next.length - 1] = { scroll: last.scroll, x: navBox.width };

      anchors = next;
    }

    function measure() {
      frame = 0;
      layout();
      if (anchors.length < 2) return;

      const y = window.scrollY;
      let x = anchors[anchors.length - 1].x;
      for (let i = 1; i < anchors.length; i += 1) {
        const a = anchors[i - 1];
        const b = anchors[i];
        if (y <= b.scroll) {
          const t = Math.max(0, (y - a.scroll) / (b.scroll - a.scroll));
          x = a.x + (b.x - a.x) * t;
          break;
        }
      }
      setWidth((prev) => (Math.abs(prev - x) > 0.25 ? x : prev));
    }

    function request() {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    }

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    // Lazy sections and late images move the anchors — re-measure when the page reshapes.
    const observer = new ResizeObserver(request);
    observer.observe(document.body);
    if (navRef.current) observer.observe(navRef.current);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      observer.disconnect();
    };
  }, [navRef, ids]);

  return width;
}

/** Tracks how far the page is scrolled, from 0 (top) to 1 (bottom). */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress((prev) => (Math.abs(prev - next) > 0.0005 ? next : prev));
    }

    function request() {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    }

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    // Late content (images) reshapes the page — keep the ratio honest.
    const observer = new ResizeObserver(request);
    observer.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      observer.disconnect();
    };
  }, []);

  return progress;
}
