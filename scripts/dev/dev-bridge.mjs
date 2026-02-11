#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const nowIso = new Date().toISOString();

const allowedActions = new Set(['ask', 'audit', 'verify', 'export']);
const allowedScopes = new Set(['repo', 'ring2', 'ring3', 'ring4', 'docs', 'ci']);

function getArgValue(name) {
  const prefix = `--${name}=`;
  const hit = args.find(arg => arg.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

function getAction() {
  const actionFlag = getArgValue('action');
  if (actionFlag) return actionFlag;
  const positional = args.find(arg => !arg.startsWith('--'));
  return positional;
}

function respond(payload, exitCode = 0) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(exitCode);
}

const jsonFlag = args.includes('--json');
const action = getAction();
const scope = getArgValue('scope') || 'repo';
const text = getArgValue('text') || '';
const correlationId = getArgValue('correlation-id') || `dev-bridge-${Date.now()}`;
const timeoutMs = Number(getArgValue('timeout-ms') || '30000');
const mode = (getArgValue('mode') || 'DEV').toUpperCase();

if (!jsonFlag) {
  respond(
    {
      schema_version: 'dev-bridge-response-v1',
      ok: false,
      action: action || 'ask',
      scope,
      correlation_id: correlationId,
      timestamp: nowIso,
      mode: 'DEV',
      error: {
        code: 'E_JSON_REQUIRED',
        message: 'Missing --json flag for structured output.',
      },
    },
    1
  );
}

if (!action || !allowedActions.has(action)) {
  respond(
    {
      schema_version: 'dev-bridge-response-v1',
      ok: false,
      action: action || 'ask',
      scope,
      correlation_id: correlationId,
      timestamp: nowIso,
      mode: 'DEV',
      error: {
        code: 'E_ACTION_INVALID',
        message: 'Action must be one of: ask, audit, verify, export.',
      },
    },
    1
  );
}

if (!allowedScopes.has(scope)) {
  respond(
    {
      schema_version: 'dev-bridge-response-v1',
      ok: false,
      action,
      scope,
      correlation_id: correlationId,
      timestamp: nowIso,
      mode: 'DEV',
      error: {
        code: 'E_SCOPE_INVALID',
        message: 'Scope must be one of: repo, ring2, ring3, ring4, docs, ci.',
      },
    },
    1
  );
}

const root = process.cwd();
const inventoryPath = path.join(root, 'runtime/dev/reports/DEV_BRIDGE_INVENTORY.md');
const proofPackPath = path.join(root, 'runtime/dev/proofs/DEV_BRIDGE_PROOF_PACK.md');
const capabilityDocPath = path.join(root, 'docs/capabilities/TITANE_DEV_BRIDGE.md');
const contractPath = path.join(root, 'docs/contracts/dev-bridge.contract.schema.json');

function fileInfo(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return { exists: true, bytes: stat.size };
  } catch {
    return { exists: false, bytes: 0 };
  }
}

const baseResponse = {
  schema_version: 'dev-bridge-response-v1',
  ok: true,
  action,
  scope,
  correlation_id: correlationId,
  timestamp: nowIso,
  mode: 'DEV',
};

if (action === 'ask') {
  respond({
    ...baseResponse,
    result: {
      capability_id: 'TITANE_DEV_BRIDGE',
      canonical_entry: 'pnpm run titane:dev -- <action> --json',
      actions: Array.from(allowedActions),
      scope_allowlist: Array.from(allowedScopes),
      input: { text },
      options: { mode, timeout_ms: timeoutMs },
      artifacts: {
        inventory: inventoryPath,
        proof_pack: proofPackPath,
        contract: contractPath,
        capability_doc: capabilityDocPath,
      },
      constraints: [
        'local-first',
        'tauri-only',
        'no network server',
        'structured output',
      ],
    },
  });
}

if (action === 'audit') {
  respond({
    ...baseResponse,
    result: {
      inventory: {
        path: inventoryPath,
        ...fileInfo(inventoryPath),
      },
      capability_doc: {
        path: capabilityDocPath,
        ...fileInfo(capabilityDocPath),
      },
      contract_schema: {
        path: contractPath,
        ...fileInfo(contractPath),
      },
      note: 'Audit is local and file-based only.',
    },
  });
}

if (action === 'verify') {
  respond({
    ...baseResponse,
    result: {
      checks: [
        { name: 'inventory', ...fileInfo(inventoryPath) },
        { name: 'proof_pack', ...fileInfo(proofPackPath) },
        { name: 'capability_doc', ...fileInfo(capabilityDocPath) },
        { name: 'contract_schema', ...fileInfo(contractPath) },
      ],
      note: 'Run pnpm run guard:dev-bridge for stop-the-line checks.',
    },
  });
}

respond({
  ...baseResponse,
  result: {
    proof_pack: {
      path: proofPackPath,
      ...fileInfo(proofPackPath),
    },
    export_note: 'Export is a file reference only; no network operations.',
  },
});
