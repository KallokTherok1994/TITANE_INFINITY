/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v17.2.0 — APP COMPONENT + MODULAR ARCHITECTURE
 *   100% TAURI NATIVE - NO HTTP SERVER MODE
 *   Backend v17.2.0: Plugin System + DevTools + Cognitive Engine
 *   React Router v7 + AppShell + 23 Tauri Commands API
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLivingEngines } from './hooks';
import { useSingularityState } from './core/state/SingularityState';
import { ThemeProvider } from './themes';
import { AppShell, Sidebar, Header } from '@components/layout';
import { Button } from './ui';
import { CompactXPBar } from './components/experience/CompactXPBar';
import { XPBar } from './components/experience/XPBar'; // ✨ v∞.D4 - Barre XP
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';
import { detectEnvironment, shouldBlockLoading, logEnvironmentWarnings } from './core/tauri/environment';

/**
 * 🔒 POLITIQUE DE SÉCURITÉ ENVIRONNEMENT
 *
 * Mode DEV (import.meta.env.DEV === true):
 *   - ✅ Tauri dev: Autorisé (http://127.0.0.1:xxxx avec __TAURI__)
 *   - ✅ Browser dev: Autorisé (http://localhost:5173 pour Vite HMR)
 *   - Logs: Warning console si pas Tauri, mais n'empêche PAS le rendu
 *
 * Mode PROD (import.meta.env.DEV === false):
 *   - ✅ Tauri prod: Autorisé (tauri://localhost)
 *   - ⚠️ Browser prod: Affiche warning UI non-bloquant
 *   - Note: Pas de throw ni document.body.innerHTML qui cassent React
 */
if (typeof window !== 'undefined') {
  const env = detectEnvironment();

  // Log environnement (toujours utile, pas bloquant)
  logEnvironmentWarnings();

  // En dev: JAMAIS bloquer (autoriser Vite HMR + Tauri dev)
  // En prod browser: Afficher warning dans l'UI via composant, pas via document.body
  if (shouldBlockLoading()) {
    console.warn('⚠️ TITANE∞ - Contexte browser production détecté');
    console.warn('   Origine:', env.origin);
    console.warn('   Recommandation: Utiliser build Tauri natif');
    // Note: Le warning sera affiché dans l'UI via un composant dédié si nécessaire,
    // mais on ne bloque plus le rendu React pour permettre l'affichage
  }
}

// New v17.1 pages
import { DashboardPage } from './pages/DashboardPage';
// CORRECTION v19.1.0: Utiliser la vraie page Chat avec useChat() au lieu du mock setTimeout
import { Chat as ChatPage } from './ui/pages/Chat';
import { CognitivePage } from './pages/CognitivePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { Experience } from './pages/Experience'; // ✨ v∞.D5 - Page XP

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

  // Use Singularity State instead of local state
  const sidebarCollapsed = useSingularityState((s) => s.context.sidebarCollapsed);
  const toggleSidebar = useSingularityState((s) => s.toggleSidebar);

  // 🌟 Initialize Living Engines v21-v24
  const livingEngines = useLivingEngines(100); // Update every 100ms

  // Log living state (debug) - effet optimisé avec dépendances stables
  useEffect(() => {
    if (!livingEngines.state.initialized) return;

    console.log('🎭 Persona:', livingEngines.state.persona?.mood.current);
    console.log('⚡ Glow:', livingEngines.state.glow.toFixed(2));
    console.log('🧠 Cognitive Load:', livingEngines.state.cognitiveLoad.toFixed(2));
    // Note: Cet effet log uniquement à l'initialisation, pas à chaque update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livingEngines.state.initialized]);

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
          header={
            <>
              {/* Logo TITANE∞ */}
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #727b81, #93b399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                TITANE∞
              </div>
              {/* Compact XP Bar */}
              {!sidebarCollapsed && (
                <CompactXPBar onClick={() => { navigate('/progression'); }} />
              )}
            </>
          }
        />
      }
      header={
        <Header
          title="TITANE∞"
          subtitle={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span>v17.2.1 - Backend Refactor Complete</span>
              <XPBar /> {/* ✨ v∞.D4 - Barre XP */}
            </div>
          }
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
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
        <Route path="/experience" element={<Experience />} /> {/* ✨ v∞.D5 - Page XP */}
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
