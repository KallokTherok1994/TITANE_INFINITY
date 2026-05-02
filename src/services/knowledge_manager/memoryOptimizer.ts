/**
 * Memory Optimizer — context window management, LTM compaction, priority pinning.
 * Ring 3 utility — operates on in-memory data only, no external I/O.
 */

export interface MemoryEntry {
  id: string;
  content: string;
  role?: 'user' | 'assistant' | 'system';
  timestamp?: number;
  importance?: number;
  pinned?: boolean;
}

const CRITICAL_PATTERNS = [
  /kevin|utilisateur|identit[eé]|profil/i,
  /syst[eè]me|config|param[eè]tre/i,
  /s[eé]curit[eé]|urgence|alerte/i,
  /instruction|r[eè]gle|kernel/i,
];

/**
 * Estimates the number of tokens in a string (rough approximation: 1 token ≈ 4 chars).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Marks entries as pinned if they match critical content patterns.
 */
export function pinCriticalMemories(
  entries: MemoryEntry[],
  threshold = 0.5
): MemoryEntry[] {
  return entries.map(entry => {
    const criticalScore =
      CRITICAL_PATTERNS.filter(pattern => pattern.test(entry.content)).length /
      CRITICAL_PATTERNS.length;

    return {
      ...entry,
      pinned: criticalScore >= threshold || (entry.importance ?? 0) >= 0.8,
    };
  });
}

/**
 * Compacts LTM context by removing duplicate/low-importance entries,
 * keeping pinned entries and recent ones up to maxTokens.
 */
export function compactLTMContext(
  entries: MemoryEntry[],
  maxTokens = 4000
): MemoryEntry[] {
  const withPins = pinCriticalMemories(entries);

  // Deduplicate by content similarity (exact match first)
  const seen = new Set<string>();
  const deduped = withPins.filter(entry => {
    const key = entry.content.trim().toLowerCase().slice(0, 100);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Sort: pinned first, then by importance desc, then by timestamp desc
  const sorted = [...deduped].sort((a, b) => {
    if (a.pinned && !b.pinned) {
      return -1;
    }
    if (!a.pinned && b.pinned) {
      return 1;
    }
    const importanceDiff = (b.importance ?? 0) - (a.importance ?? 0);
    if (importanceDiff !== 0) {
      return importanceDiff;
    }
    return (b.timestamp ?? 0) - (a.timestamp ?? 0);
  });

  // Fill up to maxTokens
  let usedTokens = 0;
  const result: MemoryEntry[] = [];
  for (const entry of sorted) {
    const tokens = estimateTokens(entry.content);
    if (usedTokens + tokens <= maxTokens || entry.pinned) {
      result.push(entry);
      usedTokens += tokens;
    }
  }

  return result;
}

/**
 * Returns top-N entries most relevant to a given query.
 */
export function prioritizeForQuery(
  entries: MemoryEntry[],
  query: string,
  limit = 10
): MemoryEntry[] {
  if (!query.trim()) {
    return entries.slice(0, limit);
  }

  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);

  const scored = entries.map(entry => {
    const haystack = entry.content.toLowerCase();
    const matches = queryTerms.filter(term => haystack.includes(term)).length;
    const relevanceScore = queryTerms.length > 0 ? matches / queryTerms.length : 0;
    const combined = relevanceScore * 0.7 + (entry.importance ?? 0) * 0.3;
    return { entry, score: combined };
  });

  return scored
    .sort(
      (a, b) => b.score - a.score || (b.entry.timestamp ?? 0) - (a.entry.timestamp ?? 0)
    )
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/**
 * Optimizes the conversation history window to fit within maxTokens,
 * preserving system messages and recent turns.
 */
export function optimizeContextWindow(
  history: MemoryEntry[],
  maxTokens = 8000
): MemoryEntry[] {
  const systemMessages = history.filter(e => e.role === 'system');
  const conversational = history.filter(e => e.role !== 'system');

  let usedTokens = systemMessages.reduce((acc, e) => acc + estimateTokens(e.content), 0);

  // Keep most recent turns first
  const reversed = [...conversational].reverse();
  const kept: MemoryEntry[] = [];

  for (const entry of reversed) {
    const tokens = estimateTokens(entry.content);
    if (usedTokens + tokens <= maxTokens) {
      kept.unshift(entry);
      usedTokens += tokens;
    }
  }

  return [...systemMessages, ...kept];
}

export interface MemoryHealth {
  totalEntries: number;
  pinnedCount: number;
  estimatedTokens: number;
  staleCount: number;
  healthScore: number;
}

/**
 * Computes a health score (0-100) for the current memory state.
 */
export function computeMemoryHealthScore(
  entries: MemoryEntry[],
  maxExpectedTokens = 16000,
  stalenessThresholdMs = 24 * 60 * 60 * 1000
): MemoryHealth {
  const now = Date.now();
  const pinnedCount = entries.filter(e => e.pinned).length;
  const estimatedTokens = entries.reduce((acc, e) => acc + estimateTokens(e.content), 0);
  const staleCount = entries.filter(
    e => e.timestamp && now - e.timestamp > stalenessThresholdMs
  ).length;

  // Score: full if under token budget, reduced for stale ratio
  const tokenUtilization = Math.min(estimatedTokens / maxExpectedTokens, 1);
  const staleRatio = entries.length > 0 ? staleCount / entries.length : 0;
  const healthScore = Math.round((1 - tokenUtilization * 0.5 - staleRatio * 0.5) * 100);

  return {
    totalEntries: entries.length,
    pinnedCount,
    estimatedTokens,
    staleCount,
    healthScore: Math.max(0, Math.min(100, healthScore)),
  };
}
