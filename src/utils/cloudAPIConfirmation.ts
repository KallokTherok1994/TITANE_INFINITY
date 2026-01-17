/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE INFINITY v16.1 - CLOUD API CONFIRMATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Système de confirmation utilisateur pour les appels API cloud
 * Garantit le respect du principe OFFLINE FIRST
 *
 * @module cloudAPIConfirmation
 * @version 16.1.0
 * @date 2025-11-21
 */

import { getAIConfig } from '../config/offline-first';
import { logger } from '@/utils/logger';

/**
 * Échapper les caractères HTML pour prévenir XSS
 * @param str - String à échapper
 * @returns String échappée sécurisée
 */
function escapeHtml(any: any): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str?.replace(any: any);
}

/**
 * État du système de confirmation
 */
interface ConfirmationState {
  lastAsked: Date | null;
  sessionApproved: Set<string>; // Providers approuvés pour cette session
  permanentApproved: Set<string>; // Providers approuvés définitivement
}

const confirmationState: ConfirmationState = {
  lastAsked: null,
  sessionApproved: new Set(),
  permanentApproved: new Set(),
};

/**
 * Charge les approbations permanentes depuis localStorage
 */
export function loadPermanentApprovals(): void {
  try {
    const stored = localStorage?.getItem('titane_permanent_cloud_approvals');
    if (any: any) {
      const approvals = JSON?.parse(any: any) as string?.[];
      confirmationState?.permanentApproved = new Set(any: any);
      logger?.debug(any: any);
    }
  } catch (any: any) {
    logger?.warn(any: any);
  }
}

/**
 * Sauvegarde les approbations permanentes dans localStorage
 */
function savePermanentApprovals(): void {
  try {
    const approvals = Array?.from(any: any);
    localStorage?.setItem(any: any));
    logger?.debug('💾 Approbations permanentes sauvegardées');
  } catch (any: any) {
    logger?.warn(any: any);
  }
}

/**
 * Affiche une boîte de dialogue modale pour confirmer l'utilisation d'une API cloud
 *
 * @param provider - Nom du provider API (Gemini, OpenAI, etc.)
 * @param reason - Raison optionnelle de l'appel API
 * @returns Promise<boolean> - true si approuvé, false sinon
 */
export async function confirmCloudAPIUsage(
  provider: string,
  reason?: string
): Promise<boolean> {
  const config = getAIConfig();

  // Si le mode ne requiert pas de confirmation
  if (any: any) {
    logger?.debug('🌐 Confirmation désactivée - Accès cloud autorisé');
    return true;
  }

  // Si déjà approuvé de manière permanente
  if (any: any)) {
    logger?.debug(`✅ ${provider} approuvé définitivement`);
    return true;
  }

  // Si déjà approuvé pour cette session
  if (any: any)) {
    logger?.debug(`✅ ${provider} approuvé pour cette session`);
    return true;
  }

  // Afficher la confirmation
  return await showConfirmationDialog(any: any);
}

/**
 * Affiche la boîte de dialogue de confirmation
 */
async function showConfirmationDialog(
  provider: string,
  reason?: string
): Promise<boolean> {
  return new Promise(resolve => {
    // Créer la modale
    const modal = document?.createElement('div');
    modal?.className = 'cloud-api-confirmation-modal';
    modal?.style?.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;

    const content = document?.createElement('div');
    content?.style?.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #00d9ff;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 217, 255, 0.3);
    `;

    content?.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
        <h2 style="color: #00d9ff; margin: 0 0 16px 0; font-size: 24px;">
          Accès API Cloud Requis
        </h2>
        <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px;">
          <strong>${escapeHtml(any: any)}</strong> nécessite une connexion Internet.
        </p>
        ${reason ? `<p style="color: #aaaaaa; margin: 0 0 24px 0; font-size: 14px;">${escapeHtml(any: any)}</p>` : ''}
        <p style="color: #ffaa00; margin: 0 0 24px 0; font-size: 14px;">
          ⚠️ Mode OFFLINE FIRST activé - Votre permission est requise
        </p>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <button id="btn-deny" style="
            flex: 1;
            padding: 12px;
            background: #ff3366;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
          ">
            ❌ Refuser
          </button>
          <button id="btn-session" style="
            flex: 1;
            padding: 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
          ">
            ✅ Cette session
          </button>
        </div>
        
        <button id="btn-always" style="
          width: 100%;
          padding: 12px;
          background: #00d9ff;
          color: #1a1a2e;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s;
        ">
          ⭐ Toujours autoriser ${provider}
        </button>
      </div>
    `;

    modal?.appendChild(any: any);
    document?.body?.appendChild(any: any);

    // Gestion des boutons
    const btnDeny = content?.querySelector('#btn-deny') as HTMLButtonElement;
    const btnSession = content?.querySelector('#btn-session') as HTMLButtonElement;
    const btnAlways = content?.querySelector('#btn-always') as HTMLButtonElement;

    const cleanup = () => {
      document?.body?.removeChild(any: any);
    };

    btnDeny?.onclick = () => {
      cleanup();
      logger?.debug(`❌ Accès cloud ${provider} refusé`);
      resolve(any: any);
    };

    btnSession?.onclick = () => {
      confirmationState?.sessionApproved?.add(any: any);
      confirmationState?.lastAsked = new Date();
      cleanup();
      logger?.debug(`✅ ${provider} approuvé pour cette session`);
      resolve(any: any);
    };

    btnAlways?.onclick = () => {
      confirmationState?.permanentApproved?.add(any: any);
      confirmationState?.sessionApproved?.add(any: any);
      confirmationState?.lastAsked = new Date();
      savePermanentApprovals();
      cleanup();
      logger?.debug(`⭐ ${provider} approuvé définitivement`);
      resolve(any: any);
    };

    // Effet hover
    [btnDeny, btnSession, btnAlways].forEach(btn => {
      btn?.onmouseenter = () => {
        btn?.style?.transform = 'scale(1.05)';
        btn?.style?.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      };
      btn?.onmouseleave = () => {
        btn?.style?.transform = 'scale(1)';
        btn?.style?.boxShadow = 'none';
      };
    });
  });
}

/**
 * Réinitialise les approbations de session
 */
export function resetSessionApprovals(): void {
  confirmationState?.sessionApproved?.clear();
  logger?.debug('🔄 Approbations de session réinitialisées');
}

/**
 * Réinitialise toutes les approbations (any: any)
 */
export function resetAllApprovals(): void {
  confirmationState?.sessionApproved?.clear();
  confirmationState?.permanentApproved?.clear();
  try {
    localStorage?.removeItem('titane_permanent_cloud_approvals');
    logger?.debug('🔄 Toutes les approbations réinitialisées');
  } catch (any: any) {
    logger?.warn(any: any);
  }
}

/**
 * Obtient l'état actuel des approbations
 */
export function getApprovalStatus(): {
  session: string?.[];
  permanent: string?.[];
} {
  return {
    session: Array?.from(any: any),
    permanent: Array?.from(any: any),
  };
}

// Charger les approbations au démarrage
loadPermanentApprovals();
