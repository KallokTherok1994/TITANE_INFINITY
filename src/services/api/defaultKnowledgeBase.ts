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
 *   so TITANE chat AI can access its 150 built-in knowledge categories.
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

const BUNDLED_DEFAULT_KB_MODULES = import.meta.glob(
  '../../../data/knowledge_base/default/*.json',
  {
    eager: true,
  }
) as Record<string, { default?: Record<string, unknown> } | Record<string, unknown>>;

const RUST_CANONICAL_EXCLUDED_BUNDLED_KB_IDS = new Set([
  'bourse_trading',
  'crypto_blockchain',
  'cuisine_gastronomie',
  'droit_contrats_pratique',
  'energie_renouvelable',
  'jeux_video_culture',
  'kevin_book_registry_v30',
  'kevin_owner_profile_v30',
  'kevin_public_corpus_v30',
  'kevin_workflow_v30',
  'musique_theorie_pratique',
  'voyage_exploration',
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

const KB_STOP_WORDS = new Set([
  'avec',
  'dans',
  'pour',
  'that',
  'this',
  'quoi',
  'avec',
  'sans',
  'mais',
  'donc',
  'comment',
  'explique',
  'titane',
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
    addTokens('kevin', 'creator', 'owner', 'style', 'mission', 'workflow');
    pin(
      'identity_profile',
      'style_expression_kevin',
      'kevin_owner_profile_v30',
      'kevin_workflow_v30'
    );
  }

  if (KB_TWINS_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('twin', 'symbiose', 'fusion', 'sync', 'kevin');
    pin(
      'digital_twin_symbiosis',
      'numeric_twin_detail',
      'kevin_workflow_v30',
      'identity_profile'
    );
  }

  if (KB_BOOK_HINTS.some(hint => normalized.includes(hint))) {
    addTokens('book', 'livre', 'manuscrit', 'chapter', 'auteur', 'kevin');
    pin(
      'kevin_book_registry_v30',
      'style_expression_kevin',
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
      'kevin'
    );
    pin(
      'kevin_public_corpus_v30',
      'kevin_book_registry_v30',
      'style_expression_kevin',
      'kevin_owner_profile_v30'
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
  return [
    ...new Set(
      normalized
        .split(/[^a-z0-9_]+/)
        .filter(token => token.length >= 3 && !KB_STOP_WORDS.has(token))
    ),
  ];
}

function compactExcerpt(value: string, maxLength = 220): string {
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
    .filter(([path]) => !RUST_CANONICAL_EXCLUDED_BUNDLED_KB_IDS.has(extractBundledFallbackId(path)))
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

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

/**
 * List all 150 category keys.
 * Derives from the entries cache when already loaded to avoid a second IPC call.
 */
export async function listCategories(): Promise<string[]> {
  if (_categoriesCache) return _categoriesCache;
  // Re-use loaded entries rather than making a second IPC call
  if (_allEntriesCache) {
    _categoriesCache = _allEntriesCache.map(e => e.category).sort();
    return _categoriesCache;
  }
  try {
    const cats = await invokeWithRetry<string[]>(
      'knowledge_base_list_categories',
      {},
      { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
    );
    _categoriesCache = Array.isArray(cats) ? cats : [];
  } catch {
    const entries = await getAllEntries();
    _categoriesCache = entries.map(e => e.category).sort();
  }
  return _categoriesCache;
}

/**
 * Return all entries as parsed objects.
 * The Rust side returns a JSON string; we parse it here.
 * A module-level Promise guard prevents concurrent IPC calls.
 */
export async function getAllEntries(): Promise<KnowledgeBaseEntry[]> {
  if (_allEntriesCache) return _allEntriesCache;
  // Guard: if a load is already in flight, wait for it instead of issuing a second IPC call
  if (_allEntriesLoadingPromise) return _allEntriesLoadingPromise;
  _allEntriesLoadingPromise = (async () => {
    let shouldUseFallbackEntries = false;

    try {
      const raw = await invokeWithRetry<string>(
        'knowledge_base_get_all',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
      );
      const parsed: Record<string, KnowledgeBaseEntry> =
        typeof raw === 'string'
          ? JSON.parse(raw)
          : (raw as Record<string, KnowledgeBaseEntry>);
      _allEntriesCache = dedupeKnowledgeBaseEntries(Object.values(parsed));
    } catch {
      _allEntriesCache = null;
      shouldUseFallbackEntries = true;
    }

    if (shouldUseFallbackEntries || !_allEntriesCache) {
      _allEntriesCache = getFallbackEntries();
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
  try {
    const raw = await invokeWithRetry<string>(
      'knowledge_base_get_category',
      { category },
      { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
    );
    return typeof raw === 'string'
      ? (JSON.parse(raw) as KnowledgeBaseEntry)
      : (raw as KnowledgeBaseEntry);
  } catch {
    const entries = await getAllEntries();
    return (
      entries.find(entry => entry.category === category || entry.id === category) ?? null
    );
  }
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
 * Reuses the cached entries loaded by `getCompactIndex()` when available.
 */
export async function getRelevantPromptContext(
  query: string,
  limit: number = 3
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

    const ranked = entries
      .map(entry => {
        const categoryText = normalizeText(entry.category);
        const descriptionText = normalizeText(entry.description);
        const contentText = normalizeText(flattenContent(entry.content));
        const isPinned = pinnedCategories.has(entry.category) || pinnedCategories.has(entry.id);

        const score = tokens.reduce((total, token) => {
          let nextScore = total;
          if (categoryText.includes(token)) nextScore += 5;
          if (descriptionText.includes(token)) nextScore += 3;
          if (contentText.includes(token)) nextScore += 1;
          return nextScore;
        }, isPinned ? 9 : 0);

        return {
          entry,
          score,
          excerpt: compactExcerpt(flattenContent(entry.content)),
        };
      })
      .filter(item => item.score > 0)
      .sort(
        (a, b) => b.score - a.score || a.entry.category.localeCompare(b.entry.category)
      )
      .slice(0, Math.max(1, limit));

    if (ranked.length === 0) {
      return '';
    }

    return [
      '📚 Connaissances pertinentes TITANE∞ :',
      ...ranked.map(({ entry, excerpt }) => {
        const excerptBlock = excerpt ? ` | Extrait: ${excerpt}` : '';
        return `• ${entry.category} — ${entry.description}${excerptBlock}`;
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
