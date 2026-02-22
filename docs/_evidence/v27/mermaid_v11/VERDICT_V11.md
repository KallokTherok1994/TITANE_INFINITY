# VERDICT V11 - Long-Term Autopilot

Statut: PASS
Date: 2026-02-22
HEAD_SHA_AT_TIME: 69a4118d98b00d5cfcf9b1cfef222c3089ba075c

## Preconditions
- Status report stable (preuve: docs/_evidence/v27/mermaid_v11/D_status_lines.txt, docs/_evidence/v27/mermaid_v11/D_status_snapshot.txt)
- Baseline lock hash captured (preuve: docs/_evidence/v27/mermaid_v11/baseline_lock_hash.txt)

## Gates
- MERMAID_STATUS_REPORT: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/status.txt)
- MERMAID_BASELINE_GUARD: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/baseline_guard.txt)
- MERMAID_CHANGE_REQUEST_GUARD: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/change_guard.txt)
- MERMAID_DRIFT_DETECTION: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/drift.txt)
- HASH_REGISTRY_OK: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/registry_check.txt)

## PASS x3
- verify_1: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/verify_1.txt)
- verify_2: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/verify_2.txt)
- verify_3: PASS (preuve: docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z/verify_3.txt)

## Proof Pack
- docs/_evidence/v27/mermaid_v11/proof_pack_20260222T170846Z

## Rollback
- git restore -- docs/diagrams/MERMAID_FREEZE_POLICY.md docs/diagrams/MERMAID_MAINTENANCE_CADENCE.md docs/diagrams/MERMAID_MINIMALISM_NOTE.md scripts/verify/mermaid-proof-pack.sh scripts/verify/mermaid-status-report.sh scripts/verify/mermaid-baseline-guard.sh docs/_evidence/v27/mermaid_v11
