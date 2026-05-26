/**
 * TITANE∞ v44 — Temporal Memory Manager
 * Governs temporal context summarization for safe prompt injection.
 */

const TEMPORAL_MEMORY_MAX_ITEMS = 8;
const TEMPORAL_MEMORY_MAX_CHARS = 480;

export interface TemporalMemoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TemporalMemoryTimeContext {
  currentDateTime: string;
  timeZone: string;
  currentSegment: string;
  isWorkHours: boolean;
  eventsToday: number;
  eventsThisWeek: number;
  todayFocusMinutes: number;
  currentEnergy: number;
  runtimeSource?:
    | 'uninitialized'
    | 'persistence-active'
    | 'degraded'
    | 'global-publisher';
  updatedAt: number;
}

export interface TemporalMemorySummary {
  status: 'fresh';
  runtimeSource: string;
  updatedAt: number;
  ageMs: number;
  ttlMs: number;
  freshnessRatio: number;
  rawMomentsCount: number;
  deduplicatedMomentsCount: number;
  keyMoments: string[];
  compactTimeline: string;
  promptSafeSummary: string;
  warningCount: number;
  warnings: TemporalMemoryWarningCode[];
}

export type TemporalMemoryWarningCode =
  | 'future_timestamp_clamped'
  | 'compact_timeline_truncated'
  | 'prompt_summary_truncated'
  | 'malformed_recent_message_skipped';

export interface BuildTemporalMemorySummaryInput {
  timeContext?: TemporalMemoryTimeContext;
  recentMessages: TemporalMemoryMessage[];
  ttlMs: number;
  now?: number;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function compactText(value: string, maxChars: number): string {
  return compactTextWithMeta(value, maxChars).text;
}

function compactTextWithMeta(
  value: string,
  maxChars: number
): { text: string; truncated: boolean } {
  const normalized = normalizeText(value);
  if (normalized.length <= maxChars) {
    return { text: normalized, truncated: false };
  }

  return {
    text: `${normalized.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`,
    truncated: true,
  };
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function buildKeyMoments(messages: TemporalMemoryMessage[]): {
  rawCount: number;
  deduplicatedCount: number;
  moments: string[];
  malformedSkippedCount: number;
} {
  const seen = new Set<string>();
  const moments: string[] = [];
  let malformedSkippedCount = 0;

  for (const message of messages.slice(-12) as Array<Partial<TemporalMemoryMessage>>) {
    if (
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string'
    ) {
      malformedSkippedCount += 1;
      continue;
    }

    const compact = compactText(message.content, 80);
    if (!compact) {
      continue;
    }

    const dedupeKey = compact.toLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    moments.push(`${message.role}:${compact}`);
    if (moments.length >= TEMPORAL_MEMORY_MAX_ITEMS) {
      break;
    }
  }

  return {
    rawCount: messages.length,
    deduplicatedCount: moments.length,
    moments,
    malformedSkippedCount,
  };
}

export function buildTemporalMemorySummary(
  input: BuildTemporalMemorySummaryInput
): TemporalMemorySummary | undefined {
  const { timeContext } = input;
  if (!timeContext) {
    return undefined;
  }

  if (!Number.isFinite(timeContext.updatedAt)) {
    return undefined;
  }

  const now = toFiniteNumber(input.now, Date.now());
  const ttlMs = Math.max(1, Math.round(toFiniteNumber(input.ttlMs, 1)));
  const warnings = new Set<TemporalMemoryWarningCode>();
  const normalizedUpdatedAt = Math.max(0, Math.round(timeContext.updatedAt));
  const clampedUpdatedAt = Math.min(normalizedUpdatedAt, now);
  if (normalizedUpdatedAt > now) {
    warnings.add('future_timestamp_clamped');
  }

  const ageMs = Math.max(0, now - clampedUpdatedAt);
  const freshnessRatio = Math.max(0, Math.min(1, 1 - ageMs / ttlMs));

  const moments = buildKeyMoments(input.recentMessages);
  if (moments.malformedSkippedCount > 0) {
    warnings.add('malformed_recent_message_skipped');
  }

  const compactTimelineMeta = compactTextWithMeta(
    [
      `segment=${timeContext.currentSegment}`,
      `work_hours=${timeContext.isWorkHours}`,
      `events_today=${toFiniteNumber(timeContext.eventsToday, 0)}`,
      `focus_minutes=${toFiniteNumber(timeContext.todayFocusMinutes, 0)}`,
      `energy=${toFiniteNumber(timeContext.currentEnergy, 0)}`,
      moments.moments.join(' | '),
    ]
      .filter(Boolean)
      .join(' | '),
    TEMPORAL_MEMORY_MAX_CHARS
  );
  if (compactTimelineMeta.truncated) {
    warnings.add('compact_timeline_truncated');
  }

  const promptSafeSummaryMeta = compactTextWithMeta(
    `time=${timeContext.currentDateTime} zone=${timeContext.timeZone} segment=${timeContext.currentSegment} events_today=${toFiniteNumber(
      timeContext.eventsToday,
      0
    )} events_week=${toFiniteNumber(timeContext.eventsThisWeek, 0)} focus=${toFiniteNumber(
      timeContext.todayFocusMinutes,
      0
    )} energy=${toFiniteNumber(timeContext.currentEnergy, 0)} freshness=${freshnessRatio.toFixed(2)}`,
    TEMPORAL_MEMORY_MAX_CHARS
  );
  if (promptSafeSummaryMeta.truncated) {
    warnings.add('prompt_summary_truncated');
  }

  const finalWarnings = Array.from(warnings);

  return {
    status: 'fresh',
    runtimeSource: timeContext.runtimeSource ?? 'unknown',
    updatedAt: clampedUpdatedAt,
    ageMs,
    ttlMs,
    freshnessRatio,
    rawMomentsCount: moments.rawCount,
    deduplicatedMomentsCount: moments.deduplicatedCount,
    keyMoments: moments.moments,
    compactTimeline: compactTimelineMeta.text,
    promptSafeSummary: promptSafeSummaryMeta.text,
    warningCount: finalWarnings.length,
    warnings: finalWarnings,
  };
}
