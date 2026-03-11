# 07 — EVIDENCE BOOT FAILURE

## Preuves directes (run3)
1. window.__TITANE_BOOT__ = {} (vide) a tous les checkpoints
   -> entry.ts n'a JAMAIS executes window.__TITANE_BOOT__.entry_ts = true
2. loading-splash: display:flex, offsetW=1867, offsetH=1200 pendant 22s+
   -> Pas de loaderGuardTimer (n'existe pas dans 26.4.0 ou ne peut pas s'executer)
3. classesCount = 2 a tous les checkpoints
   -> React n'a pas rendu un seul composant
4. interactive: visibleBtns=0, visibleInputs=0, visibleTabs=0
   -> Aucun element interactif pendant les 22s+ d'observation

## Preuves indirectes (wdio.log run3)
5. ReferenceError: Cannot access uninitialized variable
   @ tauri://localhost/assets/services-ai-C2K6-7v0.js:2:2817
   -> Bundle AI services echoue a l'initialisation (TDZ)
6. titane_boot_html_recovery_once = "1" en localStorage
   -> HTML guard a deja declenche un reload (app n'a pas boote)
7. lsErrors: "Command start_recording not found" (x10+)
   -> Commande IPC non registree dans AppImage 26.4.0 (feature gap mineur)
