# EXEC SUMMARY — ADMIN_HEALTH_CSV_PARSER

A) EXEC_MODE: AUTO / PROOF-DRIVEN / MINIMAL PATCH
B) SCOPE_RING: Ring 3 (Service/IPC) + Ring 4 (UI Component)
C) RISK: LOW — targeted error classification fix, no architectural change
D) PLAN: diagnose → classify → patch → test × 3 → proof
E) PROOFS: 8/8 unit tests PASS × 3 runs | autoheal entry appended | gates PASS
F) ROLLBACK: git restore -- src/utils/tauriProtector.ts src/services/telemetry/useProductionHealthTelemetry.ts src/features/production-health/ProductionHealthPanel.tsx src-tauri/src/api/telemetry_api.rs

## REAL STATE

The Admin > Santé Prod panel was displaying:

- Title: "⚠️ Erreur de parsing"
- Detail: "Le fichier de télémétrie existe mais son format est invalide. Vérifier la structure CSV."
- errorKind: PARSER_ERROR

The REAL cause was SOURCE_UNAVAILABLE — `/tmp/titane_production_week1.csv` does not exist on this machine.

## CURRENT REAL LOCK

PRIMARY LOCK: UI_ERROR_MAPPING_TOO_GENERIC

Chain failure:

1. tauriProtector.createFallbackResponse('read_production_week1_csv', ...) returned
   { success: false, fallback: true, error: "..." }
2. Hook checked 'ok' key in response → NOT FOUND (fallback used 'success')
3. isProductionHealthSummary(response) → FAILS (no status/windowStartIso/etc.)
4. throws new Error('Invalid telemetry payload') — contains 'Invalid'
5. classifyError() → PARSER_ERROR ← WRONG
6. UI showed "Erreur de parsing" / "Vérifier la structure CSV" ← MISLEADING

## DEFECT CLASSIFICATION: UI_ERROR_MAPPING_TOO_GENERIC

## PROOF LEVEL: L1 (static) + L3 (parser truth) + L4 (UI truth via test)

## FILES TOUCHED

Committed at 7a4621161 (prior session, confirmed applied):

- src/utils/tauriProtector.ts — add canonical {ok:false} fallback for read_production_week1_csv
- src/services/telemetry/useProductionHealthTelemetry.ts — extractErrorMessage(), SCHEMA_DRIFT kind, improved classifyError()
- src/features/production-health/ProductionHealthPanel.tsx — SCHEMA_DRIFT message
- src-tauri/src/api/telemetry_api.rs — BOM strip, semicolon detection, column fix, unit tests

This session:

- src/services/telemetry/**tests**/useProductionHealthTelemetry.test.ts — remove vi.useFakeTimers() (caused tests to hang)
- scripts/autoheal/autoheal_rules.jsonl — AH-2026-03-17-ADMIN-HEALTH-CSV-PARSER-ERROR entry

## FINAL UNIQUE VERDICT: PASS
