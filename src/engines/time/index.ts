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

/**
 * Initialise tous les moteurs Time/Agenda en une seule fois
 */
export async function initTimeAgendaSystem(storage?: AgendaStorageCallbacks): Promise<void> {
  console.log('[TimeAgendaSystem] 🚀 Initialisation du système...');

  // 1. TimeEngine (synchrone)
  timeEngine.init();

  // 2. EnergyEngine (synchrone)
  energyEngine.init();

  // 3. AgendaEngine (asynchrone - charge les événements)
  if (storage) {
    agendaEngine.setStorageCallbacks(storage);
  }
  await agendaEngine.init();

  console.log('[TimeAgendaSystem] ✅ Système initialisé avec succès');
}

/**
 * Arrête tous les moteurs Time/Agenda
 */
export function destroyTimeAgendaSystem(): void {
  console.log('[TimeAgendaSystem] 🛑 Arrêt du système...');
  timeEngine.destroy();
  energyEngine.destroy();
}
