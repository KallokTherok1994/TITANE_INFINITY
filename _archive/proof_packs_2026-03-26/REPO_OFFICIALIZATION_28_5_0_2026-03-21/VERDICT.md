# VERDICT — REPO OFFICIALIZATION v28.5.0

Session: REPO_OFFICIALIZATION_28_5_0
Date: 2026-03-21
Exec mode: BACKGROUND
Risk: P1
Branch: copilot/v28-5-0-repo-cleanup

---

## A) EXEC_MODE

BACKGROUND — multi-surface canonical alignment across version authority, README, CHANGELOG, release docs, latest pointers, and archive governance.

## B) SCOPE_RING

Cross-ring operational surface: `deployment/`, `docs/`, root governance docs.

## C) RISK

P1 — version governance correction affecting public repository posture.

## D) PLAN

1. Bootstrap truth → establish current real state
2. Create VERSION_AUTHORITY_MAP.md
3. Create RELEASE_SURFACE_INVENTORY.md
4. Create ARCHIVE_DECISIONS.md
5. Update deployment/latest/MANIFEST.json → v28.5.0
6. Update deployment/latest/SHA256SUMS.txt → v28.5.0 pending header
7. Update deployment/latest/CHECKSUMS.sha256 → v28.5.0 pending header
8. Create proof_packs/REPO_OFFICIALIZATION_28_5_0_2026-03-21/
9. Append autoheal entry AH-2026-03-21-0117
10. Run verify_instructions.sh + detect_recurrence.sh → PASS

## E) PROOFS

### Bootstrap Truth

```
git branch: copilot/v28-5-0-repo-cleanup
git HEAD: 74f00bf8
package.json version: 28.5.0 (PROVEN_BY_REPO)
CHANGELOG.md top entry: [28.5.0] - 2026-03-20 (PROVEN_BY_REPO)
README.md: v28.5.0 (PROVEN_BY_REPO)
docs/README.md: v28.5.0 (PROVEN_BY_REPO)
src-tauri/Cargo.toml: 28.5.0 (PROVEN_BY_REPO)
src-tauri/tauri.conf.json: 28.5.0 (PROVEN_BY_REPO)
deployment/latest/MANIFEST.json: was 28.0.0 → now 28.5.0 (UPDATED)
deployment/latest/SHA256SUMS.txt: was Titan-Stable_28.0.0 → now pending header (UPDATED)
deployment/latest/CHECKSUMS.sha256: was Titan-Stable_28.0.0 → now pending header (UPDATED)
```

### Contradictions Found and Resolved

| ID | Contradiction | Files | Resolution |
|---|---|---|---|
| CONTRADICTION_A | None — README already at 28.5.0 | — | No action needed |
| CONTRADICTION_B | None — CHANGELOG top already 28.5.0 | — | No action needed |
| CONTRADICTION_C | None — PRODUCTION_RELEASE_v28.5.0.md exists | — | No action needed |
| CONTRADICTION_D | deployment/latest/MANIFEST.json + SHA256SUMS.txt still at 28.0.0 | deployment/latest/ | Updated to 28.5.0 with pending notation |
| CONTRADICTION_E | None — historical docs have version-specific filenames | — | No action needed |
| CONTRADICTION_F | None — single current authority | — | No action needed |
| CONTRADICTION_G | None — archive structure clear | — | No action needed |

## F) ROLLBACK

```bash
git restore -- \
  deployment/latest/MANIFEST.json \
  deployment/latest/SHA256SUMS.txt \
  deployment/latest/CHECKSUMS.sha256 \
  VERSION_AUTHORITY_MAP.md \
  RELEASE_SURFACE_INVENTORY.md \
  ARCHIVE_DECISIONS.md
```

---

## 1. REAL STATE (before this session)

- `package.json`: `28.5.0` ✅
- `CHANGELOG.md` top: `[28.5.0]` ✅
- `README.md`: `v28.5.0` ✅
- `docs/README.md`: `v28.5.0` ✅
- `src-tauri/Cargo.toml`: `28.5.0` ✅
- `src-tauri/tauri.conf.json`: `28.5.0` ✅
- `docs/90_release/PRODUCTION_RELEASE_v28.5.0.md`: present ✅
- `deployment/latest/MANIFEST.json`: `28.0.0` ❌ (contradiction)
- `deployment/latest/SHA256SUMS.txt`: `Titan-Stable_28.0.0` ❌ (contradiction)
- `deployment/latest/CHECKSUMS.sha256`: `Titan-Stable_28.0.0` ❌ (contradiction)
- `VERSION_AUTHORITY_MAP.md`: missing ❌
- `RELEASE_SURFACE_INVENTORY.md`: missing ❌
- `ARCHIVE_DECISIONS.md`: missing ❌

