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
 *   so TITANE chat AI can access its 92 built-in knowledge categories.
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

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

/**
 * List all 92 category keys.
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
    _categoriesCache = [];
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
    try {
      const raw = await invokeWithRetry<string>(
        'knowledge_base_get_all',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'DefaultKB' }
      );
      const parsed: Record<string, KnowledgeBaseEntry> =
        typeof raw === 'string' ? JSON.parse(raw) : (raw as Record<string, KnowledgeBaseEntry>);
      _allEntriesCache = Object.values(parsed);
      // Populate categories cache from entries to avoid a second IPC call later
      if (!_categoriesCache) {
        _categoriesCache = _allEntriesCache.map(e => e.category).sort();
      }
    } catch {
      _allEntriesCache = [];
    }
    return _allEntriesCache!;
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
    return typeof raw === 'string' ? (JSON.parse(raw) as KnowledgeBaseEntry) : (raw as KnowledgeBaseEntry);
  } catch {
    return null;
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
      .map(e => `• ${e.category}: ${e.description.substring(0, 80)}${e.description.length > 80 ? '…' : ''}`)
      .join('\n');
    _compactIndexCache = lines;
  } catch {
    _compactIndexCache = '';
  }
  return _compactIndexCache;
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
