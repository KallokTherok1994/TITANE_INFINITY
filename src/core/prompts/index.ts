/*
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { promptProfiles } from './profiles';
import { promptRoles } from './roles';
import { providerOverrides } from './providers';
import { promptPresets } from './presets';
import {
  buildMemoryPrompt,
  getMemoryTemplate,
  listMemoryTemplates,
} from './memoryTemplates';
import type {
  Provider,
  PromptContext,
  PromptPreset,
  PromptRole,
  PromptSafetyDirective,
  ProviderOverride,
  TitanePromptProfile,
} from './types';

const DEFAULT_PROVIDER: Provider = 'openai';

function renderSafetySection(safety: PromptSafetyDirective[]): string {
  if (safety.length === 0) {
    return '';
  }

  const bullets = safety.map(directive => `• ${directive.description}`).join('\n');
  return `\n\nGarde-fous TITANE∞ :\n${bullets}`;
}

function renderContextSection(context?: PromptContext): string {
  if (!context) return '';

  const lines: string[] = [];

  if (context.modeName) {
    lines.push(
      `Mode actif : ${context.modeName}${context.modeIcon ? ` ${context.modeIcon}` : ''}`
    );
  }

  if (context.emotionState) {
    const { valence, intensity, energy } = context.emotionState;
    lines.push(
      `État émotionnel/énergétique (valence=${valence.toFixed(2)}, intensité=${intensity.toFixed(
        2
      )}, énergie=${energy.toFixed(2)})`
    );
  }

  if (context.memory && context.memory.sources.length > 0) {
    lines.push('Contexte mémoire actif :');
    context.memory.sources.forEach(source => {
      lines.push(`  • ${source}`);
    });

    Object.entries(context.memory.data).forEach(([key, value]) => {
      if (value) {
        lines.push(`    - ${key}: ${value}`);
      }
    });
  }

  if (context.annotations?.length) {
    lines.push('Annotations :');
    context.annotations.forEach(note => lines.push(`  • ${note}`));
  }

  if (lines.length === 0) {
    return '';
  }

  return `\n\n📚 Contexte dynamique :\n${lines.join('\n')}`;
}

function resolveProviderOverride(
  profile: TitanePromptProfile,
  provider: Provider
): ProviderOverride | undefined {
  return (
    profile.providerOverrides?.[provider] ||
    providerOverrides[provider] ||
    providerOverrides[DEFAULT_PROVIDER]
  );
}

export function getPromptProfile(id?: string): TitanePromptProfile {
  if (id && promptProfiles[id]) {
    return promptProfiles[id];
  }
  return (
    promptProfiles.core ??
    promptProfiles[Object.keys(promptProfiles)[0]!] ?? {
      id: 'core',
      label: 'Core',
      description: 'Default core profile',
      defaultRole: 'assistant',
      capabilities: [],
      constraints: [],
      examples: [],
    } as TitanePromptProfile
  );
}

export function listPromptProfiles(): TitanePromptProfile[] {
  return Object.values(promptProfiles);
}

export function listPromptRoles(): PromptRole[] {
  return Object.values(promptRoles);
}

export function listPromptPresets(): PromptPreset[] {
  return Object.values(promptPresets);
}

export function buildSystemPrompt(
  profileId?: string,
  provider?: Provider,
  context?: PromptContext
): string {
  const profile = getPromptProfile(profileId);
  const override = resolveProviderOverride(profile, provider || DEFAULT_PROVIDER);

  let prompt = '═══════════════════════════════════════════════════════════════════';
  prompt += '\nTITANE∞ Prompt Pack v13 — Architecture de persona alignée';
  prompt += `\nProfil actif : ${profile.label}`;
  prompt += '\n═══════════════════════════════════════════════════════════════════\n\n';

  prompt += profile.baseSystemPrompt;
  prompt += renderSafetySection(profile.safetyDirectives);
  prompt += renderContextSection(context);

  if (override?.instructions) {
    prompt += `\n\n⚙️ Consignes provider (${provider || DEFAULT_PROVIDER}) : ${override.instructions}`;
  }

  prompt +=
    '\n\nRappelle-toi : tu responsabilises Kevin, tu restes fidèle à la voix TITANE∞, tu conclus avec action + ancrage + mémoire.';
  prompt += '\n═══════════════════════════════════════════════════════════════════';

  return prompt;
}

export { promptProfiles };
export { promptRoles };
export { promptPresets };
export { buildMemoryPrompt, getMemoryTemplate, listMemoryTemplates };
export {
  FULL_CONSTITUTIONAL_PROMPT,
  requiresClarityAudit,
  detectSaturation,
  checkTruthConfidence,
  generateProtectionModeResponse,
  createClarityAuditTemplate,
  CONSTITUTIONAL_CONFIG,
} from './constitution';
export type {
  TitanePromptProfile,
  PromptContext,
  PromptPreset,
  PromptRole,
  Provider,
} from './types';
export type {
  MemoryTemplate,
  MemoryTemplateId,
  StructuredMemoryEntry,
  MemoryWriteTarget,
} from './memoryTemplates';
export type { ClarityAuditResult } from './constitution';
