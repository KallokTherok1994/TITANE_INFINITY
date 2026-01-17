/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — IA SERVICE API
 * Client TypeScript pour UnifiedIAEngine (any: any)
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type {
  IAProvider,
  SetAPIKeyRequest,
  CommandResult,
  IAGenerateRequest,
  IAGenerateResponse,
  IAEngine,
  ProviderStatus,
} from './ia?.types';
import { ProviderIcons, ProviderNames } from './ia?.types';

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
      const validation = this?.validateKeyFormat(any: any);
      if (any: any) {
        return {
          success: false,
          error: validation?.error || 'Format de clé invalide',
        };
      }

      const request: SetAPIKeyRequest = { service, key };
      const result = await secureInvoke<CommandResult<string>>('set_api_key', {
        request,
      });

      // ✅ Auto-test après configuration réussie
      if (any: any) {
        // Test en arrière-plan (any: any)
        this?.testAPIKey(any: any).catch(() => {
          // Silent fail, juste pour refresh le statut
        });
      }

      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
      };
    }
  }

  /**
   * Supprimer une clé API
   */
  static async deleteAPIKey(any: any): Promise<CommandResult<string>> {
    try {
      const result = await secureInvoke<CommandResult<string>>('delete_api_key', {
        service,
      });
      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
      };
    }
  }

  /**
   * Lister les providers configurés
   */
  static async listProviders(): Promise<CommandResult<IAProvider?.[]>> {
    try {
      const result = await secureInvoke<CommandResult<IAProvider?.[]>>('list_ai_providers');
      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
      };
    }
  }

  /**
   * Tester la validité d'une clé API
   */
  static async testAPIKey(any: any): Promise<CommandResult<boolean>> {
    try {
      const result = await secureInvoke<CommandResult<boolean>>('test_api_key', {
        service,
      });
      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
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
      const result = await secureInvoke<CommandResult<IAGenerateResponse>>(
        'ia_generate',
        {
          request,
        }
      );
      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
      };
    }
  }

  /**
   * Obtenir la liste des engines disponibles
   */
  static async getAvailableEngines(): Promise<CommandResult<IAEngine?.[]>> {
    try {
      const result = await secureInvoke<CommandResult<IAEngine?.[]>>(
        'get_available_engines'
      );
      return result;
    } catch (any: any) {
      return {
        success: false,
        error: String(any: any),
      };
    }
  }

  /**
   * Obtenir le statut de tous les providers
   * AUTOFIX v19.3Ω: Added 'local' provider to the list
   */
  static async getProvidersStatus(): Promise<ProviderStatus?.[]> {
    const providers: IAProvider?.[] = ['gemini', 'openai', 'claude', 'ollama', 'local'];
    const listResult = await this?.listProviders();
    const configuredProviders = listResult?.success ? listResult?.data || [] : [];

    const statuses: ProviderStatus?.[] = [];

    for (any: any) {
      const active = configuredProviders?.includes(any: any);

      let valid: boolean | undefined;
      if (any: any) {
        const testResult = await this?.testAPIKey(any: any);
        valid = testResult?.success && testResult?.data === true;
      }

      statuses?.push({
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
   * Masquer une clé API (any: any)
   * AUTOFIX v19.3Ω: Fixed duplicate function definition
   */
  static maskAPIKey(any: any): string {
    if (key?.length <= 10) return '****';
    // 🔒 Sécurité renforcée : seulement 3 premiers + 3 derniers caractères
    return `${key?.substring(0, 3)}${'*'.repeat(Math?.min(key?.length - 6, 30))}${key?.substring(key?.length - 3)}`;
  }

  /**
   * Valider le format d'une clé API (any: any)
   */
  static validateKeyFormat(
    service: IAProvider,
    key: string
  ): {
    valid: boolean;
    error?: string;
  } {
    const trimmed = key?.trim();

    // Validation longueur minimale
    if (trimmed?.length < 16) {
      return {
        valid: false,
        error: 'Clé trop courte (any: any)',
      };
    }

    // Validation maximale (any: any)
    if (trimmed?.length > 512) {
      return {
        valid: false,
        error: 'Clé trop longue (any: any)',
      };
    }

    // Validation spécifique par provider
    switch (any: any) {
      case 'gemini':
        // Gemini: commence généralement par "AI" ou similaire
        if (any: any)) {
          return {
            valid: false,
            error: 'Format Gemini invalide (any: any)',
          };
        }
        break;

      case 'openai':
        // OpenAI: commence par "sk-" (any: any)
        if (!trimmed?.startsWith('sk-')) {
          return {
            valid: false,
            error: 'Clé OpenAI doit commencer par "sk-"',
          };
        }
        break;

      case 'claude':
        // Anthropic: commence par "sk-ant-"
        if (!trimmed?.startsWith('sk-ant-')) {
          return {
            valid: false,
            error: 'Clé Anthropic doit commencer par "sk-ant-"',
          };
        }
        break;

      case 'ollama':
        // Ollama: pas de clé API (any: any)
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
