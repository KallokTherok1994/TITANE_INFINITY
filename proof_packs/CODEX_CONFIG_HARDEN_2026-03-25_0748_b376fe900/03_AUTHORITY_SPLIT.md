# Split d'autorité

## REPO_LOCAL_RULE

- invariants TITANE visibles dans le repo:
  - Tauri-only
  - 4-Ring
  - One Door network
  - minimal patch
  - no fake state
  - proof-first
- commandes canoniques repo
- conventions de preuve/rollback liées au repo
- contexte durable transmis avec le repo

## LOCAL_CODEX_RULE

- `profile` par défaut
- `approval_policy`
- `sandbox_mode`
- posture réseau par défaut
- profils `audit/patch/certify/research`
- doctrine d'exécution lourde non spécifique au repo

## SHARED_REFERENCE_ONLY

- `README.md`
- `docs/README.md`
- documentation d'architecture durable
- doctrine explicative longue qui ne doit pas être copiée dans toutes les couches

## VALIDATOR_RULE

- détection de duplication doctrinale
- budget du kernel
- index des agents
- cohérence des marqueurs locaux
- statut vocabulary

## Décision

- kernel Copilot conservé comme autorité repo haute
- `AGENTS.md` racine ajouté comme contexte repo court
- doctrine lourde déplacée vers `~/.codex/TITANE_CODEX_RULES.md`
- posture locale imposée via `~/.codex/config.toml`
