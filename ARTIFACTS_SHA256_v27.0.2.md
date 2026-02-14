# TITANE∞ v27.0.2 - Artifacts SHA256

**Build Date:** 2026-02-14  
**Commit:** `f769be23`

## Production Artifacts

### AppImage (Linux Universal)
**File:** `TITANE-Infinity_27.0.2_amd64.AppImage`  
**Size:** 96 MB  
**SHA256:**
```
460f1ff9b22456f6719c95dadd01656463fff579baab0abd7bc3b782e0327ed1
```

### DEB (Debian/Ubuntu)
**File:** `TITANE-Infinity_27.0.2_amd64.deb`  
**Size:** 26 MB  
**SHA256:**
```
969d05489cb7c11c40dba7b3bea30bdaaf7d0d7eac2a83c9fbe5b43627efd265
```

### RPM (Fedora/RHEL)
**File:** `TITANE-Infinity-27.0.2-1.x86_64.rpm`  
**Size:** 26 MB  
**SHA256:**
```
a593dd0b71f8257b686a3be892bc00852636108b7f2c2d1477a62b889f608fd2
```

---

## Build Summary

**Changelog:** [CHANGELOG.md](CHANGELOG.md#v27-4-2-hotfix)

**Critical Fixes:**
- Conversation storage ID mismatch (src-tauri/src/conversation_engine/memory.rs)
- IPC error classification with traceId (src/utils/tauriProtector.ts)
- TypeScript corrections (chatEngine.commands.ts, tsconfig.json)

**Gates:** G1 ✅ | G2 ✅ | G3 ✅  
**Validation:** User confirmed chat functionality restored

---

## Verification

To verify artifact integrity:

```bash
# AppImage
sha256sum TITANE-Infinity_27.0.2_amd64.AppImage

# DEB
sha256sum TITANE-Infinity_27.0.2_amd64.deb

# RPM  
sha256sum TITANE-Infinity-27.0.2-1.x86_64.rpm
```

Compare output with hashes above.

---

**© 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.**
