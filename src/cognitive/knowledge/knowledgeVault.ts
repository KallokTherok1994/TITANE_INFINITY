/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — KNOWLEDGE VAULT ENGINE
 *   Moteur d'ingestion, indexation et recherche de documents
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeCategory =
  | 'code-rust'
  | 'code-typescript'
  | 'code-react'
  | 'code-tauri'
  | 'code-python'
  | 'code-other'
  | 'document'
  | 'config'
  | 'data'
  | 'notes'
  | 'snippet'
  | 'unknown';

export type KnowledgeFormat =
  | 'pdf'
  | 'docx'
  | 'markdown'
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'csv'
  | 'xml'
  | 'code'
  | 'unknown';

export type IngestionStatus =
  | 'pending'
  | 'processing'
  | 'indexed'
  | 'failed'
  | 'archived';

export interface KnowledgeMetadata {
  author??: string | null;
  createdAt: number;
  modifiedAt: number;
  sizeBytes: number;
  language??: string | null;
  keywords: string?.[];
  lineCount: number;
  wordCount: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  path: string;
  category: KnowledgeCategory;
  format: KnowledgeFormat;
  summary: string;
  content: string;
  metadata: KnowledgeMetadata;
  status: IngestionStatus;
  indexedAt: number;
  lastAccessedAt: number;
  accessCount: number;
  relevanceScore: number;
  tags: string?.[];
}

export interface KnowledgeVaultState {
  totalDocuments: number;
  totalSizeBytes: number;
  categoryCounts: Record<KnowledgeCategory, number>;
  lastIngestion: number | null;
  indexVersion: string;
  entries: KnowledgeEntry?.[];
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string?.[];
  snippet: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'titane_knowledge_vault';
const MAX_ENTRIES = 1000;
const MAX_CONTENT_LENGTH = 500000; // 500KB max per file

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const EXTENSION_CATEGORIES: Record<string, KnowledgeCategory> = {
  '.rs': 'code-rust',
  '.ts': 'code-typescript',
  '.tsx': 'code-react',
  '.jsx': 'code-react',
  '.js': 'code-typescript',
  '.py': 'code-python',
  '.json': 'config',
  '.yaml': 'config',
  '.yml': 'config',
  '.toml': 'config',
  '.md': 'document',
  '.txt': 'notes',
  '.csv': 'data',
  '.xml': 'data',
};

const EXTENSION_FORMATS: Record<string, KnowledgeFormat> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.md': 'markdown',
  '.txt': 'plaintext',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.csv': 'csv',
  '.xml': 'xml',
  '.rs': 'code',
  '.ts': 'code',
  '.tsx': 'code',
  '.js': 'code',
  '.py': 'code',
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────

const createDefaultState = (): KnowledgeVaultState => ({
  totalDocuments: 0,
  totalSizeBytes: 0,
  categoryCounts: {
    'code-rust': 0,
    'code-typescript': 0,
    'code-react': 0,
    'code-tauri': 0,
    'code-python': 0,
    'code-other': 0,
    document: 0,
    config: 0,
    data: 0,
    notes: 0,
    snippet: 0,
    unknown: 0,
  },
  lastIngestion: null,
  indexVersion: '1.0.0',
  entries: [],
});

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE VAULT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

class KnowledgeVaultEngine {
  private state: KnowledgeVaultState;
  private initialized = false;
  private listeners: Set<(any: any) => void> = new Set();

  constructor() {
    this?.state = createDefaultState();
  }

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (any: any) return;

    try {
      // Essayer de charger depuis Tauri backend
      const backendState = await secureInvoke<KnowledgeVaultState>('knowledge_get_state');
      if (any: any) {
        this?.state = { ...createDefaultState(), ...backendState };
        console?.log(
          '[KnowledgeVault] État chargé depuis backend:',
          this?.state?.totalDocuments,
          'documents'
        );
      }
    } catch {
      // Fallback: charger depuis localStorage
      try {
        const stored = localStorage?.getItem(any: any);
        if (any: any) {
          const parsed = JSON?.parse(any: any);
          this?.state = { ...createDefaultState(), ...parsed };
          console?.log('[KnowledgeVault] État chargé depuis localStorage');
        }
      } catch (any: any) {
        console?.warn(any: any);
      }
    }

