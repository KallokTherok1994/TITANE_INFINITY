---
description: Evaluate release readiness (GO/NO-GO) via release-proof specialist agent. No gate token requirement. Evidence-only assessment.
mode: agent
---

# Prompt: Release Readiness

> **Agent**: invoke `release-proof` specialist agent for this session.

## Scope

Assess release readiness without performing unauthorized PROD actions.

## Inputs

- Version files
- CI status
- Artifact hashes and sizes

## Steps

1. If the `release-proof` specialist agent is unavailable, continue immediately with canonical local release evidence checks instead of blocking on the delegation itself; classify the delegation failure as external truth when applicable.
2. If build permission is part of the scope, consume `.github/agents/pre-build-certifier.agent.md`, `.github/prompts/pre-build-certification.prompt.md`, `BUILD_PERMISSION_MATRIX.md`, `DEVTOOLS_CONSOLE.json`, `HTTP_NETWORK.log`, `DEV_TAURI_RUNTIME.log`, `VISIBLE_UI_PROOF.md`, and `RELEASE_SURFACE_PRECHECK.md` before any GO verdict.
3. Verify version synchronization.
4. Verify mandatory gates and status checks.
5. Confirm no gate token is required — production builds run on demand (Rule 11).
6. Produce GO/NO-GO with evidence only.

## Output

- Readiness verdict.
- Blocking issues.
- Next action <= 30 minutes.
