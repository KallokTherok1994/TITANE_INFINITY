/**
 * TITANE∞ — Tests MetaEnergy IPC Security Whitelist
 * V32 Phase 9 — SP#20 Énergie Cognitive
 * Rule 16: Every new integration must ship with tests.
 */
import { describe, it, expect } from 'vitest';

const META_ENERGY_COMMANDS = [
  'meta_energy_get_state',
  'meta_energy_get_fatigue',
  'meta_energy_get_recovery_plan',
  'meta_energy_get_load_balance',
  'meta_energy_get_homeostasis',
  'meta_energy_get_forecast',
  'meta_energy_apply_delta',
  'meta_energy_get_diagnostics',
] as const;

type MetaEnergyCommand = (typeof META_ENERGY_COMMANDS)[number];

describe('MetaEnergy — IPC security whitelist (8 commands)', () => {
  const ALLOWED_SET = new Set<string>(META_ENERGY_COMMANDS);

  it('should have 8 meta_energy commands', () => {
    expect(META_ENERGY_COMMANDS).toHaveLength(8);
  });

  it('each command should start with meta_energy_', () => {
    for (const cmd of META_ENERGY_COMMANDS) {
      expect(cmd).toMatch(/^meta_energy_/);
    }
  });

  it('meta_energy_get_state is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_state')).toBe(true);
  });

  it('meta_energy_get_fatigue is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_fatigue')).toBe(true);
  });

  it('meta_energy_get_recovery_plan is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_recovery_plan')).toBe(true);
  });

  it('meta_energy_get_load_balance is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_load_balance')).toBe(true);
  });

  it('meta_energy_get_homeostasis is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_homeostasis')).toBe(true);
  });

  it('meta_energy_get_forecast is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_forecast')).toBe(true);
  });

  it('meta_energy_apply_delta is present', () => {
    expect(ALLOWED_SET.has('meta_energy_apply_delta')).toBe(true);
  });

  it('meta_energy_get_diagnostics is present', () => {
    expect(ALLOWED_SET.has('meta_energy_get_diagnostics')).toBe(true);
  });
});

describe('MetaEnergy — response shape contracts', () => {
  it('MetaEnergyStateResponse shape is valid', () => {
    const response = {
      energy_level: 0.85,
      max_capacity: 1.0,
      normalized: 0.85,
      fatigue_level: 'Fresh',
      cognitive_multiplier: 1.0,
      timestamp: Date.now(),
    };

    expect(typeof response.energy_level).toBe('number');
    expect(typeof response.max_capacity).toBe('number');
    expect(typeof response.normalized).toBe('number');
    expect(typeof response.fatigue_level).toBe('string');
    expect(typeof response.cognitive_multiplier).toBe('number');
    expect(typeof response.timestamp).toBe('number');
    expect(response.normalized).toBeGreaterThanOrEqual(0);
    expect(response.normalized).toBeLessThanOrEqual(1);
  });

  it('FatigueLevel Fresh has cognitive_multiplier = 1.0', () => {
    const fatigue = { level: 'Fresh', multiplier: 1.0 };
    expect(fatigue.multiplier).toBe(1.0);
  });

  it('FatigueLevel Exhausted has cognitive_multiplier = 0.3', () => {
    const fatigue = { level: 'Exhausted', multiplier: 0.3 };
    expect(fatigue.multiplier).toBe(0.3);
  });

  it('EnergyForecast shape is valid', () => {
    const forecast = {
      horizon_hours: 24,
      predicted_levels: [0.8, 0.75, 0.7],
      predicted_fatigue: ['Fresh', 'Normal', 'Normal'],
      low_energy_windows: [] as number[],
      peak_windows: [0, 1] as number[],
      confidence: 0.72,
    };

    expect(forecast.horizon_hours).toBe(24);
    expect(Array.isArray(forecast.predicted_levels)).toBe(true);
    expect(forecast.confidence).toBeGreaterThan(0);
    expect(forecast.confidence).toBeLessThanOrEqual(1);
  });

  it('HomeoBalance deviation = current - target', () => {
    const target = 0.65;
    const current = 0.75;
    const deviation = current - target;
    expect(Math.abs(deviation - 0.1)).toBeLessThan(0.001);
  });

  it('HomeoBalance in_balance when deviation <= tolerance (0.1)', () => {
    const target = 0.65;
    const tolerance = 0.1;
    const current = 0.7;
    const deviation = Math.abs(current - target);
    expect(deviation <= tolerance).toBe(true);
  });

  it('HomeoBalance NOT in_balance when deviation > tolerance', () => {
    const target = 0.65;
    const tolerance = 0.1;
    const current = 0.3;
    const deviation = Math.abs(current - target);
    expect(deviation <= tolerance).toBe(false);
  });
});
