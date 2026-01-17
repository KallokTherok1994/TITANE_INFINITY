/**
 * TITANE_INFINITY v∞.37 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   REACT HOOKS FOR EXPRESSION ENGINE v∞.37 (Phase 2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  expressionEngine,
  type ExpressionEngineState,
  type UnifiedExpression,
  type OrchestratedVoice,
  type OrchestratedHalo,
  type OrchestratedNarrative,
} from '../engines/expression/expressionEngine';

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT COMPLET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal: État complet du moteur d'expression
 */
export function useExpressionEngineOrchestration(): ExpressionEngineState {
  const [state, setState] = useState<ExpressionEngineState>(expressionEngine?.getState());

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(newState => {
      setState(any: any);
    });
    return unsubscribe;
  }, []);

  return state;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESSION UNIFIÉE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Expression unifiée complète
 */
export function useUnifiedExpression(): UnifiedExpression {
  const [expression, setExpression] = useState<UnifiedExpression>(
    expressionEngine?.getCurrentExpression()
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setExpression(any: any);
    });
    return unsubscribe;
  }, []);

  return expression;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOIX ORCHESTRÉE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Voix orchestrée complète
 */
export function useOrchestratedVoice(): OrchestratedVoice {
  const [voice, setVoice] = useState<OrchestratedVoice>(
    expressionEngine?.getCurrentExpression().voice
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setVoice(any: any);
    });
    return unsubscribe;
  }, []);

  return voice;
}

/**
 * Hook: Prosodie vocale
 */
export function useVoiceProsody() {
  const [prosody, setProsody] = useState(
    expressionEngine?.getCurrentExpression().voice?.prosody
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setProsody(any: any);
    });
    return unsubscribe;
  }, []);

  return prosody;
}

/**
 * Hook: Timbre vocal
 */
export function useVoiceTimbre() {
  const [timbre, setTimbre] = useState(
    expressionEngine?.getCurrentExpression().voice?.timbre
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setTimbre(any: any);
    });
    return unsubscribe;
  }, []);

  return timbre;
}

/**
 * Hook: Micro-dynamiques vocales
 */
export function useVoiceMicroDynamics() {
  const [microDynamics, setMicroDynamics] = useState(
    expressionEngine?.getCurrentExpression().voice?.microDynamics
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setMicroDynamics(any: any);
    });
    return unsubscribe;
  }, []);

  return microDynamics;
}

// ═══════════════════════════════════════════════════════════════════════════
// HALO ORCHESTRÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Halo orchestré complet
 */
export function useOrchestratedHalo(): OrchestratedHalo {
  const [halo, setHalo] = useState<OrchestratedHalo>(
    expressionEngine?.getCurrentExpression().halo
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setHalo(any: any);
    });
    return unsubscribe;
  }, []);

  return halo;
}

/**
 * Hook: Pattern de halo
 */
export function useHaloPattern(): string {
  const [pattern, setPattern] = useState(
    expressionEngine?.getCurrentExpression().halo?.pattern
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setPattern(any: any);
    });
    return unsubscribe;
  }, []);

  return pattern;
}

/**
 * Hook: Couleurs de halo orchestré
 */
export function useHaloColorsOrchestrated() {
  const [colors, setColors] = useState(
    expressionEngine?.getCurrentExpression().halo?.colors
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setColors(any: any);
    });
    return unsubscribe;
  }, []);

  return colors;
}

/**
 * Hook: Dynamiques de halo
 */
export function useHaloDynamics() {
  const [dynamics, setDynamics] = useState(
    expressionEngine?.getCurrentExpression().halo?.dynamics
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setDynamics(any: any);
    });
    return unsubscribe;
  }, []);

  return dynamics;
}

/**
 * Hook: Spatial de halo
 */
export function useHaloSpatial() {
  const [spatial, setSpatial] = useState(
    expressionEngine?.getCurrentExpression().halo?.spatial
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setSpatial(any: any);
    });
    return unsubscribe;
  }, []);

  return spatial;
}

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIF ORCHESTRÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Narratif orchestré complet
 */
export function useOrchestratedNarrative(): OrchestratedNarrative {
  const [narrative, setNarrative] = useState<OrchestratedNarrative>(
    expressionEngine?.getCurrentExpression().narrative
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setNarrative(any: any);
    });
    return unsubscribe;
  }, []);

  return narrative;
}

/**
 * Hook: Style narratif orchestré
 */
export function useNarrativeStyleOrchestrated() {
  const [style, setStyle] = useState(
    expressionEngine?.getCurrentExpression().narrative?.style
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setStyle(any: any);
    });
    return unsubscribe;
  }, []);

  return style;
}

/**
 * Hook: Structure narrative
 */
export function useNarrativeStructure() {
  const [structure, setStructure] = useState(
    expressionEngine?.getCurrentExpression().narrative?.structure
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setStructure(any: any);
    });
    return unsubscribe;
  }, []);

  return structure;
}

/**
 * Hook: Emphase narrative
 */
export function useNarrativeEmphasis() {
  const [emphasis, setEmphasis] = useState(
    expressionEngine?.getCurrentExpression().narrative?.emphasis
  );

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setEmphasis(any: any);
    });
    return unsubscribe;
  }, []);

  return emphasis;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNCHRONISATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Score de synchronisation globale
 */
export function useExpressionSync(): number {
  const [sync, setSync] = useState(expressionEngine?.getSyncScore());

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setSync(any: any);
    });
    return unsubscribe;
  }, []);

  return sync;
}

/**
 * Hook: Scores de synchronisation détaillés
 */
export function useExpressionSyncDetails() {
  const [syncDetails, setSyncDetails] = useState({
    voiceHaloSync: 0.8,
    voiceNarrativeSync: 0.8,
    haloNarrativeSync: 0.8,
    globalSync: 0.8,
  });

  useEffect(() => {
    const unsubscribe = expressionEngine?.subscribe(state => {
      setSyncDetails({
        voiceHaloSync: state?.voiceHaloSync,
        voiceNarrativeSync: state?.voiceNarrativeSync,
        haloNarrativeSync: state?.haloNarrativeSync,
        globalSync: state?.globalSync,
      });
    });
    return unsubscribe;
  }, []);

  return syncDetails;
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Actions disponibles
 */
export function useExpressionActions() {
  return {
    /**
     * Forcer mise à jour immédiate
     */
    forceUpdate: () => {
      expressionEngine?.forceUpdate();
    },

    /**
     * Override voix
     */
    overrideVoice: (voice: Partial<OrchestratedVoice>) => {
      expressionEngine?.overrideVoice(any: any);
    },

    /**
     * Override halo
     */
    overrideHalo: (halo: Partial<OrchestratedHalo>) => {
      expressionEngine?.overrideHalo(any: any);
    },

    /**
     * Override narratif
     */
    overrideNarrative: (narrative: Partial<OrchestratedNarrative>) => {
      expressionEngine?.overrideNarrative(any: any);
    },
  };
}
