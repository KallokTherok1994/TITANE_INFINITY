import { numericTwinService } from '@/services/api/numericTwin';

import type {
  TwinChatObservationCandidate,
  TwinChatPolicyDecision,
  TwinChatReviewItem,
} from './types';

const STORAGE_KEY = 'titane_twin_chat_review_queue_v1';
const STORAGE_EVENT = 'titane:twin-chat-review-queue-changed';
const REVIEW_ITEM_TTL_DAYS = 30;
const FAILED_ITEM_TTL_HOURS = 48;
const MAX_REVIEW_QUEUE_SIZE = 200;

function canPersist(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitQueueChanged(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function sortQueue(items: TwinChatReviewItem[]): TwinChatReviewItem[] {
  return [...items].sort((left, right) => {
    const pendingRank = left.writeStatus === 'pending' ? 0 : 1;
    const rightRank = right.writeStatus === 'pending' ? 0 : 1;

    if (pendingRank !== rightRank) {
      return pendingRank - rightRank;
    }

    return right.lastSeenAt.localeCompare(left.lastSeenAt);
  });
}

function readQueue(): TwinChatReviewItem[] {
  if (!canPersist()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as TwinChatReviewItem[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - REVIEW_ITEM_TTL_DAYS * 24 * 60 * 60 * 1000;
    const failedCutoff = Date.now() - FAILED_ITEM_TTL_HOURS * 60 * 60 * 1000;
    const fresh = parsed.filter(item => {
      const recordedMs = new Date(item.recordedAt).getTime();
      if (item.writeStatus === 'failed') return recordedMs >= failedCutoff;
      return recordedMs >= cutoff;
    });
    return sortQueue(fresh);
  } catch {
    return [];
  }
}

function writeQueue(items: TwinChatReviewItem[]): TwinChatReviewItem[] {
  if (!canPersist()) {
    return sortQueue(items);
  }

  const sorted = sortQueue(items).slice(0, MAX_REVIEW_QUEUE_SIZE);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    emitQueueChanged();
  } catch {
    // localStorage quota exceeded or unavailable — in-memory only, no event emitted
  }
  return sorted;
}

function isActionable(decision: TwinChatPolicyDecision): boolean {
  return decision.verdict === 'review_required' || decision.verdict === 'downgraded';
}

function buildDecisionMap(
  decisions: TwinChatPolicyDecision[]
): Map<string, TwinChatPolicyDecision> {
  return new Map(decisions.map(decision => [decision.candidateId, decision]));
}

async function submitApprovedCandidate(
  candidate: TwinChatObservationCandidate
): Promise<string> {
  switch (candidate.kind) {
    case 'value':
      return numericTwinService.observeValue(
        candidate.contentCompact,
        candidate.context,
        candidate.confidence
      );
    case 'cognitive':
      return numericTwinService.observeCognitivePattern(
        candidate.contentCompact,
        candidate.context,
        candidate.confidence
      );
    case 'style':
      return numericTwinService.observeStyle(
        candidate.contentCompact,
        candidate.context,
        candidate.confidence
      );
    case 'emotional':
      return numericTwinService.observeEmotional(
        candidate.contentCompact,
        candidate.context,
        candidate.confidence
      );
    default:
      throw new Error('Type twin_chat non supporte pour ecriture limitee');
  }
}

export function listTwinChatReviewItems(): TwinChatReviewItem[] {
  return readQueue();
}

export function recordTwinChatReviewItems(params: {
  candidates: TwinChatObservationCandidate[];
  decisions: TwinChatPolicyDecision[];
  now?: string;
}): TwinChatReviewItem[] {
  const now = params.now ?? new Date().toISOString();
  const decisionMap = buildDecisionMap(params.decisions);
  const next = new Map(readQueue().map(item => [item.id, item]));

  for (const candidate of params.candidates) {
    const decision = decisionMap.get(candidate.id);
    if (!decision || !isActionable(decision)) {
      continue;
    }

    const existing = next.get(candidate.id);

    next.set(candidate.id, {
      id: candidate.id,
      candidate,
      decision,
      recordedAt: existing?.recordedAt ?? now,
      lastSeenAt: now,
      reviewedAt: existing?.reviewedAt,
      syncId: existing?.syncId,
      writeStatus: existing?.writeStatus ?? 'pending',
      writeError: existing?.writeError,
    });
  }

  return writeQueue([...next.values()]);
}

export async function approveTwinChatReviewItem(
  reviewId: string
): Promise<TwinChatReviewItem> {
  const queue = readQueue();
  const target = queue.find(item => item.id === reviewId);

  if (!target) {
    throw new Error('Review twin_chat introuvable');
  }

  if (!isActionable(target.decision)) {
    throw new Error('Cette review twin_chat ne peut pas etre validee');
  }

  if (target.writeStatus !== 'pending') {
    throw new Error('Cette review twin_chat a déjà été traitée');
  }

  const reviewedAt = new Date().toISOString();

  try {
    const syncId = await submitApprovedCandidate(target.candidate);
    try {
      await numericTwinService.refreshChatContextSnapshot();
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'actualisation Twin indisponible';

      const updated = {
        ...target,
        syncId,
        reviewedAt,
        writeStatus: 'approved' as const,
        writeError: `Observation ecrite, snapshot en attente: ${message}`,
      };

      writeQueue(queue.map(item => (item.id === reviewId ? updated : item)));
      return updated;
    }

    const updated = {
      ...target,
      syncId,
      reviewedAt,
      writeStatus: 'approved' as const,
      writeError: undefined,
    };

    writeQueue(queue.map(item => (item.id === reviewId ? updated : item)));
    return updated;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'ecriture Twin limitee indisponible';
    const updated = {
      ...target,
      reviewedAt,
      writeStatus: 'failed' as const,
      writeError: message,
    };

    writeQueue(queue.map(item => (item.id === reviewId ? updated : item)));
    throw new Error(message);
  }
}

export function rejectTwinChatReviewItem(reviewId: string): TwinChatReviewItem {
  const queue = readQueue();
  const target = queue.find(item => item.id === reviewId);

  if (!target) {
    throw new Error('Review twin_chat introuvable');
  }

  if (target.writeStatus !== 'pending') {
    throw new Error('Cette review twin_chat a déjà été traitée');
  }

  const updated = {
    ...target,
    reviewedAt: new Date().toISOString(),
    writeStatus: 'rejected' as const,
    writeError: undefined,
  };

  writeQueue(queue.map(item => (item.id === reviewId ? updated : item)));
  return updated;
}
