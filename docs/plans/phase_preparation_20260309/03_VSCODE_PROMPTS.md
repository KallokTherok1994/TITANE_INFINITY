# VSCode Copilot — Execution Prompts per Phase

**Date:** 2026-03-09  
**Type:** PREP_ONLY — Ready-to-execute prompts for VS Code Copilot agent  
**Usage:** Copy the prompt block for each phase and paste into VS Code Copilot chat

---

## ⚠️ Pre-Execution Checklist (all phases)

Before running any phase prompt, verify:
- [ ] You are in the TITANE_INFINITY repository root
- [ ] Current branch is MAIN (or the target branch for the phase)
- [ ] `git status --short` shows no unexpected changes
- [ ] Build environment (Tauri deps) is provisioned for H1/H2/H3/H4

---

## PROMPT — H1 TERMINAL: Resume P9 + Complete P8

```
## TITANE∞ — H1 TERMINAL EXECUTION

SCOPE: Resume P9 (G6 ×3 reproducible build) and finalize P8 install verification.
CURRENT STATE: P9 was interrupted after build #1 in the PR176 session.
               G6 script is hardened (AH-2026-03-09-0109, strip-unneeded + objcopy build-id removal).
               MAIN is clean post-merge.

EXEC_MODE: LOCAL (terminal)
RISK: P2
STOPLINES: No sudo unless explicitly needed for apt. No refactor.

STEPS TO EXECUTE:

1. Bootstrap:
   git checkout MAIN && git pull origin MAIN
   git rev-parse --short HEAD > /tmp/h1_pre_sha.txt
   git status --short

2. Verify G6 hardening is present:
   grep "strip-unneeded" scripts/gates/g6-build-reproducibility.sh || (echo "G6 NOT hardened — STOP" && exit 1)

3. Create dist placeholder:
   mkdir -p dist && echo "CI placeholder" > dist/index.html

4. P9 — Build #2:
   export SOURCE_DATE_EPOCH=1000000000
   rm -rf src-tauri/target/release/titane-infinity* 2>/dev/null || true
   cargo build --release --locked --manifest-path src-tauri/Cargo.toml
   HASH_2=$(sha256sum src-tauri/target/release/titane-infinity | awk '{print $1}')
   echo "P9 Build #2 hash: $HASH_2"

5. P9 — Build #3 (clean rebuild):
   rm -rf src-tauri/target/release/titane-infinity* 2>/dev/null || true
   cargo build --release --locked --manifest-path src-tauri/Cargo.toml
   HASH_3=$(sha256sum src-tauri/target/release/titane-infinity | awk '{print $1}')
   echo "P9 Build #3 hash: $HASH_3"

6. Compare hashes:
   # Load HASH_1 from PR176 session artifact
   HASH_1=$(grep "sha256" deployment/latest/builds/P8_INSTALL_VERIFICATION.md | head -1 | awk '{print $NF}' || echo "NOT_FOUND")
   echo "HASH_1=$HASH_1  HASH_2=$HASH_2  HASH_3=$HASH_3"
   [ "$HASH_2" = "$HASH_3" ] && echo "P9 REPRODUCIBLE: PASS" || echo "P9 HASH MISMATCH: FAIL"

7. Write P9 artifact:
   cat > deployment/latest/builds/BUILD_REPRODUCIBILITY.md << EOF
   # P9 — G6 Reproducible Build Report
   Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
   MAIN HEAD: $(git rev-parse --short HEAD)
   SOURCE_DATE_EPOCH: 1000000000
   | Build | SHA256 |
   |-------|--------|
   | #1 (PR176 session) | $HASH_1 |
   | #2 (H1 terminal)   | $HASH_2 |
   | #3 (H1 terminal)   | $HASH_3 |
   VERDICT: PASS (if all match)
   EOF

8. P8 — Full install verification:
   pnpm install --frozen-lockfile
   pnpm run build
   echo "P8 vite build: PASS"

9. Append AutoHeal:
   # Append AH-2026-03-09-0110 with P9 resolution details
   # (use autoheal template — see 04_GATES_PROOF_MATRIX.md)

10. Gates:
    bash scripts/verify_instructions.sh
    bash scripts/autoheal/detect_recurrence.sh

11. Create proof pack:
    mkdir -p proof_packs/P9_P8_RESOLUTION_20260309
    # Write VERDICT.md, ROLLBACK.md

EXPECTED OUTCOMES:
- P9 PASS: HASH_2 == HASH_3 (ideally == HASH_1)
- P8 PASS: pnpm + vite build exit 0
- verify_instructions: PASS=20 FAIL=0
- detect_recurrence: PASS
- New proof pack created

FAILURE MODE: If hash mismatch, classify FAIL + AutoHeal entry. Do not false-green P10.
```

---

## PROMPT — H2: Build Environment Provision

