/**
 * TITANE_INFINITY v34.3.0 — Command Palette catalog (routes / agents / safe IPC actions).
 *
 * Curated list of user-visible navigation targets. Mapping authoritative to
 * `src/App.tsx` <Route> definitions. Kept static so the palette has zero
 * runtime cost outside of the open frame.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Sparkles,
  Clock,
  Settings,
  Wrench,
  BookOpen,
  Palette,
  TrendingUp,
  ShieldAlert,
  Brain,
  Search as SearchIcon,
  Wand2,
} from 'lucide-react';

export interface PaletteRoute {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string;
}

export const PALETTE_ROUTES: ReadonlyArray<PaletteRoute> = [
  {
    id: 'route-titane',
    label: 'TITANE — Accueil / Chat',
    to: '/titane',
    icon: Home,
    keywords: 'home accueil chat conversation',
  },
  {
    id: 'route-experience',
    label: 'Experience XP',
    to: '/experience',
    icon: Sparkles,
    keywords: 'xp progression niveau',
  },
  {
    id: 'route-time',
    label: 'Temporal Center',
    to: '/time',
    icon: Clock,
    keywords: 'agenda time temporal calendar',
  },
  {
    id: 'route-admin',
    label: 'Configuration Hub',
    to: '/admin',
    icon: Settings,
    keywords: 'admin config settings réglages',
  },
  {
    id: 'route-dev',
    label: 'Dev Center',
    to: '/dev',
    icon: Wrench,
    keywords: 'developer outils tooling diagnostics',
  },
  {
    id: 'route-knowledge',
    label: 'Knowledge Fusion',
    to: '/knowledge',
    icon: BookOpen,
    keywords: 'knowledge wiki documentation',
  },
  {
    id: 'route-creation',
    label: 'Creation Studio',
    to: '/creation',
    icon: Palette,
    keywords: 'creation studio art generation',
  },
  {
    id: 'route-evolution',
    label: 'Evolution Monitor',
    to: '/evolution',
    icon: TrendingUp,
    keywords: 'evolution monitor metrics',
  },
  {
    id: 'route-memory',
    label: 'Memory',
    to: '/memory',
    icon: Brain,
    keywords: 'memory ram graph souvenir',
  },
  {
    id: 'route-research',
    label: 'Research',
    to: '/research',
    icon: SearchIcon,
    keywords: 'research recherche analyse',
  },
  {
    id: 'route-skills',
    label: 'Skill Manager',
    to: '/skills',
    icon: Wand2,
    keywords: 'skills compétences capabilities',
  },
  {
    id: 'route-sentinel',
    label: 'Sentinel (Monitoring agent)',
    to: '/sentinel',
    icon: ShieldAlert,
    keywords: 'sentinel monitoring agent santé',
  },
] as const;
