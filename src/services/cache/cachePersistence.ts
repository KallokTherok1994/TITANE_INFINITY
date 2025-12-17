/**
 * TITANE∞ v24.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 💾 INDEXEDDB CACHE PERSISTENCE
 * Persistence du cache de réponses pour survie aux reloads
 * Impact: Cache survit au reload browser → -99% latence immédiate
 */

import { type CacheKey, type CacheEntry } from './responseCache';

const DB_NAME = 'titane_response_cache';
const DB_VERSION = 1;
const STORE_NAME = 'responses';

export class CachePersistence {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialise la base de données IndexedDB
   */
  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer l'object store si nécessaire
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          // Index pour recherche par timestamp
          store.createIndex('timestamp', 'timestamp', { unique: false });
          // Index pour recherche par provider
          store.createIndex('provider', 'provider', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Génère une clé de persistence
   */
  private generatePersistenceKey(key: CacheKey): string {
    const normalized = key.message.toLowerCase().trim();
    return `${key.mode ?? 'default'}:${key.provider ?? 'auto'}:${normalized}`;
  }

  /**
   * Sauvegarde une entrée dans IndexedDB
   */
  async save(key: CacheKey, entry: CacheEntry): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not initialized');

    const persistenceKey = this.generatePersistenceKey(key);
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const persistentEntry = {
        key: persistenceKey,
        ...entry,
      };

      const request = store.put(persistentEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save to IndexedDB'));
    });
  }

  /**
   * Charge une entrée depuis IndexedDB
   */
  async load(key: CacheKey): Promise<CacheEntry | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const persistenceKey = this.generatePersistenceKey(key);
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(persistenceKey);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Retirer la clé de persistence
        const { key: _, ...entry } = result;
        resolve(entry as CacheEntry);
      };

      request.onerror = () => reject(new Error('Failed to load from IndexedDB'));
    });
  }

  /**
   * Charge toutes les entrées depuis IndexedDB
   */
  async loadAll(): Promise<Map<string, CacheEntry>> {
    if (!this.db) await this.init();
    if (!this.db) return new Map();
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = new Map<string, CacheEntry>();

        for (const result of request.result) {
          const { key, ...entry } = result;
          entries.set(key as string, entry as CacheEntry);
        }

        resolve(entries);
      };

      request.onerror = () => reject(new Error('Failed to load all from IndexedDB'));
    });
  }

  /**
   * Supprime une entrée d'IndexedDB
   */
  async delete(key: CacheKey): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const persistenceKey = this.generatePersistenceKey(key);
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(persistenceKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete from IndexedDB'));
    });
  }

  /**
   * Supprime toutes les entrées d'IndexedDB
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear IndexedDB'));
    });
  }

  /**
   * Nettoie les entrées expirées
   */
  async cleanup(ttlMs: number): Promise<number> {
    if (!this.db) await this.init();
    if (!this.db) return 0;

    const now = Date.now();
    const expiredThreshold = now - ttlMs;
    let deletedCount = 0;
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');

      // Curseur pour itérer sur les entrées triées par timestamp
      const request = index.openCursor();

      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const entry = cursor.value;

          // Si expiré, supprimer
          if (entry.timestamp < expiredThreshold) {
            cursor.delete();
            deletedCount++;
          }

          cursor.continue();
        } else {
          // Fin du curseur
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(new Error('Failed to cleanup IndexedDB'));
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
    if (!this.db) await this.init();
    if (!this.db)
      return {
        entryCount: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    const db = this.db;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();
      const getAllRequest = store.getAll();

      Promise.all([
        new Promise<number>(res => {
          countRequest.onsuccess = () => res(countRequest.result);
        }),
        new Promise<unknown[]>(res => {
          getAllRequest.onsuccess = () => res(getAllRequest.result);
        }),
      ])
        .then(([count, entries]) => {
          let totalSize = 0;
          let oldest = Infinity;
          let newest = 0;

          for (const entry of entries as Array<{ timestamp: number; content: string }>) {
            // Estimation: JSON.stringify length
            totalSize += JSON.stringify(entry).length;
            oldest = Math.min(oldest, entry.timestamp);
            newest = Math.max(newest, entry.timestamp);
          }

          resolve({
            entryCount: count,
            totalSize,
            oldestEntry: oldest === Infinity ? null : oldest,
            newestEntry: newest === 0 ? null : newest,
          });
        })
        .catch(reject);
    });
  }

  /**
   * Ferme la connexion IndexedDB
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Instance singleton
export const cachePersistence = new CachePersistence();

// Auto-init au chargement
if (typeof window !== 'undefined') {
  cachePersistence.init().catch(err => {
    console.error('[CachePersistence] Failed to initialize IndexedDB:', err);
  });
}
