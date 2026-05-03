# 05 — VISION 360 ACTIVE MAP

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Surfaces détectées actives

| Surface | Route hash | Etat | Preuve |
|---------|-----------|------|--------|
| TITANE (principal) | `#/titane` | **ACTIF** | screenshots S1, S2, S5 |
| TIME | `#/time` | **ACTIF** (navigué) | run2 S2 — URL confirmée |
| STATS | `#/stats` | **ACTIF** (navigué) | run2 S2 screenshot |
| ADMIN | `#/admin` | **ACTIF** (navigué) | run2 S4 — `secondarySurfaceOpened=true` |
| DEV | détecté dans nav | Présent (non navigué) | S2 navItems |
| Plus | détecté dans nav | Présent (non navigué) | S2 navItems[5] |

## Eléments UI visibles à l'état initial

| Elément | Présent | Note |
|---------|---------|------|
| Barre de navigation | OUI | 6 items: TITANE, TIME, STATS, ADMIN, DEV, Plus |
| Titre page | OUI | "TITANE∞ v26.3.0 - Cognitive Operating System" |
| React root | OUI | `rootChildren: 3` |
| Splash | NON | `splashVisible: false` ← boot complet |
| Chat input (initial) | NON (hors vue) | visible après navigation `/titane` |
| Chat input (après nav) | OUI | `inputPresent: true` après hash nav |
| Send button | OUI | trouvé mais `sendEnabledAfterTyping: false` |
| Boutons total | 104 | `buttonCount: 104` (health S5) |
| Stylesheets | 9 | `stylesheetCount: 9` |

## Composants manquants (frictions)

| Composant | Etat | Impact |
|-----------|------|--------|
| Reasoning Progress | ABSENT (sélecteurs non matchés) | Friction — UX dégradée |
| Chat IA activé | ABSENT (route non activée) | Friction — nécessite route chat explicite |
| Provider indicators DOM | Non instrumentés | Observabilité limitée |

## Reflow / Layout

| Signal | Valeur |
|--------|--------|
| `potentialDoubleScroll` | true (3 scroll containers) |
| `reflowReasonable` | true (pas de reflow critique) |
| `blockingOverlays` | 0 |
| `zoom` | 2 (devicePixelRatio HiDPI) |
| Overlays bloquants | 0 |

## Vision 360 — Résumé

6 surfaces navigation découvertes et cartographiées. 4 surfaces réellement naviguées et confirmées actives. Chat UI visible après navigation mais send button non activé par saisie JS. Pas de blockers structurels.

**PASS partiel — surfaces actives confirmées, chat input visible mais send disabled.**
