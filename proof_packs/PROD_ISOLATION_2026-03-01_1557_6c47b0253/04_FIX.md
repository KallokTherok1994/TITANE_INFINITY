# FIX APPLIQUE (MINIMAL)

## Changements

1. `src/main.tsx`
- Ajout émetteur BOOT global.
- Ajout watchdog 20s avec fallback explicite + bouton relance.

2. `src/App.tsx`
- Émission des marqueurs BOOT demandés autour init router/orchestrateur et READY.

3. `src/lib/security.ts`
- Traces IPC START/END avec id corrélé.
- Catégorisation timeout -> `IPC_TIMEOUT` + log `IPC:TIMEOUT`.

4. `src-tauri/src/runtime_config.rs`
- Traces backend `CMD:START/CMD:END` sur commande de boot critique.

## Pourquoi c’est minimal

- Aucun refactor large.
- Aucune extension de capabilities.
- Correctif strictement sur anti-silence + traçabilité causale.

---

## Update 2026-03-01T21:35:14Z (AUTO-FIX ciblé)

5. `src/services/cognitive/index.ts`
- Suppression d’un `invoke('check_sqlite_available')` direct.
- Remplacement par client canonique: `tauriClient.checkSqliteAvailable()`.

Impact gouvernance:
- Réduction d’un usage IPC direct hors client canonique dans le runtime exécutable.
- Aucun changement de surface réseau/capabilities.

---

## Update 2026-03-02T00:01:11Z (itérations anti-blocage BOOT)

6. `src/hooks/useLivingEngines.ts`
- Fallback non-bloquant si init Persona échoue.
- Timeout borné (4s) sur l’initialisation Tauri Persona pour éviter suspend infini.

7. `src-tauri/src/main.rs`
- Listener event bus `titane://boot-marker` ajouté (journal `UI_BOOT_EVENT`).
- Sonde runtime opt-in `TITANE_PROBE_BOOT_MARKERS=1` enrichie pour remonter READY/NOT_READY et stage.

8. `src/main.tsx`
- Réémission `boot_marker_log` depuis `emitBootMarker`.
- Publication de stage/ready dans le DOM (`data-titane-boot-stage`, `data-titane-boot-ready`).

Résultat observé:
- Malgré rebuilds successifs et x3, aucun marqueur React BOOT n’est visible côté logs backend hors sonde.
- Sonde voit `BOOT:NOT_READY_22S` avec `BOOT:STAGE:UNKNOWN_STAGE` (3/3), ce qui indique un écart de contexte d’observabilité entre sonde et runtime app.

