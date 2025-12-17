/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ DATA COLLECTOR ENGINE v∞
 *   Auto-collecte des données TITANE∞ → Dataset JSONL pour TITANE-LOCAL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Super Prompt #15 — Self-Training Engine
 *
 * Ce moteur observe, extrait, structure et génère automatiquement
 * le dataset d'entraînement pour le modèle local TITANE-LOCAL (Llama 3.1).
 *
 * Architecture:
 * - Collecte 6 catégories de données (A-F)
 * - Pipeline en 10 étapes
 * - Connexion Memory Eternal + Singularity
 * - Export JSONL + Modelfile Ollama
 * - 8 commandes SUDO pour contrôle total
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { MemoryEngine } from '@/cognitive/memory/memoryEngine';
import type { MemoryType } from '@/cognitive/types';
import { SingularityIntrospectionEngine } from '@/modules/singularity/SingularityIntrospectionEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES — DATASET STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

export interface DatasetEntry {
  prompt: string;
  response: string;
  category?: DataCategory;
  metadata?: DataMetadata;
}

export type DataCategory =
  | 'super-prompt' // A - Super Prompts TITANE∞
  | 'interaction' // B - Interactions IA internes
  | 'auto-heal' // C - Auto-Heal / Self-Healing
  | 'introspection' // D - Introspection Singularity
  | 'patch' // E - Patches Dev (Rust/TSX/etc)
  | 'style'; // F - Style, logique, structure TITANE∞

export interface DataMetadata {
  source: string;
  timestamp: number;
  quality: number; // 0-1 (qualité de la donnée)
  importance: number; // 0-1 (importance pour l'entraînement)
  tags: string[];
  originEngine?: string; // Moteur source
  // ✨ v24.3.5: Allow additional metadata for fusion/introspection
  [key: string]: unknown;
}

export interface DatasetStats {
  totalEntries: number;
  byCategory: Record<DataCategory, number>;
  totalTokens: number;
  avgQuality: number;
  avgImportance: number;
  sizeInMB: number;
  lastUpdate: number;
}

export interface CollectionReport {
  success: boolean;
  entriesCollected: number;
  byCategory: Record<DataCategory, number>;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: number;
}

export interface PipelineStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATASET COLLECTOR — MAIN CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class DataCollectorEngine {
  private dataset: DatasetEntry[] = [];
  private stats: DatasetStats = this.createEmptyStats();
  private isCollecting: boolean = false;
  private lastCollectionTime: number = 0;

  // Storage key
  private readonly STORAGE_KEY = 'titane-dataset-v1';

