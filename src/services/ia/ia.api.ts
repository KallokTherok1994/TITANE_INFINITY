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
  static async setAPIKey(
    service: IAProvider,
    key: string
  ): Promise<CommandResult<string>> {
    try {
      // 🔒 Validation client-side AVANT envoi backend
      const validation = this.validateKeyFormat(service, key);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Format de clé invalide',
        };
      }

      const request: SetAPIKeyRequest = { service, key };
      const result = await invoke<CommandResult<string>>('set_api_key', { request });

      // ✅ Auto-test après configuration réussie
      if (result.success) {
        // Test en arrière-plan (non-bloquant)
        this.testAPIKey(service).catch(() => {
          // Silent fail, juste pour refresh le statut
        });
      }

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
  static async generate(
    request: IAGenerateRequest
  ): Promise<CommandResult<IAGenerateResponse>> {
    try {
      const result = await invoke<CommandResult<IAGenerateResponse>>('ia_generate', {
        request,
      });
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
   * AUTOFIX v19.3Ω: Added 'local' provider to the list
   */
  static async getProvidersStatus(): Promise<ProviderStatus[]> {
    const providers: IAProvider[] = ['gemini', 'openai', 'claude', 'ollama', 'local'];
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
   * AUTOFIX v19.3Ω: Fixed duplicate function definition
   */
  static maskAPIKey(key: string): string {
    if (key.length <= 10) return '****';
    // 🔒 Sécurité renforcée : seulement 3 premiers + 3 derniers caractères
    return `${key.substring(0, 3)}${'*'.repeat(Math.min(key.length - 6, 30))}${key.substring(key.length - 3)}`;
  }

  /**
   * Valider le format d'une clé API (client-side, avant appel backend)
   */
  static validateKeyFormat(
    service: IAProvider,
    key: string
  ): {
    valid: boolean;
    error?: string;
  } {
    const trimmed = key.trim();

    // Validation longueur minimale
    if (trimmed.length < 16) {
      return {
        valid: false,
        error: 'Clé trop courte (minimum 16 caractères)',
      };
    }

    // Validation maximale (éviter surcharge)
    if (trimmed.length > 512) {
      return {
        valid: false,
        error: 'Clé trop longue (maximum 512 caractères)',
      };
    }

    // Validation spécifique par provider
    switch (service) {
      case 'gemini':
        // Gemini: commence généralement par "AI" ou similaire
        if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
          return {
            valid: false,
            error: 'Format Gemini invalide (caractères alphanumériques uniquement)',
          };
        }
        break;

      case 'openai':
        // OpenAI: commence par "sk-" (clé secrète) ou "sk-proj-" (projet)
        if (!trimmed.startsWith('sk-')) {
          return {
            valid: false,
            error: 'Clé OpenAI doit commencer par "sk-"',
          };
        }
        break;

      case 'claude':
        // Anthropic: commence par "sk-ant-"
        if (!trimmed.startsWith('sk-ant-')) {
          return {
            valid: false,
            error: 'Clé Anthropic doit commencer par "sk-ant-"',
          };
        }
        break;

      case 'ollama':
        // Ollama: pas de clé API (URL uniquement)
        return {
          valid: true,
        };

      case 'local':
        // Local: pas de validation spécifique
        return {
          valid: true,
        };

      default:
        return {
          valid: false,
          error: `Provider inconnu: ${service}`,
        };
    }

    return { valid: true };
  }
}
