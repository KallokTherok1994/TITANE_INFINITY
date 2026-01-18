/**
 * TITANE∞ v8.0 — POSTCSS CONFIGURATION
 *
 * Tailwind CSS v4 + Autoprefixer (CommonJS syntax)
 */

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
  // Supprimer l'avertissement PostCSS `from` option
  map: false, // Désactiver les source maps en production
  from: undefined,
};
