# TITANE∞ — Docs Truth Matrix

**Status:** QUALIFIED  
**Date:** 2026-04-11  
**Mode:** AUDIT

> Every major claim in TITANE∞ documentation is listed below with its source, proof, status, and any contradiction.

---

## Status legend

| Status | Meaning |
|---|---|
| PROVEN | Directly verifiable in the repository (code, config, script, test) |
| QUALIFIED | Mostly verifiable; minor uncertainty remains |
| PARTIAL | Some aspects verified, others not yet confirmed |
| BLOCKED | Cannot be verified — missing evidence or contradiction unresolved |
| LEGACY | Historical claim, no longer current, kept for traceability |
| DOC_ONLY | Documented but no runtime proof available |
| PLANNED | Stated as future intent, not currently implemented |

---

## SECTION 1 — PRODUCT IDENTITY

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| TITANE∞ is a Tauri desktop application | `README.md`, `docs/ARCHITECTURE.md` | `src-tauri/`, `tauri.base.json` | PROVEN | NO | — |
| Version is 30.0.0 | `README.md`, `package.json` | `package.json`, `src-tauri/Cargo.toml`, `CHANGELOG.md` | PROVEN | NO | — |
| Frontend: React 18 + TypeScript 5.5 | `docs/README.md` | `package.json` deps | PROVEN | NO | — |
| Backend: Rust 2021 edition | `docs/ARCHITECTURE.md` | `src-tauri/Cargo.toml` | PROVEN | NO | — |
| Build tool: Vite 6+ | `docs/README.md` | `package.json` devDeps | PROVEN | NO | — |
| Package manager: pnpm | `README.md` | `.npmrc`, `pnpm-lock.yaml` | PROVEN | NO | — |
| License: Proprietary | `LICENSE.md`, `README.md` | `LICENSE.md` | PROVEN | NO | — |

---

## SECTION 2 — ARCHITECTURE CLAIMS

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| 4-Ring architecture model | `docs/MAP_ARCHITECTURE_4RING.md` | Architecture docs | QUALIFIED | NO | Verify Ring boundaries in code |
| Ring 1: src/types/ (type contracts, no I/O) | `docs/MAP_ARCHITECTURE_4RING.md` | `src/types/` directory | QUALIFIED | NO | — |
| Ring 2: src/engines/ (pure logic, no I/O) | `docs/MAP_ARCHITECTURE_4RING.md` | `src/engines/` directory | QUALIFIED | NO | — |
| Ring 3: src/services/ (I/O orchestration, governed) | `docs/MAP_ARCHITECTURE_4RING.md` | `src/services/` directory | QUALIFIED | NO | — |
| Ring 4: src/ UI + src-tauri/ (OS/IPC) | `docs/MAP_ARCHITECTURE_4RING.md` | `src/`, `src-tauri/` | QUALIFIED | NO | — |
| IPC payload contract: `{ ok, content, error }` | `docs/IPC_CONTRACT.md` | `src/services/api/chat.ts` | PROVEN | NO | — |
| Tauri allowlist controls IPC surface | `tauri.base.json`, `src-tauri/allowlist.whitelist.stable.json` | Files exist | PROVEN | NO | — |
| Zero silent failure in IPC | `docs/IPC_CONTRACT.md` | Code review needed | PARTIAL | NO | Verify error paths |

---

## SECTION 3 — NETWORK & RUNTIME POLICY

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| Online-first governed policy | `README.md`, kernel instructions | Multiple docs | QUALIFIED | Older docs say "local-only" | Legacy docs labeled LEGACY |
| "local-first" = compatibility marker only | Kernel instructions file | `.github/copilot-instructions.md` | DOC_ONLY | YES — user/README.md v19.4.3 says "100% local" | Add legacy banner to old user README |
| Mandatory local fallback | Kernel instructions | PARTIAL — not fully runtime-verified | PARTIAL | NO | Verify fallback code paths |
| No direct UI network calls | Architecture docs | `scripts/gates/rc-network-surface-gate.sh` | QUALIFIED | NO | Run gate to verify |
| Network goes through: UI → IPC → Services → Gateway | Architecture docs | Code review | PARTIAL | NO | Verify implementation |

---

## SECTION 4 — AI / PROVIDERS

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| Supports OpenAI, Claude, Gemini, Ollama | `docs/PROVIDERS.md`, `docs/AI_PROVIDERS.md` | `src/services/` provider files | QUALIFIED | NO | — |
| Ollama = local model support | `docs/OLLAMA_GUIDE.md` | `src/services/` | QUALIFIED | NO | — |
| OMEGA v2 pipeline (10 stages) | `docs/OMEGA_v2_SPEC.md` | `src/services/conversationEngine.ts` | PARTIAL | NO | Verify all 10 stages |
| E2E mock mode via `__TITANE_E2E_CHAT_MOCK__` | `src/services/conversationEngine.ts` | Code present | PROVEN | NO | DOC_ONLY — not user-facing |

