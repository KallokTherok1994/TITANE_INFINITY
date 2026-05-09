import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  TIME_RUNTIME_CONTEXT_KEY,
  buildChatContextEnvelope,
  formatContextEnvelopeForSystemPrompt,
  type BuildSingleDoorInput,
} from '@/services/chat/chatMemorySingleDoor';
import type { ModuleRouteContext } from '@/services/chat/moduleRouteContext';

function makeModuleContext(): ModuleRouteContext {
  return {
    route: '/time',
    moduleId: 'time_center',
    moduleName: 'Time Center',
    moduleType: 'planning',
    pageTitle: 'Time',
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

    expect(envelope?.timeContext).toBeUndefined();
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

    expect(envelope?.timeContext).toBeUndefined();
  });
});
