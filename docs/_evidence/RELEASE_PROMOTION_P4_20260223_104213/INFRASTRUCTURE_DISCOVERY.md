# P4 INFRASTRUCTURE DISCOVERY

## ✅ DISCOVERED

### 1. CI Pipeline (51 workflows)
- **Key Release Workflows**:
  - `.github/workflows/release-certification-final.yml` (205 lines, 9371 bytes)
  - `.github/workflows/release-deployment.yml` (8602 bytes)
  - `.github/workflows/release-unified.yml` (12285 bytes)
  - `.github/workflows/stable-build.yml`
  - `.github/workflows/p3-build-guard.yml`

### 2. Certification Library
- **Location**: `scripts/certification/lib_cert.sh` (286 lines)
- **Functions**:
  - `mk_pack_dir()` — creates certification pack directory
  - `prechecks_clean_tree()` — validates git tree + forbidden files
  - `sandbox_setup()` — creates isolated sandbox environment
- **Status**: Stable, ready for G5-G9 integration

### 3. Release Orchestration Scripts
- `scripts/governance/prod-cert-release.sh` — production certification
- `scripts/deployment/certified-deploy.sh` — deployment handler
- `scripts/certification/run-master-chat-to-prod.sh` — chat-specific promotion
- `scripts/build/build-release.sh` — release build
- `scripts/setup/create_release_package.sh` — package creation

### 4. Registry Infrastructure
- **Locations**:
  - `./registry/` — root registry
  - `./docs/registry/` — docs registry
  - `./runtime/registry/` — runtime registry
  - `./scripts/registry/` — scripts registry
- **Append-Only References** (found via grep):
  - `scripts/verify/mermaid-hash-registry.sh` — append-only pattern
  - `scripts/verify/mermaid-status-report.py` — registry validation

### 5. Build Commands
- **Primary**: `build:tauri:e2e` (production build with authorization)
- **Secondary**: `build:production` (full pipeline lint+format+bundle)
- **Vite Build**: `vite build` (frontend)
- **Tauri Build**: `tauri build --config src-tauri/tauri.conf.json`

### 6. Tauri Configuration
- **File**: `src-tauri/tauri.conf.json` (1090 lines)
- **Capabilities**: Defined via `app.security.capabilities` array
- **Allowlist**: NOT present (future P4.G7 work)
- **Reference**: `src-tauri/allowlist.whitelist.stable.json` mentioned in release-certification-final.yml
  → **ACTION**: Must verify/create if missing

### 7. Constitutional Framework
- **L1_LOCAL_FIRST**: Tauri architecture ✅
- **L2_DUAL_RUNTIME**: `runtime/dev` + `runtime/stable` separation ✅
- **L3_NO_SECRETS**: No .env files ✅
- **L4_NO_EXPANSION**: Surface lock (commands count checked) ✅
- **L5_NO_FREE_REFACTOR**: Contracts `tauriCommands.ts` + `tauriClient.ts` ✅
- **L6_PROOF_OVER_INTUITION**: Evidence in `docs/_evidence/` ✅
- **L7_SAFE_RUN_GATE**: All gates active ✅

## ⚠️ ACTIONS REQUIRED FOR P4.G5-G9

### 1. **G5: CI_WIRING**
- [ ] Create `scripts/gates/run-all.sh` (aggregator for G1-G9)
- [ ] Verify GitHub Actions hooks to run on MAIN push
- [ ] Document token flow: `GO_FOR_PROD_BUILD__TITANE_INFINITY`

### 2. **G6: BUILD_REPRO_X3**
- [ ] Execute build x3: capture SHA256 hashes
- [ ] Compare: all hashes must match (reproducible build)
- [ ] Document in `BUILD_REPRODUCIBILITY.md`

### 3. **G7: TAURI_ALLOWLIST_LOCK**
- [ ] Verify/create `src-tauri/allowlist.whitelist.stable.json`
- [ ] Compare capabilities vs. whitelist
- [ ] Ensure no wildcard permissions
- [ ] Lock to strict whitelist mode (no expansion)

### 4. **G8: PROVIDER_API_ONLY**
- [ ] Grep frontend for hardcoded provider endpoints
- [ ] Verify all endpoints resolved via IPC (ring-isolated)
- [ ] Document whitelist in `PROVIDER_API_WHITELIST.md`

### 5. **G9: RELEASE_SEAL_PROOF_PACK_COMPLETE**
- [ ] Execute sealing workflow
- [ ] Generate registry entry (append-only)
- [ ] Verify all evidence present (P1-P4 complete)
- [ ] Create final VERDICT report

## 🔐 VERSIONS & TOKENS

### Current Version
- Package: v27.0.5 (from tauri.conf.json)
- Required tokens for prod:
  - `GO_FOR_PROD_BUILD__TITANE_INFINITY`
  - `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`

## 📋 NEXT STEPS

1. **Create G5-G9 gates** (shell scripts, parallel to existing G1-G4)
2. **Create run-all.sh aggregator** (orchestrates all 9 gates)
3. **Execute build reproducibility** (3 independent runs)
4. **Seal release** (via lib_cert.sh + governance scripts)
5. **Generate final VERDICT** (P4 completion)

---
Generated: P4 Phase 1
Status: **INFRASTRUCTURE MAPPED ✅**
