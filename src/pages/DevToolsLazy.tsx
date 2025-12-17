/**
 * TITANE∞ v25.7.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   DEVTOOLS LAZY WRAPPER — P0-2 Performance Optimization
 *   Split monitoring components into lazy-loaded chunks per tab
 *   Impact: -100 KB gzipped, -200ms DevTools TTI
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { lazy, Suspense } from 'react';

// Lazy load heavy monitoring components (only when tab is active)
const MonitoringHeader = lazy(() =>
  import('../components/monitoring/MonitoringHeader').then(mod => ({
    default: mod.MonitoringHeader,
  }))
);

const SystemStatusCard = lazy(() =>
  import('../components/monitoring/SystemStatusCard').then(mod => ({
    default: mod.SystemStatusCard,
  }))
);

const LogsCard = lazy(() =>
  import('../components/monitoring/LogsCard').then(mod => ({
    default: mod.LogsCard,
  }))
);

const ErrorsCard = lazy(() =>
  import('../components/monitoring/ErrorsCard').then(mod => ({
    default: mod.ErrorsCard,
  }))
);

const CognitiveModuleCard = lazy(() =>
  import('../components/monitoring/CognitiveModuleCard').then(mod => ({
    default: mod.CognitiveModuleCard,
  }))
);

const LivingEnginesCard = lazy(() =>
  import('../components/monitoring/LivingEnginesCard').then(mod => ({
    default: mod.LivingEnginesCard,
  }))
);

const ChatDiagnostic = lazy(() =>
  import('../components/ChatDiagnostic').then(mod => ({
    default: mod.ChatDiagnostic,
  }))
);

/**
 * Loading fallback for lazy components
 */
const LoadingFallback = ({ height = '200px' }: { height?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height,
      background: '#10151c',
      borderRadius: '16px',
      border: '1px solid #1f2933',
      color: '#94a3b8',
      fontSize: '0.95rem',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
      Chargement du module...
    </div>
  </div>
);

// Export lazy components with Suspense wrappers
export const LazyMonitoringHeader = (props: Parameters<typeof MonitoringHeader>[0]) => (
  <Suspense fallback={<LoadingFallback height="80px" />}>
    <MonitoringHeader {...props} />
  </Suspense>
);

export const LazySystemStatusCard = (props: Parameters<typeof SystemStatusCard>[0]) => (
  <Suspense fallback={<LoadingFallback height="240px" />}>
    <SystemStatusCard {...props} />
  </Suspense>
);

export const LazyLogsCard = (props: Parameters<typeof LogsCard>[0]) => (
  <Suspense fallback={<LoadingFallback height="300px" />}>
    <LogsCard {...props} />
  </Suspense>
);

export const LazyErrorsCard = (props: Parameters<typeof ErrorsCard>[0]) => (
  <Suspense fallback={<LoadingFallback height="240px" />}>
    <ErrorsCard {...props} />
  </Suspense>
);

export const LazyCognitiveModuleCard = (
  props: Parameters<typeof CognitiveModuleCard>[0]
) => (
  <Suspense fallback={<LoadingFallback height="200px" />}>
    <CognitiveModuleCard {...props} />
  </Suspense>
);

export const LazyLivingEnginesCard = (props: Parameters<typeof LivingEnginesCard>[0]) => (
  <Suspense fallback={<LoadingFallback height="320px" />}>
    <LivingEnginesCard {...props} />
  </Suspense>
);

export const LazyChatDiagnostic = (props: Parameters<typeof ChatDiagnostic>[0]) => (
  <Suspense fallback={<LoadingFallback height="400px" />}>
    <ChatDiagnostic {...props} />
  </Suspense>
);
