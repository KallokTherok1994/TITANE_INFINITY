/**
 * TITANE_INFINITY v19.5.3 - Backend Client
 *
 * Client TypeScript unifié pour interagir avec le backend Rust via Tauri
 * Fournit une API type-safe pour toutes les opérations backend
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  VectorStoreConfig,
  VectorEntry,
  SearchResult,
  SearchOptions,
  VectorStoreStats,
  HealReport,
  IARequest,
  IAResponse,
  OrchestratorRequest,
  OrchestratorResponse,
  SystemStatus,
  HeliosMetrics,
  AppSettings,
  DiagnosticReport,
  FileReadResult,
  FileWriteResult,
} from '@/types/backend.d';

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si SQLite est disponible côté backend
 */
export async function checkSqliteAvailable(): Promise<boolean> {
  return invoke<boolean>('check_sqlite_available');
}

/**
 * Obtient le statut système
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  return invoke<SystemStatus>('get_system_status');
}

/**
 * Obtient les métriques Helios (CPU, mémoire, disque)
 */
export async function getHeliosMetrics(): Promise<HeliosMetrics> {
  return invoke<HeliosMetrics>('helios_get_metrics');
}

// ═══════════════════════════════════════════════════════════════════════════
// VECTOR STORE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialise un VectorStore
 */
export async function vectorStoreInit(config: VectorStoreConfig): Promise<string> {
  return invoke<string>('vector_store_init', { config });
}

/**
 * Insère une entrée dans le VectorStore
 */
export async function vectorStoreInsert(
  storeId: string,
  entry: VectorEntry
): Promise<void> {
  return invoke<void>('vector_store_insert', { storeId, entry });
}

/**
 * Recherche vectorielle par similarité
 */
export async function vectorSearch(
  storeId: string,
  embedding: number[],
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return invoke<SearchResult[]>('vector_search', { storeId, embedding, options });
}

/**
 * Obtient une entrée par ID
 */
export async function vectorStoreGet(
  storeId: string,
  id: string
): Promise<VectorEntry | null> {
  return invoke<VectorEntry | null>('vector_store_get', { storeId, id });
}

/**
 * Met à jour une entrée
 */
export async function vectorStoreUpdate(
  storeId: string,
  id: string,
  updates: Partial<VectorEntry>
): Promise<void> {
  return invoke<void>('vector_store_update', { storeId, id, updates });
}

/**
 * Supprime une entrée
 */
export async function vectorStoreDelete(storeId: string, id: string): Promise<void> {
  return invoke<void>('vector_store_delete', { storeId, id });
}

/**
 * Obtient les statistiques du VectorStore
 */
export async function vectorStoreGetStats(storeId: string): Promise<VectorStoreStats> {
  return invoke<VectorStoreStats>('vector_store_get_stats', { storeId });
}

// ═══════════════════════════════════════════════════════════════════════════
// HEAL ENGINE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lance un cycle d'auto-guérison
 */
export async function runSelfHeal(): Promise<HealReport> {
  return invoke<HealReport>('selfheal_run');
}

/**
 * Obtient le dernier rapport de guérison
 */
export async function getSelfHealData(): Promise<HealReport> {
  return invoke<HealReport>('selfheal_get_data');
}

// ═══════════════════════════════════════════════════════════════════════════
// AI ENGINE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Envoie une requête à l'engine IA unifié
 */
export async function iaQuery(request: IARequest): Promise<IAResponse> {
  return invoke<IAResponse>('ia_unified_query', { request });
}

/**
 * Vérifie la disponibilité d'un provider IA
 */
export async function iaCheckProvider(provider: string): Promise<boolean> {
  return invoke<boolean>('ia_check_provider', { provider });
}

/**
 * Liste les modèles disponibles
 */
export async function iaListModels(provider?: string): Promise<string[]> {
  return invoke<string[]>('ia_list_models', { provider });
}

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Envoie une requête à l'orchestrateur
 */
export async function orchestrate(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  return invoke<OrchestratorResponse>('orchestrate', { request });
}

/**
 * Change le mode de l'orchestrateur
 */
