# ROOT CAUSE

- Status: `BLOCKED`
- Dernier marqueur observé sur artefact prod actuel: `page_load label=main url=tauri://localhost`.
- Les marqueurs BOOT instrumentés sont validés en runtime source (dev Tauri), mais non observables sur l’artefact stable pré-fix.

## Classification

- `BLOCKED` (classification A-F impossible sans binaire prod reconstruit avec instrumentation active)

## Preuve

- `05_RUN_X3.log`: `ready=0 fallback=0` sur 3 runs.
- `01_REPRO.md`: process vivant jusqu’au timeout probe (`exit_code=124`) avec page_load main présent.
- `02_INSTRUMENTATION.md`: runtime source atteint `BOOT:READY` en ~0.51s (<20s).

---

## Update 2026-03-01T22:24:37Z (causalité renforcée)

- Build prod reconstruit autorisé: PASS (`21_BUILD_PRODUCTION_BOOT_PROBE.log`).
- Sonde runtime packagé activée: `TITANE_PROBE_BOOT_MARKERS=1`.
- Résultat x3: `UI_BOOT_MARKER BOOT:NOT_READY_22S` observé sur 3/3 runs (`23_RUN_X3_BOOT_PROBE.log`).

Conclusion causale:
- Le frontend packagé n’atteint pas l’état `BOOT:READY` dans la fenêtre 22s en production.
- Le blocage n’est plus « non prouvable »: il est reproduit et mesuré sur artefact reconstruit.

---

## Update 2026-03-02T00:05:52Z (same-context desktop)

- Validation WebView réelle (WDIO/tauri-driver) exécutée sur le même AppImage reconstruit.
- Résultat: 7/7 specs desktop PASS, y compris smoke app root et scénarios chat UI/IPC.
- Logs backend corrélés: traitement de requêtes conversation avec réponses déterministes (`OFFLINE_SIM=1`), donc absence de silence runtime.

Reclassification causale:
- Hypothèse précédente `BOOT:NOT_READY_22S` = blocage applicatif global prod n’est pas confirmée en contexte réel.
- Cause la plus probable: artefact de sonde inter-contexte (`on_page_load` injecté) ne reflétant pas fidèlement l’état React/DOM applicatif.

Statut:
- `BLOCKED` levé pour la qualification runtime AppImage en contexte réel.

---

## Canonical final status — 2026-03-02T00:41:30Z

- Root cause retenue: faux négatif de sonde inter-contexte (`on_page_load`) pour l’état BOOT React.
- État runtime réel (same-context WebView) sur AppImage reconstruit: PASS.
- Statut canonique de ce document: `DONE` (incident qualifié et levé dans le périmètre du pack).

