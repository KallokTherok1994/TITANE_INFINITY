# TITANE_INFINITY Session Modes

## PLAN

- Purpose: Discovery, design, and architecture planning only.
- Allowed actions: reading docs, inspecting repo state, drafting proposals.
- Forbidden actions: source mutations, new feature claims, build/package operations.
- Required proofs: none beyond discovery outputs.
- Rollback expectation: no changes or immediate revert.
- Final verdict vocabulary: `BLOCKED`, `UNKNOWN`, `BLOCKED_DOCTRINE`.

## EXPLORATION

- Purpose: rapid experimentation and local prototyping without durable commitments.
- Allowed actions: transient code changes, lightweight tests, local proof collection.
- Forbidden actions: durable release claims, final artifact truth assertions, production version bumps.
- Required proofs: local syntax/tests for the experiment, but not full durable gates.
- Rollback expectation: code may be discarded unless explicitly promoted.
- Final verdict vocabulary: `PARTIAL`, `BLOCKED_ENV`, `UNKNOWN`.

## DURABLE

- Purpose: production-grade changes with full governance, mapping, and test coverage.
- Allowed actions: targeted source fixes, validator-backed doctrine updates, package script additions.
- Forbidden actions: silent bypasses, incomplete proof claims, unmanaged cross-layer conflicts.
- Required proofs: local validators, instruction checks, AutoHeal recurrence, targeted tests.
- Rollback expectation: explicit restore commands for touched files.
- Final verdict vocabulary: `PASS`, `FAIL`, `BLOCKED`, `BLOCKED_DOCTRINE`.

## RELEASE

- Purpose: packaging, artifact proof, and published runtime truth.
- Allowed actions: build/package commands, artifact verification, release metadata updates.
- Forbidden actions: claiming release readiness without actual artifacts and local proof.
- Required proofs: build truth gate, stable artifact freshness gate, version truth gate, release artifact metadata.
- Rollback expectation: restore release-related files and packaging state if artifact proof fails.
- Final verdict vocabulary: `PASS`, `FAIL`, `BLOCKED_ENV`.
