# 04 WARNING CLASSIFICATION

## Primary classification
EXPECTED_FOR_DESKTOP_DISTRIBUTION

## Why
- Warning seen during push is GitHub recommendation threshold (50 MB), not a hard rejection.
- AppImage is a portable desktop format that intentionally bundles runtime dependencies.
- Measured internals show heavy shared libs (WebKit/JSCore/ICU) dominate size.
- No evidence of anomalous duplicate payload causing artificial inflation.

## Operational note
- Current artifact (~90 MB) remains below GitHub hard file limit (100 MB), so release flow remains operational.
