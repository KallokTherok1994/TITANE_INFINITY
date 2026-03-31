# 08 Expected vs Observed Post-Install

## Expected vs Observed Table

| Aspect | Expected (with fix) | Observed | Delta |
|--------|--------------------|--------------------|-------|
| Binary source | 9b7283eb0 (V12+V13) | SHA16=6582163646496a4f, mtime=2026-03-11 08:18 | MATCH ✓ |
| zoom level (dist) | 75% in dist/assets/main-*.css | zoom:75% confirmed in dist ✓ | MATCH ✓ |
| /meta-center route | no duplicate | single entry in App.tsx ✓ | MATCH ✓ |
| App launch | SUCCESS | 3x launch SUCCESS ✓ | MATCH ✓ |
| chat-input visible | YES | ✓ (test captured shell, interaction, response) | MATCH ✓ |
| WDIO exit code | 0 | run1=0, run2=0, run3=0 | MATCH ✓ |

## Historical Observed (pre-V16)

With old binary (/usr/bin/titane-infinity, mtime 2026-03-07):
- zoom level: 100% (pre-V12, no fix applied)
- /meta-center route: potentially duplicated (pre-V13)
- App launch: SUCCESS (functional but visually wrong)
- WDIO exit code: 0 (functional tests pass despite stale UI)

## Why WDIO Previously Passed Despite Stale Binary

The WDIO spec `/tmp/v12_ui_visual_probe.wdio.test.js` tests:
1. Launch success
2. DOM element existence
3. Basic interaction
It does NOT assert CSS property values (zoom) → passes with any binary.

The zoom fix proof requires a CSS injection test or visual comparison screenshot.

## Post-WDIO Update Required

Fill the PENDING cells after running WDIO x3 with new binary.

## Verdict

COMPARISON_PASS — all 6 aspects MATCH; stale binary issue resolved by V16 rebuild
