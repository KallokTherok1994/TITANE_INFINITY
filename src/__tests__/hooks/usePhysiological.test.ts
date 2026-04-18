import { describe, expect, it } from 'vitest';

import {
  useCognitiveSounds,
  useInteroception,
  usePhysiologicalState,
} from '@/hooks/usePhysiological';

describe('usePhysiological', () => {
  it('returns stable interoception defaults', () => {
    const result = useInteroception();

    expect(result.state.energy).toBe(0.75);
    expect(result.state.clarity).toBe(0.8);
    expect(typeof result.setEnergy).toBe('function');
  });

  it('returns callable cognitive sound helpers', () => {
    const result = useCognitiveSounds();

    expect(typeof result.playThinking).toBe('function');
    expect(typeof result.playInsight).toBe('function');
    expect(typeof result.playProcessing).toBe('function');
  });

  it('returns a bounded physiological snapshot', () => {
    const result = usePhysiologicalState();

    expect(result.homeostasis).toBe(0.9);
    expect(result.position).toEqual({ x: 0, y: 0, z: 0.5 });
    expect(result.distance).toBe(0.3);
  });
});