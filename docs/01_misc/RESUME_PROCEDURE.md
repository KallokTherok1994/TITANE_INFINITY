# RESUME_PROCEDURE.md

Exact resume steps (no deviation):

1. export P8_APPROVAL_TOKEN="<token>"
2. node scripts/ops/p8_approval_gate.mjs
3. node scripts/ops/p8_preflight_check.mjs
4. node scripts/ops/p8_execute_distribution.mjs
5. node scripts/ops/p8_record_approval.mjs
6. Update verdict to PASS
7. Generate SHA256SUMS
8. Seal proof pack
