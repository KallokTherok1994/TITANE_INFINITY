#!/usr/bin/env node
// Gate 16A.1 — Human Review Gallery Validator
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const VIEWER = join(ROOT, 'artifacts/nexus-v36/human-review/viewer');
const ORIGINALS = join(ROOT, 'artifacts/nexus-v36/human-review/originals');
const REVIEW = join(ROOT, 'artifacts/nexus-v36/human-review');

let fail = 0;
const pass = (msg) => console.log(`PASS: ${msg}`);
const failMsg = (msg) => { console.log(`FAIL: ${msg}`); fail++; };

// 1. REVIEW_START_HERE.html exists
const startHere = join(VIEWER, 'REVIEW_START_HERE.html');
if (existsSync(startHere)) {
  pass('REVIEW_START_HERE.html exists');
} else {
  failMsg('REVIEW_START_HERE.html MISSING');
}

// 2. All mode HTML files exist
const modeFiles = ['daily.html', 'system.html', 'dev.html', 'lab.html', 'all.html', 'missing.html'];
for (const f of modeFiles) {
  const fp = join(VIEWER, f);
  if (existsSync(fp)) pass(`viewer/${f} exists`);
  else failMsg(`viewer/${f} MISSING`);
}

// 3. CSS and JS exist
for (const f of ['review.css', 'review.js']) {
  const fp = join(VIEWER, f);
  if (existsSync(fp)) pass(`viewer/${f} exists`);
  else failMsg(`viewer/${f} MISSING`);
}

// 4. Validate image src paths in all HTML files
const htmlFiles = readdirSync(VIEWER).filter(f => f.endsWith('.html'));
let imgTotal = 0, imgMissing = 0, imgZero = 0;

for (const htmlFile of htmlFiles) {
  const content = readFileSync(join(VIEWER, htmlFile), 'utf8');
  const srcMatches = [...content.matchAll(/src=['"]([^'"]+\.(?:png|jpg|webp))['"]/gi)];
  for (const m of srcMatches) {
    const relPath = m[1];
    if (relPath.startsWith('http') || relPath.startsWith('data:')) continue;
    // Resolve relative to viewer/
    const absPath = resolve(VIEWER, relPath);
    imgTotal++;
    if (!existsSync(absPath)) {
      imgMissing++;
      console.log(`  IMG_MISSING in ${htmlFile}: ${relPath}`);
    } else {
      const sz = statSync(absPath).size;
      if (sz === 0) {
        imgZero++;
        console.log(`  IMG_ZERO_BYTE in ${htmlFile}: ${relPath}`);
      }
    }
  }
}

if (imgMissing === 0 && imgZero === 0) {
  pass(`All ${imgTotal} image refs valid (0 missing, 0 zero-byte)`);
} else {
  failMsg(`Image refs: total=${imgTotal} missing=${imgMissing} zero=${imgZero}`);
}

// 5. annotation_legend.json valid
const legendPath = join(REVIEW, 'annotation_legend.json');
if (existsSync(legendPath)) {
  try {
    const legend = JSON.parse(readFileSync(legendPath, 'utf8'));
    const keys = Object.keys(legend);
    const required = ['RED_CORRECT','YELLOW_VERIFY','PURPLE_OPTIMIZE','BLUE_INTERACTION_TEST','GREEN_UI_PREFERENCE'];
    const missing = required.filter(k => !keys.includes(k));
    if (missing.length === 0) pass(`annotation_legend.json valid (${keys.length} entries)`);
    else failMsg(`annotation_legend.json missing keys: ${missing.join(', ')}`);
  } catch (e) {
    failMsg(`annotation_legend.json invalid JSON: ${e.message}`);
  }
} else {
  failMsg('annotation_legend.json MISSING');
}

// 6. manifest.json valid
const manifestPath = join(REVIEW, 'manifest.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const count = manifest.entryCount || manifest.entries?.length || 0;
    pass(`manifest.json valid (${count} entries)`);
  } catch (e) {
    failMsg(`manifest.json invalid JSON: ${e.message}`);
  }
} else {
  failMsg('manifest.json MISSING');
}

// 7. Originals directory has PNG files
if (existsSync(ORIGINALS)) {
  const pngs = readdirSync(ORIGINALS).filter(f => f.endsWith('.png'));
  if (pngs.length >= 1) pass(`originals/ has ${pngs.length} PNGs`);
  else failMsg('originals/ has no PNG files');
} else {
  failMsg('originals/ directory MISSING');
}

console.log(`\nSUMMARY: FAIL=${fail}`);
if (fail > 0) process.exit(1);
