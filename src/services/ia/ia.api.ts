/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — IA SERVICE API
 * Client TypeScript pour UnifiedIAEngine (OpenAI + Claude)
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  IAProvider,
  SetAPIKeyRequest,
  CommandResult,
  IAGenerateRequest,
  IAGenerateResponse,
  IAEngine,
  ProviderStatus,
} from './ia.types';
import { ProviderIcons, ProviderNames } from './ia.types';

/**
 * Service IA unifié pour OpenAI + Claude + Gemini
 */
export class IAService {
  /**
   * Définir une clé API pour un provider
   */
  static async setAPIKey(service: IAProvider, key: string): Promise<CommandResult<string>> {
    try {
      const request: SetAPIKeyRequest = { service, key };
      const result = await invoke<CommandResult<string>>('set_api_key', { request });
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Supprimer une clé API
   */
  static async deleteAPIKey(service: IAProvider): Promise<CommandResult<string>> {
    try {
      const result = await invoke<CommandResult<string>>('delete_api_key', { service });
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Lister les providers configurés
   */
  static async listProviders(): Promise<CommandResult<IAProvider[]>> {
    try {
      const result = await invoke<CommandResult<IAProvider[]>>('list_ai_providers');
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Tester la validité d'une clé API
   */
  static async testAPIKey(service: IAProvider): Promise<CommandResult<boolean>> {
    try {
      const result = await invoke<CommandResult<boolean>>('test_api_key', { service });
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Générer une réponse IA avec fallback automatique
   */
  static async generate(request: IAGenerateRequest): Promise<CommandResult<IAGenerateResponse>> {
    try {
      const result = await invoke<CommandResult<IAGenerateResponse>>('ia_generate', { request });
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Obtenir la liste des engines disponibles
   */
  static async getAvailableEngines(): Promise<CommandResult<IAEngine[]>> {
    try {
      const result = await invoke<CommandResult<IAEngine[]>>('get_available_engines');
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Obtenir le statut de tous les providers
   */
  static async getProvidersStatus(): Promise<ProviderStatus[]> {
    const providers: IAProvider[] = ['gemini', 'openai', 'claude', 'ollama'];
    const listResult = await this.listProviders();
    const configuredProviders = listResult.success ? listResult.data || [] : [];

    const statuses: ProviderStatus[] = [];

    for (const service of providers) {
      const active = configuredProviders.includes(service);

      let valid: boolean | undefined;
      if (active) {
        const testResult = await this.testAPIKey(service);
        valid = testResult.success && testResult.data === true;
      }

      statuses.push({
        service,
        name: ProviderNames[service],
        icon: ProviderIcons[service],
        active,
        valid,
      });
    }

    return statuses;
  }

  /**
   * Masquer une clé API (afficher seulement début et fin)
   */
  static maskAPIKey(key: string): string {
    if (key.length <= 10) return '****';
    return `${key.slice(0, 8)}****${key.slice(-4)}`;
  }

  /**
   * Valider le format d'une clé API
   */
  static validateKeyFormat(service: IAProvider, key: string): { valid: boolean; error?: string } {
    if (!key || key.trim().length === 0) {
      return { valid: false, error: 'Clé vide' };
    }

    switch (service) {
      case 'openai':
        if (!key.startsWith('sk-') || key.length < 40) {
          return {
            valid: false,
            error: 'Clé OpenAI invalide (doit commencer par "sk-" et avoir min. 40 caractères)',
          };
        }
        break;

      case 'claude':
        if (!key.startsWith('sk-ant-') || key.length < 50) {
          return {
            valid: false,
            error: 'Clé Claude invalide (doit commencer par "sk-ant-" et avoir min. 50 caractères)',
          };
        }
        break;

      case 'gemini':
        if (key.length < 30) {
          return {
            valid: false,
            error: 'Clé Gemini invalide (min. 30 caractères)',
          };
        }
        break;

      case 'ollama':
      case 'local':
        // Pas de validation spécifique
        break;

      default:
        return { valid: false, error: 'Provider inconnu' };
    }

    return { valid: true };
  }
}
