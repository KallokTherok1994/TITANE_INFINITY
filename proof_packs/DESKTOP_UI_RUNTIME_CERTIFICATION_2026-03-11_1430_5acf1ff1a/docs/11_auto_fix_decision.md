# 11 — DECISION AUTO-FIX

## Defaut principal: TDZ bundle TDZ dans AppImage 26.4.0
- Nature: artefact compile (binaire AppImage) — NON patchable sans rebuild
- Fix source: DEJA APPLIQUE dans 5acf1ff1a (vite.config.ts P1_BUILD_CHUNKS_FIX)
- Action requise: tauri build a partir de source 27.2.0

## Decision
FIX_SOURCE = ALREADY_DONE (5acf1ff1a contient le fix)
FIX_ARTIFACT = REQUIRES_REBUILD (hors scope V20, no GO_FOR_PROD_BUILD token)
PATCH_APPIMAGE_DIRECTLY = IMPOSSIBLE (binaire signe)

## Defauts secondaires
- F1 (CSS): fix source deja dans V18 (ce6357c31)
- F2 (IPC): fix source deja dans 27.x
- F3 (version gap): consequence du manque de build 27.x

## Conclusion
NO_CODE_CHANGE_NEEDED — tous les fix source sont deja appliques dans MAIN.
REBUILD_APPIMAGE requis pour produire un artefact fonctionnel 27.x.
