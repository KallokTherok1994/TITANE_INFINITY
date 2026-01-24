/**
 * TITANE∞ v26.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * devSudoPatterns.test.ts - Unit Tests for Pattern Matching
 *
 * Tests the 138 DevSudoAction patterns and regex matching logic.
 * Coverage goal: 90%+
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
  DEV_SUDO_PATTERNS,
  matchPattern,
  containsDevSudoCommand,
} from './devSudoPatterns';
import { getActionDomain } from './devSudoLazyLoader';
import type { DevSudoAction } from './types';

describe('devSudoPatterns', () => {
  describe('DEV_SUDO_PATTERNS', () => {
    it('should have patterns for all actions', () => {
      expect(DEV_SUDO_PATTERNS).toBeDefined();
      expect(Object.keys(DEV_SUDO_PATTERNS).length).toBeGreaterThan(100);
    });

    it('should have valid regex patterns', () => {
      Object.entries(DEV_SUDO_PATTERNS).forEach(([action, patterns]) => {
        expect(patterns).toBeInstanceOf(Array);
        expect(patterns.length).toBeGreaterThan(0);
        patterns.forEach(pattern => {
          expect(pattern).toBeInstanceOf(RegExp);
        });
      });
    });
  });

  describe('matchPattern', () => {
    describe('Core Actions', () => {
      it('should match fix-deps command', () => {
        const result = matchPattern('fix deps');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('fix-deps');
        expect(result?.params).toBeDefined();
      });

      it('should match restart-tauri command', () => {
        const result = matchPattern('restart tauri');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('restart-tauri');
      });

      it('should match auto-fix command', () => {
        // Pattern expects "auto-fix" or "autofix" (with hyphen or no space)
        const result = matchPattern('auto-fix');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('auto-fix');
      });

      it('should match diagnostic command', () => {
        const result = matchPattern('diagnostic');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('diagnostic');
      });
    });

    describe('Pattern Variations', () => {
      it('should match case-insensitive patterns', () => {
        expect(matchPattern('FIX DEPS')).not.toBeNull();
        expect(matchPattern('Fix Deps')).not.toBeNull();
        expect(matchPattern('fix deps')).not.toBeNull();
      });

      it('should handle whitespace variations', () => {
        expect(matchPattern('fix deps')).not.toBeNull();
        expect(matchPattern('  fix deps  ')).not.toBeNull();
      });

      it('should match French variations', () => {
        // Using actual French pattern from fix-deps and restart-tauri
        const result = matchPattern('relance application');
        expect(result?.action).toBe('restart-tauri');
      });
    });

    describe('Parametric Commands', () => {
      it('should extract parameters from analyze-module', () => {
        // Pattern expects "analyse module X" or "show module X" (French or English variants)
        const result = matchPattern('show module UserAuth');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('analyze-module');
        expect(result?.params).toBeDefined();
        // Parameters extracted via capture groups
      });

      it('should extract parameters from explain-code', () => {
        // Pattern expects "explain X" or "explique X"
        const result = matchPattern('explain authentication flow');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('explain-code');
      });
    });

    describe('Invalid Inputs', () => {
      it('should return null for non-commands', () => {
        expect(matchPattern('hello world')).toBeNull();
        expect(matchPattern('random text')).toBeNull();
        expect(matchPattern('xyz123')).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(matchPattern('')).toBeNull();
        expect(matchPattern('   ')).toBeNull();
      });

      it('should handle special characters gracefully', () => {
        expect(matchPattern('fix-deps!@#')).toBeNull();
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long inputs', () => {
        const longInput = 'fix deps ' + 'x'.repeat(1000);
        const result = matchPattern(longInput);
        // Should not match (too long)
        expect(result).toBeNull();
      });

      it('should handle unicode characters', () => {
        const result = matchPattern('répare dépendances 🚀');
        // Should still match French variant
        expect(result).not.toBeNull();
      });
    });
  });

  describe('containsDevSudoCommand', () => {
    it('should detect valid commands', () => {
      expect(containsDevSudoCommand('fix deps')).toBe(true);
      expect(containsDevSudoCommand('restart tauri')).toBe(true);
      expect(containsDevSudoCommand('diagnostic')).toBe(true);
    });

    it('should reject non-commands', () => {
      expect(containsDevSudoCommand('hello world')).toBe(false);
      expect(containsDevSudoCommand('random text')).toBe(false);
      expect(containsDevSudoCommand('')).toBe(false);
    });

    it('should handle mixed case', () => {
      expect(containsDevSudoCommand('FIX DEPS')).toBe(true);
      expect(containsDevSudoCommand('Fix Deps')).toBe(true);
    });
  });

  describe('getActionDomain', () => {
    it('should map actions to correct domains', () => {
      // Using actions that actually exist in DEV_SUDO_PATTERNS and LazyLoader
      expect(getActionDomain('deep-heal' as DevSudoAction)).toBe('core');
      expect(getActionDomain('test-bubble' as DevSudoAction)).toBe('core');
      expect(getActionDomain('fix-deps' as DevSudoAction)).toBe('core');
      expect(getActionDomain('diagnostic' as DevSudoAction)).toBe('core');
    });

    it('should map every action to a known domain', () => {
      // Domain mapping lives in devSudoLazyLoader.ts; patterns evolve over time.
      // This test keeps coverage without assuming every domain must have patterns.
      const allowedDomains = new Set([
        'core',
        'ai-local-models',
        'ai-training',
        'ai-bubble',
        'data-collector',
        'hybrid',
        'fusion',
        'vocal-dev-console',
        'live-debugger',
        'talk-to-titane',
        'singularity',
        'vision',
        'titanone',
        'memory',
        'backend',
        'ide',
        'extended',
      ]);

      const actions = Object.keys(DEV_SUDO_PATTERNS) as DevSudoAction[];
      actions.forEach(action => {
        const domain = getActionDomain(action);
        expect(allowedDomains.has(domain)).toBe(true);
      });
    });
  });

  describe('Pattern Performance', () => {
    it('should match quickly', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        matchPattern('fix deps');
      }
      const end = performance.now();
      const avgTime = (end - start) / 1000;

      // Should match in less than 1ms on average
      expect(avgTime).toBeLessThan(1);
    });

    it('should handle non-matches quickly', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        matchPattern('random text that does not match any pattern');
      }
      const end = performance.now();
      const avgTime = (end - start) / 1000;

      // Should check all patterns quickly
      expect(avgTime).toBeLessThan(5);
    });
  });

  describe('Pattern Completeness', () => {
    it('should have patterns for key actions', () => {
      // Using only actions that actually exist in DEV_SUDO_PATTERNS
      const keyActions: DevSudoAction[] = [
        'fix-deps',
        'restart-tauri',
        'deep-heal',
        'test-bubble',
        'diagnostic',
        'introspect',
        'self-heal',
      ];

      keyActions.forEach(action => {
        const patterns = DEV_SUDO_PATTERNS[action];
        expect(patterns).toBeDefined();
        expect(patterns.length).toBeGreaterThan(0);
      });
    });

    it('should have multiple pattern variations for common actions', () => {
      // Common actions should have 2+ pattern variations
      // Using only actions that exist in DEV_SUDO_PATTERNS
      const commonActions: DevSudoAction[] = ['fix-deps', 'restart-tauri', 'diagnostic'];

      commonActions.forEach(action => {
        const patterns = DEV_SUDO_PATTERNS[action];
        expect(patterns).toBeDefined();
        expect(patterns.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Pattern Conflicts', () => {
    it('should not have ambiguous patterns', () => {
      // Test that each command matches to only one action
      // Using valid commands that exist in DEV_SUDO_PATTERNS
      const testCommands = ['fix deps', 'restart tauri', 'diagnostic', 'test bubble'];

      testCommands.forEach(cmd => {
        const matches: DevSudoAction[] = [];

        Object.entries(DEV_SUDO_PATTERNS).forEach(([action, patterns]) => {
          if (patterns.some(p => p.test(cmd))) {
            matches.push(action as DevSudoAction);
          }
        });

        // Each command should match exactly one action
        expect(matches.length).toBe(1);
      });
    });
  });

  describe('Regex Flags', () => {
    it('should use case-insensitive flag where appropriate', () => {
      Object.entries(DEV_SUDO_PATTERNS).forEach(([action, patterns]) => {
        patterns.forEach(pattern => {
          // Most patterns should be case-insensitive
          expect(pattern.flags).toContain('i');
        });
      });
    });
  });
});
