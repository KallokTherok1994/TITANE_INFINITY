# 08 — VERSION GAP

## AppImage 26.4.0 vs Source 27.2.0
- AppImage: construit a partir d'une version antérieure au P1_BUILD_CHUNKS_FIX
  * vite.config.ts avait des chunks separes: services-ai, services-other, services-voice
  * Cycles circulaires -> TDZ en production Vite
- Source 27.2.0 (5acf1ff1a):
  * P1_BUILD_CHUNKS_FIX applique: /services/ -> 'core-runtime' unique
  * Commentaire: "anti-cycles hardening"
  * start_recording: commande IPC non presente dans 26.4.0 (ajoutee en 27.x)
  * .titane-inline-tabs button:focus-visible: absent dans 26.4.0 (V18 fix post-26.4.0)

## Impact
- AppImage 26.4.0: FAIL complet au demarrage (TDZ bloque entry.ts)
- Source 27.2.0: fix existe, AppImage 27.x non encore construite
