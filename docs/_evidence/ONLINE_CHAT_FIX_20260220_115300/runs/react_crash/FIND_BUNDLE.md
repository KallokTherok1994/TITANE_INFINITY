React crash bundle localization (append-only)

- Bundle: dist/assets/services-ai-OxGOyH_O.js
- Line approx: 2 (from WRY error report)
- Variable before init: not visible in minified bundle (no explicit error string in file)
- Import chain (from __vite__mapDeps):
  - ./logLevelConfig-TldwHmPK.js
  - ./services-other-CbeZd_EX.js
  - ./vendor-CImLE-O9.js
  - ./react-vendor-CkjDzxnv.js
  - ./tauri-vendor-g4aAW4EP.js
  - ./services-boot-84K9CJQb.js
  - ./validation-C2fdxRag.js
  - ./services-voice-Cn8P2qFM.js
- Notes:
  - The bundle is minified; no source map present in dist/assets.
  - The ReferenceError is reported by WRY with file+line only.
