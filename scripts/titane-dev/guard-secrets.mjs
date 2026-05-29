import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

const SECRET_PATTERNS = [
  /API_KEY\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/,
  /SECRET\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/,
  /PASSWORD\s*[:=]\s*["']?[A-Za-z0-9_\-]{8,}/,
  /TOKEN\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/,
  /PRIVATE_KEY\s*[:=]/,
  /ACCESS_KEY\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/,
  /VITE_OPENAI\s*[:=]\s*["']?[A-Za-z0-9_\-]+/,
  /VITE_GEMINI\s*[:=]\s*["']?[A-Za-z0-9_\-]+/,
  /VITE_ANTHROPIC\s*[:=]\s*["']?[A-Za-z0-9_\-]+/,
  /sk-[A-Za-z0-9]{32,}/,
  /AIza[A-Za-z0-9_\-]{35}/,
];

const DOC_EXAMPLE_PATTERNS = [
  /secretPatterns\s*=\s*@\[/,
  /"API_KEY","SECRET"/,
  /pattern.*API_KEY/i,
  /scan.*for.*secret/i,
  /\$secretPatterns/,
];

const SCAN_DIRS = [
  '.titane-dev',
  'scripts/titane-dev',
  '.vscode',
  'docs/nexus-v36',
];

function walkFiles(dir, results = []) {
  if (!existsSync(path.join(ROOT, dir))) return results;
  try {
    const entries = readdirSync(path.join(ROOT, dir));
    for (const entry of entries) {
      const rel = `${dir}/${entry}`;
      const abs = path.join(ROOT, rel);
      const stat = statSync(abs);
      if (stat.isDirectory()) {
        walkFiles(rel, results);
      } else if (stat.isFile()) {
        results.push(rel);
      }
    }
  } catch {}
  return results;
}

let findings = [];
let docExamples = [];

for (const dir of SCAN_DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.ico', '.woff', '.ttf', '.wasm'].includes(ext)) continue;

    let content;
    try {
      content = readFileSync(path.join(ROOT, file), 'utf8');
    } catch { continue; }

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(line)) {
          const isDocExample = DOC_EXAMPLE_PATTERNS.some(dp => dp.test(line) || dp.test(content.slice(0, 500)));
          if (isDocExample) {
            docExamples.push(`DOC_EXAMPLE: ${file}:${i + 1} :: ${line.trim().slice(0, 80)}`);
          } else {
            findings.push(`REAL_SECRET_SUSPECT: ${file}:${i + 1} :: ${line.trim().slice(0, 80)}`);
          }
          break;
        }
      }
    }
  }
}

if (docExamples.length > 0) {
  console.log('DOC_EXAMPLES (not real secrets):');
  docExamples.forEach(d => console.log(' ' + d));
}

if (findings.length > 0) {
  console.log('SECRETS_GUARD=FAIL');
  findings.forEach(f => console.log(f));
  process.exit(1);
} else {
  console.log('SECRETS_GUARD=PASS');
  console.log(`Scanned ${SCAN_DIRS.join(', ')} — no real secrets found.`);
  process.exit(0);
}
