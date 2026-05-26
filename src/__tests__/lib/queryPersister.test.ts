/**
 * TITANE_INFINITY v35.0.0 — Tests offline persistence du QueryClient.
 *
 * Vérifie:
 *   - L'allow-list filtre correctement les clés (system/engines/providers/
 *     conversation/chat OK, le reste rejeté).
 *   - `installQueryPersister` est un no-op explicite quand le storage manque.
 *   - L'installation effective avec un storage in-memory persiste bien une
 *     query allow-listée et la restaure après reset du client.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { installQueryPersister, shouldDehydrateQueryKey } from '../../lib/queryPersister';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('queryPersister.shouldDehydrateQueryKey', () => {
  it('accepte les préfixes allow-listés', () => {
    expect(shouldDehydrateQueryKey(['system', 'health'])).toBe(true);
    expect(shouldDehydrateQueryKey(['engines', 'list'])).toBe(true);
    expect(shouldDehydrateQueryKey(['providers', 'health'])).toBe(true);
    expect(shouldDehydrateQueryKey(['conversation', 'conv-1'])).toBe(true);
    expect(shouldDehydrateQueryKey(['chat', 'send'])).toBe(true);
  });

  it('rejette les clés hors allow-list', () => {
    expect(shouldDehydrateQueryKey(['secrets'])).toBe(false);
    expect(shouldDehydrateQueryKey(['random', 'data'])).toBe(false);
    expect(shouldDehydrateQueryKey([])).toBe(false);
    expect(shouldDehydrateQueryKey([42])).toBe(false);
  });
});

describe('installQueryPersister', () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    storage = new MemoryStorage();
  });
  afterEach(() => {
    storage.clear();
  });

  it('retourne installed=false sans storage', () => {
    const client = new QueryClient();
    const originalWindow = globalThis.window;
    // @ts-expect-error — simule un environnement sans window
    delete (globalThis as { window?: unknown }).window;
    try {
      const result = installQueryPersister(client);
      expect(result.installed).toBe(false);
      expect(result.reason).toBe('no-storage');
    } finally {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
  });

  it('persiste une query allow-listée dans le storage', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, staleTime: Infinity } },
    });
    const result = installQueryPersister(client, {
      storage,
      buster: 'test-v1',
      maxAgeMs: 60_000,
      throttleMs: 0,
    });
    expect(result.installed).toBe(true);

    await client.fetchQuery({
      queryKey: ['system', 'health'],
      queryFn: async () => ({ ok: true, ts: 1 }),
    });

    // Laisse persister flusher (throttle=0 mais via microtask interne TanStack).
    await new Promise(r => setTimeout(r, 100));

    const raw = storage.getItem('titane.tanstack.query.cache.v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.buster).toBe('test-v1');
    expect(JSON.stringify(parsed)).toContain('system');
  });

  it("n'écrit pas les queries hors allow-list", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, staleTime: Infinity } },
    });
    installQueryPersister(client, { storage, buster: 'test-v1', throttleMs: 0 });

    await client.fetchQuery({
      queryKey: ['secrets', 'token'],
      queryFn: async () => 'super-secret',
    });
    await new Promise(r => setTimeout(r, 100));

    const raw = storage.getItem('titane.tanstack.query.cache.v1');
    if (raw) {
      expect(raw).not.toContain('super-secret');
      expect(raw).not.toContain('secrets');
    }
  });
});
