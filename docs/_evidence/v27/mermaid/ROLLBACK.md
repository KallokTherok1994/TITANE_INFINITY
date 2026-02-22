# ROLLBACK — MERMAID_DOC_GUARDS_V1

## Commit rollback (après commit)

- git revert HEAD

## Workspace rollback (avant commit)

- git restore -- package.json
- git restore --staged package.json
- git clean -fd docs/diagrams docs/standards scripts/verify docs/_evidence/v27/mermaid
