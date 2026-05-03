# 03 UI Coverage Map

## Covered top-level pages

- `/titane` (`page-titane`)
- `/time` (`page-time`)
- `/stats` (`page-stats`)
- `/admin` (`page-admin`)
- `/dev` (`page-dev`)
- `/fusion` (`page-fusion`) [discovered]
- `/optimization` (`page-optimization`) [discovered]

## Suite behavior

- `ui-ultra-smoke` covers stable smoke journey and no-silence checks.
- `ui-ultra-full` covers stable full journey with deep interactions on selected pages.
- Full run uses `stableFullPages` (excludes `fusion` and `optimization` for deterministic stability).

## Machine-readable maps

- `ui_pages.json`
- `ui_routes.json`
- `ui_controls.json`
- `ui_ipc_links.json`

