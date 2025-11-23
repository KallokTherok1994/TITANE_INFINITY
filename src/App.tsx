/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v17.2.0 — APP COMPONENT + MODULAR ARCHITECTURE
 *   100% TAURI NATIVE - NO HTTP SERVER MODE
 *   Backend v17.2.0: Plugin System + DevTools + Cognitive Engine
 *   React Router v7 + AppShell + 23 Tauri Commands API
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLivingEngines } from './hooks';
import { ThemeProvider } from './themes';
import { AppShell, Sidebar, Header } from '@components/layout';
import { Button } from './ui';
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';

// 🔒 VERROU ANTI-HTTP - Bloquer chargement si contexte HTTP détecté
if (typeof window !== 'undefined' && window.location.origin.includes('http')) {
  const isTauriContext = '__TAURI__' in window;
  if (!isTauriContext) {
    console.error('🔒 TITANE∞ - MODE TAURI EXCLUSIF');
    console.error('❌ Détection contexte HTTP interdite:', window.location.origin);
    console.error('✅ Utilisez: pnpm run build && tauri dev');
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#ff4444;font-family:monospace;flex-direction:column;padding:2rem;text-align:center;">
        <h1 style="font-size:3rem;margin-bottom:1rem;">🔒 MODE TAURI EXCLUSIF</h1>
        <p style="font-size:1.5rem;margin-bottom:2rem;">TITANE∞ v17.2.0 fonctionne UNIQUEMENT en mode Tauri Native</p>
        <p style="font-size:1.2rem;color:#888;">Contexte HTTP détecté: ${window.location.origin}</p>
        <p style="font-size:1.2rem;color:#00ff88;margin-top:2rem;">✅ Commande correcte:</p>
        <code style="font-size:1.5rem;background:#1a1a1a;padding:1rem 2rem;border-radius:8px;margin-top:1rem;">pnpm run build && tauri dev</code>
      </div>
    `;
    throw new Error('TITANE∞ - HTTP context blocked. Use Tauri Native mode only.');
  }
}

// New v17.1 pages
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { CognitivePage } from './pages/CognitivePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { DesignSystemPage } from './pages/DesignSystemPage';

// v14: SingularityState Monitor
import { SingularityMonitor } from './components/SingularityMonitor';

// Engine & System pages
import {
  Helios,
  Nexus,
  Harmonia,
  Sentinel,
  Watchdog,
  SelfHeal,
  AdaptiveEngine,
  Memory,
  Settings,
  DevTools,
} from './pages';

// Performance Test Page
import { PerformanceTest } from './pages/PerformanceTest';

/**
 * ═══════════════════════════════════════════════════════════════
 * APP ROUTER - Composant interne avec accès au router + Living Engines
 * ═══════════════════════════════════════════════════════════════
 */
const AppRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 🌟 Initialize Living Engines v21-v24
  const livingEngines = useLivingEngines(100); // Update every 100ms

  // Log living state (debug)
  useEffect(() => {
    if (livingEngines.state.initialized) {
      console.log('🎭 Persona:', livingEngines.state.persona?.mood.current);
      console.log('⚡ Glow:', livingEngines.state.glow.toFixed(2));
      console.log('🧠 Cognitive Load:', livingEngines.state.cognitiveLoad.toFixed(2));
    }
  }, [livingEngines.state.initialized, livingEngines.state.persona]);

  // Sidebar items configuration
  const sidebarItems = [
    { id: '/', label: 'Tableau de bord', icon: '📊' },
    { id: '/chat', label: 'Chat IA', icon: '💬', badge: 'v17.1' },
    { id: '/cognitive', label: 'État Cognitif', icon: '🧠' },
    { id: '/progression', label: 'Progression', icon: '⚡', badge: 'NEW' },
    { id: '/design-system', label: 'Design System', icon: '🎨', badge: 'v17.1' },
    { id: '/helios', label: 'Helios', icon: '☀️' },
    { id: '/nexus', label: 'Nexus', icon: '🔗' },
    { id: '/harmonia', label: 'Harmonia', icon: '🎵' },
    { id: '/memory', label: 'Memory', icon: '💾' },
    { id: '/settings', label: 'Paramètres', icon: '⚙️' },
    { id: '/devtools', label: 'DevTools', icon: '🔧' },
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={sidebarItems.map(item => ({
            ...item,
            active: item.id === location.pathname
          }))}
          onItemClick={(item) => { navigate(item.id); }}
          collapsed={sidebarCollapsed}
        />
      }
      header={
        <Header
          title="TITANE∞"
          subtitle="v17.2.1 - Backend Refactor Complete"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSidebarCollapsed(!sidebarCollapsed); }}
              leftIcon={sidebarCollapsed ? '→' : '←'}
            >
              {sidebarCollapsed ? 'Ouvrir' : 'Fermer'}
            </Button>
          }
        />
      }
      sidebarCollapsed={sidebarCollapsed}
    >
      <Routes>
        {/* Main Routes v17.2+ */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/cognitive" element={<CognitivePage />} />
        <Route path="/progression" element={<ProgressionPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* v14: SingularityState Monitor */}
        <Route path="/singularity" element={<SingularityMonitor />} />

        {/* Engine Routes */}
        <Route path="/helios" element={<Helios />} />
        <Route path="/nexus" element={<Nexus />} />
        <Route path="/harmonia" element={<Harmonia />} />
        <Route path="/sentinel" element={<Sentinel />} />
        <Route path="/watchdog" element={<Watchdog />} />
        <Route path="/selfheal" element={<SelfHeal />} />
        <Route path="/adaptive" element={<AdaptiveEngine />} />
        <Route path="/memory" element={<Memory />} />

        {/* System Routes */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/devtools" element={<DevTools />} />
        <Route path="/performance" element={<PerformanceTest />} />

        {/* Catch-all - Redirection vers Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * APP COMPONENT - Point d'entrée principal avec Auto-Heal
 * ThemeProvider > BrowserRouter > AutoHealErrorBoundary
 * ═══════════════════════════════════════════════════════════════
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AutoHealErrorBoundary>
          <AppRouter />
        </AutoHealErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