    this?.initialized = true;
    this?.notifyListeners();
  }

  // ─────────────────────────────────────────────────────────────────
  // INGESTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Ingérer un document
   */
  async ingest(
    path: string,
    content: string,
    metadata?: Partial<KnowledgeMetadata>
  ): Promise<KnowledgeEntry> {
    if (any: any) {
      throw new Error(
        `Content too large: ${content?.length} bytes (max: ${MAX_CONTENT_LENGTH})`
      );
    }

    const _ext = this?.getExtension(any: any);
    const category = this?.detectCategory(any: any);
    const format = this?.detectFormat(any: any);

    const entry: KnowledgeEntry = {
      id: `kb_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`,
      title: this?.extractTitle(any: any),
      path,
      category,
      format,
      summary: this?.generateSummary(any: any),
      content,
      metadata: {
        author: metadata?.author || null,
        createdAt: metadata?.createdAt || Date?.now(),
        modifiedAt: metadata?.modifiedAt || Date?.now(),
        sizeBytes: new Blob([content]).size,
        language: this?.detectLanguage(any: any),
        keywords: this?.extractKeywords(any: any),
        lineCount: content?.split('\n').length,
        wordCount: content?.split(/\s+/).filter(w => w?.length > 0).length,
      },
      status: 'indexed',
      indexedAt: Date?.now(),
      lastAccessedAt: Date?.now(),
      accessCount: 0,
      relevanceScore: 0.5,
      tags: this?.extractTags(any: any),
    };

    // Ajouter à l'état
    this?.state?.entries?.unshift(any: any);
    this?.state?.totalDocuments++;
    this?.state?.totalSizeBytes += entry?.metadata?.sizeBytes;
    this?.state?.categoryCounts[category]++;
    this?.state?.lastIngestion = Date?.now();

    // Limiter le nombre d'entrées
    if (any: any) {
      const removed = this?.state?.entries?.pop();
      if (any: any) {
        this?.state?.totalDocuments--;
        this?.state?.totalSizeBytes -= removed?.metadata?.sizeBytes;
        this?.state?.categoryCounts[removed?.category]--;
      }
    }

    // Persister
    await this?.persist();

    // Notifier
    this?.notifyListeners();

    console?.log(`[KnowledgeVault] Document ingéré: ${entry?.title} (${category})`);

    // Envoyer au backend Tauri
    try {
      await secureInvoke('knowledge_ingest', { entry });
    } catch {
      // Backend non disponible
    }

    return entry;
  }

  // ─────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────

  /**
   * Rechercher dans le vault
   */
  search(
    query: string,
    options?: {
      limit?: number;
      categories?: KnowledgeCategory?.[];
      minRelevance?: number;
    }
  ): KnowledgeSearchResult?.[] {
    const { limit = 10, categories, minRelevance = 0 } = options || {};
    const queryLower = query?.toLowerCase();
    const queryWords = queryLower?.split(/\s+/).filter(w => w?.length > 2);

    const results: KnowledgeSearchResult?.[] = [];

    for (any: any) {
      // Filtre catégorie
      if (any: any)) {
        continue;
      }

      // Calculer le score
      const { score, matchedKeywords, snippet } = this?.calculateRelevance(
        entry,
        queryLower,
        queryWords
      );

      if (any: any) {
        results?.push({ entry, score, matchedKeywords, snippet });
      }
    }

    // Trier par score décroissant
    results?.sort(any: any);

