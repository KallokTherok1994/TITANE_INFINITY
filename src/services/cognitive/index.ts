/**
 * COGNITIVE SERVICES INDEX
 * 
 * Point d'entrée principal pour tous les services cognitifs de TITANE∞
 * Facilite l'import et l'instanciation des moteurs
 */

// ==================== TYPES ====================
export * from './semanticMemory.types';
export * from './goalConsistency.types';
export * from './conversationEvaluation.types';
export * from './cognitiveObservability.types';

// ==================== ENGINES ====================
export { SemanticMemoryEngine, cosineSimilarity } from './SemanticMemoryEngine';
export { SQLiteVectorStore } from './SQLiteVectorStore';
export {
  LocalEmbeddingGenerator,
  createDefaultEmbeddingGenerator
} from './LocalEmbeddingGenerator';

// ==================== FACTORY FUNCTIONS ====================

import { SemanticMemoryEngine } from './SemanticMemoryEngine';
import { SQLiteVectorStore } from './SQLiteVectorStore';
import { LocalEmbeddingGenerator } from './LocalEmbeddingGenerator';
import type { SemanticMemoryConfig } from './semanticMemory.types';

/**
 * Créer une instance complète de Semantic Memory Engine
 * avec VectorStore et EmbeddingGenerator configurés
 */
export async function createSemanticMemoryEngine(options?: {
  dbPath?: string;
  modelName?: 'all-MiniLM-L6-v2' | 'all-mpnet-base-v2' | 'multilingual-e5-small';
  config?: Partial<SemanticMemoryConfig>;
}): Promise<SemanticMemoryEngine> {
  // Configuration par défaut
  const dbPath = options?.dbPath || './data/semantic_memory.db';
  const modelName = options?.modelName || 'all-MiniLM-L6-v2';
  const dimensions = modelName === 'all-mpnet-base-v2' ? 768 : 384;

  // Créer le VectorStore
  const vectorStore = new SQLiteVectorStore({
    dbPath,
    collectionName: 'memories',
    dimensions
  });

  // Créer l'EmbeddingGenerator
  const embeddingGenerator = new LocalEmbeddingGenerator({
    modelName,
    dimensions,
    pipelineOptions: { quantized: true },
    enableCache: true,
    maxCacheSize: 1000
  });

  // Créer l'engine
  const engine = new SemanticMemoryEngine(
    vectorStore,
    embeddingGenerator,
    options?.config
  );

  // Initialiser
  await engine.initialize();

  return engine;
}

/**
 * Configuration globale pour TITANE∞
 */
export interface TitaneCognitiveConfig {
  semanticMemory: {
    enabled: boolean;
    dbPath: string;
    modelName: 'all-MiniLM-L6-v2' | 'all-mpnet-base-v2' | 'multilingual-e5-small';
  };
  goalConsistency: {
    enabled: boolean;
    autoCheck: boolean;
    autoCorrect: boolean;
  };
  evaluation: {
    enabled: boolean;
    liveEvaluation: boolean;
  };
  observability: {
    enabled: boolean;
    mode: 'dev' | 'debug' | 'production';
    tracing: boolean;
  };
}

/**
 * Configuration par défaut pour développement
 */
export const DEFAULT_COGNITIVE_CONFIG: TitaneCognitiveConfig = {
  semanticMemory: {
    enabled: true,
    dbPath: './data/semantic_memory.db',
    modelName: 'all-MiniLM-L6-v2'
  },
  goalConsistency: {
    enabled: true,
    autoCheck: true,
    autoCorrect: false // Désactivé par défaut pour éviter surprises
  },
  evaluation: {
    enabled: true,
    liveEvaluation: false // CPU-intensive, désactivé par défaut
  },
  observability: {
    enabled: true,
    mode: 'dev',
    tracing: true
  }
};

/**
 * Configuration par défaut pour production
 */
export const PRODUCTION_COGNITIVE_CONFIG: TitaneCognitiveConfig = {
  semanticMemory: {
    enabled: true,
    dbPath: './data/semantic_memory.db',
    modelName: 'all-MiniLM-L6-v2'
  },
  goalConsistency: {
    enabled: true,
    autoCheck: true,
    autoCorrect: true
  },
  evaluation: {
    enabled: false, // Pas en production
    liveEvaluation: false
  },
  observability: {
    enabled: true,
    mode: 'production',
    tracing: false // Sampling uniquement
  }
};

/**
 * Helper: vérifier si les features cognitives sont disponibles
 */
export async function checkCognitiveAvailability(): Promise<{
  transformers: boolean;
  sqlite: boolean;
  overall: boolean;
}> {
  const results = {
    transformers: false,
    sqlite: false,
    overall: false
  };

  // Check Transformers.js
  try {
    await import('@xenova/transformers');
    results.transformers = true;
  } catch (error) {
    console.warn('[Cognitive] Transformers.js not available');
  }

  // Check better-sqlite3
  try {
    await import('better-sqlite3');
    results.sqlite = true;
  } catch (error) {
    console.warn('[Cognitive] better-sqlite3 not available');
  }

  results.overall = results.transformers && results.sqlite;

  return results;
}

/**
 * Log cognitive system status
 */
export function logCognitiveStatus(config: TitaneCognitiveConfig): void {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   🧠 TITANE∞ COGNITIVE SYSTEM STATUS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Semantic Memory:    ${config.semanticMemory.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`  Model: ${config.semanticMemory.modelName}`);
  console.log(`  DB: ${config.semanticMemory.dbPath}`);
  console.log(`Goal & Consistency: ${config.goalConsistency.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`  Auto-check: ${config.goalConsistency.autoCheck ? 'ON' : 'OFF'}`);
  console.log(`  Auto-correct: ${config.goalConsistency.autoCorrect ? 'ON' : 'OFF'}`);
  console.log(`Evaluation:         ${config.evaluation.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`  Live eval: ${config.evaluation.liveEvaluation ? 'ON' : 'OFF'}`);
  console.log(`Observability:      ${config.observability.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`  Mode: ${config.observability.mode.toUpperCase()}`);
  console.log(`  Tracing: ${config.observability.tracing ? 'ON' : 'OFF'}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}
