# 12 WDIO RUNTIME PROOF

## Runs summary
| run | exit | result | duration |
|-----|------|--------|---------|
| run1 | 0 | 1 passing ✓ | 5.7s |
| run2 | 0 | 1 passing ✓ | 6.2s |
| run3 | 0 | 1 passing ✓ | 5.7s |

## Test: "captures shell, interaction and response on the canonical surface"
- Driver: wry 0.54.2 linux
- Spec: /tmp/v12_ui_visual_probe.wdio.test.js
- Binary: /usr/bin/titane-infinity (v27.2.0)

## Key interactions confirmed
- data-testid="chat-input" found and scrolled into view
- textarea setValue via HTMLTextAreaElement.prototype.value setter
- input/change events dispatched (bubbles:true, cancelable:true)
- Navigation to tauri://localhost/#/titane: PASS

## Baseline exit code history
- run_baseline: exit=254 (initial attempt with unresolved wdio path)
- run1/run2/run3: exit=0 (after pnpm install --frozen-lockfile with Node 24)

## Status: PASS x3
