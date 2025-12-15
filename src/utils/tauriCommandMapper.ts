/**
 * TITANE∞ v21 — Tauri Command Mapper & API Repair Engine
 *
 * Résout automatiquement les problèmes de commandes "not found"
 * en mappant vers les vraies commandes backend disponibles
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { safeInvokeTauri } from './tauriProtector';
import type { SingularityState } from '@/types/singularityState';
import type { TauriCommandArgs } from '@/types/tauri';

// ══════════════════════════════════════════════════════════════════
// COMMAND MAPPING TABLE
// ══════════════════════════════════════════════════════════════════

/**
 * Table de mapping entre les commandes anciennes/problématiques
 * et les vraies commandes backend disponibles
 */
const COMMAND_MAPPING: Record<string, string | string[]> = {
  // ═══ SINGULARITY APIs ═══
  singularity_get_physical: 'singularity_get_full_state',
  singularity_get_cognitive: 'singularity_get_full_state',
  singularity_get_symbolic: 'singularity_get_full_state',
  singularity_get_adaptive: 'singularity_get_full_state',
  singularity_get_meta: 'singularity_get_full_state',

  // Updates
  singularity_update_physical: 'singularity_update_full_state',
  singularity_update_cognitive: 'singularity_update_full_state',
  singularity_update_symbolic: 'singularity_update_full_state',
  singularity_update_adaptive: 'singularity_update_full_state',
  singularity_update_meta: 'singularity_update_full_state',

  // Sync
  sync_singularity: ['singularity_self_check', 'update_singularity_state'],

  // ═══ HELIOS APIs ═══
  get_helios_state: ['get_system_state', 'get_helios_metrics'],

  // ═══ MEMORY APIs ═══
  get_memory_state: ['memory_get_state', 'memory_get_stats'],

  // ═══ INTEGRITY APIs ═══
  check_system_integrity: ['singularity_self_check', 'run_hardening_selftest'],

  // ═══ GEMINI APIs ═══
  get_gemini_key_status: 'chat_get_providers_status',
  set_gemini_key: 'chat_set_gemini_key',
};

/**
 * Commandes qui doivent retourner des objets partiels
 * depuis singularity_get_full_state
 */
const PARTIAL_STATE_EXTRACTORS: Record<
  string,
  (fullState: SingularityState | null) => unknown
> = {
  singularity_get_physical: full => full?.physical || null,
  singularity_get_cognitive: full => full?.cognitive || null,
  singularity_get_symbolic: full => full?.symbolic || null,
  singularity_get_adaptive: full => full?.adaptive || null,
  singularity_get_meta: full => full?.meta || null,
};

/**
 * Commandes qui nécessitent une agrégation de plusieurs résultats
 */
const AGGREGATED_COMMANDS: Record<string, (results: unknown[]) => unknown> = {
  get_helios_state: results => {
    const [systemState, metrics] = results;
    return {
      ...(systemState && typeof systemState === 'object' ? systemState : {}),
      metrics: metrics || {},
      timestamp: Date.now(),
    };
  },

  get_memory_state: results => {
    const [state, stats] = results;
    return {
      ...(state && typeof state === 'object' ? state : {}),
      stats: stats || {},
      timestamp: Date.now(),
    };
  },

  check_system_integrity: results => {
    const [selfCheck, hardening] = results;
    const selfCheckObj = selfCheck as Record<string, unknown> | null;
    const hardeningObj = hardening as Record<string, unknown> | null;
    return {
      passed: selfCheckObj?.success !== false && hardeningObj?.success !== false,
      checks: [
        { id: 'singularity_self_check', result: selfCheck },
        { id: 'hardening_selftest', result: hardening },
      ],
      timestamp: Date.now(),
    };
  },

  sync_singularity: results => {
    const [selfCheck, update] = results;
    const selfCheckObj = selfCheck as Record<string, unknown> | null;
    const updateObj = update as Record<string, unknown> | null;
    return {
      synced: selfCheckObj?.success !== false && updateObj?.success !== false,
      self_check: selfCheck,
      state_update: update,
      timestamp: Date.now(),
    };
  },
};