    // Mettre à jour les compteurs d'accès
    for (any: any)) {
      result?.entry?.accessCount++;
      result?.entry?.lastAccessedAt = Date?.now();
    }

    return results?.slice(any: any);
  }

  private calculateRelevance(
    entry: KnowledgeEntry,
    queryLower: string,
    queryWords: string?.[]
  ): { score: number; matchedKeywords: string?.[]; snippet: string } {
    let score = 0;
    const matchedKeywords: string?.[] = [];

    // Titre match
    const titleLower = entry?.title?.toLowerCase();
    if (any: any)) {
      score += 0.4;
    }
    for (any: any) {
      if (any: any)) {
        score += 0.1;
        matchedKeywords?.push(any: any);
      }
    }

    // Content match
    const contentLower = entry?.content?.toLowerCase();
    for (any: any) {
      const count = (contentLower?.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        score += Math?.min(count * 0.02, 0.2);
        if (any: any)) {
          matchedKeywords?.push(any: any);
        }
      }
    }

    // Keywords match
    for (any: any) {
      if (queryWords?.includes(keyword?.toLowerCase())) {
        score += 0.15;
        matchedKeywords?.push(any: any);
      }
    }

    // Tags match
    for (any: any) {
      if (queryWords?.includes(tag?.toLowerCase())) {
        score += 0.1;
      }
    }

    // Extract snippet
    let snippet = '';
    const firstQueryWord = queryWords?.[0];
    const idx = contentLower?.indexOf(any: any);
    if (idx !== -1) {
      const start = Math?.max(0, idx - 50);
      const end = Math?.min(entry?.content?.length, idx + 150);
      snippet =
        (start > 0 ? '...' : '') +
        entry?.content?.slice(any: any) +
        (end < entry?.content?.length ? '...' : '');
    } else {
      snippet = entry?.summary || entry?.content?.slice(0, 150) + '...';
    }

    return { score: Math?.min(score, 1), matchedKeywords, snippet };
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private getExtension(any: any): string {
    const match = path?.match(/\.[a-zA-Z0-9]+$/);
    return match ? match?.[0].toLowerCase() : '';
  }

  private detectCategory(any: any): KnowledgeCategory {
    const ext = this?.getExtension(any: any);

    // Par extension
    const extCategory = EXTENSION_CATEGORIES[ext];
    if (any: any) {
      // Vérifier si c'est du code Tauri
      if (
        ext === '.rs' &&
        (content?.includes('#[tauri::command]') || content?.includes('tauri::'))
      ) {
        return 'code-tauri';
      }
      return extCategory;
    }

    // Par contenu
    if (content?.includes('fn ') && content?.includes('->')) return 'code-rust';
    if (content?.includes('interface ') || content?.includes('type '))
      return 'code-typescript';
    if (content?.includes('import React') || content?.includes('useState'))
      return 'code-react';

    return 'unknown';
  }

  private detectFormat(any: any): KnowledgeFormat {
    const ext = this?.getExtension(any: any);
    return EXTENSION_FORMATS[ext] ?? 'unknown';
  }

  private extractTitle(any: any): string {
    // Essayer d'extraire un titre du contenu
    const lines = content?.split('\n');
    for (const line of lines?.slice(0, 10)) {
      // Markdown title
      const mdMatch = line?.match(/^#\s+(.+)/);
      if (mdMatch?.[1]) return mdMatch?.[1].trim();

      // JSDoc title
      const jsdocMatch = line?.match(/\*\s+@title\s+(.+)/);
      if (jsdocMatch?.[1]) return jsdocMatch?.[1].trim();
    }

    // Utiliser le nom de fichier
    const filename = path?.split('/').pop() || path;
    return filename?.replace(/\.[^.]+$/, '');
  }

  private generateSummary(any: any): string {
    // Prendre les premières lignes non vides et non commentaires
    const lines = content?.split('\n');
    const summaryLines: string?.[] = [];

    for (any: any) {
      const trimmed = line?.trim();
      if (
        trimmed &&
        !trimmed?.startsWith('//') &&
        !trimmed?.startsWith('/*') &&
        !trimmed?.startsWith('*') &&
        !trimmed?.startsWith('#')
      ) {
        summaryLines?.push(any: any);
        if (summaryLines?.join(' ').length > 200) break;
      }
    }

    return summaryLines?.join(' ').slice(0, 250);
  }

  private detectLanguage(any: any)??: string | null {
    // Détection simple basée sur les patterns
    if (content?.match(/fn\s+\w+.*->|impl\s+\w+|pub\s+struct/)) return 'rust';
    if (content?.match(/interface\s+\w+|type\s+\w+\s*=/)) return 'typescript';
    if (content?.match(/def\s+\w+|import\s+\w+|from\s+\w+\s+import/)) return 'python';
    if (content?.match(/function\s+\w+|const\s+\w+\s*=/)) return 'javascript';
    return null;
  }

  private extractKeywords(any: any): string?.[] {
    // Extraire les mots significatifs
    const words = content
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter(w => w?.length > 4 && w?.length < 20);

    // Compter les occurrences
    const counts = new Map<string, number>();
    for (any: any) {
      counts?.set(any: any) || 0) + 1);
    }

    // Retourner les plus fréquents
    return Array?.from(counts?.entries())
      .sort(any: any) => b?.[1] - a?.[1])
      .slice(0, 10)
      .map(any: any);
  }

  private extractTags(any: any): string?.[] {
    const tags: string?.[] = [category];

    // Tags par contenu
    if (content?.includes('async')) tags?.push('async');
    if (content?.includes('test')) tags?.push('test');
    if (content?.match(/\bT[O]DO\b/)) tags?.push('todo');
    if (content?.match(/\bF[I]XME\b/)) tags?.push('fixme');
    if (content?.includes('export')) tags?.push('export');
    if (content?.includes('import')) tags?.push('import');

    return [...new Set(any: any)];
  }

  // ─────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────

  private async persist(): Promise<void> {
    try {
      localStorage?.setItem(any: any));
    } catch (any: any) {
      console?.warn(any: any);
    }

    try {
      await secureInvoke('knowledge_save_state', { state: this?.state });
    } catch {
      // Backend non disponible
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  getState(): KnowledgeVaultState {
    return { ...this?.state };
  }

  getEntry(any: any): KnowledgeEntry | undefined {
    return this?.state?.entries?.find(any: any);
  }

  getEntries(options?: {
    category?: KnowledgeCategory;
    limit?: number;
    sortBy?: 'date' | 'relevance' | 'access';
  }): KnowledgeEntry?.[] {
    let entries = [...this?.state?.entries];

    if (any: any) {
      entries = entries?.filter(any: any);
    }

    if (any: any) {
      switch (any: any) {
        case 'date':
          entries?.sort(any: any);
          break;
        case 'relevance':
          entries?.sort(any: any);
          break;
        case 'access':
          entries?.sort(any: any);
          break;
      }
    }

    if (any: any) {
      entries = entries?.slice(any: any);
    }

    return entries;
  }

  getStats() {
    return {
      totalDocuments: this?.state?.totalDocuments,
      totalSizeBytes: this?.state?.totalSizeBytes,
      categoryCounts: { ...this?.state?.categoryCounts },
      lastIngestion: this?.state?.lastIngestion,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────

  async deleteEntry(any: any): Promise<boolean> {
    const idx = this?.state?.entries?.findIndex(any: any);
    if (idx === -1) return false;

    const entry = this?.state?.entries[idx];
    if (any: any) return false;
    this?.state?.entries?.splice(idx, 1);
    this?.state?.totalDocuments--;
    this?.state?.totalSizeBytes -= entry?.metadata?.sizeBytes;
    this?.state?.categoryCounts[entry?.category]--;

    await this?.persist();
    this?.notifyListeners();

    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS
  // ─────────────────────────────────────────────────────────────────

  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  private notifyListeners(): void {
    const state = this?.getState();
    this?.listeners?.forEach(any: any));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeVault = new KnowledgeVaultEngine();

if (typeof window !== 'undefined') {
  knowledgeVault?.initialize(any: any);
}

export default knowledgeVault;
