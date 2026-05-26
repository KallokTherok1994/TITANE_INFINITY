/**
 * TITANE_INFINITY v34.3.0 — Command Palette catalog (advanced agents).
 *
 * Mapping authoritative: each agent has a Ring-3 service in `src/services/<agent>/`
 * and a dashboard surface with stable `data-testid="<agent>-dashboard"`.
 * Cf. AGENTS.md (Preuves attendues et patterns d'intégration).
 */
import type { LucideIcon } from 'lucide-react';
import { Activity, Stethoscope, Eye, Network, Shield, FileSearch } from 'lucide-react';

export interface PaletteAgent {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  testid: string;
  keywords?: string;
}

export const PALETTE_AGENTS: ReadonlyArray<PaletteAgent> = [
  {
    id: 'agent-monitoring',
    label: 'Agent — Monitoring (santé temps réel)',
    to: '/sentinel',
    icon: Activity,
    testid: 'monitoring-dashboard',
    keywords: 'monitoring santé health alerting metrics',
  },
  {
    id: 'agent-diagnostic',
    label: 'Agent — Auto-Diagnostic (anomalies)',
    to: '/dev?tab=diagnostics',
    icon: Stethoscope,
    testid: 'diagnostic-panel',
    keywords: 'diagnostic anomalie autoheal',
  },
  {
    id: 'agent-explainability',
    label: 'Agent — Explainability (traçabilité IA)',
    to: '/dev?tab=explainability',
    icon: Eye,
    testid: 'explainability-dashboard',
    keywords: 'explainability explicabilité audit décision',
  },
  {
    id: 'agent-orchestrator',
    label: 'Agent — Orchestrateur dynamique',
    to: '/orchestration-center',
    icon: Network,
    testid: 'orchestrator-dashboard',
    keywords: 'orchestrator répartition charge',
  },
  {
    id: 'agent-security',
    label: 'Agent — Sécurité active',
    to: '/dev?tab=security',
    icon: Shield,
    testid: 'security-dashboard',
    keywords: 'security sécurité intrusion sandbox',
  },
  {
    id: 'agent-log-analysis',
    label: 'Agent — Log Analysis (rapports)',
    to: '/dev?tab=log-analysis',
    icon: FileSearch,
    testid: 'log-analysis-dashboard',
    keywords: 'logs anomalies incohérences améliorations',
  },
] as const;
