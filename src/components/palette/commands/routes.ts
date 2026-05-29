/**
 * TITANE_INFINITY v34.3.0 — Command Palette catalog (routes / agents / safe IPC actions).
 *
 * Gate 12 Surface Migration: expanded from 12 to 30 routes, matching the full
 * Surface Decision Matrix (07_SURFACE_DECISION_MATRIX.json).
 * Routes are annotated with their decision classification for mode-aware filtering.
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
  Users,
  FolderKanban,
  Zap,
  GitMerge,
  Globe,
  Eye,
  Activity,
  Shield,
  Dog,
  HeartPulse,
  Cpu,
  FileText,
  BarChart2,
  Terminal,
  Atom,
  Beaker,
  Layers,
} from 'lucide-react';
import type { SurfaceDecision } from '@/lib/routeIndex';

export interface PaletteRoute {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string;
  decision: SurfaceDecision;
}

export const PALETTE_ROUTES: ReadonlyArray<PaletteRoute> = [
  // ── KEEP_DAILY (11 routes) ────────────────────────────────────────────────
  {
    id: 'route-titane',
    label: 'TITANE — Accueil / Chat',
    to: '/titane',
    icon: Home,
    keywords: 'home accueil chat conversation ia',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-experience',
    label: 'Experience XP',
    to: '/experience',
    icon: Sparkles,
    keywords: 'xp progression niveau experience',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-time',
    label: 'Temporal Center',
    to: '/time',
    icon: Clock,
    keywords: 'agenda time temporal calendar temps',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-memory',
    label: 'Memory',
    to: '/memory',
    icon: Brain,
    keywords: 'memory ram graph souvenir mémoire',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-twins',
    label: 'Twins — Jumeau Numérique',
    to: '/twins',
    icon: Users,
    keywords: 'twins identité persona jumeau digital',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-research',
    label: 'Research',
    to: '/research',
    icon: SearchIcon,
    keywords: 'research recherche analyse web',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-multiproject',
    label: 'Multi-Project Dashboard',
    to: '/multiproject',
    icon: FolderKanban,
    keywords: 'projects projets kanban multi-project',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-skills',
    label: 'Skill Manager',
    to: '/skills',
    icon: Wand2,
    keywords: 'skills compétences capabilities skill-os',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-knowledge',
    label: 'Knowledge Fusion',
    to: '/knowledge',
    icon: BookOpen,
    keywords: 'knowledge wiki documentation fusion',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-creation',
    label: 'Creation Studio',
    to: '/creation',
    icon: Palette,
    keywords: 'creation studio art generation créer',
    decision: 'KEEP_DAILY',
  },
  {
    id: 'route-evolution',
    label: 'Evolution Monitor',
    to: '/evolution',
    icon: TrendingUp,
    keywords: 'evolution monitor metrics croissance',
    decision: 'KEEP_DAILY',
  },
  // ── KEEP_SYSTEM (14 routes) ──────────────────────────────────────────────
  {
    id: 'route-admin',
    label: 'Configuration Hub',
    to: '/admin',
    icon: Settings,
    keywords: 'admin config settings réglages système',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-fusion',
    label: 'Fusion Dashboard',
    to: '/fusion',
    icon: GitMerge,
    keywords: 'fusion backend frontend health tableau',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-optimization',
    label: 'Optimization Center',
    to: '/optimization',
    icon: Zap,
    keywords: 'optimization performance metrics gpu wasm',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-orchestration-center',
    label: 'Orchestration Meta Center',
    to: '/orchestration-center',
    icon: Layers,
    keywords: 'orchestration meta center multi-ai nexus',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-reality-center',
    label: 'Reality Center',
    to: '/reality-center',
    icon: Globe,
    keywords: 'reality rendering layer engine',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-hyper-center',
    label: 'Hyper Center',
    to: '/hyper-center',
    icon: Cpu,
    keywords: 'hyper intelligence engine opus',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-cloud',
    label: 'Cloud Center',
    to: '/cloud',
    icon: Globe,
    keywords: 'cloud sync vault sauvegarde stockage',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-doc-center',
    label: 'Doc Center',
    to: '/doc-center',
    icon: FileText,
    keywords: 'doc docx export document center',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-singularity',
    label: 'Singularity Monitor',
    to: '/singularity',
    icon: Activity,
    keywords: 'singularity state monitor observability',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-sentinel',
    label: 'Sentinel (Monitoring agent)',
    to: '/sentinel',
    icon: ShieldAlert,
    keywords: 'sentinel monitoring agent santé securité',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-watchdog',
    label: 'Watchdog',
    to: '/watchdog',
    icon: Dog,
    keywords: 'watchdog monitor observability engine',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-selfheal',
    label: 'Self Heal',
    to: '/selfheal',
    icon: HeartPulse,
    keywords: 'selfheal resilience autorepair engine',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-adaptive',
    label: 'Adaptive Engine',
    to: '/adaptive',
    icon: Eye,
    keywords: 'adaptive intelligence engine système',
    decision: 'KEEP_SYSTEM',
  },
  {
    id: 'route-htf',
    label: "HTF — L'Humain à Tout Faire",
    to: '/htf',
    icon: Shield,
    keywords: 'htf humain human assistant utility',
    decision: 'KEEP_SYSTEM',
  },
  // ── KEEP_DEV (2 routes) ──────────────────────────────────────────────────
  {
    id: 'route-dev',
    label: 'Dev Center',
    to: '/dev',
    icon: Wrench,
    keywords: 'developer outils tooling diagnostics dev',
    decision: 'KEEP_DEV',
  },
  {
    id: 'route-total-dev',
    label: 'Total Dev — Espace Souverain',
    to: '/total-dev',
    icon: Terminal,
    keywords: 'total-dev god dev sovereign espace restreint qwen',
    decision: 'KEEP_DEV',
  },
  // ── KEEP_DISPLAY_ONLY (1 route) ──────────────────────────────────────────
  {
    id: 'route-performance',
    label: 'Performance Diagnostics',
    to: '/performance',
    icon: BarChart2,
    keywords: 'performance test diagnostics metrics display',
    decision: 'KEEP_DISPLAY_ONLY',
  },
  // ── KEEP_SIMULATED (2 routes) ────────────────────────────────────────────
  // NOTE: These surfaces are SIMULATED_UI — they show a mandatory badge and have no live data.
  {
    id: 'route-orchestration-intelligence',
    label: '[SIMULATED] Orchestration Intelligence Center',
    to: '/orchestration-intelligence',
    icon: Atom,
    keywords: 'orchestration intelligence simulated lab quantum multi-ia',
    decision: 'KEEP_SIMULATED',
  },
  {
    id: 'route-quantum-center',
    label: '[SIMULATED] Quantum Center',
    to: '/quantum-center',
    icon: Beaker,
    keywords: 'quantum center simulated lab rendering',
    decision: 'KEEP_SIMULATED',
  },
] as const;
