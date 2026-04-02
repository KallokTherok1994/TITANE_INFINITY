/**
 * TITANE∞ Skill OS — Integration Tests
 * Tests for ingestion, classification, translation, registry, activation, lifecycle.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ingestPrompt,
  ingestManifest,
  ingestSource,
  classifyPortability,
  translateToNativePackage,
  getSkillRegistry,
  installSkill,
  getSkillById,
  uninstallSkill,
  activateSkill,
  deactivateSkill,
  getActiveSkill,
  getActiveSkillId,
  getSystemPromptForSkill,
  fullInstallPipeline,
  disableSkill,
  archiveSkill,
  validateSkillPackage,
} from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// TEST DATA
// ─────────────────────────────────────────────────────────────────────────────

const SIMPLE_PROMPT = `# Python Expert
You are an expert Python developer. You help users write clean, efficient Python code.
You follow PEP8 standards and always include type hints.`;

const MANIFEST_JSON = JSON.stringify({
  name: 'Weather Assistant',
  description: 'Helps with weather-related questions',
  instructions:
    'You are a weather assistant. You help users understand weather patterns and forecasts.',
  conversation_starters: ['What is the weather like today?', 'Explain weather patterns'],
  tools: [
    { name: 'get_weather', description: 'Get current weather' },
    { name: 'web_search', description: 'Search the web' },
  ],
});

const GPT_JSON = JSON.stringify({
  gpt: {
    name: 'Code Reviewer',
    description: 'Reviews code for best practices',
    instructions: 'You review code and suggest improvements.',
    conversation_starters: ['Review my Python code'],
    capabilities: [{ type: 'actions', name: 'github_api', description: 'Access GitHub' }],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1: INGESTION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Ingestion', () => {
  it('should ingest a raw prompt', () => {
    const { envelope, dossier } = ingestPrompt(SIMPLE_PROMPT, 'Python Expert');

    expect(envelope.sourceType).toBe('prompt');
    expect(envelope.rawInstructions).toContain('expert Python developer');
    expect(dossier.skillName).toBe('Python Expert');
    expect(dossier.instructions).toContain('PEP8');
  });

  it('should ingest a JSON manifest', () => {
    const { envelope, dossier } = ingestManifest(MANIFEST_JSON);

    expect(envelope.sourceType).toBe('manifest');
    expect(dossier.skillName).toBe('Weather Assistant');
    expect(dossier.tools).toHaveLength(2);
    expect(dossier.tools[0].name).toBe('get_weather');
  });

  it('should ingest GPT-like metadata', () => {
    const { dossier } = ingestSource(GPT_JSON, 'gpt-import');

    expect(dossier.skillName).toBe('Code Reviewer');
    expect(dossier.authRequirements).toHaveLength(1);
    expect(dossier.authRequirements[0].service).toBe('github_api');
  });

  it('should extract behaviors from instructions', () => {
    const { dossier } = ingestPrompt('You help users analyze data and write code.');

    expect(dossier.targetBehaviors).toContain('analysis');
    expect(dossier.targetBehaviors).toContain('coding');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3: CLASSIFICATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Classification', () => {
  it('should classify instructions as directly portable', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT);
    const matrix = classifyPortability(dossier);

    expect(matrix.overallRisk).toBe('LOW');
    expect(matrix.portable).toBeGreaterThan(0);
  });

  it('should classify external dependency for auth-required tools', () => {
    const { dossier } = ingestSource(GPT_JSON, 'gpt-import');
    const matrix = classifyPortability(dossier);

    expect(matrix.externalDependency).toBeGreaterThan(0);
    expect(matrix.overallRisk).not.toBe('LOW');
  });

  it('should classify known TITANE tools as directly portable', () => {
    const { dossier } = ingestManifest(MANIFEST_JSON);
    const matrix = classifyPortability(dossier);

    const webSearchAssessment = matrix.assessments.find(a => a.element === 'web_search');
    expect(webSearchAssessment?.classification).toBe('DIRECTLY_PORTABLE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4: TRANSLATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Translation', () => {
  it('should translate a prompt to INSTALLED state', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT);
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    expect(pkg.manifest.state).toBe('INSTALLED');
    expect(pkg.manifest.id).toMatch(/^titane-skill-/);
    expect(pkg.behavior.systemPrompt).toContain('Python');
  });

  it('should translate GPT with auth to DEGRADED state', () => {
    const { dossier } = ingestSource(GPT_JSON, 'gpt-import');
    const pkg = translateToNativePackage(dossier, 'gpt-import', 'test');

    expect(pkg.manifest.state).toBe('DEGRADED');
  });

  it('should clean ChatGPT references', () => {
    const prompt = 'You are ChatGPT, built by OpenAI. You use GPT-4.';
    const { dossier } = ingestPrompt(prompt);
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    expect(pkg.behavior.systemPrompt).not.toContain('ChatGPT');
    expect(pkg.behavior.systemPrompt).not.toContain('OpenAI');
    expect(pkg.behavior.systemPrompt).toContain('TITANE');
  });

  it('should produce valid package with all contracts', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT);
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    expect(pkg.manifest).toBeDefined();
    expect(pkg.behavior).toBeDefined();
    expect(pkg.knowledge).toBeDefined();
    expect(pkg.activation).toBeDefined();
    expect(pkg.proof).toBeDefined();
    expect(pkg.rollback).toBeDefined();
    expect(pkg.proof.installedCriteria.length).toBeGreaterThan(0);
    expect(pkg.proof.activatedCriteria.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 5: REGISTRY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Registry', () => {
  beforeEach(() => {
    // Clean up any existing skills
    const registry = getSkillRegistry();
    for (const entry of registry) {
      uninstallSkill(entry.id);
    }
  });

  it('should install a skill into registry', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Test Skill');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    const installed = installSkill(pkg);
    expect(installed).toBe(true);

    const found = getSkillById(pkg.manifest.id);
    expect(found).toBeDefined();
    expect(found?.manifest.name).toBe('Test Skill');
  });

  it('should reject duplicate installation', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Duplicate Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    const duplicate = installSkill(pkg);
    expect(duplicate).toBe(false);
  });

  it('should list installed skills', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'List Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    const registry = getSkillRegistry();
    expect(registry.length).toBeGreaterThan(0);
    expect(registry.some(e => e.name === 'List Test')).toBe(true);
  });

  it('should uninstall a skill', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Uninstall Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    uninstallSkill(pkg.manifest.id);

    const found = getSkillById(pkg.manifest.id);
    expect(found).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 6: ACTIVATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Activation', () => {
  beforeEach(() => {
    const registry = getSkillRegistry();
    for (const entry of registry) {
      uninstallSkill(entry.id);
    }
    deactivateSkill('any');
  });

  it('should activate a skill', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Activate Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    const activated = activateSkill(pkg.manifest.id);

    expect(activated).toBe(true);
    expect(getActiveSkillId()).toBe(pkg.manifest.id);
  });

  it('should provide system prompt for active skill', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Prompt Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    activateSkill(pkg.manifest.id);

    const prompt = getSystemPromptForSkill(pkg.manifest.id);
    expect(prompt).toContain('Python');
  });

  it('should deactivate a skill', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Deactivate Test');
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    installSkill(pkg);
    activateSkill(pkg.manifest.id);
    deactivateSkill(pkg.manifest.id);

    expect(getActiveSkillId()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 8: LIFECYCLE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Lifecycle', () => {
  beforeEach(() => {
    const registry = getSkillRegistry();
    for (const entry of registry) {
      uninstallSkill(entry.id);
    }
  });

  it('should run full install pipeline for prompt', () => {
    const result = fullInstallPipeline({
      source: SIMPLE_PROMPT,
      sourceType: 'prompt',
      name: 'Pipeline Test',
    });

    expect(result.success).toBe(true);
    expect(result.newState).toBe('INSTALLED');
    expect(result.message).toContain('installed successfully');
  });

  it('should run full install pipeline for manifest', () => {
    const result = fullInstallPipeline({
      source: MANIFEST_JSON,
      sourceType: 'manifest',
    });

    expect(result.success).toBe(true);
  });

  it('should disable a skill', () => {
    const result = fullInstallPipeline({
      source: SIMPLE_PROMPT,
      sourceType: 'prompt',
      name: 'Disable Test',
    });
    expect(result.success).toBe(true);

    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Disable Test');
    const disableResult = disableSkill(dossier.skillId);

    expect(disableResult.success).toBe(true);
    expect(disableResult.newState).toBe('DISABLED');
  });

  it('should archive a skill', () => {
    const result = fullInstallPipeline({
      source: SIMPLE_PROMPT,
      sourceType: 'prompt',
      name: 'Archive Test',
    });
    expect(result.success).toBe(true);

    const { dossier } = ingestPrompt(SIMPLE_PROMPT, 'Archive Test');
    const archiveResult = archiveSkill(dossier.skillId);

    expect(archiveResult.success).toBe(true);
    expect(archiveResult.newState).toBe('ARCHIVED');
  });

  it('should reject duplicate installation in pipeline', () => {
    fullInstallPipeline({
      source: SIMPLE_PROMPT,
      sourceType: 'prompt',
      name: 'Duplicate Pipeline',
    });

    const result = fullInstallPipeline({
      source: SIMPLE_PROMPT,
      sourceType: 'prompt',
      name: 'Duplicate Pipeline',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Duplicate skill ID');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Skill OS — Validation', () => {
  it('should validate a complete package', () => {
    const { dossier } = ingestPrompt(SIMPLE_PROMPT);
    const pkg = translateToNativePackage(dossier, 'prompt', 'test');

    const validation = validateSkillPackage(pkg);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject invalid package', () => {
    const validation = validateSkillPackage({ invalid: true });
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
