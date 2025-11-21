// TITANE∞ v15.6.0 - App Component with AppLayout + Menu + Router + EXP System
import { useState, useEffect } from 'react';
import { AppLayout } from './ui/AppLayout';
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
import { ExpPanel } from './components/experience/ExpPanel';

// Route definitions
interface Route {
  path: string;
  component: JSX.Element;
  title: string;
  subtitle?: string;
}

const routes: Route[] = [
  { path: '/', component: <Dashboard />, title: 'Dashboard', subtitle: 'Vue d\'ensemble du système' },
  { path: '/helios', component: <Helios />, title: 'Helios', subtitle: 'Système vital et métriques' },
  { path: '/nexus', component: <Nexus />, title: 'Nexus', subtitle: 'Réseau cognitif' },
  { path: '/harmonia', component: <Harmonia />, title: 'Harmonia', subtitle: 'Équilibre des flux' },
  { path: '/sentinel', component: <Sentinel />, title: 'Sentinel', subtitle: 'Gardien de l\'intégrité' },
  { path: '/watchdog', component: <Watchdog />, title: 'Watchdog', subtitle: 'Surveillance temps réel' },
  { path: '/selfheal', component: <SelfHeal />, title: 'SelfHeal', subtitle: 'Auto-réparation' },
  { path: '/adaptive', component: <AdaptiveEngine />, title: 'Adaptive Engine', subtitle: 'Optimisation dynamique' },
  { path: '/memory', component: <Memory />, title: 'Memory', subtitle: 'Mémoire chiffrée AES-256-GCM' },
  { path: '/settings', component: <Settings />, title: 'Settings', subtitle: 'Configuration système' },
  { path: '/devtools', component: <DevTools />, title: 'DevTools', subtitle: 'Outils de développement' },
];

function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [expPanelOpen, setExpPanelOpen] = useState(false);

  // Simple client-side routing
  const handleNavigate = (path: string) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    // Handle browser back/forward
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Find current route or default to dashboard
  const activeRoute = routes.find((route) => route.path === currentRoute) || routes[0];

  return (
    <>
      {/* Layout AppLayout v15.6 avec GlobalExpBar intégrée */}
      <AppLayout 
        currentRoute={currentRoute} 
        onNavigate={handleNavigate}
        onOpenExpPanel={() => setExpPanelOpen(true)}
      >
        {activeRoute?.component || <Dashboard />}
      </AppLayout>

      {/* Panneau EXP (modal overlay) */}
      {expPanelOpen && <ExpPanel onClose={() => setExpPanelOpen(false)} />}
    </>
  );
}

export default App;
