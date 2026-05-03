# 13 RUNTIME BASELINE

## Baseline run (initial attempt before fix)
- Command: `pnpm exec wdio run wdio.desktop.conf.cjs --spec /tmp/v12_ui_visual_probe.wdio.test.js`
- Exit: 254
- Error: `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "wdio" not found`
- Root cause: node_modules absent from V14 worktree (freshly created worktree)

## Fix applied
- Diagnosis: Node 20 active but .nvmrc=24, react-chrono requires >=22
- Fix: `source ~/.nvm/nvm.sh && nvm use 24 && pnpm install --frozen-lockfile`
- Result: Done in 2.2s, wdio installed

## Post-fix baseline
- run1/run2/run3: exit=0, 1 passing each → PASS

## Runtime environment
- Node: v24.11.1 (via nvm)
- pnpm: v10.30.2
- wdio: from node_modules/.bin/wdio
- Binary: /usr/bin/titane-infinity (v27.2.0, DEB)

## Status: PASS (post-fix)
