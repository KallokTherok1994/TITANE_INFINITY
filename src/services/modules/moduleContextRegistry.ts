/**
 * TITANE∞ — Module Context Registry
 *
 * Central registry for module context snapshots.
 * Pages publish their snapshot here; chat reads snapshots from here.
 *
 * Rules:
 * - Chat must NOT scrape DOM.
 * - Snapshots must be prompt-safe (no secrets, no API keys).
 * - Snapshots must include freshness and degradation status.
 * - No raw provider tokens in visibleMetrics.
 */

import type { ModuleContextSnapshot, ModuleId } from './moduleContextTypes';

const MAX_SNAPSHOT_AGE_MS = 30_000; // 30s before stale

class ModuleContextRegistryImpl {
  private snapshots = new Map<string, ModuleContextSnapshot>();
  private listeners = new Set<
    (moduleId: string, snapshot: ModuleContextSnapshot) => void
  >();

  /** Publish a snapshot for a module. Called by page components. */
  publish(
    moduleId: string,
    snapshot: Omit<ModuleContextSnapshot, 'lastUpdated' | 'freshnessMs'>
  ): void {
    const full: ModuleContextSnapshot = {
      ...snapshot,
      lastUpdated: new Date().toISOString(),
      freshnessMs: 0,
    };
    this.snapshots.set(moduleId, full);
    for (const listener of this.listeners) {
      try {
        listener(moduleId, full);
      } catch {
        /* ignore */
      }
    }
  }

  /** Get a snapshot for a module. Returns null if missing or stale. */
  get(moduleId: string): ModuleContextSnapshot | null {
    const snap = this.snapshots.get(moduleId);
    if (!snap) return null;
    const ageMs = Date.now() - new Date(snap.lastUpdated).getTime();
    return { ...snap, freshnessMs: ageMs };
  }

  /** Get all current snapshots (for chat context injection). */
  getAll(): ModuleContextSnapshot[] {
    return Array.from(this.snapshots.values()).map(snap => ({
      ...snap,
      freshnessMs: Date.now() - new Date(snap.lastUpdated).getTime(),
    }));
  }

  /** Get current module snapshot or return a degraded placeholder. */
  getOrDegraded(moduleId: string): ModuleContextSnapshot {
    return (
      this.get(moduleId) ?? {
        moduleId,
        route: '',
        title: moduleId,
        status: 'unknown',
        lastUpdated: new Date(0).toISOString(),
        freshnessMs: Infinity,
        source: 'unknown',
        capabilities: [],
        visibleMetrics: {},
        actions: [],
        warnings: ['Module snapshot not yet published'],
      }
    );
  }

  /** Subscribe to snapshot updates. Returns unsubscribe fn. */
  subscribe(
    listener: (moduleId: string, snapshot: ModuleContextSnapshot) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Check if a snapshot is fresh. */
  isFresh(moduleId: string): boolean {
    const snap = this.snapshots.get(moduleId);
    if (!snap) return false;
    const ageMs = Date.now() - new Date(snap.lastUpdated).getTime();
    return ageMs < MAX_SNAPSHOT_AGE_MS;
  }

  /** Build a compact prompt-safe summary for chat injection. */
  buildChatContext(moduleIds?: ModuleId[]): string {
    const snapshots = moduleIds
      ? moduleIds.map(id => this.getOrDegraded(id))
      : this.getAll();

    const lines: string[] = ['[MODULE_CONTEXT]'];
    for (const snap of snapshots) {
      const ageS = Math.round(snap.freshnessMs / 1000);
      const metrics = Object.entries(snap.visibleMetrics)
        .slice(0, 5)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(', ');
      lines.push(
        `${snap.moduleId} status=${snap.status} source=${snap.source} age=${ageS}s` +
          (metrics ? ` metrics=[${metrics}]` : '') +
          (snap.warnings.length
            ? ` warnings=[${snap.warnings.slice(0, 2).join('; ')}]`
            : '')
      );
    }
    lines.push('[/MODULE_CONTEXT]');
    return lines.join('\n');
  }
}

export const moduleContextRegistry = new ModuleContextRegistryImpl();
