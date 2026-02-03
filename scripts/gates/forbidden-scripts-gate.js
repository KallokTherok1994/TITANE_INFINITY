#!/usr/bin/env node
/**
 * TITANE∞ vΩ.STABLE0 — GATE_FORBIDDEN_SCRIPTS
 * Bloquant: interdit l'exécution/usage en CI des scripts réseau/tunnel/web serveurs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOWS_DIR = path.join(__dirname, '../../.github/workflows');

const FORBIDDEN_PATTERNS = [
  'deploy-http-server.sh',
  'deploy-http-server-pure.sh',
  'deploy-network.sh',
  'setup-cloudflare-tunnel.sh',
  'storybook dev',
  'vite preview',
  'http-server',
];

function getWorkflowFiles() {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];
  return fs
    .readdirSync(WORKFLOWS_DIR)
    .filter(name => name.endsWith('.yml') || name.endsWith('.yaml'))
    .map(name => path.join(WORKFLOWS_DIR, name));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hits = FORBIDDEN_PATTERNS.filter(pattern => content.includes(pattern));
  return hits.length > 0 ? { file: filePath, hits } : null;
}

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  GATE_FORBIDDEN_SCRIPTS — Tauri-only script guard        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const workflowFiles = getWorkflowFiles();
const findings = workflowFiles.map(scanFile).filter(Boolean);

if (findings.length === 0) {
  console.log('✅ PASS: Aucun script interdit détecté dans workflows CI');
  process.exit(0);
}

console.error('❌ FAIL: Scripts interdits détectés dans CI:');
findings.forEach(({ file, hits }) => {
  console.error(`- ${file}`);
  hits.forEach(hit => console.error(`  • ${hit}`));
});
process.exit(1);
