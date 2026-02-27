export type AutoRcaCategory =
  | 'runtime-errors'
  | 'ui-desync'
  | 'performance-drift'
  | 'permission-denied'
  | 'provider-down'
  | 'unknown';

export type AutoRcaConfidenceStatus = 'high' | 'medium' | 'low' | 'unknown';

export interface AutoRcaTimelineEvent {
  timestampMs: number;
  source: 'ui' | 'ipc' | 'service' | 'engine' | 'provider' | 'system';
  message: string;
}

export interface AutoRcaInput {
  incidentId: string;
  symptoms: string;
  timeline: AutoRcaTimelineEvent[];
}

export interface AutoRcaCategoryScore {
  category: Exclude<AutoRcaCategory, 'unknown'>;
  symptomHits: number;
  timelineHits: number;
  sourceDiversity: number;
  score: number;
}

export interface TimelineCorrelation {
  eventCount: number;
  firstTimestampMs?: number;
  lastTimestampMs?: number;
  maxBurstEventsIn10s: number;
}

export interface AutoRcaResult {
  incidentId: string;
  category: AutoRcaCategory;
  confidence: number;
  confidenceStatus: AutoRcaConfidenceStatus;
  unknownReason?: string;
  scores: AutoRcaCategoryScore[];
  timelineCorrelation: TimelineCorrelation;
}

export interface ProofPackV2Frame {
  incidentId: string;
  rootCauseCategory: AutoRcaCategory;
  confidence: number;
  confidenceStatus: AutoRcaConfidenceStatus;
  timelineCorrelation: TimelineCorrelation;
  classificationAtMs: number;
}

const CATEGORY_KEYWORDS: Record<Exclude<AutoRcaCategory, 'unknown'>, string[]> = {
  'runtime-errors': ['error', 'exception', 'panic', 'stack', 'trace', 'crash'],
  'ui-desync': ['desync', 'render', 'state', 'store', 'ui', 'ux'],
  'performance-drift': ['slow', 'lag', 'latency', 'performance', 'drift', 'fps'],
  'permission-denied': ['denied', 'forbidden', 'permission', 'unauthorized', 'blocked'],
  'provider-down': ['provider', 'timeout', 'unreachable', 'offline', 'down'],
};

export class AutoRcaEngine {
  classify(input: AutoRcaInput): AutoRcaResult {
    const normalizedSymptoms = normalizeText(input.symptoms);
    const orderedTimeline = [...input.timeline].sort(
      (left, right) => left.timestampMs - right.timestampMs
    );
    const timelineCorrelation = computeTimelineCorrelation(orderedTimeline);

    const scores = (
      Object.keys(CATEGORY_KEYWORDS) as Exclude<AutoRcaCategory, 'unknown'>[]
    )
      .map(category => {
        const symptomHits = countKeywordHits(
          normalizedSymptoms,
          CATEGORY_KEYWORDS[category]
        );
        const timelineHits = orderedTimeline.reduce((hits, event) => {
          return (
            hits +
            countKeywordHits(normalizeText(event.message), CATEGORY_KEYWORDS[category])
          );
        }, 0);
        const sourceDiversity = countSourceDiversityForCategory(
          orderedTimeline,
          CATEGORY_KEYWORDS[category]
        );

        const score = symptomHits * 0.6 + timelineHits * 0.3 + sourceDiversity * 0.1;

        return {
          category,
          symptomHits,
          timelineHits,
          sourceDiversity,
          score,
        };
      })
      .sort((left, right) => right.score - left.score);

    const topScore = scores[0];
    const secondScore = scores[1];
    const combinedTopTwo = (topScore?.score ?? 0) + (secondScore?.score ?? 0);
    const confidence =
      topScore && combinedTopTwo > 0 ? clamp(topScore.score / combinedTopTwo, 0, 1) : 0;

    if (!topScore || topScore.score < 1.2) {
      return {
        incidentId: input.incidentId,
        category: 'unknown',
        confidence,
        confidenceStatus: 'unknown',
        unknownReason: 'INSUFFICIENT_SIGNAL',
        scores,
        timelineCorrelation,
      };
    }

    if (confidence < 0.55) {
      return {
        incidentId: input.incidentId,
        category: 'unknown',
        confidence,
        confidenceStatus: 'unknown',
        unknownReason: 'AMBIGUOUS_CLASSIFICATION',
        scores,
        timelineCorrelation,
      };
    }

    return {
      incidentId: input.incidentId,
      category: topScore.category,
      confidence,
      confidenceStatus: this.resolveConfidenceStatus(confidence),
      scores,
      timelineCorrelation,
    };
  }

  buildProofPackV2Frame(
    result: AutoRcaResult,
    classificationAtMs: number
  ): ProofPackV2Frame {
    return {
      incidentId: result.incidentId,
      rootCauseCategory: result.category,
      confidence: result.confidence,
      confidenceStatus: result.confidenceStatus,
      timelineCorrelation: result.timelineCorrelation,
      classificationAtMs,
    };
  }

  private resolveConfidenceStatus(confidence: number): AutoRcaConfidenceStatus {
    if (confidence >= 0.8) {
      return 'high';
    }

    if (confidence >= 0.65) {
      return 'medium';
    }

    return 'low';
  }
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function countKeywordHits(content: string, keywords: string[]): number {
  return keywords.reduce((hits, keyword) => {
    if (!content.includes(keyword)) {
      return hits;
    }
    return hits + 1;
  }, 0);
}

function countSourceDiversityForCategory(
  timeline: AutoRcaTimelineEvent[],
  keywords: string[]
): number {
  const sources = new Set<AutoRcaTimelineEvent['source']>();

  for (const event of timeline) {
    const normalized = normalizeText(event.message);
    const hasMatch = keywords.some(keyword => normalized.includes(keyword));
    if (hasMatch) {
      sources.add(event.source);
    }
  }

  return sources.size;
}

function computeTimelineCorrelation(
  timeline: AutoRcaTimelineEvent[]
): TimelineCorrelation {
  if (timeline.length === 0) {
    return {
      eventCount: 0,
      maxBurstEventsIn10s: 0,
    };
  }

  let maxBurst = 1;
  let windowStartIndex = 0;

  for (let index = 0; index < timeline.length; index += 1) {
    const currentEvent = timeline[index];
    if (!currentEvent) {
      continue;
    }

    while (windowStartIndex < index) {
      const windowStartEvent = timeline[windowStartIndex];
      if (!windowStartEvent) {
        break;
      }

      if (currentEvent.timestampMs - windowStartEvent.timestampMs <= 10_000) {
        break;
      }

      windowStartIndex += 1;
    }

    const burst = index - windowStartIndex + 1;
    if (burst > maxBurst) {
      maxBurst = burst;
    }
  }

  const firstEvent = timeline[0];
  const lastEvent = timeline[timeline.length - 1];

  return {
    eventCount: timeline.length,
    firstTimestampMs: firstEvent?.timestampMs,
    lastTimestampMs: lastEvent?.timestampMs,
    maxBurstEventsIn10s: maxBurst,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
