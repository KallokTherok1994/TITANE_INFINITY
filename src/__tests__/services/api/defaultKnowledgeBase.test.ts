import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeWithRetry } from '@/lib/serviceInvoker';
import {
  getAllEntries,
  getCompactIndex,
  getRelevantPromptContext,
  resetCache,
} from '@/services/api/defaultKnowledgeBase';

vi.mock('@/lib/serviceInvoker', () => ({
  invokeWithRetry: vi.fn(),
  FAST_COMMAND_OPTIONS: {},
}));

describe('defaultKnowledgeBase', () => {
  const mockedInvokeWithRetry = vi.mocked(invokeWithRetry);

  beforeEach(() => {
    resetCache();
    vi.clearAllMocks();
  });

  it('builds a prompt-ready relevant context block from matching knowledge entries', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
              gateway: 'One Door network governance',
            },
          },
        },
        nutrition: {
          id: 'nutrition',
          category: 'nutrition',
          version: 'v30.0.0',
          description: 'Nutrition générale',
          content: {
            tips: ['hydrate', 'sleep'],
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Explique-moi l architecture 4 rings et le One Door de TITANE',
      2
    );

    expect(promptContext).toContain('Connaissances pertinentes TITANE∞');
    expect(promptContext).toContain('system_architecture');
    expect(promptContext).toContain('One Door network governance');
    expect(promptContext).not.toContain('nutrition');
  });

  it('reuses the cached knowledge entries between compact index and relevant context generation', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
            },
          },
        },
      })
    );

    const compactIndex = await getCompactIndex();
    const promptContext = await getRelevantPromptContext('architecture TITANE', 1);

    expect(compactIndex).toContain('system_architecture');
    expect(promptContext).toContain('system_architecture');
    expect(mockedInvokeWithRetry).toHaveBeenCalledTimes(1);
  });

  it('falls back to bundled knowledge entries when the IPC payload is malformed', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce('{not-json');

    const entries = await getAllEntries();
    const promptContext = await getRelevantPromptContext(
      'architecture mémoire profonde TITANE',
      2
    );

    expect(entries.length).toBeGreaterThan(50);
    expect(entries.some(entry => entry.category === 'system_architecture')).toBe(true);
    expect(entries.some(entry => entry.category === 'memory_system_deep')).toBe(true);
    expect(promptContext).toContain('Connaissances pertinentes TITANE∞');
  });

  it('keeps a substantial bundled default knowledge base via fallback entries when IPC is unavailable', async () => {
    mockedInvokeWithRetry.mockRejectedValueOnce(new Error('ipc unavailable'));

    const entries = await getAllEntries();

    expect(entries.length).toBeGreaterThan(50);
    expect(entries.some(entry => entry.category === 'system_architecture')).toBe(true);
    expect(entries.some(entry => entry.category === 'memory_system_deep')).toBe(true);
  });

  it('pins Kevin creator knowledge when the query targets the creator or primary user', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        identity_profile: {
          id: 'identity_profile',
          category: 'identity_profile',
          version: 'v30.0.0',
          description: 'Identité système persistante et cohérente.',
          content: {
            profile: 'Identité persistante TITANE∞',
          },
        },
        style_expression_kevin: {
          id: 'style_expression_kevin',
          category: 'style_expression_kevin',
          version: 'v30.0.0',
          description: 'Style d’expression littéraire et communicationnel.',
          content: {
            tone: 'structuré',
          },
        },
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
            },
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Adapte-toi à Kevin, ton créateur et utilisateur principal',
      2
    );

    expect(promptContext).toContain('identity_profile');
    expect(promptContext).toContain('style_expression_kevin');
  });

  it('pins the personal book registry when the query references the book title', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        kevin_book_registry_v30: {
          id: 'kevin_book_registry_v30',
          category: 'kevin_book_registry_v30',
          version: 'v30.0.0',
          description: 'Registre personnel de manuscrits et livres racines.',
          content: {
            purpose: 'Source de mémoire auteur',
          },
        },
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
            },
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      "Analyse 'Là où tout s'éclaircit' comme mon livre racine",
      2
    );

    expect(promptContext).toContain('kevin_book_registry_v30');
  });

  it('pins the book registry for Humain Total method queries like D.I.S.C.E.R.N.E.R. and RAIN', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        kevin_book_registry_v30: {
          id: 'kevin_book_registry_v30',
          category: 'kevin_book_registry_v30',
          version: 'v30.0.0',
          description: 'Cadre Humain Total, méthode RAIN et protocole D.I.S.C.E.R.N.E.R.',
          content: {
            core_protocols: ['D.I.S.C.E.R.N.E.R.', 'RAIN'],
          },
        },
        kevin_workflow_v30: {
          id: 'kevin_workflow_v30',
          category: 'kevin_workflow_v30',
          version: 'v30.0.0',
          description: 'Workflow structuré de Kevin.',
          content: {
            default_sequence: ['diagnose', 'plan', 'apply'],
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Explique le protocole D.I.S.C.E.R.N.E.R. et la méthode RAIN de Humain Total',
      2
    );

    expect(promptContext).toContain('kevin_book_registry_v30');
  });

  it('pins Kevin public project and audiobook context for portfolio-style queries', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        kevin_owner_profile_v30: {
          id: 'kevin_owner_profile_v30',
          category: 'kevin_owner_profile_v30',
          version: 'v30.0.0',
          description: 'Profil public de Kevin et de ses projets.',
          content: {
            public_projects: ['Humain Total', 'Humain à tout faire', "Kallok's Arts"],
          },
        },
        kevin_book_registry_v30: {
          id: 'kevin_book_registry_v30',
          category: 'kevin_book_registry_v30',
          version: 'v30.0.0',
          description: 'Livres audio et sources d’influence.',
          content: {
            audiobook_influences: ['Pouvoir illimité', "L'effet cumulé"],
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Analyse mon portfolio, Humain Total et mes livres audio',
      2
    );

    expect(promptContext).toContain('kevin_owner_profile_v30');
    expect(promptContext).toContain('kevin_book_registry_v30');
  });

  it('pins the new Kevin public corpus for Codex Vivant and Humain Total ritual queries', async () => {
    mockedInvokeWithRetry.mockResolvedValueOnce(
      JSON.stringify({
        kevin_public_corpus_v30: {
          id: 'kevin_public_corpus_v30',
          category: 'kevin_public_corpus_v30',
          version: 'v30.0.0',
          description: 'Corpus public-safe des écrits récents de Kevin.',
          content: {
            families: ['blog', 'poésie', 'rituels'],
          },
        },
        system_architecture: {
          id: 'system_architecture',
          category: 'system_architecture',
          version: 'v30.0.0',
          description: 'Architecture cœur TITANE∞',
          content: {
            architecture: {
              rings: 4,
            },
          },
        },
      })
    );

    const promptContext = await getRelevantPromptContext(
      'Analyse le Codex Vivant, le sanctuaire intérieur et le rituel du retour au vivant',
      2
    );

    expect(promptContext).toContain('kevin_public_corpus_v30');
  });
});
