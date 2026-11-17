import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
        // The white curtain in index.html covers this wait, so it should stay
        // invisible: a plain white page rather than a loading label.
        HydrateFallback: () => null,
        children: [
          { index: true, lazy: () => import('./routes/app/home').then(convert(queryClient)) },
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