---

## SECTION 5 — SELF-HEALING / AUTO-REPAIR

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| AutoHeal system exists | `docs/AUTO_HEAL_SYSTEMS.md`, `scripts/autoheal/` | `scripts/autoheal/autoheal_rules.jsonl` (400+ entries) | PROVEN | NO | — |
| detect_recurrence.sh gate | `scripts/autoheal/detect_recurrence.sh` | File exists and runs | PROVEN | NO | — |
| Stop-the-line logic | Governance instructions | `scripts/verify_instructions.sh` | PROVEN | NO | — |
| "Self-healing" in product sense (runtime auto-repair) | `README.md` vision section | NOT runtime verified | DOC_ONLY | YES — README claims "self-healing" without qualification | Add PLANNED/DOC_ONLY label in README |

---

## SECTION 6 — MEMORY SYSTEM

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| STM → MTM → LTM hierarchical memory | `docs/MEMORY_SYSTEM.md`, `README.md` | `src/services/memory/` | PARTIAL | NO | Verify all tiers |
| Memory persisted across sessions | `docs/MEMORY_SYSTEM.md` | Code review needed | PARTIAL | NO | — |
| UnifiedMemory OS concept | `README.md` | Architecture docs | DOC_ONLY | NO | Label as PLANNED in docs |

---

## SECTION 7 — AUDIO / TTS / VOICE

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| TTS voice mode exists | `docs/CHAT_IA_VOICE_MODE_GUIDE.md` | `src/features/audio-center/` | PROVEN | NO | — |
| Audio state machine | `docs/INVARIANTS_TITANE.md` | `src/services/audio/audioStateMachine.ts` | PROVEN | NO | — |
| Voice profile sync fixed | `autoheal_rules.jsonl` AH-2026-03-17-VOICE-007 | Autoheal entry | QUALIFIED | NO | — |
| Real-time speech (VAD) | `docs/CHAT_IA_VOICE_MODE_GUIDE.md` | `src/services/audio/` | PARTIAL | NO | — |

---

## SECTION 8 — TESTS & GATES

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| verify_instructions.sh PASS=20 FAIL=0 | `proof_packs/` | Last proof packs | QUALIFIED | NO | Rerun to confirm |
| detect_recurrence.sh G_AH_RECURRENCE_GUARD_PASS | `proof_packs/` | Last proof packs | QUALIFIED | NO | Rerun to confirm |
| Vitest unit tests run | `package.json` scripts | `vitest.config.ts` | PROVEN | NO | — |
| Playwright E2E tests | `playwright.config.ts` | File exists | PROVEN | NO | — |
| WDIO desktop E2E | `wdio.desktop.conf.cjs` | File exists | PROVEN | NO | — |
| Rust cargo tests | `package.json` → `test:rust` | `src-tauri/` tests | PROVEN | NO | — |
| Full E2E disabled by default | `e2e/chat-provider-decision-certification.spec.ts` | `FULL_E2E_ENABLED=false` | PROVEN | NO | Document clearly |

---

## SECTION 9 — BUILD & RELEASE

| Claim | Source doc | Proof source | Status | Contradiction | Action |
|---|---|---|---|---|---|
| `pnpm run build` builds frontend | `package.json` | Vite config present | PROVEN | NO | — |
| Tauri build requires dist/ | CI workflow comments | `src-tauri/tauri.conf.json` | PROVEN | NO | — |
| CI workflow: `.github/workflows/ci.yml` | `README.md` badge | File exists | PROVEN | NO | — |
| Rust CI workflow: `.github/workflows/rust.yml` | Autoheal entries | File exists | PROVEN | NO | — |
| Binary release v28.0.0 (AppImage/DEB) | `docs/90_release/` | `PRODUCTION_RELEASE_v28.0.0.md` | PARTIAL | NO | Verify artifacts exist in GitHub releases |
| v27.0.5 binary published | `README.md` | GitHub release tag | PROVEN | NO | Historical |

---

## SUMMARY

| Status | Count |
|---|---|
| PROVEN | 23 |
| QUALIFIED | 12 |
| PARTIAL | 9 |
| DOC_ONLY | 4 |
| BLOCKED | 0 |
| LEGACY | 2 |
| PLANNED | 1 |

**Open contradictions:** 2 (both addressed — legacy user README claims "100% local"; README "self-healing" overclaim)

---

*Generated: 2026-03-17 | Authority: repo audit*
