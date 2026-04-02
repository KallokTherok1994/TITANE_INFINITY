# LABS — modules/avatar

**Status**: LABS
**Date**: 2026-03-26
**Scope**: 3D avatar, three.js, voice reaction, gesture, PBR materials

## Raison

Ce module dépend de three.js (~38MB) chargé en lazy via ThreeJSLazyLoader.
Module avatar non dans le flux chat/OMEGA principal.

## Promotion

Conditions pour passer en Core:

1. Proof runtime: avatar activé et utilisé dans la chaîne principale
2. Bundle: three.js tree-shaken < 5MB dans le chemin critique
3. Tests: scénario avatar E2E validé en build prod

## Référence

Voir: docs/architecture/DEPENDENCY_DECISION_MATRIX.md (three.js = LABS_ONLY)
