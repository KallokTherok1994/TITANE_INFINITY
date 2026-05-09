import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnergyEngine } from '@/engines/time';

describe('energy engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 8, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('predicts canonical energy peaks and logs manual energy truthfully', () => {
    const energy = new EnergyEngine('intermediate');

    expect(energy.inferEnergyLevelFromTime('11:00')).toBeGreaterThan(
      energy.inferEnergyLevelFromTime('13:30')
    );

    energy.generateForecast();
    const bestSlot = energy.getState().forecast.reduce(
      (best, point) => (point.level > best.level ? point : best),
      energy.getState().forecast[0] ?? { time: '10:00', level: 0.5, label: '' }
    );
    expect(energy.recommendHighEnergySlot()).toBe(bestSlot.time);

    energy.logManualEnergy(0.42, 'Afternoon slump');
    const state = energy.getState();
    expect(energy.getCurrentLevel()).toBeCloseTo(0.42);
    expect(state.energyHistory.at(-1)).toEqual(
      expect.objectContaining({
        source: 'manual',
        activity: 'Afternoon slump',
        level: 0.42,
      })
    );
  });

  it('finds the next peak for the configured chronotype', () => {
    vi.setSystemTime(new Date(2026, 4, 9, 20, 0, 0));

    const energy = new EnergyEngine('night_owl');
    expect(energy.getChronotype()).toBe('night_owl');
    expect(energy.getNextPeak()?.time).toBe('22:00');
  });
});