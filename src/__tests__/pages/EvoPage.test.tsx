/**
 * Tests EvoPage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge
 * AH-v98-PHASE6-PLUS
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvoPage } from '@/pages/EvoPage';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    persistentMemoryGetStats: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi
    .fn()
    .mockResolvedValue({ ok: false, content: null, error: null }),
  safeInvoke: vi.fn().mockResolvedValue({ ok: false, content: null, error: null }),
}));

vi.mock('@/cognitive/progression/xpEngine', () => ({
  createProgressionStateFromExperience: vi.fn().mockReturnValue({
    totalXP: 0,
    level: 0,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
    chatMessageCount: 0,
    lastQualityTier: null,
    qualityTierCounts: {},
    milestones: [],
    unlockedMilestones: [],
    lastXPGain: null,
    streakDays: 0,
    lastActiveDate: '2026-05-18',
    createdAt: 1,
    updatedAt: 1,
  }),
  xpEngine: {
    getProgressionState: vi.fn().mockReturnValue(null),
    getState: vi.fn().mockReturnValue(null),
  },
}));

vi.mock('@/services/experienceService', () => ({
  initExperienceService: vi.fn().mockResolvedValue(undefined),
  getExperienceState: vi.fn().mockReturnValue({
    totalXp: 0,
    level: 0,
    domains: {},
    history: [],
    lastUpdated: 1,
    version: '1.0.0',
  }),
}));

vi.mock('@/hooks/useVisualEngines', () => ({
  useVisualEngines: vi.fn().mockReturnValue({ singularity: null }),
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
      <EvoPage />
    </MemoryRouter>
  );
}

describe('EvoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant when no memory stats', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });
});
