/**
 * TITANE∞ — TimeToTwinBridge (runtime bootstrap)
 *
 * Composant runtime invisible (renvoie null) qui démarre le pont
 * TIME → NumericTwin au mount global de l'app et l'arrête au unmount.
 *
 * Voie Single Door uniquement: `getRuntimeTimeToTwinObserver()` consomme
 * `temporal_health` + `temporal_alignment_score` puis pousse une observation
 * cognitive via `twin_submit_observation`.
 *
 * Voir: src/services/temporal/timeToTwinObserver.ts
 *       src/services/temporal/temporalChatTools.ts (registry chat tools)
 */

import { useEffect } from 'react';
import {
  getRuntimeTimeToTwinObserver,
  resetRuntimeTimeToTwinObserverForTests,
  registerTemporalChatTools,
} from '@/services/temporal';
import { getToolCaller } from '@/services/chat/toolCaller';

const DEFAULT_INTERVAL_MS = 60_000;

let chatToolsRegistered = false;

export interface TimeToTwinBridgeProps {
  /** Override fréquence pulse observer (default 60s). */
  intervalMs?: number;
  /** Désactive le pont (utile pour tests sandboxés). */
  disabled?: boolean;
}

export function TimeToTwinBridge({
  intervalMs = DEFAULT_INTERVAL_MS,
  disabled = false,
}: TimeToTwinBridgeProps): null {
  useEffect(() => {
    if (disabled) return undefined;

    // 1) Enregistrement idempotent des 5 chat tools temporels
    if (!chatToolsRegistered) {
      try {
        registerTemporalChatTools(getToolCaller());
        chatToolsRegistered = true;
      } catch (err) {
        // Pas de crash app — visible côté console pour ops uniquement.
        console.warn('[TimeToTwinBridge] chat tools registration failed:', err);
      }
    }

    // 2) Démarrage observer singleton (pulse + interval)
    const observer = getRuntimeTimeToTwinObserver({ intervalMs });
    observer.start();
    return () => {
      observer.stop();
    };
  }, [intervalMs, disabled]);

  return null;
}

/**
 * Réinitialise l'état global pour les tests unitaires.
 * NE PAS appeler en runtime applicatif.
 */
export function resetTimeToTwinBridgeForTests(): void {
  chatToolsRegistered = false;
  resetRuntimeTimeToTwinObserverForTests();
}
