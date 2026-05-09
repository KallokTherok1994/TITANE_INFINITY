import { describe, expect, it } from 'vitest';

import { buildReflectionPlan } from '../reflectionPlanner';

describe('reflectionPlanner', () => {
  it('garde la réflexion personnelle conservatrice', () => {
    const plan = buildReflectionPlan({ type: 'personal', subject: 'une hésitation' });

    expect(plan.memoryDepth).toBe('none');
    expect(plan.outputShape).toBe('mirror');
    expect(plan.mustAvoid).toContain('forcer une mémoire durable');
  });

  it('inclut les invariants techniques attendus', () => {
    const plan = buildReflectionPlan({ type: 'technical', subject: 'un patch' });

    expect(plan.lenses).toEqual(
      expect.arrayContaining(['surfaces touchées', 'invariants', 'risques', 'tests'])
    );
    expect(plan.mustAnswer).toEqual(
      expect.arrayContaining([
        'Quelles surfaces sont affectées ?',
        'Quels invariants doivent rester vrais ?',
        'Quels risques sont les plus probables ?',
        'Quels tests prouvent le changement ?',
      ])
    );
    expect(plan.nextLock).toBe('smallest safe delta');
  });

  it('borne la réflexion stratégique', () => {
    const plan = buildReflectionPlan({
      type: 'strategic',
      subject: 'une feuille de route',
    });

    expect(plan.outputShape).toBe('roadmap');
    expect(plan.stoplines.length).toBeGreaterThan(0);
    expect(plan.mustAnswer).toHaveLength(4);
  });

  it('synthétise l integration en une note utile', () => {
    const plan = buildReflectionPlan({
      type: 'integration',
      continuationRequested: true,
    });

    expect(plan.outputShape).toBe('integration_note');
    expect(plan.nextLock).toBe('one useful next action');
    expect(plan.stoplines).toContain('stop after synthesis plus next action');
  });
});
