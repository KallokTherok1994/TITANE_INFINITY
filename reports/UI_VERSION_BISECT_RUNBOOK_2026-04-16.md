# UI VERSION BISECT RUNBOOK

Date: 2026-04-16
Status: PASS

## Goal

Fournir un kit de bisect manuel repetable pour isoler la premiere version 30.1.x ou la surface UI conversation devient regress ive.

## Scope

- Script generateur: `scripts/diagnostic/init-ui-version-bisect.sh`
- Sortie de smoke: `reports/UI_VERSION_BISECT_SMOKE.md`
- Verites a capturer: artefact, installation hote, launcher, repo/runtime

## Execution Order

1. Generer une matrice avec `bash scripts/diagnostic/init-ui-version-bisect.sh --output reports/UI_VERSION_BISECT_SMOKE.md 30.1.23 30.1.26 30.1.27`
2. Pour chaque version, capturer les quatre verites avant tout verdict UI.
3. Evaluer chaque symptome individuellement: route, zoom TopNav, shell fullscreen, scroll interne, visibilite du composer, envoi mobile/browser, retour bas de conversation, visibilite message long.
4. Stopper des qu'un intervalle minimal sain/regressif est etabli.

## Decision Rules

1. 30.1.23 reste la reference stable prioritaire.
2. 30.1.26 sert de pivot principal.
3. 30.1.27 est la premiere version a forte suspicion.
4. 30.1.29 n'est pas une verite desktop autoritaire pour l'archeologie produit.

## Validation

- `bash scripts/diagnostic/init-ui-version-bisect.sh --output reports/UI_VERSION_BISECT_SMOKE.md 30.1.23 30.1.26 30.1.27` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS

## Rollback

- `git restore -- scripts/diagnostic/init-ui-version-bisect.sh reports/UI_VERSION_BISECT_RUNBOOK_2026-04-16.md scripts/autoheal/autoheal_rules.jsonl tests/unit/scripts/uiVersionBisectScript.test.ts`
- `rm -f reports/UI_VERSION_BISECT_SMOKE.md`# UI VERSION BISECT RUNBOOK — 2026-04-16

## Objective

Isoler la premiere version 30.1.x ou la surface conversationnelle TITANE devient visiblement regressive, sans confondre verite artefact, verite installation hote, et verite launcher.

## Recommended Scope

Le coeur du bisect est la fenetre 30.1.22 -> 30.1.27.

- 30.1.22 et 30.1.23 servent de baseline saine probable.
- 30.1.26 est la meilleure version pivot si l'artefact est disponible.
- 30.1.27 est la premiere version explicitement documentee comme refresh UI conversationnel.
- 30.1.28, 30.1.31 et 30.1.33 servent a qualifier la propagation puis la stabilisation.

## Decision Tree

1. Tester 30.1.23.
2. Si 30.1.23 est saine, tester 30.1.26.
3. Si 30.1.26 est saine, tester 30.1.27. La cassure est alors situee entre 30.1.26 et 30.1.27.
4. Si 30.1.26 est deja regressive, redescendre vers 30.1.24 puis 30.1.25.
5. Une fois la premiere version cassante isolee, verifier 30.1.28 puis 30.1.31 pour mesurer la propagation puis la correction.
6. Verifier 30.1.33 en dernier seulement, pour juger l'etat courant.

## Mandatory Truth Capture

Pour chaque version testee, consigner separement:

1. L'artefact reellement lance.
2. La version installee cote systeme.
3. La version exposee par les launchers.
4. La version declaree par le depot/runtime.

Sur Linux, les launchers peuvent mentir si /usr/bin et ~/.local/bin divergent. Verifier aussi `which -a titane-infinity` avant de conclure.

## Symptom Matrix

Les symptomes prioritaires sont ceux documentes dans les preuves du 15-16 avril:

1. Zoom TopNav.
2. Fullscreen chat.
3. Scroll interne de la zone messages.
4. Visibilite du compositeur en fullscreen compact.
5. Envoi browser-mobile Android.
6. Bouton retour en bas.
7. Visibilite des messages longs.
8. Verite canonique de route entre /chat et /titane?tab=conversation.

## Suggested Commands

Pour initialiser une matrice vierge:

```bash
bash scripts/diagnostic/init-ui-version-bisect.sh
```

Pour cibler une sous-plage:

```bash
bash scripts/diagnostic/init-ui-version-bisect.sh 30.1.23 30.1.26 30.1.27
```

## Stop Conditions

1. STOP si une version saine et la version suivante cassante sont identifiees avec les memes checks.
2. STOP si l'objectif est uniquement un rollback temporaire et que 30.1.23 ou 30.1.22 est visuellement saine.
3. Ne pas utiliser 30.1.29 pour conclure sur un etat produit: le depot documente explicitement l'absence d'artefact desktop honnête pour cette tentative.

## Expected Final Verdict

Le verdict final doit contenir quatre champs:

