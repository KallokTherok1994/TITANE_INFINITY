/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — MEMORY INTEGRATION
 *   Pont entre Chat IA et Memory Core (court/moyen/long terme)
 * ═══════════════════════════════════════════════════════════════════
 */

import { memoryService } from '../api/memory';
import type { StructuredMemoryEntry } from '@/core/prompts';
import { createUnifiedMemory } from '@/services/unified';
import type { UnifiedMemoryType } from '@/services/unified';
import { MemoryTier } from '@/services/mcp/mcp.types';
import type {
  MemoryContext,
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
  TimelineEntry,
} from '../memory/types';
import { createLogger } from '@/utils/logger';
import { isTauriAvailable } from '@/api/tauriClient';
import { tauriClient } from '@/lib/tauriClient';
import type { DurablePreference } from './preferenceEngine';
import { filterPreferences, mergePreferences } from './preferenceEngine';

const logger = createLogger('Memory');
const HYBRID_MEMORY_SHADOW_WRITE_FLAG = 'titane_hybrid_memory_shadow_write_enabled';
const HYBRID_MEMORY_SHADOW_READ_FLAG = 'titane_hybrid_memory_shadow_read_enabled';
const HYBRID_MEMORY_ORCHESTRATION_FLAG = 'titane_hybrid_memory_orchestration_enabled';
const HYBRID_MEMORY_SHADOW_READ_ROLLOUT_CONFIG_KEY =
  'titane_hybrid_memory_shadow_read_rollout';
const HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_KEY =
  'titane_hybrid_memory_shadow_read_preset_history';
const HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_RETENTION_MS =
  7 * 24 * 60 * 60 * 1000;

let unifiedMemoryShadowInstance: Awaited<ReturnType<typeof createUnifiedMemory>> | null =
  null;
let recentNearMatchSnapshots: Array<{
  at: number;
  items: Array<{
    canonicalLabel: string;
    unifiedLabel: string;
    similarity: number;
  }>;
}> = [];

export type HybridShadowReadRolloutMode = 'full' | 'canary';

export interface HybridShadowReadRolloutConfig {
  mode: HybridShadowReadRolloutMode;
  percentage: number;
  trendWindow: number;
}

const DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG: HybridShadowReadRolloutConfig = {
  mode: 'full',
  percentage: 100,
  trendWindow: 12,
};

export interface HybridMemoryDiagnostics {
  shadowWriteEnabled: boolean;
  shadowReadEnabled: boolean;
  hybridOrchestrationEnabled: boolean;
  shadowWriteCount: number;
  shadowReadCount: number;
  lastHybridOrchestrationStatus: 'idle' | 'disabled' | 'ready' | 'error';
  lastHybridOrchestrationCount: number;
  lastHybridOrchestrationPreview: string[];
  lastHybridOrchestrationReason: string;
  shadowReadRolloutMode: HybridShadowReadRolloutMode;
  shadowReadActivePresetId: 'custom' | 'observe' | 'balanced' | 'full';
  shadowReadActivePresetLabel: string;
  shadowReadCanaryEligible: boolean;
  shadowReadCanaryBucket: number | null;
  shadowReadCanaryPercentage: number;
  shadowReadTrendWindow: number;
  shadowReadCanaryReason: string;
  shadowReadCanaryQueryPreview: string | null;
  shadowReadCanaryOperatorHint: string;
  lastShadowWriteAt: number | null;
  lastShadowReadAt: number | null;
  lastShadowReadStatus: 'idle' | 'disabled' | 'ready' | 'error';
  lastShadowReadSampleCount: number;
  lastShadowReadTotalMemories: number;
  lastCanonicalContextCount: number;
  lastShadowReadQualification: 'ready' | 'partial' | 'insufficient';
  lastShadowReadCoverageRatio: number;
  lastShadowReadAverageSimilarity: number;
  lastShadowReadAverageRetrievalScore: number;
  lastShadowReadCompositeScore: number;
  lastShadowReadMatchedCount: number;
  lastShadowReadMissingCount: number;
  lastShadowReadExtraCount: number;
  lastShadowReadCanonicalPreview: string[];
  lastShadowReadUnifiedPreview: string[];
  lastShadowReadMatchedPairs: Array<{
    canonicalLabel: string;
    unifiedLabel: string;
    similarity: number;
  }>;
  lastShadowReadNearMatches: Array<{
    canonicalLabel: string;
    unifiedLabel: string;
    similarity: number;
    gapToThreshold: number;
  }>;
  lastShadowReadNearMatchStability: Array<{
    canonicalLabel: string;
    unifiedLabel: string;
    seenCount: number;
    observationWindow: number;
    averageSimilarity: number;
    stability: 'emergent' | 'recurrent' | 'stable';
  }>;
  lastShadowReadMissingReasons: Array<{
    canonicalLabel: string;
    bestUnifiedLabel: string | null;
    bestSimilarity: number;
    gapToThreshold: number;
    priority: 'critique' | 'proche-seuil' | 'faible';
    reason: string;
  }>;
  recentShadowReadQualifications: Array<{
    at: number;
    qualification: 'ready' | 'partial' | 'insufficient';
    compositeScore: number;
  }>;
  recentShadowReadExtendedTrend: Array<{
    at: number;
    qualification: 'ready' | 'partial' | 'insufficient';
    compositeScore: number;
  }>;
  recentShadowReadPresetChanges: Array<{
    at: number;
    fromPresetLabel: string;
    toPresetLabel: string;
    mode: HybridShadowReadRolloutMode;
    percentage: number;
    trendWindow: number;
    source: 'preset' | 'custom';
  }>;
  lastShadowReadTrendSummary: {
    windowSize: number;
    readyCount: number;
    partialCount: number;
    insufficientCount: number;
    averageCompositeScore: number;
  };
  lastShadowReadMissingLabels: string[];
  lastShadowReadExtraLabels: string[];
  lastShadowReadQuery: string | null;
  lastError: string | null;
}

export interface HybridMemoryGovernedReportExport {
  exportId: string;
  exportPath: string;
  metadataPath: string;
  sha256: string;
  signature: string;
  publicKey: string;
  fingerprint: string;
  publishedAt: string;
  scope: string;
  activePreset: string;
  qualification: string;
}

interface HybridMemoryGovernedReportRequest {
  reportTitle: string;
  reportMarkdown: string;
  activePreset: string;
  shadowReadStatus: string;
  qualification: string;
  query: string | null;
  presetHistory: string[];
  generatedAt: string;
}

interface TauriIpcEnvelope<T> {
  ok: boolean;
  content?: T;
  error?: unknown;
}

interface HybridShadowReadOutcome {
  status: 'ready' | 'disabled' | 'error';
  query: string | null;
  qualification: HybridMemoryDiagnostics['lastShadowReadQualification'];
  supplementalKnowledge: KnowledgeEntry[];
  reason: string;
}

