/**
 * TITANE∞ — ChatToolbar does NOT call useChat directly
 *
 * Two-pronged verification:
 *  1. Static: The ChatToolbar source file does not import or reference useChat.
 *  2. Runtime: Rendering ChatToolbar with minimal props emits no
 *     "No active conversation" warning (the warning that useChat's fallback path
 *     produces when no active conversation is found in storage).
 *
 * Covers: src/components/chat/ChatToolbar.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import React from 'react';

// ── Static analysis ────────────────────────────────────────────────────────

const TOOLBAR_SOURCE_PATH = resolve(
  __dirname,
  '../../../../src/components/chat/ChatToolbar.tsx'
);

function readToolbarSource(): string {
  try {
    return readFileSync(TOOLBAR_SOURCE_PATH, 'utf-8');
  } catch {
    // Fallback: resolve relative to this file's actual location
    return readFileSync(resolve(__dirname, '../ChatToolbar.tsx'), 'utf-8');
  }
}

// ── Stubs for ChatToolbar's own dependencies ───────────────────────────────

vi.mock('@/stores/useVisionStore.selectors', () => ({
  useDisableVision: vi.fn(),
  useEnableVision: vi.fn(),
  useVisionObservationActive: vi.fn(() => false),
}));

vi.mock('@/hooks/useVoiceEngine', () => ({
  useVoiceEngine: () => ({
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    transcript: '',
    isSupported: false,
  }),
}));

vi.mock('@/hooks/useAutoTimeout', () => ({
  useAutoTimeout: () => ({ isActive: false }),
  useElapsedTime: () => 0,
  formatElapsedTime: (ms: number) => String(ms),
}));

vi.mock('@/hooks/usePreferences', () => ({
  useTTSPreference: () => [false, vi.fn()],
  useAudioConversationPreference: () => [false, vi.fn()],
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/utils/APISupport', () => ({
  APISupport: { isVisionSupported: vi.fn(() => false) },
}));

vi.mock('@/services/audioTranscriptionService', () => ({
  audioTranscriptionService: { transcribe: vi.fn() },
}));

vi.mock('@/components/chat/RecordingTimer', () => ({
  RecordingTimer: () => null,
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

// ── useChat spy — must NOT be called by ChatToolbar ───────────────────────

const useChatMock = vi.fn();
vi.mock('@/hooks/useChat', () => ({ useChat: useChatMock }));

// ── Import ChatToolbar AFTER mocks ─────────────────────────────────────────

import { ChatToolbar } from '@/components/chat/ChatToolbar';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ChatToolbar — no independent fallback / no useChat dependency', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useChatMock.mockClear();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('(static) ChatToolbar source does not import or reference useChat', () => {
    const source = readToolbarSource();

    // Must not import from the useChat hook module
    expect(source).not.toMatch(/from\s+['"].*useChat['"]/);

    // Must not call useChat() anywhere in the file
    expect(source).not.toMatch(/useChat\s*\(/);
  });

  it('(runtime) renders ChatToolbar with minimal props without calling useChat', () => {
    render(React.createElement(ChatToolbar));

    expect(useChatMock).toHaveBeenCalledTimes(0);
  });

  it('(runtime) no "No active conversation" warning is emitted on render', () => {
    render(React.createElement(ChatToolbar));

    const warnCalls = consoleWarnSpy.mock.calls.map(args => String(args[0]));
    const hasNoActiveConvWarn = warnCalls.some(msg =>
      msg.toLowerCase().includes('no active conversation')
    );

    expect(hasNoActiveConvWarn).toBe(false);
  });
});
