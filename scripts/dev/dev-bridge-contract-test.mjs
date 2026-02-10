#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const schemaPath = path.join(root, 'docs/contracts/dev-bridge.contract.schema.json');

function fail(message) {
  process.stdout.write(
    `${JSON.stringify({ ok: false, error: { message } }, null, 2)}\n`
  );
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  fail('Schema not found: docs/contracts/dev-bridge.contract.schema.json');
}

let schema;
try {
  schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
} catch {
  fail('Invalid JSON schema');
}

let output = '';
try {
  output = execSync('pnpm -s run titane:dev -- ask --json', {
    encoding: 'utf8'
  }).trim();
} catch (err) {
  fail(`titane:dev execution failed: ${err.message}`);
}

let payload;
try {
  payload = JSON.parse(output);
} catch {
  fail('Invalid JSON output from titane:dev');
}

const responseDef = schema?.definitions?.response;
const required = responseDef?.required || [];
const actionEnum = responseDef?.properties?.action?.enum || [];
const scopeEnum = responseDef?.properties?.scope?.enum || [];

for (const key of required) {
  if (!(key in payload)) {
    fail(`Missing required field: ${key}`);
  }
}

if (payload.ok !== true) {
  fail('Expected ok=true for ask action');
}

if (payload.action !== 'ask') {
  fail('Expected action=ask');
}

if (actionEnum.length > 0 && !actionEnum.includes(payload.action)) {
  fail('Action not allowed by schema');
}

if (scopeEnum.length > 0 && !scopeEnum.includes(payload.scope)) {
  fail('Scope not allowed by schema');
}

if (!payload.result || typeof payload.result !== 'object') {
  fail('Missing result object');
}

process.stdout.write(
  `${JSON.stringify({ ok: true, message: 'Contract validation PASS' }, null, 2)}\n`
);
