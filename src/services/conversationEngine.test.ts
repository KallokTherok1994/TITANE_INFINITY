import { describe, expect, it, vi } from 'vitest';

const memoryServiceMock = vi.hoisted(() => ({
  getKnowledge: vi.fn(),
  saveChatInteraction: vi.fn(),
}));

const defaultKnowledgeBaseMock = vi.hoisted(() => ({
  getRelevantPromptContext: vi.fn(),
}));

const skillActivatorMock = vi.hoisted(() => ({
  getActiveSkill: vi.fn(),
  getActiveSkillId: vi.fn(),
  getSystemPromptForSkill: vi.fn(),
}));

const advancedAgentStatusMocks = vi.hoisted(() => ({
  getMonitoringAgentStatus: vi.fn(),
  getDiagnosticAgentStatus: vi.fn(),
  getExplainabilityAgentStatus: vi.fn(),
  getOrchestratorAgentStatus: vi.fn(),
  getSecurityActiveAgentStatus: vi.fn(),
}));

const canonicalKernelMock = vi.hoisted(() => ({
  discern: vi.fn(),
}));

const memoryIntegrationMock = vi.hoisted(() => ({
  loadContext: vi.fn(),
  loadPreferences: vi.fn(),
  getDepthPreference: vi.fn(),
  getHybridMemoryDiagnostics: vi.fn(),
}));

const singularityBridgeMock = vi.hoisted(() => ({
  getCachedCoherence: vi.fn(),
}));

vi.mock('@/lib/security', () => {
  return {
    secureInvoke: vi.fn(),
    ALLOWED_COMMANDS: new Set([
      'web_research',
      'http_request',
      'memory_recall_semantic',
      'vector_store_search',
      'conversation_generate',
    ]),
  };
});

const mcpOrchestratorMock = vi.hoisted(() => ({
  getHealth: vi.fn(),
}));

vi.mock('@/services/mcp/MCPOrchestrator', () => ({
  MCPOrchestrator: mcpOrchestratorMock,
}));

vi.mock('@/services/ai/orchestrator', () => {
  return {
    aiOrchestrator: {
      generate: vi.fn(),
      getProvidersStatus: vi.fn(),
    },
  };
});

vi.mock('@/services/ai/canonicalDiscernmentKernel', () => ({
  canonicalDiscernmentKernel: canonicalKernelMock,
}));

vi.mock('@/services/ai/memoryIntegration', () => ({
  memoryIntegration: memoryIntegrationMock,
}));

vi.mock('@/services/singularityBridge', () => ({
  SingularityBridge: singularityBridgeMock,
}));

vi.mock('@/services/api/memory', () => {
  return {
    memoryService: memoryServiceMock,
  };
});

vi.mock('@/services/api/defaultKnowledgeBase', () => {
  return {
    getRelevantPromptContext: defaultKnowledgeBaseMock.getRelevantPromptContext,
  };
});

vi.mock('@/services/skills/activation/skillActivator', () => {
  return {
    getActiveSkill: skillActivatorMock.getActiveSkill,
    getActiveSkillId: skillActivatorMock.getActiveSkillId,
    getSystemPromptForSkill: skillActivatorMock.getSystemPromptForSkill,
  };
});

vi.mock('@/services/monitoring', () => ({
  getMonitoringAgentStatus: advancedAgentStatusMocks.getMonitoringAgentStatus,
}));

vi.mock('@/services/diagnostic', () => ({
  getDiagnosticAgentStatus: advancedAgentStatusMocks.getDiagnosticAgentStatus,
}));

vi.mock('@/services/explainability', () => ({
  getExplainabilityAgentStatus: advancedAgentStatusMocks.getExplainabilityAgentStatus,
}));

vi.mock('@/services/orchestrator', () => ({
  getOrchestratorAgentStatus: advancedAgentStatusMocks.getOrchestratorAgentStatus,
}));

vi.mock('@/services/security_active', () => ({
  getSecurityActiveAgentStatus: advancedAgentStatusMocks.getSecurityActiveAgentStatus,
}));

import { secureInvoke } from '@/lib/security';
import { aiOrchestrator } from '@/services/ai/orchestrator';
import {
  getStaticPromptContext,
  processMessage,
  resetStaticPromptContextCache,
} from '@/services/conversationEngine';

