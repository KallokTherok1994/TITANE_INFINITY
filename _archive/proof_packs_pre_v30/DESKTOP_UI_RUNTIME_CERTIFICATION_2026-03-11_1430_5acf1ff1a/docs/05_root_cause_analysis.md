# 05 — ANALYSE CAUSE RACINE

## Evidence run3 (spec v3 diagnostic progressif)
- CP1 (+5s): entry_ts=false, splash display:flex, offsetW=1867, classesCount=2
- CP2 (+10s): identique
- CP3 (+16s): identique
- CP4 (+22s): identique
- __TITANE_BOOT__ full: {} (vide = entry.ts jamais execute)
- titane_boot_html_recovery_once: "1" (HTML guard deja declenche)

## Erreur JavaScript (wdio.log run3)
- Fichier: tauri://localhost/assets/services-ai-C2K6-7v0.js
- Erreur: ReferenceError: Cannot access uninitialized variable
- Position: line 2, col 2817
- Repetee en boucle (waterfall de reloads)
- Type: TEMPORAL DEAD ZONE (TDZ) — acces a const/let avant initialisation

## Cause
AppImage 26.4.0 a ete construit avec vite.config.ts qui avait des chunks separes
services-ai / services-other / services-voice avec des imports circulaires. La 
resolution de ces cycles en production Vite cree une TDZ.

## Confirmation fix dans source
vite.config.ts (5acf1ff1a, P1_BUILD_CHUNKS_FIX): TOUS les modules /services/ 
sont fusionnes dans le chunk 'core-runtime' pour eliminer les cycles inter-chunks.
Commentaire source: "STRATEGY: Merge circular dependency groups into unified buckets".
