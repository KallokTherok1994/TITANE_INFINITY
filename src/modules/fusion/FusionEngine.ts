/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ FUSION ENGINE v∞
 *   Unified Dataset + Memory + Logs → Stable Learning Pipeline
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Super Prompt #17 — FUSION ENGINE
 *
 * Architecture unifiant 3 sources de données:
 * 1. Dataset brut (DataCollectorEngine)
 * 2. Mémoire persistente (Memory Eternal Engine)
 * 3. Logs système (LogEngine + UILogger + Evolution Collector)
 *
 * Pipeline de fusion en 10 étapes:
 * - Collecte unifiée
 * - Déduplication intelligente
 * - Compression cognitive
 * - Clustering par moteurs TITANE∞
 * - Export JSONL optimisé pour TITANE-LOCAL
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { DataCollectorEngine, type DatasetEntry, type DataCategory } from '@/modules/dataCollector/DataCollectorEngine';
import { MemoryEngine } from '@/cognitive/memory/memoryEngine';
import { getLogEngine } from '@/services/adminEngine/logEngine';
import { SingularityIntrospectionEngine } from '@/modules/singularity/SingularityIntrospectionEngine';
import type { LogEntry } from '@/lib/UILogger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES — FUSION STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

export type FusionSource = 'dataset' | 'memory' | 'logs' | 'singularity';

export type TitaneEngineCluster =
  | 'cognitive'          // Cognitive Engine, Memory, Learning
  | 'meta'               // Self-Healing, Auto-Improvement, Singularity
  | 'dev'                // Dev tools, Patches, Debug
  | 'audio'              // TTS, Voice, Audio
  | 'ui'                 // UI patterns, Components, Styles
  | 'data'               // Data collection, Training, Dataset
  | 'backend'            // Rust, Tauri commands, System
  | 'security'           // Security, Privacy, Encryption
  | 'performance'        // Optimization, Caching, Speed
  | 'integration'        // APIs, External services
  | 'prompt'             // Super Prompts, Interactions
  | 'evolution'          // Evolution metrics, Self-learning
  | 'sudo'               // SUDO commands, Admin
  | 'hybrid'             // Hybrid Engine (Dev + Chat)
  | 'governance'         // Governance, Rules, Policies
  | 'kernel'             // Core kernel, Foundation
  | 'persona'            // Persona, Identity
  | 'xp'                 // XP system, Achievements
  | 'admin'              // Admin tools, Logs
  | 'uncategorized';     // Autres

export interface FusionEntry extends DatasetEntry {
  fusionId: string;           // ID unique fusion
  sources: FusionSource[];    // Sources combinées
  cluster: TitaneEngineCluster; // Cluster moteur
  compressionRatio: number;   // Ratio compression cognitive
  semanticHash: string;       // Hash sémantique (dédupe)
  fusionTimestamp: number;    // Timestamp fusion
  originalCount: number;      // Nombre d'entrées originales fusionnées
}

export interface FusionStats {
  totalEntries: number;
  byClusters: Record<TitaneEngineCluster, number>;
  bySources: Record<FusionSource, number>;
  compressionRatio: number;   // Ratio global compression
  deduplicationRate: number;  // % entrées dédupliquées
  avgQuality: number;
  avgImportance: number;
  totalTokens: number;
  sizeInMB: number;
  lastFusion: number;
}

export interface FusionPipelineStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  duration?: number;
  itemsProcessed?: number;
}

export interface FusionReport {
  success: boolean;
  entriesFused: number;
  originalCount: number;
  compressionRatio: number;
  byClusters: Record<TitaneEngineCluster, number>;
  bySources: Record<FusionSource, number>;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: number;
  steps: FusionPipelineStep[];
}