export async function setOrchestratorMode(mode: string): Promise<void> {
  return invoke<void>('set_orchestrator_mode', { mode });
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE SYSTEM API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lit un fichier texte
 */
export async function readTextFile(path: string): Promise<FileReadResult> {
  return invoke<FileReadResult>('read_text_file', { path });
}

/**
 * Écrit un fichier texte
 */
export async function writeTextFile(
  path: string,
  content: string
): Promise<FileWriteResult> {
  return invoke<FileWriteResult>('write_text_file', { path, content });
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(path: string): Promise<boolean> {
  return invoke<boolean>('file_exists', { path });
}

/**
 * Liste les fichiers d'un répertoire
 */
export async function listDirectory(path: string): Promise<string[]> {
  return invoke<string[]>('list_directory', { path });
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtient les paramètres de l'application
 */
export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>('get_settings');
}

/**
 * Met à jour les paramètres
 */
export async function updateSettings(settings: Partial<AppSettings>): Promise<void> {
  return invoke<void>('update_settings', { settings });
}

/**
 * Réinitialise les paramètres par défaut
 */
export async function resetSettings(): Promise<void> {
  return invoke<void>('reset_settings');
}

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTICS API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lance un diagnostic complet
 */
export async function runDiagnostics(): Promise<DiagnosticReport> {
  return invoke<DiagnosticReport>('run_diagnostics');
}

/**
 * Obtient les logs watchdog
 */
export async function getWatchdogLogs(limit?: number): Promise<string[]> {
  return invoke<string[]>('watchdog_get_logs', { limit });
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sauvegarde une entrée mémoire
 */
export async function memorySaveEntry(entry: VectorEntry): Promise<void> {
  return invoke<void>('memory_save_entry', { entry });
}

/**
 * Charge toutes les entrées mémoire
 */
export async function memoryLoadEntries(): Promise<VectorEntry[]> {
  return invoke<VectorEntry[]>('memory_load_entries');
}

/**
 * Efface la mémoire
 */
export async function memoryClear(): Promise<void> {
  return invoke<void>('memory_clear');
}

/**
 * Compacte la mémoire
 */
export async function memoryCompact(): Promise<{ cleaned: number; size_mb: number }> {
  return invoke<{ cleaned: number; size_mb: number }>('memory_compact');
}

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtient le graphe cognitif Nexus
 */
export async function getNexusGraph(): Promise<{
  nodes: Array<{ id: string; label: string; type: string; weight: number }>;
  edges: Array<{ source: string; target: string; weight: number; type: string }>;
}> {
  return invoke('nexus_get_graph');
}

/**
 * Obtient les alertes Sentinel
 */
export async function getSentinelAlerts(): Promise<
  Array<{
    id: string;
    severity: string;
    message: string;
    timestamp: number;
  }>
> {
  return invoke('sentinel_get_alerts');
}

/**
 * Obtient les flux Harmonia
 */
export async function getHarmoniaFlows(): Promise<{
  balance: number;
  flows: Array<{ name: string; value: number }>;
}> {
  return invoke('harmonia_get_flows');
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si le backend Tauri est disponible
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await invoke('get_system_status');
    return true;
  } catch {
    return false;
  }
}

/**
 * Wrapper avec retry pour les appels backend
 */
export async function invokeWithRetry<T>(
  command: string,
  args: Record<string, unknown> = {},
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await invoke<T>(command, args);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw (
    lastError ?? new Error(`Failed to invoke ${command} after ${maxRetries} attempts`)
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export const BackendClient = {
  // System
  checkSqliteAvailable,
  getSystemStatus,
  getHeliosMetrics,
  isBackendAvailable,

  // Vector Store
  vectorStoreInit,
  vectorStoreInsert,
  vectorSearch,
  vectorStoreGet,
  vectorStoreUpdate,
  vectorStoreDelete,
  vectorStoreGetStats,

  // Heal Engine
  runSelfHeal,
  getSelfHealData,

  // AI Engine
  iaQuery,
  iaCheckProvider,
  iaListModels,

  // Orchestrator
  orchestrate,
  setOrchestratorMode,

  // File System
  readTextFile,
  writeTextFile,
  fileExists,
  listDirectory,

  // Settings
  getSettings,
  updateSettings,
  resetSettings,

  // Diagnostics
  runDiagnostics,
  getWatchdogLogs,

  // Memory
  memorySaveEntry,
  memoryLoadEntries,
  memoryClear,
  memoryCompact,

  // Cognitive
  getNexusGraph,
  getSentinelAlerts,
  getHarmoniaFlows,

  // Utilities
  invokeWithRetry,
};

export default BackendClient;
