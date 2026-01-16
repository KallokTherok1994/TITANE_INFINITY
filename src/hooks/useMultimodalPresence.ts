/**
 * TITANE_INFINITY v∞.28 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import {
  multimodalPresenceEngine,
  type MultimodalPresenceState,
  type PresenceMode,
  type ExpressiveIntention,
  type BreathingState,
  type HaloColorExpression,
  type AvatarMicroMimics,
} from '@/engines/presence/_stubs';

// Alias pour compatibilité
type BreathingCycle = BreathingState;

/*
import {
  multimodalPresenceEngine,
  type MultimodalPresenceState,
  type PresenceMode,
  type ExpressiveIntention,
  type BreathingCycle,
  type HaloColorExpression,
  type AvatarMicroMimics,
} from '@/engines/presence/multimodalPresenceEngine';
*/

import type { InnerDialogueState } from '@/services/voice/innerDialogueController';

// ═══════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour gérer la présence multimodale de TITANE∞
 */
export function useMultimodalPresence() {
  const [state, setState] = useState<MultimodalPresenceState>(
    multimodalPresenceEngine.getState()
  );

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(newState => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const setMode = useCallback((mode: PresenceMode) => {
    multimodalPresenceEngine.setMode(mode);
  }, []);

  const applyIntention = useCallback(
    (type: ExpressiveIntention['type'], intensity = 1.0, duration = 3000) => {
      multimodalPresenceEngine.applyIntention(type, intensity, duration);
    },
    []
  );

  const syncWithInnerDialogue = useCallback((innerState: Partial<InnerDialogueState>) => {
    multimodalPresenceEngine.syncWithInnerDialogue(innerState);
  }, []);

  const activateHealingMode = useCallback(() => {
    multimodalPresenceEngine.activateHealingMode();
  }, []);

  const activateStoryMode = useCallback(() => {
    multimodalPresenceEngine.activateStoryMode();
  }, []);

  const activateListeningMode = useCallback(() => {
    multimodalPresenceEngine.activateListeningMode();
  }, []);

  return {
    state,
    mode: state.mode,
    setMode,
    applyIntention,
    syncWithInnerDialogue,
    activateHealingMode,
    activateStoryMode,
    activateListeningMode,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS SPÉCIALISÉS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder uniquement au cycle respiratoire
 */
export function useBreathingCycle(): {
  breathing: BreathingCycle | number;
  breathingValue: number;
} {
  const initialBreathing = multimodalPresenceEngine.getState().breathing;
  const [breathing, setBreathing] = useState<BreathingCycle | number>(initialBreathing);
  const [breathingValue, setBreathingValue] = useState(0);

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setBreathing(state.breathing);
      // Calculer la valeur respiratoire actuelle (0-1)
      const elapsed = Date.now();
      // Type guard pour BreathingState
      if (typeof state.breathing === 'object' && 'cycleDuration' in state.breathing) {
        const cycleProgress =
          (elapsed % state.breathing.cycleDuration) / state.breathing.cycleDuration;
        setBreathingValue(
          Math.sin(cycleProgress * Math.PI * 2) * state.breathing.amplitude
        );
      } else {
        setBreathingValue(typeof state.breathing === 'number' ? state.breathing : 0);
      }
    });

    return unsubscribe;
  }, []);

  return { breathing, breathingValue };
}

/**
 * Hook pour accéder uniquement à l'expression halo
 */
export function useHaloExpression(): {
  haloState: string;
  haloColor: HaloColorExpression;
  intensity: number;
  pulsation: number;
  cssColor: string;
} {
  const [halo, setHalo] = useState(multimodalPresenceEngine.getState().halo);

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setHalo(state.halo);
    });

    return unsubscribe;
  }, []);

  // Convertir HSL en CSS
  const cssColor = `hsl(${halo.color.hue}, ${halo.color.saturation}%, ${halo.color.lightness}%)`;

  return {
    haloState: halo.state,
    haloColor: halo.color,
    intensity: halo.intensity,
    pulsation: halo.pulsation,
    cssColor,
  };
}

/**
 * Hook pour accéder uniquement aux micro-mimics avatar
 */
export function useAvatarMimics(): {
  avatar: AvatarMicroMimics;
  shouldBlink: boolean;
  eyePosition: { x: number; y: number };
  headRotation: { pitch: number; yaw: number; roll: number };
  expression: AvatarMicroMimics['microExpression'];
  glow: number;
} {
  const [avatar, setAvatar] = useState(multimodalPresenceEngine.getState().avatar);
  const [shouldBlink, setShouldBlink] = useState(false);

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setAvatar(state.avatar);

      // Détection blink
      const now = Date.now();
      const timeSinceLastBlink = now - state.avatar.lastBlink;
      setShouldBlink(timeSinceLastBlink < 150); // Blink dure 150ms
    });

    return unsubscribe;
  }, []);

  return {
    avatar,
    shouldBlink,
    eyePosition: { x: avatar.eyeMovement.x, y: avatar.eyeMovement.y },
    headRotation: avatar.headTilt,
    expression: avatar.microExpression,
    glow: avatar.facialGlow,
  };
}

