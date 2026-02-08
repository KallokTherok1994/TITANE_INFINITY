# Observabilité & diagnostics (DEV + PROD)

## 1) Marqueurs de boot
Exigence : voir clairement les phases :
- `BOOT: html_loaded`
- `BOOT: js_loaded`
- `BOOT: react_mounted`
- `BOOT: routes_ready`
- `BOOT: ipc_ready`
- `BOOT: first_paint_ok`

UI : petit overlay bas-droite (comme “BOOT BEACON”) + log persistant optionnel.

## 2) Capture d’erreurs
- ErrorBoundary global (React) + ErrorBoundary par page.
- Logger central : console + fichier local (`runtime/logs/ui.log`).
- Sur erreur : afficher
  - code,
  - stack (dev) / trace id (prod),
  - bouton “Copier diagnostic”.

## 3) Mode diagnostic local-first (PROD)
- Toggle caché (ex. Ctrl+Alt+D) → ouvre panneau diagnostics.
- Options :
  - afficher routes, versions, providers, allowlist, CSP status
  - exporter bundle de diagnostic (zip) sans données sensibles.

## 4) Anti-splash / anti-freeze
- Watchdog UI :
  - si pas de `react_mounted` en X secondes → écran “Boot bloqué” avec instructions.
  - si page en “loading” > Y secondes → état “degraded” + retry.

