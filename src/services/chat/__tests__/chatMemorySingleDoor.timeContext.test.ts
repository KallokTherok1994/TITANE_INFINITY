import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  TIME_RUNTIME_CONTEXT_KEY,
  buildChatContextEnvelope,
  formatContextEnvelopeForSystemPrompt,
  type BuildSingleDoorInput,
} from '@/services/chat/chatMemorySingleDoor';
import { resolveChatMemoryStorageKey } from '@/services/chatMemoryCompactor';
import type { ModuleRouteContext } from '@/services/chat/moduleRouteContext';

function makeModuleContext(route = '/time'): ModuleRouteContext {
  return {
    route,
    moduleId: route === '/time' ? 'time_center' : 'titane_core',
    moduleName: route === '/time' ? 'Time Center' : 'Titane Core',
    moduleType: route === '/time' ? 'planning' : 'core-chat',
    pageTitle: route === '/time' ? 'Time' : 'TITANE',
    capabilities: ['temporal-situational-awareness'],
    dataTruthClass: 'MIXED_LIVE_AND_STATIC',
    actions: ['read_time_runtime_context'],
    limits: [],
    memoryKeys: [TIME_RUNTIME_CONTEXT_KEY],
    continuity: { sequence: 1, changeType: 'initial' },
    updatedAt: Date.now(),
  };
}

function makeInput(): BuildSingleDoorInput {
  return {
    mode: 'default',
    conversationId: 'time-conv-001',
    providerRequested: 'ollama',
    moduleContext: makeModuleContext(),
    inMemoryMessages: [],
  };
}

