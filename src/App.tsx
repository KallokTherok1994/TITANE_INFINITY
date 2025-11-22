/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — APP COMPONENT + LIVING ENGINES
 *   Backend v17.2.0 + 13 Living Engines (v21-v24)
 *   React Router v7 + AppShell + Auto-Heal + Persona Engine
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLivingEngines } from './hooks';
import { ThemeProvider } from './themes';
import { AppShell, Sidebar, Header } from '@components/layout';
import { Button } from './ui';
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';

// New v17.1 pages
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { CognitivePage } from './pages/CognitivePage';
import { ProgressionPage } from './pages/ProgressionPage';
import { DesignSystemPage } from './pages/DesignSystemPage';

// Legacy pages (kept for compatibility)
import {
  Dashboard,
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
        {/* New v17.1 Routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/cognitive" element={<CognitivePage />} />
        <Route path="/progression" element={<ProgressionPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* Legacy routes (kept for compatibility) */}
        <Route path="/dashboard-legacy" element={<Dashboard />} />
        <Route path="/helios" element={<Helios />} />
        <Route path="/nexus" element={<Nexus />} />
        <Route path="/harmonia" element={<Harmonia />} />
        <Route path="/sentinel" element={<Sentinel />} />
        <Route path="/watchdog" element={<Watchdog />} />
        <Route path="/selfheal" element={<SelfHeal />} />
        <Route path="/adaptive" element={<AdaptiveEngine />} />
        <Route path="/memory" element={<Memory />} />
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
