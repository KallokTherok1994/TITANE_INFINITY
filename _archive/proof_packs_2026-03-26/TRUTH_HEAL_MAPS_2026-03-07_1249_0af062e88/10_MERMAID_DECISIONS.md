Status: PASS

Mermaid surface classification:
- ACTIVE_CANON: `.github/copilot-workflow.mermaid`, `docs/diagrams/sources/*.mmd`, `docs/ui/IA_FLOW.mmd`.
- SUPPORTING: scripts in `scripts/verify/*mermaid*`.
- ARCHIVED: mermaid snippets embedded in old proof packs/docs archives.
- STALE: historical mermaid claims not tied to active validators.

Decision:
- Action: NORMALIZE_STATUS (no regeneration).
- Justification: mermaid gates are already green (`verify-mermaid-diagrams`, `mermaid-status-report --check`).
- Anti-drift: keep canon references explicit in maps; do not create second source.

Result:
- Mermaid files unchanged.
- Governance coherence preserved.
