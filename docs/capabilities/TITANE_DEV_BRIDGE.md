# Capability: TITANE_DEV_BRIDGE

Template ID: CAP_TEMPLATE_v1
Date creation: 2026-02-09
Author: TITANE DevOps
Status: QUALIFIED
Target layer: Dev

## 1. Name and Purpose

Official name: TITANE_DEV_BRIDGE
Purpose: Provide a local-first, Tauri-only dev control surface via a single JSON contract entry point.

## 2. Current Status

| Status | Date | Commit | Notes |
|--------|------|--------|-------|
| EXPERIMENTAL | 2026-02-09 | N/A | Capability recognized and formalized |
| QUALIFIED | 2026-02-09 | N/A | Contract, guard, and proofs in place |
| STABLE | - | - | Not in scope |
| DEPRECATED | - | - | Not applicable |

## 3. Layer

- [x] Dev only (runtime/dev/, dev allowlist, not exposed in Stable)
- [ ] Stable

Justification: This capability is a local dev bridge and must never expose network surfaces.

## 4. Exposed Surface

### 4.1 Tauri Commands
None. This is a local CLI capability only.

### 4.2 Permissions
No new permissions added.

### 4.3 Network Endpoints
None (Tauri-only, no server).

### 4.4 Filesystem/Process Access
- CLI execution only, local file reads for proofs and inventory.

## 5. Risks

### 5.1 Security
| Risk | Severity | Mitigation | Residual |
|------|----------|------------|----------|
| Command misuse | Medium | Contract validation + guard | Low |

### 5.2 Privacy
No personal data processed.

### 5.3 Supply-chain
No new dependencies.

### 5.4 UX
No UI impact.

## 6. Acceptance Criteria

### 6.1 Tests
- Contract test: scripts/dev/dev-bridge-contract-test.mjs
- Guard: scripts/guard/guard-dev-bridge.mjs

### 6.2 Gates
- Local-first: PASS
- Tauri-only: PASS
- Structured output: PASS

### 6.3 Documentation
- docs/capabilities/TITANE_DEV_BRIDGE.md
- docs/contracts/dev-bridge.contract.schema.json
- runtime/dev/reports/DEV_BRIDGE_INVENTORY.md
- runtime/dev/proofs/DEV_BRIDGE_PROOF_PACK.md
- runtime/dev/reports/DEV_BRIDGE_FINAL_VERDICT.md

## 7. Rollback Plan

- Remove dev bridge scripts and docs listed in the verdict file.
- Remove package.json scripts for titane:dev, guard:dev-bridge, test:dev-bridge:contract.

## 8. Proofs

- Guard: pnpm run guard:dev-bridge
- Contract: pnpm run test:dev-bridge:contract
- Canonical entry: pnpm run titane:dev -- ask --json

## 9. Observability

All outputs are JSON and include ok/error for deterministic automation.
