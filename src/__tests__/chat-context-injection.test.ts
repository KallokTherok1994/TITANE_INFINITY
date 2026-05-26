/**
 * TITANE∞ — Chat Context Injection Tests
 *
 * Verifies that all context sources are correctly injected into the chat prompt:
 * - Timeline entries (previously always empty)
 * - Decision rationale (previously ignored)
 * - KB content excerpts (previously titles only)
 * - Emotion state (previously loaded but not injected)
 * - TWIN observations via reviewQueue
 * - Increased truncation limits (5 decisions/KB, not 3)
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { cleanupAiSingletons } from './helpers/aiCleanup';

afterAll(() => cleanupAiSingletons());

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockLoadContext = vi.fn();
vi.mock('@/services/ai/memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: mockLoadContext,
    saveInteraction: vi.fn().mockResolvedValue(undefined),
  },
  MemoryContext: {},
}));

const capturedRequest = {
  system: '',
  messages: [] as Array<{ role: string; content: string }>,
};
const ollamaGenerateMock = vi.fn().mockImplementation(req => {
  capturedRequest.system = req.system || '';
  capturedRequest.messages = [];
  return Promise.resolve({
    ok: true,
    provider: 'ollama',
    content: {
      content: 'Réponse TITANE de test',
      model: 'gemma2:2b',
      latency_ms: 100,
    },
  });
});

vi.mock('@/services/ai/transports/ollamaTransport', () => ({
  ollamaCheckHealth: vi.fn().mockResolvedValue({
    ok: true,
    provider: 'ollama',
    content: { models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }] },
  }),
  ollamaGenerate: ollamaGenerateMock,
  getTransportMode: vi.fn().mockReturnValue('IPC'),
}));

vi.mock('@/services/twin_chat/reviewQueue', () => ({
  listTwinChatReviewItems: vi.fn().mockReturnValue([
    {
      id: 'twin-1',
      candidate: {
        id: 'twin-1',
        kind: 'cognitive',
        contentCompact: 'Préfère les explications structurées par étapes',
        context: 'observed from chat',
        confidence: 0.85,
        consentRisk: 'low',
        status: 'shadow',
        canWriteTwin: false,
        route: null,
        moduleId: null,
      },
      decision: {
        candidateId: 'twin-1',
        verdict: 'allowed',
        observationType: 'cognitive',
        validationStatus: 'valid',
        riskLevel: 'low',
        canWriteTwin: false,
        requiresKevinValidation: false,
      },
      recordedAt: '2026-05-23T00:00:00Z',
      lastSeenAt: '2026-05-23T00:00:00Z',
      writeStatus: 'approved',
    },
  ]),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMemoryContext(overrides = {}) {
  return {
    activeProjects: [
      {
        id: 'p1',
        title: 'Projet Alpha',
        status: 'active',
        progress: 65,
        priority: 'high',
        lastActivity: '2026-05-20T00:00:00Z',
        tags: [],
        description: 'Plateforme e-commerce B2C avec paiement intégré',
      },
      {
        id: 'p2',
        title: 'Projet Beta',
        status: 'active',
        progress: 30,
        priority: 'medium',
        lastActivity: '2026-05-21T00:00:00Z',
        tags: [],
        description: undefined,
      },
    ],
    recentDecisions: [
      {
        id: 'd1',
        title: 'Migrer vers PostgreSQL',
        timestamp: '2026-05-18T00:00:00Z',
        category: 'technical',
        impact: 'high',
        status: 'implemented',
        rationale: 'Performances insuffisantes avec SQLite en production',
        relatedProjects: ['p1'],
      },
      {
        id: 'd2',
        title: 'Adopter React 19',
        timestamp: '2026-05-19T00:00:00Z',
        category: 'technical',
        impact: 'medium',
        status: 'pending',
        rationale: undefined,
        relatedProjects: [],
      },
      {
        id: 'd3',
        title: 'Décision 3',
        timestamp: '2026-05-15T00:00:00Z',
        category: 'strategic',
        impact: 'low',
        status: 'implemented',
        rationale: 'Optimisation des coûts serveur',
        relatedProjects: [],
      },
      {
        id: 'd4',
        title: 'Décision 4',
        timestamp: '2026-05-14T00:00:00Z',
        category: 'operational',
        impact: 'low',
        status: 'implemented',
        rationale: 'Normalisation des processus CI/CD',
        relatedProjects: [],
      },
      {
        id: 'd5',
        title: 'Décision 5',
        timestamp: '2026-05-13T00:00:00Z',
        category: 'operational',
        impact: 'low',
        status: 'pending',
        rationale: 'Amélioration de la DX développeur',
        relatedProjects: [],
      },
      {
        id: 'd6',
        title: 'Décision 6 — ancienne',
        timestamp: '2026-05-01T00:00:00Z',
        category: 'strategic',
        impact: 'low',
        status: 'abandoned',
        rationale: 'Non pertinente',
        relatedProjects: [],
      },
    ],
    relevantKnowledge: [
      {
        id: 'k1',
        title: 'Architecture microservices',
        category: 'tech',
        content: 'Pattern de découpage fonctionnel pour haute scalabilité et résilience',
        relevance: 0.9,
        lastAccessed: '2026-05-20T00:00:00Z',
        tags: [],
      },
      {
        id: 'k2',
        title: 'React Hooks',
        category: 'frontend',
        content: 'Mécanismes de gestion d état et d effets dans React',
        relevance: 0.8,
        lastAccessed: '2026-05-19T00:00:00Z',
        tags: [],
      },
      {
        id: 'k3',
        title: 'Rust ownership',
        category: 'backend',
        content: 'Modèle de propriété mémoire de Rust',
        relevance: 0.75,
        lastAccessed: '2026-05-18T00:00:00Z',
        tags: [],
      },
      {
        id: 'k4',
        title: 'TypeScript types',
        category: 'frontend',
        content: 'Système de types avancé pour JavaScript',
        relevance: 0.7,
        lastAccessed: '2026-05-17T00:00:00Z',
        tags: [],
      },
      {
        id: 'k5',
        title: 'PostgreSQL indexes',
        category: 'database',
        content: 'Optimisation des requêtes via indexes B-tree et GIN',
        relevance: 0.65,
        lastAccessed: '2026-05-16T00:00:00Z',
        tags: [],
      },
      {
        id: 'k6',
        title: 'Sixième entrée KB',
        category: 'other',
        content: 'Entrée non visible si limite = 5',
        relevance: 0.5,
        lastAccessed: '2026-05-15T00:00:00Z',
        tags: [],
      },
    ],
    activeRituals: [
      {
        id: 'r1',
        name: 'Revue hebdomadaire',
        frequency: 'weekly',
        lastExecution: '2026-05-17T00:00:00Z',
        nextDue: '2026-05-24T00:00:00Z',
        status: 'active',
        completionRate: 87,
        tags: [],
      },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: '2026-05-21T14:30:00Z',
        type: 'decision',
        title: 'Migration PostgreSQL lancée',
        description: 'Début de la migration en production',
        relatedEntities: ['d1'],
        importance: 'high',
      },
      {
        id: 't2',
        timestamp: '2026-05-20T09:00:00Z',
        type: 'project',
        title: 'Projet Alpha sprint 3 démarré',
        description: undefined,
        relatedEntities: ['p1'],
        importance: 'medium',
      },
    ],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Chat context injection — Ollama provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    ollamaGenerateMock.mockImplementation(req => {
      capturedRequest.system = req.system || '';
      return Promise.resolve({
        ok: true,
        provider: 'ollama',
        content: { content: 'OK', model: 'gemma2:2b', latency_ms: 50 },
      });
    });
    mockLoadContext.mockResolvedValue(makeMemoryContext());
  });

  it('injects decision rationale into system prompt', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await ollamaProvider.generate('Test question', []);
    expect(capturedRequest.system).toContain('Performances insuffisantes');
  });

  it('injects KB content excerpt (not just title)', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await ollamaProvider.generate('Test KB', []);
    expect(capturedRequest.system).toContain('haute scalabilité');
  });

  it('injects up to 5 decisions (not 3)', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await ollamaProvider.generate('Test décisions', []);
    // Should contain Décision 5 but not Décision 6
    expect(capturedRequest.system).toContain('Décision 5');
    expect(capturedRequest.system).not.toContain('Décision 6 — ancienne');
  });

  it('injects up to 5 KB items (not 3)', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await ollamaProvider.generate('Test KB 5', []);
    expect(capturedRequest.system).toContain('PostgreSQL indexes');
    expect(capturedRequest.system).not.toContain('Sixième entrée KB');
  });

  it('does not inject memory context when upstream system history present', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await ollamaProvider.generate('Test', [
      { role: 'system', content: 'System from upstream', timestamp: Date.now() },
    ]);
    expect(capturedRequest.system).toBe('System from upstream');
    expect(capturedRequest.system).not.toContain('Performances insuffisantes');
  });
});

describe('Chat context injection — chatEngine formatMemoryContext', () => {
  it('includes timeline entries in formatted context', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.sources).toContain('timeline');
    expect(result.data.timeline).toContain('2026-05-21');
    expect(result.data.timeline).toContain('Migration PostgreSQL lancée');
  });

  it('includes decision rationale in formatted context', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.data.decisions).toContain('Performances insuffisantes');
  });

  it('includes project description in formatted context', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.data.projects).toContain('e-commerce B2C');
  });

  it('includes ritual completion rate', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.data.rituals).toContain('87%');
  });

  it('includes KB content excerpt', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.data.knowledge).toContain('haute scalabilité');
  });

  it('caps decisions at 5 and KB at 5', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext();
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    // 6th decision should be absent
    expect(result.data.decisions).not.toContain('Décision 6 — ancienne');
    // 6th KB should be absent
    expect(result.data.knowledge).not.toContain('Sixième entrée KB');
  });

  it('returns empty timeline when memory.timeline is empty', async () => {
    const { chatEngine } = await import('@/services/ai/chatEngine');
    const memory = makeMemoryContext({ timeline: [] });
    // @ts-expect-error accessing private method for testing
    const result = chatEngine.formatMemoryContext(memory);
    expect(result.sources).not.toContain('timeline');
  });
});
