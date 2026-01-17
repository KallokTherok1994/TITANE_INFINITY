/*
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

export type Provider =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'ollama'
  | 'tauri'
  | 'titane-local';

export interface PromptSafetyDirective {
  id: string;
  description: string;
}

export interface PromptRole {
  id: string;
  label: string;
  mission: string;
  style: string;
  useCases: string?.[];
  limits: string?.[];
  systemPrompt: string;
}

export interface PromptEmotionState {
  valence: number;
  intensity: number;
  energy: number;
}

export interface PromptMemorySlice {
  sources: string?.[];
  data: Record<string, unknown>;
}

export interface PromptContext {
  modeName?: string;
  modeIcon?: string;
  emotionState?: PromptEmotionState;
  memory?: PromptMemorySlice;
  annotations?: string?.[];
}

export interface ProviderOverride {
  instructions?: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string?.[];
}

export interface TitanePromptProfile {
  id: string;
  label: string;
  description: string;
  roleId: string;
  baseSystemPrompt: string;
  safetyDirectives: PromptSafetyDirective?.[];
  providerOverrides?: Partial<Record<Provider, ProviderOverride>>;
}

export interface PromptPreset {
  id: string;
  label: string;
  description: string;
  profileId: string;
  userPrompt: string;
  autoMemoryWrites?: Array<{
    target: 'short' | 'medium' | 'long';
    template: string;
  }>;
}
