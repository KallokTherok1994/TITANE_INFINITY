# 13 Screenshot Index

## Screenshots Location

All screenshots taken during WDIO runs are in:
- `artifacts/run1/screens/`
- `artifacts/run2/screens/`
- `artifacts/run3/screens/`

## Expected Screenshots

| File | Content | Expected |
|------|---------|---------|
| `artifacts/run1/screens/01_initial.png` | App launch | Main UI visible |
| `artifacts/run1/screens/02_chat_input.png` | chat-input focus | Input highlighted |
| `artifacts/run1/screens/03_response.png` | After send | Response visible |
| (run2, run3 same pattern) | | |

## Screenshot Status

PENDING — WDIO x3 not yet run

## Note on zoom:75% Proof

Visual screenshots with the new binary should show SMALLER text/UI compared to old binary
(100% zoom vs 75% zoom). However the WDIO spec does not assert visual dimensions; the CSS
fix proof is in the dist/ asset content:
```
grep "zoom" dist/assets/main-*.css → zoom:75%
```

## Verdict

SCREENSHOTS_PENDING
