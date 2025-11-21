/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.6 — APP COMPONENT MODERNE
 *   React Router v7 + AppLayout + Type Safety
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './ui/AppLayout';
import { ExpPanel } from './components/experience/ExpPanel';
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
 * APP COMPONENT - Point d'entrée principal
 * ═══════════════════════════════════════════════════════════════
 */

const App: React.FC = () => {
  const [expPanelOpen, setExpPanelOpen] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState(window.location.pathname);

  // Navigation handler
  const handleNavigate = (path: string) => {
    setCurrentRoute(path);
  };

  // Sync current route with location
  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <BrowserRouter>
      <AppLayout
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenExpPanel={() => setExpPanelOpen(true)}
      >
        <Routes>
          {/* Route principale - Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
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

      {/* Panneau EXP (modal overlay) */}
      {expPanelOpen && (
        <ExpPanel onClose={() => setExpPanelOpen(false)} />
      )}
    </BrowserRouter>
  );
};

export default App;
