#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent || "";
const execPath = process.execPath || "";

const usingPnpm = /\bpnpm\b/i.test(userAgent);
if (usingPnpm) {
  process.exit(0);
}

const usingNpm = /\bnpm\b/i.test(userAgent);
if (usingNpm) {
  // Empêche npm d'aller jusqu'au bug arborist (npm 9.x) et force une installation cohérente.
  // Ne jamais demander de login/registry ici (local-first, pas de secrets).
  // Message volontairement court et actionnable.
  // eslint-disable-next-line no-console
  console.error(
    [
      "Ce repo utilise pnpm (pnpm-lock.yaml).",
      "",
      "Utilise la toolchain du repo + pnpm :",
      "  export PATH=\"$PWD/.tools/node/current/bin:$PATH\"",
      "  corepack pnpm install",
      "",
      "Ou (recommandé) :",
      "  ./titane.sh repair",
      "",
      `Node actuel: ${execPath}`,
      `User-Agent: ${userAgent}`,
    ].join("\n")
  );
  process.exit(1);
}

process.exit(0);
