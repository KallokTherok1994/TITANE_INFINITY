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
  getActionDomain,
} from './devSudoPatterns';
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

      it('should match fix-all command', () => {
        const result = matchPattern('fix all');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('fix-all');
      });

      it('should match show-menu command', () => {
        const result = matchPattern('show menu');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('show-menu');
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
        const result = matchPattern('répare dépendances');
        expect(result?.action).toBe('fix-deps');
      });
    });

    describe('Parametric Commands', () => {
      it('should extract parameters from analyze-module', () => {
        const result = matchPattern('analyze module UserAuth');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('analyze-module');
        expect(result?.params).toBeDefined();
        // Parameters extracted via capture groups
      });

      it('should extract parameters from explain-code', () => {
        const result = matchPattern('explain code in file.ts');
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
      expect(containsDevSudoCommand('show menu')).toBe(true);
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
      expect(getActionDomain('deep-heal' as DevSudoAction)).toBe('singularity');
      expect(getActionDomain('analyze-camera' as DevSudoAction)).toBe('vision');
      expect(getActionDomain('test-bubble' as DevSudoAction)).toBe('titanone');
      expect(getActionDomain('fix-deps' as DevSudoAction)).toBe('core');
    });

    it('should handle all domains', () => {
      const domains = [
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
      ];

      domains.forEach(domain => {
        // Each domain should have at least one action
        const actions = Object.keys(DEV_SUDO_PATTERNS) as DevSudoAction[];
        const domainActions = actions.filter(
          action => getActionDomain(action) === domain
        );
        expect(domainActions.length).toBeGreaterThan(0);
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
      const keyActions: DevSudoAction[] = [
        'fix-deps',
        'restart-tauri',
        'fix-all',
        'show-menu',
        'deep-heal',
        'test-bubble',
        'analyze-camera',
      ];

      keyActions.forEach(action => {
        const patterns = DEV_SUDO_PATTERNS[action];
        expect(patterns).toBeDefined();
        expect(patterns.length).toBeGreaterThan(0);
      });
    });

    it('should have multiple pattern variations for common actions', () => {
      // Common actions should have 2+ pattern variations
      const commonActions: DevSudoAction[] = ['fix-deps', 'restart-tauri', 'fix-all'];

      commonActions.forEach(action => {
        const patterns = DEV_SUDO_PATTERNS[action];
        expect(patterns.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Pattern Conflicts', () => {
    it('should not have ambiguous patterns', () => {
      // Test that each command matches to only one action
      const testCommands = ['fix deps', 'restart tauri', 'show menu', 'test bubble'];

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
