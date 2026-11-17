import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@/components/ui';
import { revealSiteCurtain, ScrollToTop } from '@/utils';

export default function AppRoot() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  // Never leave a failed page hidden behind the loading curtain.
  useEffect(() => {
    revealSiteCurtain();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[11px] uppercase tracking-[0.3em] text-stone-400">
      Något gick fel. Försök ladda om sidan.
    </div>
  );
}
