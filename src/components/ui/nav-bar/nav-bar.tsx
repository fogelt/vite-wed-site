import { NavLink, useLocation } from 'react-router';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
];

export function NavBar() {
  const location = useLocation();

  const activeIndex = navItems.findIndex((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
      <nav className="relative grid grid-cols-2 p-1.5 bg-gray-200/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-300/50 dark:border-zinc-700/50 w-56 pointer-events-auto">

        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-zinc-900 dark:bg-white rounded-full shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${activeIndex <= 0 ? 0 : activeIndex * 100}%)`,
            left: '6px',
          }}
        />

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `relative z-10 py-2 text-sm font-medium text-center transition-colors duration-200 ${isActive
                ? 'text-white dark:text-zinc-900'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}