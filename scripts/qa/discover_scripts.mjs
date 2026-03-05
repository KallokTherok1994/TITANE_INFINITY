#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts || {};
const allScripts = Object.keys(scripts).sort((a, b) => a.localeCompare(b));

const isGuardTestLike = name =>
  name.startsWith('guard:') &&
  /(test|tests|contract|contracts|ipc|compliance|schema|gate|gates)/i.test(name);
const isClineTestLike = name =>
  name.startsWith('cline:') && /(test|tests|hook|hooks|verify|check)/i.test(name);

const testLikeScripts = allScripts.filter(name => {
  if (name === 'test' || name.startsWith('test:')) return true;
  if (name === 'e2e' || name.startsWith('e2e:')) return true;
  if (name.startsWith('verify:')) return true;
  if (name.startsWith('copilot-xs:')) return true;
  if (isGuardTestLike(name)) return true;
  if (isClineTestLike(name)) return true;
  return false;
});

const buildLikeScripts = allScripts.filter(
  name =>
    name === 'build' ||
    name.startsWith('build:') ||
    name.includes(':build') ||
    name.startsWith('bundle:')
);
const verifyLikeScripts = allScripts.filter(
  name => name === 'verify' || name.startsWith('verify:') || name.startsWith('guard:')
);
const auditLikeScripts = allScripts.filter(
  name => name === 'audit' || name.startsWith('audit:') || name.includes(':audit')
);

const result = {
  allScripts,
  testLikeScripts,
  buildLikeScripts,
  verifyLikeScripts,
  auditLikeScripts,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
