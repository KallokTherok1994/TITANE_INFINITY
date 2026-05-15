/**
 * Tests TwinsPage — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge PARTIAL + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TwinsPage } from '@/pages/TwinsPage';

const approveTwinChatReviewItemMock = vi.fn();
const rejectTwinChatReviewItemMock = vi.fn();
const listTwinChatReviewItemsMock = vi.fn(() => []);

// ── Mock useTwinIdentity ─────────────────────────────────────────
vi.mock('../hooks/useTwinIdentity', () => ({
  useTwinIdentity: () => ({
    identity: null,
    isLoading: false,
    coreValues: [],
    humanStyle: null,
    fusionIndex: 0,
  }),
}));

// ── Mock useTwinEvolution ────────────────────────────────────────
vi.mock('../hooks/useTwinEvolution', () => ({
  useTwinEvolution: () => ({
    evolutionProfile: null,
    isLoading: false,
    fusionIndex: 0,
    syncScore: 0.87,
    currentPhase: 'Observation',
    chatContextStatus: 'active',
    growthTrends: {},
    ownerThemes: [],
    sourceCount: 3,
    recalculateFusion: vi.fn(),
    transitionPhase: vi.fn(),
    reinforceValue: vi.fn(),
    adjustTrait: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/services/twin_chat', async () => {
  const actual = await vi.importActual<typeof import('@/services/twin_chat')>(
    '@/services/twin_chat'
  );

  return {
    ...actual,
    approveTwinChatReviewItem: approveTwinChatReviewItemMock,
    rejectTwinChatReviewItem: rejectTwinChatReviewItemMock,
    listTwinChatReviewItems: listTwinChatReviewItemsMock,
  };
});

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <TwinsPage />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('TwinsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listTwinChatReviewItemsMock.mockReturnValue([]);
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-twins')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge with PARTIAL variant', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-partial')).toBeInTheDocument();
  });

  it('renders pending twin chat reviews and validates them explicitly', async () => {
    listTwinChatReviewItemsMock.mockReturnValue([
      {
        id: 'value:clarte',
        candidate: {
          id: 'value:clarte',
          kind: 'value',
          contentCompact: 'clarte',
          context: 'conversation',
          confidence: 0.88,
          evidenceSource: 'chat_turn',
          consentRisk: 'medium',
          status: 'shadow',
          canWriteTwin: false,
        },
        decision: {
          candidateId: 'value:clarte',
          verdict: 'review_required',
          observationType: 'value',
          validationStatus: 'requires_kevin_validation',
          riskLevel: 'medium',
          canWriteTwin: false,
          requiresKevinValidation: true,
        },
        recordedAt: '2026-05-15T12:00:00.000Z',
        lastSeenAt: '2026-05-15T12:00:00.000Z',
        writeStatus: 'pending',
      },
    ]);
    approveTwinChatReviewItemMock.mockResolvedValue({
      id: 'value:clarte',
      writeStatus: 'approved',
    });

    renderPage();

    expect(screen.getByTestId('twin-chat-review-queue')).toBeInTheDocument();
    expect(screen.getByTestId('twin-chat-review-item-0')).toHaveTextContent('clarte');

    fireEvent.click(screen.getByTestId('twin-chat-review-approve-0'));

    await waitFor(() => {
      expect(approveTwinChatReviewItemMock).toHaveBeenCalledWith('value:clarte');
    });
  });
});
