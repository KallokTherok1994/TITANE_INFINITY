/**
 * Tests ConfigurationHub — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigurationHub } from '@/pages/ConfigurationHub';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    getAllConfigs: vi.fn().mockResolvedValue({
      ok: true,
      content: {
        runtime: {},
        chat_engine: { timeout_ms: 30000, chunk_size: 1024, max_tokens: 2048, temperature: 0.7 },
        timestamp: 0,
        version: 'test',
      },
    }),
    aiCheckOllamaStatus: vi.fn().mockRejectedValue(new Error('offline')),
    getChatEngineConfig: vi.fn().mockResolvedValue({
      ok: true,
      content: {
        response_timeout_ms: 30000,
        stream_chunk_size: 1024,
        memory_context_tokens: 2048,
        memory_retention_tokens: 1024,
        memory_flush_interval_ms: 5000,
        auto_tts_enabled: false,
        stream_channel_buffer: 100,
      },
      error: null,
    }),
    getChatRequestDefaults: vi.fn().mockResolvedValue({
      ok: true,
      content: { temperature: 0.7, max_output_tokens: 2048, enable_streaming: true, provider: null },
      error: null,
    }),
    getAudioDeviceConfig: vi.fn().mockResolvedValue(null),
    updateRuntimeConfig: vi.fn().mockResolvedValue(null),
    listConfigPresets: vi.fn().mockResolvedValue([]),
    getOllamaStatus: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/services/tauri/chatEngine.commands', () => ({
  invalidateRequestDefaultsCache: vi.fn(),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn().mockReturnValue({ showToast: vi.fn() }),
}));

vi.mock('@/hooks/useCognitiveLayout', () => ({
  useCognitiveLayout: vi.fn().mockReturnValue({
    currentMode: 'neutral',
    setMode: vi.fn(),
    resetMode: vi.fn(),
    toggleAdaptation: vi.fn(),
    isAdaptationEnabled: true,
  }),
}));

vi.mock('@/contexts/AnimationContext', () => ({
  useAnimation: vi.fn().mockReturnValue({
    animationConfig: { duration: 300, skipAnimation: false },
    shouldReduceMotion: false,
    shouldThrottle: false,
    fps: 60,
  }),
  AnimationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ConfigurationHub />
    </MemoryRouter>
  );
}

describe('ConfigurationHub', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the page container', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('page-configuration-hub')).toBeInTheDocument();
    });
  });

  it('shows SurfaceTruthBadge when config is loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('surface-truth-badge-live')).toBeInTheDocument();
    });
  });
});
