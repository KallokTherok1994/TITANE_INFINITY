import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const registryPath = path.join(root, 'registry', 'autofix-autoheal-rules.jsonl');

const fail = (message, details = []) => {
  console.error(`FAIL: ${message}`);
  for (const detail of details) {
    console.error(` - ${detail}`);
  }
  process.exit(1);
};

if (!fs.existsSync(registryPath)) {
  fail('registry/autofix-autoheal-rules.jsonl is missing');
}

const raw = fs.readFileSync(registryPath, 'utf8');
const lines = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

if (lines.length === 0) {
  fail('registry/autofix-autoheal-rules.jsonl is empty');
}

const getNestedValue = (object, fieldPath) =>
  fieldPath.split('.').reduce((acc, key) => (acc === undefined || acc === null ? undefined : acc[key]), object);

const requiredFields = [
  'id',
  'date',
  'scope',
  'signature.symptom',
  'signature.marker',
  'signature.paths',
  'root_cause',
  'remediation.actions',
  'remediation.bounded_attempts',
  'remediation.cooldown_sec',
  'verification.commands',
  'verification.pass_markers',
  'prevention.gate_added',
  'prevention.tests_added_or_updated',
  'rollback'
];

const parsed = [];
const missingByLine = [];

for (let index = 0; index < lines.length; index += 1) {
  const lineNumber = index + 1;
  let entry;
  try {
    entry = JSON.parse(lines[index]);
  } catch (error) {
    fail(`Invalid JSONL at line ${lineNumber}`, [String(error)]);
  }

  const missingFields = [];
  for (const fieldPath of requiredFields) {
    const value = getNestedValue(entry, fieldPath);
    if (value === undefined || value === null) {
      missingFields.push(`${fieldPath} (missing)`);
      continue;
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      missingFields.push(`${fieldPath} (empty string)`);
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      missingFields.push(`${fieldPath} (empty array)`);
    }
  }

  if (typeof entry.remediation?.bounded_attempts !== 'number') {
    missingFields.push('remediation.bounded_attempts (must be number)');
  }
  if (typeof entry.remediation?.cooldown_sec !== 'number') {
    missingFields.push('remediation.cooldown_sec (must be number)');
  }

  if (missingFields.length > 0) {
    missingByLine.push({ lineNumber, missingFields });
  }

  parsed.push(entry);
}

if (missingByLine.length > 0) {
  const details = missingByLine.flatMap(({ lineNumber, missingFields }) =>
    missingFields.map((field) => `line ${lineNumber}: ${field}`)
  );
  fail('Required fields missing in AutoFix/AutoHeal registry', details);
}

const listChangedFiles = () => {
  const unstaged = execSync('git diff --name-only', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([...unstaged, ...staged]));
};

const changedFiles = listChangedFiles();
const governedFixFiles = changedFiles.filter(
  (file) => !file.startsWith('reports/') && file !== 'registry/autofix-autoheal-rules.jsonl'
);

const latestEntry = parsed[parsed.length - 1];
const latestPaths = Array.isArray(latestEntry.signature?.paths) ? latestEntry.signature.paths : [];

if (latestEntry.prevention?.gate_added !== 'G_AH_RULE_CAPTURED_FOR_EACH_FIX') {
  fail('Latest AutoFix/AutoHeal entry does not enforce required gate', [
    `prevention.gate_added=${String(latestEntry.prevention?.gate_added ?? 'undefined')}`
  ]);
}

if (governedFixFiles.length > 0) {
  const overlaps = governedFixFiles.filter((file) => latestPaths.includes(file));
  if (overlaps.length === 0) {
    fail('Last fix has no corresponding new AutoFix/AutoHeal rule entry', [
      `changed files: ${governedFixFiles.join(', ')}`,
      `latest signature.paths: ${latestPaths.join(', ') || '(empty)'}`
    ]);
  }
  console.log(`INFO: covered files in latest entry: ${overlaps.join(', ')}`);
} else {
  console.log('INFO: no governed fix files detected in git diff; coverage check skipped.');
}

console.log('PASS: JSONL_VALID');
console.log('PASS: REQUIRED_FIELDS_PRESENT');
console.log('PASS: LAST_FIX_CAPTURED');
console.log('PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX');
