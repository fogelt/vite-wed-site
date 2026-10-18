import { useEffect, useState } from 'react';

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
