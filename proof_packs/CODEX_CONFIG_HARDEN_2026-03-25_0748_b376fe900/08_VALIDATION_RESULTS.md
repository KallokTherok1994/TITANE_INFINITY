# Résultats de validation

## Commandes verbatim

```text
python3 - <<'PY'
import tomllib, pathlib
p = pathlib.Path.home()/'.codex'/'config.toml'
with p.open('rb') as f:
    data = tomllib.load(f)
print('TOML_PARSE_PASS')
print(data.get('profile'))
print(sorted(data.get('profiles', {}).keys()))
print(data.get('sandbox_read_only', {}).get('network_access'))
print(data.get('sandbox_workspace_write', {}).get('network_access'))
print(pathlib.Path(data.get('model_instructions_file')).is_file())
PY

wc -l AGENTS.md .github/copilot-instructions.md ~/.codex/TITANE_CODEX_RULES.md
bash scripts/verify/verify-copilot-instructions.sh
bash scripts/verify/verify_instruction_layers.sh
bash scripts/verify/verify_no_doctrine_duplication.sh
bash scripts/verify/verify_status_vocabulary.sh
bash scripts/verify/verify_agents_index.sh
bash scripts/verify/verify_local_markers_consistency.sh
bash scripts/verify/verify_kernel_budget.sh
```

## Sorties clés

```text
TOML_PARSE_PASS
audit
['audit', 'certify', 'patch', 'research']
False
False
True
```

```text
bash scripts/verify/verify-copilot-instructions.sh -> PASS
bash scripts/verify/verify_instruction_layers.sh -> PASS
bash scripts/verify/verify_no_doctrine_duplication.sh -> PASS
bash scripts/verify/verify_status_vocabulary.sh -> PASS
bash scripts/verify/verify_agents_index.sh -> PASS
bash scripts/verify/verify_local_markers_consistency.sh -> PASS
bash scripts/verify/verify_kernel_budget.sh -> PASS
```

## Limite

- `codex --version` échoue car la CLI n'est pas installée
- donc la validation est forte sur les fichiers et le repo, mais qualifiée sur l'exécution locale Codex
