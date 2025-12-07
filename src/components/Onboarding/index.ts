/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   ONBOARDING - Public exports
 * ═══════════════════════════════════════════════════════════════
 */

export { OnboardingFlow } from './OnboardingFlow';
export { WelcomeStep } from './WelcomeStep';
export { PrivacyStep } from './PrivacyStep';
export { FeaturesStep } from './FeaturesStep';
export { CustomizationStep } from './CustomizationStep';
export { ReadyStep } from './ReadyStep';

export type {
  OnboardingStep,
  StepId,
  OnboardingPreferences,
  OnboardingFlowProps,
  StepProps,
  CustomizationStepProps,
  OnboardingProgress,
} from './types';
