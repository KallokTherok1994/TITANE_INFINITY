# Critical Scenario (Runtime)

Spec: docs/governance/MEMORY_SEAL_SPEC.md (Section 6)

Harness: scripts/e2e/run-memory-chat-proof-ui.sh -> wdio desktop proof (online-chat-proof-ui)

Improbable facts used (per run):
- run1: ORIONTURNRUN1 / ALICETURNRUN1 / AZURTURNRUN1
- run2: ORIONTURNRUN2 / ALICETURNRUN2 / AZURTURNRUN2
- run3: ORIONTURNRUN3 / ALICETURNRUN3 / AZURTURNRUN3

Sequence (per run):
1) Memorize code
2) Memorize name + color
3) Unrelated question
4) Recall compactly (code/nom/couleur)
5) False-recall guard
