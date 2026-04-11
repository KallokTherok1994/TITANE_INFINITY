/**
 * TITANE∞ v30.0.0 — useSelfAwareness Hook
 *
 * Hook for accessing TITANE's self-awareness knowledge base.
 * Provides access to architecture map, capabilities, metrics,
 * and IPC command catalogue at runtime.
 */

import { useMemo } from 'react';
import { SELF_AWARENESS } from '@/knowledge/self-awareness';

export function useSelfAwareness() {
  const metrics = useMemo(() => SELF_AWARENESS.getMetrics(), []);
  const allCapabilities = useMemo(() => SELF_AWARENESS.getCapabilities(), []);
  const stores = useMemo(() => SELF_AWARENESS.getStores(), []);
  const hooks = useMemo(() => SELF_AWARENESS.getHooks(), []);
  const routes = useMemo(() => SELF_AWARENESS.getRoutes(), []);
  const commandDomains = useMemo(() => SELF_AWARENESS.getCommandDomains(), []);

  return {
    architecture: SELF_AWARENESS.architecture,
    capabilities: SELF_AWARENESS.capabilities,
    metrics,
    commandCount: SELF_AWARENESS.getCommandCount(),
    allCapabilities,
    stores,
    hooks,
    routes,
    commandDomains,
    hasCapability: SELF_AWARENESS.hasCapability,
    getCommandsByDomain: SELF_AWARENESS.getCommandsByDomain,
    getRing: SELF_AWARENESS.getRing,
  };
}
