# 08_CLEANUP_PLAN

## Niveau 1 — Quick Wins (<= 30 min)
1. Bloquer explicitement tout `globalThis['fetch']` hors porte canonique.
2. Marquer scripts dupliqués avec bannière de dépréciation + cible canonique.
3. Ajouter inventaire machine-lisible des commandes Tauri exportées.

## Niveau 2 — Safe Cleanup (<= 1 jour)
1. Migrer `parlerTTSBridge`, `ollamaTransport`, `glm46v` vers porte réseau backend unique.
2. Isoler/retirer `src/config/offline-first.ts` si non conforme à doctrine online-first gouvernée.
3. Rationaliser scripts build/test/deploy (1 autorité par fonction).
4. Mettre en archive les scripts non canoniques.

## Niveau 3 — Deep Cleanup (qualifié + gates)
1. Refactor commandes Tauri pour réduire surface publique.
2. Générer une cartographie ring-to-ring automatisée et bloquer imports interdits en CI.
3. Réduire workflows CI à un set gouverné minimal.

## Priorités
- P0: conformité réseau UI
- P1: unicité porte réseau backend
- P2: réduction dette scripts/docs legacy

## Risques
- Régression fonctionnelle si migration réseau non testée en profondeur.
- Impact CI si suppression script/workflow non cartographiée.
