/**
 * TITANE∞ v∞.39 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.39 — SEMANTIC MEMORY ENGINE
 *   Mémoire sémantique long terme avec embeddings & retrieval
 *   Architecture: Summarize → Embed → Store → Retrieve → Inject
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from '@/services/ai/types';
import type { ChatMode } from '@/services/ai';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface SemanticMemory {
  id: string;
  timestamp: number;
  mode: ChatMode;
  summary: MemorySummary;
  embedding: number[];
  importance: number; // 0-1 (calculated from context)
  metadata: {
    sessionId?: string;
    userId?: string;
    tags?: string[];
    concepts?: string[];
  };
}

export interface MemorySummary {
  title: string;
  content: string;
  keyPoints: string[];
  entities: string[]; // Personnes, lieux, concepts mentionnés
  emotions: {
    valence: number; // -1 (négatif) → 1 (positif)
    intensity: number; // 0 (calme) → 1 (intense)
  };
  actions: string[]; // User action items: Décisions, engagements, tâches à faire (extracted from conversation)
  facts: string[]; // Faits établis, vérités mentionnées
}

export interface RetrievalResult {
  memory: SemanticMemory;
  similarity: number; // 0-1 (cosine similarity)
  relevance: number; // 0-1 (weighted score)
}

export interface SemanticMemoryConfig {
  maxMemories: number; // Limite stockage (défaut: 1000)
  similarityThreshold: number; // Seuil retrieval (défaut: 0.7)
  embeddingDimensions: number; // Dimensions vecteurs (défaut: 384)
  compressionEnabled: boolean; // Compresser vieux souvenirs
  autoSaveEnabled: boolean; // Sauvegarder après chaque interaction
}

// ─────────────────────────────────────────────────────────────────
// SEMANTIC MEMORY ENGINE
// ─────────────────────────────────────────────────────────────────

class SemanticMemoryEngine {
  private memories: Map<string, SemanticMemory> = new Map();
  private config: SemanticMemoryConfig;
  private storageKey = 'titane_semantic_memory_v1';

  constructor(config?: Partial<SemanticMemoryConfig>) {
    this.config = {
      maxMemories: 1000,
      similarityThreshold: 0.7,
      embeddingDimensions: 384,
      compressionEnabled: true,
      autoSaveEnabled: true,
      ...config,
    };

    this.loadFromStorage();
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée et stocke une mémoire sémantique à partir de messages
   */
  async createMemory(
    messages: AIMessage[],
    mode: ChatMode,
    metadata?: SemanticMemory['metadata']
  ): Promise<SemanticMemory> {
    if (messages.length === 0) {
      throw new Error('Cannot create memory from empty messages');
    }

    // 1. Créer résumé structuré
    const summary = await this.summarize(messages);

    // 2. Générer embedding
    const embedding = await this.createEmbedding(summary.content);

    // 3. Calculer importance
    const importance = this.calculateImportance(summary, messages);

    // 4. Créer mémoire
    const memory: SemanticMemory = {
      id: this.generateId(),
      timestamp: Date.now(),
      mode,
      summary,
      embedding,
      importance,
      metadata: metadata || {},
    };

    // 5. Stocker
    await this.store(memory);

    console.log(
      `[SemanticMemory] ✅ Memory created: ${memory.summary.title} (importance: ${importance.toFixed(2)})`
    );

    return memory;
  }

  /**
   * Récupère les mémoires pertinentes pour une query
   */
  async retrieve(
    query: string,
    options?: {
      topK?: number;
      mode?: ChatMode;
      minImportance?: number;
    }
  ): Promise<RetrievalResult[]> {
    const topK = options?.topK || 5;
    const mode = options?.mode;
    const minImportance = options?.minImportance || 0.3;

    // 1. Créer embedding de la query
    const queryEmbedding = await this.createEmbedding(query);

    // 2. Calculer similarités pour toutes les mémoires
    const results: RetrievalResult[] = [];

    for (const memory of this.memories.values()) {
      // Filtrer par mode si spécifié
      if (mode && memory.mode !== mode) continue;

      // Filtrer par importance minimale
      if (memory.importance < minImportance) continue;

      // Calculer similarité cosine
      const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);

      // Filtrer par seuil de similarité
      if (similarity < this.config.similarityThreshold) continue;

      // Calculer relevance (similarité + importance + recency)
      const recency = this.calculateRecency(memory.timestamp);
      const relevance = similarity * 0.7 + memory.importance * 0.2 + recency * 0.1;

      results.push({
        memory,
        similarity,
        relevance,
      });
    }

    // 3. Trier par relevance et retourner top K
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, topK);
  }

  /**
   * Injecte les mémoires pertinentes dans le prompt
   */
  injectMemoriesInPrompt(memories: RetrievalResult[], maxLength: number = 1000): string {
    if (memories.length === 0) {
      return '';
    }

    let contextText = '\n\n📚 **Contexte mémoriel pertinent:**\n\n';
    let currentLength = 0;

    for (const { memory, relevance } of memories) {
      const memoryText = `• ${memory.summary.title}\n  ${memory.summary.content}\n  (Pertinence: ${(relevance * 100).toFixed(0)}%)\n\n`;

      if (currentLength + memoryText.length > maxLength) {
        contextText +=
          '• [...] (mémoires supplémentaires disponibles mais limitées par la longueur)\n';
        break;
      }

      contextText += memoryText;
      currentLength += memoryText.length;
    }

    return contextText;
  }

  /**
   * Compresse les vieilles mémoires (garde résumé, supprime détails)
   */
  async compress(): Promise<number> {
    const compressionAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
    const now = Date.now();
    let compressedCount = 0;

    for (const memory of this.memories.values()) {
      const age = now - memory.timestamp;

      if (age > compressionAge && memory.importance < 0.7) {
        // Réduire l'embedding (garde seulement indices importants)
        memory.embedding = this.compressEmbedding(memory.embedding);
        compressedCount++;
      }
    }

    if (compressedCount > 0) {
      await this.saveToStorage();
      console.log(`[SemanticMemory] ✅ Compressed ${compressedCount} old memories`);
    }

    return compressedCount;
  }

  /**
   * Supprime les mémoires les moins importantes si limite atteinte
   */
  async cleanup(): Promise<number> {
    const memoryArray = Array.from(this.memories.values());

    if (memoryArray.length <= this.config.maxMemories) {
      return 0;
    }

    // Trier par importance
    const sorted = memoryArray.sort((a, b) => a.importance - b.importance);

    // Supprimer les moins importantes
    const toRemove = memoryArray.length - this.config.maxMemories;
    let removed = 0;

    for (let i = 0; i < toRemove; i++) {
      this.memories.delete(sorted[i].id);
      removed++;
    }

    await this.saveToStorage();
    console.log(`[SemanticMemory] 🧹 Cleaned up ${removed} low-importance memories`);

    return removed;
  }

  /**
   * Exporte toutes les mémoires
   */
  exportAll(): SemanticMemory[] {
    return Array.from(this.memories.values());
  }

  /**
   * Importe des mémoires
   */
  async importMemories(memories: SemanticMemory[]): Promise<number> {
    let imported = 0;

    for (const memory of memories) {
      this.memories.set(memory.id, memory);
      imported++;
    }

    await this.saveToStorage();
    console.log(`[SemanticMemory] 📥 Imported ${imported} memories`);

    return imported;
  }

  /**
   * Statistiques
   */
  getStats() {
    const memories = Array.from(this.memories.values());

    return {
      totalMemories: memories.length,
      averageImportance:
        memories.reduce((sum, m) => sum + m.importance, 0) / memories.length || 0,
      oldestMemory:
        memories.length > 0 ? Math.min(...memories.map(m => m.timestamp)) : null,
      newestMemory:
        memories.length > 0 ? Math.max(...memories.map(m => m.timestamp)) : null,
      byMode: this.groupByMode(memories),
      storageSizeMB: this.estimateStorageSize() / (1024 * 1024),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crée un résumé structuré à partir des messages
   */
  private async summarize(messages: AIMessage[]): Promise<MemorySummary> {
    // Extraire texte brut
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'TITANE'}: ${m.content}`)
      .join('\n\n');

    // Analyse simple pour extraire entités et concepts
    const entities = this.extractEntities(conversationText);
    const _concepts = this.extractConcepts(conversationText);
    const actions = this.extractActions(conversationText);
    const facts = this.extractFacts(conversationText);

    // Créer titre court
    const title = this.generateTitle(messages);

    // Créer contenu résumé
    const content = this.generateSummary(conversationText);

    // Analyser émotions
    const emotions = this.analyzeEmotions(conversationText);

    return {
      title,
      content,
      keyPoints: this.extractKeyPoints(conversationText),
      entities,
      emotions,
      actions,
      facts,
    };
  }

  /**
   * Crée un embedding à partir d'un texte
   * (Simplifié pour démo - en production, utiliser un vrai modèle d'embeddings)
   */
  private async createEmbedding(text: string): Promise<number[]> {
    // DEMO: Génération embedding simple basé sur hashing
    // En production, utiliser:
    // - Transformer.js (https://huggingface.co/Xenova/all-MiniLM-L6-v2)
    // - API OpenAI embeddings
    // - API Cohere embeddings
    // - Modèle local BERT/SentenceBERT

    const words = text.toLowerCase().split(/\s+/);
    const embedding: number[] = new Array(this.config.embeddingDimensions).fill(0);

    // Hashing simple pour démo
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);

      for (let j = 0; j < this.config.embeddingDimensions; j++) {
        const index = (hash + j) % this.config.embeddingDimensions;
        embedding[index] += Math.sin(hash * (j + 1)) * 0.1;
      }
    }

    // Normaliser le vecteur
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / magnitude);
  }

  /**
   * Stocke une mémoire
   */
  private async store(memory: SemanticMemory): Promise<void> {
    this.memories.set(memory.id, memory);

    // Cleanup si limite atteinte
    if (this.memories.size > this.config.maxMemories) {
      await this.cleanup();
    }

    // Auto-save si activé
    if (this.config.autoSaveEnabled) {
      await this.saveToStorage();
    }
  }

  /**
   * Calcule la similarité cosine entre deux vecteurs
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calcule l'importance d'une mémoire
   */
  private calculateImportance(summary: MemorySummary, messages: AIMessage[]): number {
    let score = 0.5; // Base score

    // Facteur 1: Longueur de la conversation (plus long = plus important)
    score += Math.min(messages.length / 20, 0.2);

    // Facteur 2: Présence d'entités (personnes, lieux)
    score += Math.min(summary.entities.length / 10, 0.1);

    // Facteur 3: Actions/décisions (plus d'actions = plus important)
    score += Math.min(summary.actions.length / 5, 0.15);

    // Facteur 4: Intensité émotionnelle
    score += summary.emotions.intensity * 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Calcule le facteur de recency (0-1, plus récent = plus haut)
   */
  private calculateRecency(timestamp: number): number {
    const age = Date.now() - timestamp;
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 jours

    if (age >= maxAge) return 0;

    return 1 - age / maxAge;
  }

  /**
   * Compresse un embedding (garde indices importants)
   */
  private compressEmbedding(embedding: number[]): number[] {
    // Garde seulement 50% des dimensions les plus significatives
    const sorted = embedding
      .map((val, idx) => ({ val: Math.abs(val), idx }))
      .sort((a, b) => b.val - a.val);

    const topIndices = new Set(sorted.slice(0, embedding.length / 2).map(x => x.idx));

    return embedding.map((val, idx) => (topIndices.has(idx) ? val : 0));
  }

  // ═══════════════════════════════════════════════════════════════
  // EXTRACTION HELPERS (Simplified NLP)
  // ═══════════════════════════════════════════════════════════════

  private extractEntities(text: string): string[] {
    // Extraction simple basée sur majuscules et patterns
    const entities = new Set<string>();

    // Pattern 1: Mots capitalisés (noms propres potentiels)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
    capitalizedWords.forEach(word => entities.add(word));

    // Pattern 2: Noms communs précédés de "je", "tu", "il", etc.
    const pronouns = [
      'je ',
      'tu ',
      'il ',
      'elle ',
      'on ',
      'nous ',
      'vous ',
      'ils ',
      'elles ',
    ];
    pronouns.forEach(pronoun => {
      const regex = new RegExp(pronoun + '([a-zéèêàâùû]+)', 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          const word = match.split(' ')[1];
          if (word && word.length > 3) entities.add(word);
        });
      }
    });

    return Array.from(entities).slice(0, 10); // Limite 10 entités
  }

  private extractConcepts(text: string): string[] {
    // Mots-clés techniques et concepts
    const conceptPatterns = [
      /\b(api|code|fonction|algorithme|data|intelligence|artificielle|machine learning|neural|système|architecture)\b/gi,
      /\b(projet|développement|implémentation|design|optimisation|performance|sécurité)\b/gi,
    ];

    const concepts = new Set<string>();

    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => concepts.add(match.toLowerCase()));
      }
    });

    return Array.from(concepts);
  }

  private extractActions(text: string): string[] {
    // Verbes d'action + compléments
    const actionPatterns = [
      /\b(créer|développer|implémenter|corriger|améliorer|tester|déployer|analyser)\s+([a-zéèêàâùû\s]+)/gi,
      /\b(faire|vais faire|dois faire|va faire)\s+([a-zéèêàâùû\s]+)/gi,
    ];

    const actions: string[] = [];

    actionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0].length > 10) {
          // Actions significatives
          actions.push(match[0].trim());
        }
      }
    });

    return actions.slice(0, 5); // Limite 5 actions
  }

  private extractFacts(text: string): string[] {
    // Phrases déclaratives (sujet + verbe + complément)
    const sentences = text.split(/[.!?]+/);
    const facts: string[] = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      // Filtrer phrases courtes et questions
      if (trimmed.length < 20 || trimmed.includes('?')) continue;

      // Patterns de faits
      if (
        trimmed.match(/\b(est|sont|a|ont|possède|contient|utilise)\b/i) ||
        trimmed.match(/\b(c'est|ce sont|il y a)\b/i)
      ) {
        facts.push(trimmed);
      }
    }

    return facts.slice(0, 3); // Limite 3 faits
  }

  private extractKeyPoints(text: string): string[] {
    // Phrases les plus longues et complètes (heuristique simple)
    const sentences = text.split(/[.!?]+/);

    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 200)
      .sort((a, b) => b.length - a.length)
      .slice(0, 3);
  }

  private generateTitle(messages: AIMessage[]): string {
    // Titre basé sur premier message utilisateur
    const firstUserMsg = messages.find(m => m.role === 'user');

    if (!firstUserMsg) {
      return 'Conversation TITANE∞';
    }

    // Tronquer et nettoyer
    const title = firstUserMsg.content.trim().split('\n')[0].substring(0, 60);

    return title + (firstUserMsg.content.length > 60 ? '...' : '');
  }

  private generateSummary(text: string): string {
    // Résumé simple: Première phrase + dernière phrase
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length === 0) return text.substring(0, 200);

    const first = sentences[0].trim();
    const last = sentences[sentences.length - 1].trim();

    if (sentences.length === 1) return first;

    return `${first}. [...] ${last}.`;
  }

  private analyzeEmotions(text: string): { valence: number; intensity: number } {
    // Analyse simple basée sur mots-clés émotionnels
    const positiveWords = [
      'bien',
      'super',
      'excellent',
      'génial',
      'merci',
      'parfait',
      'bravo',
      'content',
    ];
    const negativeWords = [
      'problème',
      'erreur',
      'bug',
      'frustré',
      'difficile',
      'échec',
      'inquiet',
    ];
    const intenseWords = [
      'très',
      'vraiment',
      'extrêmement',
      'incroyablement',
      '!!!',
      'urgent',
    ];

    const lowerText = text.toLowerCase();
    let valence = 0;
    let intensity = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) valence += 0.1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) valence -= 0.1;
    });

    intenseWords.forEach(word => {
      if (lowerText.includes(word)) intensity += 0.15;
    });

    return {
      valence: Math.max(-1, Math.min(1, valence)),
      intensity: Math.max(0, Math.min(1, intensity)),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((memory: SemanticMemory) => {
          this.memories.set(memory.id, memory);
        });
        console.log(
          `[SemanticMemory] 📂 Loaded ${this.memories.size} memories from storage`
        );
      }
    } catch (error) {
      console.error('[SemanticMemory] Failed to load from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const memories = Array.from(this.memories.values());
      localStorage.setItem(this.storageKey, JSON.stringify(memories));
    } catch (error) {
      console.error('[SemanticMemory] Failed to save to storage:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private groupByMode(memories: SemanticMemory[]): Record<ChatMode, number> {
    const grouped: Partial<Record<ChatMode, number>> = {};

    memories.forEach(m => {
      grouped[m.mode] = (grouped[m.mode] || 0) + 1;
    });

    return grouped as Record<ChatMode, number>;
  }

  private estimateStorageSize(): number {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? stored.length : 0;
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────

export const semanticMemoryEngine = new SemanticMemoryEngine({
  maxMemories: 1000,
  similarityThreshold: 0.7,
  embeddingDimensions: 384,
  compressionEnabled: true,
  autoSaveEnabled: true,
});
