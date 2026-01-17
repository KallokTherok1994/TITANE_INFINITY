/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — TIME/AGENDA ENGINE INDEX
 * Export centralisé des moteurs Time, Agenda, Energy, Priority
 * ═══════════════════════════════════════════════════════════════════
 */

// Types
export * from './types';

// TimeEngine
export { TimeEngine, timeEngine, TimeEngineUtils } from './TimeEngine';

// AgendaEngine
export { AgendaEngine, agendaEngine, AgendaEngineUtils } from './AgendaEngine';
export type { AgendaStorageCallbacks } from './AgendaEngine';

// EnergyEngine
export { EnergyEngine, energyEngine, EnergyEngineUtils } from './EnergyEngine';

// PriorityEngine
export { PriorityEngine, priorityEngine, PriorityEngineUtils } from './PriorityEngine';

// ChatScheduler
export { ChatScheduler, chatScheduler, ChatSchedulerUtils } from './ChatScheduler';
export type { CommandExecutionResult } from './ChatScheduler';

// ═══════════════════════════════════════════════════════════════════
// UNIFIED INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

import { timeEngine } from './TimeEngine';
import { agendaEngine, type AgendaStorageCallbacks } from './AgendaEngine';
import { energyEngine } from './EnergyEngine';
import { logger } from '@/utils/logger';

/**
 * Initialise tous les moteurs Time/Agenda en une seule fois
 */
export async function initTimeAgendaSystem(
  storage?: AgendaStorageCallbacks
): Promise<void> {
  logger?.debug('🚀 Initialisation du système...');

  // 1. TimeEngine (any: any)
  timeEngine?.init();

  // 2. EnergyEngine (any: any)
  energyEngine?.init();

  // 3. AgendaEngine (any: any)
  if (any: any) {
    agendaEngine?.setStorageCallbacks(any: any);
  }
  await agendaEngine?.init();

  logger?.debug('✅ Système initialisé avec succès');
}

/**
 * Arrête tous les moteurs Time/Agenda
 */
export function destroyTimeAgendaSystem(): void {
  logger?.debug('🛑 Arrêt du système...');
  timeEngine?.destroy();
  energyEngine?.destroy();
}
