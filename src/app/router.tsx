import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AdminGuard } from '@/components/auth';
import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';

const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter(
    [
      {
        path: '/',
        element: <AppRoot />,
        ErrorBoundary: AppRootErrorBoundary,
        HydrateFallback: () => (
          <div className="flex h-screen items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-stone-400">
              Laddar...
            </span>
          </div>
        ),
        children: [
          { index: true, lazy: () => import('./routes/app/home').then(convert(queryClient)) },
          {
            path: 'admin',
            element: <AdminGuard />,
            children: [
              {
                index: true,
                lazy: () => import('./routes/auth/admin').then(convert(queryClient)),
              }
            ]
          },
        ],
      }
    ],
    // Serves the app from a subpath in production (GitHub Pages project site),
    // while import.meta.env.BASE_URL is '/' in local dev.
    { basename: import.meta.env.BASE_URL }
  );

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};