function createCanonicalDecisionMock(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'default',
    modeClassification: {
      canonicalMode: 'STANDARD_CHAT',
      confidence: 0.82,
      reasonCode: 'KERNEL_OK',
      signals: ['kernel'],
    },
    profileId: 'BALANCED',
    profileLabel: 'Equilibre',
    inferenceState: 'SAFE_TO_INFER',
    memoryInjection: {
      use: false,
      sources: [],
      maxTokens: 0,
      relevance: 'low',
    },
    provider: {
      name: 'ollama',
      model: 'auto',
      fallback: ['titane-local'],
      temperature: 0.7,
      maxTokens: 16384,
      reasoningEffort: 'medium',
    },
    skillId: null,
    fallbackChain: ['titane-local'],
    truthStatus: 'STABLE_PARTIAL',
    reasoning: 'kernel reasoning',
    confidence: 0.82,
    messageComplexity: 0.41,
    signals: [],
    timestamp: 1713390000000,
    processingTimeMs: 5,
    ...overrides,
  };
}

describe('conversationEngine.processMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStaticPromptContextCache();
    localStorage.clear();
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__ = false;
    delete (window as Record<string, unknown>).__TITANE_E2E_CHAT_SCENARIO__;
    delete (window as Record<string, unknown>).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__;
    delete (window as Record<string, unknown>).__TITANE_E2E_CHAT_MEMORY_LOG__;
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);
    defaultKnowledgeBaseMock.getRelevantPromptContext.mockResolvedValue('');
    skillActivatorMock.getActiveSkill.mockReturnValue(null);
    skillActivatorMock.getActiveSkillId.mockReturnValue(null);
    skillActivatorMock.getSystemPromptForSkill.mockReturnValue(null);
    advancedAgentStatusMocks.getMonitoringAgentStatus.mockReturnValue({
      id: 'monitoring',
      readiness: 'partial',
      serviceState: 'monitoring runtime',
      nextStep: 'next monitoring',
    });
    advancedAgentStatusMocks.getDiagnosticAgentStatus.mockReturnValue({
      id: 'diagnostic',
      readiness: 'partial',
      serviceState: 'diagnostic runtime',
      nextStep: 'next diagnostic',
    });
    advancedAgentStatusMocks.getExplainabilityAgentStatus.mockReturnValue({
      id: 'explainability',
      readiness: 'partial',
      serviceState: 'explainability runtime',
      nextStep: 'next explainability',
    });
    advancedAgentStatusMocks.getOrchestratorAgentStatus.mockReturnValue({
      id: 'orchestrator',
      readiness: 'partial',
      serviceState: 'orchestrator runtime',
      nextStep: 'next orchestrator',
    });
    advancedAgentStatusMocks.getSecurityActiveAgentStatus.mockReturnValue({
      id: 'security_active',
      readiness: 'partial',
      serviceState: 'security runtime',
      nextStep: 'next security',
    });
    memoryIntegrationMock.loadContext.mockResolvedValue({
      activeProjects: [],
      recentDecisions: [],
      relevantKnowledge: [],
      activeRituals: [],
      timeline: [],
    });
    memoryIntegrationMock.loadPreferences.mockReturnValue([]);
    memoryIntegrationMock.getDepthPreference.mockReturnValue(null);
    memoryIntegrationMock.getHybridMemoryDiagnostics.mockReturnValue({
      hybridOrchestrationEnabled: false,
      lastHybridOrchestrationStatus: 'idle',
      lastHybridOrchestrationCount: 0,
      lastHybridOrchestrationReason: 'test',
    });
    singularityBridgeMock.getCachedCoherence.mockReturnValue(0.5);
    canonicalKernelMock.discern.mockReturnValue(createCanonicalDecisionMock());
    vi.mocked(aiOrchestrator.getProvidersStatus).mockResolvedValue({
      providers: [{ name: 'ollama', reliability: 98 }],
    } as Awaited<ReturnType<typeof aiOrchestrator.getProvidersStatus>>);
    mcpOrchestratorMock.getHealth.mockReturnValue({
      globalStatus: 'HEALTHY',
    });
  });

  it('normalizes missing metadata with safe defaults', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce('c1') // createNewConversation
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Hello',
        conversationId: 'c1',
        messageId: 'm1',
        metadata: undefined,
      }); // conversationGenerate

    const response = await processMessage('Hi');

    expect(response.metadata).toBeDefined();
    expect(response.metadata.provider_used).toBe('fallback');
    expect(response.metadata.latency_ms).toBe(0);
    expect(response.metadata.tokens_used).toBe(0);
    expect(response.metadata.memory_effect).toBe('New');
    expect(Array.isArray(response.metadata.links_to_contexts)).toBe(true);
  });

  it('preserves provided metadata values when valid', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce('c2') // createNewConversation
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c2',
        messageId: 'm2',
        metadata: {
          timestamp: 123,
          provider_used: 'local',
          latency_ms: 42,
          tokens_used: 7,
          memory_effect: 'Recall',
          links_to_contexts: ['a', 1, null, 'b'],
        },
      });

    const response = await processMessage('Hi');

    expect(response.metadata.timestamp).toBe(123);
    expect(response.metadata.provider_used).toBe('local');
    expect(response.metadata.latency_ms).toBe(42);
    expect(response.metadata.tokens_used).toBe(7);
    expect(response.metadata.memory_effect).toBe('Recall');
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining([
        'a',
        'b',
        'runtime_knowledge:empty',
        'default_kb:empty',
        'persistent_memory:empty',
      ])
    );
  });

  it('wraps conversation_generate payload under args', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c3',
        messageId: 'm3',
        metadata: {},
      }); // conversationGenerate

    await processMessage('Hi', { conversationId: 'c3' });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall).toBeDefined();
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          message: 'Hi',
          conversationId: 'c3',
          temperature: 0.7,
          maxTokens: 32768,
          aiConfig: expect.objectContaining({
            max_tokens: 32768,
          }),
        }),
      })
    );
  });

  it('does not truncate an ultra-long conversation payload before conversation_generate', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce(null).mockResolvedValueOnce({
      content: 'Ok ultra long',
      conversationId: 'c3-ultra',
      messageId: 'm3-ultra',
      metadata: {},
    });

    const ultraLongMessage = `ULTRA-START ${'segment ultra long '.repeat(3200)}ULTRA-END`;

    await processMessage(ultraLongMessage, { conversationId: 'c3-ultra' });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          message: ultraLongMessage,
          conversationId: 'c3-ultra',
        }),
      })
    );
  });

  it('floors canonical chat output tokens to the backend ceiling on the active surface', async () => {
    canonicalKernelMock.discern.mockReturnValue(
      createCanonicalDecisionMock({
        profileId: 'BALANCED',
        provider: {
          name: 'ollama',
          model: 'auto',
          fallback: ['titane-local'],
          temperature: 0.61,
          maxTokens: 16384,
          reasoningEffort: 'medium',
        },
      })
    );

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Budget canonique',
          conversationId: 'c3-floor',
          messageId: 'm3-floor',
          metadata: {},
        };
      }

      return null;
    });

    await processMessage('Hi', { conversationId: 'c3-floor' });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          temperature: 0.61,
          maxTokens: 32768,
          aiConfig: expect.objectContaining({
            temperature: 0.61,
            max_tokens: 32768,
          }),
        }),
      })
    );
  });

  it('recovers with orchestrator fallback when tauriProtector clamps conversation_generate IPC', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        content: 'IPC_INVALID_ARGS: Erreur IPC: incompatibilité frontend-backend',
        conversationId: 'c-ipc',
        messageId: 'm-ipc',
        latencyMs: 0,
        meta: {
          provider_used: 'fallback',
          provider_class: 'local',
          mode: 'ERROR',
          reason_code: 'CONTRACT_VIOLATION_CLAMPED',
          latency_ms_total: 0,
          timeout_ms: 0,
          retries: 0,
          attempts: [],
          network_used: false,
          cache_hit: false,
          policy: 'tauri_protector_ipc_fallback',
        },
      });

    vi.mocked(aiOrchestrator.generate).mockResolvedValueOnce({
      content: 'Réponse locale de secours valide',
      provider: 'ollama',
      metadata: {
        totalResponseTime: 12,
        selectedProvider: 'ollama',
      },
    } as Awaited<ReturnType<typeof aiOrchestrator.generate>>);

    const response = await processMessage('Salut', {
      conversationId: 'c-ipc',
      providerPreference: 'ollama',
    });

    expect(response.assistant_message).toBe('Réponse locale de secours valide');
    expect(response.meta.provider_used).toBe('ollama');
    expect(response.meta.policy).toBe('conversation_engine_orchestrator_fallback');
  });

  it('forwards the selected provider to conversation_generate', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null) // persistentMemoryGetContext
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c4',
        messageId: 'm4',
        metadata: {},
      }); // conversationGenerate

    await processMessage('Hi', {
      conversationId: 'c4',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          provider: 'ollama',
        }),
      })
    );
  });

  it('skips frontend persistent memory prefetch for explicit memory queries', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      content: 'OK',
      conversationId: 'c5',
      messageId: 'm5',
      metadata: {},
    });

    await processMessage('Memorise sans developper: code=ORION-482-LICHEN.', {
      conversationId: 'c5',
      providerPreference: 'ollama',
    });

    expect(
      vi
        .mocked(secureInvoke)
        .mock.calls.some(([command]) => command === 'persistent_memory_get_context')
    ).toBe(false);

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          conversationId: 'c5',
          provider: 'ollama',
        }),
      })
    );
  });

  it('treats personal fact recall prompts as explicit memory queries', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      content: 'INCONNU',
      conversationId: 'c6',
      messageId: 'm6',
      metadata: {},
    });

    await processMessage(
      "Je ne t'ai jamais donné mon code fantôme. Quel est mon code fantôme ? Si tu ne sais pas, réponds INCONNU.",
      {
        conversationId: 'c6',
        providerPreference: 'ollama',
      }
    );

    expect(
      vi
        .mocked(secureInvoke)
        .mock.calls.some(([command]) => command === 'persistent_memory_get_context')
    ).toBe(false);

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          conversationId: 'c6',
          provider: 'ollama',
          message:
            "Je ne t'ai jamais donné mon code fantôme. Quel est mon code fantôme ? Si tu ne sais pas, réponds INCONNU.",
        }),
      })
    );
  });

  it('reuses static prompt fragments for near-identical calls', async () => {
    localStorage.setItem(
      'titane_persona_profile',
      JSON.stringify({ tone: 'balanced', verbosity: 'balanced' })
    );
    localStorage.setItem(
      'titane_cognitive_state',
      JSON.stringify({ flowActive: true, energy: 88, mode: 'focus' })
    );

    const first = getStaticPromptContext('default', 1_000);
    const second = getStaticPromptContext('default', 1_500);
    const third = getStaticPromptContext('default', 4_000);

    expect(first).toBe(second);
    expect(third).not.toBe(second);
  });

  it('supports a governed E2E rate-limit mock scenario', async () => {
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_SCENARIO__ = 'rate_limit';

    const response = await processMessage('Explorer GitHub', {
      conversationId: 'e2e-conv-rate-limit',
    });

    expect(response.assistant_message).toContain('limite de taux');
    expect(response.meta).toEqual(
      expect.objectContaining({
        provider_used: 'github-copilot',
        mode: 'OFFLINE',
        reason_code: 'RATE_LIMIT',
        network_used: true,
      })
    );
    expect(vi.mocked(secureInvoke)).not.toHaveBeenCalled();
  });

  it('injects runtime knowledge into the conversation_generate system prompt', async () => {
    memoryServiceMock.getKnowledge.mockResolvedValue([
      {
        id: 'kb-1',
        title: 'One Door Governance',
        category: 'architecture',
        content:
          'All network access must flow through UI -> IPC -> services -> gateway -> external.',
        relevance: 0.96,
        lastAccessed: '2026-04-16T00:00:00.000Z',
        tags: ['architecture', 'network'],
      },
    ]);

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c7',
        messageId: 'm7',
        metadata: { timestamp: 1234 },
      });

    await processMessage('Explique One Door', {
      conversationId: 'c7',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## RUNTIME_KNOWLEDGE_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('One Door Governance'),
        }),
      })
    );
  });

  it('injects default knowledge base context into the active conversation prompt', async () => {
    defaultKnowledgeBaseMock.getRelevantPromptContext.mockResolvedValue(
      '• system_architecture: Architecture cœur TITANE∞ avec 4 rings et gouvernance One Door.'
    );

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        content: 'Ok KB',
        conversationId: 'c7-kb',
        messageId: 'm7-kb',
        metadata: { timestamp: 7777 },
      });

    await processMessage('Explique l architecture coeur TITANE', {
      conversationId: 'c7-kb',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(defaultKnowledgeBaseMock.getRelevantPromptContext).toHaveBeenCalledWith(
      'Explique l architecture coeur TITANE',
      5
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## DEFAULT_KNOWLEDGE_BASE_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('system_architecture'),
        }),
      })
    );
  });

  it('surfaces an explicit unavailable status when default knowledge base retrieval fails', async () => {
    defaultKnowledgeBaseMock.getRelevantPromptContext.mockRejectedValue(
      new Error('default kb offline')
    );

    vi.mocked(secureInvoke)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        content: 'Ok fallback KB',
        conversationId: 'c7-kb-fallback',
        messageId: 'm7-kb-fallback',
        metadata: { timestamp: 8888 },
      });

    await processMessage('Explique la gouvernance One Door', {
      conversationId: 'c7-kb-fallback',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining(
            '## DEFAULT_KNOWLEDGE_BASE_STATUS\nstatus=unavailable'
          ),
        }),
      })
    );
  });

  it('publishes runtime tags for memory and knowledge statuses on the active conversation path', async () => {
    defaultKnowledgeBaseMock.getRelevantPromptContext.mockResolvedValue(
      '• system_architecture: Architecture cœur TITANE∞ avec 4 rings et gouvernance One Door.'
    );
    memoryServiceMock.getKnowledge.mockResolvedValue([
      {
        id: 'kb-2',
        title: 'Memory Orchestration',
        category: 'memory',
        content: 'STM vers MTM puis LTM selon le niveau d accès.',
        relevance: 0.91,
        lastAccessed: '2026-04-18T00:00:00.000Z',
        tags: ['memory'],
      },
    ]);

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return {
          context: 'Mémoire persistante utile',
          usedEntries: ['entry-1'],
        };
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok runtime tags',
          conversationId: 'c9',
          messageId: 'm9',
          metadata: { timestamp: 9999, cognitiveTags: ['backend-tag'] },
        };
      }

      return null;
    });

    const response = await processMessage(
      'Explique la gouvernance One Door et l architecture système',
      {
        conversationId: 'c9',
        providerPreference: 'ollama',
      }
    );

    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining([
        'backend-tag',
        'runtime-knowledge:loaded',
        'default-kb:loaded',
        'persistent-memory:loaded',
      ])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining([
        'runtime_knowledge:loaded',
        'default_kb:loaded',
        'persistent_memory:loaded',
      ])
    );
  });

  it('marks twins and cognitive context when the active route passes a context envelope', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok twins context',
          conversationId: 'c10',
          messageId: 'm10',
          metadata: { timestamp: 1010 },
        };
      }

      return null;
    });

    const response = await processMessage('Analyse le contexte identitaire', {
      conversationId: 'c10',
      providerPreference: 'ollama',
      contextEnvelope: {
        routeContext: {
          route: '/titane',
          updatedAt: 1,
        },
        moduleContext: {
          moduleId: 'conversation',
          moduleName: 'Conversation',
          moduleType: 'chat',
          pageTitle: 'Chat',
          capabilities: ['chat'],
          dataTruthClass: 'runtime',
          actions: ['send'],
          limits: ['none'],
          memoryKeys: ['conversation'],
        },
        continuity: {
          sequence: 1,
          changeType: 'initial',
          staleGuard: 'steady',
        },
        memorySingleDoor: {
          conversationId: 'c10',
          mode: 'default',
          providerRequested: 'ollama',
          tags: ['route:/titane'],
          recentMessages: [],
          scopeDecision: {
            kept: 0,
            purged: 0,
            recalculated: false,
          },
        },
        runtimeMetadata: {},
        cognitiveContext: {
          flowActive: true,
          energy: 80,
          mode: 'focus',
        },
        twinsContext: {
          globalScore: 0.82,
          trend: 'up',
          updatedAt: 1,
        },
        generatedAt: 1,
      },
    });

    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining(['twins:present', 'cognitive-context:present'])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining(['twins:present', 'cognitive_context:present'])
    );
  });

  it('injects a factual runtime truth directive for page/action questions when context is available', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok page truth',
          conversationId: 'c10b',
          messageId: 'm10b',
          metadata: { timestamp: 1011 },
        };
      }

      return null;
    });

    await processMessage('Quelles actions sont possibles ici ?', {
      conversationId: 'c10b',
      providerPreference: 'ollama',
      contextEnvelope: {
        routeContext: {
          route: '/titane',
          pageState: 'conversation',
          updatedAt: 1,
        },
        moduleContext: {
          moduleId: 'conversation',
          moduleName: 'Conversation',
          moduleType: 'chat',
          pageTitle: 'Chat',
          capabilities: ['chat', 'memory'],
          dataTruthClass: 'runtime',
          actions: ['send', 'clear'],
          limits: ['no-external-network'],
          memoryKeys: ['conversation', 'recent-messages'],
        },
        continuity: {
          sequence: 1,
          changeType: 'initial',
          staleGuard: 'steady',
        },
        memorySingleDoor: {
          conversationId: 'c10b',
          mode: 'default',
          providerRequested: 'ollama',
          tags: ['route:/titane'],
          recentMessages: [],
          scopeDecision: {
            kept: 0,
            purged: 0,
            recalculated: false,
          },
        },
        runtimeMetadata: {},
        generatedAt: 1,
      },
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining('## RUNTIME_TRUTH_RESPONSE_DIRECTIVE'),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining('page_title=Chat'),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'memory_keys=conversation, recent-messages'
        ),
      },
    });
  });

  it('injects a factual runtime truth directive for memory and offline questions', async () => {
    const originalOnline = navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok memory offline truth',
          conversationId: 'c10c',
          messageId: 'm10c',
          metadata: { timestamp: 1012 },
        };
      }

      return null;
    });

    try {
      await processMessage('Que mémorises-tu dans cette session et que fais-tu offline ?', {
        conversationId: 'c10c',
        providerPreference: 'ollama',
      });
    } finally {
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: originalOnline,
      });
    }

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining('État mémoire persistante courant: skipped'),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining('État de capacité online courant: offline'),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'répondre directement avec un fallback local concret et court, sans poser de question de clarification'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'Commencer la réponse par "Fallback local:" puis donner immédiatement les actions'
        ),
      },
    });
  });

  it('injects a factual runtime truth directive for pages, diagnostics and response path prompts', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok diagnostic truth',
          conversationId: 'c10d',
          messageId: 'm10d',
          metadata: { timestamp: 1013 },
        };
      }

      return null;
    });

    await processMessage(
      'Liste les pages/onglets disponibles et explique ton chemin de réponse (UI→services→orchestrateur→engines).',
      {
        conversationId: 'c10d',
        providerPreference: 'ollama',
      }
    );

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining('## RUNTIME_TRUTH_RESPONSE_DIRECTIVE'),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'Si l utilisateur demande la liste des pages ou onglets disponibles'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'ONLINE_CAPABILITY_STATUS, GOVERNED_TOOL_LANE_STATUS, ADVANCED_AGENT_RUNTIME_STATUS, CANONICAL_DISCERNMENT_STATUS'
        ),
      },
    });
  });

  it('injects a directive for reformulation and transparency prompts', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok reformulation truth',
          conversationId: 'c10e',
          messageId: 'm10e',
          metadata: { timestamp: 1014 },
        };
      }

      return null;
    });

    await processMessage('Reformule ma dernière question puis dis ce que tu ne sais pas.', {
      conversationId: 'c10e',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'reformuler uniquement le besoin utilisateur le plus récent'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'Ne pas poser de question de clarification ni de contre-question'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          'distinguer explicitement trois catégories: ce que tu sais depuis le contexte courant, ce que tu infères, et ce qui manque pour conclure'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          '"Ce que je sais:", "Ce que j infère:", "Ce que je ne sais pas / ce qui manque:"'
        ),
      },
    });
    expect(generateCall?.[1]).toMatchObject({
      args: {
        systemPrompt: expect.stringContaining(
          '"Je ne sais pas..." ou "Je ne peux pas vérifier..."'
        ),
      },
    });
  });

  it('injects the active skill prompt into the active conversation path', async () => {
    skillActivatorMock.getActiveSkillId.mockReturnValue('skill-weather');
    skillActivatorMock.getSystemPromptForSkill.mockReturnValue(
      'Tu es un assistant météo gouverné.'
    );
    skillActivatorMock.getActiveSkill.mockReturnValue({
      manifest: { name: 'Weather Assistant' },
    });

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok skill active',
          conversationId: 'c11',
          messageId: 'm11',
          metadata: { timestamp: 1111 },
        };
      }

      return null;
    });

    const response = await processMessage('Quel temps fait-il ?', {
      conversationId: 'c11',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## ACTIVE_SKILL_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('Weather Assistant'),
        }),
      })
    );
    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining(['skill:active', 'skill-id:skill-weather'])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining(['skill:active', 'skill_id:skill-weather'])
    );
  });

  it('publishes governed online capability status in the active conversation path', async () => {
    const originalOnline = navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    localStorage.setItem(
      'titane_user_preferences',
      JSON.stringify({
        customPreferences: {
          deep_internet_analysis: true,
        },
      })
    );

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok online status',
          conversationId: 'c12',
          messageId: 'm12',
          metadata: { timestamp: 1212 },
        };
      }

      return null;
    });

    const response = await processMessage('Lance une recherche online gouvernée', {
      conversationId: 'c12',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## ONLINE_CAPABILITY_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('status=offline'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('deep_analysis=enabled'),
        }),
      })
    );
    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining(['online:offline', 'deep-analysis:enabled'])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining(['online:offline', 'deep_analysis:enabled'])
    );

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: originalOnline,
    });
  });

  it('injects advanced agent runtime truth into the active conversation path', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok advanced agents',
          conversationId: 'c13',
          messageId: 'm13',
          metadata: { timestamp: 1313 },
        };
      }

      return null;
    });

    const response = await processMessage('Montre les agents actifs réels', {
      conversationId: 'c13',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## ADVANCED_AGENT_RUNTIME_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('monitoring: readiness=partial'),
        }),
      })
    );
    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining([
        'advanced-agents:present',
        'agent:monitoring:partial',
        'agent:security_active:partial',
      ])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining([
        'advanced_agents:present',
        'agent_monitoring:partial',
        'agent_security_active:partial',
      ])
    );
  });

  it('surfaces governed tool lane truth and code discernment on the active conversation path', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok tools',
          conversationId: 'c14',
          messageId: 'm14',
          metadata: { timestamp: 1414 },
        };
      }

      return null;
    });

    const response = await processMessage(
      'Écris une fonction TypeScript pour parser ce JSON',
      {
        conversationId: 'c14',
        providerPreference: 'ollama',
      }
    );

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('## GOVERNED_TOOL_LANE_CONTEXT'),
        }),
      })
    );
    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          systemPrompt: expect.stringContaining('status=available'),
        }),
      })
    );
    expect(response.discernment?.toolAction).toBe('tool');
    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining([
        'tool-lane:available',
        'task-type:code',
        'tool-action:tool',
      ])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining([
        'tool_lane:available',
        'task_type:code',
        'tool_action:tool',
      ])
    );
  });

  it('lets the canonical kernel drive provider, profile and truth on the active conversation path', async () => {
    canonicalKernelMock.discern.mockReturnValue(
      createCanonicalDecisionMock({
        profileId: 'ARCHITECT',
        truthStatus: 'PROVEN_RUNTIME',
        confidence: 0.93,
        provider: {
          name: 'gemini',
          model: 'auto',
          fallback: ['ollama'],
          temperature: 0.33,
          maxTokens: 8192,
          reasoningEffort: 'high',
        },
      })
    );

    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Ok kernel',
          conversationId: 'c15',
          messageId: 'm15',
          metadata: { timestamp: 1515, provider_used: 'gemini' },
        };
      }

      return null;
    });

    const response = await processMessage('Fais une analyse architecture approfondie', {
      conversationId: 'c15',
      providerPreference: 'ollama',
    });

    const generateCall = vi
      .mocked(secureInvoke)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(generateCall?.[1]).toEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          provider: 'gemini',
          aiConfig: expect.objectContaining({
            temperature: 0.33,
            max_tokens: 32768,
            provider_preference: 'gemini',
          }),
          classifierMeta: expect.objectContaining({
            profile_id: 'ARCHITECT',
            effort_level: 'high',
          }),
          systemPrompt: expect.stringContaining('## CANONICAL_DISCERNMENT_CONTEXT'),
        }),
      })
    );
    expect(response.omega_trace_meta).toEqual(
      expect.objectContaining({
        profile_id: 'ARCHITECT',
        canonical_truth_status: 'PROVEN_RUNTIME',
        canonical_confidence: 0.93,
      })
    );
    expect(response.cognitive_tags).toEqual(
      expect.arrayContaining([
        'kernel-profile:ARCHITECT',
        'kernel-provider:gemini',
        'kernel-truth:proven_runtime',
      ])
    );
    expect(response.metadata.links_to_contexts).toEqual(
      expect.arrayContaining([
        'kernel_profile:ARCHITECT',
        'kernel_provider:gemini',
        'kernel_truth:proven_runtime',
      ])
    );
  });

  it('preserves provider_used from meta when metadata omits it', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Provider meta truth',
          conversationId: 'c16',
          messageId: 'm16',
          metadata: { timestamp: 1616 },
          meta: {
            provider_used: 'ollama-runtime',
            provider_class: 'local',
            mode: 'LOCAL',
            reason_code: 'OK',
            latency_ms_total: 16,
            timeout_ms: 30000,
            retries: 0,
            attempts: [],
            network_used: false,
            cache_hit: false,
            policy: 'provider-meta-only',
          },
        };
      }

      return null;
    });

    const response = await processMessage('Donne le provider réel', {
      conversationId: 'c16',
      providerPreference: 'ollama',
    });

    expect(response.metadata.provider_used).toBe('ollama-runtime');
    expect(response.omega_trace_meta?.provider_used).toBe('ollama-runtime');
  });

  it('preserves model requested/used truth from metadata on the active conversation path', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Provider model truth',
          conversationId: 'c16b',
          messageId: 'm16b',
          metadata: {
            timestamp: 1617,
            model_requested: 'llama3.1:latest',
            model_used: 'llama3.2:latest',
            fallback_used: true,
          },
          meta: {
            provider_used: 'ollama-runtime',
            provider_class: 'local',
            mode: 'LOCAL',
            reason_code: 'OK',
            latency_ms_total: 16,
            timeout_ms: 30000,
            retries: 0,
            attempts: [],
            network_used: false,
            cache_hit: false,
            policy: 'provider-model-truth',
          },
        };
      }

      return null;
    });

    const response = await processMessage('Donne le modèle réel', {
      conversationId: 'c16b',
      providerPreference: 'ollama',
    });

    expect(response.metadata.model_requested).toBe('llama3.1:latest');
    expect(response.metadata.model_used).toBe('llama3.2:latest');
    expect(response.metadata.fallback_used).toBe(true);
  });

  it('normalizes inline citations from conversation metadata or trace on the active conversation path', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Réponse avec citations',
          conversationId: 'c17',
          messageId: 'm17',
          metadata: {
            timestamp: 1717,
            citations: [
              {
                url: 'https://example.com/source-a',
                title: 'Source A',
                excerpt: 'Extrait A',
                accessed_at: '2026-04-18T10:00:00Z',
              },
            ],
          },
          trace: {
            citations: [
              {
                url: 'https://example.com/source-b',
                title: 'Source B',
                snippet: 'Extrait B',
                timestamp: '2026-04-18T10:05:00Z',
              },
            ],
          },
        };
      }

      return null;
    });

    const response = await processMessage('Montre les sources en ligne', {
      conversationId: 'c17',
      providerPreference: 'ollama',
    });

    expect(response.metadata.citations).toEqual([
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait A',
        accessed_at: '2026-04-18T10:00:00Z',
        locator: null,
        locator_text: null,
      },
    ]);
  });

  it('persists successful chat interactions into Memory Core on the active conversation path', async () => {
    vi.mocked(secureInvoke).mockImplementation(async command => {
      if (command === 'persistent_memory_get_context') {
        return null;
      }

      if (command === 'conversation_generate') {
        return {
          content: 'Réponse mémoire',
          conversationId: 'c8',
          messageId: 'm8',
          metadata: { timestamp: 5678, provider_used: 'ollama' },
        };
      }

      return null;
    });

    const response = await processMessage('Retiens ceci', {
      conversationId: 'c8',
      providerPreference: 'ollama',
    });

    expect(response.assistant_message).toBe('Réponse mémoire');
    expect(memoryServiceMock.saveChatInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        userMessage: 'Retiens ceci',
        aiResponse: 'Réponse mémoire',
        mode: 'default',
        metadata: expect.objectContaining({
          conversationId: 'c8',
          messageId: 'm8',
          provider_used: 'ollama',
        }),
      })
    );
  });

  it('surfaces seeded runtime knowledge and tracks persisted exchanges on the E2E mock lane', async () => {
    const win = window as Record<string, unknown>;
    win.__TITANE_E2E_CHAT_MOCK__ = true;
    win.__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = [
      {
        title: 'One Door Governance',
        category: 'architecture',
        content: 'UI -> IPC -> services -> gateway -> external',
        relevance: 0.96,
        tags: ['architecture', 'network'],
      },
    ];
    win.__TITANE_E2E_CHAT_MEMORY_LOG__ = [];

    const first = await processMessage('Active la connaissance runtime One Door', {
      conversationId: 'e2e-c1',
    });

    expect(first.assistant_message).toContain('[MOCK_KNOWLEDGE] One Door Governance');
    expect(win.__TITANE_E2E_CHAT_MEMORY_LOG__).toEqual([
      expect.objectContaining({
        userMessage: 'Active la connaissance runtime One Door',
        conversationId: 'e2e-c1',
        knowledgeTitles: ['One Door Governance'],
      }),
    ]);

    const second = await processMessage('Rappelle le dernier échange mémoire', {
      conversationId: 'e2e-c1',
    });

    expect(second.assistant_message).toContain(
      '[MOCK_MEMORY] Active la connaissance runtime One Door'
    );
    expect(win.__TITANE_E2E_CHAT_MEMORY_LOG__ as unknown[]).toHaveLength(2);
  });
});