describe('chatMemorySingleDoor time context', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads TIME runtime context from localStorage into the chat envelope', () => {
    const now = Date.now();
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '2026-05-08T14:15:00.000Z',
        timeZone: 'America/Toronto',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 3,
        eventsThisWeek: 9,
        todayFocusMinutes: 210,
        currentEnergy: 82,
        activeTab: 'cognitive',
        runtimeSource: 'persistence-active',
        updatedAt: now,
      })
    );

    const envelope = buildChatContextEnvelope(makeInput());

    expect(envelope?.timeContext).toEqual(
      expect.objectContaining({
        currentDateTime: '2026-05-08T14:15:00.000Z',
        timeZone: 'America/Toronto',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 3,
        eventsThisWeek: 9,
        todayFocusMinutes: 210,
        currentEnergy: 82,
        activeTab: 'cognitive',
        runtimeSource: 'persistence-active',
      })
    );
  });

  it('injects fresh TIME context for chat route without mounting /time', () => {
    const now = Date.now();
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'global-publisher',
        updatedAt: now,
      })
    );

    const envelope = buildChatContextEnvelope({
      ...makeInput(),
      moduleContext: makeModuleContext('/titane'),
    });

    expect(envelope?.routeContext.route).toBe('/titane');
    expect(envelope?.timeContext).toEqual(
      expect.objectContaining({
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        runtimeSource: 'global-publisher',
      })
    );

    const prompt = formatContextEnvelopeForSystemPrompt(envelope!);
    expect(prompt).toContain('time_now=2026-05-09T10:22:00.000Z');
    expect(prompt).toContain('time_zone=Europe/Paris');
    expect(prompt).toContain('time_segment=Deep Focus');
    expect(prompt).toContain('time_work_hours=true');
    expect(prompt).toContain('time_runtime_source=global-publisher');
    expect(prompt).toContain('temporal_memory_status=fresh');
    expect(prompt).toContain('temporal_memory_runtime_source=global-publisher');
    expect(prompt).toContain('temporal_memory_compact_timeline=');
  });

  it('formats the TIME runtime context into the governed system prompt block', () => {
    const now = Date.now();
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '2026-05-08T14:15:00.000Z',
        timeZone: 'America/Toronto',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 3,
        eventsThisWeek: 9,
        todayFocusMinutes: 210,
        currentEnergy: 82,
        runtimeSource: 'persistence-active',
        updatedAt: now,
      })
    );

    const envelope = buildChatContextEnvelope(makeInput());
    const prompt = formatContextEnvelopeForSystemPrompt(envelope!);

    expect(prompt).toContain('time_now=2026-05-08T14:15:00.000Z');
    expect(prompt).toContain('time_zone=America/Toronto');
    expect(prompt).toContain('time_segment=Deep Focus');
    expect(prompt).toContain('time_events_today=3');
    expect(prompt).toContain('time_focus_minutes_today=210');
    expect(prompt).toContain('time_runtime_source=persistence-active');

    const temporalMarkers = [
      'temporal_memory_status=',
      'temporal_memory_runtime_source=',
      'temporal_memory_age_ms=',
      'temporal_memory_ttl_ms=',
      'temporal_memory_freshness_ratio=',
      'temporal_memory_warning_count=',
      'temporal_memory_key_moments=',
      'temporal_memory_compact_timeline=',
      'temporal_memory_prompt_safe_summary=',
    ];

    for (const marker of temporalMarkers) {
      expect(prompt.match(new RegExp(marker, 'g'))?.length ?? 0).toBe(1);
    }
  });

  it('ignores malformed TIME runtime payloads instead of injecting partial truth', () => {
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '',
        eventsToday: 1,
      })
    );

    const envelope = buildChatContextEnvelope(makeInput());

    const ctx = envelope?.timeContext;
    if (ctx !== undefined) { expect(ctx.runtimeSource).toBe('degraded'); }
    const sum = envelope?.temporalMemorySummary;
    if (sum !== undefined) { expect(sum.runtimeSource).toBe('degraded'); }
  });

  it('keeps envelope stable when TIME runtime key is absent', () => {
    const envelope = buildChatContextEnvelope(makeInput());
    const prompt = formatContextEnvelopeForSystemPrompt(envelope!);

    const ctx = envelope?.timeContext;
    if (ctx !== undefined) { expect(ctx.runtimeSource).toBe('degraded'); }
    const sum = envelope?.temporalMemorySummary;
    if (sum !== undefined) { expect(sum.runtimeSource).toBe('degraded'); }
  });

  it('formats malformed temporal summary values without throwing', () => {
    const envelope = buildChatContextEnvelope(makeInput());
    const malformedEnvelope = {
      ...envelope!,
      temporalMemorySummary: {
        status: 123,
        runtimeSource: null,
        ageMs: 'NaN',
        ttlMs: null,
        freshnessRatio: undefined,
        warningCount: 'oops',
        keyMoments: ['ok', 42],
        compactTimeline: null,
        promptSafeSummary: undefined,
      },
    } as unknown as NonNullable<typeof envelope>;

    const formatCall = () => formatContextEnvelopeForSystemPrompt(malformedEnvelope);

    expect(formatCall).not.toThrow();
    const prompt = formatCall();
    expect(prompt).toContain('temporal_memory_warning_count=0');
    expect(prompt).toContain('temporal_memory_key_moments=ok');
  });

  it('excludes stale TIME runtime payloads to avoid temporal drift in chat', () => {
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '2026-05-08T14:15:00.000Z',
        timeZone: 'America/Toronto',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 3,
        eventsThisWeek: 9,
        todayFocusMinutes: 210,
        currentEnergy: 82,
        runtimeSource: 'persistence-active',
        updatedAt: Date.now() - 901_000,
      })
    );

    const envelope = buildChatContextEnvelope(makeInput());

    const ctx = envelope?.timeContext;
    if (ctx !== undefined) { expect(ctx.runtimeSource).toBe('degraded'); }
  });

  it('reads mode memory from namespace-aware storage key', () => {
    window.localStorage.setItem(
      resolveChatMemoryStorageKey('default'),
      JSON.stringify({
        messages: [
          {
            id: 'msg-ns-1',
            role: 'assistant',
            content: 'namespace-aware-memory',
            timestamp: Date.now(),
          },
        ],
      })
    );

    const envelope = buildChatContextEnvelope(makeInput());
    expect(
      envelope?.memorySingleDoor.recentMessages.some(msg =>
        msg.content.includes('namespace-aware-memory')
      )
    ).toBe(true);
    // readTimeRuntimeContextWithFallback() always returns a context (degraded if no storage key).
    // When no explicit time context is set, the summary uses runtimeSource='degraded'.
    const summary = envelope?.temporalMemorySummary;
    if (summary !== undefined) {
      expect(summary.runtimeSource).toBe('degraded');
    }
  });

  it('deduplicates repeated temporal moments before prompt injection', () => {
    const now = Date.now();
    window.localStorage.setItem(
      TIME_RUNTIME_CONTEXT_KEY,
      JSON.stringify({
        currentDateTime: '2026-05-08T14:15:00.000Z',
        timeZone: 'America/Toronto',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 3,
        eventsThisWeek: 9,
        todayFocusMinutes: 210,
        currentEnergy: 82,
        runtimeSource: 'persistence-active',
        updatedAt: now,
      })
    );

    const repeated = 'Plan sprint roadmap for this afternoon.';
    const envelope = buildChatContextEnvelope({
      ...makeInput(),
      inMemoryMessages: [
        { role: 'user', content: repeated, timestamp: now - 400 },
        { role: 'assistant', content: repeated, timestamp: now - 300 },
        { role: 'user', content: repeated, timestamp: now - 200 },
      ],
    });

    expect(envelope?.temporalMemorySummary?.deduplicatedMomentsCount).toBe(1);
    expect(envelope?.temporalMemorySummary?.rawMomentsCount).toBe(3);
  });
});
