#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error(
    'Usage: node scripts/qa/select_failed_commands.mjs <aggregate-log-file ...>'
  );
  process.exit(1);
}

const lines = [];
for (const input of inputs) {
  const fullPath = path.resolve(process.cwd(), input);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  lines.push(...content.split(/\r?\n/));
}

const failures = [];
for (const line of lines) {
  if (!line.startsWith('RESULT|')) continue;
  const fields = Object.fromEntries(
    line
      .split('|')
      .slice(1)
      .map(pair => {
        const idx = pair.indexOf('=');
        if (idx === -1) return [pair, ''];
        return [pair.slice(0, idx), pair.slice(idx + 1)];
      })
  );

  const exitCode = Number(fields.exit ?? '0');
  if (!Number.isNaN(exitCode) && exitCode !== 0) {
    failures.push({
      id: fields.id || 'UNKNOWN',
      run: fields.run || 'UNKNOWN',
      exit: exitCode,
      cmd: fields.cmd || '',
      log: fields.log || '',
      ts: fields.ts || '',
    });
  }
}

const dedup = [];
const seen = new Set();
for (const fail of failures) {
  const key = `${fail.id}::${fail.cmd}`;
  if (!seen.has(key)) {
    seen.add(key);
    dedup.push(fail);
  }
}

process.stdout.write(`${JSON.stringify({ failedCommands: dedup }, null, 2)}\n`);