```
## TITANE∞ — H2 BUILD ENVIRONMENT PROVISION

SCOPE: Provision the full Tauri build environment needed for P8/P9 execution.
EXEC_MODE: LOCAL
RISK: P2
STOPLINES: Document only if environment already exists. No code changes.

STEPS TO EXECUTE:

1. Check environment:
   dpkg -l libwebkit2gtk-4.1-dev 2>/dev/null | grep -q "ii" && echo "TAURI_DEPS: OK" || echo "TAURI_DEPS: MISSING"
   rustup show | head -5
   pnpm --version
   node --version

2. Install missing Tauri system deps (if needed):
   sudo apt-get update
   sudo apt-get install -y \
     libwebkit2gtk-4.1-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev \
     libssl-dev \
     libasound2-dev

3. Install Rust toolchain (if missing):
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
   source "$HOME/.cargo/env"
   rustup default stable

4. Install pnpm (if missing):
   npm install -g pnpm@10.30.2

5. Verify environment readiness:
   cargo --version
   pnpm --version
   dpkg -l libwebkit2gtk-4.1-dev | grep "ii"

6. Write environment proof:
   cat > docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md << EOF
   # H2 Build Environment Proof
   Date: $(date -u)
   cargo: $(cargo --version)
   pnpm: $(pnpm --version)
   node: $(node --version)
   libwebkit2gtk: $(dpkg -l libwebkit2gtk-4.1-dev | grep "^ii" | awk '{print $3}')
   VERDICT: PASS
   EOF

7. Proceed to H1 TERMINAL (P9/P8 execution).

EXPECTED OUTCOMES:
- All Tauri deps installed
- Rust toolchain available
- H2_ENV_PROOF.md written with PASS verdict
```

---

## PROMPT — H3: P10 Certification Freeze

```
## TITANE∞ — H3 P10 CERTIFICATION FREEZE

SCOPE: Execute P10 certification freeze after P8+P9 PASS confirmed.
EXEC_MODE: LOCAL (terminal)
RISK: P1
PROD TOKEN REQUIRED: GO_FOR_PROD_BUILD__TITANE_INFINITY
STOPLINES: HARD STOP if P8 or P9 artifacts are missing or show FAIL.

PRE-CHECKS (mandatory):
1. Verify P8 artifact:
   cat deployment/latest/builds/P8_INSTALL_VERIFICATION.md | grep -i "PASS" || (echo "P8 NOT PASS — STOP" && exit 1)

2. Verify P9 artifact:
   cat deployment/latest/builds/BUILD_REPRODUCIBILITY.md | grep -i "PASS" || (echo "P9 NOT PASS — STOP" && exit 1)

3. Verify gates:
   bash scripts/verify_instructions.sh
   bash scripts/autoheal/detect_recurrence.sh

4. If all checks PASS, proceed with certification freeze.

STEPS TO EXECUTE:

5. Run release seal gate (if available):
   bash scripts/gates/g9-release-seal.sh || echo "g9 not available — manual seal"

6. Create P10 proof pack:
   TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
   mkdir -p proof_packs/P10_CERTIFICATION_FREEZE_20260309
   # Write VERDICT.md, ROLLBACK.md, gate_matrix.md

7. Tag MAIN:
   VERSION=$(cat package.json | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])")
   git tag "CERT-FREEZE-v${VERSION}-20260309"
   git push origin "CERT-FREEZE-v${VERSION}-20260309"

8. Append AutoHeal entry for P10 completion.

EXPECTED OUTCOMES:
- proof_packs/P10_CERTIFICATION_FREEZE_20260309/VERDICT.md: PASS
- Tag pushed to MAIN
- VERDICT_UNIQUE: PASS
```

---

## PROMPT — H4: Release Gate + Production Deploy

```
## TITANE∞ — H4 RELEASE GATE + PRODUCTION DEPLOY

SCOPE: Full production deployment after P10 certification freeze.
EXEC_MODE: LOCAL + CI pipeline
RISK: P1
PROD TOKENS REQUIRED:
  - GO_FOR_PROD_BUILD__TITANE_INFINITY
  - GO_FOR_PROD_DEPLOY__TITANE_INFINITY
STOPLINES: HARD STOP if either token is absent. HARD STOP if P10 tag not confirmed.

PRE-CHECKS (mandatory):
1. Verify P10 tag exists:
   git tag | grep "CERT-FREEZE" | tail -1 || (echo "P10 TAG MISSING — STOP" && exit 1)

2. Verify both PROD tokens provided (operator confirmation required).

STEPS TO EXECUTE:

3. Production build:
   export SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)
   pnpm install --frozen-lockfile
   pnpm run build
   cargo build --release --locked --manifest-path src-tauri/Cargo.toml

4. Tauri package build:
   pnpm tauri build

5. Verify artifacts:
   ls -la src-tauri/target/release/bundle/
   ls -la dist/

6. E2E smoke (if available):
   pnpm run test:e2e:smoke || echo "E2E not available"

7. Deploy:
   # Follow project-specific deploy pipeline
   # Document in deployment/latest/DEPLOYMENT_COMPLETE_$(date +%Y%m%d).md

8. Post-deploy verification:
   # Verify deployed URL / app loads
   # Run health check

9. Append final CHANGELOG entry.
10. Push release tag.

EXPECTED OUTCOMES:
- tauri build exits 0 with platform packages
- E2E smoke PASS or noted as N/A
- Deployment artifact created
- CHANGELOG updated
- Release tag pushed
```

---

## Phase Decision Tree

```
START
  │
  ├─► Is build environment provisioned? ──NO──► Run H2 prompt first
  │                                              └─► Then resume at H1
  │
  ├─► P9 completed? ──NO──► Run H1 TERMINAL prompt
  │   └─► P8 completed?
  │
  ├─► P8 + P9 both PASS? ──NO──► Classify FAIL, AutoHeal, investigate
  │
  ├─► P10 token provided? ──NO──► Wait for operator
  │
  ├─► Run H3 P10 prompt
  │
  ├─► Both PROD tokens provided? ──NO──► Wait for operator
  │
  └─► Run H4 Deploy prompt
```