1. Derniere version saine probable.
2. Premiere version cassante probable.
3. Surfaces affectees.
4. Version de rollback temporaire recommandee.

## Primary Evidence Files

- RELEASE_SURFACE_INVENTORY.md
- RELEASE_v30.1.22.md
- RELEASE_v30.1.23.md
- RELEASE_v30.1.27.md
- RELEASE_v30.1.28.md
- RELEASE_v30.1.31.md
- CHANGELOG.md
- UI_SURFACE_MAP.md
- reports/BUILD_ALL_2026-04-15_v30.1.22.md
- reports/BUILD_ALL_2026-04-15_v30.1.23.md
- reports/LOCAL_UI_BUILD_REFRESH_2026-04-15_v30.1.27.md
- reports/UI_ANDROID_BROWSER_MOBILE_FIX_2026-04-15.md
- reports/UI_TOPNAV_ZOOM_AUDIT_2026-04-15.md
- reports/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15.md
- reports/CHAT_LONG_MESSAGE_VISIBILITY_2026-04-16.md# UI VERSION BISECT RUNBOOK — 2026-04-16

## Objective

Isoler la premiere version 30.1.x ou la surface conversationnelle TITANE devient visiblement regressive, sans confondre verite artefact, verite installation hote, et verite launcher.

## Recommended Scope

Le coeur du bisect est la fenetre 30.1.22 -> 30.1.27.

- 30.1.22 et 30.1.23 servent de baseline saine probable.
- 30.1.26 est la meilleure version pivot si l'artefact est disponible.
- 30.1.27 est la premiere version explicitement documentee comme refresh UI conversationnel.
- 30.1.28, 30.1.31 et 30.1.33 servent a qualifier la propagation puis la stabilisation.

## Decision Tree

1. Tester 30.1.23.
2. Si 30.1.23 est saine, tester 30.1.26.
3. Si 30.1.26 est saine, tester 30.1.27. La cassure est alors situee entre 30.1.26 et 30.1.27.
4. Si 30.1.26 est deja regressive, redescendre vers 30.1.24 puis 30.1.25.
5. Une fois la premiere version cassante isolee, verifier 30.1.28 puis 30.1.31 pour mesurer la propagation puis la correction.
6. Verifier 30.1.33 en dernier seulement, pour juger l'etat courant.

## Mandatory Truth Capture

Pour chaque version testee, consigner separement:

1. L'artefact reellement lance.
2. La version installee cote systeme.
3. La version exposee par les launchers.
4. La version declaree par le depot/runtime.

Sur Linux, les launchers peuvent mentir si /usr/bin et ~/.local/bin divergent. Verifier aussi `which -a titane-infinity` avant de conclure.

## Symptom Matrix

Les symptomes prioritaires sont ceux documentes dans les preuves du 15-16 avril:

1. Zoom TopNav.
2. Fullscreen chat.
3. Scroll interne de la zone messages.
4. Visibilite du compositeur en fullscreen compact.
5. Envoi browser-mobile Android.
6. Bouton retour en bas.
7. Visibilite des messages longs.
8. Verite canonique de route entre /chat et /titane?tab=conversation.

## Suggested Commands

Pour initialiser une matrice vierge:

```bash
bash scripts/diagnostic/init-ui-version-bisect.sh
```

Pour cibler une sous-plage:

```bash
bash scripts/diagnostic/init-ui-version-bisect.sh 30.1.23 30.1.26 30.1.27
```

## Stop Conditions

1. STOP si une version saine et la version suivante cassante sont identifiees avec les memes checks.
2. STOP si l'objectif est uniquement un rollback temporaire et que 30.1.23 ou 30.1.22 est visuellement saine.
3. Ne pas utiliser 30.1.29 pour conclure sur un etat produit: le depot documente explicitement l'absence d'artefact desktop honnête pour cette tentative.

## Expected Final Verdict

Le verdict final doit contenir quatre champs:

1. Derniere version saine probable.
2. Premiere version cassante probable.
3. Surfaces affectees.
4. Version de rollback temporaire recommandee.

## Primary Evidence Files

- RELEASE_SURFACE_INVENTORY.md
- RELEASE_v30.1.22.md
- RELEASE_v30.1.23.md
- RELEASE_v30.1.27.md
- RELEASE_v30.1.28.md
- RELEASE_v30.1.31.md
- CHANGELOG.md
- UI_SURFACE_MAP.md
- reports/BUILD_ALL_2026-04-15_v30.1.22.md
- reports/BUILD_ALL_2026-04-15_v30.1.23.md
- reports/LOCAL_UI_BUILD_REFRESH_2026-04-15_v30.1.27.md
- reports/UI_ANDROID_BROWSER_MOBILE_FIX_2026-04-15.md
- reports/UI_TOPNAV_ZOOM_AUDIT_2026-04-15.md
- reports/CHAT_FULLSCREEN_UI_PROCEDURE_2026-04-15.md
- reports/CHAT_LONG_MESSAGE_VISIBILITY_2026-04-16.md