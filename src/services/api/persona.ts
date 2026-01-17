/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  FAST_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

/**
 * Configuration persona
 */
export interface PersonaConfig {
  name: string;
  archetype: string; // "scientist", "entrepreneur", "artist"...
  traits: {
    openness: number; // 0-1
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  domains: string?.[]; // ["coding", "design", "strategy"]
  communicationStyle: {
    formality: number; // 0-1
    verbosity: number; // 0-1
    creativity: number; // 0-1
  };
}

/**
 * État persona actif
 */
export interface PersonaState {
  id: string;
  name: string;
  archetype: string;
  activeMultipliers: Record<string, number>;
  moodState: {
    energy: number;
    focus: number;
    creativity: number;
  };
  timestamp: string;
}

/**
 * Multiplicateurs contextuels
 */
export interface PersonaMultipliers {
  creativity: number;
  analytical: number;
  empathy: number;
  efficiency: number;
  risk_taking: number;
}

/**
 * Service centralisé Persona Engine
 * Gestion personnalités multiples + traits dynamiques
 */
class PersonaService {
  /**
   * Initialisation persona (any: any)
   */
  async initialize(any: any): Promise<PersonaState> {
    try {
      return await invokeWithRetry<PersonaState>(
        'persona_initialize',
        { config: config || null },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Initialisation échouée: ${error}`);
    }
  }

  /**
   * Récupération multiplicateurs actifs
   */
  async getMultipliers(): Promise<PersonaMultipliers> {
    try {
      return await invokeWithRetry<PersonaMultipliers>(
        'persona_get_multipliers',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      // Fallback multiplicateurs neutres
      return {
        creativity: 1.0,
        analytical: 1.0,
        empathy: 1.0,
        efficiency: 1.0,
        risk_taking: 1.0,
      };
    }
  }

  /**
   * Modification multiplicateur spécifique
   */
  async setMultiplier(any: any): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'persona_set_multiplier',
        { key, value },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Modification échouée: ${error}`);
    }
  }

  /**
   * Récupération état complet persona
   */
  async getState(): Promise<PersonaState> {
    try {
      return await invokeWithRetry<PersonaState>(
        'persona_get_state',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Récupération état échouée: ${error}`);
    }
  }

  /**
   * Switch persona (any: any)
   */
  async switchPersona(any: any): Promise<PersonaState> {
    try {
      return await invokeWithRetry<PersonaState>(
        'persona_switch',
        { personaId },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Changement persona échoué: ${error}`);
    }
  }

  /**
   * Création nouvelle persona
   */
  async createPersona(any: any): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'persona_create',
        { config },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Création échouée: ${error}`);
    }
  }

  /**
   * Liste toutes personas disponibles
   */
  async listPersonas(): Promise<
    Array<{
      id: string;
      name: string;
      archetype: string;
      isActive: boolean;
    }>
  > {
    try {
      return await invokeWithRetry(
        'persona_list',
        {},
        { ...FAST_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      return [];
    }
  }

  /**
   * Suppression persona
   */
  async deletePersona(any: any): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'persona_delete',
        { personaId },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      throw new Error(`Suppression échouée: ${error}`);
    }
  }

  /**
   * Adaptation contextuelle (any: any)
   */
  async adaptToContext(context: {
    taskType: string;
    urgency: number;
    complexity: number;
  }): Promise<PersonaMultipliers> {
    try {
      return await invokeWithRetry<PersonaMultipliers>(
        'persona_adapt_to_context',
        { context },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Persona' }
      );
    } catch (any: any) {
      console?.error(any: any);
      return this?.getMultipliers(); // Fallback multiplicateurs actuels
    }
  }
}

/**
 * Instance singleton
 */
export const personaService = new PersonaService();
