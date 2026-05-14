/**
 * TITANE_INFINITY v34.3.0 — Command Palette catalogs integrity tests (Rule 16).
 */
import { describe, expect, it } from 'vitest';
import { PALETTE_ROUTES } from '@/components/palette/commands/routes';
import { PALETTE_AGENTS } from '@/components/palette/commands/agents';
import { PALETTE_ACTIONS } from '@/components/palette/commands/actions';
import { ALLOWED_COMMANDS } from '@/lib/security';

describe('Command Palette catalogs', () => {
  it('exposes the canonical 12 TITANE routes', () => {
    expect(PALETTE_ROUTES.length).toBe(12);
    const ids = new Set(PALETTE_ROUTES.map((r) => r.id));
    expect(ids.size).toBe(PALETTE_ROUTES.length);
    PALETTE_ROUTES.forEach((route) => {
      expect(route.to.startsWith('/')).toBe(true);
      expect(route.label.length).toBeGreaterThan(0);
    });
  });

  it('exposes the 6 advanced agents with stable dashboard testids', () => {
    expect(PALETTE_AGENTS.length).toBe(6);
    const expected = new Set([
      'monitoring-dashboard',
      'diagnostic-panel',
      'explainability-dashboard',
      'orchestrator-dashboard',
      'security-dashboard',
      'log-analysis-dashboard',
    ]);
    PALETTE_AGENTS.forEach((agent) => {
      expect(expected.has(agent.testid)).toBe(true);
    });
  });

  it('only ships allowlisted IPC commands (or the reserved reload sentinel)', () => {
    expect(PALETTE_ACTIONS.length).toBeGreaterThan(0);
    PALETTE_ACTIONS.forEach((action) => {
      if (action.command === '__reload_window__') return;
      expect(ALLOWED_COMMANDS.has(action.command)).toBe(true);
    });
  });
});
