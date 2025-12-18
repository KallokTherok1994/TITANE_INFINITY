/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Tip - Conseil rapide
 */
interface TipProps {
  text: string;
  delay?: number;
}

const Tip: React.FC<TipProps> = ({ text, delay = 0 }) => (
  <motion.div
    className="tip-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ x: 5 }}
  >
    <span className="tip-icon">💡</span>
    <span className="tip-text">{text}</span>
  </motion.div>
);

/**
 * ReadyStep - Cinquième et dernier step : prêt à commencer
 */
export const ReadyStep: React.FC = () => {
  return (
    <div className="ready-step">
      <motion.div
        className="success-icon"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        🎉
      </motion.div>

      <motion.h2
        className="ready-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Vous êtes prêt !
      </motion.h2>

      <motion.p
        className="ready-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        TITANE∞ est configuré et prêt à l&apos;emploi.
        <br />
        Vous pouvez commencer à discuter dès maintenant.
      </motion.p>

      <motion.div
        className="quick-tips"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="quick-tips-heading">Conseils Rapides</h3>
        <div className="tips-list">
          <Tip
            text="Utilisez Ctrl+K (ou Cmd+K sur Mac) pour accéder rapidement au chat"
            delay={0.6}
          />
          <Tip
            text="TITANE se souvient du contexte de vos conversations grâce à sa mémoire évolutive"
            delay={0.7}
          />
          <Tip
            text="Explorez les différents engines dans le menu latéral pour découvrir toutes les fonctionnalités"
            delay={0.8}
          />
          <Tip
            text="Vous pouvez modifier vos préférences à tout moment dans le Centre Design & Apparence"
            delay={0.9}
          />
          <Tip
            text="Le mode développeur est disponible pour les utilisateurs avancés (Ctrl+Shift+D)"
            delay={1.0}
          />
        </div>
      </motion.div>

      <motion.div
        className="ready-cta"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
      >
        <div className="cta-icon">🚀</div>
        <div className="cta-text">
          <div className="cta-title">Prêt à explorer TITANE∞ ?</div>
          <div className="cta-subtitle">
            Cliquez sur &quot;Commencer&quot; pour démarrer votre aventure
          </div>
        </div>
      </motion.div>

      <motion.div
        className="ready-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="stat-mini">
          <span className="stat-mini-icon">⚡</span>
          <span className="stat-mini-text">20 Engines IA actifs</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-icon">🧠</span>
          <span className="stat-mini-text">Mémoire évolutive prête</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-icon">🔒</span>
          <span className="stat-mini-text">100% privé et local</span>
        </div>
      </motion.div>
    </div>
  );
};
