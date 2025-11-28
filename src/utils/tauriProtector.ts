/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🛡️ TAURI INVOKE PROTECTION PATCH
 * Correction des erreurs "Cannot read properties of undefined (reading 'invoke')"
 */

// Déclaration globale pour window.__TAURI__
declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke?: (command: string, args?: any) => Promise<any>;
      };
    };
  }
}

/**
 * Protection robuste pour les appels Tauri invoke
 */
export class TauriInvokeProtector {
  private static instance: TauriInvokeProtector;
  private isTauriAvailable: boolean | null = null;
  private checkCache: { [key: string]: { result: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 5000; // 5s cache

  static getInstance(): TauriInvokeProtector {
    if (!TauriInvokeProtector.instance) {
      TauriInvokeProtector.instance = new TauriInvokeProtector();
    }
    return TauriInvokeProtector.instance;
  }

  /**
   * Vérifie si Tauri est disponible dans l'environnement actuel
   */
  private checkTauriAvailability(): boolean {
    if (this.isTauriAvailable !== null) {
      return this.isTauriAvailable;
    }

    try {
      // Vérification environnement
      if (typeof window === 'undefined') {
        this.isTauriAvailable = false;
        return false;
      }

      // Vérification API Tauri
      const hasTauriGlobal = window.__TAURI__ && window.__TAURI__.core;
      const hasTauriInvoke = hasTauriGlobal && typeof window.__TAURI__?.core?.invoke === 'function';

      this.isTauriAvailable = hasTauriInvoke;

      if (!this.isTauriAvailable) {
        console.warn('[TauriProtector] Tauri API not available - using fallback mode');
      }

      return this.isTauriAvailable;
    } catch (error) {
      console.warn('[TauriProtector] Error checking Tauri availability:', error);
      this.isTauriAvailable = false;
      return false;
    }
  }

  /**
   * Invoke protégé avec fallback intelligent
   */
  async safeInvoke<T>(command: string, args?: any): Promise<T> {
    const cacheKey = `${command}:${JSON.stringify(args)}`;

    // Check cache first pour éviter appels répétés
    const cached = this.checkCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      // Vérifier disponibilité Tauri
      if (!this.checkTauriAvailability()) {
        return this.createFallbackResponse<T>(command, 'Tauri not available');
      }

      // Import dynamique avec protection
      const tauriModule = await this.safeTauriImport();
      if (!tauriModule || !tauriModule.invoke) {
        return this.createFallbackResponse<T>(command, 'Tauri invoke not available');
      }

      // Appel avec timeout
      const result = await Promise.race([
        tauriModule.invoke<T>(command, args),
        this.createTimeoutPromise<T>(10000) // 10s timeout
      ]);

      // Cache du résultat positif
      this.checkCache[cacheKey] = {
        result,
        timestamp: Date.now()
      };

      return result;

    } catch (error) {
      console.warn(`[TauriProtector] Command ${command} failed:`, error);
      return this.createFallbackResponse<T>(command, error);
    }
  }

  /**
   * Import sécurisé du module Tauri
   */
  private async safeTauriImport(): Promise<{ invoke: typeof import('@tauri-apps/api/core').invoke } | null> {
    try {
      const module = await import('@tauri-apps/api/core');
      if (module && typeof module.invoke === 'function') {
        return { invoke: module.invoke };
      }
      return null;
    } catch (error) {
      console.warn('[TauriProtector] Failed to import Tauri core:', error);
      return null;
    }
  }

  /**
   * Créer une Promise avec timeout
   */
  private createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
  }

  /**
   * Génère une réponse de fallback intelligente selon le type de commande
   */
  private createFallbackResponse<T>(command: string | undefined, error: any): T {
    const safeCommand = command || 'unknown_command';
    console.log(`[TauriProtector] Using fallback for ${safeCommand}`);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Fallbacks spécifiques par type de commande
    if (safeCommand.includes('chat_get_providers_status') || safeCommand.includes('providers')) {
      return {
        success: false,
        providers: [],
        error: errorMessage,
        fallback: true,
        message: 'Backend offline - using local AI fallback'
      } as T;
    }

    if (safeCommand.includes('chat_send_message') || safeCommand.includes('chat')) {
      return {
        success: false,
        error: errorMessage,
        fallback: true,
        provider: 'titane-local',
        message: {
          id: `fallback-${Date.now()}`,
          content: 'Backend unavailable. Please try again or use local mode.',
          role: 'assistant',
          timestamp: Date.now()
        }
      } as T;
    }

    if (command && (command.includes('status') || command.includes('health') || command.includes('state'))) {
      return {
        status: 'offline',
        available: false,
        error: errorMessage,
        fallback: true,
        health: 'degraded'
      } as T;
    }

    // Fallback générique
    return {
      success: false,
      error: errorMessage,
      fallback: true,
      timestamp: Date.now()
    } as T;
  }

  /**
   * Reset cache et état
   */
  reset(): void {
    this.isTauriAvailable = null;
    this.checkCache = {};
    console.log('[TauriProtector] Cache reset');
  }
}

// Instance globale
export const tauriProtector = TauriInvokeProtector.getInstance();

/**
 * Fonction utilitaire pour invoke protégé
 * Remplace directement les appels invokeTauri problématiques
 */
export async function safeInvokeTauri<T>(command: string, args?: any): Promise<T> {
  return tauriProtector.safeInvoke<T>(command, args);
}
