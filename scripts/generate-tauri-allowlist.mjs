// Génère la allowlist Tauri à partir de src/lib/security.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const securityPath = path.join(projectRoot, 'src/lib/security.ts');
const outPath = path.join(projectRoot, 'allowed_commands.json');

const src = fs.readFileSync(securityPath, 'utf8');
const match = src.match(
  /export const ALLOWED_COMMANDS = new Set<string>\(\[([\s\S]*?)\]\)/
);
if (!match) throw new Error('ALLOWED_COMMANDS not found');
const commands = match[1]
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('//') && l.startsWith("'") && l.endsWith("',"))
  .map(l => l.replace(/'/g, '').replace(/,$/, ''));
fs.writeFileSync(
  outPath,
  JSON.stringify(
    commands.map(command => ({ command })),
    null,
    2
  )
);
console.log('✅ allowed_commands.json généré');
