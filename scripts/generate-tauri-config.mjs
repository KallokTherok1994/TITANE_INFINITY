/**
 * generate-tauri-config.mjs
 * Generates src-tauri/tauri.conf.json from tauri.base.json template.
 *
 * This script is intended for CI environments where tauri.conf.json is absent,
 * or when explicitly forced. It will NOT overwrite an existing tauri.conf.json
 * unless --force is passed.
 *
 * Usage:
 *   node scripts/generate-tauri-config.mjs             # skip if file exists
 *   TITANE_ENV=production node scripts/generate-tauri-config.mjs --force
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
const force = process.argv.includes('--force');

if (!fs.existsSync(baseConfigPath)) {
  console.error(`❌ tauri.base.json not found at: ${baseConfigPath}`);
  process.exit(1);
}

// Skip if the file already exists and --force is not set
if (fs.existsSync(outputPath) && !force) {
  console.log(
    `ℹ️  src-tauri/tauri.conf.json already exists — skipping (use --force to overwrite)`
  );
  process.exit(0);
}

function stripInvalidProps(obj, parentKey = null) {
  if (Array.isArray(obj)) {
    return obj.map(v => stripInvalidProps(v, parentKey));
  } else if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      // Ne jamais supprimer 'identifier' à la racine
      if (
        (k.startsWith('$') || k.startsWith('_')) &&
        !(parentKey === null && k === 'identifier')
      )
        continue;
      out[k] = stripInvalidProps(v, k);
    }
    return out;
  }
  return obj;
}

const baseConfigRaw = JSON.parse(fs.readFileSync(baseConfigPath, 'utf8'));
const baseConfig = stripInvalidProps(baseConfigRaw);

const envOverrides = {
  development: {
    build: {
      beforeDevCommand:
        'corepack pnpm exec vite dev --host 127.0.0.1 --port 1420 --strictPort',
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

// Injecter bundle.active et bundle.targets si absents
if (!baseConfig.bundle) baseConfig.bundle = {};
baseConfig.bundle.active = true;
baseConfig.bundle.targets = 'all';

const finalConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    ...overrides.build,
  },
};

// Copie $schema, productName, windows à la racine si présents dans baseConfig ou baseConfig.app
if (baseConfig['$schema']) finalConfig['$schema'] = baseConfig['$schema'];
if (baseConfig['productName']) finalConfig['productName'] = baseConfig['productName'];
if (baseConfig.app && baseConfig.app.windows)
  finalConfig['windows'] = baseConfig.app.windows;

// Forcer devtools: false sur toutes les fenêtres
if (finalConfig.windows && Array.isArray(finalConfig.windows)) {
  finalConfig.windows = finalConfig.windows.map(w => ({ ...w, devtools: false }));
}

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
