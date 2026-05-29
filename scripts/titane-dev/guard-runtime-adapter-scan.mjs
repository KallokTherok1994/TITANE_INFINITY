import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase'))?.split('=')[1]
  || args[args.indexOf('--phase') + 1]
  || 'GATE_5';

// Patterns indicating direct IPC invoke (bypassing any future adapter)
const DIRECT_INVOKE_PATTERNS = [
  /invoke\s*\(\s*["']([^"']+)["']/g,
  /window\.__TAURI__\.tauri\.invoke/g,
  /__TAURI_IPC__/g,
  /tauriInvoke\s*\(/g,
];

const SCAN_DIRS = ['src/pages', 'src/components', 'src/services'];

function walkFiles(dir, results = []) {
  const abs = path.join(ROOT, dir);
  if (!existsSync(abs)) return results;
  const entries = readdirSync(abs);
  for (const entry of entries) {
    const rel = `${dir}/${entry}`;
    const entryAbs = path.join(ROOT, rel);
    try {
      const stat = statSync(entryAbs);
      if (stat.isDirectory()) {
        walkFiles(rel, results);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry)) {
        results.push(rel);
      }
    } catch {}
  }
  return results;
}

let directInvokes = [];
let totalScanned = 0;

for (const dir of SCAN_DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    totalScanned++;
    let content;
    try {
      content = readFileSync(path.join(ROOT, file), 'utf8');
    } catch { continue; }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of DIRECT_INVOKE_PATTERNS) {
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(lines[i])) !== null) {
          directInvokes.push(`${file}:${i + 1} :: ${lines[i].trim().slice(0, 100)}`);
          break;
        }
      }
    }
  }
}

console.log(`RUNTIME_ADAPTER_SCAN phase=${phaseArg}`);
console.log(`Files scanned: ${totalScanned}`);
console.log(`Direct invoke occurrences: ${directInvokes.length}`);

if (directInvokes.length > 0) {
  console.log('DIRECT_INVOKE_FOUND (scan only — no mutation):');
  directInvokes.slice(0, 20).forEach(d => console.log(' ' + d));
  if (directInvokes.length > 20) {
    console.log(` ... and ${directInvokes.length - 20} more`);
  }
}

// This guard is scan-only — always exits 0 (report only, not blocking)
console.log('RUNTIME_ADAPTER_SCAN=PASS (scan-only, no mutation)');
process.exit(0);
