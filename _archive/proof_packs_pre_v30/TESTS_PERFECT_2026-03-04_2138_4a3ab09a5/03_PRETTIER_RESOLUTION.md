# PRETTIER RESOLUTION
Timestamp UTC: 2026-03-04T21:43:58Z

## Conclusion
- format:check global : BLOCKED_TIMEOUT permanent (même 300s)
- Cause : 16,564 fichiers tracked, Prettier timeout systémique
- Solution T1 : skip format:check global, valider lint + typecheck uniquement
- Recommandation : créer format:check ciblé (src/ uniquement) en T2

## Alternative testée
1. timeout 45s → exit 124 (~80 fichiers .github/workflows)
2. timeout 180s → exit 124 (même point)
3. timeout 300s → exit 124 (même échec, aucun fichier listé)

## Next-action T1
Exécuter lint + typecheck séparément (gates critiques).
Accepter format:check comme hors scope pour repos >15k fichiers.