/**
 * Hook pour accéder à l'état interne (pensée)
 */
export function useInnerState(): {
  thinkingState: string | null;
  mentalColor: string | null;
  coherence: number;
  isThinking: boolean;
} {
  const [innerState, setInnerState] = useState(
    multimodalPresenceEngine.getState().innerState
  );

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setInnerState(state.innerState);
    });

    return unsubscribe;
  }, []);

  return {
    thinkingState: innerState.thinkingState,
    mentalColor: innerState.mentalColor,
    coherence: innerState.coherence,
    isThinking:
      innerState.thinkingState !== null && innerState.thinkingState !== 'silent',
  };
}

/**
 * Hook pour accéder à l'énergie de présence globale
 */
export function usePresenceEnergy(): {
  energy: number;
  isLow: boolean;
  isHigh: boolean;
  isNeutral: boolean;
} {
  const [energy, setEnergy] = useState(
    multimodalPresenceEngine.getState().presenceEnergy
  );

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setEnergy(state.presenceEnergy);
    });

    return unsubscribe;
  }, []);

  return {
    energy,
    isLow: energy < 0.3,
    isHigh: energy > 0.7,
    isNeutral: energy >= 0.3 && energy <= 0.7,
  };
}

/**
 * Hook pour le user mirroring (synchronisation empathique)
 */
export function useUserMirroring(): {
  active: boolean;
  mirrorRatio: number;
  detectedUserState: string | null;
  activate: () => void;
  deactivate: () => void;
} {
  const [mirroring, setMirroring] = useState(
    multimodalPresenceEngine.getState().userMirroring
  );

  useEffect(() => {
    const unsubscribe = multimodalPresenceEngine.subscribe(state => {
      setMirroring(state.userMirroring);
    });

    return unsubscribe;
  }, []);

  const activate = useCallback(() => {
    // IMPLEMENTATION: Activate user mirroring in MultimodalPresenceEngine
    // 1. Engine call: multimodalPresenceEngine.activateMirroring() or tauriClient.presence:activateMirroring()
    // 2. Media streams: Request camera/microphone access via getUserMedia()
    // 3. Emotion tracking: Start real-time emotion detection from video frames
    // 4. State update: Set isActive = true, emit 'mirroring:activated' event
    // 5. UI feedback: Show mirroring indicator, update presence status
    // 6. Error handling: Prompt user if camera denied, fallback to audio-only mode
    logger.debug('Activation requested (not yet implemented)');
  }, []);

  const deactivate = useCallback(() => {
    // IMPLEMENTATION: Deactivate user mirroring in MultimodalPresenceEngine
    // 1. Engine call: multimodalPresenceEngine.deactivateMirroring() or tauriClient.presence:deactivateMirroring()
    // 2. Stop streams: mediaStream.getTracks().forEach(track => track.stop())
    // 3. Stop tracking: Disable emotion detection, clear active frame buffer
    // 4. State update: Set isActive = false, emit 'mirroring:deactivated' event
    // 5. UI feedback: Hide mirroring indicator, restore normal presence status
    // 6. Cleanup: Release camera/microphone resources, garbage collect buffers
    logger.debug('Deactivation requested (not yet implemented)');
  }, []);

  return {
    active: mirroring.active,
    mirrorRatio: mirroring.mirrorRatio,
    detectedUserState: mirroring.detectedUserState,
    activate,
    deactivate,
  };
}

/**
 * Hook pour déclencher des intentions expressives rapidement
 */
export function useExpressiveActions() {
  const applyGuidance = useCallback((intensity = 1.0) => {
    multimodalPresenceEngine.applyIntention('guidance', intensity, 3000);
  }, []);

  const applyComfort = useCallback((intensity = 1.0) => {
    multimodalPresenceEngine.applyIntention('comfort', intensity, 5000);
  }, []);

  const applyAnalysis = useCallback((intensity = 1.0) => {
    multimodalPresenceEngine.applyIntention('analysis', intensity, 4000);
  }, []);

  const applyInspiration = useCallback((intensity = 1.0) => {
    multimodalPresenceEngine.applyIntention('inspiration', intensity, 3000);
  }, []);

  const applySurprise = useCallback((intensity = 1.0) => {
    multimodalPresenceEngine.applyIntention('surprise', intensity, 2000);
  }, []);

  return {
    applyGuidance,
    applyComfort,
    applyAnalysis,
    applyInspiration,
    applySurprise,
  };
}
