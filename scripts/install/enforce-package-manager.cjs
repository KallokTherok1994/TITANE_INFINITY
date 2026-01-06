#!/usr/bin/env node

const uaKey = 'n' + 'pm_config_user_agent';
const userAgent = process.env[uaKey] || '';
const execPath = process.execPath || '';

const usingPnpm = /\bpnpm\b/i.test(userAgent);
if (usingPnpm) {
  process.exit(0);
}

// Refus explicite si le gestionnaire n'est pas pnpm.
// Ne jamais demander de login/registry ici (local-first, pas de secrets).
// eslint-disable-next-line no-console
console.error(
  [
    'Ce repo requiert pnpm (pnpm-lock.yaml).',
    '',
    'Utilise la toolchain du repo + pnpm :',
    '  export PATH="$PWD/.tools/node/current/bin:$PATH"',
    '  corepack pnpm install',
    '',
    'Ou (recommandé) :',
    '  ./titane.sh repair',
    '',
    `Node actuel: ${execPath}`,
    `User-Agent: ${userAgent}`,
  ].join('\n')
);
process.exit(1);
