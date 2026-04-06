/**
 * TITANE∞ Skill OS — Lifecycle Management (Layer 8)
 * Full pipeline: ingest → classify → translate → install → activate.
 * Also: disable, archive, reinstall, uninstall.
 */

import type {
  TitaneSkillPackage,
  SkillLifecycleResult,
  SkillImportInput,
  SkillLifecycleState,
  SkillSourceType,
} from '../types';
import { ingestSource } from '../ingestion/sourceParser';
import { translateToNativePackage } from '../translation/skillTranslator';
import {
  installSkill,
  uninstallSkill,
  getSkillById,
  updateSkillState,
} from '../registry/skillRegistry';
import {
  activateSkill,
  deactivateSkill,
  getActiveSkillId,
} from '../activation/skillActivator';
import { validateSkillPackage } from '../skillManifest';

// ─────────────────────────────────────────────────────────────────────────────
// FULL INSTALL PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/** Run the full import → analyze → translate → install pipeline */
export function fullInstallPipeline(input: SkillImportInput): SkillLifecycleResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Step 1: Ingest
    const { dossier } = ingestSource(input.source, input.sourceType, input.name);

    // Step 2: Translate
    const pkg = translateToNativePackage(dossier, input.sourceType, 'user-import');

    // Step 3: Validate
    const validation = validateSkillPackage(pkg);
    if (!validation.valid) {
      return {
        success: false,
        previousState: 'DISCOVERED',
        newState: 'FAILED',
        message: `Validation failed: ${validation.errors.join(', ')}`,
        warnings,
        errors: validation.errors,
      };
    }

    // Step 4: Check for duplicates
    if (getSkillById(pkg.manifest.id)) {
      warnings.push('Skill already installed — use reinstall to update');
      return {
        success: false,
        previousState: getSkillById(pkg.manifest.id)!.manifest.state,
        newState: getSkillById(pkg.manifest.id)!.manifest.state,
        message: 'Skill already installed',
        warnings,
        errors: ['Duplicate skill ID'],
      };
    }

    // Step 5: Install
    const installed = installSkill(pkg);
    if (!installed) {
      return {
        success: false,
        previousState: 'DISCOVERED',
        newState: 'FAILED',
        message: 'Failed to install skill in registry',
        warnings,
        errors: ['Registry write failed'],
      };
    }

    // Collect portability warnings
    if (pkg.manifest.state === 'DEGRADED') {
      const unsupported = pkg.manifest.portabilityMatrix.assessments
        .filter(a => a.classification === 'UNSUPPORTED')
        .map(a => a.element);
      const external = pkg.manifest.portabilityMatrix.assessments
        .filter(a => a.classification === 'EXTERNAL_DEPENDENCY')
        .map(a => a.element);
      if (unsupported.length > 0)
        warnings.push(`Unsupported features: ${unsupported.join(', ')}`);
      if (external.length > 0)
        warnings.push(`External dependencies: ${external.join(', ')}`);
    }

    return {
      success: true,
      previousState: 'DISCOVERED',
      newState: pkg.manifest.state,
      message: `Skill "${pkg.manifest.name}" installed successfully (state: ${pkg.manifest.state})`,
      warnings,
      errors: [],
    };
  } catch (err) {
    return {
      success: false,
      previousState: 'DISCOVERED',
      newState: 'FAILED',
      message: `Pipeline error: ${err instanceof Error ? err.message : String(err)}`,
      warnings,
      errors: [String(err)],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Disable an installed skill */
export function disableSkill(skillId: string): SkillLifecycleResult {
  const pkg = getSkillById(skillId);
  if (!pkg) return failResult(skillId, 'not found');
  const prevState = pkg.manifest.state;

  if (getActiveSkillId() === skillId) {
    deactivateSkill(skillId);
  }

  updateSkillState(skillId, 'DISABLED');
  return {
    success: true,
    previousState: prevState,
    newState: 'DISABLED',
    message: `Skill "${pkg.manifest.name}" disabled`,
    warnings: [],
    errors: [],
  };
}

/** Archive a skill (retained for history, not usable) */
export function archiveSkill(skillId: string): SkillLifecycleResult {
  const pkg = getSkillById(skillId);
  if (!pkg) return failResult(skillId, 'not found');
  const prevState = pkg.manifest.state;

  if (getActiveSkillId() === skillId) {
    deactivateSkill(skillId);
  }

  updateSkillState(skillId, 'ARCHIVED');
  return {
    success: true,
    previousState: prevState,
    newState: 'ARCHIVED',
    message: `Skill "${pkg.manifest.name}" archived`,
    warnings: [],
    errors: [],
  };
}

/** Reinstall a skill (uninstall then re-run pipeline) */
export function reinstallSkill(input: SkillImportInput): SkillLifecycleResult {
  // Try to find existing skill by name
  const { dossier } = ingestSource(input.source, input.sourceType, input.name);
  const existing = getSkillById(dossier.skillId);

  if (existing) {
    uninstallSkill(existing.manifest.id);
  }

  return fullInstallPipeline(input);
}

/** Complete uninstall — removes from registry */
export function fullUninstall(skillId: string): SkillLifecycleResult {
  const pkg = getSkillById(skillId);
  if (!pkg) return failResult(skillId, 'not found');
  const prevState = pkg.manifest.state;

  if (getActiveSkillId() === skillId) {
    deactivateSkill(skillId);
  }

  uninstallSkill(skillId);
  return {
    success: true,
    previousState: prevState,
    newState: 'ARCHIVED',
    message: `Skill "${pkg.manifest.name}" uninstalled`,
    warnings: [],
    errors: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function failResult(skillId: string, reason: string): SkillLifecycleResult {
  return {
    success: false,
    previousState: 'DISCOVERED',
    newState: 'FAILED',
    message: `Cannot operate on skill ${skillId}: ${reason}`,
    warnings: [],
    errors: [reason],
  };
}
