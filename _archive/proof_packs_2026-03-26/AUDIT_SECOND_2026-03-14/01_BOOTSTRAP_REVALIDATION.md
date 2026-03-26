# 01 — BOOTSTRAP REVALIDATION — SECOND AUDIT

**Date:** 2026-03-14 | **HEAD:** ccc75353a

---

## 3.1 Repo Truth

```
Branch: copilot/audit-total-repo-titane
HEAD: ccc75353a (latest, pushed, clean)
First audit HEAD: e8b2c27b (reviewed as hypothesis)
git status: clean — nothing to commit
```

**Delta from first audit:** 3 commits added by first audit session:
- `52bc5d46` — audit proof pack + guardian.agent.md fix + autoheal entry
- `e8b870d4` — autoheal schema fix (code review)
- `ccc75353` — autoheal scope array fix

---

## 3.2 Audit Truth

### First audit files (all present):
- `proof_packs/AUDIT_TOTAL_2026-03-14/VERDICT.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/00_EXEC_SUMMARY.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/10_AUDIT_AXES.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/13_TRUTH_MATRIX.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/14_CONTRADICTIONS.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/15_RISK_MATRIX.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/16_ROOT_CAUSES.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/17_PRIORITY_ACTION_PLAN.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/18_QUICK_WINS_30MIN.md` ✅
- `proof_packs/AUDIT_TOTAL_2026-03-14/20_GATES_REPORT.md` ✅

### First audit UNKNOWN/BLOCKED zones (revalidated):
| Zone | First Audit Status | Revalidated |
|------|-------------------|-------------|
| ring-integrity-gate | UNKNOWN | CONFIRMED MISSING — script does not exist |
| rc-network-surface-gate | UNKNOWN (wrong runtime) | FALSE_PASS — rg absent, produces 0-byte log |
| G6 build reproducibility | BLOCKED (env) | CONFIRMED BLOCKED — no Rust toolchain |
| G9 (partial output) | PASS partial | WEAK_PROOF — exits after listing files |
| G1/G2/G3 PASS | PASS (rg fallback claimed) | FALSE_PASS — no fallback exists |

---

## 3.3 Runtime Truth

| Target | Status | Notes |
|--------|--------|-------|
| SOURCE | ✅ Present | src/ + src-tauri/ present |
| DESKTOP_DEV | ⚠️ BLOCKED | No Rust build env; no dist/ |
| APPIMAGE | ⚠️ BLOCKED | Referenced in AH entries, not buildable here |
| DEB | ⚠️ BLOCKED | Same as AppImage |
| DEPLOYMENT_LATEST | ✅ Directory present | `deployment/latest/` exists with v27 artifacts |
| launcher local | ⚠️ UNKNOWN | No binary in current env |

**What the first audit could NOT validate:** All runtime targets. No Tauri build, no AppImage, no DEB, no binary execution. All "structural" claims are source-code-only.

---

## 3.4 Tooling Truth

| Tool | Present? | Gates Affected | Impact |
|------|----------|---------------|--------|
| `rg` (ripgrep) | ❌ NOT INSTALLED | G1, G2, G3, rc-network-surface | **FALSE_PASS** on all |
| `node` | ✅ Present | CSP, UI-INDEX, forbidden-scripts | Gates execute correctly |
| `bash` | ✅ Present | G1-G9, verify_instructions | Scripts run but rg-dependent ones hollow |
| `python3` | ✅ Present | autoheal parse | Works correctly |
| `cargo/rustc` | ❌ NOT INSTALLED | G6, any Rust build | G6 BLOCKED |
| `pnpm` | ✅ Present | Frontend tests, verify:final100 | Available |

**Critical finding:** First audit stated "gates fall back to grep" for rg-missing cases. This is **incorrect**. No grep fallback exists in G1, G2, G3, or rc-network-surface scripts. When rg fails with `|| true`, the variable is empty, and the gate takes the "no matches found → PASS" branch. This is structural false confidence.

---

## 3.5 Doctrine/Gate Truth

| Gate | In CI? | In run-all.sh? | Local Only? |
|------|--------|---------------|-------------|
| G1-G8 | ❌ NO | ✅ YES | ✅ LOCAL ONLY |
| G9 | ❌ NO | ✅ YES | ✅ LOCAL ONLY |
| CSP-baseline | ✅ YES (with waiver) | ❌ NO | CI-only |
| verify_instructions | ❌ not in ci-unified | ❌ not in run-all | standalone |
| detect_recurrence | ❌ not in ci-unified | ❌ not in run-all | standalone |
| UI-INDEX-GATE | ✅ YES | ❌ NO | CI-only |
| registry-gate | ✅ YES | ❌ NO | CI-only |
| forbidden-scripts | ✅ YES | ❌ NO | CI-only |

**Implication:** The "G4 FAIL is a HIGH priority blocker" claim from audit 1 is MISPRIORITIZED. G4 is a local-only gate not tracked by CI. Its failure is a local documentation gap, not a CI blocking issue.
