/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — DEFAULT KNOWLEDGE BASE SERVICE (FRONTEND)
 *   Wraps the 4 IPC commands exposed by knowledge_base_default.rs
 *   so TITANE chat AI can access its built-in knowledge categories.
 *
 *   Commands bridged:
 *     knowledge_base_get_all       → getAllEntries()
 *     knowledge_base_get_category  → getCategory(name)
 *     knowledge_base_list_categories → listCategories()
 *     knowledge_base_validate      → validate()
 *
 *   getCompactIndex() builds a single string suitable for injection
 *   into a system prompt (category name + description, one line each).
 * ═══════════════════════════════════════════════════════════════════
 */

import { invokeWithRetry, FAST_COMMAND_OPTIONS } from '../../lib/serviceInvoker';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';

// ─────────────────────────────────────────────────────────────────
// Types (mirror of Rust KnowledgeBaseEntry)
// ─────────────────────────────────────────────────────────────────

export interface KnowledgeBaseEntry {
  id: string;
  category: string;
  version: string;
  description: string;
  content: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────
// In-process singleton cache (reset on page reload only)
// ─────────────────────────────────────────────────────────────────

let _categoriesCache: string[] | null = null;
let _allEntriesCache: KnowledgeBaseEntry[] | null = null;
let _allEntriesLoadingPromise: Promise<KnowledgeBaseEntry[]> | null = null;
let _compactIndexCache: string | null = null;

type RuntimeKnowledgeBaseSnapshot = {
  ok?: boolean;
  content?: {
    entries?: Record<string, KnowledgeBaseEntry>;
    source?: string;
    sourcePath?: string | null;
    fallbackUsed?: boolean;
    entryCount?: number;
    errors?: string[];
  };
  error?: string | null;
};

const BUNDLED_DEFAULT_KB_MODULES = import.meta.glob(
  '../../../data/knowledge_base/default/*.json',
  {
    eager: true,
  }
) as Record<string, { default?: Record<string, unknown> } | Record<string, unknown>>;

const RUST_CANONICAL_EXCLUDED_BUNDLED_KB_IDS = new Set([
  // Kevin-specific personal files — not embedded in the Rust binary
  'kevin_book_registry_v30',
  'kevin_owner_profile_v30',
  'kevin_public_corpus_v30',
  'kevin_workflow_v30',
]);

const DEFAULT_KB_FALLBACK_ENTRIES: KnowledgeBaseEntry[] = [
  {
    id: 'system_architecture',
    category: 'system_architecture',
    version: 'v30.0.0',
    description: 'Architecture cœur TITANE∞ avec 4 rings et gouvernance One Door.',
    content: {
      architecture: {
        rings: 4,
        gateway: 'One Door network governance',
      },
    },
  },
  {
    id: 'memory_system_deep',
    category: 'memory_system_deep',
    version: 'v30.0.0',
    description: 'Architecture mémoire session / intermédiaire / long terme.',
    content: {
      layers: ['session', 'intermediate', 'long_term'],
      guarantee: 'Mémoire visible sans réseau',
    },
  },
  {
    id: 'identity_profile',
    category: 'identity_profile',
    version: 'v30.0.0',
    description: 'Identité système persistante et cohérente de TITANE∞.',
    content: {
      profile: 'Identité persistante TITANE∞',
    },
  },
  {
    id: 'response_guidelines',
    category: 'response_guidelines',
    version: 'v30.0.0',
    description: 'Règles de réponse et garde-fous conversationnels.',
    content: {
      mode: 'Réponses fiables, concises et gouvernées',
    },
  },
  {
    id: 'security_privacy',
    category: 'security_privacy',
    version: 'v30.0.0',
    description: 'Règles de sécurité, confidentialité et intégrité système.',
    content: {
      focus: ['privacy', 'integrity', 'zero silent failure'],
    },
  },
];

// Stop words for query tokenization — filtered out to improve relevance scoring
// Organized by language: French first, then English
const KB_STOP_WORDS = new Set([
  // French stop words
  'avec',
  'aussi',
  'avoir',
  'dans',
  'des',
  'dit',
  'donc',
  'est',
  'etre',
  'explique',
  'fais',
  'fait',
  'les',
  'mais',
  'moi',
  'nous',
  'par',
  'pas',
  'plus',
  'pour',
  'que',
  'qui',
  'quoi',
  'sans',
  'son',
  'sur',
  'titane',
  'toi',
  'tous',
  'tout',
  'une',
  'vous',
  'comment',
  // English stop words
  'about',
  'and',
  'been',
  'can',
  'from',
  'have',
  'how',
  'just',
  'like',
  'that',
  'the',
  'this',
  'very',
  'what',
  'when',
  'will',
]);

const KB_CREATOR_HINTS = [
  'kevin',
  'createur',
  'creator',
  'fondateur',
  'utilisateur principal',
  'primary user',
  'owner',
];

const KB_TWINS_HINTS = [
  'twin',
  'twins',
  'symbiose',
  'symbiosis',
  'jumeau',
  'numeric twin',
  'fusion',
];

const KB_BOOK_HINTS = [
  'livre',
  'book',
  'manuscrit',
  'manuscript',
  'eclaircit',
  'eclairc',
  'chapitre',
  'roman',
  'portfolio',
  'livres audio',
  'audiobook',
  'diplome',
  'diplômes',
  'facebook',
  'humain total',
  'humain à tout faire',
  'kallok',
  'discerner',
  'rain',
  'deuxième vitesse',
  'deuxieme vitesse',
  'œuvre vivance',
  'oeuvre vivance',
];

const KB_CORPUS_HINTS = [
  'codex vivant',
  'sanctuaire interieur',
  'retour au vivant',
  'rituel de presence',
  'presence',
  'authenticite',
  'mode survie',
  'burn out',
  'burn-out',
  'questionnement profond',
  'module 0',
  'module 1',
  'module 2',
  'module 3',
  'module 4',
  'module 5',
  'module 6',
  'cercle du feu humain',
  'maitre de son feu',
  'priere d ancrage',
];

const KB_RUNTIME_HINTS = [
  'etat reel',
  'state detection',
  'golden rule',
  'regle d or',
  'charge mentale',
  'surcharge',
  'fatigue verbale',
  'derive',
  'drift',
  'protocole',
  'priorites runtime',
  'recentrage',
];

const KB_POSITIONING_HINTS = [
  'positionnement',
  'positioning',
  'promesse',
  'tagline',
  'signature publique',
  'bio',
  'biographie',
  'clarte express',
  'offre',
  'audience',
  'public cible',
  'message principal',
];

const KB_DEVOPS_HINTS = [
  'cicd',
  'ci/cd',
  'pipeline',
  'deploy',
  'deploiement',
  'docker',
  'container',
  'kubernetes',
  'github actions',
  'workflow',
  'infrastructure',
  'monitoring',
  'build',
  'release',
];

const KB_SECURITY_HINTS = [
  'securite',
  'security',
  'vulnerability',
  'vulnerabilite',
  'owasp',
  'injection',
  'xss',
  'csrf',
  'authentification',
  'authentication',
  'authorization',
  'encryption',
  'chiffrement',
  'firewall',
  'pentest',
  'audit securite',
];

const KB_ARCHITECTURE_HINTS = [
  'architecture',
  'design pattern',
  'microservice',
  'monolith',
  'solid',
  'clean architecture',
  'hexagonal',
  'event driven',
  'cqrs',
  'domain driven',
  'scalabilite',
  'scalability',
  'refactoring',
  'separation of concerns',
];

const KB_DATA_HINTS = [
  'database',
  'base de donnees',
  'sql',
  'sqlite',
  'postgresql',
  'mongodb',
  'indexation',
  'requete',
  'query',
  'migration',
  'schema',
  'orm',
  'data model',
  'nosql',
  'redis',
  'cache',
];

const KB_TESTING_HINTS = [
  'test',
  'testing',
  'unit test',
  'test unitaire',
  'integration test',
  'test integration',
  'e2e',
  'end to end',
  'vitest',
  'jest',
  'coverage',
  'couverture',
  'tdd',
  'bdd',
  'mock',
  'assertion',
];

const KB_PERFORMANCE_HINTS = [
  'performance',
  'optimisation',
  'optimization',
  'latence',
  'latency',
  'throughput',
  'debit',
  'profiling',
  'benchmark',
  'memory leak',
  'fuite memoire',
  'bundle size',
  'lazy load',
  'cache',
  'bottleneck',
  'goulot',
];

function expandQueryContext(query: string): {
  tokens: string[];
  pinnedCategories: Set<string>;
} {
  const normalized = normalizeText(query);
  const tokens = new Set(tokenizeQuery(query));
  const pinnedCategories = new Set<string>();

  const addTokens = (...values: string[]) => {
    for (const value of values) {
      tokens.add(normalizeText(value));
    }
  };

  const pin = (...categories: string[]) => {
    for (const category of categories) {
      pinnedCategories.add(category);
    }
  };

  if (KB_CREATOR_HINTS.some(hint => normalized.includes(hint))) {
    addTokens(
      'kevin',
      'creator',
      'owner',
      'style',
      'mission',
      'workflow',
      'titane',
      'coherence',
      'axe'
    );
    pin(
      'identity_profile',
      'style_expression_kevin',
      'titane_identity_kernel_v31',
      'kevin_owner_profile_v30',
      'kevin_workflow_v30'
    );
  }

  if (KB_TWINS_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('twin', 'symbiose', 'fusion', 'sync', 'kevin', 'titane', 'coherence');
    pin(
      'digital_twin_symbiosis',
      'numeric_twin_detail',
      'titane_identity_kernel_v31',
      'kevin_workflow_v30',
      'identity_profile'
    );
  }

  if (KB_BOOK_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('book', 'livre', 'manuscrit', 'chapter', 'auteur', 'kevin');
    pin(
      'kevin_book_registry_v30',
      'style_expression_kevin',
      'titane_identity_kernel_v31',
      'kevin_owner_profile_v30'
    );
  }

  if (KB_CORPUS_HINTS.some(hint => normalized.includes(hint))) {
    addTokens(
      'codex',
      'vivant',
      'presence',
      'authenticite',
      'rituel',
      'module',
      'humain',
      'total',
      'kevin',
      'coherence',
      'axe',
      'deuxieme',
      'vitesse',
      'titane'
    );
    pin(
      'kevin_public_corpus_v30',
      'kevin_book_registry_v30',
      'style_expression_kevin',
      'titane_identity_kernel_v31',
      'kevin_owner_profile_v30'
    );
  }

  if (KB_RUNTIME_HINTS.some(hint => normalized.includes(hint))) {
    addTokens(
      'runtime',
      'doctrine',
      'state',
      'overloaded',
      'fragmented',
      'tired',
      'energized',
      'charge',
      'axe',
      'protocole',
      'drift'
    );
    pin(
      'titane_runtime_rules_v31',
      'titane_identity_kernel_v31',
      'kevin_workflow_v30',
      'identity_profile'
    );
  }

  if (KB_POSITIONING_HINTS.some(hint => normalized.includes(hint))) {
    addTokens(
      'positionnement',
      'signature',
      'promesse',
      'clarte',
      'express',
      'offre',
      'audience',
      'noyau',
      'message'
    );
    pin(
      'titane_public_positioning_v31',
      'kevin_owner_profile_v30',
      'titane_identity_kernel_v31',
      'identity_profile'
    );
  }

  if (KB_DEVOPS_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('devops', 'pipeline', 'deploy', 'cicd', 'container', 'infrastructure');
    pin('devops_cicd_infrastructure', 'operational_knowledge', 'system_architecture');
  }

  if (KB_SECURITY_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('security', 'securite', 'vulnerability', 'protection', 'audit');
    pin('cybersecurite_avancee', 'security_privacy', 'system_architecture');
  }

  if (KB_ARCHITECTURE_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('architecture', 'pattern', 'design', 'structure', 'module', 'scalability');
    pin('architecture_logicielle_patterns', 'system_architecture', 'services_backend');
  }

  if (KB_DATA_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('database', 'data', 'query', 'schema', 'index', 'persistence');
    pin('data_engineering_databases', 'memory_system_deep', 'services_backend');
  }

  if (KB_TESTING_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('test', 'testing', 'coverage', 'assertion', 'validation', 'quality');
    pin('testing_quality_assurance', 'troubleshooting_faq', 'operational_knowledge');
  }

  if (KB_PERFORMANCE_HINTS.some(hint => normalized.includes(hint))) {
    addTokens(
      'performance',
      'optimization',
      'latency',
      'throughput',
      'profiling',
      'cache'
    );
    pin(
      'performance_optimization_avancee',
      'troubleshooting_faq',
      'operational_knowledge'
    );
  }

  return {
    tokens: Array.from(tokens),
    pinnedCategories,
  };
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function flattenContent(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(item => flattenContent(item)).join(' ');
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(item => flattenContent(item))
      .join(' ');
  }
  return '';
}

function tokenizeQuery(query: string): string[] {
  const normalized = normalizeText(query);
  const singleTokens = normalized
    .split(/[^a-z0-9_]+/)
    .filter(token => token.length >= 3 && !KB_STOP_WORDS.has(token));

  // Generate bigrams for compound concept matching (e.g., "machine learning", "self healing")
  // Limited to first 15 tokens to avoid excessive bigram generation on very long queries
  const bigramSource = singleTokens.slice(0, 15);
  const bigrams: string[] = [];
  for (let i = 0; i < bigramSource.length - 1; i++) {
    bigrams.push(`${bigramSource[i]}_${bigramSource[i + 1]}`);
  }

  return [...new Set([...singleTokens, ...bigrams])];
}

// 320-char excerpt provides richer context for LLM prompt injection while staying under ~80 tokens
function compactExcerpt(value: string, maxLength = 320): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}…`
    : normalized;
}

function dedupeKnowledgeBaseEntries(entries: KnowledgeBaseEntry[]): KnowledgeBaseEntry[] {
  const byCategory = new Map<string, KnowledgeBaseEntry>();

  for (const entry of entries) {
    const key = normalizeText(entry.category || entry.id);
    if (!key) continue;
    if (!byCategory.has(key)) {
      byCategory.set(key, entry);
    }
  }

  return Array.from(byCategory.values()).sort((a, b) =>
    a.category.localeCompare(b.category)
  );
}

function extractBundledFallbackId(path: string): string {
  return (
    path
      .split('/')
      .pop()
      ?.replace(/\.json$/i, '') || 'unknown'
  );
}

function buildKnowledgeEntryFromBundledJson(
  path: string,
  rawModule: { default?: Record<string, unknown> } | Record<string, unknown>
): KnowledgeBaseEntry | null {
  const rawValue =
    rawModule && typeof rawModule === 'object' && 'default' in rawModule
      ? rawModule.default
      : rawModule;

  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return null;
  }

  const normalizedValue = rawValue as Record<string, unknown>;
  const fallbackId = extractBundledFallbackId(path);

  return {
    id:
      typeof normalizedValue.id === 'string' && normalizedValue.id.trim().length > 0
        ? normalizedValue.id
        : fallbackId,
    category:
      typeof normalizedValue.category === 'string' &&
      normalizedValue.category.trim().length > 0
        ? normalizedValue.category
        : fallbackId,
    version:
      typeof normalizedValue.version === 'string' &&
      normalizedValue.version.trim().length > 0
        ? normalizedValue.version
        : 'v30.0.0',
    description:
      typeof normalizedValue.description === 'string'
        ? normalizedValue.description
        : fallbackId,
    content: JSON.parse(JSON.stringify(normalizedValue)),
  };
}

function getFallbackEntries(): KnowledgeBaseEntry[] {
  const bundledEntries = Object.entries(BUNDLED_DEFAULT_KB_MODULES)
    .filter(
      ([path]) =>
        !RUST_CANONICAL_EXCLUDED_BUNDLED_KB_IDS.has(extractBundledFallbackId(path))
    )
    .map(([path, rawModule]) => buildKnowledgeEntryFromBundledJson(path, rawModule))
    .filter((entry): entry is KnowledgeBaseEntry => entry !== null);

  if (bundledEntries.length > 0) {
    return dedupeKnowledgeBaseEntries(bundledEntries);
  }

  return DEFAULT_KB_FALLBACK_ENTRIES.map(entry => ({
    ...entry,
    content: JSON.parse(JSON.stringify(entry.content)),
  }));
}

export const DEFAULT_KB_CANONICAL_ENTRY_COUNT = getFallbackEntries().length;

function parseKnowledgeBaseEntries(raw: unknown): KnowledgeBaseEntry[] | null {
  if (typeof raw === 'string') {
    try {
      return parseKnowledgeBaseEntries(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const runtimePayload = raw as RuntimeKnowledgeBaseSnapshot;
  const runtimeEntries = runtimePayload?.content?.entries;
  if (
    runtimeEntries &&
    typeof runtimeEntries === 'object' &&
    !Array.isArray(runtimeEntries)
  ) {
    return dedupeKnowledgeBaseEntries(Object.values(runtimeEntries));
  }

  return dedupeKnowledgeBaseEntries(
    Object.values(raw as Record<string, KnowledgeBaseEntry>)
  );
}

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

/**
 * List all category keys.
 * Derives from the entries cache when already loaded to avoid a second IPC call.
 */
export async function listCategories(): Promise<string[]> {
  if (_categoriesCache) return _categoriesCache;
  const entries = await getAllEntries();
  _categoriesCache = entries.map(e => e.category).sort();
  return _categoriesCache;
}

/**
 * Return all entries as parsed objects.
 * The Rust side returns a JSON string; we parse it here.
 * A module-level Promise guard prevents concurrent IPC calls.
 */
export async function getAllEntries(): Promise<KnowledgeBaseEntry[]> {
  if (_allEntriesCache) return _allEntriesCache;
  if (!isTauriRuntimeAvailable()) {
    _allEntriesCache = getFallbackEntries();
    if (!_categoriesCache) {
      _categoriesCache = _allEntriesCache.map(e => e.category).sort();
    }
    return _allEntriesCache;
  }
  // Guard: if a load is already in flight, wait for it instead of issuing a second IPC call
  if (_allEntriesLoadingPromise) return _allEntriesLoadingPromise;
  _allEntriesLoadingPromise = (async (): Promise<KnowledgeBaseEntry[]> => {
    let ipcSucceeded = false;
    try {
      const raw = await invokeWithRetry<unknown>(
        'knowledge_base_runtime_snapshot',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
      );
      const parsed = parseKnowledgeBaseEntries(raw);
      if (parsed) {
        _allEntriesCache = parsed;
        ipcSucceeded = true;
      }
    } catch {
      _allEntriesCache = null;
    }

    if (!ipcSucceeded) {
      try {
        const raw = await invokeWithRetry<unknown>(
          'knowledge_base_get_all',
          {},
          { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
        );
        const parsed = parseKnowledgeBaseEntries(raw);
        if (parsed) {
          _allEntriesCache = parsed;
          ipcSucceeded = true;
        }
      } catch {
        _allEntriesCache = null;
      }
    }

    // Only use local fallback when IPC failed (not when backend explicitly returned empty)
    if (!ipcSucceeded && (!_allEntriesCache || _allEntriesCache.length === 0)) {
      _allEntriesCache = getFallbackEntries();
    }

    // Ensure we always return a non-null array
    if (!_allEntriesCache) {
      _allEntriesCache = [];
    }

    if (!_categoriesCache) {
      _categoriesCache = _allEntriesCache.map(e => e.category).sort();
    }

    return _allEntriesCache;
  })();
  return _allEntriesLoadingPromise;
}

/**
 * Return a single knowledge entry by category key.
 * The Rust side returns a JSON string; we parse it here.
 */
export async function getCategory(category: string): Promise<KnowledgeBaseEntry | null> {
  const entries = await getAllEntries();
  return (
    entries.find(entry => entry.category === category || entry.id === category) ?? null
  );
}

/**
 * Validate integrity of the entire knowledge base (Rust-side check).
 */
export async function validate(): Promise<boolean> {
  try {
    const ok = await invokeWithRetry<boolean>(
      'knowledge_base_validate',
      {},
      { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
    );
    return ok === true;
  } catch {
    return false;
  }
}

/**
 * Build a compact index string for system-prompt injection.
 *
 * Format (one entry per line):
 *   • <category>: <description up to 80 chars>
 *
 * 80-char limit keeps the total under ~2500 tokens while still providing
 * meaningful descriptions. Cached after the first call (session-scoped).
 */
export async function getCompactIndex(): Promise<string> {
  if (_compactIndexCache) return _compactIndexCache;
  try {
    const entries = await getAllEntries();
    if (entries.length === 0) {
      _compactIndexCache = '';
      return '';
    }
    const lines = entries
      .sort((a, b) => a.category.localeCompare(b.category))
      .map(
        e =>
          `• ${e.category}: ${e.description.substring(0, 120)}${e.description.length > 120 ? '…' : ''}`
      )
      .join('\n');
    _compactIndexCache = `[LANGUE: Réponds TOUJOURS en français]\n${lines}`;
  } catch {
    _compactIndexCache = '';
  }
  return _compactIndexCache;
}

/**
 * Build a compact, query-relevant knowledge block for prompt injection.
 *
 * Enhanced v30.2.0: Multi-factor scoring with:
 *  - Category match boost (×7) for exact domain alignment
 *  - Description relevance (×4) for summary-level matching
 *  - Content depth match (×1) for deep content hits
 *  - Bigram compound matching (×3 bonus) for multi-word concepts
 *  - Token density normalization to avoid long-content bias
 *  - Pinned category boost (+12) for context-aware pinning
 *  - Diversity penalty to avoid returning redundant entries
 *
 * Default limit raised from 3→5 for richer context injection.
 */
export async function getRelevantPromptContext(
  query: string,
  limit: number = 5
): Promise<string> {
  const { tokens, pinnedCategories } = expandQueryContext(query);
  if (tokens.length === 0) {
    return '';
  }

  try {
    const entries = await getAllEntries();
    if (entries.length === 0) {
      return '';
    }

    // Separate single tokens from bigrams for differential scoring
    const singleTokens = tokens.filter(t => !t.includes('_'));
    const bigramTokens = tokens.filter(t => t.includes('_'));

    const ranked = entries
      .map(entry => {
        const categoryText = normalizeText(entry.category);
        const descriptionText = normalizeText(entry.description);
        const contentText = normalizeText(flattenContent(entry.content));
        const isPinned =
          pinnedCategories.has(entry.category) || pinnedCategories.has(entry.id);

        let score = isPinned ? 12 : 0;
        let matchedTokenCount = 0;

        // Single token scoring with graduated weights
        for (const token of singleTokens) {
          const catMatch = categoryText.includes(token);
          const descMatch = descriptionText.includes(token);
          const contentMatch = contentText.includes(token);

          if (catMatch) score += 7;
          if (descMatch) score += 4;
          if (contentMatch) score += 1;
          if (catMatch || descMatch || contentMatch) matchedTokenCount++;
        }

        // Bigram scoring — compound concepts get higher weight
        for (const bigram of bigramTokens) {
          const parts = bigram.split('_');
          const bigramJoined = parts.join(' ');
          const bigramUnderscore = bigram;

          // Check if both parts appear close together in content
          const catBigram =
            categoryText.includes(bigramJoined) ||
            categoryText.includes(bigramUnderscore);
          const descBigram =
            descriptionText.includes(bigramJoined) ||
            descriptionText.includes(bigramUnderscore);
          const contentBigram =
            contentText.includes(bigramJoined) || contentText.includes(bigramUnderscore);

          if (catBigram) score += 10;
          if (descBigram) score += 6;
          if (contentBigram) score += 3;
        }

        // Token coverage bonus: reward entries that match more unique tokens
        if (singleTokens.length > 0) {
          const coverageRatio = matchedTokenCount / singleTokens.length;
          score *= 1 + coverageRatio * 0.3; // Up to +30% boost for full coverage
        }

        return {
          entry,
          score: Math.round(score * 100) / 100,
          excerpt: compactExcerpt(flattenContent(entry.content)),
        };
      })
      .filter(item => item.score > 0)
      .sort(
        (a, b) => b.score - a.score || a.entry.category.localeCompare(b.entry.category)
      );

    // Diversity filter: avoid returning too many entries from the same domain prefix
    const selected: typeof ranked = [];
    const prefixCounts = new Map<string, number>();
    for (const item of ranked) {
      if (selected.length >= Math.max(1, limit)) break;
      const prefix = item.entry.category.split('_').slice(0, 2).join('_');
      const count = prefixCounts.get(prefix) || 0;
      // Allow max 2 entries from the same domain prefix
      if (count < 2) {
        selected.push(item);
        prefixCounts.set(prefix, count + 1);
      }
    }

    if (selected.length === 0) {
      return '';
    }

    return [
      '📚 Connaissances pertinentes TITANE∞ :',
      ...selected.map(({ entry, score, excerpt }) => {
        const relevance =
          score >= 20 ? '🔴' : score >= 10 ? '🟠' : score >= 5 ? '🟡' : '⚪';
        const excerptBlock = excerpt ? ` | Extrait: ${excerpt}` : '';
        return `${relevance} ${entry.category} — ${entry.description}${excerptBlock}`;
      }),
    ].join('\n');
  } catch {
    return '';
  }
}

/**
 * Reset all caches (useful for tests or hot-reload scenarios).
 */
export function resetCache(): void {
  _categoriesCache = null;
  _allEntriesCache = null;
  _allEntriesLoadingPromise = null;
  _compactIndexCache = null;
}
