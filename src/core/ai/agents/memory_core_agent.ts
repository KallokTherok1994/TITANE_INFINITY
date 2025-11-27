/**
 * TITANE∞ v∞ Phase 4 - Multi-Agent System
 * Agent: Memory-Core
 * Rôle: Apprentissage, intégration connaissances, gestion XP
 */

import type { Agent, AgentState, AgentEvent, AgentResponse, AgentRole } from '../multi_agent_engine';

interface KnowledgeEntry {
  id: string;
  content: string;
  type: 'text' | 'code' | 'config' | 'data';
  source: string; // origin (file, url, user)
  category: string[];
  confidence: number; // 0-100
  timestamp: number;
  embedding?: number[]; // semantic embedding (future)
}

interface MemorySnapshot {
  id: string;
  timestamp: number;
  knowledgeCount: number;
  totalXP: number;
  categories: string[];
}

interface ImportData {
  content?: string;
  type?: 'text' | 'code' | 'config' | 'data';
  source?: string;
}

interface QueryData {
  keyword?: string;
  category?: string;
  limit?: number;
}

interface LearningMetrics {
  totalKnowledge: number;
  categoriesLearned: number;
  averageConfidence: number;
  xpGained: number;
  lastLearningTime: number;
}

export class MemoryCoreAgent implements Agent {
  public id = 'memory-core';
  public name = 'Memory-Core';
  public role: AgentRole = 'memory';
  public description = 'Agent d\'apprentissage et intégration des connaissances';
  public permissions = ['knowledge:read', 'knowledge:write', 'xp:manage'];

  public state: AgentState = {
    status: 'idle',
    lastTick: 0,
    cycleCount: 0,
    health: 100,
    load: 0,
    errors: [],
    metrics: {},
  };

  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private snapshots: MemorySnapshot[] = [];
  private categories: Set<string> = new Set();
  private totalXP = 0;
  private learningQueue: KnowledgeEntry[] = [];

  async initialize(): Promise<void> {
    this.state.status = 'active';
    await this.loadFromStorage();
    console.log(`[Memory-Core] Initialized with ${this.knowledge.size} entries, ${this.totalXP} XP`);
  }

  async shutdown(): Promise<void> {
    await this.saveToStorage();
    this.state.status = 'idle';
    console.log('[Memory-Core] Shutdown complete');
  }

  async tick(): Promise<void> {
    this.state.cycleCount++;
    this.state.lastTick = Date.now();

    // Process learning queue
    if (this.learningQueue.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const entry = this.learningQueue.shift()!; // Safe: length > 0 verified
      await this.integrateKnowledge(entry);
    }

    this.updateMetrics();
  }

  async pause(): Promise<void> {
    this.state.status = 'paused';
    console.log('[Memory-Core] Paused');
  }

  async resume(): Promise<void> {
    this.state.status = 'active';
    console.log('[Memory-Core] Resumed');
  }

  async handle(event: AgentEvent): Promise<AgentResponse> {
    if (event.type === 'knowledge:import') {
      return this.importKnowledge(event.payload);
    }

    if (event.type === 'knowledge:query') {
      return this.queryKnowledge(event.payload);
    }

    if (event.type === 'snapshot:create') {
      return this.createSnapshot();
    }

    if (event.type === 'snapshot:restore') {
      const payload = event.payload as { snapshotId?: string };
      return this.restoreSnapshot(payload.snapshotId || '');
    }

    return { success: false, error: `Unknown event type: ${event.type}` };
  }

