import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ShipmentsPage = lazy(() =>
  import('@/pages/ShipmentsPage').then((m) => ({ default: m.ShipmentsPage })),
);
const ShipmentDetailPage = lazy(() =>
  import('@/pages/ShipmentDetailPage').then((m) => ({ default: m.ShipmentDetailPage })),
);
const AlertsPage = lazy(() =>
  import('@/pages/AlertsPage').then((m) => ({ default: m.AlertsPage })),
);
const ThresholdsPage = lazy(() =>
  import('@/pages/ThresholdsPage').then((m) => ({ default: m.ThresholdsPage })),
);

function page(node: ReactNode) {
  return <Suspense fallback={<Spinner block label="Loading page" />}>{node}</Suspense>;
}

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: page(<DashboardPage />) },
      { path: 'shipments', element: page(<ShipmentsPage />) },
      { path: 'shipments/:id', element: page(<ShipmentDetailPage />) },
      { path: 'alerts', element: page(<AlertsPage />) },
      {
        path: 'thresholds',
        element: (
          <ProtectedRoute permission="thresholds:view">{page(<ThresholdsPage />)}</ProtectedRoute>
        ),
      },
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
