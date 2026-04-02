# 15_PROOF_ARTIFACTS_INDEX — Index Artefacts de Preuve
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Proof Packs (16 packs, 194 fichiers)

| Pack | Contenu | Fichiers |
|------|---------|---------|
| `AUDIT360_20260304_132822/` | Audit 360° initial | ~15 |
| `AUDIT_MODULES_2026-03-05_1433_0f7d943/` | Audit modules + 14 FIX | ~20 |
| `AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089/` | Inventaire 261 tests + 6 FIX | 16 |
| `AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53/` | Vérification tests + ring + CI | 16 |
| `FINAL_AUDIT_MASTER_FIX_PLAN_a0a4eeb3/` | Plan fix master | ~10 |
| `FIXPACK_2026-03-04_2205_4a3ab09a5/` | Fix pack | ~8 |
| `INSTRUCTIONS_PERFECT_2026-03-04_1711_4a3ab09a5/` | Instructions | ~5 |
| `SEAL_PROD_2026-03-03_2143_98262da88/` | Seal production | ~8 |
| `TESTS_PERFECT_2026-03-04_2138_4a3ab09a5/` | Tests perfect | ~12 |
| `TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/` | Tests zéro omission | ~15 |
| `UI_AUTOFIX_TESTIDS_AND_IPC_SYNC_2026-03-03_2056_98262da88/` | UI fix | ~8 |
| `UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/` | E2E ultra | ~10 |
| `UI_INTERACTIVE_MAP_2026-03-03_1950/` | Map interactive | ~5 |
| `ULTRA_TESTS_2026-03-04_2151_4a3ab09a5/` | Tests ultra | ~15 |
| `VERDICT_REMEDIATION_2026-03-03_2033_843b00530/` | Verdict remédiation | ~8 |
| `FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5/` | **Ce pack** | 22 |

---

## Registres (7 JSONL append-only)

| Fichier | Contenu |
|---------|---------|
| `registry/ui-events.jsonl` | Événements UI |
| `registry/chat-events.jsonl` | Événements chat |
| `registry/chat-mem-phases.jsonl` | Phases mémoire chat |
| `registry/repo-events.jsonl` | Événements repo |
| `registry/autofix-autoheal-rules.jsonl` | Règles AutoFix |
| `registry/REGISTRY_APPEND_TITANE_FINAL.jsonl` | Registre final |
| `registry/REGISTRY_APPEND_TITANE_Ω∞.jsonl` | Registre Ω∞ |

---

## MAP Docs (8 fichiers)

| Fichier | Contenu |
|---------|---------|
| `docs/MAP_INDEX.md` | Index cartographie |
| `docs/MAP_ARCHITECTURE_4RING.md` | Architecture 4-Ring |
| `docs/MAP_SURFACES_NETWORK.md` | Surfaces réseau |
| `docs/MAP_IPC_COMMANDS.md` | Commands IPC |
| `docs/MAP_IPC.md` | IPC résumé |
| `docs/MAP_TESTS_GATES.md` | Tests + Gates |
| `docs/MAP_MERMAID_OVERVIEW.md` | Vue Mermaid |
| `docs/MAP_GATES.md` | Gates résumé |

---

## AutoHeal Rules (scripts/autoheal/autoheal_rules.jsonl)

| ID | Scope |
|----|-------|
| AH-2026-03-04-0001 | doc-governance |
| AH-2026-03-04-0002 | e2e-desktop |
| AH-2026-03-04-0003 | e2e-no-silence |
| AH-2026-03-05-0001 | audit modules |
| AH-2026-03-05-0002 | audit verify-tests |
| AH-2026-03-05-0003 | audit tests-modules-fix |
| **AH-2026-03-05-0004** | **audit final verdict (ce run)** |

---

## Diagrammes Mermaid (4 sources)

| Fichier | Contenu |
|---------|---------|
| `docs/diagrams/sources/architecture_4_ring.mmd` | Vue 4-Ring |
| `docs/diagrams/sources/network_surface_online_first.mmd` | One Door Network |
| `docs/diagrams/sources/omega_pipeline_v2.mmd` | Pipeline gouverné |
| `docs/diagrams/sources/certification_gates.mmd` | Gates & Proof Pack |

---

## Certification / Deployment Artifacts

```
deployment/latest/MANIFEST.json            → version 27.2.0
deployment/latest/SHA256SUMS_v27.2.0.txt   → checksums LFS
deployment/latest/certification/           → 25+ sous-dossiers phase
deployment/v27.0.0-PRODUCTION/             → version PROD précédente
deployment/v27.4.1/                        → version LTS-NEXT
```
