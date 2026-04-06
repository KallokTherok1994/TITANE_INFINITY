# 10 — FINDINGS SECONDAIRES

## F1 - CSS focus-visible gap (non-critique)
- AppImage 26.4.0: .titane-inline-tabs button:focus-visible ABSENT
- V18 fix (ce6357c31) applique dans source post-26.4.0
- Impact: accessibilite clavier reduite sur onglets inline
- Classification: UI_MINOR_NON_BLOCKING (app ne boote de toute facon)

## F2 - start_recording IPC missing (mineur)
- lsErrors: "Command start_recording not found" (repeated)
- Commande ajoutee dans source 27.x, absente dans 26.4.0
- Module VocalDevConsoleEngine appelle secureInvoke('start_recording')
- Impact: vocal recording ne fonctionne pas dans 26.4.0
- Classification: FEATURE_MISSING_IN_LEGACY_APPIMAGE

## F3 - Version gap source/artifact (warning)
- Source: 27.2.0 | AppImage: 26.4.0 | Ecart: 0.8 versions majeures
- Aucun AppImage 27.x disponible
- Action: declencher tauri build depuis source 27.2.0 (post-fix TDZ)
