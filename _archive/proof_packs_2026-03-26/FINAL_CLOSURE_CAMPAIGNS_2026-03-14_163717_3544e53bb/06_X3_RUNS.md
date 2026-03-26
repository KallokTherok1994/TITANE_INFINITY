# 06 X3 RUNS

## N2 proof

- Command: `pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js`
- Runs: 3
- Result: `PASS/PASS/PASS`

## UI proof

- Command: `pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof-ui.wdio.test.js`
- Runs: 3
- Result: `PASS/PASS/PASS`

## Interpretation

- Stability is good for deterministic execution.
- Campaign-B closure remains blocked because latest N2 x3 did not produce a real non-degraded answer path.
