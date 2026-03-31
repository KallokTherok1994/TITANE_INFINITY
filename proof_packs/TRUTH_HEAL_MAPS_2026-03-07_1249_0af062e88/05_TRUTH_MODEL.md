Status: PASS

Truth model by artifact family:

Instructions family:
- Expected purpose: enforce constitutional behavior and scoped constraints.
- Canonical files: `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`.
- Missing: none for scoped set.
- Stale: archived instruction narratives outside canonical set.
- Proof level: PROVEN_RUNTIME (via `verify_instructions.sh` PASS).

Maps family:
- Expected purpose: describe current architecture/governance surfaces.
- Canonical files: active docs maps + this pack `11_MAPPING_REGEN.md`.
- Missing: no blocker for scoped governance map.
- Stale: historical map claims in old packs.
- Proof level: PROVEN_DISCOVERY.

Mermaid family:
- Expected purpose: provide governance flow + architecture diagrams without second truth.
- Canonical files: `.github/copilot-workflow.mermaid`, `docs/diagrams/sources/*.mmd`.
- Missing: none in active canon.
- Stale: old embedded mermaid snippets in archived packs.
- Proof level: PROVEN_RUNTIME (`verify-mermaid-diagrams`, `mermaid-status-report --check`).

Registry family:
- Expected purpose: append-only traceability of fixes/events.
- Canonical files: `scripts/autoheal/autoheal_rules.jsonl`, `registry/*.jsonl`.
- Missing: none.
- Stale: latest entry mismatch before patchset 2 (resolved).
- Proof level: PROVEN_RUNTIME (`check_autofix_autoheal_registry.mjs`, recurrence guard PASS).

Validators family:
- Expected purpose: prove gates and stopline discipline.
- Canonical files: recurrence + instructions + registry + mermaid validators above.
- Missing: none for scoped gates.
- Proof level: PROVEN_RUNTIME.

Verdict family:
- Expected purpose: single coherent governed verdict.
- Canonical files: this pack `16_FINAL_VERDICT.md`, `VERDICT.md`.
- Missing: none.
- Proof level: PROVEN_DOC + PROVEN_RUNTIME linkage.
