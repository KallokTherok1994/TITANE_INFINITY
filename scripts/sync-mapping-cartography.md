# TITANE_INFINITY — Synchronisation Mapping & Cartographie (auto)

## Description

Ce script synchronise automatiquement tous les documents de mapping et de cartographie requis par la doctrine TITANE (Règle 15) :

- UI_SURFACE_MAP.md
- docs/CARTOGRAPHY_COMPLETE.md
- ARCHITECTURE.md
- OLLAMA_RUNTIME_MAP.md
- RELEASE_SURFACE_INVENTORY.md
- docs/IPC_CATALOG.md

## Usage

```sh
pnpm run sync:mapping
```

## Actions

- Met à jour la date, la version, et les sections critiques de chaque document.
- Ajoute les artefacts manquants détectés dans dist/, deployment/latest/, src-tauri/gen/android/app/build/outputs/apk/…
- Met à jour les sections "Dernière génération" et "Artefacts présents".
- Peut être appelé en post-build ou manuellement.

## Implémentation

- Fichier : scripts/sync-mapping-cartography.mjs
- Ajoutez dans package.json :
  "sync:mapping": "node scripts/sync-mapping-cartography.mjs"

---

**TODO** : Générer scripts/sync-mapping-cartography.mjs pour automatiser la synchronisation.
