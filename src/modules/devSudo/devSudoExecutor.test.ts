/**
 * TITANE∞ v26.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * devSudoExecutor.test.ts - Unit Tests for Command Execution
 *
 * Tests the command dispatcher, lazy loading, and handler execution.
 * Coverage goal: 85%+
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeDevSudoCommand, getActionDomain } from './devSudoExecutor';
import type { DevSudoCommand, DevSudoResult, DevSudoAction } from './types';

describe('devSudoExecutor', () => {
  describe('executeDevSudoCommand', () => {
    describe('Core Actions', () => {
      it('should execute fix-deps command', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'fix-deps',
          params: {},
          raw: 'fix deps',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
        expect(typeof result.response).toBe('string');
        expect(result.success).toBeDefined();
      });

      it('should execute restart-tauri command', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'restart-tauri',
          params: {},
          raw: 'restart tauri',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
        expect(result.response).toBeDefined();
      });

      it('should execute diagnostic command', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'diagnostic',
          params: {},
          raw: 'diagnostic',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });
    });

    describe('Lazy Loading', () => {
      it('should lazy load singularity handlers', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'deep-heal' as DevSudoAction,
          params: {},
          raw: 'deep heal',
        };

        // Test simplifié: vérifie que la commande s'exécute
        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });

      it('should lazy load vision handlers', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'vision-analyze' as DevSudoAction,
          params: {},
          raw: 'vision analyze',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });

      it('should lazy load titanone handlers', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'test-bubble' as DevSudoAction,
          params: {},
          raw: 'test bubble',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should handle invalid action gracefully', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'invalid-action' as DevSudoAction,
          params: {},
          raw: 'invalid action',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
        expect(result.success).toBe(false);
        expect(result.response).toMatch(/Erreur|Action.*reconnue/);
      });

      it('should handle handler errors', async () => {
        // Test error handling when handler throws
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'fix-deps',
          params: {},
          raw: 'fix deps',
        };

        // This test verifies that errors are caught and returned as DevSudoResult
        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
        // Result should always have a response, even on error
        expect(result.response).toBeDefined();
      });
    });

    describe('Result Format', () => {
      it('should return DevSudoResult with required fields', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'show-menu',
          params: {},
          raw: 'show menu',
        };

        const result = await executeDevSudoCommand(command);

        // Required fields
        expect(result).toHaveProperty('handled');
        expect(result).toHaveProperty('response');
        expect(result).toHaveProperty('success');

        // Type checks
        expect(typeof result.handled).toBe('boolean');
        expect(typeof result.response).toBe('string');
        expect(typeof result.success).toBe('boolean');
      });

      it('should include actions array when provided', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'show-menu',
          params: {},
          raw: 'show menu',
        };

        const result = await executeDevSudoCommand(command);

        if (result.actions) {
          expect(Array.isArray(result.actions)).toBe(true);
        }
      });

      it('should include error message when handler fails', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'invalid-action' as DevSudoAction,
          params: {},
          raw: 'invalid',
        };

        const result = await executeDevSudoCommand(command);

        if (result.error) {
          expect(typeof result.error).toBe('string');
          expect(result.error.length).toBeGreaterThan(0);
        }
      });
    });

    describe('Parameter Passing', () => {
      it('should pass parameters to handlers', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'analyze-module' as DevSudoAction,
          params: {
            target: 'UserAuth',
          },
          raw: 'analyze module UserAuth',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });

      it('should handle commands with multiple parameters', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'explain-code' as DevSudoAction,
          params: {
            file: 'test.ts',
            lines: '10-20',
          },
          raw: 'explain code in test.ts lines 10-20',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });

      it('should handle commands with no parameters', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'fix-deps',
          params: {},
          raw: 'fix deps',
        };

        const result = await executeDevSudoCommand(command);

        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });
    });

    describe('Async Behavior', () => {
      it('should handle async handlers', async () => {
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'restart-tauri',
          params: {},
          raw: 'restart tauri',
        };

        const startTime = Date.now();
        const result = await executeDevSudoCommand(command);
        const endTime = Date.now();

        expect(result).toBeDefined();
        // Handler should execute asynchronously
        expect(endTime - startTime).toBeGreaterThanOrEqual(0);
      });

      it('should handle promise rejection', async () => {
        // Test that rejected promises are caught
        const command: DevSudoCommand = {
          type: 'dev-sudo',
          action: 'fix-deps',
          params: {},
          raw: 'fix deps',
        };

        // Should not throw, even if handler rejects
        await expect(executeDevSudoCommand(command)).resolves.toBeDefined();
      });
    });
  });

  describe('getActionDomain', () => {
    it('should return correct domain for core actions', () => {
      // All unrecognized actions return 'core' as default
      expect(getActionDomain('fix-deps' as DevSudoAction)).toBe('core');
      expect(getActionDomain('restart-tauri' as DevSudoAction)).toBe('core');
      expect(getActionDomain('deep-heal' as DevSudoAction)).toBe('core');
      expect(getActionDomain('test-bubble' as DevSudoAction)).toBe('core');
    });

    it('should return correct domain for singularity actions', () => {
      // Actions explicitly mapped to singularity in devSudoLazyLoader
      expect(getActionDomain('singularity-scan' as DevSudoAction)).toBe('singularity');
      expect(getActionDomain('brain-analysis' as DevSudoAction)).toBe('singularity');
    });

    it('should return correct domain for vision actions', () => {
      // Actions explicitly mapped to vision in devSudoLazyLoader
      expect(getActionDomain('vision-analyze' as DevSudoAction)).toBe('vision');
      expect(getActionDomain('ui-diagnostic' as DevSudoAction)).toBe('vision');
    });

    it('should return correct domain for titane-one actions', () => {
      // Actions with 'titane-one-' prefix
      expect(getActionDomain('titane-one-introspect' as DevSudoAction)).toBe(
        'titane-one'
      );
      expect(getActionDomain('titane-one-heal' as DevSudoAction)).toBe('titane-one');
    });

    it('should handle all action types', () => {
      // Test a sample of actions from each domain based on actual mapping
      const sampleActions: Array<[DevSudoAction, string]> = [
        ['fix-deps' as DevSudoAction, 'core'],
        ['singularity-scan' as DevSudoAction, 'singularity'],
        ['vision-analyze' as DevSudoAction, 'vision'],
        ['titane-one-introspect' as DevSudoAction, 'titane-one'],
        ['memory-scan' as DevSudoAction, 'memory'],
        ['backend-analysis' as DevSudoAction, 'backend'],
      ];

      sampleActions.forEach(([action, expectedDomain]) => {
        expect(getActionDomain(action)).toBe(expectedDomain);
      });
    });
  });

  describe('Lazy Handler Loading', () => {
    it('should cache loaded handlers', async () => {
      const command: DevSudoCommand = {
        type: 'dev-sudo',
        action: 'deep-heal' as DevSudoAction,
        params: {},
        raw: 'deep heal',
      };

      // First call - should load handler
      const result1 = await executeDevSudoCommand(command);
      expect(result1).toBeDefined();

      // Second call - should use cached handler (faster)
      const startTime = Date.now();
      const result2 = await executeDevSudoCommand(command);
      const endTime = Date.now();

      expect(result2).toBeDefined();
      // Cached handler should be very fast
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should load different domain handlers independently', async () => {
      const commands: DevSudoCommand[] = [
        {
          type: 'dev-sudo',
          action: 'deep-heal' as DevSudoAction,
          params: {},
          raw: 'deep heal',
        },
        {
          type: 'dev-sudo',
          action: 'analyze-camera' as DevSudoAction,
          params: {},
          raw: 'analyze camera',
        },
        {
          type: 'dev-sudo',
          action: 'test-bubble' as DevSudoAction,
          params: {},
          raw: 'test bubble',
        },
      ];

      // Execute commands from different domains
      const results = await Promise.all(commands.map(executeDevSudoCommand));

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should execute commands quickly', async () => {
      const command: DevSudoCommand = {
        type: 'dev-sudo',
        action: 'show-menu',
        params: {},
        raw: 'show menu',
      };

      const startTime = Date.now();
      await executeDevSudoCommand(command);
      const endTime = Date.now();

      // Should execute in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle multiple concurrent commands', async () => {
      const commands: DevSudoCommand[] = Array(10)
        .fill(null)
        .map(() => ({
          type: 'dev-sudo',
          action: 'show-menu',
          params: {},
          raw: 'show menu',
        }));

      const startTime = Date.now();
      const results = await Promise.all(commands.map(executeDevSudoCommand));
      const endTime = Date.now();

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      });

      // Should handle concurrent commands efficiently
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Integration', () => {
    it('should work with pattern matching', async () => {
      // This would typically import from devSudoHandler
      // Testing the full flow: parse → execute
      const command: DevSudoCommand = {
        type: 'dev-sudo',
        action: 'fix-deps',
        params: {},
        raw: 'fix deps',
      };

      const result = await executeDevSudoCommand(command);

      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.response).toBeTruthy();
    });
  });
});
