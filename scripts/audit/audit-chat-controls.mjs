#!/usr/bin/env node
/**
 * TITANE∞ v35.1.4 — audit-chat-controls
 *
 * Parse src/components/sections/ConversationSection.tsx + src/components/chat/**
 * + src/components/sections/conversation/** and produce a JSON inventory of every
 *   - data-testid encountered
 *   - associated handler name (best-effort regex match)
 *   - whether the handler is a stub `() => {}` / empty function
 *
 * Output: reports/chat-controls-inventory-v35.1.4.json
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? process.cwd());
const TARGETS = [
  'src/components/sections/ConversationSection.tsx',
  'src/components/chat',
  'src/components/sections/conversation',
];

function walk(p, out = []) {
  let st;
  try { st = statSync(p); } catch { return out; }
  if (st.isDirectory()) {
    for (const entry of readdirSync(p)) walk(join(p, entry), out);
  } else if (/\.(tsx?|jsx?)$/.test(p)) {
    out.push(p);
  }
  return out;
}

const files = [];
for (const t of TARGETS) {
  const abs = join(ROOT, t);
  try { statSync(abs); walk(abs, files); } catch { /* ignore missing */ }
}

const TESTID_RE = /data-testid\s*=\s*["'`]([^"'`{}]+)["'`]/g;
const HANDLER_RE = /(?:onClick|onChange|onSubmit|onKeyDown|onKeyUp|onBlur|onFocus|onInput)\s*=\s*\{([^}]+)\}/g;
const STUB_RE = /^\s*\(?\s*\)?\s*=>\s*\{?\s*\}?\s*$/;

const results = [];
const stubFlags = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  const fileTestids = [];
  while ((m = TESTID_RE.exec(src)) !== null) {
    fileTestids.push({ testid: m[1], line: src.slice(0, m.index).split('\n').length });
  }
  const handlers = [];
  HANDLER_RE.lastIndex = 0;
  while ((m = HANDLER_RE.exec(src)) !== null) {
    const expr = m[1].trim();
    handlers.push({ expr, isStub: STUB_RE.test(expr) });
    if (STUB_RE.test(expr)) {
      stubFlags.push({ file: relative(ROOT, f), expr });
    }
  }
  if (fileTestids.length || handlers.length) {
    results.push({
      file: relative(ROOT, f),
      testids: fileTestids,
      testid_count: fileTestids.length,
      handler_count: handlers.length,
      stub_handler_count: handlers.filter(h => h.isStub).length,
    });
  }
}

const summary = {
  version: '35.1.4',
  generated_at: new Date().toISOString(),
  files_scanned: files.length,
  files_with_signal: results.length,
  total_testids: results.reduce((a, r) => a + r.testid_count, 0),
  total_handlers: results.reduce((a, r) => a + r.handler_count, 0),
  total_stub_handlers: results.reduce((a, r) => a + r.stub_handler_count, 0),
  stub_handlers: stubFlags,
  verdict: stubFlags.length === 0 ? 'PASS' : 'WARN',
  files: results.sort((a, b) => b.testid_count - a.testid_count),
};

const outDir = join(ROOT, 'reports');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'chat-controls-inventory-v35.1.4.json');
writeFileSync(out, JSON.stringify(summary, null, 2));
console.log(`OK files_scanned=${summary.files_scanned} testids=${summary.total_testids} handlers=${summary.total_handlers} stubs=${summary.total_stub_handlers} verdict=${summary.verdict}`);
console.log(`-> ${relative(ROOT, out)}`);
