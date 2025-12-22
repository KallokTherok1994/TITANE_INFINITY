/**
 * TITANE∞ Audit System Integration Tests
 *
 * @description Tests de vérification pour le système d'audit complet
 * @version 26.2.0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const AUDIT_SCRIPTS_DIR = path.join(PROJECT_ROOT, 'scripts', 'audit');

describe('🔍 Audit System Verification', () => {
  describe('📜 Audit Scripts Existence', () => {
    const requiredScripts = [
      { name: '00-master-audit.sh', description: 'Master Orchestrator' },
      { name: '01-security-audit.sh', description: 'Security Audit' },
      { name: '02-architecture-audit.sh', description: 'Architecture Audit' },
      { name: '03-performance-measure.sh', description: 'Performance Measurement' },
      { name: '04-test-coverage.sh', description: 'Test Coverage' },
      { name: '05-deployment-audit.sh', description: 'Deployment Audit' },
      { name: '06-auto-fix.sh', description: 'Auto Fix' },
      { name: '07-quality-gates.sh', description: 'Quality Gates' },
    ];

    it.each(requiredScripts)('should have $description script ($name)', ({ name }) => {
      const scriptPath = path.join(AUDIT_SCRIPTS_DIR, name);
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it.each(requiredScripts)('should have executable $name', ({ name }) => {
      const scriptPath = path.join(AUDIT_SCRIPTS_DIR, name);
      if (fs.existsSync(scriptPath)) {
        const stats = fs.statSync(scriptPath);
        // Check if executable bit is set (mode & 0o111)
        expect(stats.mode & 0o111).toBeGreaterThan(0);
      }
    });

    it.each(requiredScripts)('$name should have valid bash shebang', ({ name }) => {
      const scriptPath = path.join(AUDIT_SCRIPTS_DIR, name);
      if (fs.existsSync(scriptPath)) {
        const content = fs.readFileSync(scriptPath, 'utf-8');
        const hasValidShebang =
          content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env bash');
        expect(hasValidShebang).toBe(true);
      }
    });
  });

  describe('🔧 Auto-Fix Script Features', () => {
    let autoFixContent: string;

    beforeAll(() => {
      const autoFixPath = path.join(AUDIT_SCRIPTS_DIR, '06-auto-fix.sh');
      autoFixContent = fs.readFileSync(autoFixPath, 'utf-8');
    });

    it('should have ESLint fix function', () => {
      expect(autoFixContent).toContain('fix_eslint');
    });

    it('should have Prettier fix function', () => {
      expect(autoFixContent).toContain('fix_prettier');
    });

    it('should have permission fix function', () => {
      expect(autoFixContent).toContain('fix_script_permissions');
    });

    it('should have help option', () => {
      expect(autoFixContent).toContain('--help');
    });

    it('should have selective fix options', () => {
      expect(autoFixContent).toContain('--lint');
      expect(autoFixContent).toContain('--format');
      expect(autoFixContent).toContain('--perms');
    });
  });

  describe('🚦 Quality Gates Script Features', () => {
    let qualityGatesContent: string;

    beforeAll(() => {
      const qualityGatesPath = path.join(AUDIT_SCRIPTS_DIR, '07-quality-gates.sh');
      qualityGatesContent = fs.readFileSync(qualityGatesPath, 'utf-8');
    });

    it('should check build configuration', () => {
      expect(qualityGatesContent).toContain('check_build_gate');
    });

    it('should check Tauri configuration', () => {
      expect(qualityGatesContent).toContain('check_tauri_gate');
    });

    it('should check runtime configurations', () => {
      expect(qualityGatesContent).toContain('check_runtime_gate');
    });

    it('should check deployment scripts', () => {
      expect(qualityGatesContent).toContain('check_deployment_gate');
    });

    it('should check CI/CD workflows', () => {
      expect(qualityGatesContent).toContain('check_cicd_gate');
    });

    it('should check documentation', () => {
      expect(qualityGatesContent).toContain('check_docs_gate');
    });

    it('should have pass/fail/warn functions', () => {
      expect(qualityGatesContent).toContain('gate_pass');
      expect(qualityGatesContent).toContain('gate_fail');
      expect(qualityGatesContent).toContain('gate_warn');
    });
  });

  describe('🌟 Master Audit Script Features', () => {
    let masterAuditContent: string;

    beforeAll(() => {
      const masterAuditPath = path.join(AUDIT_SCRIPTS_DIR, '00-master-audit.sh');
      masterAuditContent = fs.readFileSync(masterAuditPath, 'utf-8');
    });

    it('should define audit scripts array', () => {
      expect(masterAuditContent).toContain('AUDITS=');
    });

    it('should calculate weighted scores', () => {
      expect(masterAuditContent).toContain('weighted_sum');
      expect(masterAuditContent).toContain('total_weight');
    });

    it('should generate grade from score', () => {
      expect(masterAuditContent).toContain('get_grade');
    });

    it('should generate master report', () => {
      expect(masterAuditContent).toContain('generate_master_report');
      expect(masterAuditContent).toContain('MASTER_AUDIT_REPORT.md');
    });

    it('should have proper weighting for audits', () => {
      // Security: 25%, Architecture: 20%, Performance: 15%, Test: 20%, Deploy: 20%
      expect(masterAuditContent).toContain(':Security:25');
      expect(masterAuditContent).toContain(':Architecture:20');
      expect(masterAuditContent).toContain(':Performance:15');
      expect(masterAuditContent).toContain(':Test Coverage:20');
      expect(masterAuditContent).toContain(':Deployment:20');
    });
  });

  describe('📚 Documentation', () => {
    it('should have perfection plan document', () => {
      const perfectionPlanPath = path.join(PROJECT_ROOT, 'docs', 'PERFECTION_PLAN.md');
      expect(fs.existsSync(perfectionPlanPath)).toBe(true);
    });

    it('perfection plan should have all phases', () => {
      const perfectionPlanPath = path.join(PROJECT_ROOT, 'docs', 'PERFECTION_PLAN.md');
      const content = fs.readFileSync(perfectionPlanPath, 'utf-8');

      expect(content).toContain('Phase 1');
      expect(content).toContain('Phase 2');
      expect(content).toContain('Phase 3');
      expect(content).toContain('Phase 4');
      expect(content).toContain('Phase 5');
    });

    it('perfection plan should document all audit scripts', () => {
      const perfectionPlanPath = path.join(PROJECT_ROOT, 'docs', 'PERFECTION_PLAN.md');
      const content = fs.readFileSync(perfectionPlanPath, 'utf-8');

      expect(content).toContain('00-master-audit.sh');
      expect(content).toContain('06-auto-fix.sh');
      expect(content).toContain('07-quality-gates.sh');
    });

    it('should have deployment guide', () => {
      const deployGuide = path.join(PROJECT_ROOT, 'docs', 'DEPLOYMENT_GUIDE.md');
      expect(fs.existsSync(deployGuide)).toBe(true);
    });
  });

  describe('📂 Reports Directory Structure', () => {
    it('should have reports directory', () => {
      const reportsDir = path.join(PROJECT_ROOT, 'reports');
      expect(fs.existsSync(reportsDir)).toBe(true);
    });

    it('reports directory should be in .gitignore', () => {
      const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
      const content = fs.readFileSync(gitignorePath, 'utf-8');

      // Check if reports/ is ignored (exact match or with variations)
      const hasReportsIgnore =
        content.includes('reports/') ||
        content.includes('reports') ||
        content.includes('/reports');

      expect(hasReportsIgnore).toBe(true);
    });
  });

  describe('🔄 Script Syntax Validation', () => {
    const scriptsToValidate = [
      '00-master-audit.sh',
      '06-auto-fix.sh',
      '07-quality-gates.sh',
    ];

    it.each(scriptsToValidate)('%s should have valid bash syntax', scriptName => {
      const scriptPath = path.join(AUDIT_SCRIPTS_DIR, scriptName);

      // execSync throws if syntax check fails, so reaching here means success
      execSync(`bash -n "${scriptPath}"`, { encoding: 'utf-8' });
    });
  });

  describe('🎯 Audit System Completeness', () => {
    it('should have complete audit coverage', () => {
      const auditCategories = [
        'security',
        'architecture',
        'performance',
        'coverage', // test-coverage script
        'deployment',
      ];

      const scripts = fs.readdirSync(AUDIT_SCRIPTS_DIR);

      auditCategories.forEach(category => {
        const hasScript = scripts.some(s => s.toLowerCase().includes(category));
        expect(hasScript).toBe(true);
      });
    });

    it('should have orchestration script', () => {
      const scripts = fs.readdirSync(AUDIT_SCRIPTS_DIR);
      const hasOrchestrator = scripts.some(s => s.startsWith('00-'));
      expect(hasOrchestrator).toBe(true);
    });

    it('should have auto-fix capabilities', () => {
      const scripts = fs.readdirSync(AUDIT_SCRIPTS_DIR);
      const hasAutoFix = scripts.some(s => s.includes('auto-fix'));
      expect(hasAutoFix).toBe(true);
    });

    it('should have quality gates', () => {
      const scripts = fs.readdirSync(AUDIT_SCRIPTS_DIR);
      const hasQualityGates = scripts.some(s => s.includes('quality-gates'));
      expect(hasQualityGates).toBe(true);
    });
  });
});
