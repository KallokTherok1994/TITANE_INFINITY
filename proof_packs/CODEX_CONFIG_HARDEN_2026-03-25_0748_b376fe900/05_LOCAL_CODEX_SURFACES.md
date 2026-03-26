# Surfaces Codex locales

## Fichiers découverts

- `~/.codex/config.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/auth.json`
- autres bases/logs Codex locales

## Fichiers créés ou mis à jour

- `/home/titane-os/.codex/config.toml`
- `/home/titane-os/.codex/TITANE_CODEX_RULES.md`

## Contenu final utile

```toml
profile = "audit"
model = "gpt-5.4"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "read-only"
model_instructions_file = "/home/titane-os/.codex/TITANE_CODEX_RULES.md"

[features]
multi_agent = true

[sandbox_read_only]
network_access = false

[sandbox_workspace_write]
network_access = false

[profiles.audit]
approval_policy = "on-request"
sandbox_mode = "read-only"
model_reasoning_effort = "high"

[profiles.patch]
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "medium"

[profiles.certify]
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "high"

[profiles.research]
approval_policy = "on-request"
sandbox_mode = "workspace-write"
model_reasoning_effort = "medium"
```

## Réserve

- syntaxe TOML prouvée
- présence du fichier de doctrine prouvée
- consommation par la CLI `codex` non prouvée ici car binaire absent
