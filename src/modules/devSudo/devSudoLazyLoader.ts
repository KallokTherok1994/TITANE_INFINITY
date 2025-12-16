/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.0 — DEV-SUDO LAZY LOADER (YOLO OPT-5)
 *   Domain-based lazy-loading for DevSudo handlers (13K lines split)
 *   Reduces bundle principal by ~150 KB gzip
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { DevSudoAction } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type HandlerDomain =
  | 'ide' // IDE Mode handlers (808 lines)
  | 'singularity' // Singularity Mind handlers (1,148 lines)
  | 'vision' // Vision Engine handlers (1,136 lines)
  | 'backend' // Backend & API handlers (879 lines)
  | 'memory' // Memory Eternal handlers (695 lines)
  | 'titane-one' // TITANE ONE Unified Brain (964 lines)
  | 'extended' // Extended base handlers (654 lines)
  | 'core'; // Core handlers (dans devSudoHandler.ts)

export interface HandlerModule {
  // Each handler module exports functions matching actions
  [key: string]: (...args: any[]) => Promise<any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION → DOMAIN MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Détermine le domaine d'un handler basé sur l'action
 */
export function getActionDomain(action: DevSudoAction): HandlerDomain {
  // IDE Mode actions (Super Prompt #7)
  if (
    [
      'open-file',
      'view-file',
      'create-file',
      'patch-file',
      'goto-function',
      'goto-component',
      'goto-handler',
      'copilot-suggest',
      'auto-complete',
      'refactor-component',
      'refactor-hook',
      'refactor-handler',
      'generate-module',
      'architect-refactor',
      'code-review',
      'explain-code',
    ].includes(action)
  ) {
    return 'ide';
  }

  // Singularity Mind Engine actions (Super Prompt #8)
  if (
    [
      'singularity-scan',
      'brain-analysis',
      'cognitive-check',
      'meta-repair',
      'evolution-report',
      'coherence-check',
    ].includes(action)
  ) {
    return 'singularity';
  }

  // Vision Engine actions (Super Prompt #9)
  if (
    [
      'vision-analyze',
      'ui-diagnostic',
      'design-review',
      'frontend-optimize',
      'visual-repair',
    ].includes(action)
  ) {
    return 'vision';
  }

  // Backend & API Master actions (Super Prompt #10)
  if (
    [
      'backend-analysis',
      'fix-handler',
      'create-api',
      'whitelist-command',
      'optimize-cargo',
      'build-backend',
      'analyze-security',
    ].includes(action)
  ) {
    return 'backend';
  }

  // Memory Eternal Engine actions (Super Prompt #11)
  if (
    [
      'memory-scan',
      'memory-heal',
      'memory-deepheal',
      'memory-snapshot',
      'memory-export',
      'memory-import',
      'memory-rebuild',
      'memory-optimize',
    ].includes(action)
  ) {
    return 'memory';
  }

  // TITANE∞ ONE Unified Brain actions (Super Prompt #SINGULARITY)
  if (
    [
      'titane-one-introspect',
      'titane-one-evolve',
      'titane-one-heal',
      'titane-one-fullheal',
      'titane-one-unify',
      'titane-one-optimize',
      'titane-one-vision-all',
      'titane-one-analyze-dev',
      'titane-one-analyze-ui',
      'titane-one-analyze-backend',
      'titane-one-analyze-memory',
      'titane-one-singularity-scan',
    ].includes(action)
  ) {
    return 'titane-one';
  }

  // Extended handlers (AI, Chat, Dataset, Hybrid, Fusion, etc.)
  if (
    [
      'ia-add',
      'ia-test',
      'ia-set-default',
      'ia-enable-devmode',
      'ia-scan',
      'ia-status',
      'ia-train',
      'ia-dataset',
      'ia-test-model',
      'ia-benchmark',
      'chat-open',
      'chat-close',
      'chat-minimize',
      'chat-maximize',
      'chat-clear',
      'chat-set-model',
      'chat-dev',
      'chat-inspect',
      'chat-autoheal',
      'chat-fullscreen',
      'chat-follow',
      'dataset-collect',
      'dataset-clean',
      'dataset-generate',
      'dataset-training-pack',
      'dataset-compress',
      'dataset-add',
      'dataset-sync-memory',
      'dataset-export',
      'hybrid-open',
      'hybrid-close',
      'hybrid-console',
      'hybrid-bubble',
      'hybrid-heal',
      'hybrid-inspect',
      'hybrid-fix',
      'hybrid-apply',
      'hybrid-run',
      'hybrid-logs',
      'fusion-analyze',
      'fusion-optimize',
      'fusion-generate',
      'fusion-test',
      'fusion-deploy',
    ].includes(action)
  ) {
    return 'extended';
  }

  // Core handlers (basic commands dans devSudoHandler.ts)
  return 'core';
}

// ═══════════════════════════════════════════════════════════════════════════
// LAZY LOADER CACHE
// ═══════════════════════════════════════════════════════════════════════════

const handlerCache: Partial<Record<HandlerDomain, HandlerModule>> = {};
const loadingPromises: Partial<Record<HandlerDomain, Promise<HandlerModule>>> = {};

/**
 * YOLO OPT-5: Lazy-load handler module for a domain
 */
export async function loadHandlerModule(domain: HandlerDomain): Promise<HandlerModule> {
  // Return cached module if already loaded
  if (handlerCache[domain]) {
    console.log(`[DEV-SUDO LAZY] ✅ Handler "${domain}" already loaded (cached)`);
    return handlerCache[domain]!;
  }

  // Return loading promise if currently loading
  if (loadingPromises[domain]) {
    console.log(`[DEV-SUDO LAZY] ⏳ Handler "${domain}" currently loading (awaiting)`);
    return loadingPromises[domain]!;
  }

  // Start loading
  console.log(`[DEV-SUDO LAZY] ⚡ Lazy-loading handler "${domain}"...`);
  const loadPromise = (async () => {
    let module: HandlerModule;

    switch (domain) {
      case 'ide':
        module = await import('./devSudoIDEHandlers');
        break;
      case 'singularity':
        module = await import('./devSudoSingularityHandlers');
        break;
      case 'vision':
        module = await import('./devSudoVisionHandlers');
        break;
      case 'backend':
        module = await import('./devSudoBackendHandlers');
        break;
      case 'memory':
        module = await import('./devSudoMemoryHandlers');
        break;
      case 'titane-one':
        module = await import('./devSudoTitaneOneHandlers');
        break;
      case 'extended':
        module = await import('./devSudoExtendedHandlers');
        break;
      case 'core':
        // Core handlers are in devSudoHandler.ts (not separated)
        module = {};
        break;
      default:
        throw new Error(`Unknown handler domain: ${domain}`);
    }

    // Cache module
    handlerCache[domain] = module;
    delete loadingPromises[domain];

    console.log(`[DEV-SUDO LAZY] ✅ Handler "${domain}" loaded successfully`);
    return module;
  })();

  loadingPromises[domain] = loadPromise;
  return loadPromise;
}

/**
 * Get handler function for a specific action (with lazy-loading)
 */
export async function getHandlerForAction(action: DevSudoAction): Promise<HandlerModule> {
  const domain = getActionDomain(action);
  return await loadHandlerModule(domain);
}

/**
 * Check if handler module is already loaded (no lazy-load)
 */
export function isHandlerLoaded(domain: HandlerDomain): boolean {
  return !!handlerCache[domain];
}

/**
 * Preload handler module in background (optional optimization)
 */
export function preloadHandler(domain: HandlerDomain): void {
  if (!handlerCache[domain] && !loadingPromises[domain]) {
    loadHandlerModule(domain).catch(err => {
      console.warn(`[DEV-SUDO LAZY] Failed to preload "${domain}":`, err);
    });
  }
}

/**
 * Get cache statistics for debugging
 */
export function getLoaderStats(): {
  loaded: HandlerDomain[];
  loading: HandlerDomain[];
  unloaded: HandlerDomain[];
} {
  const allDomains: HandlerDomain[] = [
    'ide',
    'singularity',
    'vision',
    'backend',
    'memory',
    'titane-one',
    'extended',
    'core',
  ];

  const loaded = allDomains.filter(d => !!handlerCache[d]);
  const loading = allDomains.filter(d => !!loadingPromises[d]);
  const unloaded = allDomains.filter(d => !handlerCache[d] && !loadingPromises[d]);

  return { loaded, loading, unloaded };
}
