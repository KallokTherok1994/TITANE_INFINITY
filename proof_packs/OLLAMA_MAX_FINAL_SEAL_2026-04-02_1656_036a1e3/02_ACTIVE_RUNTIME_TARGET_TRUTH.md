# 02_ACTIVE_RUNTIME_TARGET_TRUTH

## Target lance / verifie
- Runtime cible: local desktop/dev path
  - `runtime/dev/run-dev.sh`
  - `scripts/smoke/smoke-runtime-chat.sh`
- Backend Ollama local cible: `http://127.0.0.1:11434`

## Verites capturees
- CWD + racine repo + shell actif: `raw/active_target_truth.txt`
- Presence scripts runtime cibles: `raw/active_target_truth.txt`
- Disponibilite endpoint Ollama + models installes: `raw/active_target_truth.txt`
- Etat memoire Ollama (contexte et keep_alive): `raw/ollama_ps.txt`

## Contraintes observees
- Execution smoke desktop via terminal integre: processus enfants orphelins detectes (non deterministes pour cloture x3).
- Cette derive est classee environnement d'execution, pas PASS produit.

## Statut
- Verification cible active: `PASS`
- Stabilité execution x3 desktop via terminal integre: `BLOCKED`
