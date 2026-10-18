import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@/components/ui';
import { ScrollToTop } from '@/utils';
import { AnalyticsTracker } from '@/components/analytics';

export default function AppRoot() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnalyticsTracker />
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[11px] uppercase tracking-[0.3em] text-stone-400">
      Något gick fel. Försök ladda om sidan.
    </div>
  );
}
