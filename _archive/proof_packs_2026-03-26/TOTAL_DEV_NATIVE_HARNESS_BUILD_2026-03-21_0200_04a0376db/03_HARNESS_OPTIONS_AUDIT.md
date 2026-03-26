# Native Harness Options Audit

## OPTION A: WebdriverIO + Tauri Native Driver (CHOSEN)
**Status:** Existing, fully operational infrastructure

**Evidence:**
- wdio.desktop.conf.cjs: Present, configured for tauri:// URLs
- 20+ existing tests in e2e/desktop/: All using *.wdio.test.js pattern
- tauri-driver: Running successfully on port 4444
- Compatible with existing test helpers and page-objects

**Risk:** LOW (proven pattern in existing codebase)  
**Build Effort:** MINIMAL (5 hours for TOTAL_DEV test)  
**Decision:** ✅ **SELECTED**

## OPTION B: Playwright + Native Target
**Status:** Not configured in current repo

**Evidence:**
- playwright.config.ts: Hardcoded to http://127.0.0.1:5173 (web-only)
- No native Tauri configuration in Playwright setup
- Would require config overhaul + new test suite

**Risk:** MEDIUM (requires reworking existing Playwright suite)  
**Build Effort:** 20+ hours  
**Decision:** ❌ **REJECTED** (too much rework, OPTION A already works)

## OPTION C: Custom Tauri CLI Commands
**Status:** Possible but outside scope

**Evidence:**
- tauri CLI has automation capabilities
- Would require shell script wrapper + custom parsing
- No precedent in codebase

**Risk:** HIGH (new infrastructure, untested in team)  
**Build Effort:** 30+ hours  
**Decision:** ❌ **REJECTED** (OPTION A sufficient)

## OPTION D: Impossible / Blocked
**Status:** Evaluated fully

**Assessment:** NOT applicable—OPTION A proven functional

---

**FINAL DECISION:** OPTION A (WebdriverIO + Tauri native driver)  
**Rationale:** Lowest risk, existing codebase integration, infrastructure proven
