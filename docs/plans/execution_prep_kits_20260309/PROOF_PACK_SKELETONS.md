# Proof Pack Skeletons

**Date:** 2026-03-09  
**Type:** PREP_ONLY — Pre-created skeletons with `[FILL_ME_IN]` markers.  
**Usage:** Copy the relevant skeleton to the target path, then fill in marked tokens during execution.

---

## SKELETON 1 — P9_P8_RESOLUTION Proof Pack

**Target:** `proof_packs/P9_P8_RESOLUTION_20260309/`

### File: VERDICT.md

```markdown
# Proof Pack — P9 + P8 Resolution

**Session:** H1_terminal_execution
**Date:** [FILL_DATE]
**MAIN HEAD:** [FILL_SHA]
**Phase:** H1 TERMINAL

---

## Gate Matrix

| Gate | Result | Evidence |
|------|--------|---------|
| P9 Build #1 normalized hash | `[FILL_HASH_1_NORM]` | `deployment/latest/builds/hash_run_1.txt` (normalized) |
| P9 Build #2 normalized hash | `[FILL_HASH_2_NORM]` | `/tmp/titane-infinity.run2.normalized` |
| P9 Build #3 normalized hash | `[FILL_HASH_3_NORM]` | `/tmp/titane-infinity.run3.normalized` |
| P9 3-way match | [PASS/FAIL] | All 3 normalized hashes equal |
| P8 artifact current | PASS | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` |
| AutoHeal AH-2026-03-09-0110 | APPENDED | `scripts/autoheal/autoheal_rules.jsonl` entry 146 |
| verify_instructions.sh | [FILL_VI_RESULT] | Console output |
| detect_recurrence.sh | [FILL_DR_RESULT] | Console output, [FILL_ENTRY_COUNT] entries |

---

## Evidence Files

- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md`
- `deployment/latest/builds/P8_INSTALL_VERIFICATION.md`
- `scripts/autoheal/autoheal_rules.jsonl` (entry AH-2026-03-09-0110)

---

## VERDICT_UNIQUE: [PASS/FAIL/BLOCKED]

**Rationale:** [FILL_ONE_LINE_RATIONALE]

---

## Next Action

[PASS]: Proceed to H3 — P10 Certification Freeze  
[FAIL]: Classify BLOCKED, investigate hash divergence, append AutoHeal FAIL entry

---

## Rollback

```bash
git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md
git restore -- scripts/autoheal/autoheal_rules.jsonl
git restore -- proof_packs/P9_P8_RESOLUTION_20260309/
```
```

---

### File: ROLLBACK.md

```markdown
# Rollback Plan — P9_P8_RESOLUTION

**Session:** H1_terminal_execution  
**Date:** [FILL_DATE]

## If P9 FAIL (hash mismatch)

```bash
# Do NOT write BUILD_REPRODUCIBILITY.md with PASS
# Document failure instead:
git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md
# Append AutoHeal FAIL entry (use AH-2026-03-09-0110 with root_cause = hash_mismatch)
```

## If AutoHeal entry is malformed

```bash
git restore -- scripts/autoheal/autoheal_rules.jsonl
# Then re-append with correct JSON syntax
python3 -c "import json; [json.loads(l) for l in open('scripts/autoheal/autoheal_rules.jsonl')]" && echo "JSON OK"
```

## Full H1 rollback

```bash
git restore -- deployment/latest/builds/ proof_packs/P9_P8_RESOLUTION_20260309/ scripts/autoheal/autoheal_rules.jsonl
```
```

---

## SKELETON 2 — P10 Certification Freeze Proof Pack

**Target:** `proof_packs/P10_CERTIFICATION_FREEZE_20260309/`

### File: VERDICT.md

```markdown
# Proof Pack — P10 Certification Freeze

**Session:** H3_p10_certification
**Date:** [FILL_DATE]
**MAIN HEAD:** [FILL_SHA]
**Product Version:** [FILL_VERSION]
**Phase:** H3 — Certification Freeze

---

## Precondition Verification

| Precondition | Status | Evidence |
|-------------|--------|---------|
| P8 PASS | [PASS/FAIL] | `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` |
| P9 PASS | [PASS/FAIL] | `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` |
| verify_instructions.sh PASS=20 | [PASS/FAIL] | Console output |
| detect_recurrence.sh PASS | [PASS/FAIL] | Console output |
| PROD token provided | [YES/NO] | `GO_FOR_PROD_BUILD__TITANE_INFINITY` |

---

## Gate Matrix

| Gate | Result | Notes |
|------|--------|-------|
| g9-release-seal.sh | [PASS/SKIPPED] | [FILL_NOTES] |
| G7 tauri-allowlist-lock | [PASS/FAIL] | No allowlist changes |
| All CI workflows | [PASS/FAIL] | GitHub Actions status |
| AutoHeal AH-2026-03-09-0111 | APPENDED | P10 completion entry |

---

## Certification Tag

```
Tag: CERT-FREEZE-v[FILL_VERSION]-20260309
Pushed to: MAIN
Pushed at: [FILL_TIMESTAMP]
```

---

## VERDICT_UNIQUE: [PASS/FAIL/BLOCKED_APPROVAL]

**Rationale:** [FILL_RATIONALE]

---

## Rollback

```bash
# Remove incorrect tag if pushed:
git push origin --delete CERT-FREEZE-v[FILL_VERSION]-20260309
git tag -d CERT-FREEZE-v[FILL_VERSION]-20260309

# Restore proof pack:
git restore -- proof_packs/P10_CERTIFICATION_FREEZE_20260309/
```
```

---

## SKELETON 3 — AutoHeal Entry AH-2026-03-09-0110

