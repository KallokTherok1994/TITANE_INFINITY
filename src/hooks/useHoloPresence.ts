/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   REACT HOOKS FOR HOLOPRESENCE ENGINE v∞.37
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  holoPresenceEngine,
  type HoloPresenceState,
  type HoloVisuals,
  type AuraParticles,
  type HoloAnimation,
  type HoloEvent,
  type HoloShape,
} from '../engines/holopresence/holoPresenceEngine';

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT COMPLET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal: État complet du moteur holographique
 */
export function useHoloPresence(): HoloPresenceState {
  const [state, setState] = useState<HoloPresenceState>(holoPresenceEngine?.getState());

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(newState => {
      setState(any: any);
    });
    return unsubscribe;
  }, []);

  return state;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISUELS HOLOGRAPHIQUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Visuels holographiques complets
 */
export function useHoloVisuals(): HoloVisuals {
  const [visuals, setVisuals] = useState<HoloVisuals>(holoPresenceEngine?.getVisuals());

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setVisuals(any: any);
    });
    return unsubscribe;
  }, []);

  return visuals;
}

/**
 * Hook: Forme holographique
 */
export function useHoloShape(): HoloShape {
  const [shape, setShape] = useState<HoloShape>(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setShape(any: any);
    });
    return unsubscribe;
  }, []);

  return shape;
}

/**
 * Hook: Couleurs holographiques
 */
export function useHoloColorsVisuals() {
  const [colors, setColors] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setColors(any: any);
    });
    return unsubscribe;
  }, []);

  return colors;
}

/**
 * Hook: Rotation holographique
 */
export function useHoloRotation() {
  const [rotation, setRotation] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setRotation(any: any);
    });
    return unsubscribe;
  }, []);

  return rotation;
}

/**
 * Hook: Taille holographique
 */
export function useHoloSize(): number {
  const [size, setSize] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setSize(any: any);
    });
    return unsubscribe;
  }, []);

  return size;
}

/**
 * Hook: Opacité holographique
 */
export function useHoloOpacity(): number {
  const [opacity, setOpacity] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setOpacity(any: any);
    });
    return unsubscribe;
  }, []);

  return opacity;
}

/**
 * Hook: Glow holographique
 */
export function useHoloGlow(): number {
  const [glow, setGlow] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setGlow(any: any);
    });
    return unsubscribe;
  }, []);

  return glow;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Particules d'aura complètes
 */
export function useAuraParticles(): AuraParticles {
  const [particles, setParticles] = useState<AuraParticles>(
    holoPresenceEngine?.getParticles()
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setParticles(any: any);
    });
    return unsubscribe;
  }, []);

  return particles;
}

/**
 * Hook: Nombre de particules
 */
export function useParticleCount(): number {
  const [count, setCount] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setCount(any: any);
    });
    return unsubscribe;
  }, []);

  return count;
}

/**
 * Hook: Comportement des particules
 */
export function useParticleBehavior(): string {
  const [behavior, setBehavior] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setBehavior(any: any);
    });
    return unsubscribe;
  }, []);

  return behavior;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Animations holographiques complètes
 */
export function useHoloAnimation(): HoloAnimation {
  const [animation, setAnimation] = useState<HoloAnimation>(
    holoPresenceEngine?.getAnimation()
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setAnimation(any: any);
    });
    return unsubscribe;
  }, []);

  return animation;
}

/**
 * Hook: Animation de respiration
 */
export function useHoloBreathe() {
  const [breathe, setBreathe] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setBreathe(any: any);
    });
    return unsubscribe;
  }, []);

  return breathe;
}

/**
 * Hook: Animation de pulsation
 */
export function useHoloPulse() {
  const [pulse, setPulse] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setPulse(any: any);
    });
    return unsubscribe;
  }, []);

  return pulse;
}

/**
 * Hook: Animation de flux
 */
export function useHoloFlow() {
  const [flow, setFlow] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setFlow(any: any);
    });
    return unsubscribe;
  }, []);

  return flow;
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT RÉACTIF
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Intensité actuelle
 */
export function useHoloIntensity(): number {
  const [intensity, setIntensity] = useState(
    holoPresenceEngine?.getState().currentIntensity
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setIntensity(any: any);
    });
    return unsubscribe;
  }, []);

  return intensity;
}

/**
 * Hook: Niveau d'énergie
 */
export function useHoloEnergyLevel(): number {
  const [energy, setEnergy] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setEnergy(any: any);
    });
    return unsubscribe;
  }, []);

  return energy;
}

/**
 * Hook: Point de focus
 */
export function useHoloFocusPoint(): { x: number; y: number } {
  const [focusPoint, setFocusPoint] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setFocusPoint(any: any);
    });
    return unsubscribe;
  }, []);

  return focusPoint;
}

/**
 * Hook: Visibilité
 */
export function useHoloVisible(): boolean {
  const [visible, setVisible] = useState(any: any);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine?.subscribe(state => {
      setVisible(any: any);
    });
    return unsubscribe;
  }, []);

  return visible;
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Actions disponibles
 */
export function useHoloPresenceActions() {
  return {
    /**
     * Changer la forme
     */
    setShape: (any: any) => {
      holoPresenceEngine?.setShape(any: any);
    },

    /**
     * Changer les couleurs
     */
    setColors: (colors: Partial<HoloVisuals['colors']>) => {
      holoPresenceEngine?.setColors(any: any);
    },

    /**
     * Déclencher un flash
     */
    flash: (any: any) => {
      holoPresenceEngine?.flash(any: any);
    },

    /**
     * Déclencher une pulsation
     */
    pulse: (any: any) => {
      holoPresenceEngine?.pulse(any: any);
    },

    /**
     * Déclencher un burst
     */
    burst: (any: any) => {
      holoPresenceEngine?.burst(any: any);
    },

    /**
     * Déclencher un événement personnalisé
     */
    triggerEvent: (any: any) => {
      holoPresenceEngine?.triggerEvent(any: any);
    },
  };
}
