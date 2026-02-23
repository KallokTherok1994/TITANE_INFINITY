# P4 INFRASTRUCTURE INVENTORY

## 1. CI/CD Pipeline

### GitHub Actions
- .github/workflows/global-distribution-monitor.yml
- .github/workflows/capability-qualification.yml
- .github/workflows/docs-deploy.yml
- .github/workflows/p0-secret-scan.yml
- .github/workflows/cosmic-consciousness-synchronization.yml
- .github/workflows/constitution-audit.yml
- .github/workflows/universal-omniscience.yml
- .github/workflows/rust-docker.yml
- .github/workflows/performance.yml
- .github/workflows/archive/ci-cd.yml
- .github/workflows/archive/titane_ci.yml
- .github/workflows/archive/ci.yml
- .github/workflows/archive/release.yml
- .github/workflows/codeql.yml
- .github/workflows/changelog.yml
- .github/workflows/secret-scan-gitleaks.yml
- .github/workflows/deploy-v27-production.yml
- .github/workflows/p3-stable-build.yml
- .github/workflows/mermaid.yml
- .github/workflows/p0-2-surface-guard.yml
- .github/workflows/release-certification-final.yml
- .github/workflows/perfection-maintenance.yml
- .github/workflows/ci.yml
- .github/workflows/consciousness-matrix.yml
- .github/workflows/p6-capability-qualification.yml
- .github/workflows/release.yml
- .github/workflows/omniscient-programming-interface.yml
- .github/workflows/release-deployment.yml
- .github/workflows/ultimate-transcendence-synthesis.yml
- .github/workflows/stable-build.yml
- .github/workflows/multiversal-orchestrator.yml
- .github/workflows/release-unified.yml
- .github/workflows/source-reality-fusion.yml
- .github/workflows/ai-system-optimization.yml
- .github/workflows/quantum-evolution.yml
- .github/workflows/p0-surface-guard.yml
- .github/workflows/production-monitoring.yml
- .github/workflows/mermaid-verify.yml
- .github/workflows/gitguardian.yml
- .github/workflows/infinite-dimensional-transcendence.yml
- .github/workflows/final-state-beyond-all-states.yml
- .github/workflows/reality-architect-mastery.yml
- .github/workflows/registry-guard.yml
- .github/workflows/p0-1-secrets-guard.yml
- .github/workflows/p4-constitution-audit.yml
- .github/workflows/p2-contract-guard.yml
- .github/workflows/p3-build-guard.yml
- .github/workflows/ci-unified.yml
- .github/workflows/dependabot-auto-review.yml
- .github/workflows/p5-runtime-governance.yml

### Workflow Summary
-rw-rw-r-- 1 titane-os titane-os  9371 janv. 29 12:54 release-certification-final.yml
-rw-rw-r-- 1 titane-os titane-os  8602 janv. 16 15:49 release-deployment.yml
-rw-rw-r-- 1 titane-os titane-os 12285 janv. 19 15:24 release-unified.yml
-rw-rw-r-- 1 titane-os titane-os  4348 janv. 19 16:13 release.yml
-rw-rw-r-- 1 titane-os titane-os  2920 janv. 19 15:24 rust-docker.yml
-rw-rw-r-- 1 titane-os titane-os   675 févr. 13 18:21 secret-scan-gitleaks.yml
-rw-rw-r-- 1 titane-os titane-os 26753 janv. 16 15:49 source-reality-fusion.yml
-rw-rw-r-- 1 titane-os titane-os  6245 janv. 17 10:37 stable-build.yml
-rw-rw-r-- 1 titane-os titane-os 31981 janv. 16 15:49 ultimate-transcendence-synthesis.yml
-rw-rw-r-- 1 titane-os titane-os 26613 janv. 16 15:49 universal-omniscience.yml

## 2. Release/Sealing Scripts

### Location Search Results
#### scripts/release/:

#### scripts containing 'cert', 'seal', 'release', 'master':
scripts/deployment/certified-deploy.sh
scripts/create-release-v27.0.2.sh
scripts/audit/00-master-audit.sh
scripts/build/build-release.sh
scripts/setup/create_release_package.sh
scripts/gates/g4-provider-decision-certified.sh
scripts/governance/prod-cert-release.sh
scripts/certification/run-p10-desktop-cert.sh
scripts/certification/run-master-chat-to-prod.sh
scripts/certification/lib_cert.sh

#### All scripts (sample):
scripts/activate-node24.sh
scripts/advanced-diagnostic.sh
scripts/analyze-memory-migration.sh
scripts/audit-charts.sh
scripts/audit-complete.sh
scripts/auto-all.sh
scripts/autobuild_full.sh
scripts/auto_fix.sh
scripts/auto-replace-console.sh
scripts/auto-test-phase3.sh
scripts/benchmark.sh
scripts/beta-doctor.sh
scripts/build-fast.sh
scripts/build-in-docker.sh
scripts/build_optimized.sh
scripts/build_titane.sh
scripts/check_forbidden_files.sh
scripts/checklist-interactive.sh
scripts/check_system.sh
scripts/clean_build.sh

## 3. Registry / Append-Only Mechanism

### Search for registry/append-only:
scripts/init-copilot-xs.sh:# 6) Wire Husky pre-commit (append if missing)
scripts/verify/verify-mermaid-drift.sh:# Drift 3 - Mermaid hash registry (append-only, deterministic)
scripts/verify/mermaid-hash-registry.sh:        history.append({"timestamp": timestamp or "unknown", "sha256": digest})
scripts/verify/mermaid-hash-registry.sh:        history.append({"timestamp": now, "sha256": digest})
scripts/verify/mermaid-status-report.sh:print("true" if data.get("registry_append_only") else "false")

### Registry directory:
./registry
./docs/registry
./runtime/registry
./scripts/registry

## 4. Build & Package Commands

### package.json build targets:
  "packageManager": "pnpm@10.28.2",
    "build": "vite build",
    "build:prod-safe": "NPM_CONFIG_IGNORE_SCRIPTS=1 vite build",
    "build:prod-safe:verify": "node scripts/guards/guard-prod-safe-build.mjs",
    "build:tauri:e2e": "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json",
    "build:production": "pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh",
    "build-storybook": "storybook build",

## 5. Tauri Configuration

### tauri.conf.json allowlist check:
Found src-tauri/tauri.conf.json
```
null
```
