/**
 * TITANE_INFINITY v34.3.0 — Command Palette catalog (safe IPC actions).
 *
 * Curated allowlist of IPC commands that are read-only OR idempotent and
 * safe to trigger from a global palette without confirmation. Every entry
 * MUST exist in `ALLOWED_COMMANDS` (src/lib/security.ts). Any destructive
 * command MUST stay out of this list.
 */
import type { LucideIcon } from 'lucide-react';
import { RefreshCcw, Activity, Cpu, Database, Trash2 } from 'lucide-react';

export interface PaletteAction {
  id: string;
  label: string;
  command: string;
  icon: LucideIcon;
  keywords?: string;
  /** Optional payload passed to secureInvoke. */
  args?: Record<string, unknown>;
  /** Toast message on success. */
  successMessage: string;
}

export const PALETTE_ACTIONS: ReadonlyArray<PaletteAction> = [
  {
    id: 'action-system-health',
    label: 'Action — Sonder la santé système',
    command: 'get_system_health',
    icon: Activity,
    keywords: 'health santé probe',
    successMessage: 'Santé système rafraîchie',
  },
  {
    id: 'action-providers-status',
    label: 'Action — Rafraîchir le statut des providers Chat',
    command: 'chat_get_providers_status',
    icon: Cpu,
    keywords: 'providers chat status ollama',
    successMessage: 'Statut providers Chat rafraîchi',
  },
  {
    id: 'action-clear-cache',
    label: 'Action — Vider le cache WebView (UN SEUL TITANE VIVANT)',
    command: 'clear_webview_cache',
    icon: Trash2,
    keywords: 'cache clear webview stale-pages',
    successMessage: 'Cache WebView vidé — recharge la page pour confirmer',
  },
  {
    id: 'action-engines-status',
    label: 'Action — Sonder le statut des moteurs',
    command: 'engines_get_dashboard',
    icon: Database,
    keywords: 'engines moteurs status dashboard',
    successMessage: 'Statut moteurs rafraîchi',
  },
  {
    id: 'action-reload-window',
    label: 'Action — Recharger la fenêtre (window.location.reload)',
    command: '__reload_window__',
    icon: RefreshCcw,
    keywords: 'reload reload reload f5',
    successMessage: 'Rechargement…',
  },
] as const;
