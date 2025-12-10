/**
 * TITANE∞ v19.2Ω — Tests: Chat Modes System
 * Tests unitaires pour le système de modes
 */

import { describe, it, expect } from 'vitest';
import {
  CHAT_MODES_CONFIG,
  ACTIVE_MODE_IDS,
  getModeConfig,
  isModeAllowed,
  getAccessibleModes,
  isToolAllowed,
  validateModeId,
  validateModeConfig,
  toLegacyModeConfig,
  TOOLS_MINIMAL,
  TOOLS_STANDARD,
  TOOLS_DEV,
  TOOLS_ADMIN,
  type ChatModeId,
  type PermissionLevel,
} from '../services/ai/chatModes.config';

describe('🟣 Chat Modes Configuration', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STRUCTURE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Structure & Integrity', () => {
    it('should have all required modes defined', () => {
      const requiredModes: ChatModeId[] = [
        'default',
        'brainstorming',
        'synthesis',
        'planning',
        'journal',
        'debug_cognitive',
        'coach',
        'dev',
        'admin',
        'strategy',
        'audit',
      ];

      requiredModes.forEach(modeId => {
        expect(CHAT_MODES_CONFIG[modeId]).toBeDefined();
        expect(CHAT_MODES_CONFIG[modeId].id).toBe(modeId);
      });
    });

    it('should have valid configuration for each mode', () => {
      Object.values(CHAT_MODES_CONFIG).forEach(mode => {
        // Identité
        expect(typeof mode.id).toBe('string');
        expect(typeof mode.label).toBe('string');
        expect(mode.label.length).toBeGreaterThan(0);
        expect(typeof mode.description).toBe('string');
        expect(typeof mode.icon).toBe('string');

        // IA Configuration
        expect(typeof mode.systemPrompt).toBe('string');
        expect(mode.systemPrompt.length).toBeGreaterThan(10);
        expect(mode.temperature).toBeGreaterThanOrEqual(0);
        expect(mode.temperature).toBeLessThanOrEqual(1);
        expect(mode.maxTokens).toBeGreaterThan(0);

        // Sécurité
        expect(mode.permissionLevel).toBeGreaterThanOrEqual(0);
        expect(mode.permissionLevel).toBeLessThanOrEqual(5);
        expect(typeof mode.toolsAllowed).toBe('object');

        // Métadonnées
        expect(typeof mode.enabled).toBe('boolean');
        expect(typeof mode.sortOrder).toBe('number');
      });
    });

    it('should have unique sortOrders for enabled modes', () => {
      const enabledModes = Object.values(CHAT_MODES_CONFIG).filter(m => m.enabled);
      const sortOrders = enabledModes.map(m => m.sortOrder);
      const uniqueSortOrders = new Set(sortOrders);
      expect(sortOrders.length).toBe(uniqueSortOrders.size);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISSIONS & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Permissions & Security', () => {
    it('should correctly enforce permission levels', () => {
      // Admin requires level 5
      expect(isModeAllowed('admin', 5)).toBe(true);
      expect(isModeAllowed('admin', 4)).toBe(false);
      expect(isModeAllowed('admin', 0)).toBe(false);

      // Dev requires level 3
      expect(isModeAllowed('dev', 3)).toBe(true);
      expect(isModeAllowed('dev', 2)).toBe(false);

      // Default requires level 1
      expect(isModeAllowed('default', 1)).toBe(true);
      expect(isModeAllowed('default', 0)).toBe(false);
    });

    it('should filter accessible modes by permission level', () => {
      const level1Modes = getAccessibleModes(1);
      const level3Modes = getAccessibleModes(3);
      const level5Modes = getAccessibleModes(5);

      expect(level1Modes.length).toBeGreaterThan(0);
      expect(level3Modes.length).toBeGreaterThanOrEqual(level1Modes.length);
      expect(level5Modes.length).toBeGreaterThanOrEqual(level3Modes.length);

      // Admin should only be in level 5
      expect(level1Modes.find(m => m.id === 'admin')).toBeUndefined();
      expect(level5Modes.find(m => m.id === 'admin')).toBeDefined();
    });

    it('should restrict sensitive tools to appropriate modes', () => {
      // Shell execution only for admin
      expect(isToolAllowed('admin', 'shellExecution')).toBe(true);
      expect(isToolAllowed('dev', 'shellExecution')).toBe(false);
      expect(isToolAllowed('default', 'shellExecution')).toBe(false);

      // File system access only for admin
      expect(isToolAllowed('admin', 'fileSystemAccess')).toBe(true);
      expect(isToolAllowed('audit', 'fileSystemAccess')).toBe(false);

      // Code generation for dev, admin, audit
      expect(isToolAllowed('dev', 'codeGeneration')).toBe(true);
      expect(isToolAllowed('admin', 'codeGeneration')).toBe(true);
      expect(isToolAllowed('audit', 'codeGeneration')).toBe(true);
      expect(isToolAllowed('coach', 'codeGeneration')).toBe(false);
    });

    it('should have basic tools for all modes', () => {
      const basicTools: (keyof typeof TOOLS_MINIMAL)[] = [
        'memoryAccess',
        'contextAnalysis',
        'suggestionEngine',
      ];

      Object.values(CHAT_MODES_CONFIG).forEach(mode => {
        basicTools.forEach(tool => {
          expect(mode.toolsAllowed[tool]).toBe(true);
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOL PRESETS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Tool Presets', () => {
    it('should have TOOLS_MINIMAL as most restrictive', () => {
      expect(TOOLS_MINIMAL.shellExecution).toBe(false);
      expect(TOOLS_MINIMAL.fileSystemAccess).toBe(false);
      expect(TOOLS_MINIMAL.codeGeneration).toBe(false);
      expect(TOOLS_MINIMAL.memoryAccess).toBe(true);
    });

    it('should have TOOLS_STANDARD extend TOOLS_MINIMAL', () => {
      expect(TOOLS_STANDARD.memoryAccess).toBe(true);
      expect(TOOLS_STANDARD.taskCreation).toBe(true);
      expect(TOOLS_STANDARD.shellExecution).toBe(false);
    });

    it('should have TOOLS_DEV include dev capabilities', () => {
      expect(TOOLS_DEV.codeGeneration).toBe(true);
      expect(TOOLS_DEV.codeReview).toBe(true);
      expect(TOOLS_DEV.debugAssist).toBe(true);
      expect(TOOLS_DEV.shellExecution).toBe(false);
    });

    it('should have TOOLS_ADMIN include all capabilities', () => {
      expect(TOOLS_ADMIN.shellExecution).toBe(true);
      expect(TOOLS_ADMIN.fileSystemAccess).toBe(true);
      expect(TOOLS_ADMIN.configModification).toBe(true);
      expect(TOOLS_ADMIN.auditLogs).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Validation', () => {
    it('should validate correct mode IDs', () => {
      expect(validateModeId('default')).toBe(true);
      expect(validateModeId('brainstorming')).toBe(true);
      expect(validateModeId('dev')).toBe(true);
      expect(validateModeId('admin')).toBe(true);
    });

    it('should reject invalid mode IDs', () => {
      expect(validateModeId('invalid')).toBe(false);
      expect(validateModeId('')).toBe(false);
      expect(validateModeId(null)).toBe(false);
      expect(validateModeId(undefined)).toBe(false);
      expect(validateModeId(123)).toBe(false);
    });

    it('should validate complete mode config', () => {
      const validConfig = CHAT_MODES_CONFIG.default;
      expect(validateModeConfig(validConfig)).toBe(true);
    });

    it('should reject incomplete mode config', () => {
      expect(validateModeConfig({})).toBe(false);
      expect(validateModeConfig({ id: 'test' })).toBe(false);
      expect(validateModeConfig(null)).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Utilities', () => {
    it('should get mode config with fallback to default', () => {
      const defaultConfig = getModeConfig('default');
      expect(defaultConfig.id).toBe('default');

      const invalidConfig = getModeConfig('invalid_mode' as ChatModeId);
      expect(invalidConfig.id).toBe('default');
    });

    it('should convert to legacy format correctly', () => {
      const extended = CHAT_MODES_CONFIG.brainstorming;
      const legacy = toLegacyModeConfig(extended);

      expect(legacy.name).toBe(extended.label);
      expect(legacy.description).toBe(extended.description);
      expect(legacy.systemPrompt).toBe(extended.systemPrompt);
      expect(legacy.temperature).toBe(extended.temperature);
      expect(legacy.icon).toBe(extended.icon);
    });

    it('should have correct ACTIVE_MODE_IDS order', () => {
      expect(ACTIVE_MODE_IDS.length).toBeGreaterThan(0);
      expect(ACTIVE_MODE_IDS[0]).toBe('default');

      // Vérifier que tous sont enabled
      ACTIVE_MODE_IDS.forEach(id => {
        expect(CHAT_MODES_CONFIG[id].enabled).toBe(true);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE SPECIFICS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Mode Specifics', () => {
    it('should have appropriate temperature for each mode type', () => {
      // Creative modes should have higher temperature
      expect(CHAT_MODES_CONFIG.brainstorming.temperature).toBeGreaterThanOrEqual(0.8);

      // Technical modes should have lower temperature
      expect(CHAT_MODES_CONFIG.dev.temperature).toBeLessThanOrEqual(0.6);
      expect(CHAT_MODES_CONFIG.admin.temperature).toBeLessThanOrEqual(0.5);
      expect(CHAT_MODES_CONFIG.audit.temperature).toBeLessThanOrEqual(0.6);
    });

    it('should have memory scope appropriate for mode', () => {
      // Personal modes should be session-scoped
      expect(CHAT_MODES_CONFIG.journal.memoryScope).toBe('session');

      // Project-oriented modes should be project-scoped
      expect(CHAT_MODES_CONFIG.planning.memoryScope).toBe('project');
      expect(CHAT_MODES_CONFIG.dev.memoryScope).toBe('project');

      // Admin should be global
      expect(CHAT_MODES_CONFIG.admin.memoryScope).toBe('global');
    });

    it('should have appropriate suggested actions', () => {
      Object.values(CHAT_MODES_CONFIG).forEach(mode => {
        expect(mode.suggestedActions.length).toBeGreaterThanOrEqual(2);
        mode.suggestedActions.forEach(action => {
          expect(typeof action).toBe('string');
          expect(action.length).toBeGreaterThan(5);
        });
      });
    });
  });
});
