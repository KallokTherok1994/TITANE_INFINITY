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
  from: undefined, // Ajout explicite pour éviter les avertissements
};
