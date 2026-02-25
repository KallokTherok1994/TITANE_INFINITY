/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH SERVICE (Ring 3 — UI bridge)
 *   P1.0 EXPERIMENTAL — Tauri-only, zéro réseau UI
 * ═══════════════════════════════════════════════════════════════════
 *
 * INVARIANT: aucun fetch/HTTP ici. Tout passe par invoke Tauri.
 */

import { tauri } from '@/api/tauriClient';
import type { ResearchOptions, ResearchQuery, ResearchReport } from '@/types/research';

/**
 * Invoke the `web_research` Tauri command (P1 stub).
 *
 * Returns a `ResearchReport` with full trace and markers.
 * WEB_LIVE mode returns BLOCKED (network not activated in P1).
 */
export async function webResearch(
  query: ResearchQuery,
  options: ResearchOptions
): Promise<ResearchReport> {
  return tauri<ResearchReport>('web_research', { query, options });
}
