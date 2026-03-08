Status: PASS

Regenerated mapping families (scoped):

CANONICAL_SOURCE_MAP:
- Source: `raw/canon_*_list.txt`.
- Method: bounded filesystem discovery + canonical layer selection.
- Confidence: HIGH.

GOVERNANCE_ARTIFACT_MAP:
- Source: `raw/scan_governance_file_tree.txt` + canonical lists.
- Method: inventory classification by category.
- Confidence: MEDIUM (legacy density is high).

MERMAID_STATUS_MAP:
- Source: mermaid source list + validator outputs.
- Method: classify ACTIVE_CANON/SUPPORTING/ARCHIVED.
- Confidence: HIGH.

AUTOHEAL_RULE_MAP:
- Source: `scripts/autoheal/autoheal_rules.jsonl` + `registry/autofix-autoheal-rules.jsonl` tails and validator output.
- Method: latest-entry coverage check + append-only trace.
- Confidence: HIGH.

VALIDATOR_MAP:
- Source: `raw/canon_validator_list.txt`.
- Method: grouped by `verify/gates/checks` families.
- Confidence: HIGH.

PROOF_PACK_INDEX:
- Source: `raw/surface_proof_packs.txt`.
- Method: file existence inventory; no historical rewrite.
- Confidence: MEDIUM.

Unknown/stale markers:
- Historical map claims under archives are explicitly treated as non-canon for this session.
