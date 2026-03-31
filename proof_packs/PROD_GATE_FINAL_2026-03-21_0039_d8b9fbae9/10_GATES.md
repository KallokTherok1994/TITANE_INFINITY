# Governance Gates

verify_instructions.sh:   PASS=20 FAIL=0   → G_VERIFY_INSTRUCTIONS=PASS
verify-capabilities-coverage.sh: NEW dead=0 → G_CAP_COVERAGE=PASS
detect_recurrence.sh:     entries=499       → G_AH_RECURRENCE_GUARD_PASS

PROD tokens received:
  GO_FOR_PROD_BUILD__TITANE_INFINITY  ✓
  GO_FOR_PROD_DEPLOY__TITANE_INFINITY ✓

Known supply-chain gaps (pre-existing, non-blocking):
  G_SIGNING_READY=FAIL  — no TAURI_SIGNING_PRIVATE_KEY
  G_SBOM=UNPROVEN       — no SBOM generation
  G_UPDATER=UNPROVEN    — plugin-updater not installed
