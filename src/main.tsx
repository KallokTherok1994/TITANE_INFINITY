// TITANE∞ v17.2.0 - Main Entry Point (Modular Architecture Complete)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './design-system/titane-v12.css';
import './pages/styles.css';

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

// 🔧 Global error handlers (catch unhandled errors)
window.addEventListener('error', (event) => {
  console.error('[TITANE] Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[TITANE] Unhandled promise rejection:', event.reason);
});

console.log('✅ TITANE∞ frontend loaded successfully');
console.log('>>> TITANE∞ FRONTEND READY TO MOUNT REACT');

// ⚠️ FIX CRASH: Wrapper d'erreur React global
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[TITANE] React Error Boundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[TITANE] Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0a0e1a',
          color: '#fff',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <h1>⚠️ TITANE∞ Error</h1>
          <p>Une erreur s'est produite lors du chargement de l'application.</p>
          <pre style={{
            backgroundColor: '#1a1f2e',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '80%',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4a90e2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recharger l'application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
