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
  author: string | null;
  createdAt: number;
  modifiedAt: number;
  sizeBytes: number;
  language: string | null;
  keywords: string[];
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
  tags: string[];
}

export interface KnowledgeVaultState {
  totalDocuments: number;
  totalSizeBytes: number;
  categoryCounts: Record<KnowledgeCategory, number>;
  lastIngestion: number | null;
  indexVersion: string;
  entries: KnowledgeEntry[];
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  matchedKeywords: string[];
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
    'document': 0,
    'config': 0,
    'data': 0,
    'notes': 0,
    'snippet': 0,
    'unknown': 0,
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
  private listeners: Set<(state: KnowledgeVaultState) => void> = new Set();

  constructor() {
    this.state = createDefaultState();
  }

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Essayer de charger depuis Tauri backend
      const backendState = await secureInvoke<KnowledgeVaultState>('knowledge_get_state');
      if (backendState) {
        this.state = { ...createDefaultState(), ...backendState };
        console.log('[KnowledgeVault] État chargé depuis backend:', this.state.totalDocuments, 'documents');
      }
    } catch {
      // Fallback: charger depuis localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.state = { ...createDefaultState(), ...parsed };
          console.log('[KnowledgeVault] État chargé depuis localStorage');
        }
      } catch (e) {
        console.warn('[KnowledgeVault] Erreur chargement localStorage:', e);
      }
    }

    this.initialized = true;
    this.notifyListeners();
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
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Content too large: ${content.length} bytes (max: ${MAX_CONTENT_LENGTH})`);
    }

    const _ext = this.getExtension(path);
    const category = this.detectCategory(path, content);
    const format = this.detectFormat(path);

    const entry: KnowledgeEntry = {
      id: `kb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      title: this.extractTitle(path, content),
      path,
      category,
      format,
      summary: this.generateSummary(content),
      content,
      metadata: {
        author: metadata?.author || null,
        createdAt: metadata?.createdAt || Date.now(),
        modifiedAt: metadata?.modifiedAt || Date.now(),
        sizeBytes: new Blob([content]).size,
        language: this.detectLanguage(content),
        keywords: this.extractKeywords(content),
        lineCount: content.split('\n').length,
        wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
      },
      status: 'indexed',
      indexedAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
      relevanceScore: 0.5,
      tags: this.extractTags(content, category),
    };

    // Ajouter à l'état
    this.state.entries.unshift(entry);
    this.state.totalDocuments++;
    this.state.totalSizeBytes += entry.metadata.sizeBytes;
    this.state.categoryCounts[category]++;
    this.state.lastIngestion = Date.now();

    // Limiter le nombre d'entrées
    if (this.state.entries.length > MAX_ENTRIES) {
      const removed = this.state.entries.pop();
      if (removed) {
        this.state.totalDocuments--;
        this.state.totalSizeBytes -= removed.metadata.sizeBytes;
        this.state.categoryCounts[removed.category]--;
      }
    }

    // Persister
    await this.persist();

    // Notifier
    this.notifyListeners();

    console.log(`[KnowledgeVault] Document ingéré: ${entry.title} (${category})`);

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
      categories?: KnowledgeCategory[];
      minRelevance?: number;
    }
  ): KnowledgeSearchResult[] {
    const { limit = 10, categories, minRelevance = 0 } = options || {};
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const results: KnowledgeSearchResult[] = [];

    for (const entry of this.state.entries) {
      // Filtre catégorie
      if (categories && !categories.includes(entry.category)) {
        continue;
      }

      // Calculer le score
      const { score, matchedKeywords, snippet } = this.calculateRelevance(
        entry,
        queryLower,
        queryWords
      );

      if (score >= minRelevance) {
        results.push({ entry, score, matchedKeywords, snippet });
      }
    }

    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);

    // Mettre à jour les compteurs d'accès
    for (const result of results.slice(0, limit)) {
      result.entry.accessCount++;
      result.entry.lastAccessedAt = Date.now();
    }

    return results.slice(0, limit);
  }

  private calculateRelevance(
    entry: KnowledgeEntry,
    queryLower: string,
    queryWords: string[]
  ): { score: number; matchedKeywords: string[]; snippet: string } {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Titre match
    const titleLower = entry.title.toLowerCase();
    if (titleLower.includes(queryLower)) {
      score += 0.4;
    }
    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        score += 0.1;
        matchedKeywords.push(word);
      }
    }

    // Content match
    const contentLower = entry.content.toLowerCase();
    for (const word of queryWords) {
      const count = (contentLower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        score += Math.min(count * 0.02, 0.2);
        if (!matchedKeywords.includes(word)) {
          matchedKeywords.push(word);
        }
      }
    }

    // Keywords match
    for (const keyword of entry.metadata.keywords) {
      if (queryWords.includes(keyword.toLowerCase())) {
        score += 0.15;
        matchedKeywords.push(keyword);
      }
    }

    // Tags match
    for (const tag of entry.tags) {
      if (queryWords.includes(tag.toLowerCase())) {
        score += 0.1;
      }
    }

    // Extract snippet
    let snippet = '';
    const idx = contentLower.indexOf(queryWords[0] || queryLower);
    if (idx !== -1) {
      const start = Math.max(0, idx - 50);
      const end = Math.min(entry.content.length, idx + 150);
      snippet = (start > 0 ? '...' : '') + entry.content.slice(start, end) + (end < entry.content.length ? '...' : '');
    } else {
      snippet = entry.summary || entry.content.slice(0, 150) + '...';
    }

    return { score: Math.min(score, 1), matchedKeywords, snippet };
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private getExtension(path: string): string {
    const match = path.match(/\.[a-zA-Z0-9]+$/);
    return match ? match[0].toLowerCase() : '';
  }

  private detectCategory(path: string, content: string): KnowledgeCategory {
    const ext = this.getExtension(path);

    // Par extension
    if (EXTENSION_CATEGORIES[ext]) {
      // Vérifier si c'est du code Tauri
      if (ext === '.rs' && (content.includes('#[tauri::command]') || content.includes('tauri::'))) {
        return 'code-tauri';
      }
      return EXTENSION_CATEGORIES[ext];
    }

    // Par contenu
    if (content.includes('fn ') && content.includes('->')) return 'code-rust';
    if (content.includes('interface ') || content.includes('type ')) return 'code-typescript';
    if (content.includes('import React') || content.includes('useState')) return 'code-react';

    return 'unknown';
  }

  private detectFormat(path: string): KnowledgeFormat {
    const ext = this.getExtension(path);
    return EXTENSION_FORMATS[ext] || 'unknown';
  }

  private extractTitle(path: string, content: string): string {
    // Essayer d'extraire un titre du contenu
    const lines = content.split('\n');
    for (const line of lines.slice(0, 10)) {
      // Markdown title
      const mdMatch = line.match(/^#\s+(.+)/);
      if (mdMatch) return mdMatch[1].trim();

      // JSDoc title
      const jsdocMatch = line.match(/\*\s+@title\s+(.+)/);
      if (jsdocMatch) return jsdocMatch[1].trim();
    }

    // Utiliser le nom de fichier
    const filename = path.split('/').pop() || path;
    return filename.replace(/\.[^.]+$/, '');
  }

  private generateSummary(content: string): string {
    // Prendre les premières lignes non vides et non commentaires
    const lines = content.split('\n');
    const summaryLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('#')
      ) {
        summaryLines.push(trimmed);
        if (summaryLines.join(' ').length > 200) break;
      }
    }

    return summaryLines.join(' ').slice(0, 250);
  }

  private detectLanguage(content: string): string | null {
    // Détection simple basée sur les patterns
    if (content.match(/fn\s+\w+.*->|impl\s+\w+|pub\s+struct/)) return 'rust';
    if (content.match(/interface\s+\w+|type\s+\w+\s*=/)) return 'typescript';
    if (content.match(/def\s+\w+|import\s+\w+|from\s+\w+\s+import/)) return 'python';
    if (content.match(/function\s+\w+|const\s+\w+\s*=/)) return 'javascript';
    return null;
  }

  private extractKeywords(content: string): string[] {
    // Extraire les mots significatifs
    const words = content
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && w.length < 20);

    // Compter les occurrences
    const counts = new Map<string, number>();
    for (const word of words) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }

    // Retourner les plus fréquents
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractTags(content: string, category: KnowledgeCategory): string[] {
    const tags: string[] = [category];

    // Tags par contenu
    if (content.includes('async')) tags.push('async');
    if (content.includes('test')) tags.push('test');
    if (content.includes('TODO')) tags.push('todo');
    if (content.includes('FIXME')) tags.push('fixme');
    if (content.includes('export')) tags.push('export');
    if (content.includes('import')) tags.push('import');

    return [...new Set(tags)];
  }

  // ─────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────

  private async persist(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[KnowledgeVault] Erreur sauvegarde localStorage:', e);
    }

    try {
      await secureInvoke('knowledge_save_state', { state: this.state });
    } catch {
      // Backend non disponible
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  getState(): KnowledgeVaultState {
    return { ...this.state };
  }

  getEntry(id: string): KnowledgeEntry | undefined {
    return this.state.entries.find(e => e.id === id);
  }

  getEntries(options?: {
    category?: KnowledgeCategory;
    limit?: number;
    sortBy?: 'date' | 'relevance' | 'access';
  }): KnowledgeEntry[] {
    let entries = [...this.state.entries];

    if (options?.category) {
      entries = entries.filter(e => e.category === options.category);
    }

    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'date':
          entries.sort((a, b) => b.indexedAt - a.indexedAt);
          break;
        case 'relevance':
          entries.sort((a, b) => b.relevanceScore - a.relevanceScore);
          break;
        case 'access':
          entries.sort((a, b) => b.accessCount - a.accessCount);
          break;
      }
    }

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  getStats() {
    return {
      totalDocuments: this.state.totalDocuments,
      totalSizeBytes: this.state.totalSizeBytes,
      categoryCounts: { ...this.state.categoryCounts },
      lastIngestion: this.state.lastIngestion,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────

  async deleteEntry(id: string): Promise<boolean> {
    const idx = this.state.entries.findIndex(e => e.id === id);
    if (idx === -1) return false;

    const entry = this.state.entries[idx];
    this.state.entries.splice(idx, 1);
    this.state.totalDocuments--;
    this.state.totalSizeBytes -= entry.metadata.sizeBytes;
    this.state.categoryCounts[entry.category]--;

    await this.persist();
    this.notifyListeners();

    return true;
  }

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS
  // ─────────────────────────────────────────────────────────────────

  subscribe(listener: (state: KnowledgeVaultState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const knowledgeVault = new KnowledgeVaultEngine();

if (typeof window !== 'undefined') {
  knowledgeVault.initialize().catch(console.error);
}

export default knowledgeVault;