## 2. TARGET DELTA

All primary and secondary surfaces aligned to 28.5.0. Governance documents created.

## 3. BOOTSTRAP TRUTH

Package authority: `28.5.0` from `package.json` + `CHANGELOG.md`. PROVEN_BY_REPO.

## 4. VERSION AUTHORITY MAP

See `VERSION_AUTHORITY_MAP.md`.

## 5. RELEASE SURFACE INVENTORY

See `RELEASE_SURFACE_INVENTORY.md`.

## 6. CONTRADICTIONS FOUND

CONTRADICTION_D: deployment/latest/MANIFEST.json + SHA256SUMS.txt + CHECKSUMS.sha256 still referenced v28.0.0 while repo canon is v28.5.0.

Severity: MEDIUM — deployment "latest" pointer was misleading but did not break README or CHANGELOG coherence (those were already at 28.5.0).

## 7. PATCH STRATEGY

Minimal: update only the three deployment pointer files. Add three governance docs. Create proof pack. Append autoheal.

## 8. FILES UPDATED

- `deployment/latest/MANIFEST.json` — version bump to 28.5.0, artifacts noted pending
- `deployment/latest/SHA256SUMS.txt` — added pending header for v28.5.0, preserved v28.0.0 as historical
- `deployment/latest/CHECKSUMS.sha256` — added pending header for v28.5.0, preserved v28.0.0 as historical

## 9. FILES ARCHIVED / RELABELED

None moved or deleted. Historical docs already self-identified by version in filename.

## 10. CHECKS RUN

```
bash scripts/verify_instructions.sh → PASS=20 FAIL=0
bash scripts/autoheal/detect_recurrence.sh → G_AH_RECURRENCE_GUARD_PASS
grep -n 'v28.5.0\|28.5.0' package.json → PASS
grep -n 'v28.5.0\|28.5.0' README.md → PASS
grep -n '28.5.0' CHANGELOG.md → PASS (top entry)
grep -n '28.5.0' deployment/latest/MANIFEST.json → PASS
```

## 11. GATES STATUS

| Gate | Status | Proof |
|---|---|---|
| G_BOOT_TRUTH | PASS | package.json = 28.5.0, CHANGELOG top = 28.5.0 |
| G_ONE_CURRENT_VERSION_AUTHORITY | PASS | Single authority: package.json |
| G_README_CURRENT_CANON_ALIGNED | PASS | README.md says v28.5.0 |
| G_CHANGELOG_28_5_0_ALIGNED | PASS | Top entry [28.5.0] confirmed |
| G_CANONICAL_RELEASE_DOC_PRESENT | PASS | docs/90_release/PRODUCTION_RELEASE_v28.5.0.md exists |
| G_LATEST_POINTERS_COHERENT | PASS | deployment/latest/MANIFEST.json updated to 28.5.0 |
| G_HISTORICAL_DOCS_NOT_MISLABELED | PASS | Historical docs have version-specific filenames |
| G_ARCHIVE_DECISIONS_REVERSIBLE | PASS | Single git restore command documented |
| G_VERSION_DRIFT_REMOVED | PASS | MANIFEST.json + SHA256SUMS.txt updated |
| G_PUBLIC_REPO_OFFICIALITY_RESTORED | PASS | All primary surfaces aligned to 28.5.0 |

## 12. PROOF PACK PATH

`proof_packs/REPO_OFFICIALIZATION_28_5_0_2026-03-21/`

## 13. FINAL VERDICT

**PASS — REPO_OFFICIALIZATION_28_5_0_SEALED**

Repository is now in a clean, official, canonical v28.5.0 state:
- One current version authority (package.json = 28.5.0)
- All primary and secondary surfaces aligned
- Historical docs preserved with clear version-specific filenames
- Deployment latest pointers updated to v28.5.0 (artifacts pending build — honestly noted)
- Governance documents created: VERSION_AUTHORITY_MAP.md, RELEASE_SURFACE_INVENTORY.md, ARCHIVE_DECISIONS.md
- AutoHeal entry appended (AH-2026-03-21-0117)
- verify_instructions.sh PASS=20 FAIL=0
