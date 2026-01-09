/**
 * TITANE∞ v8.0 — POSTCSS CONFIGURATION
 *
 * Tailwind CSS v4 + Autoprefixer (ES Module syntax)
 */

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {
      // Ensure `from` option is passed to PostCSS plugins
      from: undefined, // This tells PostCSS to use the file path from the build process
    },
  },
};
