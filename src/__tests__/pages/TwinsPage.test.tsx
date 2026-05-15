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

const twinChatReviewMocks = vi.hoisted(() => ({
  approveTwinChatReviewItemMock: vi.fn(),
  rejectTwinChatReviewItemMock: vi.fn(),
  listTwinChatReviewItemsMock: vi.fn(() => []),
}));

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
    approveTwinChatReviewItem: twinChatReviewMocks.approveTwinChatReviewItemMock,
    rejectTwinChatReviewItem: twinChatReviewMocks.rejectTwinChatReviewItemMock,
    listTwinChatReviewItems: twinChatReviewMocks.listTwinChatReviewItemsMock,
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
    twinChatReviewMocks.listTwinChatReviewItemsMock.mockReturnValue([]);
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
    twinChatReviewMocks.listTwinChatReviewItemsMock.mockReturnValue([
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
    twinChatReviewMocks.approveTwinChatReviewItemMock.mockResolvedValue({
      id: 'value:clarte',
      writeStatus: 'approved',
    });

    renderPage();

    expect(screen.getByTestId('twin-chat-review-queue')).toBeInTheDocument();
    expect(screen.getByTestId('twin-chat-review-item-0')).toHaveTextContent('clarte');

    fireEvent.click(screen.getByTestId('twin-chat-review-approve-0'));

    await waitFor(() => {
      expect(twinChatReviewMocks.approveTwinChatReviewItemMock).toHaveBeenCalledWith(
        'value:clarte'
      );
    });
  });

  it('rejects a pending twin chat review and keeps the queue consistent', async () => {
    twinChatReviewMocks.listTwinChatReviewItemsMock.mockReturnValue([
      {
        id: 'style:clarte_directe',
        candidate: {
          id: 'style:clarte_directe',
          kind: 'style',
          contentCompact: 'clarte directe',
          context: 'conversation',
          confidence: 0.84,
          evidenceSource: 'chat_turn',
          consentRisk: 'low',
          status: 'shadow',
          canWriteTwin: false,
        },
        decision: {
          candidateId: 'style:clarte_directe',
          verdict: 'downgraded',
          observationType: 'preference',
          validationStatus: 'system_observed',
          riskLevel: 'low',
          canWriteTwin: false,
          requiresKevinValidation: false,
        },
        recordedAt: '2026-05-15T12:05:00.000Z',
        lastSeenAt: '2026-05-15T12:05:00.000Z',
        writeStatus: 'pending',
      },
    ]);

    renderPage();

    fireEvent.click(screen.getByTestId('twin-chat-review-reject-0'));

    await waitFor(() => {
      expect(twinChatReviewMocks.rejectTwinChatReviewItemMock).toHaveBeenCalledWith(
        'style:clarte_directe'
      );
    });
  });

  it('surfaces a visible error when the limited Twin write fails', async () => {
    twinChatReviewMocks.listTwinChatReviewItemsMock.mockReturnValue([
      {
        id: 'value:clarté-limitée',
        candidate: {
          id: 'value:clarté-limitée',
          kind: 'value',
          contentCompact: 'clarté limitée',
          context: 'conversation',
          confidence: 0.81,
          evidenceSource: 'chat_turn',
          consentRisk: 'medium',
          status: 'shadow',
          canWriteTwin: false,
        },
        decision: {
          candidateId: 'value:clarté-limitée',
          verdict: 'review_required',
          observationType: 'value',
          validationStatus: 'requires_kevin_validation',
          riskLevel: 'medium',
          canWriteTwin: false,
          requiresKevinValidation: true,
        },
        recordedAt: '2026-05-15T12:10:00.000Z',
        lastSeenAt: '2026-05-15T12:10:00.000Z',
        writeStatus: 'pending',
      },
    ]);
    twinChatReviewMocks.approveTwinChatReviewItemMock.mockRejectedValueOnce(
      new Error('backend unavailable')
    );

    renderPage();

    fireEvent.click(screen.getByTestId('twin-chat-review-approve-0'));

    await waitFor(() => {
      expect(twinChatReviewMocks.approveTwinChatReviewItemMock).toHaveBeenCalledWith(
        'value:clarté-limitée'
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('twin-chat-review-error')).toHaveTextContent(
        'backend unavailable'
      );
    });
  });
});
