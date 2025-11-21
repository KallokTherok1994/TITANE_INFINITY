/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v17.0.0 — APP COMPONENT OPTIMISÉ
 *   WebKit Fix + Clean-Up Engine + Tauri-Only 100%
 *   React Router v7 + AppLayout + Auto-Heal Error Boundary
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AppLayout } from './ui/AppLayout';
import { ExpPanel } from './components/experience/ExpPanel';
import { Chat } from './ui/pages/Chat';
import { AutoHealErrorBoundary } from './components/AutoHealErrorBoundary';
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

/**
 * ═══════════════════════════════════════════════════════════════
 * APP ROUTER - Composant interne avec accès au router
 * ═══════════════════════════════════════════════════════════════
 */
const AppRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expPanelOpen, setExpPanelOpen] = React.useState(false);

  // Navigation handler - utilise navigate de React Router
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <AppLayout
        currentRoute={location.pathname}
        onNavigate={handleNavigate}
        onOpenExpPanel={() => setExpPanelOpen(true)}
      >
        <Routes>
          {/* Route principale - Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Route Chat IA v16 */}
          <Route path="/chat" element={<Chat />} />
          
          {/* Routes des modules système */}
          <Route path="/helios" element={<Helios />} />
          <Route path="/nexus" element={<Nexus />} />
          <Route path="/harmonia" element={<Harmonia />} />
          <Route path="/sentinel" element={<Sentinel />} />
          <Route path="/watchdog" element={<Watchdog />} />
          <Route path="/selfheal" element={<SelfHeal />} />
          <Route path="/adaptive" element={<AdaptiveEngine />} />
          <Route path="/memory" element={<Memory />} />
          
          {/* Routes configuration et développement */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/devtools" element={<DevTools />} />
          
          {/* Catch-all - Redirection vers Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>

      {/* Panneau EXP (modal overlay via Portal) */}
      {expPanelOpen && createPortal(
        <ExpPanel onClose={() => setExpPanelOpen(false)} />,
        document.body
      )}
    </>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * APP COMPONENT - Point d'entrée principal avec Auto-Heal
 * BrowserRouter AVANT AutoHealErrorBoundary pour stabilité
 * ═══════════════════════════════════════════════════════════════
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AutoHealErrorBoundary>
        <AppRouter />
      </AutoHealErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