const hybridMemoryDiagnostics: HybridMemoryDiagnostics = {
  shadowWriteEnabled: false,
  shadowReadEnabled: false,
  hybridOrchestrationEnabled: false,
  shadowWriteCount: 0,
  shadowReadCount: 0,
  lastHybridOrchestrationStatus: 'idle',
  lastHybridOrchestrationCount: 0,
  lastHybridOrchestrationPreview: [],
  lastHybridOrchestrationReason: 'orchestration hybride inactive',
  shadowReadRolloutMode: 'full',
  shadowReadActivePresetId: 'full',
  shadowReadActivePresetLabel: 'Full',
  shadowReadCanaryEligible: true,
  shadowReadCanaryBucket: null,
  shadowReadCanaryPercentage: 100,
  shadowReadTrendWindow: 12,
  shadowReadCanaryReason: 'rollout complet actif',
  shadowReadCanaryQueryPreview: null,
  shadowReadCanaryOperatorHint: 'Tous les contextes sont inclus dans le rollout actif.',
  lastShadowWriteAt: null,
  lastShadowReadAt: null,
  lastShadowReadStatus: 'idle',
  lastShadowReadSampleCount: 0,
  lastShadowReadTotalMemories: 0,
  lastCanonicalContextCount: 0,
  lastShadowReadQualification: 'insufficient',
  lastShadowReadCoverageRatio: 0,
  lastShadowReadAverageSimilarity: 0,
  lastShadowReadAverageRetrievalScore: 0,
  lastShadowReadCompositeScore: 0,
  lastShadowReadMatchedCount: 0,
  lastShadowReadMissingCount: 0,
  lastShadowReadExtraCount: 0,
  lastShadowReadCanonicalPreview: [],
  lastShadowReadUnifiedPreview: [],
  lastShadowReadMatchedPairs: [],
  lastShadowReadNearMatches: [],
  lastShadowReadNearMatchStability: [],
  lastShadowReadMissingReasons: [],
  recentShadowReadQualifications: [],
  recentShadowReadExtendedTrend: [],
  recentShadowReadPresetChanges: [],
  lastShadowReadTrendSummary: {
    windowSize: 12,
    readyCount: 0,
    partialCount: 0,
    insufficientCount: 0,
    averageCompositeScore: 0,
  },
  lastShadowReadMissingLabels: [],
  lastShadowReadExtraLabels: [],
  lastShadowReadQuery: null,
  lastError: null,
};

function updateHybridMemoryDiagnostics(
  patch: Partial<HybridMemoryDiagnostics>
): HybridMemoryDiagnostics {
  Object.assign(hybridMemoryDiagnostics, patch);

  if (
    typeof localStorage !== 'undefined' &&
    patch.recentShadowReadPresetChanges !== undefined
  ) {
    localStorage.setItem(
      HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_KEY,
      JSON.stringify(patch.recentShadowReadPresetChanges)
    );
  }

  return { ...hybridMemoryDiagnostics };
}

function appendShadowReadQualificationHistory(
  entry: HybridMemoryDiagnostics['recentShadowReadQualifications'][number]
): HybridMemoryDiagnostics['recentShadowReadQualifications'] {
  return [entry, ...hybridMemoryDiagnostics.recentShadowReadQualifications].slice(0, 5);
}

function appendShadowReadExtendedTrend(
  entry: HybridMemoryDiagnostics['recentShadowReadExtendedTrend'][number],
  limit: number
): HybridMemoryDiagnostics['recentShadowReadExtendedTrend'] {
  return [entry, ...hybridMemoryDiagnostics.recentShadowReadExtendedTrend].slice(0, limit);
}

function appendShadowReadPresetHistory(
  entry: HybridMemoryDiagnostics['recentShadowReadPresetChanges'][number]
): HybridMemoryDiagnostics['recentShadowReadPresetChanges'] {
  return sanitizeShadowReadPresetHistory([
    entry,
    ...hybridMemoryDiagnostics.recentShadowReadPresetChanges,
  ]);
}

function sanitizeShadowReadPresetHistory(
  history: unknown,
  now: number = Date.now()
): HybridMemoryDiagnostics['recentShadowReadPresetChanges'] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (entry): entry is HybridMemoryDiagnostics['recentShadowReadPresetChanges'][number] =>
        Boolean(entry) &&
        typeof entry.at === 'number' &&
        now - entry.at <= HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_RETENTION_MS &&
        typeof entry.fromPresetLabel === 'string' &&
        typeof entry.toPresetLabel === 'string' &&
        (entry.mode === 'full' || entry.mode === 'canary') &&
        typeof entry.percentage === 'number' &&
        typeof entry.trendWindow === 'number' &&
        (entry.source === 'preset' || entry.source === 'custom')
    )
    .slice(0, 5);
}

function getPersistedShadowReadPresetHistory(): HybridMemoryDiagnostics['recentShadowReadPresetChanges'] {
  if (typeof localStorage === 'undefined') {
    return hybridMemoryDiagnostics.recentShadowReadPresetChanges;
  }

  try {
    const raw = localStorage.getItem(HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_KEY);
    if (!raw) {
      return hybridMemoryDiagnostics.recentShadowReadPresetChanges;
    }

    const parsed = JSON.parse(raw);
    const sanitizedHistory = sanitizeShadowReadPresetHistory(parsed);

    if (!Array.isArray(parsed) || sanitizedHistory.length !== parsed.length) {
      localStorage.setItem(
        HYBRID_MEMORY_SHADOW_READ_PRESET_HISTORY_KEY,
        JSON.stringify(sanitizedHistory)
      );
    }

    return sanitizedHistory;
  } catch {
    return hybridMemoryDiagnostics.recentShadowReadPresetChanges;
  }
}

function unwrapTauriEnvelope<T>(result: T | TauriIpcEnvelope<T>): T {
  if (result && typeof result === 'object' && 'ok' in result) {
    const envelope = result as TauriIpcEnvelope<T>;

    if (!envelope.ok) {
      throw new Error(
        typeof envelope.error === 'string'
          ? envelope.error
          : 'Unknown hybrid memory governed IPC error'
      );
    }

    return envelope.content as T;
  }

  return result as T;
}

function isHybridMemoryGovernedReportExport(
  value: unknown
): value is HybridMemoryGovernedReportExport {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as HybridMemoryGovernedReportExport).exportPath === 'string' &&
      typeof (value as HybridMemoryGovernedReportExport).metadataPath === 'string' &&
      typeof (value as HybridMemoryGovernedReportExport).sha256 === 'string'
  );
}

function appendShadowReadNearMatchHistory(entry: {
  at: number;
  items: Array<{
    canonicalLabel: string;
    unifiedLabel: string;
    similarity: number;
  }>;
}, limit: number) {
  recentNearMatchSnapshots = [entry, ...recentNearMatchSnapshots].slice(0, limit);
  return recentNearMatchSnapshots;
}

function getShadowReadRolloutConfig(): HybridShadowReadRolloutConfig {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG;
  }

  try {
    const raw = localStorage.getItem(HYBRID_MEMORY_SHADOW_READ_ROLLOUT_CONFIG_KEY);
    if (!raw) {
      return DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG;
    }

    const parsed = JSON.parse(raw) as Partial<HybridShadowReadRolloutConfig>;
    const mode = parsed.mode === 'canary' ? 'canary' : 'full';
    const percentage = Number.isFinite(parsed.percentage)
      ? Math.min(100, Math.max(0, Math.round(parsed.percentage as number)))
      : DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG.percentage;
    const trendWindow = Number.isFinite(parsed.trendWindow)
      ? Math.min(20, Math.max(5, Math.round(parsed.trendWindow as number)))
      : DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG.trendWindow;

    return { mode, percentage, trendWindow };
  } catch {
    return DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG;
  }
}

function normalizeShadowReadRolloutConfig(
  config: Partial<HybridShadowReadRolloutConfig>
): HybridShadowReadRolloutConfig {
  return {
    mode: config.mode === 'canary' ? 'canary' : 'full',
    percentage: Number.isFinite(config.percentage)
      ? Math.min(100, Math.max(0, Math.round(config.percentage as number)))
      : DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG.percentage,
    trendWindow: Number.isFinite(config.trendWindow)
      ? Math.min(20, Math.max(5, Math.round(config.trendWindow as number)))
      : DEFAULT_HYBRID_SHADOW_READ_ROLLOUT_CONFIG.trendWindow,
  };
}

function resolveShadowReadActivePreset(config: HybridShadowReadRolloutConfig): {
  id: HybridMemoryDiagnostics['shadowReadActivePresetId'];
  label: string;
} {
  if (config.mode === 'canary' && config.percentage === 10 && config.trendWindow === 12) {
    return { id: 'observe', label: 'Observation' };
  }

  if (config.mode === 'canary' && config.percentage === 25 && config.trendWindow === 10) {
    return { id: 'balanced', label: 'Equilibre' };
  }

  if (config.mode === 'full' && config.percentage === 100 && config.trendWindow === 8) {
    return { id: 'full', label: 'Full' };
  }

  return { id: 'custom', label: 'Custom' };
}