export interface FusionConfig {
  enableMemorySync: boolean;
  enableLogsSync: boolean;
  enableDatasetSync: boolean;
  enableSingularitySync: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  deduplicationThreshold: number; // 0-1 (similarité sémantique)
  minQuality: number;             // 0-1
  minImportance: number;          // 0-1
  maxEntriesPerCluster: number;
  clusteringEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUSION ENGINE — MAIN CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class FusionEngine {
  private fusedDataset: FusionEntry[] = [];
  private stats: FusionStats = this.createEmptyStats();
  private config: FusionConfig;
  private isFusing: boolean = false;
  private lastFusionTime: number = 0;

  // Services externes
  private dataCollector: DataCollectorEngine;
  private logEngine = getLogEngine();

  // Storage key
  private readonly STORAGE_KEY = 'titane-fusion-dataset-v1';

  constructor(config?: Partial<FusionConfig>) {
    this.config = {
      enableMemorySync: true,
      enableLogsSync: true,
      enableDatasetSync: true,
      enableSingularitySync: true,
      compressionLevel: 'high',
      deduplicationThreshold: 0.85,
      minQuality: 0.5,
      minImportance: 0.4,
      maxEntriesPerCluster: 500,
      clusteringEnabled: true,
      ...config,
    };

    this.dataCollector = new DataCollectorEngine();
    this.loadFusedDataset();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FUSION PIPELINE (10 ÉTAPES)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * FUSION_PIPELINE() — Pipeline complet de fusion
   */
  async runFusionPipeline(): Promise<FusionReport> {
    if (this.isFusing) {
      throw new Error('Fusion already in progress');
    }

    this.isFusing = true;
    const startTime = Date.now();
    const steps = this.createPipelineSteps();
    const errors: string[] = [];
    const warnings: string[] = [];
    const tempDataset: FusionEntry[] = [];
    const originalDataMap = new Map<FusionSource, DatasetEntry[]>();

    try {
      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: Charger mémoire persistente (Memory Eternal)
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[0], async () => {
        if (!this.config.enableMemorySync) {
          steps[0].message = 'Skipped (disabled)';
          return;
        }

        try {
          await MemoryEngine.initialize();
          const memories = await MemoryEngine.getAll();

          const memoryEntries: DatasetEntry[] = memories.map(mem => ({
            prompt: `Rappelle-toi: ${mem.content.substring(0, 100)}`,
            response: mem.content,
            category: this.categorizeMemo(mem.type),
            metadata: {
              source: 'memory-eternal',
              timestamp: mem.timestamp,
              quality: mem.strength || 0.7,
              importance: mem.importance || 0.6,
              tags: mem.tags || [],
              originEngine: 'MemoryEternalEngine',
            },
          }));

          originalDataMap.set('memory', memoryEntries);
          steps[0].itemsProcessed = memoryEntries.length;
        } catch (error) {
          warnings.push(`Memory sync partial: ${error}`);
        }
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: Collecter logs IA + logs dev + logs système
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[1], async () => {
        if (!this.config.enableLogsSync) {
          steps[1].message = 'Skipped (disabled)';
          return;
        }

        try {
          const logEntries = await this.collectLogs();
          originalDataMap.set('logs', logEntries);
          steps[1].itemsProcessed = logEntries.length;
        } catch (error) {
          warnings.push(`Logs sync failed: ${error}`);
        }
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: Extraire dataset précédent (DataCollectorEngine)
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[2], async () => {
        if (!this.config.enableDatasetSync) {
          steps[2].message = 'Skipped (disabled)';
          return;
        }

        const existingDataset = this.dataCollector.getDataset();
        originalDataMap.set('dataset', existingDataset);
        steps[2].itemsProcessed = existingDataset.length;
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: Collecter introspections Singularity
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[3], async () => {
        if (!this.config.enableSingularitySync) {
          steps[3].message = 'Skipped (disabled)';
          return;
        }

        try {
          const singularityEntries = await this.collectSingularityData();
          originalDataMap.set('singularity', singularityEntries);
          steps[3].itemsProcessed = singularityEntries.length;
        } catch (error) {
          warnings.push(`Singularity sync failed: ${error}`);
        }
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: Fusionner les trois sources (MEMORY × LOGS × DATASET)
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[4], async () => {
        for (const [source, entries] of originalDataMap.entries()) {
          for (const entry of entries) {
            const fusionEntry = this.convertToFusionEntry(entry, [source as FusionSource]);
            tempDataset.push(fusionEntry);
          }
        }
        steps[4].itemsProcessed = tempDataset.length;
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: Nettoyer (retirer bruit, répétitions, normaliser)
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[5], async () => {
        const beforeCount = tempDataset.length;
        const cleaned = this.cleanDataset(tempDataset);
        tempDataset.length = 0;
        tempDataset.push(...cleaned);
        const removed = beforeCount - tempDataset.length;
        steps[5].itemsProcessed = removed;
        if (removed > 0) {
          steps[5].message = `${removed} entrées nettoyées`;
        }
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: Dédupliquer (sémantique + hash)
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[6], async () => {
        const beforeCount = tempDataset.length;
        const deduplicated = this.deduplicateDataset(tempDataset);
        tempDataset.length = 0;
        tempDataset.push(...deduplicated);
        const removed = beforeCount - tempDataset.length;
        steps[6].itemsProcessed = removed;
        if (removed > 0) {
          steps[6].message = `${removed} duplications supprimées`;
        }
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 8: Compresser cognitivement
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[7], async () => {
        const compressed = await this.compressDataset(tempDataset);
        const compressionRatio = 1 - (compressed.length / tempDataset.length);
        tempDataset.length = 0;
        tempDataset.push(...compressed);
        steps[7].itemsProcessed = Math.round(compressionRatio * 100);
        steps[7].message = `Compression ${steps[7].itemsProcessed}%`;
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 9: Clustering par moteurs TITANE∞
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[8], async () => {
        if (!this.config.clusteringEnabled) {
          steps[8].message = 'Skipped (disabled)';
          return;
        }

        for (const entry of tempDataset) {
          entry.cluster = this.assignCluster(entry);
        }

        // Limiter par cluster
        const clustered = this.limitPerCluster(tempDataset);
        tempDataset.length = 0;
        tempDataset.push(...clustered);
        steps[8].itemsProcessed = tempDataset.length;
      });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 10: Exporter dataset final
      // ─────────────────────────────────────────────────────────────────────
      await this.executeStep(steps[9], async () => {
        this.fusedDataset = [...tempDataset];
        this.updateStats();
        await this.saveFusedDataset();
        this.lastFusionTime = Date.now();
        steps[9].itemsProcessed = this.fusedDataset.length;
      });

      // ─────────────────────────────────────────────────────────────────────
      // RAPPORT FINAL
      // ─────────────────────────────────────────────────────────────────────
      const originalCount = Array.from(originalDataMap.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      const report: FusionReport = {
        success: true,
        entriesFused: this.fusedDataset.length,
        originalCount,
        compressionRatio: 1 - (this.fusedDataset.length / originalCount),
        byClusters: this.countByClusters(this.fusedDataset),
        bySources: this.countBySources(this.fusedDataset),
        errors,
        warnings,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        steps,
      };

      return report;
    } catch (error) {
      errors.push(`Fusion pipeline error: ${error}`);
      return {
        success: false,
        entriesFused: 0,
        originalCount: 0,
        compressionRatio: 0,
        byClusters: {} as Record<TitaneEngineCluster, number>,
        bySources: {} as Record<FusionSource, number>,
        errors,
        warnings,
        duration: Date.now() - startTime,
        timestamp: Date.now(),
        steps,
      };
    } finally {
      this.isFusing = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COLLECTEURS PAR SOURCE
  // ═══════════════════════════════════════════════════════════════════════

  private async collectLogs(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    try {
      const logs = await this.logEngine.getLogs({ limit: 500 });

      for (const log of logs) {
        // Filtrer logs utiles (errors, warnings, key events)
        if (log.level === 'debug') continue;

        entries.push({
          prompt: `Que s'est-il passé ici ?`,
          response: log.message,
          category: 'auto-heal',
          metadata: {
            source: 'log-engine',
            timestamp: log.timestamp,
            quality: log.level === 'error' ? 0.9 : 0.6,
            importance: log.level === 'error' ? 0.95 : 0.5,
            tags: ['log', log.level, log.category || 'system'],
            originEngine: 'LogEngine',
          },
        });
      }
    } catch (error) {
      console.warn('[FusionEngine] Log collection failed:', error);
    }

    return entries;
  }

  private async collectSingularityData(): Promise<DatasetEntry[]> {
    const entries: DatasetEntry[] = [];

    try {
      const introspection = SingularityIntrospectionEngine.getState();

      if (introspection) {
        entries.push({
          prompt: 'Introspection du système TITANE∞',
          response: JSON.stringify(introspection, null, 2),
          category: 'introspection',
          metadata: {
            source: 'singularity-engine',
            timestamp: Date.now(),
            quality: 0.95,
            importance: 0.9,
            tags: ['introspection', 'singularity', 'meta'],
            originEngine: 'SingularityIntrospectionEngine',
          },
        });
      }
    } catch (error) {
      console.warn('[FusionEngine] Singularity collection failed:', error);
    }

    return entries;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COMPRESSION COGNITIVE
  // ═══════════════════════════════════════════════════════════════════════

  private async compressDataset(entries: FusionEntry[]): Promise<FusionEntry[]> {
    const compressionLevel = this.config.compressionLevel;

    // Pour chaque cluster, grouper les entrées similaires
    const clusterMap = new Map<TitaneEngineCluster, FusionEntry[]>();

    for (const entry of entries) {
      const cluster = entry.cluster;
      if (!clusterMap.has(cluster)) {
        clusterMap.set(cluster, []);
      }
      clusterMap.get(cluster)!.push(entry);
    }

    const compressed: FusionEntry[] = [];

    for (const [cluster, clusterEntries] of clusterMap.entries()) {
      // Regrouper par similarité sémantique
      const groups = this.groupBySimilarity(clusterEntries);

      for (const group of groups) {
        if (group.length === 1) {
          compressed.push(group[0]);
        } else {
          // Fusionner groupe en une seule entrée
          const merged = this.mergeEntries(group);
          compressed.push(merged);
        }
      }
    }

    return compressed;
  }

  private groupBySimilarity(entries: FusionEntry[]): FusionEntry[][] {
    const groups: FusionEntry[][] = [];
    const used = new Set<string>();

    for (const entry of entries) {
      if (used.has(entry.fusionId)) continue;

      const group = [entry];
      used.add(entry.fusionId);

      // Trouver entrées similaires
      for (const other of entries) {
        if (used.has(other.fusionId)) continue;
        if (this.calculateSimilarity(entry, other) >= this.config.deduplicationThreshold) {
          group.push(other);
          used.add(other.fusionId);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private mergeEntries(entries: FusionEntry[]): FusionEntry {
    const first = entries[0];
    const allSources = new Set<FusionSource>();
    let totalOriginalCount = 0;

    for (const entry of entries) {
      for (const source of entry.sources) {
        allSources.add(source);
      }
      totalOriginalCount += entry.originalCount;
    }

    // Combiner responses
    const combinedResponse = entries.map(e => e.response).join('\n\n---\n\n');

    return {
      ...first,
      response: combinedResponse,
      sources: Array.from(allSources),
      originalCount: totalOriginalCount,
      compressionRatio: entries.length / totalOriginalCount,
      fusionTimestamp: Date.now(),
      metadata: {
        ...first.metadata,
        importance: Math.max(...entries.map(e => e.metadata?.importance || 0)),
        quality: entries.reduce((sum, e) => sum + (e.metadata?.quality || 0), 0) / entries.length,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NETTOYAGE & DÉDUPLICATION
  // ═══════════════════════════════════════════════════════════════════════

  private cleanDataset(entries: FusionEntry[]): FusionEntry[] {
    return entries.filter(entry => {
      // Retirer entrées vides
      if (!entry.prompt || !entry.response) return false;
      if (entry.prompt.length < 10 || entry.response.length < 20) return false;

      // Filtrer par qualité
      const quality = entry.metadata?.quality || 0;
      const importance = entry.metadata?.importance || 0;

      return quality >= this.config.minQuality && importance >= this.config.minImportance;
    });
  }

  private deduplicateDataset(entries: FusionEntry[]): FusionEntry[] {
    const seen = new Map<string, FusionEntry>();

    for (const entry of entries) {
      const hash = entry.semanticHash;

      if (!seen.has(hash)) {
        seen.set(hash, entry);
      } else {
        // Fusionner sources
        const existing = seen.get(hash)!;
        const mergedSources = Array.from(
          new Set([...existing.sources, ...entry.sources])
        );
        existing.sources = mergedSources;
        existing.originalCount += entry.originalCount;
      }
    }

    return Array.from(seen.values());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLUSTERING & CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════════════

  private assignCluster(entry: FusionEntry): TitaneEngineCluster {
    const content = (entry.prompt + ' ' + entry.response).toLowerCase();
    const tags = entry.metadata?.tags || [];
    const originEngine = entry.metadata?.originEngine || '';

    // Clustering par mots-clés
    if (
      content.includes('memory') ||
      content.includes('mémoire') ||
      content.includes('recall') ||
      originEngine.includes('Memory')
    )
      return 'cognitive';

    if (
      content.includes('singularity') ||
      content.includes('introspection') ||
      content.includes('self-heal') ||
      tags.includes('auto-heal')
    )
      return 'meta';

    if (
      content.includes('patch') ||
      content.includes('debug') ||
      content.includes('fix') ||
      tags.includes('dev')
    )
      return 'dev';

    if (content.includes('tts') || content.includes('audio') || content.includes('voice'))
      return 'audio';

    if (content.includes('ui') || content.includes('component') || content.includes('style'))
      return 'ui';

    if (content.includes('dataset') || content.includes('training') || content.includes('data'))
      return 'data';

    if (content.includes('rust') || content.includes('tauri') || content.includes('backend'))
      return 'backend';

    if (content.includes('security') || content.includes('encryption'))
      return 'security';

    if (content.includes('performance') || content.includes('optimization'))
      return 'performance';

    if (content.includes('api') || content.includes('integration'))
      return 'integration';

    if (content.includes('super prompt') || content.includes('interaction'))
      return 'prompt';

    if (content.includes('evolution') || content.includes('learning'))
      return 'evolution';

    if (content.includes('sudo') || tags.includes('sudo'))
      return 'sudo';

    if (content.includes('hybrid') || originEngine.includes('Hybrid'))
      return 'hybrid';

    if (content.includes('governance') || content.includes('policy'))
      return 'governance';

    if (content.includes('kernel') || content.includes('core'))
      return 'kernel';

    if (content.includes('persona') || content.includes('identity'))
      return 'persona';

    if (content.includes('xp') || content.includes('achievement'))
      return 'xp';

    if (content.includes('admin') || content.includes('log'))
      return 'admin';

    return 'uncategorized';
  }

  private limitPerCluster(entries: FusionEntry[]): FusionEntry[] {
    const clusterMap = new Map<TitaneEngineCluster, FusionEntry[]>();

    // Grouper par cluster
    for (const entry of entries) {
      if (!clusterMap.has(entry.cluster)) {
        clusterMap.set(entry.cluster, []);
      }
      clusterMap.get(entry.cluster)!.push(entry);
    }

    const limited: FusionEntry[] = [];

    // Limiter chaque cluster
    for (const [cluster, clusterEntries] of clusterMap.entries()) {
      // Trier par importance
      const sorted = clusterEntries.sort(
        (a, b) => (b.metadata?.importance || 0) - (a.metadata?.importance || 0)
      );

      // Prendre top N
      const top = sorted.slice(0, this.config.maxEntriesPerCluster);
      limited.push(...top);
    }

    return limited;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXPORT JSONL
  // ═══════════════════════════════════════════════════════════════════════

  exportToJSONL(): string {
    return this.fusedDataset
      .map(entry => {
        const jsonlEntry = {
          prompt: entry.prompt,
          response: entry.response,
        };
        return JSON.stringify(jsonlEntry);
      })
      .join('\n');
  }

  exportFusionMetadata(): string {
    return JSON.stringify(
      {
        stats: this.stats,
        config: this.config,
        lastFusion: this.lastFusionTime,
        entries: this.fusedDataset.map(e => ({
          fusionId: e.fusionId,
          cluster: e.cluster,
          sources: e.sources,
          compressionRatio: e.compressionRatio,
          originalCount: e.originalCount,
        })),
      },
      null,
      2
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════

  private convertToFusionEntry(entry: DatasetEntry, sources: FusionSource[]): FusionEntry {
    return {
      ...entry,
      fusionId: this.generateFusionId(),
      sources,
      cluster: 'uncategorized',
      compressionRatio: 1,
      semanticHash: this.computeSemanticHash(entry),
      fusionTimestamp: Date.now(),
      originalCount: 1,
    };
  }

  private generateFusionId(): string {
    return `fusion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private computeSemanticHash(entry: DatasetEntry): string {
    const content = (entry.prompt + entry.response).toLowerCase().trim();
    // Hash simple (CRC32-like)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash-${Math.abs(hash).toString(36)}`;
  }

  private calculateSimilarity(a: FusionEntry, b: FusionEntry): number {
    // Similarité basique (Jaccard sur tokens)
    const tokensA = new Set(
      (a.prompt + ' ' + a.response).toLowerCase().split(/\s+/)
    );
    const tokensB = new Set(
      (b.prompt + ' ' + b.response).toLowerCase().split(/\s+/)
    );

    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return intersection.size / union.size;
  }

  private categorizeMemo(memType: string): DataCategory {
    if (memType.includes('code') || memType.includes('patch')) return 'patch';
    if (memType.includes('heal')) return 'auto-heal';
    if (memType.includes('interaction')) return 'interaction';
    return 'style';
  }

  private async executeStep(
    step: FusionPipelineStep,
    fn: () => Promise<void>
  ): Promise<void> {
    step.status = 'running';
    step.progress = 0;
    const start = Date.now();

    try {
      await fn();
      step.status = 'completed';
      step.progress = 100;
      step.duration = Date.now() - start;
    } catch (error) {
      step.status = 'failed';
      step.message = `Error: ${error}`;
      throw error;
    }
  }

  private createPipelineSteps(): FusionPipelineStep[] {
    return [
      { id: 1, name: 'Charger Memory Eternal', status: 'pending', progress: 0, message: '' },
      { id: 2, name: 'Collecter Logs', status: 'pending', progress: 0, message: '' },
      { id: 3, name: 'Extraire Dataset', status: 'pending', progress: 0, message: '' },
      { id: 4, name: 'Collecter Singularity', status: 'pending', progress: 0, message: '' },
      { id: 5, name: 'Fusionner Sources', status: 'pending', progress: 0, message: '' },
      { id: 6, name: 'Nettoyer Dataset', status: 'pending', progress: 0, message: '' },
      { id: 7, name: 'Dédupliquer', status: 'pending', progress: 0, message: '' },
      { id: 8, name: 'Compresser Cognitivement', status: 'pending', progress: 0, message: '' },
      { id: 9, name: 'Clustering Moteurs', status: 'pending', progress: 0, message: '' },
      { id: 10, name: 'Exporter Final', status: 'pending', progress: 0, message: '' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STATS & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════

  private createEmptyStats(): FusionStats {
    return {
      totalEntries: 0,
      byClusters: {} as Record<TitaneEngineCluster, number>,
      bySources: {} as Record<FusionSource, number>,
      compressionRatio: 0,
      deduplicationRate: 0,
      avgQuality: 0,
      avgImportance: 0,
      totalTokens: 0,
      sizeInMB: 0,
      lastFusion: 0,
    };
  }

  private updateStats(): void {
    this.stats = {
      totalEntries: this.fusedDataset.length,
      byClusters: this.countByClusters(this.fusedDataset),
      bySources: this.countBySources(this.fusedDataset),
      compressionRatio:
        this.fusedDataset.reduce((sum, e) => sum + e.compressionRatio, 0) /
        this.fusedDataset.length,
      deduplicationRate: 0, // Calculé lors fusion
      avgQuality:
        this.fusedDataset.reduce((sum, e) => sum + (e.metadata?.quality || 0), 0) /
        this.fusedDataset.length,
      avgImportance:
        this.fusedDataset.reduce((sum, e) => sum + (e.metadata?.importance || 0), 0) /
        this.fusedDataset.length,
      totalTokens: this.estimateTokens(this.fusedDataset),
      sizeInMB: this.estimateSizeInMB(this.fusedDataset),
      lastFusion: this.lastFusionTime,
    };
  }

  private countByClusters(entries: FusionEntry[]): Record<TitaneEngineCluster, number> {
    const counts: Partial<Record<TitaneEngineCluster, number>> = {};
    for (const entry of entries) {
      counts[entry.cluster] = (counts[entry.cluster] || 0) + 1;
    }
    return counts as Record<TitaneEngineCluster, number>;
  }

  private countBySources(entries: FusionEntry[]): Record<FusionSource, number> {
    const counts: Partial<Record<FusionSource, number>> = {};
    for (const entry of entries) {
      for (const source of entry.sources) {
        counts[source] = (counts[source] || 0) + 1;
      }
    }
    return counts as Record<FusionSource, number>;
  }

  private estimateTokens(entries: FusionEntry[]): number {
    const totalChars = entries.reduce(
      (sum, e) => sum + e.prompt.length + e.response.length,
      0
    );
    return Math.round(totalChars / 4); // ~4 chars = 1 token
  }

  private estimateSizeInMB(entries: FusionEntry[]): number {
    const jsonString = JSON.stringify(entries);
    return jsonString.length / (1024 * 1024);
  }

  private async saveFusedDataset(): Promise<void> {
    try {
      const data = {
        dataset: this.fusedDataset,
        stats: this.stats,
        config: this.config,
        lastFusion: this.lastFusionTime,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[FusionEngine] Save failed:', error);
    }
  }

  private loadFusedDataset(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.fusedDataset = data.dataset || [];
        this.stats = data.stats || this.createEmptyStats();
        this.lastFusionTime = data.lastFusion || 0;
      }
    } catch (error) {
      console.warn('[FusionEngine] Load failed:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════

  getStats(): FusionStats {
    return { ...this.stats };
  }

  getFusedDataset(): FusionEntry[] {
    return [...this.fusedDataset];
  }

  getDatasetByCluster(cluster: TitaneEngineCluster): FusionEntry[] {
    return this.fusedDataset.filter(e => e.cluster === cluster);
  }

  getDatasetBySource(source: FusionSource): FusionEntry[] {
    return this.fusedDataset.filter(e => e.sources.includes(source));
  }

  isFusingNow(): boolean {
    return this.isFusing;
  }

  getLastFusionTime(): number {
    return this.lastFusionTime;
  }

  clearFusedDataset(): void {
    this.fusedDataset = [];
    this.stats = this.createEmptyStats();
    this.lastFusionTime = 0;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const fusionEngine = new FusionEngine();
export default fusionEngine;
