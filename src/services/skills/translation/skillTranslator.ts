/**
 * TITANE∞ Skill OS — Translation Layer (Layer 4)
 * Converts analyzed source into a TITANE-native skill package.
 */

import type {
  TitaneSkillPackage,
  SourceAnalysisDossier,
  PortabilityMatrix,
  SkillSourceType,
} from '../types';
import { buildSkillPackage } from '../skillManifest';
import { classifyPortability } from '../classification/portabilityClassifier';

/** Translate a dossier into a native TITANE skill package */
export function translateToNativePackage(
  dossier: SourceAnalysisDossier,
  sourceType: SkillSourceType,
  origin: string
): TitaneSkillPackage {
  const matrix = classifyPortability(dossier);
  const cleanedInstructions = cleanInstructions(dossier.instructions);
  const cleanedDossier: SourceAnalysisDossier = {
    ...dossier,
    instructions: cleanedInstructions,
  };
  const pkg = buildSkillPackage(cleanedDossier, matrix, sourceType, origin);
  pkg.manifest.state = determineHonestState(matrix);
  return pkg;
}

function cleanInstructions(instructions: string): string {
  let c = instructions;
  c = c.replace(/\bChatGPT\b/gi, 'TITANE');
  c = c.replace(/\bOpenAI\b/gi, 'TITANE');
  c = c.replace(/\bGPT-4\b/gi, 'TITANE');
  c = c.replace(/\bGPT-3\b/gi, 'TITANE');
  c = c.replace(
    /You can (browse|search the web|generate images|use DALL-E|use code interpreter)[^.]*\./gi,
    ''
  );
  c = c.replace(/Use (DALL-E|code interpreter|browsing|web browsing)[^.]*\./gi, '');
  c = c.replace(/\n{3,}/g, '\n\n');
  c = c.replace(/  +/g, ' ');
  return c.trim();
}

function determineHonestState(
  matrix: PortabilityMatrix
): import('../types').SkillLifecycleState {
  if (matrix.overallRisk === 'CRITICAL') return 'FAILED';
  if (matrix.externalDependency > 0 || matrix.unsupported > 0) return 'DEGRADED';
  return 'INSTALLED';
}
