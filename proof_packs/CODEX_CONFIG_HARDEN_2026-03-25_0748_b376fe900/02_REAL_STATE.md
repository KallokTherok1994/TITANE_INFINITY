# État réel

## Repo

- `.github/copilot-instructions.md` existe et sert déjà de kernel gouverné
- `.github/instructions/titane.instructions.md` existe et reste scoped
- `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md` existent
- `AGENTS.md` racine était absent
- des validateurs existent déjà pour la dérive d'instructions:
  - `scripts/verify/verify-copilot-instructions.sh`
  - `scripts/verify/verify_instruction_layers.sh`
  - `scripts/verify/verify_no_doctrine_duplication.sh`
  - `scripts/verify/verify_status_vocabulary.sh`
  - `scripts/verify/verify_agents_index.sh`
  - `scripts/verify/verify_local_markers_consistency.sh`
  - `scripts/verify/verify_kernel_budget.sh`

## Local Codex

- `~/.codex/config.toml` existait mais ne contenait que:

```toml
model = "gpt-5.4"
model_reasoning_effort = "medium"

[features]
multi_agent = true
```

- aucun profil explicite
- aucune politique de sandbox
- aucune politique réseau
- aucune doctrine locale référencée
- la CLI `codex` est absente, donc pas de validation runtime directe possible