**Target:** Append to `scripts/autoheal/autoheal_rules.jsonl` as a single JSON line.  
**Replace ALL `[FILL_*]` tokens before appending.**

```json
{"id":"AH-2026-03-09-0110","date":"2026-03-09","scope":["p9","g6","reproducible-build","h1-terminal"],"symptom":"P9 (G6 ×3 reproducible build) was interrupted after build #1 in PR176 session, leaving TERM-2 BLOCKED and P10 gated.","root_cause":"Session timeout during G6 run #2/3. Build environment (Tauri deps) not available in PR sandbox. G6 hash normalization was hardened in AH-2026-03-09-0109 before the interruption.","fix":"Resumed G6 in H1 terminal session with Tauri deps provisioned. Ran build #2 (hash: [FILL_HASH_2_NORM]) and build #3 (hash: [FILL_HASH_3_NORM]) with SOURCE_DATE_EPOCH=1000000000 CARGO_BUILD_JOBS=1. Confirmed 3x normalized hashes match. P9 PASS artifact written to deployment/latest/builds/BUILD_REPRODUCIBILITY.md.","prevention_test":"detect_recurrence.sh checks AutoHeal chain is clean. G6 script hardened with strip-unneeded+objcopy build-id removal (AH-2026-03-09-0109). H1_EXEC_KIT.md pre-flight checklist prevents underpowered build environment.","commands":["cargo build --release --locked --manifest-path src-tauri/Cargo.toml","sha256sum src-tauri/target/release/titane-infinity","bash scripts/verify_instructions.sh","bash scripts/autoheal/detect_recurrence.sh"],"files_changed":["deployment/latest/builds/BUILD_REPRODUCIBILITY.md","deployment/latest/builds/P8_INSTALL_VERIFICATION.md","scripts/autoheal/autoheal_rules.jsonl","proof_packs/P9_P8_RESOLUTION_20260309/VERDICT.md"],"rollback":"git restore -- deployment/latest/builds/BUILD_REPRODUCIBILITY.md scripts/autoheal/autoheal_rules.jsonl"}
```

**Validation after append:**

```bash
# 1. Count: must be 146
wc -l scripts/autoheal/autoheal_rules.jsonl

# 2. JSON syntax valid:
python3 -c "import json; [json.loads(l) for l in open('scripts/autoheal/autoheal_rules.jsonl')]" && echo "JSON_OK"

# 3. detect_recurrence PASS:
bash scripts/autoheal/detect_recurrence.sh | tail -3
```

---

## SKELETON 4 — AutoHeal Entry AH-2026-03-09-0111 (P10 Certification Freeze)

**Target:** Append to `scripts/autoheal/autoheal_rules.jsonl` as a single JSON line.  
**Only create this entry AFTER P10 PASS is confirmed.**

```json
{"id":"AH-2026-03-09-0111","date":"2026-03-09","scope":["p10","certification-freeze","h3"],"symptom":"P10 certification freeze not executed: gated on P9+P8 PASS and PROD token.","root_cause":"P9 was blocked (session timeout in PR176). P10 can only proceed after P9 PASS and receipt of GO_FOR_PROD_BUILD__TITANE_INFINITY.","fix":"P10 executed after H1 PASS. g9-release-seal.sh run. CERT-FREEZE-v[FILL_VERSION]-20260309 tag pushed to MAIN. Proof pack P10_CERTIFICATION_FREEZE_20260309 written.","prevention_test":"detect_recurrence.sh. CERT-FREEZE tag presence checked before H4. PROD token policy enforced by kernel Rule 11.","commands":["bash scripts/gates/g9-release-seal.sh","git tag CERT-FREEZE-v[FILL_VERSION]-20260309","git push origin CERT-FREEZE-v[FILL_VERSION]-20260309","bash scripts/verify_instructions.sh","bash scripts/autoheal/detect_recurrence.sh"],"files_changed":["proof_packs/P10_CERTIFICATION_FREEZE_20260309/VERDICT.md","proof_packs/P10_CERTIFICATION_FREEZE_20260309/ROLLBACK.md","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- proof_packs/P10_CERTIFICATION_FREEZE_20260309/ && git push origin --delete CERT-FREEZE-v[FILL_VERSION]-20260309 || true"}
```

---

## How to Use These Skeletons

1. **Before execution session starts:** Copy the relevant skeleton file to its target path.
2. **During execution:** Fill `[FILL_*]` tokens as each step completes.
3. **Never write a VERDICT_UNIQUE: PASS** with unfilled `[FILL_*]` tokens.
4. **After all tokens are filled:** Run governance gates to confirm.

### Token Reference

| Token | Source | Example |
|-------|--------|---------|
| `[FILL_DATE]` | `date -u +%Y-%m-%dT%H:%M:%SZ` | `2026-03-09T14:30:00Z` |
| `[FILL_SHA]` | `git rev-parse --short HEAD` | `a1b2c3d` |
| `[FILL_HASH_1_NORM]` | Known from deployment/latest/builds/hash_run_1.txt | `11e30ec1...` |
| `[FILL_HASH_2_NORM]` | Captured in Step 3 of H1 kit | (computed during execution) |
| `[FILL_HASH_3_NORM]` | Captured in Step 5 of H1 kit | (computed during execution) |
| `[FILL_VERSION]` | `cat package.json \| jq -r .version` | `27.2.0` |
| `[FILL_VI_RESULT]` | Output of verify_instructions.sh | `PASS=20 FAIL=0` |
| `[FILL_DR_RESULT]` | Output of detect_recurrence.sh | `PASS` |
| `[FILL_ENTRY_COUNT]` | `wc -l scripts/autoheal/autoheal_rules.jsonl` | `146` |