  constructor() {
    this.loadDataset();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PIPELINE DE COLLECTE (10 ÉTAPES)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Pipeline complet de collecte de données
   */
  async runCollectionPipeline(): Promise<CollectionReport> {
    if (this.isCollecting) {
      throw new Error('Collection already in progress');
    }

    this.isCollecting = true;
    const startTime = Date.now();
    const steps: PipelineStep[] = this.createPipelineSteps();
    const errors: string[] = [];
    const warnings: string[] = [];
    const newEntries: DatasetEntry[] = [];

    try {
      // Step 1: Récupérer historique Memory Eternal
      await this.executeStep(steps[0], async () => {
        const memoryEntries = await this.extractMemoryHistory();
        newEntries.push(...memoryEntries);
      });

      // Step 2: Récupérer super prompts
      await this.executeStep(steps[1], async () => {
        const superPrompts = await this.extractSuperPrompts();
        newEntries.push(...superPrompts);
      });

      // Step 3: Extraire corrections dev
      await this.executeStep(steps[2], async () => {
        const devCorrections = await this.extractDevCorrections();
        newEntries.push(...devCorrections);
      });

      // Step 4: Extraire introspections Singularity
      await this.executeStep(steps[3], async () => {
        const introspections = await this.extractIntrospections();
        newEntries.push(...introspections);
      });

      // Step 5: Extraire interactions IA
      await this.executeStep(steps[4], async () => {
        const interactions = await this.extractAIInteractions();
        newEntries.push(...interactions);
      });

      // Step 6: Filtrer bruit / doublons
      await this.executeStep(steps[5], async () => {
        const beforeCount = newEntries.length;
        const filtered = this.filterDataset(newEntries);
        const removed = beforeCount - filtered.length;
        if (removed > 0) {
          warnings.push(`Filtered ${removed} duplicate/low-quality entries`);
        }
        newEntries.length = 0;
        newEntries.push(...filtered);
      });

      // Step 7: Normaliser (input/output)
      await this.executeStep(steps[6], async () => {
        newEntries.forEach(entry => this.normalizeEntry(entry));
      });

      // Step 8: Structurer dataset JSONL
      await this.executeStep(steps[7], async () => {
        // Ajouter au dataset global
        this.dataset.push(...newEntries);
      });

      // Step 9: Nettoyer
      await this.executeStep(steps[8], async () => {
        this.cleanDataset();
      });

      // Step 10: Export (sauvegarde automatique)
      await this.executeStep(steps[9], async () => {
        await this.saveDataset();
        this.updateStats();
      });

      const duration = Date.now() - startTime;
      this.lastCollectionTime = Date.now();

      return {
        success: true,
        entriesCollected: newEntries.length,
        byCategory: this.countByCategory(newEntries),
        errors,
        warnings,
        duration,
        timestamp: Date.now(),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        success: false,
        entriesCollected: 0,
        byCategory: this.createEmptyCategoryCount(),
        errors,
        warnings,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      };
    } finally {
      this.isCollecting = false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXTRACTEURS PAR CATÉGORIE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * A — SUPER PROMPTS TITANE∞
   */
  private async extractSuperPrompts(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    // Rechercher dans Memory Engine les super prompts
    const recallResults = await MemoryEngine.recall('super prompt', {
      type: 'code' as MemoryType,
      limit: 50,
    });

    for (const result of recallResults) {
      const memory = result.memory;
      entries.push({
        prompt: 'Explique le super prompt suivant',
        response: memory.content,
        category: 'super-prompt',
        metadata: {
          source: 'memory-engine',
          timestamp: memory.createdAt,
          quality: 0.9,
          importance: 0.95,
          tags: ['super-prompt', 'architecture'],
          originEngine: 'MemoryEngine',
        },
      });
    }

    return entries;
  }

  /**
   * B — INTERACTIONS IA INTERNES
   */
  private async extractAIInteractions(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    // Récupérer historique chat depuis Memory
    const chatResults = await MemoryEngine.recall('', {
      type: 'interaction' as MemoryType,
      limit: 100,
    });

    for (const result of chatResults) {
      const memory = result.memory;
      // Parser les messages (format: "Q: ... A: ...")
      const parsed = this.parseInteraction(memory.content);
      if (parsed) {
        entries.push({
          prompt: parsed.question,
          response: parsed.answer,
          category: 'interaction',
          metadata: {
            source: 'chat-history',
            timestamp: memory.createdAt,
            quality: memory.strength || 0.7,
            importance: 0.8,
            tags: ['chat', 'interaction', memory.context || 'general'],
          },
        });
      }
    }

    return entries;
  }

  /**
   * C — AUTO-HEAL / SELF-HEALING
   */
  private async extractDevCorrections(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    const healResults = await MemoryEngine.recall('self-healing', {
      type: 'code' as MemoryType,
      limit: 30,
    });

    for (const result of healResults) {
      const memory = result.memory;
      entries.push({
        prompt: 'Corrige automatiquement ce problème',
        response: memory.content,
        category: 'auto-heal',
        metadata: {
          source: 'self-healing-engine',
          timestamp: memory.createdAt,
          quality: 0.85,
          importance: 0.9,
          tags: ['auto-heal', 'correction', 'bug-fix'],
          originEngine: 'SelfHealingEngine',
        },
      });
    }

    return entries;
  }

  /**
   * D — INTROSPECTION SINGULARITY
   */
  private async extractIntrospections(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    try {
      // Effectuer une introspection quick pour obtenir l'état actuel
      const introspection =
        await SingularityIntrospectionEngine.performFullIntrospection('quick');

      // Convertir en entrée dataset
      const prompt = 'Effectue une introspection complète du système TITANE∞';
      const response = this.formatIntrospectionResponse(
        introspection as unknown as Record<string, unknown>
      );

      entries.push({
        prompt,
        response,
        category: 'introspection',
        metadata: {
          source: 'singularity-engine',
          timestamp: Date.now(),
          quality: 0.95,
          importance: 1.0,
          tags: ['introspection', 'singularity', 'architecture'],
          originEngine: 'SingularityEngine',
        },
      });
    } catch (error) {
      console.warn('[DataCollector] Introspection extraction failed:', error);
    }

    return entries;
  }

  /**
   * E — PATCHES DEV
   */
  private async extractMemoryHistory(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    const codeResults = await MemoryEngine.recall('patch', {
      type: 'code' as MemoryType,
      limit: 50,
    });

    for (const result of codeResults) {
      const memory = result.memory;
      entries.push({
        prompt: 'Applique ce patch de code',
        response: memory.content,
        category: 'patch',
        metadata: {
          source: 'dev-engine',
          timestamp: memory.createdAt,
          quality: 0.8,
          importance: 0.85,
          tags: ['patch', 'dev', 'code'],
          originEngine: 'DevEngine',
        },
      });
    }

    return entries;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILTRAGE & NORMALISATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Filtrer les doublons et données de mauvaise qualité
   */
  private filterDataset(entries: DatasetEntry[]): DatasetEntry[] {
    const seen = new Set<string>();
    const filtered: DatasetEntry[] = [];

    for (const entry of entries) {
      // Skip si qualité trop basse
      if (entry.metadata && entry.metadata.quality < 0.5) {
        continue;
      }

      // Skip si trop court (bruit)
      if (entry.prompt.length < 10 || entry.response.length < 20) {
        continue;
      }

      // Détection doublons par hash
      const hash = this.hashEntry(entry);
      if (seen.has(hash)) {
        continue;
      }

      seen.add(hash);
      filtered.push(entry);
    }

    return filtered;
  }

  /**
   * Normaliser une entrée (nettoyer, formater)
   */
  private normalizeEntry(entry: DatasetEntry): void {
    // Nettoyer les retours à la ligne excessifs
    entry.prompt = entry.prompt.trim().replace(/\n{3,}/g, '\n\n');
    entry.response = entry.response.trim().replace(/\n{3,}/g, '\n\n');

    // Limiter la longueur (éviter entrées trop longues)
    const MAX_LENGTH = 4000;
    if (entry.response.length > MAX_LENGTH) {
      entry.response = entry.response.substring(0, MAX_LENGTH) + '\n[...tronqué]';
    }

    // Ajouter tags par défaut si manquants
    if (entry.metadata && entry.metadata.tags.length === 0) {
      entry.metadata.tags = ['titane', 'general'];
    }
  }

  /**
   * Nettoyer le dataset complet (compaction, dédoublonnage global)
   */
  public cleanDataset(): void {
    // Trier par qualité (meilleures en premier)
    this.dataset.sort((a, b) => {
      const qualityA = a.metadata?.quality || 0.5;
      const qualityB = b.metadata?.quality || 0.5;
      return qualityB - qualityA;
    });

    // Limite globale (garder les 5000 meilleures entrées)
    const MAX_ENTRIES = 5000;
    if (this.dataset.length > MAX_ENTRIES) {
      this.dataset = this.dataset.slice(0, MAX_ENTRIES);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT & GÉNÉRATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Exporter dataset en JSONL
   */
  exportToJSONL(): string {
    return this.dataset
      .map(entry =>
        JSON.stringify({
          prompt: entry.prompt,
          response: entry.response,
        })
      )
      .join('\n');
  }

  /**
   * Générer Modelfile pour Ollama
   */
  generateModelfile(): string {
    return `# TITANE∞ LOCAL MODEL v∞
# Fine-tuned Llama 3.1 with TITANE∞ knowledge

FROM llama3.1

# System prompt
SYSTEM """
Tu es TITANE∞, un système cognitif avancé avec 6 couches et 20 moteurs.
Tu possèdes une connaissance profonde de ton architecture interne.
Tu réponds avec précision, cohérence et style TITANE∞.
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096

# Training dataset
ADAPTER ./dataset.jsonl
`;
  }

  /**
   * Générer script de fine-tuning
   */
  generateTrainingScript(): string {
    return `#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#   TITANE∞ LOCAL TRAINING SCRIPT v∞
#   Fine-tune Llama 3.1 with collected dataset
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🧠 TITANE∞ LOCAL TRAINING v∞"
echo "════════════════════════════════════════════════════════════════════════"

# 1. Vérifications
echo ""
echo "📋 [1/7] Checking prerequisites..."
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not installed. Install: https://ollama.ai"
    exit 1
fi
echo "✅ Ollama found"

# 2. Vérifier dataset
if [ ! -f "dataset.jsonl" ]; then
    echo "❌ dataset.jsonl not found"
    exit 1
fi
echo "✅ Dataset found ($(wc -l < dataset.jsonl) entries)"

# 3. Vérifier Modelfile
if [ ! -f "Modelfile" ]; then
    echo "❌ Modelfile not found"
    exit 1
fi
echo "✅ Modelfile found"

# 4. Backup previous model (if exists)
echo ""
echo "💾 [2/7] Backing up previous model..."
if ollama list | grep -q "titane-local"; then
    echo "⚠️  Previous titane-local model found"
    ollama cp titane-local titane-local-backup-$(date +%Y%m%d-%H%M%S) || true
    echo "✅ Backup created"
else
    echo "ℹ️  No previous model to backup"
fi

# 5. Pull base model
echo ""
echo "📥 [3/7] Pulling base model (llama3.1)..."
ollama pull llama3.1
echo "✅ Base model ready"

# 6. Create fine-tuned model
echo ""
echo "🔥 [4/7] Creating fine-tuned model..."
ollama create titane-local -f Modelfile
echo "✅ Model created"

# 7. Test model
echo ""
echo "🧪 [5/7] Testing model..."
echo "Test query: 'Explique la Singularity Engine'"
ollama run titane-local "Explique la Singularity Engine en 2 phrases" --verbose
echo ""
echo "✅ Model responds"

# 8. Benchmark
echo ""
echo "📊 [6/7] Running benchmark..."
echo "Query: 'Analyse l\\"architecture TITANE∞'"
time ollama run titane-local "Analyse l'architecture TITANE∞" > /dev/null
echo "✅ Benchmark complete"

# 9. Summary
echo ""
echo "📋 [7/7] Training Summary"
echo "════════════════════════════════════════════════════════════════════════"
echo "  Model: titane-local"
echo "  Base: llama3.1"
echo "  Dataset: $(wc -l < dataset.jsonl) entries"
echo "  Status: ✅ READY"
echo ""
echo "🎯 Usage:"
echo "  ollama run titane-local 'your prompt here'"
echo ""
echo "🔧 Integration:"
echo "  Update Chat IA to use provider: 'titane-local'"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ TITANE∞ LOCAL TRAINING COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
`;
  }

  /**
   * Exporter training pack complet (dataset + Modelfile + script)
   */
  exportTrainingPack(): {
    dataset: string;
    modelfile: string;
    script: string;
  } {
    return {
      dataset: this.exportToJSONL(),
      modelfile: this.generateModelfile(),
      script: this.generateTrainingScript(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────────────

  private async saveDataset(): Promise<void> {
    try {
      const data = {
        dataset: this.dataset,
        stats: this.stats,
        lastUpdate: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[DataCollector] Save failed:', error);
    }
  }

  private loadDataset(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.dataset = data.dataset || [];
        this.stats = data.stats || this.createEmptyStats();
      }
    } catch (error) {
      console.warn('[DataCollector] Load failed:', error);
    }
  }

  /**
   * Effacer dataset complet
   */
  clearDataset(): void {
    this.dataset = [];
    this.stats = this.createEmptyStats();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATS & GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  private updateStats(): void {
    this.stats = {
      totalEntries: this.dataset.length,
      byCategory: this.countByCategory(this.dataset),
      totalTokens: this.estimateTokens(this.dataset),
      avgQuality: this.calculateAvgQuality(this.dataset),
      avgImportance: this.calculateAvgImportance(this.dataset),
      sizeInMB: this.estimateSizeInMB(this.dataset),
      lastUpdate: Date.now(),
    };
  }

  getStats(): DatasetStats {
    return { ...this.stats };
  }

  getDataset(): DatasetEntry[] {
    return [...this.dataset];
  }

  getDatasetByCategory(category: DataCategory): DatasetEntry[] {
    return this.dataset.filter(e => e.category === category);
  }

  isCollectingNow(): boolean {
    return this.isCollecting;
  }

  getLastCollectionTime(): number {
    return this.lastCollectionTime;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private createEmptyStats(): DatasetStats {
    return {
      totalEntries: 0,
      byCategory: this.createEmptyCategoryCount(),
      totalTokens: 0,
      avgQuality: 0,
      avgImportance: 0,
      sizeInMB: 0,
      lastUpdate: 0,
    };
  }

  private createEmptyCategoryCount(): Record<DataCategory, number> {
    return {
      'super-prompt': 0,
      interaction: 0,
      'auto-heal': 0,
      introspection: 0,
      patch: 0,
      style: 0,
    };
  }

  private createPipelineSteps(): PipelineStep[] {
    return [
      {
        id: 1,
        name: 'Récupérer Memory Eternal',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 2,
        name: 'Récupérer super prompts',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 3,
        name: 'Extraire corrections dev',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 4,
        name: 'Extraire introspections Singularity',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 5,
        name: 'Extraire interactions IA',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 6,
        name: 'Filtrer bruit / doublons',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 7,
        name: 'Normaliser (input/output)',
        status: 'pending',
        progress: 0,
        message: '',
      },
      {
        id: 8,
        name: 'Structurer dataset JSONL',
        status: 'pending',
        progress: 0,
        message: '',
      },
      { id: 9, name: 'Nettoyer', status: 'pending', progress: 0, message: '' },
      { id: 10, name: 'Export', status: 'pending', progress: 0, message: '' },
    ];
  }

  private async executeStep(step: PipelineStep, fn: () => Promise<void>): Promise<void> {
    step.status = 'running';
    step.progress = 0;
    const start = Date.now();

    try {
      await fn();
      step.status = 'completed';
      step.progress = 100;
      step.duration = Date.now() - start;
      step.message = `✅ Completed in ${step.duration}ms`;
    } catch (error) {
      step.status = 'failed';
      step.progress = 0;
      step.message = `❌ ${error instanceof Error ? error.message : String(error)}`;
      throw error;
    }
  }

  private hashEntry(entry: DatasetEntry): string {
    // Simple hash pour détecter doublons
    const str = entry.prompt + '|' + entry.response;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  private parseInteraction(content: string): { question: string; answer: string } | null {
    // Parser format "Q: ... A: ..."
    const qMatch = content.match(/Q:\s*(.+?)\s*A:/s);
    const aMatch = content.match(/A:\s*(.+)/s);

    if (qMatch && aMatch) {
      return {
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
      };
    }

    return null;
  }

  private formatIntrospectionResponse(introspection: Record<string, unknown>): string {
    const internalVision = introspection.internalVision as Record<string, unknown>;
    const diagnostic = introspection.diagnostic as Record<string, unknown>;
    const futureVision = introspection.futureVision as Record<string, unknown>;
    const issues = diagnostic.issues as Array<Record<string, unknown>>;
    const improvements = futureVision.priorityImprovements as string[];

    return `## INTROSPECTION SINGULARITY

### Vision Interne
- Cohérence globale: ${internalVision.globalCoherence}%
- Moteurs actifs: ${internalVision.activeEngines}/${internalVision.totalEngines}
- Santé: ${diagnostic.health}

### Diagnostic
${issues
  .map((issue: Record<string, unknown>) => `- [${issue.severity}] ${issue.description}`)
  .join('\n')}

### Recommandations
${improvements.map((imp: string) => `- ${imp}`).join('\n')}
`;
  }

  private countByCategory(entries: DatasetEntry[]): Record<DataCategory, number> {
    const counts = this.createEmptyCategoryCount();
    entries.forEach(entry => {
      if (entry.category) {
        counts[entry.category]++;
      }
    });
    return counts;
  }

  private estimateTokens(entries: DatasetEntry[]): number {
    // Estimation: ~4 caractères = 1 token
    return entries.reduce((sum, entry) => {
      return sum + Math.ceil((entry.prompt.length + entry.response.length) / 4);
    }, 0);
  }

  private calculateAvgQuality(entries: DatasetEntry[]): number {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + (e.metadata?.quality || 0.7), 0);
    return sum / entries.length;
  }

  private calculateAvgImportance(entries: DatasetEntry[]): number {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + (e.metadata?.importance || 0.7), 0);
    return sum / entries.length;
  }

  private estimateSizeInMB(_entries: DatasetEntry[]): number {
    const jsonl = this.exportToJSONL();
    return jsonl.length / (1024 * 1024);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const dataCollector = new DataCollectorEngine();
export default dataCollector;
