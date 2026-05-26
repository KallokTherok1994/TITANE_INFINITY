/**
 * TITANE_INFINITY v35.0.0 — TanStack Query offline persistence.
 *
 * Persiste un sous-ensemble allow-listé de queries dans `localStorage`
 * pour permettre un démarrage offline-first instantané (hydratation
 * synchrone) sans payer une cascade d'appels IPC au boot.
 *
 * Invariants:
 *   - Allow-list stricte (PROD reads stables uniquement). Aucun mutation,
 *     aucun secret, aucun envelope IPC `{ok,content,error}` complet brut.
 *   - `buster` lié à la version `__APP_VERSION__` (injectée par Vite) →
 *     toute bump invalide le cache disque.
 *   - `maxAge` = 24h pour éviter de boot sur un état très stale.
 *   - No-op si `window.localStorage` indisponible (Tauri remote sans DOM,
 *     SSR, tests headless sans storage stub).
 *
 * Conformité:
 *   - Rule 1 (minimal patch additif) : aucun hook existant modifié.
 *   - Rule 6 (IPC envelope) : la persistance ne stocke que les données
 *     déjà résolues côté query layer, jamais les enveloppes IPC.
 */
import type { QueryClient, Query } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const PERSIST_ALLOWLIST_PREFIXES = [
  'system',
  'engines',
  'providers',
  'conversation',
  'chat',
] as const;

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface InstallQueryPersisterOptions {
  /** localStorage-like adapter (defaults to `window.localStorage`). */
  storage?: Storage;
  /** Buster key — change to invalidate all cached snapshots. */
  buster?: string;
  /** Hard expiration for the disk cache. Defaults to 24h. */
  maxAgeMs?: number;
  /** Throttle des écritures storage (ms). Défaut 250. */
  throttleMs?: number;
}

export interface InstallQueryPersisterResult {
  installed: boolean;
  reason?: string;
}

function resolveStorage(explicit?: Storage): Storage | null {
  if (explicit) return explicit;
  if (typeof window === 'undefined') return null;
  try {
    const ls = window.localStorage;
    const probe = '__titane_qp_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export function shouldDehydrateQueryKey(key: ReadonlyArray<unknown>): boolean {
  if (key.length === 0) return false;
  const head = key[0];
  if (typeof head !== 'string') return false;
  return (PERSIST_ALLOWLIST_PREFIXES as readonly string[]).includes(head);
}

export function installQueryPersister(
  queryClient: QueryClient,
  options: InstallQueryPersisterOptions = {}
): InstallQueryPersisterResult {
  const storage = resolveStorage(options.storage);
  if (!storage) {
    return { installed: false, reason: 'no-storage' };
  }

  const buster =
    options.buster ??
    (typeof __APP_VERSION__ === 'string' ? `titane-${__APP_VERSION__}` : 'titane-dev');

  const persister = createSyncStoragePersister({
    storage,
    key: 'titane.tanstack.query.cache.v1',
    throttleTime: options.throttleMs ?? 250,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: options.maxAgeMs ?? DEFAULT_MAX_AGE_MS,
    buster,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) => {
        if (query.state.status !== 'success') return false;
        return shouldDehydrateQueryKey(query.queryKey as ReadonlyArray<unknown>);
      },
    },
  });

  return { installed: true };
}
