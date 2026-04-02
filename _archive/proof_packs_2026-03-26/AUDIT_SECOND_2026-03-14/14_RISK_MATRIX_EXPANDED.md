# 14 — RISK MATRIX EXPANDED

**Date:** 2026-03-14

---

## RISK MATRIX

| ID | PROBLÈME | CATÉGORIE | COUCHE | VÉRITÉ TOUCHÉE | RING | SURFACE | IMPACT | PROBABILITÉ | PREUVE | STATUT | PRIORITÉ | FALSE_PASS_RISK |
|----|---------|-----------|--------|----------------|------|---------|--------|-------------|--------|--------|----------|-----------------|
| R-01 | G1, G3, rc-network-surface: hollow gates (rg-dependent) | GATE | Governance | gate_reliability | R4 | scripts/gates/ | Governance invariants unverified | CONFIRMED | Gate re-run shows rg: not found → PASS | **PROVED** | P1 | **HIGH** |
| R-02 | P3 structural certification is simulated | HARNESS | E2E | proof_harness_strength | R4 | e2e/ | Provider chain certification not real | CONFIRMED | generateSimulatedMeta() hardcodes values | **PROVED** | P1 | **HIGH** |
| R-03 | Full E2E cert disabled by default | HARNESS | E2E | proof_harness_strength | R4 | e2e/ | Real provider E2E never runs unless opt-in | CONFIRMED | FULL_E2E_ENABLED=false → suite skipped | **PROVED** | P1 | **HIGH** |
| R-04 | [MOCK_OK] path in production conversationEngine + api/chat | PRODUCT | Services | answer_is_useful | R2 | src/services/ | E2E tests may validate mock, not real AI | CONFIRMED | isE2EChatMockEnabled() in both files | **PROVED** | P1 | **HIGH** |
| R-05 | answer_is_useful / answer_matches_question never verified | HARNESS | Tests | answer_is_useful | R4 | tests/, e2e/ | No quality gate on AI responses | CONFIRMED | grep found 0 test assertions | **PROVED** | P1 | MEDIUM |
| R-06 | ring-integrity-gate absent | GATE | Governance | gate_reliability | R1-R4 | scripts/gates/ | Ring boundary violations undetected | CONFIRMED | ls scripts/gates/ → no ring-integrity | **PROVED** | P2 | MEDIUM |
| R-07 | G4 local-only FAIL overclassified as HIGH | GATE | Governance | gate_reliability | R4 | scripts/gates/ | Wasted attention on local-only concern | CONFIRMED | ci-unified.yml: G4 not in CI | **PROVED** | P2 | LOW |
| R-08 | CSP unsafe-inline overclassified as HIGH | SECURITY | Config | gate_reliability | R4 | src-tauri/ | Risk is real but CI-waived | CONFIRMED | ci-unified.yml: CSP_ALLOW_UNSAFE=1 | **PROVED** | P2 | LOW |
| R-09 | Port mismatch: tauri.conf.json (1420) vs tauri.base.json (5173) | RUNTIME | Config | build_truth | R4 | src-tauri/ | Dev server won't start if base.json used | CONFIRMED | grep devUrl both files | **PROVED** | P2 | LOW |
| R-10 | G9 incomplete execution (exits early) | GATE | Governance | gate_reliability | R4 | scripts/gates/ | Release seal not fully verified | CONFIRMED | timeout 30 bash g9 → 1 line output | **PROVED** | P2 | MEDIUM |
| R-11 | Multiple invoke paths (TauriBridge, utils/invoke) outside tauriClient.ts | PRODUCT | IPC | command_called | R2-R3 | src/os/bridge/, src/utils/ | IPC contract not fully centralized | CONFIRMED | TauriBridge.ts + utils/invoke.ts both call secureInvoke | LIKELY | P2 | MEDIUM |
| R-12 | G6 blocked permanently in CI (no build env) | PACKAGING | Build | build_truth | R4 | CI | Build reproducibility unverified | CONFIRMED | No cargo/rustc in env | **PROVED** | P2 | N/A |
| R-13 | No runtime runtime-truth observability | OBSERVABILITY | Runtime | truth_alignment_ui_backend | R3-R4 | UI | UI/backend mode alignment unverifiable | LIKELY | No runtime binary | LIKELY | P2 | MEDIUM |
| R-14 | offline governance (G1 scope) uninspected | PRODUCT | UI/Services | degraded_message_only | R3 | src/ | Offline messages may lack reason_code | UNKNOWN | G1 hollow; manual grep shows paths | LIKELY | P2 | MEDIUM |

---

## P0/P1/P2 DISTRIBUTION

### P0 — None identified
No crash, data loss, or security breach proven (CSP risk documented but waived in CI)

### P1 — Product + Harness truth failures
- **R-01**: Hollow governance gates
- **R-02**: Simulated P3 certification
- **R-03**: Disabled real E2E by default
- **R-04**: [MOCK_OK] in production
- **R-05**: No answer quality gate

### P2 — Structural debt + Config
- R-06 through R-14

---

## FALSE_PASS_RISK SUMMARY

HIGH risk items (governance gates that pass with 0 checks):
1. G1 — no-offline-without-reason
2. G3 — legacy-divergence
3. rc-network-surface
4. P3 structural certification

These are the most dangerous because they provide false confidence that governance invariants are maintained, when no check has been run.
