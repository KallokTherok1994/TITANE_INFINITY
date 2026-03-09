# Dependency Map + Risk Matrix + Next Safe Action

**Date:** 2026-03-09  
**Session:** phase_preparation_20260309  
**Type:** PREP_ONLY

---

## 1. Phase Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKED_APPROVAL (now)                    │
│              MAIN merged, P10 gated on P8+P9                │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │  H2     │        │  H1     │        │ (skip   │
    │ Build   │───────►│Terminal │        │  if env │
    │ Env     │        │P9 + P8  │        │  ready) │
    └─────────┘        └────┬────┘        └─────────┘
                            │
                            ▼ P8 PASS + P9 PASS
                       ┌─────────┐
                       │  H3     │
                       │P10 Cert │◄── Requires: GO_FOR_PROD_BUILD token
                       │Freeze   │
                       └────┬────┘
                            │
                            ▼ P10 PASS + CERT tag
                       ┌─────────┐
                       │  H4     │◄── Requires: GO_FOR_PROD_BUILD
                       │Release  │◄── Requires: GO_FOR_PROD_DEPLOY
                       │+ Deploy │
                       └─────────┘
```

---

## 2. Technical Dependencies

### P9 (G6 Reproducible Build)

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Rust toolchain | Runtime | ✅ Required | Must match Cargo.lock |
| Tauri system libs | OS | ⚠️ Environment | libwebkit2gtk-4.1-dev etc. |
| libasound2-dev | OS | ⚠️ Environment | Required for alsa-sys |
| SOURCE_DATE_EPOCH | Env var | ✅ Documented | Set to 1000000000 |
| G6 script hardening | Code | ✅ Done (AH-2026-03-09-0109) | strip-unneeded + objcopy |
| MAIN HEAD clean | Git | ✅ Post-PR176 | No uncommitted changes |
| cargo.lock sync | Build | ✅ --locked flag | Ensures reproducibility |

### P8 (Full Install Verification)

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| pnpm 10.30.2 | Runtime | ⚠️ Environment | `npm i -g pnpm@10.30.2` |
| node.js | Runtime | ⚠️ Environment | Check package.json engines |
| dist placeholder | CI contract | ✅ Documented | `mkdir -p dist && echo CI...` |
| vite build | Frontend | ✅ Known PASS | Per PR176 session |

### P10 (Certification Freeze)

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| P8 PASS artifact | Proof | ⏳ Pending | deployment/latest/builds/ |
| P9 PASS artifact | Proof | ⏳ Pending | deployment/latest/builds/ |
| g9-release-seal.sh | Gate | 🔍 Check exists | `ls scripts/gates/` |
| PROD token | Operator | ⏳ Pending | `GO_FOR_PROD_BUILD__TITANE_INFINITY` |

---

## 3. Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Hash mismatch in P9 (build #2 or #3) | P2 (Medium) | P1 (Blocks P10) | Investigate env vars, __DATE__, cargo registry. AH-2026-03-09-0109 hardening reduces risk. |
| Build env not available for H1 | P3 (High) | P2 (Delays H1) | Run H2 first to provision env. Use rust-docker.yml as reference. |
| g9-release-seal.sh missing | P2 (Medium) | P2 (Manual seal) | Manual P10 seal procedure documented in H3 prompt. |
| PROD token not provided | P1 (Low) | P1 (Blocks H3/H4) | Escalate to operator. No workaround per kernel Rule 11. |
| Tauri deps version conflict | P2 (Medium) | P2 (Build fail) | Pin to versions from rust.yml workflow. |
| pnpm version mismatch | P2 (Medium) | P2 (Build fail) | Use `pnpm@10.30.2` per proof_packs baseline. |
| CSP gate local FAIL | P1 (Certain) | P3 (Non-blocking) | CI waived with CSP_ALLOW_UNSAFE=1. Do not escalate to P1. |
| AutoHeal duplicate ID | P2 (Medium) | P2 (Gate fail) | Use next sequential ID after AH-2026-03-09-0109. |

---

## 4. External Dependencies

| Dependency | Source | Version | Risk |
|------------|--------|---------|------|
| Rust stable | rustup | Cargo.lock pinned | Low (--locked) |
| pnpm | npm registry | 10.30.2 | Low |
| libwebkit2gtk | apt | 4.1 | Medium (apt availability) |
| llvm-strip | LLVM | system | Low |
| objcopy (binutils) | apt | system | Low |

---

## 5. Files to Watch (High Impact)

| File | Why Critical | Current State |
|------|-------------|---------------|
| `scripts/gates/g6-build-reproducibility.sh` | P9 hash correctness | ✅ Hardened (AH-2026-03-09-0109) |
| `scripts/autoheal/autoheal_rules.jsonl` | Gate compliance | 145 entries, last: AH-2026-03-09-0109 |
| `src-tauri/Cargo.lock` | Build reproducibility | Must not change between P9 runs |
| `deployment/latest/builds/` | P8/P9 artifacts | P9: empty, P8: partial |
| `src-tauri/tauri.conf.json` | Allowlist/capabilities | Must not change without gate |
| `proof_packs/` | Proof chain | INT-2 PASS, P10 pending |

---

## 6. Next Safe Action (Immediate)

**Current state:** BLOCKED_APPROVAL — awaiting P9/P8 completion.

### ✅ Safe Right Now (no build env needed)

1. Review G6 script to confirm hardening: `cat scripts/gates/g6-build-reproducibility.sh`
2. Review this preparation pack
3. Verify autoheal count: `wc -l scripts/autoheal/autoheal_rules.jsonl`
4. Run governance gates (docs-only): `bash scripts/verify_instructions.sh`

### ⚠️ Requires Build Environment

1. Run H2 environment provisioning
2. Execute H1 terminal (P9 + P8)

### 🔴 Requires Operator Token

1. H3 P10 certification freeze
2. H4 production deploy

---

## 7. Blockers Summary

| Blocker | Owner | Token Required | ETA |
|---------|-------|----------------|-----|
| Build environment (Tauri deps) | Infra/Operator | None | H2 (30min) |
| P9 completion (G6 ×2 more runs) | Agent + Build env | None | H1 (60-90min) |
| P8 completion | Agent + Build env | None | H1 (15min) |
| P10 operator token | Operator | `GO_FOR_PROD_BUILD` | TBD |
| P10 certification freeze | Agent | Token above | H3 (15-30min) |
| Both deploy tokens | Operator | Both PROD tokens | TBD |
| Production deploy | Agent + Operator | Both tokens | H4 |
