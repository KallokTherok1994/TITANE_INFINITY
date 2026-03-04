# 03_DIAGNOSTIC

## Priorité structurante choisie

**PS-01: Cohérence de vérité de build (token ↔ type de build ↔ gate)**

Raison: les packs précédents mélangeaient parfois build-safe et statut `G_BUILD_X3`. Cette incohérence empêche un verdict unique fiable.

## Diagnostic racine

1. `cargo test` échouait sur doctests conversation_os (assertions/imports docs), stoppant la boucle x3.
2. Règle build non unifiée historiquement (PASS attribué parfois sur substitute build-safe).
3. Le mode `full` sous `mock` révèle des collisions de commandes Tauri (tentative rollbackée, hors scope runtime par défaut).

## Décision corrective

- Maintenir runtime stable (rollback immédiat des changements de feature-gating risqués).
- Corriger seulement la racine bloquante des tests (`doctests`) + robustesse ciblée chat engine.
- Exécuter build réel x3 puisque token présent dans ce run.

