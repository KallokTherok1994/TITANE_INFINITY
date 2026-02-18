# P10.2 BUILD OVERRIDE QUALIFIE

## Mode
- Constitutional / Proof-driven / Stop-the-line / Single-use override

## Scope (Allowlist)
- scripts/certification/**
- scripts/e2e/**
- e2e/**, tests/**
- deployment/latest/certification/**
- docs/** (registry append-only)
- package.json (scripts only)
- vitest*.config.*, wdio*.conf.*

## Forbidden
- src/**
- src-tauri/**
- tauri.conf.* / allowlist / permissions
- deps changes, pnpm-lock.yaml changes

## Override
- One safe build only: NPM_CONFIG_IGNORE_SCRIPTS=1 pnpm run build
- No postbuild, no dev server, no external network

## Stop Conditions
- Git dirty outside proof pack
- Forbidden path changes
- pnpm-lock.yaml change
- Ports 5173/3000/8080/9000/4444 in use
- Any external network