function hashShadowReadQuery(query: string): number {
  return Array.from(query).reduce((hash, char) => {
    const next = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return next;
  }, 7) % 100;
}

function resolveShadowReadCanaryDecision(
  query: string,
  config: HybridShadowReadRolloutConfig
): {
  eligible: boolean;
  bucket: number;
  reason: string;
  operatorHint: string;
} {
  if (config.mode === 'full') {
    return {
      eligible: true,
      bucket: hashShadowReadQuery(query),
      reason: 'rollout complet actif',
      operatorHint: 'Tous les contextes passent deja. Utiliser un preset canary uniquement pour reduire le perimetre.',
    };
  }

  const bucket = hashShadowReadQuery(query);
  const eligible = bucket < config.percentage;
  return {
    eligible,
    bucket,
    reason: eligible
      ? `bucket ${bucket} inclus dans la cible < ${config.percentage}`
      : `bucket ${bucket} hors cible >= ${config.percentage}`,
    operatorHint: eligible
      ? 'Le contexte est dans le canari courant. Conserver ce preset pour observation ou passer en Full pour generaliser.'
      : config.percentage === 0
        ? 'Aucun contexte ne passe avec 0%. Utiliser Observation, Equilibre ou Full pour activer des lectures.'
        : config.percentage <= 10
          ? 'Le canari est tres restrictif. Passer a Equilibre ou Full pour elargir la couverture.'
          : config.percentage < 100
            ? 'Augmenter le pourcentage ou passer en Full si ce contexte doit etre inclus immediatement.'
            : 'Le preset courant exclut encore ce bucket; verifier la configuration appliquee.',
  };
}

function summarizeShadowReadTrend(
  history: HybridMemoryDiagnostics['recentShadowReadExtendedTrend'],
  trendWindow: number
): HybridMemoryDiagnostics['lastShadowReadTrendSummary'] {
  const readyCount = history.filter(entry => entry.qualification === 'ready').length;
  const partialCount = history.filter(entry => entry.qualification === 'partial').length;
  const insufficientCount = history.filter(
    entry => entry.qualification === 'insufficient'
  ).length;
  const averageCompositeScore =
    history.length === 0
      ? 0
      : Number(
          (
            history.reduce((sum, entry) => sum + entry.compositeScore, 0) / history.length
          ).toFixed(4)
        );

  return {
    windowSize: trendWindow,
    readyCount,
    partialCount,
    insufficientCount,
    averageCompositeScore,
  };
}

function summarizeNearMatchStability(
  currentNearMatches: HybridMemoryDiagnostics['lastShadowReadNearMatches'],
  history: typeof recentNearMatchSnapshots
): HybridMemoryDiagnostics['lastShadowReadNearMatchStability'] {
  const observationWindow = history.length;

  return currentNearMatches.map(item => {
    const occurrences = history.flatMap(snapshot =>
      snapshot.items.filter(
        candidate =>
          candidate.canonicalLabel === item.canonicalLabel &&
          candidate.unifiedLabel === item.unifiedLabel
      )
    );
    const seenCount = occurrences.length;
    const averageSimilarity =
      occurrences.length === 0
        ? item.similarity
        : occurrences.reduce((sum, occurrence) => sum + occurrence.similarity, 0) /
          occurrences.length;

    return {
      canonicalLabel: item.canonicalLabel,
      unifiedLabel: item.unifiedLabel,
      seenCount,
      observationWindow,
      averageSimilarity: Number(averageSimilarity.toFixed(4)),
      stability:
        seenCount >= 4 ? 'stable' : seenCount >= 2 ? 'recurrent' : 'emergent',
    };
  });
}

function isHybridMemoryShadowWriteEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const raw = localStorage.getItem(HYBRID_MEMORY_SHADOW_WRITE_FLAG);
  return raw === 'true' || raw === '1';
}

function isHybridMemoryShadowReadEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const raw = localStorage.getItem(HYBRID_MEMORY_SHADOW_READ_FLAG);
  return raw === 'true' || raw === '1';
}

function isHybridMemoryOrchestrationEnabled(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const raw = localStorage.getItem(HYBRID_MEMORY_ORCHESTRATION_FLAG);
  return raw === 'true' || raw === '1';
}

async function getShadowUnifiedMemory() {
  if (!unifiedMemoryShadowInstance) {
    unifiedMemoryShadowInstance = await createUnifiedMemory();
  }

  return unifiedMemoryShadowInstance;
}

function mapStructuredEntryToUnifiedMemoryType(entry: StructuredMemoryEntry): UnifiedMemoryType {
  const templateId = entry.templateId.toLowerCase();

  if (templateId.includes('decision')) {
    return 'decision';
  }
  if (templateId.includes('preference')) {
    return 'preference';
  }
  if (templateId.includes('pattern')) {
    return 'pattern';
  }
  if (templateId.includes('milestone')) {
    return 'milestone';
  }
  if (templateId.includes('fact') || templateId.includes('knowledge')) {
    return 'fact';
  }

  return 'context';
}

