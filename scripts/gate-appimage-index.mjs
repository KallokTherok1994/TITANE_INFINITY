#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const candidates = [
  path.resolve('src-tauri/target/release/bundle/appimage'),
  path.resolve('deployment/latest'),
];

const findAppImage = () => {
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.AppImage'));
    if (files.length > 0) {
      return path.join(dir, files.sort().slice(-1)[0]);
    }
  }
  return null;
};

const appImagePath = findAppImage();
if (!appImagePath) {
  console.error(
    '❌ GATE B: AppImage introuvable (deployment/latest ou src-tauri/target/release/bundle/appimage)'
  );
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'titane-appimage-'));
try {
  execSync(`"${appImagePath}" --appimage-extract`, { cwd: tmpDir, stdio: 'ignore' });
} catch (error) {
  console.error('❌ GATE B: extraction AppImage échouée', error?.message || error);
  process.exit(1);
}

const squashRoot = path.join(tmpDir, 'squashfs-root');
if (!fs.existsSync(squashRoot)) {
  console.error('❌ GATE B: squashfs-root introuvable après extraction');
  process.exit(1);
}

const findIndex = dir => {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      if (entry.isFile() && entry.name === 'index.html') return full;
    }
  }
  return null;
};

let indexPath = findIndex(squashRoot);
if (!indexPath) {
  try {
    const result = execSync(`find "${squashRoot}" -type f -name "index.html" | head -1`, {
      encoding: 'utf-8',
    }).trim();
    if (result) {
      indexPath = result;
    }
  } catch {
    // ignore and fall through
  }
}
if (!indexPath) {
  const knownPath = path.join(squashRoot, 'usr/lib/TITANE-Infinity/_up_/dist/index.html');
  if (fs.existsSync(knownPath)) {
    indexPath = knownPath;
  }
}
if (!indexPath) {
  console.error('❌ GATE B: index.html introuvable dans AppImage');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');

const forbidden = [
  { pattern: /href="\//g, name: 'href="/"' },
  { pattern: /src="\//g, name: 'src="/"' },
  { pattern: /href="\/manifest\.json"/g, name: 'href="/manifest.json"' },
  { pattern: /href="\/vite\.svg"/g, name: 'href="/vite.svg"' },
  { pattern: /href="\/src\//g, name: 'href="/src/"' },
  { pattern: /src="\/src\//g, name: 'src="/src/"' },
  { pattern: /href="\/assets\//g, name: 'href="/assets/"' },
  { pattern: /src="\/assets\//g, name: 'src="/assets/"' },
];

const violations = forbidden.filter(rule => rule.pattern.test(html));

const markerOk =
  html.includes('PHASE 2: BOOT DIAGNOSTIC MARKER') || html.includes('__TITANE_BOOT__');

if (violations.length > 0) {
  console.error('❌ GATE B: Assets absolus détectés dans index.html AppImage');
  for (const v of violations) console.error(` - ${v.name}`);
  process.exit(1);
}

if (!markerOk) {
  console.error('❌ GATE B: markers de boot absents dans index.html AppImage');
  process.exit(1);
}

console.log('✅ GATE B: AppImage index.html OK (assets relatifs + markers présents)');
