# 04_DOC_CHANGES — DOCS ALIGNMENT FINAL

## Audit résumé

Total fichiers markdown dans docs/ : 3863
Hits "legacy/offline/should/TBD" (non-archive) : ~9057 lignes (majoritairement archive et docs techniques historiques)

## Règles appliquées

1. **Archive/HISTORY** : tous les docs sous `docs/archive/`, `docs/99_ARCHIVE/`, `docs/backup_*` → NE PAS MODIFIER, marqués HISTORY par leur localisation.

2. **Docs actifs** : aucune promesse non prouvée dans les docs actifs (hors archive) n'a été identifiée comme P0 pour ce cycle.

3. **README.md** : section "Truth & Proof" ajoutée (Phase 3) → référence les preuves disponibles.

4. **docs/TERMINOLOGY_ALIGNMENT_FINAL.md** : créé (Phase 5) → définit les termes canoniques.

## Findings docs actifs — contexte

| Doc | Finding | Décision |
|-----|---------|---------|
| `docs/STATUS_REPO_V27.md:90` | "local-first" dans contexte sécurité réseau (serveur dev sur 127.0.0.1) | ACCEPTABLE — contexte technique correct |
| `docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md` | "local-first" = référence governance historique | ACCEPTABLE |
| `docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md` | Mode offline = feature documentée pour usage sans réseau | ACCEPTABLE — feature réelle, prouvée |
| `docs/PROVIDER_ORCHESTRATION_CONTRACT.md:47-48` | "FORCE_LOCAL_PROVIDER is not offline" | ACCEPTABLE — sémantique claire |
| `docs/CAPABILITIES_REGISTRY.md:356` | "Mode dégradé local-first" | ACCEPTABLE — mode dégradé = fallback Ollama |
| `docs/ai/CHAT_PROVIDER_ROUTING.md` | Status "offline" pour provider unavailable | ACCEPTABLE — état technique |

## Status: ZÉRO doc actif avec promesse non prouvée identifiée comme P0/P1.