function deriveStructuredEntrySummary(entry: StructuredMemoryEntry): string {
  const summaryCandidate = [
    entry.data?.title,
    entry.data?.summary,
    entry.data?.label,
    entry.templateId,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return summaryCandidate ?? entry.templateId;
}

function buildShadowReadQuery(context: MemoryContext): string {
  const rawSegments = [
    ...context.activeProjects.map(project => project.title),
    ...context.recentDecisions.map(decision => (decision as any).summary),
    ...context.relevantKnowledge.map(knowledge => knowledge.title),
    ...context.activeRituals.map(ritual => ritual.name),
  ];

  const uniqueSegments = Array.from(
    new Set(
      rawSegments
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map(value => value.trim())
    )
  );

  return uniqueSegments.slice(0, 6).join(' ').trim() || 'memory shadow read';
}

function normalizeDiagnosticLabel(value: string): string {
  return value.trim().toLowerCase();
}

function tokenizeDiagnosticLabel(value: string): Set<string> {
  return new Set(
    normalizeDiagnosticLabel(value)
      .split(/[^\p{L}\p{N}]+/u)
      .filter(token => token.length >= 2)
  );
}

function calculateLabelSimilarity(left: string, right: string): number {
  const leftTokens = tokenizeDiagnosticLabel(left);
  const rightTokens = tokenizeDiagnosticLabel(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const intersectionCount = [...leftTokens].filter(token => rightTokens.has(token)).length;
  const unionCount = new Set([...leftTokens, ...rightTokens]).size;

  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

function collectCanonicalContextLabels(context: MemoryContext): string[] {
  return Array.from(
    new Set(
      [
        ...context.activeProjects.map(project => project.title),
        ...context.recentDecisions.map(decision => (decision as any).summary),
        ...context.relevantKnowledge.map(knowledge => knowledge.title),
        ...context.activeRituals.map(ritual => ritual.name),
        ...context.timeline.map(entry => entry.title),
      ]
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map(value => value.trim())
    )
  );
}

function collectUnifiedMemorySampleLabels(
  sample: Array<{ entry: { summary: string; details?: string; tags?: string[] } }>
): string[] {
  return Array.from(
    new Set(
      sample
        .flatMap(({ entry }) => [entry.summary, entry.details, ...(entry.tags ?? [])])
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map(value => value.trim())
    )
  );
}

function buildHybridSupplementalKnowledge(
  sample: Array<{
    entry: { id?: string; summary: string; details?: string; tags?: string[] };
    score: number;
  }>,
  context: MemoryContext
): KnowledgeEntry[] {
  const existingLabels = new Set(
    collectCanonicalContextLabels(context).map(label => normalizeDiagnosticLabel(label))
  );
  const seenSupplemental = new Set<string>();
  const nowIso = new Date().toISOString();

  return sample
    .map(({ entry, score }, index) => {
      const title = entry.summary.trim();
      return {
        id: `hybrid-supplemental-${entry.id ?? index}-${title.slice(0, 24)}`,
        title,
        category: 'hybrid_orchestrated',
        content: entry.details?.trim() || title,
        relevance: Math.max(0, Math.min(1, Number(score.toFixed(4)))),
        lastAccessed: nowIso,
        tags: ['hybrid-orchestrated', ...(entry.tags ?? [])],
        source: 'UnifiedMemory',
        relatedEntries: [],
      } satisfies KnowledgeEntry;
    })
    .filter(entry => entry.title.length > 0)
    .filter(entry => {
      const normalized = normalizeDiagnosticLabel(entry.title);
      if (existingLabels.has(normalized) || seenSupplemental.has(normalized)) {
        return false;
      }
      seenSupplemental.add(normalized);
      return true;
    })
    .slice(0, 3);
}

function compareCanonicalAndShadowLabels(
  canonicalLabels: string[],
  shadowLabels: string[]
): Pick<
  HybridMemoryDiagnostics,
  | 'lastShadowReadCoverageRatio'
  | 'lastShadowReadAverageSimilarity'
  | 'lastShadowReadMatchedCount'
  | 'lastShadowReadMissingCount'
  | 'lastShadowReadExtraCount'
  | 'lastShadowReadMatchedPairs'
  | 'lastShadowReadNearMatches'
  | 'lastShadowReadMissingReasons'
  | 'lastShadowReadMissingLabels'
  | 'lastShadowReadExtraLabels'
> {
  const similarityThreshold = 0.4;
  const getMissingPriority = (
    shadowLabel: string,
    similarity: number
  ): HybridMemoryDiagnostics['lastShadowReadMissingReasons'][number]['priority'] => {
    if (shadowLabel.length === 0 || similarity <= 0.05) {
      return 'critique';
    }

    if (similarity >= 0.25) {
      return 'proche-seuil';
    }

    return 'faible';
  };
  const scoredMatches = canonicalLabels.map(canonicalLabel => {
    const bestMatch = shadowLabels.reduce(
      (best, shadowLabel) => {
        const similarity = calculateLabelSimilarity(canonicalLabel, shadowLabel);
        return similarity > best.similarity ? { label: shadowLabel, similarity } : best;
      },
      { label: '', similarity: 0 }
    );

    return {
      canonicalLabel,
      shadowLabel: bestMatch.label,
      similarity: bestMatch.similarity,
      matched: bestMatch.similarity >= similarityThreshold,
    };
  });

  const matchedLabels = scoredMatches.filter(match => match.matched);
  const missingLabels = scoredMatches
    .filter(match => !match.matched)
    .map(match => match.canonicalLabel);
  const matchedShadowLabels = new Set(
    matchedLabels
      .map(match => match.shadowLabel)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
  );
  const extraLabels = shadowLabels.filter(shadowLabel => !matchedShadowLabels.has(shadowLabel));
  const averageSimilarity =
    scoredMatches.length === 0
      ? 1
      : scoredMatches.reduce((sum, match) => sum + match.similarity, 0) / scoredMatches.length;
  const matchedPairs = matchedLabels.map(match => ({
    canonicalLabel: match.canonicalLabel,
    unifiedLabel: match.shadowLabel,
    similarity: Number(match.similarity.toFixed(4)),
  }));
  const nearMatches = scoredMatches
    .filter(
      match => !match.matched && match.shadowLabel.length > 0 && match.similarity >= 0.25
    )
    .map(match => ({
      canonicalLabel: match.canonicalLabel,
      unifiedLabel: match.shadowLabel,
      similarity: Number(match.similarity.toFixed(4)),
      gapToThreshold: Number(Math.max(0, similarityThreshold - match.similarity).toFixed(4)),
    }))
    .sort((left, right) => right.similarity - left.similarity);
  const missingReasons = scoredMatches
    .filter(match => !match.matched)
    .map(match => ({
      gapToThreshold: Number(Math.max(0, similarityThreshold - match.similarity).toFixed(4)),
      canonicalLabel: match.canonicalLabel,
      bestUnifiedLabel: match.shadowLabel || null,
      bestSimilarity: Number(match.similarity.toFixed(4)),
      priority: getMissingPriority(match.shadowLabel, match.similarity),
      reason:
        match.shadowLabel.length === 0
          ? 'aucun candidat UnifiedMemory'
          : `similarite inferieure au seuil (${Math.round(match.similarity * 100)}%)`,
    }))
    .sort((left, right) => {
      const priorityRank = { critique: 0, 'proche-seuil': 1, faible: 2 } as const;
      if (priorityRank[left.priority] !== priorityRank[right.priority]) {
        return priorityRank[left.priority] - priorityRank[right.priority];
      }

      return right.bestSimilarity - left.bestSimilarity;
    });

  return {
    lastShadowReadCoverageRatio:
      canonicalLabels.length === 0 ? 1 : matchedLabels.length / canonicalLabels.length,
    lastShadowReadAverageSimilarity: averageSimilarity,
    lastShadowReadMatchedCount: matchedLabels.length,
    lastShadowReadMissingCount: missingLabels.length,
    lastShadowReadExtraCount: extraLabels.length,
    lastShadowReadMatchedPairs: matchedPairs.slice(0, 3),
    lastShadowReadNearMatches: nearMatches.slice(0, 3),
    lastShadowReadMissingReasons: missingReasons.slice(0, 3),
    lastShadowReadMissingLabels: missingLabels.slice(0, 5),
    lastShadowReadExtraLabels: extraLabels.slice(0, 5),
  };
}

function summarizeShadowReadScores(
  sample: Array<{ score: number }>,
  averageSimilarity: number
): Pick<
  HybridMemoryDiagnostics,
  'lastShadowReadAverageRetrievalScore' | 'lastShadowReadCompositeScore'
> {
  const averageRetrievalScore =
    sample.length === 0
      ? 0
      : sample.reduce((sum, item) => sum + item.score, 0) / sample.length;

  const roundedAverageRetrievalScore = Number(averageRetrievalScore.toFixed(4));
  const roundedCompositeScore = Number(
    ((averageSimilarity + roundedAverageRetrievalScore) / 2).toFixed(4)
  );

  return {
    lastShadowReadAverageRetrievalScore: roundedAverageRetrievalScore,
    lastShadowReadCompositeScore: roundedCompositeScore,
  };
}

function qualifyShadowRead(
  coverageRatio: number,
  compositeScore: number
): HybridMemoryDiagnostics['lastShadowReadQualification'] {
  if (coverageRatio >= 0.7 && compositeScore >= 0.75) {
    return 'ready';
  }

  if (coverageRatio >= 0.4 && compositeScore >= 0.45) {
    return 'partial';
  }

  return 'insufficient';
}

// Re-export for compatibility
export type { MemoryContext } from '../memory/types';

/**
 * Contexte enrichi provenant de Memory Core
 */
// export interface MemoryContext {
//   Moved to @/services/memory/types
// }

// Interfaces moved to @/services/memory/types:
// - ProjectSummary
// - DecisionSummary
// - KnowledgeEntry
// - RitualInfo
// - TimelineEntry

/**
 * Configuration du chargement contextuel
 */
export interface MemoryLoadConfig {
  includeProjects?: boolean;
  includeDecisions?: boolean;
  includeKnowledge?: boolean;
  includeRituals?: boolean;
  includeTimeline?: boolean;
  maxProjects?: number;
  maxDecisions?: number;
  maxKnowledge?: number;
  timeWindow?: string; // e.g., "7d", "24h", "30d"
}

/**
 * Service d'intégration avec Memory Core
 */
export class MemoryIntegration {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  async publishGovernedHybridReport(
    reportMarkdown: string
  ): Promise<HybridMemoryGovernedReportExport | null> {
    if (!isTauriAvailable()) {
      return null;
    }

    const diagnostics = this.getHybridMemoryDiagnostics();
    const payload: HybridMemoryGovernedReportRequest = {
      reportTitle: 'TITANE Hybrid Memory Report',
      reportMarkdown,
      activePreset: diagnostics.shadowReadActivePresetLabel,
      shadowReadStatus: diagnostics.shadowReadEnabled
        ? diagnostics.lastShadowReadStatus
        : 'inactive',
      qualification: diagnostics.lastShadowReadQualification,
      query: diagnostics.lastShadowReadQuery,
      presetHistory: diagnostics.recentShadowReadPresetChanges.map(
        entry => `${entry.fromPresetLabel} -> ${entry.toPresetLabel} (${entry.source})`
      ),
      generatedAt: new Date().toISOString(),
    };

    try {
      const result = unwrapTauriEnvelope(
        (await tauriClient.hybridMemoryPublishGovernedReport(payload)) as
          | HybridMemoryGovernedReportExport
          | TauriIpcEnvelope<HybridMemoryGovernedReportExport>
      );

      if (!isHybridMemoryGovernedReportExport(result)) {
        return null;
      }

      return result;
    } catch (error) {
      logger.warn('Governed hybrid memory report export unavailable', error);
      return null;
    }
  }

  /**
   * Charge le contexte depuis Memory Core
   */
  async loadContext(config: MemoryLoadConfig = {}): Promise<MemoryContext> {
    const {
      includeProjects = true,
      includeDecisions = true,
      includeKnowledge = true,
      includeRituals = true,
      includeTimeline = false,
      maxProjects = 5,
      maxDecisions = 10,
      maxKnowledge = 20,
      timeWindow = '7d',
    } = config;

    try {
      const [projects, decisions, knowledge, rituals, timeline] = await Promise.all([
        includeProjects ? this.loadActiveProjects(maxProjects) : Promise.resolve([]),
        includeDecisions
          ? this.loadRecentDecisions(maxDecisions, timeWindow)
          : Promise.resolve([]),
        includeKnowledge ? this.loadRelevantKnowledge(maxKnowledge) : Promise.resolve([]),
        includeRituals ? this.loadActiveRituals() : Promise.resolve([]),
        includeTimeline ? this.loadTimeline(timeWindow) : Promise.resolve([]),
      ]);

      const context = {
        activeProjects: projects,
        recentDecisions: decisions,
        relevantKnowledge: knowledge,
        activeRituals: rituals,
        timeline,
      };

      const shadowReadOutcome = await this.shadowReadContextFromUnifiedMemory(context);
      return this.applyHybridOrchestration(context, shadowReadOutcome);
    } catch (error) {
      logger.error('Failed to load memory context', error);
      updateHybridMemoryDiagnostics({
        shadowWriteEnabled: isHybridMemoryShadowWriteEnabled(),
        shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
        hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
        lastShadowReadStatus: isHybridMemoryShadowReadEnabled() ? 'error' : 'disabled',
        lastHybridOrchestrationStatus: isHybridMemoryOrchestrationEnabled()
          ? 'error'
          : 'disabled',
        lastHybridOrchestrationCount: 0,
        lastHybridOrchestrationPreview: [],
        lastHybridOrchestrationReason: error instanceof Error ? error.message : String(error),
        lastShadowReadQualification: 'insufficient',
        lastShadowReadCoverageRatio: 0,
        lastShadowReadAverageSimilarity: 0,
        lastShadowReadAverageRetrievalScore: 0,
        lastShadowReadCompositeScore: 0,
        lastShadowReadCanonicalPreview: [],
        lastShadowReadUnifiedPreview: [],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [],
        lastError: error instanceof Error ? error.message : String(error),
      });
      return this.getEmptyContext();
    }
  }

  /**
   * Sauvegarde une interaction chat dans Memory Core
   */
  async saveInteraction(data: {
    userMessage: string;
    aiResponse: string;
    mode: string;
    emotionState?: { valence: number; activation: number; dominant_emotion: string };
    context?: Partial<MemoryContext>;
  }): Promise<void> {
    try {
      await memoryService.saveChatInteraction({
        userMessage: data.userMessage,
        aiResponse: data.aiResponse,
        mode: data.mode,
        emotionState: data.emotionState,
        timestamp: new Date().toISOString(),
      });
      await this.shadowWriteInteractionToUnifiedMemory(data);
      this.clearCache();
    } catch (error) {
      logger.error('Failed to save interaction', error);
    }
  }

  /** Sauvegarde une entrée structurée (decision, listening_entry, etc.) */
  async saveStructuredEntry(entry: StructuredMemoryEntry): Promise<void> {
    const normalized: StructuredMemoryEntry = {
      ...entry,
      id: entry.id || this.generateEntryId(),
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    try {
      await memoryService.saveStructuredEntry(normalized);
      await this.shadowWriteStructuredEntryToUnifiedMemory(normalized);
      this.clearCache();
    } catch (error) {
      logger.error('Failed to save structured entry', error);
    }
  }

  /**
   * Charge projets actifs
   */
  private async loadActiveProjects(limit: number): Promise<ProjectSummary[]> {
    const cached = this.getFromCache('active_projects');
    if (cached) return cached as ProjectSummary[];

    try {
      const projects = await memoryService.getActiveProjects(limit);
      this.setCache('active_projects', projects);
      return projects;
    } catch (error) {
      logger.warn('Active projects unavailable', error);
      return [];
    }
  }

  /**
   * Charge décisions récentes
   */
  private async loadRecentDecisions(
    limit: number,
    timeWindow: string
  ): Promise<DecisionSummary[]> {
    const cached = this.getFromCache('recent_decisions');
    if (cached) return cached as DecisionSummary[];

    try {
      const decisions = await memoryService.getRecentDecisions(limit, timeWindow);
      this.setCache('recent_decisions', decisions);
      return decisions;
    } catch (error) {
      logger.warn('Recent decisions unavailable', error);
      return [];
    }
  }

  /**
   * Charge connaissances pertinentes
   */
  private async loadRelevantKnowledge(limit: number): Promise<KnowledgeEntry[]> {
    const cached = this.getFromCache('relevant_knowledge');
    if (cached) return cached as KnowledgeEntry[];

    try {
      const knowledge = await memoryService.getKnowledge(limit);
      this.setCache('relevant_knowledge', knowledge);
      return knowledge;
    } catch (error) {
      logger.warn('Relevant knowledge unavailable', error);
      return [];
    }
  }

  /**
   * Charge rituels actifs
   */
  private async loadActiveRituals(): Promise<RitualInfo[]> {
    const cached = this.getFromCache('active_rituals');
    if (cached) return cached as RitualInfo[];

    try {
      const rituals = await memoryService.getActiveRituals();
      this.setCache('active_rituals', rituals);
      return rituals;
    } catch (error) {
      logger.warn('Active rituals unavailable', error);
      return [];
    }
  }

  /**
   * Charge timeline récente
   */
  private async loadTimeline(timeWindow: string): Promise<TimelineEntry[]> {
    try {
      return await memoryService.getTimeline(timeWindow);
    } catch (error) {
      logger.warn('Timeline unavailable', error);
      return [];
    }
  }

  /**
   * Cache get
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache set
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Contexte vide (fallback)
   */
  private getEmptyContext(): MemoryContext {
    return {
      activeProjects: [],
      recentDecisions: [],
      relevantKnowledge: [],
      activeRituals: [],
      timeline: [],
      hybridSupplementalKnowledge: [],
    };
  }

  // ─────────────────────────────────────────────────────────
  // PREFERENCE STORAGE — In-memory preference persistence
  // ─────────────────────────────────────────────────────────

  private preferences: DurablePreference[] = [];
  private readonly PREFERENCES_KEY = 'titane_user_preferences';

  /**
   * Load preferences from localStorage + merge with in-memory cache
   */
  loadPreferences(): DurablePreference[] {
    if (this.preferences.length > 0) {
      return filterPreferences(this.preferences);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.PREFERENCES_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as DurablePreference[];
          this.preferences = filterPreferences(parsed);
          logger.debug('Preferences loaded from localStorage', {
            count: this.preferences.length,
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to load preferences from localStorage', { error });
      this.preferences = [];
    }

    return filterPreferences(this.preferences);
  }

  /**
   * Save a batch of preferences (merges with existing)
   */
  savePreferences(incoming: DurablePreference[]): void {
    if (incoming.length === 0) return;

    const current = this.loadPreferences();
    const merged = mergePreferences(current, incoming);
    const filtered = filterPreferences(merged);

    // Cap at 100 preferences
    this.preferences = filtered.slice(0, 100);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(this.preferences));
        logger.debug('Preferences saved to localStorage', {
          total: this.preferences.length,
          newIncoming: incoming.length,
        });
      }
    } catch (error) {
      logger.warn('Failed to save preferences to localStorage', { error });
    }
  }

  /**
   * Get preferences relevant to a specific category
   */
  getPreferencesByCategory(category: string): DurablePreference[] {
    return this.loadPreferences().filter(
      p => p.category === category && p.durability >= 0.4
    );
  }

  /**
   * Get the strongest depth preference (if any)
   */
  getDepthPreference(): string | null {
    const depthPrefs = this.getPreferencesByCategory('depth');
    return depthPrefs[0]?.value ?? null;
  }

  /**
   * Get the strongest structure preference (if any)
   */
  getStructurePreference(): string | null {
    const structPrefs = this.getPreferencesByCategory('structure');
    return structPrefs[0]?.value ?? null;
  }

  /**
   * Get the strongest tone preference (if any)
   */
  getTonePreference(): string | null {
    const tonePrefs = this.getPreferencesByCategory('tone');
    return tonePrefs[0]?.value ?? null;
  }

  /**
   * Get action_bias preference (if any)
   */
  getActionBiasPreference(): string | null {
    const actionPrefs = this.getPreferencesByCategory('action_bias');
    return actionPrefs[0]?.value ?? null;
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  private async shadowWriteInteractionToUnifiedMemory(data: {
    userMessage: string;
    aiResponse: string;
    mode: string;
    emotionState?: { valence: number; activation: number; dominant_emotion: string };
  }): Promise<void> {
    if (!isHybridMemoryShadowWriteEnabled()) {
      return;
    }

    try {
      const unifiedMemory = await getShadowUnifiedMemory();
      const sharedTags = ['hybrid-shadow-write', 'conversation', data.mode];

      await Promise.all([
        unifiedMemory.createMemory({
          tier: MemoryTier.MEDIUM_TERM,
          type: 'conversation',
          owner: 'chat-engine',
          summary: data.userMessage.slice(0, 200),
          details: data.userMessage,
          tags: [...sharedTags, 'user'],
          importance: 0.72,
          source: {
            type: 'conversation',
            context: 'memoryIntegration.saveInteraction:user',
          },
        }),
        unifiedMemory.createMemory({
          tier: MemoryTier.MEDIUM_TERM,
          type: 'conversation',
          owner: 'chat-engine',
          summary: data.aiResponse.slice(0, 200),
          details: data.aiResponse,
          tags: [
            ...sharedTags,
            'assistant',
            ...(data.emotionState?.dominant_emotion
              ? [data.emotionState.dominant_emotion]
              : []),
          ],
          importance: 0.64,
          source: {
            type: 'conversation',
            context: 'memoryIntegration.saveInteraction:assistant',
          },
        }),
      ]);

      updateHybridMemoryDiagnostics({
        shadowWriteEnabled: true,
        shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
        shadowWriteCount: hybridMemoryDiagnostics.shadowWriteCount + 2,
        lastShadowWriteAt: Date.now(),
        lastError: null,
      });

      logger.info('UnifiedMemory shadow write stored chat interaction');
    } catch (error) {
      updateHybridMemoryDiagnostics({
        shadowWriteEnabled: true,
        shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
        lastError: error instanceof Error ? error.message : String(error),
      });
      logger.warn('UnifiedMemory shadow write for interaction unavailable', error);
    }
  }

  private async shadowWriteStructuredEntryToUnifiedMemory(
    entry: StructuredMemoryEntry
  ): Promise<void> {
    if (!isHybridMemoryShadowWriteEnabled()) {
      return;
    }

    try {
      const unifiedMemory = await getShadowUnifiedMemory();
      const timestamp = Date.parse(entry.timestamp || new Date().toISOString());

      await unifiedMemory.createMemory({
        tier: entry.target === 'long' ? MemoryTier.LONG_TERM : MemoryTier.MEDIUM_TERM,
        type: mapStructuredEntryToUnifiedMemoryType(entry),
        owner: 'memory-service',
        summary: deriveStructuredEntrySummary(entry).slice(0, 200),
        details: JSON.stringify(entry.data),
        tags: ['hybrid-shadow-write', 'structured-entry', entry.templateId, entry.target],
        importance: entry.target === 'long' ? 0.82 : 0.74,
        source: {
          type: 'manual',
          id: entry.id,
          timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
          context: 'memoryIntegration.saveStructuredEntry',
        },
      });

      updateHybridMemoryDiagnostics({
        shadowWriteEnabled: true,
        shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
        shadowWriteCount: hybridMemoryDiagnostics.shadowWriteCount + 1,
        lastShadowWriteAt: Date.now(),
        lastError: null,
      });

      logger.info('UnifiedMemory shadow write stored structured entry', {
        templateId: entry.templateId,
      });
    } catch (error) {
      updateHybridMemoryDiagnostics({
        shadowWriteEnabled: true,
        shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
        lastError: error instanceof Error ? error.message : String(error),
      });
      logger.warn('UnifiedMemory shadow write for structured entry unavailable', error);
    }
  }

  getHybridMemoryDiagnostics(): HybridMemoryDiagnostics {
    const rolloutConfig = getShadowReadRolloutConfig();
    const activePreset = resolveShadowReadActivePreset(rolloutConfig);
    const persistedPresetHistory = getPersistedShadowReadPresetHistory();

    return {
      ...hybridMemoryDiagnostics,
      shadowWriteEnabled: isHybridMemoryShadowWriteEnabled(),
      shadowReadEnabled: isHybridMemoryShadowReadEnabled(),
      hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
      shadowReadRolloutMode: rolloutConfig.mode,
      shadowReadActivePresetId: activePreset.id,
      shadowReadActivePresetLabel: activePreset.label,
      shadowReadCanaryPercentage: rolloutConfig.percentage,
      shadowReadTrendWindow: rolloutConfig.trendWindow,
      shadowReadCanaryReason:
        rolloutConfig.mode === 'full'
          ? 'rollout complet actif'
          : hybridMemoryDiagnostics.shadowReadCanaryReason,
      shadowReadCanaryOperatorHint:
        rolloutConfig.mode === 'full'
          ? 'Tous les contextes passent deja. Utiliser un preset canary uniquement pour reduire le perimetre.'
          : hybridMemoryDiagnostics.shadowReadCanaryOperatorHint,
      recentShadowReadPresetChanges: persistedPresetHistory,
    };
  }

  getShadowReadRolloutConfig(): HybridShadowReadRolloutConfig {
    return getShadowReadRolloutConfig();
  }

  updateShadowReadRolloutConfig(
    patch: Partial<HybridShadowReadRolloutConfig>
  ): HybridShadowReadRolloutConfig {
    const nextConfig = normalizeShadowReadRolloutConfig({
      ...getShadowReadRolloutConfig(),
      ...patch,
    });
    const previousConfig = getShadowReadRolloutConfig();
    const activePreset = resolveShadowReadActivePreset(nextConfig);
    const previousPreset = resolveShadowReadActivePreset(previousConfig);
    const hasConfigChanged =
      previousConfig.mode !== nextConfig.mode ||
      previousConfig.percentage !== nextConfig.percentage ||
      previousConfig.trendWindow !== nextConfig.trendWindow;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        HYBRID_MEMORY_SHADOW_READ_ROLLOUT_CONFIG_KEY,
        JSON.stringify(nextConfig)
      );
    }

    updateHybridMemoryDiagnostics({
      shadowReadRolloutMode: nextConfig.mode,
      shadowReadActivePresetId: activePreset.id,
      shadowReadActivePresetLabel: activePreset.label,
      shadowReadCanaryPercentage: nextConfig.percentage,
      shadowReadTrendWindow: nextConfig.trendWindow,
      shadowReadCanaryOperatorHint:
        nextConfig.mode === 'full'
          ? 'Tous les contextes passent deja. Utiliser un preset canary uniquement pour reduire le perimetre.'
          : hybridMemoryDiagnostics.shadowReadCanaryOperatorHint,
      recentShadowReadPresetChanges: hasConfigChanged
        ? appendShadowReadPresetHistory({
            at: Date.now(),
            fromPresetLabel: previousPreset.label,
            toPresetLabel: activePreset.label,
            mode: nextConfig.mode,
            percentage: nextConfig.percentage,
            trendWindow: nextConfig.trendWindow,
            source: activePreset.id === 'custom' ? 'custom' : 'preset',
          })
        : hybridMemoryDiagnostics.recentShadowReadPresetChanges,
      lastShadowReadTrendSummary: summarizeShadowReadTrend(
        hybridMemoryDiagnostics.recentShadowReadExtendedTrend,
        nextConfig.trendWindow
      ),
    });

    return nextConfig;
  }

  private async shadowReadContextFromUnifiedMemory(
    context: MemoryContext
  ): Promise<HybridShadowReadOutcome> {
    const shadowReadEnabled = isHybridMemoryShadowReadEnabled();
    const shadowWriteEnabled = isHybridMemoryShadowWriteEnabled();
    const rolloutConfig = getShadowReadRolloutConfig();
    const activePreset = resolveShadowReadActivePreset(rolloutConfig);

    if (!shadowReadEnabled) {
      updateHybridMemoryDiagnostics({
        shadowWriteEnabled,
        shadowReadEnabled,
        hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
        shadowReadRolloutMode: rolloutConfig.mode,
        shadowReadActivePresetId: activePreset.id,
        shadowReadActivePresetLabel: activePreset.label,
        shadowReadCanaryEligible: false,
        shadowReadCanaryBucket: null,
        shadowReadCanaryPercentage: rolloutConfig.percentage,
        shadowReadTrendWindow: rolloutConfig.trendWindow,
        shadowReadCanaryReason: 'shadow read desactive',
        shadowReadCanaryQueryPreview: null,
        shadowReadCanaryOperatorHint: 'Activer le shadow read pour evaluer le preset courant sur cette surface.',
        lastShadowReadStatus: 'disabled',
        lastShadowReadQualification: 'insufficient',
        lastShadowReadAverageSimilarity: 0,
        lastShadowReadAverageRetrievalScore: 0,
        lastShadowReadCompositeScore: 0,
        lastShadowReadCanonicalPreview: [],
        lastShadowReadUnifiedPreview: [],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [],
        lastShadowReadTrendSummary: summarizeShadowReadTrend(
          hybridMemoryDiagnostics.recentShadowReadExtendedTrend,
          rolloutConfig.trendWindow
        ),
        lastShadowReadQuery: null,
      });
      return {
        status: 'disabled',
        query: null,
        qualification: 'insufficient',
        supplementalKnowledge: [],
        reason: 'shadow read desactive',
      };
    }

    const canonicalContextCount =
      context.activeProjects.length +
      context.recentDecisions.length +
      context.relevantKnowledge.length +
      context.activeRituals.length +
      context.timeline.length;

    const query = buildShadowReadQuery(context);
    const canonicalLabels = collectCanonicalContextLabels(context);
    const canaryDecision = resolveShadowReadCanaryDecision(query, rolloutConfig);

    if (rolloutConfig.mode === 'canary' && !canaryDecision.eligible) {
      updateHybridMemoryDiagnostics({
        shadowWriteEnabled,
        shadowReadEnabled,
        hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
        shadowReadRolloutMode: rolloutConfig.mode,
        shadowReadActivePresetId: activePreset.id,
        shadowReadActivePresetLabel: activePreset.label,
        shadowReadCanaryEligible: false,
        shadowReadCanaryBucket: canaryDecision.bucket,
        shadowReadCanaryPercentage: rolloutConfig.percentage,
        shadowReadTrendWindow: rolloutConfig.trendWindow,
        shadowReadCanaryReason: canaryDecision.reason,
        shadowReadCanaryQueryPreview: query,
        shadowReadCanaryOperatorHint: canaryDecision.operatorHint,
        lastShadowReadStatus: 'disabled',
        lastCanonicalContextCount: canonicalContextCount,
        lastShadowReadQualification: 'insufficient',
        lastShadowReadCoverageRatio: 0,
        lastShadowReadAverageSimilarity: 0,
        lastShadowReadAverageRetrievalScore: 0,
        lastShadowReadCompositeScore: 0,
        lastShadowReadMatchedCount: 0,
        lastShadowReadMissingCount: 0,
        lastShadowReadExtraCount: 0,
        lastShadowReadCanonicalPreview: canonicalLabels.slice(0, 3),
        lastShadowReadUnifiedPreview: [],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: [],
        lastShadowReadTrendSummary: summarizeShadowReadTrend(
          hybridMemoryDiagnostics.recentShadowReadExtendedTrend,
          rolloutConfig.trendWindow
        ),
        lastShadowReadMissingLabels: [],
        lastShadowReadExtraLabels: [],
        lastShadowReadQuery: query,
        lastError: null,
      });
      return {
        status: 'disabled',
        query,
        qualification: 'insufficient',
        supplementalKnowledge: [],
        reason: canaryDecision.reason,
      };
    }

    try {
      const unifiedMemory = await getShadowUnifiedMemory();
      const [stats, sample] = await Promise.all([
        unifiedMemory.getStats(),
        unifiedMemory.retrieveMemories({
          text: query,
          limit: 5,
          tiers: [MemoryTier.MEDIUM_TERM, MemoryTier.LONG_TERM],
        }),
      ]);

      const shadowLabels = collectUnifiedMemorySampleLabels(sample);
      const comparison = compareCanonicalAndShadowLabels(canonicalLabels, shadowLabels);
      const scoreSummary = summarizeShadowReadScores(
        sample,
        comparison.lastShadowReadAverageSimilarity
      );
      const currentTrendEntry = {
        at: Date.now(),
        qualification: qualifyShadowRead(
          comparison.lastShadowReadCoverageRatio,
          scoreSummary.lastShadowReadCompositeScore
        ),
        compositeScore: scoreSummary.lastShadowReadCompositeScore,
      };
      const extendedTrend = appendShadowReadExtendedTrend(
        currentTrendEntry,
        rolloutConfig.trendWindow
      );
      const nearMatchHistory = appendShadowReadNearMatchHistory({
        at: currentTrendEntry.at,
        items: comparison.lastShadowReadNearMatches.map(item => ({
          canonicalLabel: item.canonicalLabel,
          unifiedLabel: item.unifiedLabel,
          similarity: item.similarity,
        })),
      }, rolloutConfig.trendWindow);
      const nearMatchStability = summarizeNearMatchStability(
        comparison.lastShadowReadNearMatches,
        nearMatchHistory
      );
      const qualification = currentTrendEntry.qualification;
      const supplementalKnowledge = buildHybridSupplementalKnowledge(sample, context);

      updateHybridMemoryDiagnostics({
        shadowWriteEnabled,
        shadowReadEnabled,
        hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
        shadowReadRolloutMode: rolloutConfig.mode,
        shadowReadActivePresetId: activePreset.id,
        shadowReadActivePresetLabel: activePreset.label,
        shadowReadCanaryEligible: canaryDecision.eligible,
        shadowReadCanaryBucket: canaryDecision.bucket,
        shadowReadCanaryPercentage: rolloutConfig.percentage,
        shadowReadTrendWindow: rolloutConfig.trendWindow,
        shadowReadCanaryReason: canaryDecision.reason,
        shadowReadCanaryQueryPreview: query,
        shadowReadCanaryOperatorHint: canaryDecision.operatorHint,
        shadowReadCount: hybridMemoryDiagnostics.shadowReadCount + 1,
        lastShadowReadAt: currentTrendEntry.at,
        lastShadowReadStatus: 'ready',
        lastShadowReadSampleCount: sample.length,
        lastShadowReadTotalMemories: stats.total,
        lastCanonicalContextCount: canonicalContextCount,
        lastShadowReadQualification: qualification,
        lastShadowReadQuery: query,
        ...comparison,
        ...scoreSummary,
        lastShadowReadNearMatchStability: nearMatchStability,
        lastShadowReadCanonicalPreview: canonicalLabels.slice(0, 3),
        lastShadowReadUnifiedPreview: shadowLabels.slice(0, 3),
        recentShadowReadQualifications: appendShadowReadQualificationHistory({
          at: currentTrendEntry.at,
          qualification,
          compositeScore: scoreSummary.lastShadowReadCompositeScore,
        }),
        recentShadowReadExtendedTrend: extendedTrend,
        lastShadowReadTrendSummary: summarizeShadowReadTrend(
          extendedTrend,
          rolloutConfig.trendWindow
        ),
        lastError: null,
      });
      return {
        status: 'ready',
        query,
        qualification,
        supplementalKnowledge,
        reason:
          supplementalKnowledge.length > 0
            ? `${supplementalKnowledge.length} supplement(s) hybride(s) distinct(s) disponible(s)`
            : 'aucun supplement hybride distinct disponible',
      };
    } catch (error) {
      const errorTrend = appendShadowReadExtendedTrend(
        {
          at: Date.now(),
          qualification: 'insufficient',
          compositeScore: 0,
        },
        rolloutConfig.trendWindow
      );

      updateHybridMemoryDiagnostics({
        shadowWriteEnabled,
        shadowReadEnabled,
        hybridOrchestrationEnabled: isHybridMemoryOrchestrationEnabled(),
        shadowReadRolloutMode: rolloutConfig.mode,
        shadowReadActivePresetId: activePreset.id,
        shadowReadActivePresetLabel: activePreset.label,
        shadowReadCanaryEligible: canaryDecision.eligible,
        shadowReadCanaryBucket: canaryDecision.bucket,
        shadowReadCanaryPercentage: rolloutConfig.percentage,
        shadowReadTrendWindow: rolloutConfig.trendWindow,
        shadowReadCanaryReason: canaryDecision.reason,
        shadowReadCanaryQueryPreview: query,
        shadowReadCanaryOperatorHint: canaryDecision.operatorHint,
        shadowReadCount: hybridMemoryDiagnostics.shadowReadCount + 1,
        lastShadowReadAt: Date.now(),
        lastShadowReadStatus: 'error',
        lastCanonicalContextCount: canonicalContextCount,
        lastShadowReadQualification: 'insufficient',
        lastShadowReadCoverageRatio: 0,
        lastShadowReadAverageSimilarity: 0,
        lastShadowReadAverageRetrievalScore: 0,
        lastShadowReadCompositeScore: 0,
        lastShadowReadMatchedCount: 0,
        lastShadowReadMissingCount: canonicalLabels.length,
        lastShadowReadExtraCount: 0,
        lastShadowReadCanonicalPreview: canonicalLabels.slice(0, 3),
        lastShadowReadUnifiedPreview: [],
        lastShadowReadMatchedPairs: [],
        lastShadowReadNearMatches: [],
        lastShadowReadNearMatchStability: [],
        lastShadowReadMissingReasons: canonicalLabels.slice(0, 3).map(canonicalLabel => ({
          canonicalLabel,
          bestUnifiedLabel: null,
          bestSimilarity: 0,
          gapToThreshold: 0.4,
          priority: 'critique',
          reason: 'lecture UnifiedMemory indisponible',
        })),
        recentShadowReadQualifications: appendShadowReadQualificationHistory({
          at: Date.now(),
          qualification: 'insufficient',
          compositeScore: 0,
        }),
        recentShadowReadExtendedTrend: errorTrend,
        lastShadowReadTrendSummary: summarizeShadowReadTrend(
          errorTrend,
          rolloutConfig.trendWindow
        ),
        lastShadowReadMissingLabels: canonicalLabels.slice(0, 5),
        lastShadowReadExtraLabels: [],
        lastShadowReadQuery: query,
        lastError: error instanceof Error ? error.message : String(error),
      });
      logger.warn('UnifiedMemory shadow read unavailable', error);
      return {
        status: 'error',
        query,
        qualification: 'insufficient',
        supplementalKnowledge: [],
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private applyHybridOrchestration(
    context: MemoryContext,
    shadowReadOutcome: HybridShadowReadOutcome
  ): MemoryContext {
    const orchestrationEnabled = isHybridMemoryOrchestrationEnabled();

    if (!orchestrationEnabled) {
      updateHybridMemoryDiagnostics({
        hybridOrchestrationEnabled: false,
        lastHybridOrchestrationStatus: 'disabled',
        lastHybridOrchestrationCount: 0,
        lastHybridOrchestrationPreview: [],
        lastHybridOrchestrationReason: 'orchestration hybride desactivee',
      });
      return {
        ...context,
        hybridSupplementalKnowledge: [],
      };
    }

    if (shadowReadOutcome.status !== 'ready') {
      updateHybridMemoryDiagnostics({
        hybridOrchestrationEnabled: true,
        lastHybridOrchestrationStatus:
          shadowReadOutcome.status === 'error' ? 'error' : 'disabled',
        lastHybridOrchestrationCount: 0,
        lastHybridOrchestrationPreview: [],
        lastHybridOrchestrationReason: shadowReadOutcome.reason,
      });
      return {
        ...context,
        hybridSupplementalKnowledge: [],
      };
    }

    if (shadowReadOutcome.qualification === 'insufficient') {
      updateHybridMemoryDiagnostics({
        hybridOrchestrationEnabled: true,
        lastHybridOrchestrationStatus: 'disabled',
        lastHybridOrchestrationCount: 0,
        lastHybridOrchestrationPreview: [],
        lastHybridOrchestrationReason:
          'qualification shadow read insuffisante pour une orchestration additive',
      });
      return {
        ...context,
        hybridSupplementalKnowledge: [],
      };
    }

    const supplementalKnowledge = shadowReadOutcome.supplementalKnowledge.slice(0, 2);

    updateHybridMemoryDiagnostics({
      hybridOrchestrationEnabled: true,
      lastHybridOrchestrationStatus: 'ready',
      lastHybridOrchestrationCount: supplementalKnowledge.length,
      lastHybridOrchestrationPreview: supplementalKnowledge.map(entry => entry.title),
      lastHybridOrchestrationReason:
        supplementalKnowledge.length > 0
          ? 'supplements hybrides additifs injectes dans le contexte prompt'
          : 'aucun supplement distinct a injecter dans le contexte prompt',
    });

    return {
      ...context,
      hybridSupplementalKnowledge: supplementalKnowledge,
    };
  }

  private generateEntryId(): string {
    const globalCrypto =
      typeof globalThis !== 'undefined'
        ? (globalThis.crypto as Crypto | undefined)
        : undefined;
    if (globalCrypto?.randomUUID) {
      return globalCrypto.randomUUID();
    }
    return `mem_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  }
}

// Singleton
export const memoryIntegration = new MemoryIntegration();

export default memoryIntegration;
