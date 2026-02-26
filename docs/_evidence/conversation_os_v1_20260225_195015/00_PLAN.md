# 00_PLAN.md

## Objectif
Mettre en place et prouver Conversation OS v1 en mode preuve stricte: discovery -> scope freeze -> validation implémentation -> campagnes x3 -> verdict.

## Séquence exécutée
1. Discovery complet (A/B/C) capturé dans `09_PROOF_LOGS.txt`.
2. Scope freeze défini (surface autorisée minimale + surfaces interdites).
3. Validation de l’implémentation existante (Types/Engines/Services/Orchestrator/UI debug).
4. Exécution d’une campagne homogène G1..G10 en x3 (`reports/conversation_os_unified_g1_g10_x3_campaign_v2.log`).
5. Consolidation des preuves et verdict.

## Stop-the-line appliqué
- Si violation d’invariant absolu détectée en discovery, verdict non-PASS.
- Aucun déploiement PROD sans tokens exacts.

## Résultat attendu de ce pack
- État réel documenté (pas de supposition).
- Gates reportés avec preuves.
- Rollback explicite.
