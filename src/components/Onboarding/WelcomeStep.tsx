/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TitaneLogo } from '../branding/TitaneLogo';

/**
 * FeaturePreview - Aperçu d'une fonctionnalité
 */
interface FeaturePreviewProps {
  icon: string;
  title: string;
  description: string;
}

const FeaturePreview: React.FC<FeaturePreviewProps> = ({ icon, title, description }) => (
  <motion.div
    className="feature-preview"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.05 }}
  >
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </motion.div>
);

/**
 * WelcomeStep - Premier step : accueil et présentation
 */
export const WelcomeStep: React.FC = () => {
  return (
    <div className="welcome-step">
      <motion.div
        className="logo-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TitaneLogo size={64} withText direction="column" />
      </motion.div>

      <motion.div
        className="welcome-message"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2>Bienvenue dans TITANE∞</h2>
        <p className="welcome-subtitle">
          TITANE est votre assistant IA personnel qui fonctionne entièrement sur votre
          machine.
          <br />
          Vos conversations restent <strong>privées</strong> et{' '}
          <strong>sécurisées</strong>.
        </p>
      </motion.div>

      <div className="features-preview">
        <FeaturePreview
          icon="🧠"
          title="IA Cognitive"
          description="Comprend le contexte et adapte ses réponses intelligemment"
        />
        <FeaturePreview
          icon="🔒"
          title="100% Local"
          description="Vos données ne quittent jamais votre ordinateur"
        />
        <FeaturePreview
          icon="⚡"
          title="Ultra Rapide"
          description="Réponses en temps réel grâce au traitement local"
        />
      </div>

      <motion.div
        className="welcome-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="stat">
          <span className="stat-value">20+</span>
          <span className="stat-label">Engines IA</span>
        </div>
        <div className="stat">
          <span className="stat-value">98.2%</span>
          <span className="stat-label">Tests OK</span>
        </div>
        <div className="stat">
          <span className="stat-value">v19.5.2</span>
          <span className="stat-label">Production</span>
        </div>
      </motion.div>
    </div>
  );
};

WelcomeStep.displayName = 'WelcomeStep';
