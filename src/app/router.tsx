import { createBrowserRouter } from 'react-router';
import { App } from '@/app/app';
import { HomePage, AboutPage } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
]);