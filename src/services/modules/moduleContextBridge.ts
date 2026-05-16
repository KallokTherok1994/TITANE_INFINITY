/**
 * TITANE∞ — Module Context Bridge
 *
 * Injects active module context snapshots into the chat prompt pipeline.
 * The bridge reads from moduleContextRegistry — never from DOM.
 *
 * Rules:
 * - No raw API keys or secrets in injected context.
 * - Snapshot content is bounded (max PROMPT_CONTEXT_MAX_CHARS).
 * - Only inject modules the user is actively using (active route first).
 * - Stale snapshots (> STALE_THRESHOLD_MS) are marked as stale in prompt.
 * - chat.inject() is the single entry point for prompt context from modules.
 */

import { moduleContextRegistry } from './moduleContextRegistry';
import type { ModuleContextSnapshot } from './moduleContextTypes';

const PROMPT_CONTEXT_MAX_CHARS = 2000;
const STALE_THRESHOLD_MS = 60_000; // 1 minute

export interface ModuleContextInjection {
  /** Compact prompt-safe context block */
  promptBlock: string;
  /** Which modules were included */
  includedModules: string[];
  /** Which modules were skipped (stale/unknown) */
  skippedModules: string[];
  /** Total character count of injected context */
  charCount: number;
}

function formatSnapshot(snap: ModuleContextSnapshot): string {
  const ageS = Math.round(snap.freshnessMs / 1000);
  const stale = snap.freshnessMs > STALE_THRESHOLD_MS;
  const metrics = Object.entries(snap.visibleMetrics)
    .filter(([, v]) => v !== null && v !== undefined)
    .slice(0, 6)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(', ');
  const warnings = snap.warnings.slice(0, 2).join('; ');
  const curatedNote = snap.curatedSections?.length
    ? ` [curated_sections: ${snap.curatedSections.join(',')}]`
    : '';

  return (
    `[MODULE:${snap.moduleId}] status=${snap.status} source=${snap.source}` +
    (stale ? ` STALE(${ageS}s)` : ` age=${ageS}s`) +
    (metrics ? ` metrics=[${metrics}]` : '') +
    (warnings ? ` warn=[${warnings}]` : '') +
    curatedNote
  );
}

/**
 * Build a prompt-safe context block for the active route and related modules.
 * Call this just before building the system prompt for the AI provider.
 */
export function buildModuleContextInjection(options: {
  /** Current active route (e.g. "/titane?tab=conversation") */
  activeRoute?: string;
  /** Limit which modules to include */
  moduleFilter?: string[];
  /** Max characters for the injected block */
  maxChars?: number;
}): ModuleContextInjection {
  const { activeRoute, moduleFilter, maxChars = PROMPT_CONTEXT_MAX_CHARS } = options;
  const allSnapshots = moduleContextRegistry.getAll();

  // Sort: active route module first, then freshest
  const sorted = [...allSnapshots].sort((a, b) => {
    const aActive = activeRoute && a.route ? activeRoute.startsWith(a.route.split('?')[0] ?? '') : false;
    const bActive = activeRoute && b.route ? activeRoute.startsWith(b.route.split('?')[0] ?? '') : false;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.freshnessMs - b.freshnessMs;
  });

  const filtered = moduleFilter
    ? sorted.filter(s => moduleFilter.includes(s.moduleId))
    : sorted;

  const included: ModuleContextSnapshot[] = [];
  const skipped: string[] = [];
  let charCount = 24; // header/footer chars

  for (const snap of filtered) {
    // Skip truly unknown with no data
    if (snap.status === 'unknown' && Object.keys(snap.visibleMetrics).length === 0) {
      skipped.push(snap.moduleId);
      continue;
    }

    const line = formatSnapshot(snap) + '\n';
    if (charCount + line.length > maxChars) {
      skipped.push(snap.moduleId);
      continue;
    }

    included.push(snap);
    charCount += line.length;
  }

  const promptBlock =
    included.length === 0
      ? ''
      : [
          '[TITANE_MODULE_CONTEXT]',
          ...included.map(formatSnapshot),
          '[/TITANE_MODULE_CONTEXT]',
        ].join('\n');

  return {
    promptBlock,
    includedModules: included.map(s => s.moduleId),
    skippedModules: skipped,
    charCount: promptBlock.length,
  };
}

/**
 * Get the injection for a single active module (e.g. current page).
 * Returns empty string if no snapshot available or snapshot is unknown.
 */
export function getActiveModuleContext(moduleId: string): string {
  const snap = moduleContextRegistry.get(moduleId);
  if (!snap || snap.status === 'unknown') return '';
  return formatSnapshot(snap);
}
