/**
 * TITANE∞ Skill OS — Chat Activation Layer (Layer 6)
 * Manages which skill is active and provides system prompt injection.
 */

import type { TitaneSkillPackage } from '../types';
import {
  getSkillById,
  updateSkillState,
  getActiveSkills,
} from '../registry/skillRegistry';

let currentActiveSkillId: string | null = null;

/** Activate a skill for use in chat */
export function activateSkill(skillId: string): boolean {
  const pkg = getSkillById(skillId);
  if (!pkg) return false;
  if (pkg.manifest.state === 'FAILED' || pkg.manifest.state === 'ARCHIVED') return false;

  // Deactivate any currently active skill
  if (currentActiveSkillId && currentActiveSkillId !== skillId) {
    deactivateSkill(currentActiveSkillId);
  }

  currentActiveSkillId = skillId;
  updateSkillState(skillId, 'ACTIVE');
  return true;
}

/** Deactivate a skill */
export function deactivateSkill(skillId: string): boolean {
  if (currentActiveSkillId === skillId) {
    currentActiveSkillId = null;
  }
  updateSkillState(skillId, 'INSTALLED');
  return true;
}

/** Get the currently active skill */
export function getActiveSkill(): TitaneSkillPackage | null {
  if (!currentActiveSkillId) return null;
  return getSkillById(currentActiveSkillId) || null;
}

/** Get the system prompt for the active skill (for injection into chat engine) */
export function getSystemPromptForSkill(skillId: string): string | null {
  const pkg = getSkillById(skillId);
  if (!pkg || pkg.manifest.state !== 'ACTIVE') return null;
  return pkg.behavior.systemPrompt;
}

/** Check if a skill is currently active */
export function isSkillActive(skillId: string): boolean {
  return currentActiveSkillId === skillId;
}

/** Get the active skill ID */
export function getActiveSkillId(): string | null {
  return currentActiveSkillId;
}
