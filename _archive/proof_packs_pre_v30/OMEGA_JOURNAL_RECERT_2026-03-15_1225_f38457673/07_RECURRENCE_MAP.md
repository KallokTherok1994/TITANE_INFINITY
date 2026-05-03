# 07_RECURRENCE_MAP

## Analyse de récidive sur tous les défauts traités

| ID | Défaut | Session #1 PASS ? | Recertification : rechute ? | Root cause rechute | Anti-récidive actif |
|----|--------|-------------------|-----------------------------|-------------------|---------------------|
| B1 | Durée undefined post-load | ✅ PASS | ✗ Pas de rechute | — | AH-2026-03-15-OMEGA-JOURNAL-001 |
| B2 | Fichier Système oj-non-capture inconditionnelle | ✅ PASS | ✗ Pas de rechute | — | AH-2026-03-15-OMEGA-JOURNAL-002 |
| B3 | Score qualité null | ✅ PASS | ✗ Pas de rechute | — | AH-2026-03-15-OMEGA-JOURNAL-003 |
| B4 | XP hardcodé (essentiel + expert sections) | ✅ PASS | ✗ Pas de rechute | — | AH-2026-03-15-OMEGA-JOURNAL-004 |
| B4b | XP hardcodé (runtime grid) | ❌ PASS PARTIEL (section manquée) | ✅ Résiduel détecté | Pattern appliqué 2/3 sections | AH-2026-03-15-OMEGA-JOURNAL-006 |
| B5 | Scroll .oj-journal-body | ✅ PASS | ✗ Pas de rechute | — | AH-2026-03-15-OMEGA-JOURNAL-005 |
| B6 | AutoHeal règles absentes | ✅ PASS (worktree) | ✅ Delta index/worktree détecté | git add prématuré | git add corrigé |

## Conclusion rechute

- 1 rechute détectée : B4b (XP runtime grid) — `RECURRENCE_AFTER_FIX` (défaut dans la portée du fix initial, mais section non couverte)
- Toutes les autres : `PASS` stable
- Aucune rechute sur `Durée`, `Fichier Système`, `Score qualité`, ni `Scroll`

## Guard anti-récidive global

`detect_recurrence.sh` → G_AH_RECURRENCE_GUARD_PASS entries=284 → **ACTIF**
