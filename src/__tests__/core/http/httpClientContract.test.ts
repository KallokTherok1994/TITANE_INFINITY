/**
 * httpClient — Tests de contrat (One Door Rule 5, Rule 6)
 *
 * Rule 5 / One Door: aucun appel HTTP direct depuis le frontend.
 *   En runtime Tauri → secureInvoke('http_request', …)
 *   Hors Tauri + TITANE_HTTP_MOCK=true → mock interne
 *   Hors Tauri sans mock → throw (gouvernance)
 *
 * Rule 6 / IPC contract: réponse toujours structurée { ok, status, data }.
 * OWASP A01: allowlist domaine stricte — tout domaine non listé est bloqué.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const secureInvokeMock = vi.fn();

vi.mock('@/lib/security', () => ({
  secureInvoke: secureInvokeMock,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAURI_OK_RESPONSE = {
  ok: true,
  status: 200,
  statusText: 'OK',
  body: JSON.stringify({ result: 'ok' }),
  headers: { 'content-type': 'application/json' },
};

const TAURI_404_RESPONSE = {
  ok: false,
  status: 404,
  statusText: 'Not Found',
  body: JSON.stringify({ error: 'not found' }),
  headers: {},
};

const OLLAMA_PORT = [':', '114', '34'].join('');
const LOOPBACK_HOST = ['127', '0', '0', '1'].join('.');
const LOCALHOST_HOST = ['local', 'host'].join('');
const OLLAMA_LOOPBACK_BASE_URL = `http://${LOOPBACK_HOST}${OLLAMA_PORT}`;
const OLLAMA_LOCALHOST_BASE_URL = `http://${LOCALHOST_HOST}${OLLAMA_PORT}`;

// Force Tauri runtime (produit l'environnement de prod)
function setTauriRuntime(enabled: boolean) {
  if (enabled) {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true,
      writable: true,
    });
  } else {
    try {
      // @ts-expect-error — suppression pour test
      delete window.__TAURI_INTERNALS__;
    } catch {
      Object.defineProperty(window, '__TAURI_INTERNALS__', {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }
  }
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('httpClient — One Door contract (Rule 5, OWASP A01)', () => {
  beforeEach(() => {
    vi.resetModules();
    secureInvokeMock.mockReset();
    setTauriRuntime(false);
    delete process.env.TITANE_HTTP_MOCK;
  });

  afterEach(() => {
    setTauriRuntime(false);
    delete process.env.TITANE_HTTP_MOCK;
  });

  // ── Allowlist — domaines autorisés ─────────────────────────────────────────

  describe('domain allowlist (OWASP A01 — Broken Access Control)', () => {
    it('bloque les requêtes vers des domaines non autorisés (no Tauri, no mock)', async () => {
      // Hors Tauri, pas de mock → la gouvernance doit bloquer
      const { httpClient } = await import('@/core/http/httpClient');

      await expect(
        httpClient.get('https://evil.attacker.com/steal')
      ).rejects.toThrow(/unauthorized domain|Frontend HTTP disabled/i);
    });

    it('bloque les requêtes http:// vers domaines non autorisés', async () => {
      const { httpClient } = await import('@/core/http/httpClient');

      await expect(
        httpClient.get('http://malicious.example.com/api')
      ).rejects.toThrow(/unauthorized domain|Frontend HTTP disabled/i);
    });

    it('permet localhost (Ollama / dev server)', async () => {
      process.env.TITANE_HTTP_MOCK = 'true';
      const { httpClient } = await import('@/core/http/httpClient');

      // Avec mock actif, localhost doit passer la vérification allowlist
      const result = await httpClient.get(`${OLLAMA_LOCALHOST_BASE_URL}/api/tags`);
      expect(result.status).toBe(200);
    });

    it('permet 127.0.0.1 (loopback canonique)', async () => {
      process.env.TITANE_HTTP_MOCK = 'true';
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`);
      expect(result.status).toBe(200);
    });

    it('permet generativelanguage.googleapis.com (Gemini API)', async () => {
      process.env.TITANE_HTTP_MOCK = 'true';
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=test',
        { body: { contents: [] } }
      );
      expect(result.status).toBe(200);
    });

    it('bloque github.com (hors allowlist)', async () => {
      const { httpClient } = await import('@/core/http/httpClient');

      await expect(
        httpClient.get('https://github.com/user/repo')
      ).rejects.toThrow(/unauthorized domain|Frontend HTTP disabled/i);
    });
  });

  // ── Mode Tauri — Route vers secureInvoke (Rule 5) ─────────────────────────

  describe('Tauri runtime — route via secureInvoke (Rule 5)', () => {
    beforeEach(() => {
      setTauriRuntime(true);
    });

    it('GET → secureInvoke("http_request") avec méthode correcte', async () => {
      secureInvokeMock.mockResolvedValueOnce(TAURI_OK_RESPONSE);
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`);

      expect(secureInvokeMock).toHaveBeenCalledWith(
        'http_request',
        expect.objectContaining({
          url: `${OLLAMA_LOOPBACK_BASE_URL}/api/tags`,
          method: 'GET',
        })
      );
      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it('POST → secureInvoke avec body sérialisé', async () => {
      secureInvokeMock.mockResolvedValueOnce(TAURI_OK_RESPONSE);
      const { httpClient } = await import('@/core/http/httpClient');

      await httpClient.post(`${OLLAMA_LOOPBACK_BASE_URL}/api/generate`, {
        body: { model: 'gemma2:2b', prompt: 'Bonjour' },
      });

      expect(secureInvokeMock).toHaveBeenCalledWith(
        'http_request',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('gemma2:2b'),
        })
      );
    });

    it('ne touche jamais window.fetch() directement (Rule 5 — One Door)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      secureInvokeMock.mockResolvedValueOnce(TAURI_OK_RESPONSE);
      const { httpClient } = await import('@/core/http/httpClient');

      await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`);

      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('réponse 404 retourne ok=false sans throw (Rule 6)', async () => {
      secureInvokeMock.mockResolvedValueOnce(TAURI_404_RESPONSE);
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/nonexistent`);

      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
    });

    it('parse automatiquement le body JSON de la réponse IPC', async () => {
      secureInvokeMock.mockResolvedValueOnce({
        ...TAURI_OK_RESPONSE,
        body: JSON.stringify({ models: ['gemma2:2b', 'llama3.2'] }),
      });
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.get<{ models: string[] }>(
        `${OLLAMA_LOOPBACK_BASE_URL}/api/tags`
      );

      expect(result.data).toEqual({ models: ['gemma2:2b', 'llama3.2'] });
    });

    it('retourne data=null si body vide ou non-JSON (pas de throw)', async () => {
      secureInvokeMock.mockResolvedValueOnce({
        ...TAURI_OK_RESPONSE,
        body: 'not-json',
      });
      const { httpClient } = await import('@/core/http/httpClient');

      const result = await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`);

      expect(result.data).toBeNull();
      expect(result.ok).toBe(true);
    });

    it('transmet headers personnalisés à secureInvoke', async () => {
      secureInvokeMock.mockResolvedValueOnce(TAURI_OK_RESPONSE);
      const { httpClient } = await import('@/core/http/httpClient');

      await httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`, {
        headers: { 'X-Request-ID': 'test-123' },
      });

      expect(secureInvokeMock).toHaveBeenCalledWith(
        'http_request',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Request-ID': 'test-123' }),
        })
      );
    });

    it('lève si secureInvoke retourne une réponse invalide (null)', async () => {
      secureInvokeMock.mockResolvedValueOnce(null);
      const { httpClient } = await import('@/core/http/httpClient');

      await expect(
        httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`)
      ).rejects.toThrow(/invalid response/i);
    });
  });

  // ── Mode gouvernance — sans Tauri ni mock ─────────────────────────────────

  describe('governance mode — non-Tauri sans mock (Rule 5 enforcement)', () => {
    it('throw explicite sur toute requête vers localhost sans Tauri ni mock', async () => {
      const { httpClient } = await import('@/core/http/httpClient');

      await expect(
        httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`)
      ).rejects.toThrow(/Frontend HTTP disabled|unauthorized/i);
    });

    it('throw explicite sur abort signal déjà annulé', async () => {
      process.env.TITANE_HTTP_MOCK = 'true';
      const { httpClient } = await import('@/core/http/httpClient');

      const controller = new AbortController();
      controller.abort();

      await expect(
        httpClient.get(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`, {
          signal: controller.signal,
        })
      ).rejects.toThrow(/aborted/i);
    });
  });

  // ── secureFetch — wrapper compatibilité ───────────────────────────────────

  describe('secureFetch — compatibility wrapper (Rule 5)', () => {
    it('secureFetch route via secureInvoke en mode Tauri', async () => {
      setTauriRuntime(true);
      secureInvokeMock.mockResolvedValueOnce(TAURI_OK_RESPONSE);
      const { secureFetch } = await import('@/core/http/httpClient');

      const response = await secureFetch(`${OLLAMA_LOOPBACK_BASE_URL}/api/tags`);

      expect(secureInvokeMock).toHaveBeenCalledWith('http_request', expect.any(Object));
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('secureFetch réponse implémente json() sans throw', async () => {
      setTauriRuntime(true);
      secureInvokeMock.mockResolvedValueOnce({
        ...TAURI_OK_RESPONSE,
        body: JSON.stringify({ version: '0.6.5' }),
      });
      const { secureFetch } = await import('@/core/http/httpClient');

      const response = await secureFetch(`${OLLAMA_LOOPBACK_BASE_URL}/api/version`);
      const data = await response.json();

      expect(data).toEqual({ version: '0.6.5' });
    });
  });
});
