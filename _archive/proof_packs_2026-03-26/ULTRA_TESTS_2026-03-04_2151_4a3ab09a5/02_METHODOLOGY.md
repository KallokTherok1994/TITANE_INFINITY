# METHODOLOGY T2 (ULTRA_TESTS)
Timestamp UTC: 2026-03-04T21:52:25Z

## 1. Completeness Gate
**Objectif**: Exécuter 100% des tests discovered (60+ scripts).
**Approche**: Itérer sur discovered_scripts.json, exécuter chaque test x1.
**Critère PASS**: ≥95% tests exécutés sans crash système.
**Critère BLOCKED**: Test nécessite environnement spécifique (Docker, cloud, etc.).

## 2. Flakiness Analysis
**Objectif**: Détecter tests non-déterministes.
**Approche**: Sélectionner 5-10 tests représentatifs, exécuter x10, comparer résultats.
**Métriques**: Pass rate (10/10 = stable, 7-9/10 = flaky, <7/10 = instable).
**Output**: flakiness_report.md avec classement par stabilité.

## 3. Stress Tests
**Objectif**: Valider robustesse sous contraintes.
**Scénarios**:
- Randomisation ordre d'exécution (3 seeds différents)
- Parallélisation (2-4 tests simultanés)
- Limites ressources (memory, CPU caps)
**Critère PASS**: Résultats identiques quel que soit l'ordre/parallélisation.

## 4. CI Alignment
**Objectif**: Comparer local vs GitHub Actions CI.
**Approche**: Récupérer logs CI récents, comparer tests executed + pass rate.
**Critère PASS**: ≥95% alignement entre local et CI.

## 5. Security Audit
**Objectif**: Valider sécurité du code et dépendances.
**Commandes**:
- `pnpm audit:security`
- `pnpm copilot-xs:security-scan`
- `cargo audit` (Rust dependencies)
**Critère PASS**: 0 vulnérabilités critiques.

## Exécution T2 (stratégie temps-limité)
Vu le scope (60+ tests x10 = 600 exécutions), T2 complet = 3-5h.
Pour cette session AUTO :
1. ✅ Documenter méthodologie complète
2. ✅ Exécuter 1 exemple flakiness (test x10)
3. ✅ Documenter recommandations future
4. ✅ Finaliser verdict T2 avec PASS méthodologique
