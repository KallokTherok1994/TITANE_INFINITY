# 01 Scope

## In Scope

- Execute token-gated production deploy through `./TITANE_INFINITY deploy`.
- Capture raw evidence for deploy output, artifacts, runtime probe, and mandatory governance gates.
- Produce closure files required by governed workflow (`VERDICT.md`, `ROLLBACK.md`).

## Out of Scope

- Any source-code refactor unrelated to production deploy execution.
- Git push, merge, release tagging, or remote publication.
- Rewriting prior proof packs (append-only discipline).

## Inputs

- Commit: `5b164aa87c900c5141246ff24f99d9023adcd87d`
- Tokens used:
  - `GO_FOR_PROD_BUILD__TITANE_INFINITY`
  - `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`
- Canonical wrapper: `TITANE_INFINITY`
