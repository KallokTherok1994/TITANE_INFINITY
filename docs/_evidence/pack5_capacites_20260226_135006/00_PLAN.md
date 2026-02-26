# 00_PLAN.md

Date (UTC): 2026-02-26

## Plan d’exécution Pack 5 (ordre immuable)
1. Précheck constitutionnel et preuve Packs 0–4.
2. Gel de portée Pack 5 (surfaces autorisées/interdites + flags).
3. Implémentation 5A (search explicite CREDENTIALS_MISSING + failures DB).
4. Implémentation 5B (sources/citations + simulation 429 test-only).
5. Implémentation 5C (snapshots FR canoniques + IDs internes recall).
6. Validation 5D (TraceFrame réel backend -> panel debug UI).
7. Évaluation 5E (vector LTM optionnel, OFF par défaut).
8. Campagnes de preuves x3, simulations d’échec, perf, auto-audit.
9. Verdict unique.

## Stop-the-line appliqué
- Tout écart d’invariant entraîne `BLOCKED`.
- Aucun fallback silencieux autorisé.
