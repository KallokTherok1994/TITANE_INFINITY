# 04 COMMANDS TRUTH

Commands below are taken from `package.json` at authority commit `028580016`.

## Unit / integration / architecture / rust

- `pnpm run test`
- `pnpm run test:architecture`
- `pnpm run test:compliance`
- `pnpm run test:all`
- `pnpm run test:rust`
- `pnpm run test:e2e`
- `pnpm run test:e2e:playwright`
- `pnpm run e2e:desktop:ensure`
- `pnpm run e2e:desktop`

## Verify / gates

- `pnpm run verify`
- `pnpm run verify:final100`
- `pnpm run verify:tauri-only`
- `pnpm run verify:online-first`
- `pnpm run verify:invariants-governed`
- `pnpm run verify:network-guard`
- `pnpm run verify:seal-post-certification`
- `pnpm run verify:instructions`
- `pnpm run verify:docs:mermaid`
- `pnpm run verify:tauri-configs`
- `pnpm run verify:registry`

## Safe build / prod build / deploy

- `pnpm run build:prod-safe`
- `pnpm run build:prod-safe:verify`
- `pnpm run build:production`
- `pnpm run titane:deploy`
- `./titane.sh deploy`

## X3 wrappers actually present

- `bash scripts/lib/run_x3.sh <logfile> pnpm run test:architecture`
- `bash scripts/lib/run_x3.sh <logfile> pnpm run build:prod-safe`
- `pnpm run run:x3:tests` -> wrapper around `pnpm run test:architecture`
- `pnpm run run:x3:build` -> wrapper around `pnpm run build:tauri:e2e`

## Reality check

- `./titane.sh deploy` is present but uses `runtime/stable/tauri.conf.json`.
- `runtime/stable/tauri.conf.json` is version-drifted against primary version authority.
- Therefore wrapper presence does not equal deploy readiness.
