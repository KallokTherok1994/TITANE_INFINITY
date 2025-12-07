/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { CustomizationStepProps } from './types';

/**
 * ThemeOption - Option de thème
 */
interface ThemeOptionProps {
  value: 'light' | 'dark' | 'auto';
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ value, label, icon, selected, onClick }) => (
  <motion.div
    className={`theme-option ${selected ? 'selected' : ''}`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="theme-option-icon">{icon}</div>
    <div className="theme-option-label">{label}</div>
    {selected && <div className="theme-option-check">✓</div>}
  </motion.div>
);

/**
 * CustomizationStep - Quatrième step : personnalisation
 */
export const CustomizationStep: React.FC<CustomizationStepProps> = ({ preferences, onChange }) => {
  return (
    <div className="customization-step">
      <motion.h2
        className="customization-heading"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Personnalisez TITANE∞
      </motion.h2>

      <motion.p
        className="customization-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Configurez l'application selon vos préférences
      </motion.p>

      {/* Sélection du thème */}
      <div className="preference-section">
        <label className="preference-label">Thème d'interface</label>
        <div className="theme-selector">
          <ThemeOption
            value="light"
            label="Clair"
            icon="☀️"
            selected={preferences.theme === 'light'}
            onClick={() => onChange({ ...preferences, theme: 'light' })}
          />
          <ThemeOption
            value="dark"
            label="Sombre"
            icon="🌙"
            selected={preferences.theme === 'dark'}
            onClick={() => onChange({ ...preferences, theme: 'dark' })}
          />
          <ThemeOption
            value="auto"
            label="Auto"
            icon="🌓"
            selected={preferences.theme === 'auto'}
            onClick={() => onChange({ ...preferences, theme: 'auto' })}
          />
        </div>
      </div>

      {/* Sélection de la langue */}
      <div className="preference-section">
        <label className="preference-label" htmlFor="language-select">
          Langue de l'interface
        </label>
        <select
          id="language-select"
          className="preference-select"
          value={preferences.language}
          onChange={(e) =>
            onChange({ ...preferences, language: e.target.value as 'fr' | 'en' })
          }
        >
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      {/* Analytics opt-in */}
      <div className="preference-section">
        <motion.label
          className="preference-checkbox-label"
          whileHover={{ x: 5 }}
        >
          <input
            type="checkbox"
            className="preference-checkbox"
            checked={preferences.enableAnalytics}
            onChange={(e) =>
              onChange({ ...preferences, enableAnalytics: e.target.checked })
            }
          />
          <span className="checkbox-text">
            <strong>Envoyer des statistiques d'utilisation anonymes</strong>
            <br />
            <small>
              Aide à améliorer TITANE∞ en partageant des données anonymisées (aucune
              conversation n'est envoyée)
            </small>
          </span>
        </motion.label>
      </div>

      <motion.div
        className="customization-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p>
          💡 <strong>Note :</strong> Vous pourrez modifier ces paramètres à tout moment
          dans les réglages de l'application.
        </p>
      </motion.div>
    </div>
  );
};
