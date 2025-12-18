/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Feature - Fonctionnalité principale
 */
interface FeatureProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    className="feature-card"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
  >
    <div className="feature-card-icon">{icon}</div>
    <h3 className="feature-card-title">{title}</h3>
    <p className="feature-card-description">{description}</p>
  </motion.div>
);

/**
 * FeaturesStep - Troisième step : présentation des fonctionnalités
 */
export const FeaturesStep: React.FC = () => {
  return (
    <div className="features-step">
      <motion.h2
        className="features-heading"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Ce que TITANE∞ peut faire pour vous
      </motion.h2>

      <motion.p
        className="features-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Découvrez les capacités de votre nouvel assistant IA
      </motion.p>

      <div className="features-grid">
        <Feature
          icon="💬"
          title="Conversations Naturelles"
          description="Parlez à TITANE comme à un humain. Il comprend le contexte et se souvient de vos échanges."
          delay={0.1}
        />
        <Feature
          icon="📝"
          title="Assistance à l'Écriture"
          description="Rédaction, correction, amélioration de textes. TITANE vous aide à communiquer avec clarté."
          delay={0.2}
        />
        <Feature
          icon="💡"
          title="Brainstorming & Idéation"
          description="Génération d'idées créatives et résolution de problèmes complexes ensemble."
          delay={0.3}
        />
        <Feature
          icon="📊"
          title="Analyse de Données"
          description="Compréhension et visualisation de vos données pour des insights actionnables."
          delay={0.4}
        />
        <Feature
          icon="🎨"
          title="Création de Contenu"
          description="Génération de contenu créatif : articles, scripts, code, et bien plus."
          delay={0.5}
        />
        <Feature
          icon="🧠"
          title="Mémoire Évolutive"
          description="TITANE se souvient de vos préférences et s'adapte à votre style au fil du temps."
          delay={0.6}
        />
      </div>

      <motion.div
        className="features-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="features-footer-icon">⚡</div>
        <p>
          Et ce n&apos;est que le début ! TITANE∞ évolue constamment avec 20+ engines IA
          qui travaillent en harmonie pour vous offrir la meilleure expérience possible.
        </p>
      </motion.div>
    </div>
  );
};
