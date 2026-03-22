/**
 * generate-tauri-config.mjs
 * Generates src-tauri/tauri.conf.json from tauri.base.json template.
 * Usage: TITANE_ENV=production node scripts/generate-tauri-config.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const baseConfigPath = path.join(projectRoot, 'tauri.base.json');
const outputPath = path.join(projectRoot, 'src-tauri', 'tauri.conf.json');

const environment = process.env.TITANE_ENV || 'development';

if (!fs.existsSync(baseConfigPath)) {
  console.error(`❌ tauri.base.json not found at: ${baseConfigPath}`);
  process.exit(1);
}

const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));

const envOverrides = {
  development: {
    build: {
      devUrl: 'http://localhost:1420',
      frontendDist: '../dist',
    },
  },
  production: {
    build: {
      devUrl: null,
      frontendDist: '../dist',
    },
  },
};

const overrides = envOverrides[environment] || envOverrides.development;

const finalConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    ...overrides.build,
  },
};

// Remove null values from build config.
// Tauri does not accept null values in tauri.conf.json — it expects
// keys to be absent rather than set to null.
for (const key of Object.keys(finalConfig.build)) {
  if (finalConfig.build[key] === null) {
    delete finalConfig.build[key];
  }
}

const tauriDir = path.join(projectRoot, 'src-tauri');
if (!fs.existsSync(tauriDir)) {
  fs.mkdirSync(tauriDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2) + '\n');
console.log(`✅ Generated tauri.conf.json for environment: ${environment}`);
