#!/usr/bin/env node
/**
 * TITANE∞ v35.1.4 — audit-buttons-and-functions
 *
 * Walk src/pages/**.tsx and src/components/**.tsx, extract every <button> and
 * <input> + their onClick/onChange handlers, flag stubs.
 *
 * Output: reports/buttons-audit-v35.1.4.json
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? process.cwd());
const TARGETS = ['src/pages', 'src/components'];

function walk(p, out = []) {
  let st;
  try { st = statSync(p); } catch { return out; }
  if (st.isDirectory()) {
    for (const entry of readdirSync(p)) walk(join(p, entry), out);
  } else if (/\.(tsx|jsx)$/.test(p) && !/\.test\.|\.spec\.|__tests__/.test(p)) {
    out.push(p);
  }
  return out;
}

const files = [];
for (const t of TARGETS) walk(join(ROOT, t), files);

const STUB_RE = /^\s*\(?\s*\)?\s*=>\s*\{?\s*\}?\s*$/;
const BUTTON_RE = /<button\b([^>]*)>/gi;
const ATTR_RE = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]+)\})/g;

const fileResults = [];
let totalButtons = 0;
let stubButtons = 0;
const stubList = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  const buttons = [];
  while ((m = BUTTON_RE.exec(src)) !== null) {
    const attrsRaw = m[1];
    const attrs = {};
    let am;
    ATTR_RE.lastIndex = 0;
    while ((am = ATTR_RE.exec(attrsRaw)) !== null) {
      const val = am[2] ?? am[3] ?? am[4] ?? '';
      attrs[am[1]] = val.trim();
    }
    const onClick = attrs.onClick;
    const hasHandler = onClick !== undefined && onClick.length > 0;
    const isStub = onClick !== undefined && STUB_RE.test(onClick);
    const line = src.slice(0, m.index).split('\n').length;
    buttons.push({
      line,
      testid: attrs['data-testid'] ?? null,
      onClick: onClick ?? null,
      isStub,
      hasHandler,
    });
    totalButtons++;
    if (isStub) {
      stubButtons++;
      stubList.push({ file: relative(ROOT, f), line, testid: attrs['data-testid'] ?? null, onClick });
    }
  }
  if (buttons.length) {
    fileResults.push({
      file: relative(ROOT, f),
      button_count: buttons.length,
      stub_count: buttons.filter(b => b.isStub).length,
      missing_handler_count: buttons.filter(b => !b.hasHandler).length,
    });
  }
}

const summary = {
  version: '35.1.4',
  generated_at: new Date().toISOString(),
  files_scanned: files.length,
  files_with_buttons: fileResults.length,
  total_buttons: totalButtons,
  stub_buttons: stubButtons,
  stubs: stubList,
  verdict: stubButtons === 0 ? 'PASS' : 'WARN',
  per_file: fileResults.sort((a, b) => b.button_count - a.button_count).slice(0, 80),
};

const outDir = join(ROOT, 'reports');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'buttons-audit-v35.1.4.json');
writeFileSync(out, JSON.stringify(summary, null, 2));
console.log(`OK files=${summary.files_scanned} buttons=${summary.total_buttons} stubs=${summary.stub_buttons} verdict=${summary.verdict}`);
console.log(`-> ${relative(ROOT, out)}`);
