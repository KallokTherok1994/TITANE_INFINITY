#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER TEST RUNNER
 * Script Node.js pour exécuter les tests d'intégration UILogger
 * ═══════════════════════════════════════════════════════════════
 */

// Mock browser environment for Node.js
global.window = global;
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
  get length() {
    return Object.keys(this.data).length;
  },
  key(index) {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  },
};

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      PROD: false,
      DEV: true,
    },
  },
};

// Import and run tests
import('../UILogger.integration.js')
  .then(module => {
    const success = module.runUILoggerTests();
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Failed to run tests:', err);
    process.exit(1);
  });
