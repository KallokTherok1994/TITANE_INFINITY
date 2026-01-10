# Archived Workflows

**Date Archived:** 2026-01-03  
**Reason:** CI/CD Pipeline Modernization & Consolidation

## Files Archived

### ci.yml

- **Version:** No version tag
- **Status:** LEGACY - Replaced by ci-unified.yml
- **Reason:** Basic CI workflow with no concurrency control, floating Rust version, missing timeouts and permissions

### ci-cd.yml

- **Version:** v22.0.0
- **Status:** LEGACY - Replaced by ci-unified.yml
- **Reason:** Outdated version, redundant with ci-unified.yml, missing modern features

### titane_ci.yml

- **Version:** v20Ω
- **Status:** LEGACY - Replaced by ci-unified.yml
- **Reason:** Very outdated, uses different Rust action (actions-rust-lang instead of dtolnay), heavy use of continue-on-error

### release.yml

- **Version:** v17.3.0
- **Status:** LEGACY - Replaced by release-unified.yml
- **Reason:** Outdated version, redundant with release-unified.yml, missing workflow_dispatch trigger

## Modern Workflows (Active)

The following workflows are now active and maintained:

1. **ci-unified.yml** (v26.3.0)
   - Comprehensive CI/CD pipeline
   - Explicit permissions (least privilege)
   - Concurrency control
   - Timeout limits on all jobs
   - Pinned Rust version (1.83)
   - Optimized caching (Swatinem/rust-cache)
   - Linux-only builds for CI speed

2. **release-unified.yml** (v26.3.0)
   - Multi-platform release pipeline (Linux, Windows, macOS)
   - Explicit permissions
   - Concurrency control
   - Tag and manual dispatch triggers
   - macOS architecture matrix (Intel + Apple Silicon)

3. **rust-docker.yml** (Updated 2026-01-03)
   - Specialized Docker-based Rust testing
   - Isolated environment with full Tauri dependencies
   - Updated to modern standards

## Rationale for Modernization

The archived workflows had the following issues:

- **Redundancy:** 4 CI workflows doing essentially the same thing
- **Version Inconsistency:** Mix of floating ("stable") and pinned Rust versions
- **Missing Security:** No explicit permissions (too permissive by default)
- **No Concurrency Control:** Could run duplicate jobs, wasting resources
- **Missing Timeouts:** Jobs could hang indefinitely
- **Outdated Actions:** Mix of different Rust setup actions
- **Inefficient Caching:** Using basic actions/cache instead of specialized Rust caching

## Migration Notes

If you need to reference the old workflows for any reason, they are preserved here. The new workflows maintain all functionality while adding:

- ✅ Explicit permissions (least privilege)
- ✅ Concurrency control (cancel-in-progress)
- ✅ Timeout limits on all jobs
- ✅ Pinned Rust version (1.83)
- ✅ Optimized Rust caching (Swatinem/rust-cache@v2.7.3)
- ✅ Updated action versions (all latest stable)
- ✅ Better summaries with configuration details
- ✅ Linux-only CI builds for speed (multi-platform on releases only)

## Restoration

If you need to restore any of these workflows:

1. Copy the file from this archive directory back to `.github/workflows/`
2. Update it with modern practices (see CI_PIPELINE_CURRENT_STATE.md and PIPELINE_UPDATE_REPORT.md)
3. Test thoroughly before relying on it

**Do NOT restore without modernization** - these workflows are archived for good reasons.
