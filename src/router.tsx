/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.6 — ROUTER SYSTEM
 *   Router moderne avec React Router v7, lazy loading, type safety
 * ═══════════════════════════════════════════════════════════════
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';

// ═══════════════════════════════════════════════════════════════
// LAZY LOADING DES PAGES (Performance optimale)
// ═══════════════════════════════════════════════════════════════

const Dashboard = lazy(() => import('./pages').then(m => ({ default: m.Dashboard })));
const Chat = lazy(() => import('./ui/pages/Chat').then(m => ({ default: m.Chat })));
const Helios = lazy(() => import('./pages').then(m => ({ default: m.Helios })));
const Nexus = lazy(() => import('./pages').then(m => ({ default: m.Nexus })));
const Harmonia = lazy(() => import('./pages').then(m => ({ default: m.Harmonia })));
const Sentinel = lazy(() => import('./pages').then(m => ({ default: m.Sentinel })));
const Watchdog = lazy(() => import('./pages').then(m => ({ default: m.Watchdog })));
const SelfHeal = lazy(() => import('./pages').then(m => ({ default: m.SelfHeal })));
const AdaptiveEngine = lazy(() => import('./pages').then(m => ({ default: m.AdaptiveEngine })));
const Memory = lazy(() => import('./pages').then(m => ({ default: m.Memory })));
const Settings = lazy(() => import('./pages').then(m => ({ default: m.Settings })));
const DevTools = lazy(() => import('./pages').then(m => ({ default: m.DevTools })));

// ═══════════════════════════════════════════════════════════════
// LOADING FALLBACK COMPONENT
// ═══════════════════════════════════════════════════════════════

const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'var(--color-primary)',
    fontSize: '1.2rem',
    fontFamily: 'var(--font-family-main)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>⚡</div>
      <div>Chargement TITANE∞...</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY COMPONENT
// ═══════════════════════════════════════════════════════════════

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'var(--color-error)',
    fontSize: '1.2rem',
    padding: '2rem',
    textAlign: 'center'
  }}>
    <div>
      <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>⚠️</div>
      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Erreur de chargement</div>
      {error && <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.message}</div>}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// WRAPPER COMPONENT WITH LAYOUT
// ═══════════════════════════════════════════════════════════════

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const currentRoute = window.location.pathname;

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onOpenExpPanel={() => {}}
    >
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </AppLayout>
  );
};

// ═══════════════════════════════════════════════════════════════
// ROUTE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWrapper><Dashboard /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/chat',
    element: <LayoutWrapper><Chat /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/helios',
    element: <LayoutWrapper><Helios /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/nexus',
    element: <LayoutWrapper><Nexus /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/harmonia',
    element: <LayoutWrapper><Harmonia /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/sentinel',
    element: <LayoutWrapper><Sentinel /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/watchdog',
    element: <LayoutWrapper><Watchdog /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/selfheal',
    element: <LayoutWrapper><SelfHeal /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/adaptive',
    element: <LayoutWrapper><AdaptiveEngine /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/memory',
    element: <LayoutWrapper><Memory /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/settings',
    element: <LayoutWrapper><Settings /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/devtools',
    element: <LayoutWrapper><DevTools /></LayoutWrapper>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

// ═══════════════════════════════════════════════════════════════
// ROUTER PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════

export const TitaneRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT DEFAULT ROUTER
// ═══════════════════════════════════════════════════════════════

export default router;