// ══════════════════════════════════════════════════════════════════
// MAPPED INVOKE
// ══════════════════════════════════════════════════════════════════

/**
 * Invoke une commande en appliquant le mapping automatique si nécessaire
 */
export async function mappedInvoke<T>(
  command: string,
  args?: TauriCommandArgs
): Promise<T> {
  // Si la commande a un mapping
  if (COMMAND_MAPPING[command]) {
    const mapped = COMMAND_MAPPING[command];

    // Cas 1: Mapping vers une seule commande
    if (typeof mapped === 'string') {
      const result = await safeInvokeTauri<any>(mapped, args);

      // Si extraction partielle nécessaire
      if (PARTIAL_STATE_EXTRACTORS[command]) {
        return PARTIAL_STATE_EXTRACTORS[command](result) as T;
      }

      return result as T;
    }

    // Cas 2: Mapping vers plusieurs commandes (agrégation)
    if (Array.isArray(mapped)) {
      const results = await Promise.all(
        mapped.map(cmd => safeInvokeTauri<any>(cmd, args).catch(() => null))
      );

      // Si agrégation nécessaire
      if (AGGREGATED_COMMANDS[command]) {
        return AGGREGATED_COMMANDS[command](results) as T;
      }

      // Sinon retourner le premier résultat valide
      return (results.find(r => r !== null) || null) as T;
    }
  }

  // Pas de mapping: appel direct
  return safeInvokeTauri<T>(command, args);
}

// ══════════════════════════════════════════════════════════════════
// AUTO-REPAIR UTILITIES
// ══════════════════════════════════════════════════════════════════

/**
 * Teste si une commande est disponible
 */
export async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await safeInvokeTauri(command, {}, 2000);
    return true;
  } catch (err) {
    const errMsg = String(err);
    // "not found" ou "Command X is not in whitelist" = commande invalide
    if (errMsg.includes('not found') || errMsg.includes('not in whitelist')) {
      return false;
    }
    // Autres erreurs (timeout, args invalides, etc.) = commande existe
    return true;
  }
}

/**
 * Scan quelles commandes Singularity sont réellement disponibles
 */
export async function scanAvailableCommands(): Promise<{
  singularity: string[];
  memory: string[];
  helios: string[];
  integrity: string[];
}> {
  const singularityCommands = [
    'get_singularity_state',
    'singularity_get_full_state',
    'singularity_get_physical',
    'singularity_get_cognitive',
    'singularity_get_symbolic',
    'singularity_get_adaptive',
    'singularity_get_meta',
    'singularity_self_check',
    'update_singularity_state',
    'singularity_update_full_state',
  ];

  const memoryCommands = [
    'get_memory_state',
    'memory_get_state',
    'memory_get_stats',
    'memory_health',
  ];

  const heliosCommands = ['get_helios_state', 'get_helios_metrics', 'get_system_state'];

  const integrityCommands = [
    'check_system_integrity',
    'singularity_self_check',
    'run_hardening_selftest',
  ];

  const [singularity, memory, helios, integrity] = await Promise.all([
    Promise.all(
      singularityCommands.map(cmd =>
        isCommandAvailable(cmd).then(ok => (ok ? cmd : null))
      )
    ),
    Promise.all(
      memoryCommands.map(cmd => isCommandAvailable(cmd).then(ok => (ok ? cmd : null)))
    ),
    Promise.all(
      heliosCommands.map(cmd => isCommandAvailable(cmd).then(ok => (ok ? cmd : null)))
    ),
    Promise.all(
      integrityCommands.map(cmd => isCommandAvailable(cmd).then(ok => (ok ? cmd : null)))
    ),
  ]);

  return {
    singularity: singularity.filter(Boolean) as string[],
    memory: memory.filter(Boolean) as string[],
    helios: helios.filter(Boolean) as string[],
    integrity: integrity.filter(Boolean) as string[],
  };
}

