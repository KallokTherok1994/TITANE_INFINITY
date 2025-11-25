/**
 * TITANE∞ v14.0 — Memory Compactor Service
 * ════════════════════════════════════════
 *
 * Service TypeScript pour compacter et valider la mémoire
 */

import { invoke } from '@tauri-apps/api/core';

export interface CompactionStats {
  files_processed: number;
  total_entries_before: number;
  total_entries_after: number;
  duplicates_removed: number;
  total_size_before_bytes: number;
  total_size_after_bytes: number;
  average_compression_ratio: number;
}

/**
 * Compacte un fichier mémoire spécifique
 */
export async function compactMemoryFile(path: string): Promise<string> {
  try {
    const result = await invoke<string>('compact_memory_file', { path });
    return result;
  } catch (error) {
    console.error('Failed to compact memory file:', error);
    throw error;
  }
}

/**
 * Compacte tous les fichiers d'un répertoire mémoire
 */
export async function compactMemoryDirectory(dir: string): Promise<CompactionStats> {
  try {
    const stats = await invoke<CompactionStats>('compact_memory_directory', { dir });
    return stats;
  } catch (error) {
    console.error('Failed to compact memory directory:', error);
    throw error;
  }
}

/**
 * Valide l'intégrité d'un fichier mémoire
 */
export async function validateMemoryFile(path: string): Promise<string> {
  try {
    const result = await invoke<string>('validate_memory_file', { path });
    return result;
  } catch (error) {
    console.error('Failed to validate memory file:', error);
    throw error;
  }
}

/**
 * Compacte automatiquement les répertoires standards (memory/, .titane/)
 */
export async function autoCompactMemory(): Promise<CompactionStats> {
  try {
    const stats = await invoke<CompactionStats>('auto_compact_memory');
    console.log('Auto-compact completed:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to auto-compact memory:', error);
    throw error;
  }
}

/**
 * Formatte les stats de compaction pour affichage
 */
export function formatCompactionStats(stats: CompactionStats): string {
  const sizeBefore = (stats.total_size_before_bytes / 1024).toFixed(2);
  const sizeAfter = (stats.total_size_after_bytes / 1024).toFixed(2);
  const saved = ((stats.total_size_before_bytes - stats.total_size_after_bytes) / 1024).toFixed(2);

  return `
📊 Compaction Results:
  • Files processed: ${stats.files_processed}
  • Entries: ${stats.total_entries_before} → ${stats.total_entries_after}
  • Duplicates removed: ${stats.duplicates_removed}
  • Size: ${sizeBefore} KB → ${sizeAfter} KB (saved ${saved} KB)
  • Compression: ${stats.average_compression_ratio.toFixed(2)}%
  `.trim();
}

/**
 * Vérifie si la mémoire nécessite un compactage
 */
export function needsCompaction(stats: CompactionStats): boolean {
  return (
    stats.duplicates_removed > 0 ||
    stats.average_compression_ratio > 10 ||
    stats.total_entries_before > stats.total_entries_after
  );
}
