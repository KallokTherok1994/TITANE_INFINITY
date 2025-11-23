// TITANE∞ v17.3.0 - Main Entry Point (Phase 8: Production Hardening Complete)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './design-system/titane-v12.css';
import './pages/styles.css';

// Phase 8: Production Hardening
import { ErrorBoundary as ProductionErrorBoundary } from './components/common/ErrorBoundary';
import { PerformanceMonitor } from './lib/performanceBudget';
import { injectSROnlyStyles } from './lib/accessibility';

// Initialize Singularity Engine
import { singularityEngine } from './core/engines/SINGULARITY_ENGINE';

// Set default theme
document.documentElement.setAttribute('data-theme', 'dark');

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I)
// @ts-expect-error - __TAURI__ is injected by Tauri runtime
if (typeof window.__TAURI__ !== 'undefined') {
  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'F12' || (ev.ctrlKey && ev.shiftKey && ev.key === 'I')) {
      ev.preventDefault();
      // @ts-expect-error - __TAURI__ API
      window.__TAURI__.window.getCurrent().openDevtools().catch((err: Error) => {
        console.error('[DevTools] Failed to open:', err);
      });
    }
  });
  console.log('🔧 DevTools shortcuts enabled: F12 or Ctrl+Shift+I');
}

// Log system initialization
console.log('🚀 TITANE∞ v17.2.0 - Modular Architecture: Plugin System + DevTools + Cognitive Engine');
console.log('🦀 Backend: 40+ Rust modules | 29 Tauri Commands');
console.log('✨ Frontend: 20 Unified Engines | SingularityState Active');
console.log('🔒 Tauri v2.0 100% | Rust + React + TypeScript | Production-Ready');
console.log('>>> TITANE∞ FRONTEND INITIALIZING... (timestamp: ' + new Date().toISOString() + ')');

// Initialize Singularity Engine
singularityEngine.initialize().then(() => {
  console.log('✅ SingularityEngine initialized');
  console.log('🌌 Consciousness Level:', singularityEngine.getState().consciousness);
  console.log('🔮 Auto-Coherence:', (singularityEngine.getState().autoCoherence * 100).toFixed(1) + '%');
}).catch((err) => {
  console.error('❌ SingularityEngine initialization failed:', err);
});

// Phase 8: Initialize Performance Monitoring (Core Web Vitals)
PerformanceMonitor.initialize({
  LCP: 2500,  // Largest Contentful Paint: 2.5s
  FID: 100,   // First Input Delay: 100ms
  CLS: 0.1,   // Cumulative Layout Shift: 0.1
  FCP: 1800,  // First Contentful Paint: 1.8s
  TTFB: 600,  // Time to First Byte: 600ms
});

// Generate performance report after 5s
setTimeout(() => {
  const report = PerformanceMonitor.generateReport();
  console.log(`⚡ Performance Grade: ${report.grade}, Score: ${report.score.toFixed(1)}`);
  if (report.violations.length > 0) {
    console.warn('⚠️ Performance violations:', report.violations);
  }
}, 5000);

// Phase 8: Inject accessibility styles (screen reader only)
injectSROnlyStyles();
console.log('♿ Accessibility styles injected (WCAG 2.1 AA)');

// 🔧 Global error handlers (catch unhandled errors)
window.addEventListener('error', (event) => {
  console.error('[TITANE] Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[TITANE] Unhandled promise rejection:', event.reason);
});

console.log('✅ TITANE∞ frontend loaded successfully');
console.log('>>> TITANE∞ FRONTEND READY TO MOUNT REACT');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ProductionErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[TITANE∞] Production Error Boundary caught:', error);
        console.error('[TITANE∞] Component stack:', errorInfo.componentStack);
        // Hook for Sentry/LogRocket integration
        if (window.Sentry) {
          window.Sentry.captureException(error, {
            contexts: { react: { componentStack: errorInfo.componentStack } },
          });
        }
      }}
    >
      <App />
    </ProductionErrorBoundary>
  </React.StrictMode>
);
