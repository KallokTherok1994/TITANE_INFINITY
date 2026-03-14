# CSP unsafe-inline Rationale

**Date:** 2026-03-14  
**Detected by:** csp-baseline-gate.js (FAIL)  
**Related audit:** proof_packs/AUDIT_TOTAL_2026-03-14/

## Current State

`src-tauri/tauri.conf.json` script-src contains `'unsafe-inline'`:
```
script-src 'self' 'unsafe-inline' asset: tauri:
```

## Why It's Present

Tauri WebView (WebKit/Chromium) + React: the bundler injects some inline scripts.
This is a known pattern in Tauri v2 apps using Vite. The `'unsafe-inline'` allows these injected scripts to run.

## Risk Assessment

- **Risk:** XSS escalation if Tauri WebView renderer is compromised
- **Mitigations in place:**
  - No `unsafe-eval` (confirmed)
  - `connect-src` restricted to `tauri: asset: ipc: 'self'` — no external network
  - `frame-ancestors 'none'` — no iframe embedding
  - `object-src 'none'`
  - Asset protocol scoped to `$APPDATA/com.titane.infinity/**`
  - Tauri-only app — no web server exposed

## Approval Status

PENDING — Needs explicit team approval or removal in a dedicated sprint.

## Action Plan

1. Test if `'unsafe-inline'` can be removed with `nonce` approach in Vite/Tauri
2. If not possible: document explicit team approval here
3. Target: Q2 sprint

## Tracker

AutoHeal: AH-2026-03-14-AUDIT  
Gate: csp-baseline-gate.js  
