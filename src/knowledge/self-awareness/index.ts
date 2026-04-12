/**
 * TITANE∞ v30.1.0 — Self-Awareness Knowledge Module
 *
 * This module allows TITANE to be aware of its own architecture,
 * capabilities, and internal structure. It loads the architecture
 * map and capabilities manifest into the cognitive memory system.
 */

import architectureMap from './architecture-map.json';
import capabilitiesManifest from './capabilities-manifest.json';

export const SELF_AWARENESS = {
  architecture: architectureMap,
  capabilities: capabilitiesManifest,

  /** Get total IPC command count */
  getCommandCount: () => architectureMap.architecture.metrics.total_ipc_commands,

  /** Get all capabilities */
  getCapabilities: () => Object.keys(capabilitiesManifest.capabilities),

  /** Check if a capability exists */
  hasCapability: (name: string) => name in capabilitiesManifest.capabilities,

  /** Get architecture ring info (ring 0–4) */
  getRing: (ring: number) => {
    if (ring < 0 || ring > 4) return undefined;
    const rings = architectureMap.architecture.rings;
    const suffix = ['kernel', 'services', 'engines', 'stores', 'ui'][ring];
    const key = `ring${ring}_${suffix}` as keyof typeof rings;
    return rings[key];
  },

  /** Get all store names */
  getStores: () => architectureMap.architecture.stores.map(s => s.name),

  /** Get all hook names */
  getHooks: () => architectureMap.architecture.hooks,

  /** Get all routes */
  getRoutes: () => architectureMap.architecture.routes,

  /** Get project metrics */
  getMetrics: () => architectureMap.architecture.metrics,

  /** Get IPC commands for a specific domain */
  getCommandsByDomain: (domain: string) => {
    const domains = architectureMap.architecture.ipc_commands.domains as Record<
      string,
      string[]
    >;
    return domains[domain] ?? [];
  },

  /** Get all IPC domains */
  getCommandDomains: () => Object.keys(architectureMap.architecture.ipc_commands.domains),
} as const;

export type SelfAwareness = typeof SELF_AWARENESS;

export { architectureMap, capabilitiesManifest };
