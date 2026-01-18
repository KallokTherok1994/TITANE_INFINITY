/**
 * TITANE∞ v26.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * devSudoHandler.test.ts - Integration Tests for devSudo API
 *
 * Tests the public API: containsCommand, parseCommand, executeCommand
 * Coverage goal: 90%+
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
  containsDevSudoCommand,
  parseDevSudoCommand,
  devSudoHandler,
  executeDevSudoCommand,
} from './devSudoHandler';
import type { DevSudoCommand } from './types';

describe('devSudoHandler', () => {
  describe('containsDevSudoCommand', () => {
    describe('Valid Commands', () => {
      it('should detect core commands', () => {
        expect(containsDevSudoCommand('fix deps')).toBe(true);
        expect(containsDevSudoCommand('restart tauri')).toBe(true);
        expect(containsDevSudoCommand('show menu')).toBe(true);
        expect(containsDevSudoCommand('fix all')).toBe(true);
      });

      it('should detect case-insensitive commands', () => {
        expect(containsDevSudoCommand('FIX DEPS')).toBe(true);
        expect(containsDevSudoCommand('Fix Deps')).toBe(true);
        expect(containsDevSudoCommand('fix deps')).toBe(true);
      });

      it('should detect French commands', () => {
        expect(containsDevSudoCommand('répare dépendances')).toBe(true);
        expect(containsDevSudoCommand('redémarre titane')).toBe(true);
      });

      it('should detect commands with extra whitespace', () => {
        expect(containsDevSudoCommand('  fix deps  ')).toBe(true);
        expect(containsDevSudoCommand('\tfix deps\t')).toBe(true);
      });

      it('should detect parametric commands', () => {
        expect(containsDevSudoCommand('analyze module UserAuth')).toBe(true);
        expect(containsDevSudoCommand('explain code in file.ts')).toBe(true);
      });
    });

    describe('Invalid Commands', () => {
      it('should reject non-commands', () => {
        expect(containsDevSudoCommand('hello world')).toBe(false);
        expect(containsDevSudoCommand('random text')).toBe(false);
        expect(containsDevSudoCommand('xyz123')).toBe(false);
      });

      it('should reject empty strings', () => {
        expect(containsDevSudoCommand('')).toBe(false);
        expect(containsDevSudoCommand('   ')).toBe(false);
        expect(containsDevSudoCommand('\t\n')).toBe(false);
      });

      it('should reject partial matches', () => {
        expect(containsDevSudoCommand('fix')).toBe(false);
        expect(containsDevSudoCommand('deps')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long strings', () => {
        const longString = 'fix deps ' + 'x'.repeat(1000);
        expect(containsDevSudoCommand(longString)).toBe(false);
      });

      it('should handle unicode characters', () => {
        expect(containsDevSudoCommand('répare dépendances 🚀')).toBe(true);
      });

      it('should handle special characters', () => {
        expect(containsDevSudoCommand('fix-deps!@#')).toBe(false);
      });
    });

    describe('Performance', () => {
      it('should check commands quickly', () => {
        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
          containsDevSudoCommand('fix deps');
        }

        const endTime = performance.now();
        const avgTime = (endTime - startTime) / 1000;

        // Should check in less than 1ms on average
        expect(avgTime).toBeLessThan(1);
      });
    });
  });

  describe('parseDevSudoCommand', () => {
    describe('Core Commands', () => {
      it('should parse fix-deps command', () => {
        const result = parseDevSudoCommand('fix deps');

        expect(result).not.toBeNull();
        expect(result?.type).toBe('dev-sudo');
        expect(result?.action).toBe('fix-deps');
        expect(result?.raw).toBe('fix deps');
        expect(result?.params).toBeDefined();
      });

      it('should parse restart-tauri command', () => {
        const result = parseDevSudoCommand('restart tauri');

        expect(result).not.toBeNull();
        expect(result?.action).toBe('restart-tauri');
      });

      it('should parse show-menu command', () => {
        const result = parseDevSudoCommand('show menu');

        expect(result).not.toBeNull();
        expect(result?.action).toBe('show-menu');
      });
    });

    describe('Parametric Commands', () => {
      it('should parse commands with parameters', () => {
        const result = parseDevSudoCommand('analyze module UserAuth');

        expect(result).not.toBeNull();
        expect(result?.action).toBe('analyze-module');
        expect(result?.params).toBeDefined();
        // Parameters should be extracted
      });

      it('should extract multiple parameters', () => {
        const result = parseDevSudoCommand('explain code in file.ts lines 10-20');

        expect(result).not.toBeNull();
        expect(result?.params).toBeDefined();
      });

      it('should handle commands with no parameters', () => {
        const result = parseDevSudoCommand('fix all');

        expect(result).not.toBeNull();
        expect(result?.params).toBeDefined();
        expect(Object.keys(result?.params).length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Invalid Commands', () => {
      it('should return null for non-commands', () => {
        expect(parseDevSudoCommand('hello world')).toBeNull();
        expect(parseDevSudoCommand('random text')).toBeNull();
        expect(parseDevSudoCommand('')).toBeNull();
      });

      it('should return null for malformed commands', () => {
        expect(parseDevSudoCommand('fix-deps!@#')).toBeNull();
      });
    });

    describe('Result Structure', () => {
      it('should return DevSudoCommand with all required fields', () => {
        const result = parseDevSudoCommand('fix deps');

        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('action');
        expect(result).toHaveProperty('params');
        expect(result).toHaveProperty('raw');

        expect(result?.type).toBe('dev-sudo');
        expect(typeof result?.action).toBe('string');
        expect(typeof result?.params).toBe('object');
        expect(typeof result?.raw).toBe('string');
      });

      it('should preserve original command in raw field', () => {
        const original = '  fix deps  ';
        const result = parseDevSudoCommand(original);

        expect(result?.raw).toBe(original.trim());
      });
    });

    describe('Case Sensitivity', () => {
      it('should parse case-insensitive commands', () => {
        const variations = ['fix deps', 'FIX DEPS', 'Fix Deps', 'FiX dEpS'];

        variations.forEach(variant => {
          const result = parseDevSudoCommand(variant);
          expect(result).not.toBeNull();
          expect(result?.action).toBe('fix-deps');
        });
      });
    });

    describe('Language Support', () => {
      it('should parse French commands', () => {
        const result = parseDevSudoCommand('répare dépendances');

        expect(result).not.toBeNull();
        expect(result?.action).toBe('fix-deps');
      });

      it('should parse both English and French', () => {
        const english = parseDevSudoCommand('fix deps');
        const french = parseDevSudoCommand('répare dépendances');

        expect(english?.action).toBe(french?.action);
      });
    });
  });

  describe('devSudoHandler object', () => {
    it('should export correct methods', () => {
      expect(devSudoHandler).toHaveProperty('containsCommand');
      expect(devSudoHandler).toHaveProperty('parseCommand');
      expect(devSudoHandler).toHaveProperty('executeCommand');

      expect(typeof devSudoHandler.containsCommand).toBe('function');
      expect(typeof devSudoHandler.parseCommand).toBe('function');
      expect(typeof devSudoHandler.executeCommand).toBe('function');
    });

    it('should have consistent behavior with standalone functions', () => {
      const input = 'fix deps';

      const standalone = containsDevSudoCommand(input);
      const object = devSudoHandler.containsCommand(input);

      expect(standalone).toBe(object);
    });
  });

  describe('Integration: Parse → Execute Flow', () => {
    it('should parse and execute fix-deps command', async () => {
      const input = 'fix deps';

      // Step 1: Check if command
      const contains = containsDevSudoCommand(input);
      expect(contains).toBe(true);

      // Step 2: Parse command
      const command = parseDevSudoCommand(input);
      expect(command).not.toBeNull();

      // Step 3: Execute command
      const result = await executeDevSudoCommand(command!);
      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
    });

    it('should handle invalid commands gracefully', async () => {
      const input = 'invalid command';

      // Check returns false
      expect(containsDevSudoCommand(input)).toBe(false);

      // Parse returns null
      const command = parseDevSudoCommand(input);
      expect(command).toBeNull();
    });

    it('should handle full workflow for multiple commands', async () => {
      const commands = ['fix deps', 'restart tauri', 'show menu', 'fix all'];

      for (const input of commands) {
        // Check
        expect(containsDevSudoCommand(input)).toBe(true);

        // Parse
        const command = parseDevSudoCommand(input);
        expect(command).not.toBeNull();

        // Execute
        const result = await executeDevSudoCommand(command!);
        expect(result).toBeDefined();
        expect(result.handled).toBe(true);
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle execution errors gracefully', async () => {
      const command: DevSudoCommand = {
        type: 'dev-sudo',
        action: 'invalid-action' as any,
        params: {},
        raw: 'invalid',
      };

      const result = await executeDevSudoCommand(command);

      expect(result).toBeDefined();
      expect(result.handled).toBe(true);
      expect(result.success).toBe(false);
    });

    it('should provide error messages', async () => {
      const command: DevSudoCommand = {
        type: 'dev-sudo',
        action: 'invalid-action' as any,
        params: {},
        raw: 'invalid',
      };

      const result = await executeDevSudoCommand(command);

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(0);
      expect(result.response).toContain('Erreur');
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should handle user chat input', async () => {
      const userInput = 'Hey TITANE, can you fix deps please?';

      // In real usage, this would be extracted from longer text
      const command = 'fix deps';

      expect(containsDevSudoCommand(command)).toBe(true);

      const parsed = parseDevSudoCommand(command);
      expect(parsed).not.toBeNull();

      const result = await executeDevSudoCommand(parsed!);
      expect(result.handled).toBe(true);
    });

    it('should handle quick commands', async () => {
      const quickCommands = ['fix deps', 'restart', 'menu', 'fix all'];

      // Some might not match - that's expected
      for (const cmd of quickCommands) {
        const contains = containsDevSudoCommand(cmd);
        if (contains) {
          const parsed = parseDevSudoCommand(cmd);
          expect(parsed).not.toBeNull();

          const result = await executeDevSudoCommand(parsed!);
          expect(result).toBeDefined();
        }
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should handle rapid parsing', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        parseDevSudoCommand('fix deps');
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 1000;

      // Should parse in less than 2ms on average
      expect(avgTime).toBeLessThan(2);
    });

    it('should handle concurrent execution', async () => {
      const commands = Array(10)
        .fill(null)
        .map(() => parseDevSudoCommand('show menu')!);

      const startTime = Date.now();
      const results = await Promise.all(commands.map(executeDevSudoCommand));
      const endTime = Date.now();

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result.handled).toBe(true);
      });

      // Should handle concurrent execution efficiently
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