  // Import new knowledge from file/url/user
  private async importKnowledge(data: ImportData): Promise<AgentResponse> {
    try {
      const entry: KnowledgeEntry = {
        id: `kb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        content: data.content || '',
        type: data.type || 'text',
        source: data.source || 'unknown',
        category: this.classifyContent(data.content || ''),
        confidence: 70, // Initial confidence
        timestamp: Date.now(),
      };

      this.learningQueue.push(entry);
      this.state.load = Math.min(100, (this.learningQueue.length / 10) * 100);

      return {
        success: true,
        message: `Knowledge queued for learning (${this.learningQueue.length} pending)`,
        data: { entryId: entry.id },
      };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  // Integrate knowledge into memory
  private async integrateKnowledge(entry: KnowledgeEntry): Promise<void> {
    // Check for duplicates
    const similar = this.findSimilarKnowledge(entry.content);
    if (similar) {
      // Merge with existing knowledge
      similar.confidence = Math.min(100, similar.confidence + 10);
      similar.timestamp = Date.now();
      console.log(`[Memory-Core] Merged duplicate knowledge: ${entry.id}`);
      return;
    }

    // Add to knowledge base
    this.knowledge.set(entry.id, entry);
    entry.category.forEach((cat) => this.categories.add(cat));

    // Award XP
    const xpGained = this.calculateXP(entry);
    this.totalXP += xpGained;

    console.log(`[Memory-Core] Learned: ${entry.id} (+${xpGained} XP, total: ${this.totalXP})`);
  }

  // Query knowledge base
  private queryKnowledge(query: QueryData): AgentResponse {
    const { keyword, category, limit = 10 } = query;

    let results: KnowledgeEntry[] = Array.from(this.knowledge.values());

    if (category) {
      results = results.filter((k) => k.category.includes(category));
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      results = results.filter((k) => k.content.toLowerCase().includes(kw));
    }

    results = results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    return {
      success: true,
      message: `Found ${results.length} entries`,
      data: { results },
    };
  }

  // Create memory snapshot
  private createSnapshot(): AgentResponse {
    const snapshot: MemorySnapshot = {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      knowledgeCount: this.knowledge.size,
      totalXP: this.totalXP,
      categories: Array.from(this.categories),
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > 50) this.snapshots.shift(); // Keep last 50

    return {
      success: true,
      message: 'Snapshot created',
      data: { snapshot },
    };
  }

  // Restore from snapshot
  private restoreSnapshot(snapshotId: string): AgentResponse {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) {
      return { success: false, message: 'Snapshot not found' };
    }

    // Note: Full restore would require saved knowledge data
    // This is a simplified version
    this.totalXP = snapshot.totalXP;
    this.categories = new Set(snapshot.categories);

    return {
      success: true,
      message: `Restored to snapshot ${snapshotId}`,
      data: { snapshot },
    };
  }

  // Classify content into categories
  private classifyContent(content: string): string[] {
    const categories: string[] = [];
    const lower = content.toLowerCase();

    // Simple keyword-based classification
    if (lower.includes('function') || lower.includes('class') || lower.includes('import'))
      categories.push('code');
    if (lower.includes('config') || lower.includes('settings'))
      categories.push('config');
    if (lower.includes('bug') || lower.includes('error') || lower.includes('fix'))
      categories.push('debug');
    if (lower.includes('feature') || lower.includes('implement'))
      categories.push('feature');
    if (lower.includes('doc') || lower.includes('guide'))
      categories.push('documentation');
    if (lower.includes('test') || lower.includes('spec'))
      categories.push('testing');

    if (categories.length === 0) categories.push('general');

    return categories;
  }

  // Find similar knowledge (simple string matching)
  private findSimilarKnowledge(content: string): KnowledgeEntry | null {
    const threshold = 0.8; // 80% similarity
    for (const entry of this.knowledge.values()) {
      const similarity = this.calculateSimilarity(content, entry.content);
      if (similarity >= threshold) return entry;
    }
    return null;
  }

  // Calculate similarity between two strings (Jaccard index)
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
  }

  // Calculate XP gained from knowledge
  private calculateXP(entry: KnowledgeEntry): number {
    let xp = 10; // Base XP

    // Bonus for new categories
    const newCategories = entry.category.filter((c) => !this.categories.has(c));
    xp += newCategories.length * 5;

    // Bonus for high confidence
    if (entry.confidence > 90) xp += 5;

    // Bonus for code
    if (entry.type === 'code') xp += 10;

    return xp;
  }

  // Update internal metrics
  private updateMetrics(): void {
    const metrics: LearningMetrics = {
      totalKnowledge: this.knowledge.size,
      categoriesLearned: this.categories.size,
      averageConfidence:
        Array.from(this.knowledge.values()).reduce((sum, k) => sum + k.confidence, 0) /
          this.knowledge.size || 0,
      xpGained: this.totalXP,
      lastLearningTime: Date.now(),
    };

    this.state.data = metrics as unknown as Record<string, unknown>;

    // Calculate health (degrades if no learning)
    const timeSinceLastLearning = Date.now() - metrics.lastLearningTime;
    const hoursSinceLearning = timeSinceLastLearning / (1000 * 60 * 60);
    if (hoursSinceLearning > 24) {
      this.state.health = Math.max(50, 100 - hoursSinceLearning);
    } else {
      this.state.health = 100;
    }
  }

  // Load knowledge from localStorage
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('memory_core_knowledge');
      if (stored) {
        const data = JSON.parse(stored);
        this.knowledge = new Map(data.knowledge || []);
        this.totalXP = data.totalXP || 0;
        this.categories = new Set(data.categories || []);
      }
    } catch (error) {
      console.error('[Memory-Core] Load failed:', error);
    }
  }

  // Save knowledge to localStorage
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        knowledge: Array.from(this.knowledge.entries()),
        totalXP: this.totalXP,
        categories: Array.from(this.categories),
      };
      localStorage.setItem('memory_core_knowledge', JSON.stringify(data));
    } catch (error) {
      console.error('[Memory-Core] Save failed:', error);
    }
  }

  // Emit event to other agents
  emit(event: AgentEvent): void {
    console.log(`[Memory-Core] Emitting event: ${event.type}`);
  }

  // Get current health
  getHealth(): number {
    return this.state.health;
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return this.state.metrics;
  }
}
