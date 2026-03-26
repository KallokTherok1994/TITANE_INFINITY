# Rollback

## Repo

```bash
git restore -- AGENTS.md
```

## Local Codex

```bash
cat > ~/.codex/config.toml <<'EOF'
model = "gpt-5.4"
model_reasoning_effort = "medium"

[features]
multi_agent = true
EOF

rm -f ~/.codex/TITANE_CODEX_RULES.md
```

## Portée du rollback

- restaure l'état minimal antérieur de la config locale
- retire le contexte repo racine ajouté dans cette session
