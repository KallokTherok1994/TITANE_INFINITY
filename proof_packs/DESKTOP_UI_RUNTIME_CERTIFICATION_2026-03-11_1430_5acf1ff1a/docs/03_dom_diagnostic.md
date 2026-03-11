# 03 — DOM DIAGNOSTIC (diag_run)

## Spec dom_diag: pause(2500) puis introspection DOM
- exit=0, dom_diag.json produit

## Resultats (dom_diag.json)
- href: tauri://localhost#/titane
- rootChildSummary: [{cls: "loading-splash", tag: "div"}]
- classesCount: 2 (seulement loading-splash + skip-link)
- buttons: [], inputs: [], roles: []
- __TITANE_BOOT__: non capte dans ce run
- CSS focus-visible: .titane-inline-tabs button:focus-visible ABSENT (V18 fix absent de AppImage 26.4.0)

## Conclusion
React n'a pas monte au-dela du loading-splash apres 2.5s.
