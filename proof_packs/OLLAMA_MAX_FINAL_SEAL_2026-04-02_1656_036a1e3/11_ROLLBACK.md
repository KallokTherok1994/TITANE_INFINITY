# 11_ROLLBACK

## Strategie
Session de recertification sans patch code.
Rollback operationnel = nettoyage des processus + suppression proof pack si necessaire.

## Commandes rollback
1. Stop runtime/processus potentiellement orphelins:
   - `pkill -f "smoke-runtime-chat.sh" || true`
   - `pkill -f "run-dev.sh" || true`
   - `pkill -f "tauri dev --config runtime/dev/tauri.conf.json" || true`
   - `pkill -f "api/generate" || true`
2. Nettoyage runtime local:
   - `./runtime/dev/cleanup.sh || true`
3. Revenir a l'etat git precedent (si besoin d'annuler uniquement le pack):
   - `git restore --staged proof_packs/OLLAMA_MAX_FINAL_SEAL_2026-04-02_1656_036a1e3 || true`
   - `git clean -fd proof_packs/OLLAMA_MAX_FINAL_SEAL_2026-04-02_1656_036a1e3 || true`

## Risque rollback
- Faible: aucune mutation de code source produit dans cette session.
