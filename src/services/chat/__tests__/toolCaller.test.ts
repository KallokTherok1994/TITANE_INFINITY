/**
 * TITANE∞ — ToolCallerService — Suite de tests complète v31.2.32
 *
 * Couverture:
 *   1. registerTool()       — enregistrement, validation, overwrite
 *   2. getToolDescriptions() — structure de la sortie
 *   3. parseToolCalls()     — format JSON primaire, XML legacy, edge cases
 *   4. executeToolCall()    — outil existant, inexistant, erreur dans execute
 *   5. executeToolCalls()   — parallélisme
 *   6. web_search intégration — webSearch() appelé correctement
 *   7. calculate            — arithmetic safe, sécurité sandbox
 *   8. get_time             — structure de la réponse
 *   9. getToolCaller()      — singleton
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────
// Mock webResearchService AVANT l'import de ToolCallerService
// ─────────────────────────────────────────────────────────────────

const webSearchMock = vi.fn();

vi.mock('@/services/webResearchService', () => ({
  webSearch: (...args: unknown[]) => webSearchMock(...args),
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Import après les mocks
import { ToolCallerService, getToolCaller } from '../toolCaller';
import type { ToolDefinition } from '../toolCaller';

// ═══════════════════════════════════════════════════════════════════
// 1. registerTool()
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — registerTool()', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
    webSearchMock.mockReset();
  });

  it('enregistre un outil et le rend visible dans getToolDescriptions()', () => {
    const tool: ToolDefinition = {
      name: 'test_tool',
      description: 'Outil de test',
      execute: async () => ({ ok: true }),
    };

    service.registerTool(tool);
    const descriptions = service.getToolDescriptions();

    expect(descriptions).toContain('test_tool');
  });

  it('throw si le nom est absent', () => {
    const tool = {
      name: '',
      description: 'Sans nom',
      execute: async () => ({}),
    } as ToolDefinition;

    expect(() => service.registerTool(tool)).toThrow();
  });

  it('throw si execute est absent', () => {
    const tool = {
      name: 'bad_tool',
      description: 'Sans execute',
    } as unknown as ToolDefinition;

    expect(() => service.registerTool(tool)).toThrow();
  });

  it("écrase un outil existant sans lever d'erreur (overwrite silent)", () => {
    const tool1: ToolDefinition = {
      name: 'my_tool',
      description: 'V1',
      execute: async () => ({ version: 1 }),
    };
    const tool2: ToolDefinition = {
      name: 'my_tool',
      description: 'V2',
      execute: async () => ({ version: 2 }),
    };

    service.registerTool(tool1);
    expect(() => service.registerTool(tool2)).not.toThrow();
    expect(service.getToolDescriptions()).toContain('V2');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. getToolDescriptions()
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — getToolDescriptions()', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
  });

  it('retourne une string non vide', () => {
    const result = service.getToolDescriptions();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contient les outils built-in (web_search, calculate, get_time)', () => {
    const result = service.getToolDescriptions();
    expect(result).toContain('web_search');
    expect(result).toContain('calculate');
    expect(result).toContain('get_time');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. parseToolCalls()
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — parseToolCalls()', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
  });

  it('parse le format JSON primaire {"tool_name": "...", "arg": "val"}', () => {
    const text = 'Voici le calcul: {"tool_name": "calculate", "expression": "2+2"}';
    const calls = service.parseToolCalls(text);

    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('calculate');
    expect(calls[0].arguments.expression).toBe('2+2');
  });

  it('parse le format XML legacy <tool name="..." />', () => {
    const text = 'Legacy call: <tool name="get_time" />';
    const calls = service.parseToolCalls(text);

    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('get_time');
  });

  it('retourne [] pour un texte sans outils', () => {
    const text = 'Bonjour, comment puis-je vous aider?';
    const calls = service.parseToolCalls(text);

    expect(calls).toEqual([]);
  });

  it('retourne [] pour un JSON malformé (pas de throw)', () => {
    const text = '{ "tool_name": "calculate", "expression": }'; // malformé
    expect(() => service.parseToolCalls(text)).not.toThrow();
  });

  it('parse deux outils JSON et retourne 2 entrées', () => {
    const text = [
      '{"tool_name": "get_time"}',
      '{"tool_name": "calculate", "expression": "3*3"}',
    ].join(' ');
    const calls = service.parseToolCalls(text);

    expect(calls.length).toBeGreaterThanOrEqual(2);
    const names = calls.map(c => c.name);
    expect(names).toContain('get_time');
    expect(names).toContain('calculate');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. executeToolCall()
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — executeToolCall()', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
    webSearchMock.mockReset();
  });

  it('exécute un outil existant et retourne le résultat', async () => {
    const customTool: ToolDefinition = {
      name: 'my_func',
      description: 'Fonction test',
      execute: async (args) => ({ echoed: args.input }),
    };
    service.registerTool(customTool);

    const { result, error } = await service.executeToolCall('my_func', { input: 'hello' });

    expect(error).toBeUndefined();
    expect((result as Record<string, unknown>).echoed).toBe('hello');
  });

  it('retourne { result: null, error: "..." } si outil inexistant', async () => {
    const { result, error } = await service.executeToolCall('unknown_tool', {});

    expect(result).toBeNull();
    expect(error).toBeDefined();
    expect(error).toContain('unknown_tool');
  });

  it('retourne { result: null, error: "..." } si execute throw', async () => {
    const failingTool: ToolDefinition = {
      name: 'failing_tool',
      description: 'Lève une erreur',
      execute: async () => { throw new Error('Intentional failure'); },
    };
    service.registerTool(failingTool);

    const { result, error } = await service.executeToolCall('failing_tool', {});

    expect(result).toBeNull();
    expect(error).toContain('Intentional failure');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. executeToolCalls() — parallélisme
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — executeToolCalls()', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
    webSearchMock.mockReset();
  });

  it('exécute deux appels en parallèle et retourne les deux résultats', async () => {
    const toolA: ToolDefinition = {
      name: 'tool_a', description: 'A',
      execute: async () => ({ from: 'A' }),
    };
    const toolB: ToolDefinition = {
      name: 'tool_b', description: 'B',
      execute: async () => ({ from: 'B' }),
    };
    service.registerTool(toolA);
    service.registerTool(toolB);

    const results = await service.executeToolCalls([
      { name: 'tool_a', arguments: {} },
      { name: 'tool_b', arguments: {} },
    ]);

    expect(results).toHaveLength(2);
    const names = results.map(r => r.toolName);
    expect(names).toContain('tool_a');
    expect(names).toContain('tool_b');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. web_search intégration
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — web_search intégration', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
    webSearchMock.mockReset();
  });

  it('appelle webSearch() avec query et maxResults', async () => {
    webSearchMock.mockResolvedValueOnce({ ok: true, content: [], error: null });

    await service.executeToolCall('web_search', { query: 'IA générative', maxResults: 3 });

    expect(webSearchMock).toHaveBeenCalledWith('IA générative', 3);
  });

  it('retourne { results: [...] } quand webSearch ok:true avec contenu', async () => {
    webSearchMock.mockResolvedValueOnce({
      ok: true,
      content: [
        { title: 'Article IA', url: 'https://example.com', snippet: 'Description IA' },
      ],
      error: null,
    });

    const { result } = await service.executeToolCall('web_search', { query: 'IA', maxResults: 5 });

    expect((result as Record<string, unknown>).results).toHaveLength(1);
    expect(
      ((result as Record<string, unknown>).results as Array<Record<string, unknown>>)[0].title
    ).toBe('Article IA');
  });

  it('retourne { results: [], error: "..." } quand webSearch ok:false', async () => {
    webSearchMock.mockResolvedValueOnce({
      ok: false,
      content: null,
      error: { code: 'SEARXNG_TIMEOUT', message: 'Connexion expirée' },
    });

    const { result } = await service.executeToolCall('web_search', { query: 'test', maxResults: 5 });

    expect((result as Record<string, unknown>).results).toEqual([]);
    expect(typeof (result as Record<string, unknown>).error).toBe('string');
    expect((result as Record<string, unknown>).error).toContain('Connexion expirée');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. calculate — sandboxe sécurisée
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — calculate', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
  });

  it('calcule 2+2 = 4', async () => {
    const { result, error } = await service.executeToolCall('calculate', { expression: '2+2' });
    expect(error).toBeUndefined();
    expect((result as Record<string, unknown>).result).toBe(4);
  });

  it('calcule 3*7 = 21', async () => {
    const { result } = await service.executeToolCall('calculate', { expression: '3*7' });
    expect((result as Record<string, unknown>).result).toBe(21);
  });

  it('retourne une erreur sur division par zéro', async () => {
    const { result, error } = await service.executeToolCall('calculate', { expression: '10/0' });
    expect(result).toBeNull();
    expect(error).toContain('zero');
  });

  it("bloque les injections de code via le pattern allowedPattern (';alert()')", async () => {
    const { result, error } = await service.executeToolCall('calculate', {
      expression: '2+2;alert(1)',
    });
    expect(result).toBeNull();
    expect(error).toBeDefined();
    expect(typeof error).toBe('string');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. get_time
// ═══════════════════════════════════════════════════════════════════

describe('ToolCallerService — get_time', () => {
  let service: ToolCallerService;

  beforeEach(() => {
    service = new ToolCallerService();
  });

  it('retourne un objet avec iso, locale, timestamp', async () => {
    const { result, error } = await service.executeToolCall('get_time', {});

    expect(error).toBeUndefined();
    const r = result as Record<string, unknown>;
    expect(r).toHaveProperty('iso');
    expect(r).toHaveProperty('locale');
    expect(r).toHaveProperty('timestamp');
  });

  it('iso est une string ISO valide et timestamp est un number', async () => {
    const { result } = await service.executeToolCall('get_time', {});
    const r = result as Record<string, unknown>;

    expect(typeof r.iso).toBe('string');
    expect(typeof r.timestamp).toBe('number');
    expect(new Date(r.iso as string).toISOString()).toBe(r.iso);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. getToolCaller() — singleton
// ═══════════════════════════════════════════════════════════════════

describe('getToolCaller() — singleton', () => {
  it('retourne toujours la même instance', () => {
    const instance1 = getToolCaller();
    const instance2 = getToolCaller();

    expect(instance1).toBe(instance2);
  });

  it('est une instance de ToolCallerService', () => {
    const instance = getToolCaller();
    expect(instance).toBeInstanceOf(ToolCallerService);
  });
});
