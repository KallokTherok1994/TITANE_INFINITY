# P10.2 Build Override Authorization

## Why
P10.2 requires a build stage to run desktop E2E certification end-to-end.

## What
Single-use SAFE build only:
- `NPM_CONFIG_IGNORE_SCRIPTS=1 pnpm run build`

## Scope
- Proof-pack scoped, single-use (no build retry loop)
- Ring 4 only, no runtime changes

## Guarantees
- No postbuild execution
- No dev server
- No external network
- No deps changes, no pnpm-lock drift
- No real HOME writes (sandbox enforced for runtime)

## Stop Conditions
- Git dirty outside proof pack
- Forbidden path modified
- pnpm-lock.yaml changed
- Critical ports in use
- Build exit != 0
- Dev server or external network detected
