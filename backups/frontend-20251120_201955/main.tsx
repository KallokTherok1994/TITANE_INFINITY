// TITANE∞ v15.5 - Main Entry Point with Evolution Supervisor
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './design-system/titane-v12.css';
import './pages/styles.css';

// Set default theme
document.documentElement.setAttribute('data-theme', 'dark');

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I)
// @ts-ignore - __TAURI__ is injected by Tauri runtime
if (typeof window.__TAURI__ !== 'undefined') {
  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'F12' || (ev.ctrlKey && ev.shiftKey && ev.key === 'I')) {
      ev.preventDefault();
      // @ts-ignore - __TAURI__ API
      window.__TAURI__.window.getCurrent().openDevtools().catch((err: Error) => {
        console.error('[DevTools] Failed to open:', err);
      });
    }
  });
  console.log('🔧 DevTools shortcuts enabled: F12 or Ctrl+Shift+I');
}

// Log system initialization
console.log('🚀 TITANE∞ v15.5.0 - UI/UX Fusion Engine + Evolution Supervisor');
console.log('✅ Frontend Build: 1.08s | Backend Binary: 8.0MB');
console.log('🧬 Evolution Supervisor: Active | API Commands: 15');

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
