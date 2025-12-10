/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Guarantee - Garantie de confidentialité
 */
interface GuaranteeProps {
  icon: string;
  text: string;
}

const Guarantee: React.FC<GuaranteeProps> = ({ icon, text }) => (
  <motion.div
    className="guarantee-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ x: 5 }}
  >
    <span className="guarantee-icon">{icon}</span>
    <span className="guarantee-text">{text}</span>
  </motion.div>
);

/**
 * PrivacyStep - Deuxième step : garanties de confidentialité
 */
export const PrivacyStep: React.FC = () => {
  return (
    <div className="privacy-step">
      <motion.div
        className="privacy-icon-large"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        🔒
      </motion.div>

      <motion.h2
        className="privacy-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Votre Vie Privée d'Abord
      </motion.h2>

      <motion.p
        className="privacy-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        TITANE∞ a été conçu avec la confidentialité comme priorité absolue. Voici nos
        garanties :
      </motion.p>

      <div className="privacy-guarantees">
        <Guarantee
          icon="✅"
          text="Toutes vos conversations sont stockées localement sur votre machine"
        />
        <Guarantee icon="✅" text="Aucune donnée n'est envoyée à des serveurs externes" />
        <Guarantee
          icon="✅"
          text="Vous gardez le contrôle total de vos données et pouvez les exporter"
        />
        <Guarantee
          icon="✅"
          text="Code source ouvert et auditable pour une transparence totale"
        />
        <Guarantee
          icon="✅"
          text="Aucun tracking, aucune télémétrie, aucun analytics sans votre consentement"
        />
        <Guarantee
          icon="✅"
          text="Chiffrement de bout en bout pour toutes les données sensibles"
        />
      </div>

      <motion.div
        className="privacy-badge"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="badge-icon">🛡️</div>
        <div className="badge-text">
          <div className="badge-title">100% Privé</div>
          <div className="badge-subtitle">
            Zero tracking · Zero cloud · Zero compromis
          </div>
        </div>
      </motion.div>

      <motion.div
        className="privacy-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>
          💡 <strong>Note :</strong> Les modèles IA tournent directement sur votre
          machine. Aucune connexion Internet n'est requise pour utiliser TITANE∞.
        </p>
      </motion.div>
    </div>
  );
};
