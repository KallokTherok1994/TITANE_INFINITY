/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   ONBOARDING FLOW - Flux d'accueil utilisateur
 *   Premier lancement : Welcome → Privacy → Features → Customization → Ready
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import type { OnboardingStep, OnboardingFlowProps, OnboardingPreferences } from './types';
import { WelcomeStep } from './WelcomeStep';
import { PrivacyStep } from './PrivacyStep';
import { FeaturesStep } from './FeaturesStep';
import { CustomizationStep } from './CustomizationStep';
import { ReadyStep } from './ReadyStep';
import './OnboardingFlow.css';

/**
 * Configuration des steps
 */
const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans TITANE∞',
    description: 'Votre assistant IA personnel et local',
  },
  {
    id: 'privacy',
    title: 'Confidentialité Totale',
    description: 'Vos données restent sur votre machine. Rien n\'est envoyé en ligne.',
  },
  {
    id: 'features',
    title: 'Fonctionnalités Principales',
    description: 'Découvrez ce que TITANE peut faire pour vous',
  },
  {
    id: 'customization',
    title: 'Personnalisation',
    description: 'Configurez TITANE selon vos préférences',
  },
  {
    id: 'ready',
    title: 'Prêt à Commencer !',
    description: 'Vous êtes prêt à utiliser TITANE∞',
  },
];

/**
 * Composant principal du flow d'onboarding
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    theme: 'dark',
    language: 'fr',
    enableAnalytics: false,
  });

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  /**
   * Passer au step suivant ou terminer l'onboarding
   */
  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Dernier step, sauvegarder et compléter
      try {
        await invoke('complete_onboarding', {
          preferences: {
            ...preferences,
            completedAt: new Date().toISOString(),
          },
        });
        onComplete();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'onboarding:', error);
        // Fallback : compléter quand même côté frontend
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('onboarding_preferences', JSON.stringify(preferences));
        onComplete();
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  /**
   * Revenir au step précédent
   */
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  /**
   * Render du step actuel
   */
  const renderStep = () => {
    switch (step.id) {
      case 'welcome':
        return <WelcomeStep />;
      case 'privacy':
        return <PrivacyStep />;
      case 'features':
        return <FeaturesStep />;
      case 'customization':
        return (
          <CustomizationStep
            preferences={preferences}
            onChange={setPreferences}
          />
        );
      case 'ready':
        return <ReadyStep />;
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-overlay">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Progress bar */}
        <div className="onboarding-progress">
          <motion.div
            className="onboarding-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step indicator */}
        <div className="onboarding-step-indicator">
          <span className="step-number">{currentStep + 1}</span>
          <span className="step-separator">/</span>
          <span className="step-total">{STEPS.length}</span>
        </div>

        {/* Step header */}
        <div className="onboarding-header">
          <h1 className="onboarding-title">{step.title}</h1>
          <p className="onboarding-description">{step.description}</p>
        </div>

        {/* Step content avec animations */}
        <div className="onboarding-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="onboarding-navigation">
          {currentStep > 0 && (
            <motion.button
              className="onboarding-button onboarding-button-secondary"
              onClick={handleBack}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Précédent
            </motion.button>
          )}

          <motion.button
            className="onboarding-button onboarding-button-primary"
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginLeft: currentStep === 0 ? 'auto' : undefined }}
          >
            {currentStep === STEPS.length - 1 ? 'Commencer →' : 'Suivant →'}
          </motion.button>
        </div>

        {/* Step dots */}
        <div className="onboarding-dots">
          {STEPS.map((_, index) => (
            <motion.div
              key={index}
              className={`onboarding-dot ${index === currentStep ? 'active' : ''} ${
                index < currentStep ? 'completed' : ''
              }`}
              whileHover={{ scale: 1.2 }}
              onClick={() => {
                // Permettre de revenir en arrière seulement
                if (index < currentStep) {
                  setCurrentStep(index);
                }
              }}
              style={{ cursor: index < currentStep ? 'pointer' : 'default' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
