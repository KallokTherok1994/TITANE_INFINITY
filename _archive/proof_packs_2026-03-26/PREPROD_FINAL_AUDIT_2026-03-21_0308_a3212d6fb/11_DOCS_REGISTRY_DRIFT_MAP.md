# 11_DOCS_REGISTRY_DRIFT_MAP

Drift checks performed:

- README root vs docs/README vs current native guard behavior
- token command exactness for PROD build
- proof pack append-only discipline

Drift found and fixed:

1. docs/README used non-canonical token value (`=YES`)
- Fix: changed to exact token value repetition

2. README lacked explicit native freshness pre-gate command
- Fix: added dedicated section and expected PASS class

Registry update policy:

- append-only only
- no destructive rewrite
