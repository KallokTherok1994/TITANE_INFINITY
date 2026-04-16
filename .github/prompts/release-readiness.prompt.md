# Prompt: Release Readiness

> **Agent**: invoke `release-proof` specialist agent for this session.

## Scope

Assess release readiness without performing unauthorized PROD actions.

## Inputs

- Version files
- CI status
- Artifact hashes and sizes

## Steps

1. Verify version synchronization.
2. Verify mandatory gates and status checks.
3. Confirm no token gate is required — production builds run on demand (Rule 11).
4. Produce GO/NO-GO with evidence only.

## Output

- Readiness verdict.
- Blocking issues.
- Next action <= 30 minutes.
