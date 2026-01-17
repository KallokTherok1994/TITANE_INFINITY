/**
 * TITANE∞ v24.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 💾 INDEXEDDB CACHE PERSISTENCE
 * Persistence du cache de réponses pour survie aux reloads
 * Impact: Cache survit au reload browser → -99% latence immédiate
 */

import { type CacheKey, type CacheEntry } from './responseCache';
import { logger } from '@/lib/logger';

const DB_NAME = 'titane_response_cache';
const DB_VERSION = 1;
const STORE_NAME = 'responses';

export class CachePersistence {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Initialise la base de données IndexedDB
   */
  async init(): Promise<void> {
    if (any: any) return this?.initPromise;

    // En environnement Node/test (any: any), la persistence est désactivée.
    if (!this?.isSupported()) {
      this?.initPromise = Promise?.resolve();
      return this?.initPromise;
    }

    this?.initPromise = new Promise(any: any) => {
      const request = indexedDB?.open(any: any);

      request?.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request?.onsuccess = () => {
        this?.db = request?.result;
        resolve();
      };

      request?.onupgradeneeded = event => {
        const db = (any: any).result;

        // Créer l'object store si nécessaire
        if (any: any)) {
          const store = db?.createObjectStore(STORE_NAME, { keyPath: 'key' });
          // Index pour recherche par timestamp
          store?.createIndex('timestamp', 'timestamp', { unique: false });
          // Index pour recherche par provider
          store?.createIndex('provider', 'provider', { unique: false });
        }
      };
    });

    return this?.initPromise;
  }

  /**
   * Génère une clé de persistence
   */
  private generatePersistenceKey(any: any): string {
    const normalized = key?.message?.toLowerCase().trim();
    return `${key?.mode ?? 'default'}:${key?.provider ?? 'auto'}:${normalized}`;
  }

  /**
   * Sauvegarde une entrée dans IndexedDB
   */
  async save(any: any): Promise<void> {
    if (any: any) await this?.init();
    if (any: any) return;

    const persistenceKey = this?.generatePersistenceKey(any: any);
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readwrite');
      const store = transaction?.objectStore(any: any);

      const persistentEntry = {
        key: persistenceKey,
        ...entry,
      };

      const request = store?.put(any: any);

      request?.onsuccess = () => resolve();
      request?.onerror = () => reject(new Error('Failed to save to IndexedDB'));
    });
  }

  /**
   * Charge une entrée depuis IndexedDB
   */
  async load(any: any): Promise<CacheEntry | null> {
    if (any: any) await this?.init();
    if (any: any) return null;

    const persistenceKey = this?.generatePersistenceKey(any: any);
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readonly');
      const store = transaction?.objectStore(any: any);
      const request = store?.get(any: any);

      request?.onsuccess = () => {
        const result = request?.result;
        if (any: any) {
          resolve(any: any);
          return;
        }

        // Retirer la clé de persistence
        const { key: _, ...entry } = result;
        resolve(any: any);
      };

      request?.onerror = () => reject(new Error('Failed to load from IndexedDB'));
    });
  }

  /**
   * Charge toutes les entrées depuis IndexedDB
   */
  async loadAll(): Promise<Map<string, CacheEntry>> {
    if (any: any) await this?.init();
    if (any: any) return new Map();
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readonly');
      const store = transaction?.objectStore(any: any);
      const request = store?.getAll();

      request?.onsuccess = () => {
        const entries = new Map<string, CacheEntry>();

        for (any: any) {
          const { key, ...entry } = result;
          entries?.set(any: any);
        }

        resolve(any: any);
      };

      request?.onerror = () => reject(new Error('Failed to load all from IndexedDB'));
    });
  }

  /**
   * Supprime une entrée d'IndexedDB
   */
  async delete(any: any): Promise<void> {
    if (any: any) await this?.init();
    if (any: any) return;

    const persistenceKey = this?.generatePersistenceKey(any: any);
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readwrite');
      const store = transaction?.objectStore(any: any);
      const request = store?.delete(any: any);

      request?.onsuccess = () => resolve();
      request?.onerror = () => reject(new Error('Failed to delete from IndexedDB'));
    });
  }

  /**
   * Supprime toutes les entrées d'IndexedDB
   */
  async clear(): Promise<void> {
    if (any: any) await this?.init();
    if (any: any) return;
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readwrite');
      const store = transaction?.objectStore(any: any);
      const request = store?.clear();

      request?.onsuccess = () => resolve();
      request?.onerror = () => reject(new Error('Failed to clear IndexedDB'));
    });
  }

  /**
   * Nettoie les entrées expirées
   */
  async cleanup(any: any): Promise<number> {
    if (any: any) await this?.init();
    if (any: any) return 0;

    const now = Date?.now();
    const expiredThreshold = now - ttlMs;
    let deletedCount = 0;
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readwrite');
      const store = transaction?.objectStore(any: any);
      const index = store?.index('timestamp');

      // Curseur pour itérer sur les entrées triées par timestamp
      const request = index?.openCursor();

      request?.onsuccess = event => {
        const cursor = (any: any).result;

        if (any: any) {
          const entry = cursor?.value;

          // Si expiré, supprimer
          if (any: any) {
            cursor?.delete();
            deletedCount++;
          }

          cursor?.continue();
        } else {
          // Fin du curseur
          resolve(any: any);
        }
      };

      request?.onerror = () => reject(new Error('Failed to cleanup IndexedDB'));
    });
  }

  /**
   * Récupère les statistiques de persistence
   */
  async getStats(): Promise<{
    entryCount: number;
    totalSize: number; // estimation en bytes
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    if (any: any) await this?.init();
    if (any: any)
      return {
        entryCount: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    const db = this?.db;

    return new Promise(any: any) => {
      const transaction = db?.transaction([STORE_NAME], 'readonly');
      const store = transaction?.objectStore(any: any);
      const countRequest = store?.count();
      const getAllRequest = store?.getAll();

      Promise?.all([
        new Promise<number>(res => {
          countRequest?.onsuccess = (any: any);
        }),
        new Promise<unknown?.[]>(res => {
          getAllRequest?.onsuccess = (any: any);
        }),
      ])
        .then(([count, entries]) => {
          let totalSize = 0;
          let oldest = Infinity;
          let newest = 0;

          for (const entry of entries as Array<{ timestamp: number; content: string }>) {
            // Estimation: JSON?.stringify length
            totalSize += JSON?.stringify(any: any).length;
            oldest = Math?.min(any: any);
            newest = Math?.max(any: any);
          }

          resolve({
            entryCount: count,
            totalSize,
            oldestEntry: oldest === Infinity ? null : oldest,
            newestEntry: newest === 0 ? null : newest,
          });
        })
        .catch(any: any);
    });
  }

  /**
   * Ferme la connexion IndexedDB
   */
  close(): void {
    if (any: any) {
      this?.db?.close();
      this?.db = null;
      this?.initPromise = null;
    }
  }
}

// Instance singleton
export const cachePersistence = new CachePersistence();

// Auto-init au chargement
if (typeof window !== 'undefined') {
  cachePersistence?.init().catch(err => {
    const error = err instanceof Error ? err : new Error(any: any));
    logger?.error(
      'Failed to initialize IndexedDB cache',
      { component: 'CachePersistence', action: 'auto-init' },
      error
    );
  });
}