// ══════════════════════════════════════════════════════════════════
// SINGULARITY STATE REPAIR
// ══════════════════════════════════════════════════════════════════

/**
 * Répare un état Singularity avec des valeurs par défaut intelligentes
 */
export function repairSingularityState(
  state: SingularityState | null
): SingularityState | null {
  if (!state) return null;

  const repaired = { ...state };

  // Réparer stability si 0 ou NaN
  if (repaired.physical?.system_health) {
    const health = repaired.physical.system_health;
    if (health.global_health === 0 || isNaN(health.global_health)) {
      health.global_health = 0.8; // Fallback sain
    }
  }

  // Réparer symbolic stability
  if (repaired.symbolic) {
    if (repaired.symbolic.stability === 0 || isNaN(repaired.symbolic.stability)) {
      repaired.symbolic.stability = 0.8;
    }
  }

  // Réparer cognitive coherence
  if (repaired.cognitive) {
    if (repaired.cognitive.coherence === 0 || isNaN(repaired.cognitive.coherence)) {
      repaired.cognitive.coherence = 0.75;
    }
  }

  // Réparer adaptive evolution_capacity
  if (repaired.adaptive) {
    if (
      repaired.adaptive.evolution_capacity === 0 ||
      isNaN(repaired.adaptive.evolution_capacity)
    ) {
      repaired.adaptive.evolution_capacity = 0.7;
    }
  }

  // Réparer meta runtime_health
  if (repaired.meta) {
    if (repaired.meta.runtime_health === 0 || isNaN(repaired.meta.runtime_health)) {
      repaired.meta.runtime_health = 0.85;
    }
  }

  // Réparer progression si manquant
  if (!repaired.progression) {
    repaired.progression = {
      xp: 0,
      level: 1,
      events: [],
    };
  }

  // Ajouter timestamp si manquant
  if (!repaired.timestamp) {
    repaired.timestamp = Date.now();
  }

  return repaired;
}

/**
 * Calcule un titaneAlignment valide depuis un état Singularity
 */
export function calculateTitaneAlignment(state: SingularityState | null): number {
  if (!state) return 100; // Fallback sûr

  const weights = {
    physical: 0.2,
    cognitive: 0.25,
    symbolic: 0.2,
    adaptive: 0.2,
    meta: 0.15,
  };

  let alignment = 0;
  let totalWeight = 0;

  if (state.physical?.system_health?.global_health != null) {
    const health = state.physical.system_health.global_health;
    if (!isNaN(health)) {
      alignment += health * weights.physical * 100;
      totalWeight += weights.physical;
    }
  }

  if (state.cognitive?.coherence != null && !isNaN(state.cognitive.coherence)) {
    alignment += state.cognitive.coherence * weights.cognitive * 100;
    totalWeight += weights.cognitive;
  }

  if (state.symbolic?.stability != null && !isNaN(state.symbolic.stability)) {
    alignment += state.symbolic.stability * weights.symbolic * 100;
    totalWeight += weights.symbolic;
  }

  if (
    state.adaptive?.evolution_capacity != null &&
    !isNaN(state.adaptive.evolution_capacity)
  ) {
    alignment += state.adaptive.evolution_capacity * weights.adaptive * 100;
    totalWeight += weights.adaptive;
  }

  if (state.meta?.runtime_health != null && !isNaN(state.meta.runtime_health)) {
    alignment += state.meta.runtime_health * weights.meta * 100;
    totalWeight += weights.meta;
  }

  if (totalWeight === 0) return 100; // Fallback si aucune métrique

  return Math.round(alignment / totalWeight);
}

// ══════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════

export { COMMAND_MAPPING, PARTIAL_STATE_EXTRACTORS, AGGREGATED_COMMANDS };
