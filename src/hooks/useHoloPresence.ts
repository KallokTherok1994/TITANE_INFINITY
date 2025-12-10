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
  const [state, setState] = useState<HoloPresenceState>(holoPresenceEngine.getState());

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(newState => {
      setState(newState);
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
  const [visuals, setVisuals] = useState<HoloVisuals>(holoPresenceEngine.getVisuals());

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setVisuals(state.visuals);
    });
    return unsubscribe;
  }, []);

  return visuals;
}

/**
 * Hook: Forme holographique
 */
export function useHoloShape(): HoloShape {
  const [shape, setShape] = useState<HoloShape>(holoPresenceEngine.getVisuals().shape);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setShape(state.visuals.shape);
    });
    return unsubscribe;
  }, []);

  return shape;
}

/**
 * Hook: Couleurs holographiques
 */
export function useHoloColorsVisuals() {
  const [colors, setColors] = useState(holoPresenceEngine.getVisuals().colors);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setColors(state.visuals.colors);
    });
    return unsubscribe;
  }, []);

  return colors;
}

/**
 * Hook: Rotation holographique
 */
export function useHoloRotation() {
  const [rotation, setRotation] = useState(holoPresenceEngine.getVisuals().rotation);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setRotation(state.visuals.rotation);
    });
    return unsubscribe;
  }, []);

  return rotation;
}

/**
 * Hook: Taille holographique
 */
export function useHoloSize(): number {
  const [size, setSize] = useState(holoPresenceEngine.getVisuals().size);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setSize(state.visuals.size);
    });
    return unsubscribe;
  }, []);

  return size;
}

/**
 * Hook: Opacité holographique
 */
export function useHoloOpacity(): number {
  const [opacity, setOpacity] = useState(holoPresenceEngine.getVisuals().opacity);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setOpacity(state.visuals.opacity);
    });
    return unsubscribe;
  }, []);

  return opacity;
}

/**
 * Hook: Glow holographique
 */
export function useHoloGlow(): number {
  const [glow, setGlow] = useState(holoPresenceEngine.getVisuals().glow);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setGlow(state.visuals.glow);
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
    holoPresenceEngine.getParticles()
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setParticles(state.particles);
    });
    return unsubscribe;
  }, []);

  return particles;
}

/**
 * Hook: Nombre de particules
 */
export function useParticleCount(): number {
  const [count, setCount] = useState(holoPresenceEngine.getParticles().count);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setCount(state.particles.count);
    });
    return unsubscribe;
  }, []);

  return count;
}

/**
 * Hook: Comportement des particules
 */
export function useParticleBehavior(): string {
  const [behavior, setBehavior] = useState(holoPresenceEngine.getParticles().behavior);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setBehavior(state.particles.behavior);
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
    holoPresenceEngine.getAnimation()
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setAnimation(state.animation);
    });
    return unsubscribe;
  }, []);

  return animation;
}

/**
 * Hook: Animation de respiration
 */
export function useHoloBreathe() {
  const [breathe, setBreathe] = useState(holoPresenceEngine.getAnimation().breathe);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setBreathe(state.animation.breathe);
    });
    return unsubscribe;
  }, []);

  return breathe;
}

/**
 * Hook: Animation de pulsation
 */
export function useHoloPulse() {
  const [pulse, setPulse] = useState(holoPresenceEngine.getAnimation().pulse);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setPulse(state.animation.pulse);
    });
    return unsubscribe;
  }, []);

  return pulse;
}

/**
 * Hook: Animation de flux
 */
export function useHoloFlow() {
  const [flow, setFlow] = useState(holoPresenceEngine.getAnimation().flow);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setFlow(state.animation.flow);
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
    holoPresenceEngine.getState().currentIntensity
  );

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setIntensity(state.currentIntensity);
    });
    return unsubscribe;
  }, []);

  return intensity;
}

/**
 * Hook: Niveau d'énergie
 */
export function useHoloEnergyLevel(): number {
  const [energy, setEnergy] = useState(holoPresenceEngine.getState().energyLevel);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setEnergy(state.energyLevel);
    });
    return unsubscribe;
  }, []);

  return energy;
}

/**
 * Hook: Point de focus
 */
export function useHoloFocusPoint(): { x: number; y: number } {
  const [focusPoint, setFocusPoint] = useState(holoPresenceEngine.getState().focusPoint);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setFocusPoint(state.focusPoint);
    });
    return unsubscribe;
  }, []);

  return focusPoint;
}

/**
 * Hook: Visibilité
 */
export function useHoloVisible(): boolean {
  const [visible, setVisible] = useState(holoPresenceEngine.getState().isVisible);

  useEffect(() => {
    const unsubscribe = holoPresenceEngine.subscribe(state => {
      setVisible(state.isVisible);
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
    setShape: (shape: HoloShape) => {
      holoPresenceEngine.setShape(shape);
    },

    /**
     * Changer les couleurs
     */
    setColors: (colors: Partial<HoloVisuals['colors']>) => {
      holoPresenceEngine.setColors(colors);
    },

    /**
     * Déclencher un flash
     */
    flash: (intensity?: number) => {
      holoPresenceEngine.flash(intensity);
    },

    /**
     * Déclencher une pulsation
     */
    pulse: (intensity?: number, duration?: number) => {
      holoPresenceEngine.pulse(intensity, duration);
    },

    /**
     * Déclencher un burst
     */
    burst: (intensity?: number, color?: string) => {
      holoPresenceEngine.burst(intensity, color);
    },

    /**
     * Déclencher un événement personnalisé
     */
    triggerEvent: (event: HoloEvent) => {
      holoPresenceEngine.triggerEvent(event);
    },
  };
}
