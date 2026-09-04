import { Outlet } from 'react-router';
import { NavBar } from '@/components/ui';

export function App() {
  return (
    <div>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}