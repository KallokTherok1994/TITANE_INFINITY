# ROLLBACK PLAN — OMEGA AI VERIF FIX

## Fichiers modifiés

| Fichier | Type de changement | Rollback |
|---|---|---|
| `e2e/desktop/ai-verification.full.e2e.js` | Fix harnais E2E (getResponseSnapshot + count detection) | `git restore` |
| `scripts/autoheal/autoheal_rules.jsonl` | Ajout règle AH-E2E-AI-VERIF-009 | `git restore` |

## Commandes rollback

```bash
# Rollback immédiat (réversion complète)
git restore -- e2e/desktop/ai-verification.full.e2e.js
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Vérification post-rollback
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```

## Impact rollback

- **e2e/desktop/ai-verification.full.e2e.js** : Le bug de boucle infinie revient (sendPrompt peut boucler si le modèle Ollama retourne un texte identique). Aucun impact sur le code produit Tauri/React/Rust.
- **scripts/autoheal/autoheal_rules.jsonl** : La règle AH-E2E-AI-VERIF-009 est supprimée. Les scripts detect_recurrence.sh et verify_instructions.sh continuent de fonctionner (entries=317 au lieu de 318).

## Conditions déclenchant le rollback

- Si le fix introduit une régression dans un test E2E non identifiée
- Si `detect_recurrence.sh` retourne FAIL après le rollback

## Note de sécurité

Ces modifications ne touchent PAS le code produit (Rust, React, IPC, Tauri capabilities).
Le risque est strictement limité au harnais de test automatisé.
