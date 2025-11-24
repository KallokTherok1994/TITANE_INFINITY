/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v24.0.0 - Main Entry Point (Design System Unifié Métallique)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/titane-design-system-v24.css'; // 🔩 Design System v24 : Métallique Unifié
import './pages/styles.css';

// Phase 8: Production Hardening
import { ErrorBoundary as ProductionErrorBoundary } from './components/common/ErrorBoundary';
import { PerformanceMonitor } from './lib/performanceBudget';
import { injectSROnlyStyles } from './lib/accessibility';

// Initialize Singularity Engine
import { singularityEngine } from './core/engines/SINGULARITY_ENGINE';

// 🌟 v14: Initialize SingularityBridge (Backend Rust ↔ Frontend React)
import { SingularityBridge } from './services/singularityBridge';
import { SingularityConnections } from './services/singularityConnections';

// Set default theme
document.documentElement.setAttribute('data-theme', 'dark');

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I)
if (typeof window.__TAURI__ !== 'undefined') {
  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'F12' || (ev.ctrlKey && ev.shiftKey && ev.key === 'I')) {
      ev.preventDefault();
      window.__TAURI__.window.getCurrent().openDevtools().catch((err: Error) => {
        console.error('[DevTools] Failed to open:', err);
      });
    }
  });
  console.log('🔧 DevTools shortcuts enabled: F12 or Ctrl+Shift+I');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 BOOT SEQUENCE START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🌌 TITANE∞ v17.3 - BOOT SEQUENCE                             ║');
console.log('║  Timestamp: ' + new Date().toISOString() + '                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
console.log('[1/5] 🦀 Backend: 40+ Rust modules | 29 Tauri Commands');
console.log('[2/5] ✨ Frontend: 20 Unified Engines | SingularityState Active');
console.log('[3/5] 🔒 Tauri v2.0 100% | Rust + React + TypeScript');
console.log('[4/5] 📦 Loading React 18 + TypeScript 5...');
console.log('[5/5] 🎯 Mounting root component...');

// Initialize Singularity Engine
singularityEngine.initialize().then(() => {
  console.log('✅ SingularityEngine initialized');
  console.log('🌌 Consciousness Level:', singularityEngine.getState().consciousness);
  console.log('🔮 Auto-Coherence:', (singularityEngine.getState().autoCoherence * 100).toFixed(1) + '%');
}).catch((err) => {
  console.error('❌ SingularityEngine initialization failed:', err);
});

// 🌟 v14: Initialize SingularityBridge (Backend State Sync)
SingularityBridge.initialize().then(() => {
  console.log('✅ SingularityBridge initialized (Rust ↔ React sync active)');

  // Log initial state
  SingularityBridge.getGlobalCoherence().then((coherence) => {
    console.log('🔗 Backend Coherence:', (coherence * 100).toFixed(1) + '%');
  });

  SingularityBridge.isCritical().then((critical) => {
    if (critical) {
      console.warn('⚠️  System in CRITICAL state!');
    } else {
      console.log('✅ System health: Normal');
    }
  });

  // 🔗 v14: Start subsystem connections (Helios, Memory, Persona, AutoHeal, UI)
  SingularityConnections.start(5000).then(() => {
    console.log('🔗 SingularityConnections started (5s polling)');
    console.log('   → Helios → PhysicalLayer');
    console.log('   → Memory → CognitiveLayer');
    console.log('   → Persona → SymbolicLayer');
    console.log('   → AutoHeal → AdaptiveLayer');
    console.log('   → UI Router → MetaLayer');
  }).catch((err) => {
    console.error('❌ SingularityConnections failed:', err);
  });
}).catch((err) => {
  console.error('❌ SingularityBridge initialization failed:', err);
  console.error('   → Backend state sync disabled, frontend-only mode active');
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
console.log('>>> MOUNTING REACT ROOT NOW...\n');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 REACT ROOT MOUNT - Point critique d'affichage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = '❌ CRITICAL: #root element not found in DOM!';
  console.error(errorMsg);

  // Fallback visuel si #root manque
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0a0a0a;
      color: #ff4444;
      font-family: monospace;
      padding: 2rem;
      text-align: center;
    ">
      <div>
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ TITANE∞ Boot Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">${errorMsg}</p>
        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 8px; text-align: left; overflow: auto;">${document.documentElement.outerHTML}</pre>
      </div>
    </div>
  `;
  throw new Error(errorMsg);
}

console.log('✅ Root element found:', rootElement);
console.log('🎨 Starting React 18 render...');

try {
  // Option 1: Utiliser App complet (production)
  const AppComponent = App;

  // Option 2: Pour débugger l'écran blanc, remplacer par AppMinimal:
  // import AppMinimal from './AppMinimal';
  // const AppComponent = AppMinimal;

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
        <AppComponent />
      </ProductionErrorBoundary>
    </React.StrictMode>
  );

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ TITANE∞ REACT ROOT MOUNTED SUCCESSFULLY                   ║');
  console.log('║  Component:', AppComponent.name || 'App');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
} catch (error) {
  console.error('❌ CRITICAL: React mount failed:', error);

  // Fallback visuel en cas d'erreur React
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';

  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a0a;
      color: #ff4444;
      font-family: monospace;
      padding: 2rem;
      text-align: center;
    ">
      <div style="max-width: 800px;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ TITANE∞ React Mount Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #ff8888;">${errorMsg}</p>
        <details style="text-align: left; background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <summary style="cursor: pointer; color: #888; margin-bottom: 0.5rem;">Stack Trace</summary>
          <pre style="font-size: 0.75rem; color: #aaa; overflow: auto;">${errorStack}</pre>
        </details>
        <p style="color: #888; font-size: 0.875rem;">Appuyez sur F12 pour ouvrir la console DevTools</p>
        <button
          onclick="window.location.reload()"
          style="
            margin-top: 1rem;
            background: #6366f1;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          "
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  `;
  throw error;
}
