# LABS — features/vision

**Status**: LABS
**Date**: 2026-03-26
**Scope**: Vision ML, object detection, camera integration

## Raison

Ce module dépend de runtimes ML optionnels (ONNX/ort, vision models) non chargés par défaut.
Pas de proof runtime suffisant en production v28.88.0.

## Promotion

Conditions pour passer en Core:
1. Proof runtime: usage mesuré par ≥10% des sessions actives
2. Dépendances optionnelles: ort/ONNX stable et géré via feature flag
3. Tests E2E: scénario vision validé en build prod

## Référence

Voir: docs/architecture/CENTERS_AUDIT.md, docs/architecture/TARGET_REPO_SHAPE.md
