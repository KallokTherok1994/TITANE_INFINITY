/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   ONBOARDING SYSTEM - TYPE DEFINITIONS
 *   User Onboarding Flow pour première expérience utilisateur
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Step dans le flow d'onboarding
 */
export interface OnboardingStep {
  id: StepId;
  title: string;
  description: string;
}

/**
 * IDs des steps d'onboarding
 */
export type StepId = 'welcome' | 'privacy' | 'features' | 'customization' | 'ready';

/**
 * Préférences utilisateur collectées durant l'onboarding
 */
export interface OnboardingPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  enableAnalytics: boolean;
  completedAt?: string;
}

/**
 * Props du composant OnboardingFlow
 */
export interface OnboardingFlowProps {
  onComplete: () => void;
}

/**
 * Props des composants Step
 */
export interface StepProps {
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * Props du composant CustomizationStep
 */
export interface CustomizationStepProps extends StepProps {
  preferences: OnboardingPreferences;
  onChange: (preferences: OnboardingPreferences) => void;
}

/**
 * État de progression de l'onboarding
 */
export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
}
