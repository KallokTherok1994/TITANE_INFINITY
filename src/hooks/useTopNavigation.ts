import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopNavItems } from '@components/layout';

const TOP_NAV_SECTIONS = [
  // ═══ PRINCIPAL ═══
  { id: 'titane', label: 'TITANE', route: '/titane', description: 'Le Cœur du Système' },
  { id: 'time', label: 'TIME', route: '/time', description: 'Centre Temporel' },
  { id: 'admin', label: 'ADMIN', route: '/admin', description: 'Centre Admin Unifié' },
  { id: 'dev', label: 'DEV', route: '/dev', description: 'Centre DEV Unifié' },
  // Dans menu "Plus"
  {
    id: 'fusion',
    label: 'FUSION',
    route: '/fusion',
    description: 'Backend/Frontend Fusion',
  },
  {
    id: 'optimization',
    label: 'OPTIMIZE',
    route: '/optimization',
    description: 'Performance Ultime',
  },
  {
    id: 'total-dev',
    label: 'TOTAL DEV',
    route: '/total-dev',
    description: 'Espace DEV souverain TITANE∞ — accès restreint',
  },
];

export function useTopNavigation() {
  const navigate = useNavigate();

  const topNavSections = useMemo(() => TOP_NAV_SECTIONS, []);
  const topNavItems = useMemo(() => createTopNavItems(topNavSections), [topNavSections]);
  const handleNavigate = useCallback((route: string) => navigate(route), [navigate]);

  return { topNavSections, topNavItems, handleNavigate };
}
