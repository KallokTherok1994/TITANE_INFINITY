# UI_DESKTOP_LEGACY_REDIRECT_RECONCILIATION_v64

**Date**: 2026-05-10  
**Version**: 33.0.13  
**Branch**: MAIN

Source of truth: `src/App.tsx` — `<Navigate to="..." replace />` directives.

---

## Legacy Redirect Routes

All routes verified against App.tsx `<Route path="..." element={<Navigate to="..." replace />} />` entries.

| Legacy Route | Target | In App.tsx? | Redirect Type | Classification |
|---|---|---|---|---|
| /chat | /titane?tab=conversation | ✅ line 399 | Navigate replace (legacy alias) | **LEGACY_REDIRECT_CONFIRMED** |
| /camera | /titane | ✅ line 402 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /evo | /titane | ✅ line 403 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /dashboard | /titane | ✅ line 404 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /progression | /titane | ✅ line 414 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /xp | /experience | ✅ line 415 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /agenda | /time | ✅ line 435 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /time-navigator | /time | ✅ line 436 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /system-center | /admin (system tab) | ✅ line 448 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /configuration | /admin?tab=config | ✅ line 472 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /settings | /admin?tab=config | ✅ line 483 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /governance | /admin?tab=governance | ✅ line 489 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /audio | /admin?tab=audio | ✅ line 500 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /voice | /admin?tab=audio | ✅ line 501 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /tts | /admin?tab=audio | ✅ line 502 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /one-core | /dev?tab=overview | ✅ line 584 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /qa | /dev?tab=validation | ✅ line 594 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /monitoring | /dev (or monitoring-center) | ✅ line 596 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /cloud-sync | /cloud | ✅ line 681 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /vault | /cloud | ✅ line 682 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |
| /doc | /doc-center | ✅ line 716 | Navigate replace | **LEGACY_REDIRECT_CONFIRMED** |

---

## Summary

| Metric | Value |
|---|---|
| Total legacy redirects verified | 21 |
| In App.tsx with Navigate replace | 21/21 |
| Not found / missing | 0 |
| Broken redirects | 0 |
| Redirect to valid route | 21/21 |

**Final verdict**: `LEGACY_REDIRECT_CONFIRMED` — all 21 legacy redirect routes are documented and confirmed in App.tsx with `<Navigate ... replace />` directives.

---

## Notes

- `/chat` is explicitly annotated in App.tsx as a "legacy alias that must resolve to `/titane?tab=conversation`"
- `/governance-center` and `/governance` both redirect to `/admin?tab=governance` (both confirmed)
- `/qa-monitoring` is a separate redirect → `/dev` with monitoring subtab (confirmed at line 591)
- No broken redirect chains detected — all targets are real routes in App.tsx
- No legacy route exposes uncontrolled behavior or bypasses governance
