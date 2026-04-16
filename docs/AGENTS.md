# Local AGENTS - docs

## Authority
Documentation and proof artifact local discipline.

## Rules
- Append-only evidence handling where required (proof_packs/, reports/).
- Keep claims tied to executable evidence.
- Use explicit rollback commands.
- Auto-update mapping docs on every structural change (Rule 15):
  - `UI_SURFACE_MAP.md` for UI surface changes.
  - `ARCHITECTURE.md` for architecture changes.
  - `OLLAMA_RUNTIME_MAP.md` for Ollama/provider changes.
  - `RELEASE_SURFACE_INVENTORY.md` for version/release changes.
  - `docs/CARTOGRAPHY_COMPLETE.md` for any structural change.
  - `docs/IPC_CATALOG.md` for IPC command changes.
- Any audit or correction involving drift must document the chain of truth across source, packaged artifact, installed runtime, and visible UI/backend behavior; a single-source summary is not sufficient.
- Proof packs that seal an audit must state the recurrent failure modes, the operational prevention rules, and the exact rollback scope alongside the verdict.

## Chain-of-Thought Validation

1. Identify which mapping document(s) are affected by the change.
2. Update the relevant docs in the same commit as the code change.
3. Verify no historical records are destructively modified.
4. Ensure proof pack has VERDICT.md and ROLLBACK.md.
5. Ensure audit claims distinguish clearly between repo truth, packaged truth, and installed/runtime truth.

## Proofs
- Proof-pack completeness checks.
- Gate report references.

## Not in scope
- Runtime implementation policy.
