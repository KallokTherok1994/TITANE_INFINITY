/**
 * TITANE∞ v17.3.0 - CognitiveBridge
 *
 * Bridge TypeScript vers commandes Rust de hardening cognitif
 * Gère validation, sanitization, intégrité SHA256
 *
 * @module CognitiveBridge
 */

import { invoke } from '@tauri-apps/api/tauri';

// ═══════════════════════════════════════════════════════════════
// TYPES (mirror des types Rust)
// ═══════════════════════════════════════════════════════════════

/**
 * Résultat de validation cognitive
 */
export interface CognitiveValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Test individuel self-test
 */
export interface CognitiveSelfTest {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Résultat self-test complet
 */
export interface CognitiveSelfTestResult {
  tests: CognitiveSelfTest[];
  pass_rate: number;
  timestamp: string; // ISO8601
}

/**
 * État cognitif (simplifié pour validation)
 */
export interface CognitiveState {
  mental: {
    charge: number;
    charge_rate: number;
    history: number[];
  };
  heart: {
    alignment: number;
    motivation: number;
    emotional_valence: number;
    intensity: number;
  };
  body: {
    energy_level: number;
    physical_tension: number;
    voice_fatigue: number;
  };
  coherence: {
    global: number;
  };
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// TYPE GUARDS (validation runtime TypeScript)
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si un objet est un CognitiveValidationResult valide
 */
export function isCognitiveValidationResult(obj: unknown): obj is CognitiveValidationResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;

  return (
    typeof result.is_valid === 'boolean' &&
    Array.isArray(result.errors) &&
    result.errors.every((e: unknown) => typeof e === 'string') &&
    Array.isArray(result.warnings) &&
    result.warnings.every((w: unknown) => typeof w === 'string')
  );
}

/**
 * Vérifie si un objet est un CognitiveSelfTestResult valide
 */
export function isCognitiveSelfTestResult(obj: unknown): obj is CognitiveSelfTestResult {
  if (!obj || typeof obj !== 'object') return false;
  const result = obj as Record<string, unknown>;

  return (
    Array.isArray(result.tests) &&
    result.tests.every((t: unknown) => {
      if (!t || typeof t !== 'object') return false;
      const test = t as Record<string, unknown>;
      return (
        typeof test.name === 'string' &&
        typeof test.passed === 'boolean' &&
        typeof test.message === 'string'
      );
    }) &&
    typeof result.pass_rate === 'number' &&
    typeof result.timestamp === 'string'
  );
}

/**
 * Vérifie si un objet est un CognitiveState valide
 */
export function isCognitiveState(obj: unknown): obj is CognitiveState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Record<string, unknown>;

  // Validation Mental
  if (!state.mental || typeof state.mental !== 'object') return false;
  const mental = state.mental as Record<string, unknown>;
  if (typeof mental.charge !== 'number' || typeof mental.charge_rate !== 'number') return false;
  if (!Array.isArray(mental.history) || !mental.history.every((h: unknown) => typeof h === 'number')) return false;

  // Validation Heart
  if (!state.heart || typeof state.heart !== 'object') return false;
  const heart = state.heart as Record<string, unknown>;
  if (typeof heart.alignment !== 'number' || typeof heart.motivation !== 'number') return false;
  if (typeof heart.emotional_valence !== 'number' || typeof heart.intensity !== 'number') return false;

  // Validation Body
  if (!state.body || typeof state.body !== 'object') return false;
  const body = state.body as Record<string, unknown>;
  if (typeof body.energy_level !== 'number' || typeof body.physical_tension !== 'number') return false;
  if (typeof body.voice_fatigue !== 'number') return false;

  // Validation Coherence
  if (!state.coherence || typeof state.coherence !== 'object') return false;
  const coherence = state.coherence as Record<string, unknown>;
  if (typeof coherence.global !== 'number') return false;

  // Validation Timestamp
  if (typeof state.timestamp !== 'number') return false;

  return true;
}

// ═══════════════════════════════════════════════════════════════
// COGNITIVE BRIDGE (commandes Tauri)
// ═══════════════════════════════════════════════════════════════

export class CognitiveBridge {
  /**
   * Lance le self-test complet du système cognitif
   *
   * @returns {Promise<CognitiveSelfTestResult>} Résultat tests (7 tests)
   * @throws {Error} Si la commande Tauri échoue
   */
  static async runSelfTest(): Promise<CognitiveSelfTestResult> {
    try {
      const result = await invoke<unknown>('cognitive_run_selftest');

      if (!isCognitiveSelfTestResult(result)) {
        throw new Error('Invalid CognitiveSelfTestResult received from Rust');
      }

      return result;
    } catch (error) {
      console.error('[CognitiveBridge] runSelfTest failed:', error);
      throw new Error(`Cognitive self-test failed: ${error}`);
    }
  }

  /**
   * Valide un état cognitif (5 catégories: Mental, Heart, Body, Coherence, Timestamp)
   *
   * @param {CognitiveState} state - État cognitif à valider
   * @returns {Promise<CognitiveValidationResult>} Résultat validation
   * @throws {Error} Si state invalide ou commande Tauri échoue
   */
  static async validateState(state: CognitiveState): Promise<CognitiveValidationResult> {
    // Validation TypeScript avant envoi
    if (!isCognitiveState(state)) {
      throw new Error('Invalid CognitiveState: missing required fields');
    }

    try {
      const result = await invoke<unknown>('cognitive_validate_state', { state });

      if (!isCognitiveValidationResult(result)) {
        throw new Error('Invalid CognitiveValidationResult received from Rust');
      }

      return result;
    } catch (error) {
      console.error('[CognitiveBridge] validateState failed:', error);
      throw new Error(`Cognitive validation failed: ${error}`);
    }
  }

  /**
   * Calcule le hash SHA256 d'un état cognitif (intégrité)
   *
   * @param {CognitiveState} state - État cognitif
   * @returns {Promise<string>} Hash SHA256 hexadécimal
   * @throws {Error} Si state invalide ou commande Tauri échoue
   */
  static async computeHash(state: CognitiveState): Promise<string> {
    // Validation TypeScript avant envoi
    if (!isCognitiveState(state)) {
      throw new Error('Invalid CognitiveState: missing required fields');
    }

    try {
      const hash = await invoke<string>('cognitive_compute_hash_cmd', { state });

      if (typeof hash !== 'string' || hash.length !== 64) {
        throw new Error('Invalid SHA256 hash received from Rust');
      }

      return hash;
    } catch (error) {
      console.error('[CognitiveBridge] computeHash failed:', error);
      throw new Error(`Cognitive hash computation failed: ${error}`);
    }
  }

  /**
   * Valide + sanitize un état cognitif (combo validation + clamp)
   *
   * @param {CognitiveState} state - État cognitif
   * @returns {Promise<{ valid: boolean; sanitized: boolean; errors: string[] }>}
   */
  static async validateAndSanitize(state: CognitiveState): Promise<{
    valid: boolean;
    sanitized: boolean;
    errors: string[];
  }> {
    const validation = await this.validateState(state);

    return {
      valid: validation.is_valid,
      sanitized: validation.warnings.length > 0,
      errors: validation.errors,
    };
  }

  /**
   * Vérifie l'intégrité d'un état vs hash précédent
   *
   * @param {CognitiveState} state - État actuel
   * @param {string} expectedHash - Hash attendu
   * @returns {Promise<boolean>} true si intégrité OK
   */
  static async verifyIntegrity(state: CognitiveState, expectedHash: string): Promise<boolean> {
    const currentHash = await this.computeHash(state);
    return currentHash === expectedHash;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default CognitiveBridge;
