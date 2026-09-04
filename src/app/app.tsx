import { Link, Outlet } from 'react-router';

export function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      {/* Child routes render here */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}