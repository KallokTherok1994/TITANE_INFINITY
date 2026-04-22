import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryServiceMock = vi.hoisted(() => ({
  getActiveProjects: vi.fn(),
  getRecentDecisions: vi.fn(),
  getKnowledge: vi.fn(),
  getActiveRituals: vi.fn(),
  getTimeline: vi.fn(),
  saveChatInteraction: vi.fn(),
  saveStructuredEntry: vi.fn(),
}));

const unifiedMemoryCreateMock = vi.hoisted(() => vi.fn());
const unifiedMemoryInstanceMock = vi.hoisted(() => ({
  createMemory: vi.fn(),
  getStats: vi.fn(),
  retrieveMemories: vi.fn(),
}));
const isTauriAvailableMock = vi.hoisted(() => vi.fn(() => false));
const hybridMemoryPublishGovernedReportMock = vi.hoisted(() => vi.fn());

vi.mock('@/services/api/memory', () => ({
  memoryService: memoryServiceMock,
}));

vi.mock('@/services/unified', () => ({
  createUnifiedMemory: unifiedMemoryCreateMock,
}));

vi.mock('@/api/tauriClient', () => ({
  isTauriAvailable: isTauriAvailableMock,
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    hybridMemoryPublishGovernedReport: hybridMemoryPublishGovernedReportMock,
  },
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('memoryIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
    unifiedMemoryCreateMock.mockResolvedValue(unifiedMemoryInstanceMock);
    unifiedMemoryInstanceMock.getStats.mockResolvedValue({ total: 3 });
    unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
      { entry: { id: 'm1', summary: 'Atlas', tags: ['Knowledge A'] }, score: 0.9 },
      {
        entry: { id: 'm2', summary: 'Shadow extra', details: 'Shadow extra details' },
        score: 0.8,
      },
    ]);
    isTauriAvailableMock.mockReturnValue(false);
    hybridMemoryPublishGovernedReportMock.mockReset();
  });

  it('publishes a governed desktop report when Tauri is available', async () => {
    isTauriAvailableMock.mockReturnValue(true);
    hybridMemoryPublishGovernedReportMock.mockResolvedValue({
      ok: true,
      content: {
        exportId: 'hybrid-memory-1',
        exportPath: '/tmp/hybrid-memory-1.md',
        metadataPath: '/tmp/hybrid-memory-1.json',
        sha256: 'abc123',
        signature: 'sig',
        publicKey: 'pub',
        fingerprint: 'finger',
        publishedAt: '2026-04-19T00:00:00Z',
        scope: 'tauri-app-data',
        activePreset: 'Equilibre',
        qualification: 'partial',
      },
    });

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');
    const exportResult = await memoryIntegration.publishGovernedHybridReport('# report');

    expect(hybridMemoryPublishGovernedReportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        reportTitle: 'TITANE Hybrid Memory Report',
        reportMarkdown: '# report',
      })
    );
    expect(exportResult).toEqual(
      expect.objectContaining({ exportPath: '/tmp/hybrid-memory-1.md' })
    );
  });

  it('returns additive hybrid supplemental knowledge when orchestration is enabled', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([
      { id: 'k1', title: 'Knowledge A' },
    ]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
      {
        entry: {
          id: 'm1',
          summary: 'Atlas',
          tags: ['Knowledge A'],
        },
        score: 0.9,
      },
      {
        entry: {
          id: 'm2',
          summary: 'Atlas runtime addendum',
          details: 'Hybrid-only operational memory',
          tags: ['shadow-extra'],
        },
        score: 0.84,
      },
    ]);

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');
    localStorage.setItem('titane_hybrid_memory_orchestration_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    const context = await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: true,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(context.hybridSupplementalKnowledge).toEqual([
      expect.objectContaining({
        title: 'Atlas runtime addendum',
        category: 'hybrid_orchestrated',
        source: 'UnifiedMemory',
      }),
    ]);
    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        hybridOrchestrationEnabled: true,
        lastHybridOrchestrationStatus: 'ready',
        lastHybridOrchestrationCount: 1,
        lastHybridOrchestrationPreview: ['Atlas runtime addendum'],
      })
    );
  });

  it('prunes stale persisted preset history entries on diagnostics read', async () => {
    const now = Date.now();
    localStorage.setItem(
      'titane_hybrid_memory_shadow_read_preset_history',
      JSON.stringify([
        {
          at: now,
          fromPresetLabel: 'Observation',
          toPresetLabel: 'Equilibre',
          mode: 'canary',
          percentage: 25,
          trendWindow: 10,
          source: 'preset',
        },
        {
          at: now - 8 * 24 * 60 * 60 * 1000,
          fromPresetLabel: 'Equilibre',
          toPresetLabel: 'Full',
          mode: 'full',
          percentage: 100,
          trendWindow: 8,
          source: 'preset',
        },
      ])
    );

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    const diagnostics = memoryIntegration.getHybridMemoryDiagnostics();
    expect(diagnostics.recentShadowReadPresetChanges).toHaveLength(1);
    expect(diagnostics.recentShadowReadPresetChanges[0]).toEqual(
      expect.objectContaining({
        fromPresetLabel: 'Observation',
        toPresetLabel: 'Equilibre',
      })
    );
  });

  it('clears cached context after saving an interaction', async () => {
    memoryServiceMock.getActiveProjects
      .mockResolvedValueOnce([{ id: 'project-a', title: 'Atlas' }])
      .mockResolvedValueOnce([{ id: 'project-b', title: 'Helios' }]);
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-a', title: 'Atlas' }],
      })
    );

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-a', title: 'Atlas' }],
      })
    );

    await memoryIntegration.saveInteraction({
      userMessage: 'ping',
      aiResponse: 'pong',
      mode: 'default',
    });

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-b', title: 'Helios' }],
      })
    );

    expect(memoryServiceMock.getActiveProjects).toHaveBeenCalledTimes(2);
  });

  it('clears cached context after saving a structured memory entry', async () => {
    memoryServiceMock.getKnowledge
      .mockResolvedValueOnce([{ id: 'k1', title: 'Ancienne connaissance' }])
      .mockResolvedValueOnce([{ id: 'k2', title: 'Nouvelle connaissance' }]);
    memoryServiceMock.saveStructuredEntry.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: false,
      includeDecisions: false,
      includeKnowledge: true,
      includeRituals: false,
      includeTimeline: false,
    });

    await memoryIntegration.saveStructuredEntry({
      templateId: 'season_summary',
      target: 'long',
      data: { season: 'Stabilisation' },
    });

    await expect(
      memoryIntegration.loadContext({
        includeProjects: false,
        includeDecisions: false,
        includeKnowledge: true,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        relevantKnowledge: [{ id: 'k2', title: 'Nouvelle connaissance' }],
      })
    );

    expect(memoryServiceMock.getKnowledge).toHaveBeenCalledTimes(2);
  });

  it('dual-writes interactions to UnifiedMemory only when hybrid shadow flag is enabled', async () => {
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    localStorage.setItem('titane_hybrid_memory_shadow_write_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveInteraction({
      userMessage: 'Question utilisateur',
      aiResponse: 'Réponse assistant',
      mode: 'default',
      emotionState: {
        valence: 0.2,
        activation: 0.3,
        dominant_emotion: 'calm',
      },
    });

    expect(memoryServiceMock.saveChatInteraction).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenCalledTimes(2);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'conversation',
        details: 'Question utilisateur',
        tags: expect.arrayContaining(['hybrid-shadow-write', 'user', 'default']),
      })
    );
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'conversation',
        details: 'Réponse assistant',
        tags: expect.arrayContaining(['hybrid-shadow-write', 'assistant', 'calm']),
      })
    );
  });

  it('does not dual-write interactions when hybrid shadow flag is disabled', async () => {
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveInteraction({
      userMessage: 'Question utilisateur',
      aiResponse: 'Réponse assistant',
      mode: 'default',
    });

    expect(memoryServiceMock.saveChatInteraction).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).not.toHaveBeenCalled();
    expect(unifiedMemoryInstanceMock.createMemory).not.toHaveBeenCalled();
  });

  it('dual-writes structured entries to UnifiedMemory when hybrid shadow flag is enabled', async () => {
    memoryServiceMock.saveStructuredEntry.mockResolvedValue(undefined);

    localStorage.setItem('titane_hybrid_memory_shadow_write_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveStructuredEntry({
      templateId: 'decision_record',
      target: 'long',
      timestamp: '2026-04-18T09:00:00.000Z',
      data: {
        title: 'Décision critique',
        summary: 'Basculer en shadow-write',
      },
    });

    expect(memoryServiceMock.saveStructuredEntry).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'decision',
        summary: 'Décision critique',
        tags: expect.arrayContaining([
          'hybrid-shadow-write',
          'structured-entry',
          'decision_record',
          'long',
        ]),
      })
    );
  });

  it('runs shadow-read diagnostics on context load when the hybrid read flag is enabled', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([
      { id: 'k1', title: 'Knowledge A' },
    ]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: true,
      includeKnowledge: true,
      includeRituals: true,
      includeTimeline: false,
    });

    expect(unifiedMemoryCreateMock).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.getStats).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.retrieveMemories).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Atlas Knowledge A',
      })
    );

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        shadowReadEnabled: true,
        shadowReadRolloutMode: 'full',
        shadowReadActivePresetId: 'custom',
        shadowReadActivePresetLabel: 'Custom',
        shadowReadCanaryEligible: true,
        shadowReadCanaryPercentage: 100,
        shadowReadTrendWindow: 12,
        shadowReadCanaryReason: 'rollout complet actif',
        shadowReadCanaryQueryPreview: 'Atlas Knowledge A',
        shadowReadCanaryOperatorHint:
          'Tous les contextes passent deja. Utiliser un preset canary uniquement pour reduire le perimetre.',
        lastShadowReadStatus: 'ready',
        lastShadowReadSampleCount: 2,
        lastShadowReadTotalMemories: 3,
        lastShadowReadMatchedCount: 2,
        lastShadowReadMissingCount: 0,
        lastShadowReadExtraCount: 2,
        lastShadowReadQualification: 'ready',
        lastShadowReadCoverageRatio: 1,
        lastShadowReadAverageSimilarity: 1,
        lastShadowReadAverageRetrievalScore: 0.85,
        lastShadowReadCompositeScore: 0.925,
        lastShadowReadCanonicalPreview: ['Atlas', 'Knowledge A'],
        lastShadowReadUnifiedPreview: ['Atlas', 'Knowledge A', 'Shadow extra'],
        lastShadowReadMatchedPairs: [
          { canonicalLabel: 'Atlas', unifiedLabel: 'Atlas', similarity: 1 },
          { canonicalLabel: 'Knowledge A', unifiedLabel: 'Knowledge A', similarity: 1 },
        ],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [],
        recentShadowReadQualifications: [
          { at: expect.any(Number), qualification: 'ready', compositeScore: 0.925 },
        ],
        recentShadowReadExtendedTrend: [
          { at: expect.any(Number), qualification: 'ready', compositeScore: 0.925 },
        ],
        recentShadowReadPresetChanges: [],
        lastShadowReadTrendSummary: {
          windowSize: 12,
          readyCount: 1,
          partialCount: 0,
          insufficientCount: 0,
          averageCompositeScore: 0.925,
        },
        lastShadowReadQuery: 'Atlas Knowledge A',
      })
    );
  });

  it('captures the last shadow-read error and missing canonical labels when UnifiedMemory lookup fails', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([
      { id: 'k1', title: 'Knowledge A' },
    ]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    unifiedMemoryInstanceMock.getStats.mockRejectedValue(new Error('unified offline'));

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: true,
      includeKnowledge: true,
      includeRituals: true,
      includeTimeline: false,
    });

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        lastShadowReadStatus: 'error',
        shadowReadRolloutMode: 'full',
        shadowReadActivePresetId: 'custom',
        shadowReadActivePresetLabel: 'Custom',
        shadowReadCanaryEligible: true,
        shadowReadCanaryReason: 'rollout complet actif',
        shadowReadCanaryQueryPreview: 'Atlas Knowledge A',
        shadowReadCanaryOperatorHint:
          'Tous les contextes passent deja. Utiliser un preset canary uniquement pour reduire le perimetre.',
        lastError: 'unified offline',
        lastShadowReadQualification: 'insufficient',
        lastShadowReadAverageSimilarity: 0,
        lastShadowReadAverageRetrievalScore: 0,
        lastShadowReadCompositeScore: 0,
        lastShadowReadMissingCount: 2,
        lastShadowReadCanonicalPreview: ['Atlas', 'Knowledge A'],
        lastShadowReadUnifiedPreview: [],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [
          {
            canonicalLabel: 'Atlas',
            bestUnifiedLabel: null,
            bestSimilarity: 0,
            gapToThreshold: 0.4,
            priority: 'critique',
            reason: 'lecture UnifiedMemory indisponible',
          },
          {
            canonicalLabel: 'Knowledge A',
            bestUnifiedLabel: null,
            bestSimilarity: 0,
            gapToThreshold: 0.4,
            priority: 'critique',
            reason: 'lecture UnifiedMemory indisponible',
          },
        ],
        recentShadowReadQualifications: [
          { at: expect.any(Number), qualification: 'insufficient', compositeScore: 0 },
        ],
        recentShadowReadExtendedTrend: [
          { at: expect.any(Number), qualification: 'insufficient', compositeScore: 0 },
        ],
        recentShadowReadPresetChanges: [],
        lastShadowReadTrendSummary: {
          windowSize: 12,
          readyCount: 0,
          partialCount: 0,
          insufficientCount: 1,
          averageCompositeScore: 0,
        },
        lastShadowReadMissingLabels: ['Atlas', 'Knowledge A'],
        lastShadowReadQuery: 'Atlas Knowledge A',
      })
    );
  });

  it('uses semantic token similarity for near matches instead of strict substring matching', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas memory graph' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
      {
        entry: {
          id: 'm1',
          summary: 'graph atlas memory runtime',
          tags: ['hybrid-read'],
        },
        score: 0.9,
      },
    ]);

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: false,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        lastShadowReadMatchedCount: 1,
        lastShadowReadMissingCount: 0,
        lastShadowReadQualification: 'ready',
        lastShadowReadCoverageRatio: 1,
        lastShadowReadAverageSimilarity: 0.75,
        lastShadowReadAverageRetrievalScore: 0.9,
        lastShadowReadCompositeScore: 0.825,
        lastShadowReadCanonicalPreview: ['Atlas memory graph'],
        lastShadowReadUnifiedPreview: ['graph atlas memory runtime', 'hybrid-read'],
        lastShadowReadMatchedPairs: [
          {
            canonicalLabel: 'Atlas memory graph',
            unifiedLabel: 'graph atlas memory runtime',
            similarity: 0.75,
          },
        ],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [],
        recentShadowReadQualifications: [
          { at: expect.any(Number), qualification: 'ready', compositeScore: 0.825 },
        ],
      })
    );
  });

  it('surfaces near matches separately from missing diagnostics', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas memory graph' },
      { id: 'project-b', title: 'Nebula routing' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
      {
        entry: {
          id: 'm1',
          summary: 'Atlas runtime',
          tags: ['shadow'],
        },
        score: 0.5,
      },
    ]);

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: false,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        lastShadowReadNearMatches: [
          expect.objectContaining({
            canonicalLabel: 'Atlas memory graph',
            unifiedLabel: 'Atlas runtime',
            similarity: 0.25,
            gapToThreshold: 0.15,
          }),
        ],
        lastShadowReadNearMatchStability: [
          expect.objectContaining({
            canonicalLabel: 'Atlas memory graph',
            unifiedLabel: 'Atlas runtime',
            seenCount: 1,
            observationWindow: 1,
            averageSimilarity: 0.25,
            stability: 'emergent',
          }),
        ],
        recentShadowReadExtendedTrend: [
          expect.objectContaining({
            qualification: 'insufficient',
            compositeScore: 0.3125,
          }),
        ],
        lastShadowReadTrendSummary: {
          windowSize: 12,
          readyCount: 0,
          partialCount: 0,
          insufficientCount: 1,
          averageCompositeScore: 0.3125,
        },
      })
    );
  });

  it('tracks near match stability across recent shadow reads', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas memory graph' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    for (const summary of ['Atlas runtime', 'Atlas runtime', 'Atlas runtime']) {
      unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
        {
          entry: {
            id: summary,
            summary,
            tags: ['shadow'],
          },
          score: 0.5,
        },
      ]);

      await memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      });
    }

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        lastShadowReadNearMatchStability: [
          expect.objectContaining({
            canonicalLabel: 'Atlas memory graph',
            unifiedLabel: 'Atlas runtime',
            seenCount: 3,
            observationWindow: 3,
            averageSimilarity: 0.25,
            stability: 'recurrent',
          }),
        ],
        lastShadowReadTrendSummary: {
          windowSize: 12,
          readyCount: 0,
          partialCount: 0,
          insufficientCount: 3,
          averageCompositeScore: 0.375,
        },
      })
    );
  });

  it('skips shadow read outside the configured canary bucket', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');
    localStorage.setItem(
      'titane_hybrid_memory_shadow_read_rollout',
      JSON.stringify({ mode: 'canary', percentage: 0, trendWindow: 9 })
    );

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: false,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(unifiedMemoryInstanceMock.getStats).not.toHaveBeenCalled();
    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        shadowReadRolloutMode: 'canary',
        shadowReadActivePresetId: 'custom',
        shadowReadActivePresetLabel: 'Custom',
        shadowReadCanaryEligible: false,
        shadowReadCanaryPercentage: 0,
        shadowReadTrendWindow: 9,
        shadowReadCanaryReason: expect.stringContaining('hors cible'),
        shadowReadCanaryOperatorHint: expect.stringContaining('0%'),
        lastShadowReadStatus: 'disabled',
        lastShadowReadQuery: 'Atlas',
      })
    );
  });

  it('detects balanced preset and exposes an actionable canary hint', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');
    localStorage.setItem(
      'titane_hybrid_memory_shadow_read_rollout',
      JSON.stringify({ mode: 'canary', percentage: 25, trendWindow: 10 })
    );

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: false,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        shadowReadActivePresetId: 'balanced',
        shadowReadActivePresetLabel: 'Equilibre',
        shadowReadCanaryReason: expect.any(String),
        shadowReadCanaryOperatorHint: expect.any(String),
        recentShadowReadPresetChanges: [],
      })
    );
  });

  it('keeps a bounded history of recent preset changes', async () => {
    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'canary',
      percentage: 10,
      trendWindow: 12,
    });
    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'canary',
      percentage: 25,
      trendWindow: 10,
    });
    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'full',
      percentage: 100,
      trendWindow: 8,
    });
    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'canary',
      percentage: 50,
      trendWindow: 12,
    });
    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'canary',
      percentage: 0,
      trendWindow: 9,
    });
    memoryIntegration.updateShadowReadRolloutConfig({
      mode: 'canary',
      percentage: 25,
      trendWindow: 10,
    });

    const diagnostics = memoryIntegration.getHybridMemoryDiagnostics();
    expect(diagnostics.recentShadowReadPresetChanges).toHaveLength(5);
    expect(diagnostics.recentShadowReadPresetChanges[0]).toEqual(
      expect.objectContaining({
        fromPresetLabel: 'Custom',
        toPresetLabel: 'Equilibre',
        source: 'preset',
      })
    );
    expect(
      JSON.parse(
        localStorage.getItem('titane_hybrid_memory_shadow_read_preset_history') ?? '[]'
      )
    ).toHaveLength(5);
  });

  it('keeps an extended shadow-read trend up to the configured window', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');
    localStorage.setItem(
      'titane_hybrid_memory_shadow_read_rollout',
      JSON.stringify({ mode: 'full', percentage: 100, trendWindow: 6 })
    );

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    for (const score of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
      unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
        { entry: { id: `m-${score}`, summary: 'Atlas' }, score },
      ]);

      await memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      });
    }

    const diagnostics = memoryIntegration.getHybridMemoryDiagnostics();
    expect(diagnostics.recentShadowReadExtendedTrend).toHaveLength(6);
    expect(diagnostics.lastShadowReadTrendSummary.windowSize).toBe(6);
    expect(diagnostics.lastShadowReadTrendSummary.averageCompositeScore).toBeGreaterThan(
      0
    );
  });

  it('classifies weak hybrid evidence as insufficient', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas memory graph' },
      { id: 'project-b', title: 'Nebula routing' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
      {
        entry: {
          id: 'm1',
          summary: 'isolated runtime fragment',
          tags: ['shadow'],
        },
        score: 0.2,
      },
    ]);

    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: false,
      includeKnowledge: false,
      includeRituals: false,
      includeTimeline: false,
    });

    expect(memoryIntegration.getHybridMemoryDiagnostics()).toEqual(
      expect.objectContaining({
        lastShadowReadQualification: 'insufficient',
        lastShadowReadCanonicalPreview: ['Atlas memory graph', 'Nebula routing'],
        lastShadowReadUnifiedPreview: ['isolated runtime fragment', 'shadow'],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [
          {
            canonicalLabel: 'Atlas memory graph',
            bestUnifiedLabel: null,
            bestSimilarity: 0,
            gapToThreshold: 0.4,
            priority: 'critique',
            reason: 'aucun candidat UnifiedMemory',
          },
          {
            canonicalLabel: 'Nebula routing',
            bestUnifiedLabel: null,
            bestSimilarity: 0,
            gapToThreshold: 0.4,
            priority: 'critique',
            reason: 'aucun candidat UnifiedMemory',
          },
        ],
        recentShadowReadQualifications: [
          { at: expect.any(Number), qualification: 'insufficient', compositeScore: 0.1 },
        ],
        recentShadowReadExtendedTrend: [
          { at: expect.any(Number), qualification: 'insufficient', compositeScore: 0.1 },
        ],
        lastShadowReadTrendSummary: {
          windowSize: 12,
          readyCount: 0,
          partialCount: 0,
          insufficientCount: 1,
          averageCompositeScore: 0.1,
        },
      })
    );
  });

  it('keeps a bounded history of recent shadow-read qualifications', async () => {
    memoryServiceMock.getActiveProjects.mockResolvedValue([
      { id: 'project-a', title: 'Atlas' },
    ]);
    memoryServiceMock.getRecentDecisions.mockResolvedValue([]);
    memoryServiceMock.getKnowledge.mockResolvedValue([]);
    memoryServiceMock.getActiveRituals.mockResolvedValue([]);
    localStorage.setItem('titane_hybrid_memory_shadow_read_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    for (const score of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4]) {
      unifiedMemoryInstanceMock.retrieveMemories.mockResolvedValue([
        { entry: { id: `m-${score}`, summary: 'Atlas' }, score },
      ]);

      await memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      });
    }

    const diagnostics = memoryIntegration.getHybridMemoryDiagnostics();
    expect(diagnostics.recentShadowReadQualifications).toHaveLength(5);
    expect(diagnostics.recentShadowReadQualifications[0]).toEqual(
      expect.objectContaining({ compositeScore: 0.7 })
    );
  });
});
