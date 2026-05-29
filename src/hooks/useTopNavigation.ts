import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopNavItems } from '@components/layout';

// Gate 11: navMode annotation added. SIMULATED routes removed from matchRoutes per rule SIM-03.
// /orchestration-intelligence and /quantum-center are SIMULATED_UI — must not highlight any nav item.
const TOP_NAV_SECTIONS = [
  // ═══ DAILY ═══
  {
    id: 'titane',
    label: 'TITANE',
    route: '/titane',
    description: 'Le Cœur du Système',
    navMode: 'DAILY' as const,
    matchRoutes: [
      '/experience',
      '/memory',
      '/research',
      '/skills',
      '/knowledge',
      '/creation',
      '/evolution',
    ],
  },
  { id: 'time', label: 'TIME', route: '/time', description: 'Centre Temporel', navMode: 'DAILY' as const },
  // ═══ SYSTEM ═══
  { id: 'admin', label: 'ADMIN', route: '/admin', description: 'Centre Admin Unifié', navMode: 'SYSTEM' as const },
  // ═══ DEV ═══
  {
    id: 'dev',
    label: 'DEV',
    route: '/dev',
    description: 'Centre DEV Unifié',
    navMode: 'DEV' as const,
    matchRoutes: [
      '/orchestration-center',
      // /orchestration-intelligence removed: SIMULATED_UI — must not highlight nav (SIM-03)
      '/singularity',
      '/sentinel',
      '/watchdog',
      '/selfheal',
      '/adaptive',
    ],
  },
  // ═══ SYSTEM — "Plus" menu ═══
  {
    id: 'fusion',
    label: 'FUSION',
    route: '/fusion',
    description: 'Backend/Frontend Fusion',
    navMode: 'SYSTEM' as const,
    matchRoutes: [
      '/reality-center',
      '/hyper-center',
      // /quantum-center removed: SIMULATED_UI — must not highlight nav (SIM-03)
      '/cloud',
    ],
  },
  // ═══ DAILY — "Plus" menu ═══
  {
    id: 'projects',
    label: 'PROJECTS',
    route: '/multiproject',
    description: 'Pilotage multi-projets',
    navMode: 'DAILY' as const,
  },
  {
    id: 'twins',
    label: 'TWINS',
    route: '/twins',
    description: 'Jumeau numerique dedie',
    navMode: 'DAILY' as const,
    matchRoutes: ['/identity-center', '/identity', '/persona', '/twin'],
  },
  // ═══ SYSTEM ═══
  {
    id: 'optimization',
    label: 'OPTIMIZE',
    route: '/optimization',
    description: 'Performance Ultime',
    navMode: 'SYSTEM' as const,
    matchRoutes: ['/performance'],
  },
  // ═══ DEV (restricted, "Plus" menu) ═══
  {
    id: 'total-dev',
    label: 'TOTAL DEV',
    route: '/total-dev',
    description: 'Espace DEV souverain TITANE∞ — accès restreint',
    navMode: 'DEV' as const,
  },
];

export function useTopNavigation() {
  const navigate = useNavigate();

  const topNavSections = useMemo(() => TOP_NAV_SECTIONS, []);
  const topNavItems = useMemo(() => createTopNavItems(topNavSections), [topNavSections]);
  const handleNavigate = useCallback((route: string) => navigate(route), [navigate]);

  return { topNavSections, topNavItems, handleNavigate };
}
