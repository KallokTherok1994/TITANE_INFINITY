# 08 — INTUITION GAP ANALYSIS

## Axes d'intuition réels (implémentés)
| Axe | Statut | Preuve |
|-----|--------|--------|
| Restore transparent au démarrage | PRESENT | useEffect backend-restore |
| Fallback explicite si données absentes | PRESENT | retour [] + log::info! |
| Déduplication silencieuse | PRESENT | dedup guard PATCH-B |
| Redécouverte conversations SQLite | PRESENT | list_restorable_conversations |
| Online/offline mode adaptation | PRESENT | isE2EChatMockEnabled + providers |

## Fausses intuitions interdites
- Aucun badge "mémoire active" sans LTM=true vérifié
- Aucun restore affiché "complet" sans vérification count
- Aucune continuité simulée si conversation_id absent

## NO_FAKE_INTUITION_GUARD
- log::info! systématique sur restore (vide ou non)
- dedup guard empêche l'illusion de continuité dupliquée
- retour [] honnête sur tout échec
