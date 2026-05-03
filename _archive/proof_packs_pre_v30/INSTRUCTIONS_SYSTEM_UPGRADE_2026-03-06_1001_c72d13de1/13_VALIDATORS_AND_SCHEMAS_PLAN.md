# 13_VALIDATORS_AND_SCHEMAS_PLAN

## Discover existing validators (constates)
- present: `scripts/verify_instructions.sh`
- present: `scripts/autoheal/detect_recurrence.sh`
- present: `scripts/map_refresh.sh`
- present: `scripts/verify/verify-copilot-instructions.sh`
- present: family `scripts/verify/*.sh` (tauri/network/mermaid/registry/etc.)

## Missing validators a creer
- `scripts/verify/verify_instruction_layers.sh`
  - check: respect precedence L1->L6 et absence redefinition lower layer

- `scripts/verify/verify_no_doctrine_duplication.sh`
  - check: regles canoniques non dupliquees hors references

- `scripts/verify/verify_status_vocabulary.sh`
  - check: seuls status autorises utilises (`PASS/FAIL/BLOCKED/BLOCKED_APPROVAL/DONE/SEALED` ou set defini)

- `scripts/verify/verify_agents_index.sh`
  - check: coherence entre routing, agents reels, agents deprecies

- `scripts/verify/verify_prompt_files_index.sh`
  - check: presence et index des prompts requis

- `scripts/verify/verify_local_markers_consistency.sh`
  - check: usage coherent du marker Local-first vs doctrine online-first

- `scripts/verify/verify_kernel_budget.sh`
  - check: kernel <= budget (regles/sections/lignes)

## Governance files machine-readable a creer
- `governance/statuses.yaml`
  - enums statuts et transitions autorisees

- `governance/layer_priority.yaml`
  - ordre de precedence des couches + conflict policy

- `governance/proof_pack.schema.json`
  - schema de structure proof-pack et fichiers obligatoires

- `governance/allowed_rule_homes.yaml`
  - regle -> home canonique unique

## Rule mechanization mapping
- binary + repeated + checkable => move to validator
- exemples cibles:
  - prod tokens exacts
  - status vocabulary
  - no direct UI network
  - one active execution authority
  - mandatory files proof pack

## Etat execution de ce run
- validators existants executes: PASS (`verify_instructions`, `detect_recurrence`, `map_refresh`, `verify-copilot-instructions`)
- validators proposes: design ready, implementation pending
