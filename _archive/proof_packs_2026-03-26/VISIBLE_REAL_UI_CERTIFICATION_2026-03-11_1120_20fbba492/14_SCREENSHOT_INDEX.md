# 14 — SCREENSHOT INDEX

Pack: VISIBLE_REAL_UI_CERTIFICATION_2026-03-11_1120_20fbba492
Date: 2026-03-11
Session: V22

---

## Run1 (partiel — 4 screenshots)

| Fichier | Test | Moment | Note |
|---------|------|--------|------|
| `run1_s1_t0_post_boot.png` | V22-S1 | Post-boot initial | Premier screenshot MODE_B |
| `run1_s1_post_nav_titane.png` | V22-S1 | Post navigation `/titane` | Surface principale |
| `run1_s2_before_tab_click.png` | V22-S2 | Avant click tab (crash imminent) | Navigation visible |
| `run1_s2_before_tab1_click.png` | V22-S2 | Zoom sur tab 1 avant click | Détail tab navigation |

Chemin: `artifacts/run1/screens/`

## Run2 (complet — 16 screenshots)

| Fichier | Test | Moment | Note |
|---------|------|--------|------|
| `run2_s1_t0_post_boot.png` | V22-S1 | Post-boot initial | UI réelle visible, pas de splash |
| `run2_s1_post_nav_titane.png` | V22-S1 | Post navigation `/titane` | Surface principale avec nav |
| `run2_s2_start.png` | V22-S2 | Début S2 | État initial S2 |
| `run2_s2_before_hash_nav.png` | V22-S2 | Avant hash nav | URL `tauri://localhost/titane` |
| `run2_s2_after_nav_time.png` | V22-S2 | Après nav `/time` | URL `tauri://localhost/titane#/time` |
| `run2_s2_after_nav_stats.png` | V22-S2 | Après nav `/stats` | Surface STATS |
| `run2_s2_returned_titane.png` | V22-S2 | Retour `/titane` | Retour surface principale |
| `run2_s2_final.png` | V22-S2 | Fin S2 | Audit nav complet |
| `run2_s3_before_chat.png` | V22-S3 | Avant interaction chat | Vue initiale chat |
| `run2_s3_after_typing.png` | V22-S3 | Après saisie JS | Texte dans textarea |
| `run2_s3_final.png` | V22-S3 | Fin S3 | État post-chat |
| `run2_s4_start.png` | V22-S4 | Début S4 | État initial surface secondaire |
| `run2_s4_secondary_opened.png` | V22-S4 | Surface /admin ouverte | Navigation admin confirmed |
| `run2_s4_done.png` | V22-S4 | Fin S4 | IPC probe done |
| `run2_s5_returned_primary.png` | V22-S5 | Retour surface principale | Post-S4 retour |
| `run2_s5_final.png` | V22-S5 | Screenshot final | Health DOM OK |

Chemin: `artifacts/run2/screens/`

## Total

| Run | Screenshots | Etat |
|-----|-------------|------|
| Run1 | 4 | Partiel |
| Run2 | 16 | Complet |
| **Total** | **20** | |

## Screenshots clés preuve MODE_B

- `run2_s1_t0_post_boot.png` — preuve principale boot sans splash, UI réelle
- `run2_s2_after_nav_time.png` — preuve hash routing fonctionnel
- `run2_s4_secondary_opened.png` — preuve surface /admin accessible
- `run2_s5_final.png` — preuve stabilité finale, pas d'overlay bloquant
