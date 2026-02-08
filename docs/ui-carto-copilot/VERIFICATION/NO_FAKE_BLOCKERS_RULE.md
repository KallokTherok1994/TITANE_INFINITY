# NO_FAKE_BLOCKERS_RULE

## Rule
- On ne bloque jamais sur l’absence d’un output.
- L’absence d’un output déclenche sa génération.

## Delta outputs concernés
- docs/ui-carto-copilot/VERIFICATION/DELTA_GATE_SUMMARY.md
- docs/ui-carto-copilot/VERIFICATION/DELTA_REPORT.md
- docs/ui-carto-copilot/VERIFICATION/DELTA_ISSUES.md
- docs/ui-carto-copilot/VERIFICATION/DELTA_RUN_LOG.md

## BAD vs GOOD
- BAD: "Output absent → awaiting external input"
- GOOD: "Output absent → generate output"

## Reference
- docs/ui-carto-copilot/VERIFICATION/DELTA_GATE_SUMMARY.md
