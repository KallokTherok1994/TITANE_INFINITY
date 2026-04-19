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
2. Verify version synchronization.
3. Verify mandatory gates and status checks.
4. Confirm no token gate is required — production builds run on demand (Rule 11).
5. Produce GO/NO-GO with evidence only.

## Output

- Readiness verdict.
- Blocking issues.
- Next action <= 30 minutes.
