/**
 * TITANE∞ v30.0.0 — useSelfAwareness Hook
 *
 * Hook for accessing TITANE's self-awareness knowledge base.
 * Provides access to architecture map, capabilities, metrics,
 * and IPC command catalogue at runtime.
 *
 * Note: The underlying data is static JSON loaded at module init time.
 * Values are pre-computed once at module level and returned directly.
 */

import { SELF_AWARENESS } from '@/knowledge/self-awareness';

const _metrics = SELF_AWARENESS.getMetrics();
const _allCapabilities = SELF_AWARENESS.getCapabilities();
const _stores = SELF_AWARENESS.getStores();
const _hooks = SELF_AWARENESS.getHooks();
const _routes = SELF_AWARENESS.getRoutes();
const _commandDomains = SELF_AWARENESS.getCommandDomains();
const _commandCount = SELF_AWARENESS.getCommandCount();

export function useSelfAwareness() {
  return {
    architecture: SELF_AWARENESS.architecture,
    capabilities: SELF_AWARENESS.capabilities,
    metrics: _metrics,
    commandCount: _commandCount,
    allCapabilities: _allCapabilities,
    stores: _stores,
    hooks: _hooks,
    routes: _routes,
    commandDomains: _commandDomains,
    hasCapability: SELF_AWARENESS.hasCapability,
    getCommandsByDomain: SELF_AWARENESS.getCommandsByDomain,
    getRing: SELF_AWARENESS.getRing,
  };
}
