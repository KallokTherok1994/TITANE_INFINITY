# ═══════════════════════════════════════════════════════════════════════════
# TITANE∞ — STABLE RUNTIME README
# ═══════════════════════════════════════════════════════════════════════════

## 🔵 TITAN-STABLE: Production User Runtime

**Titan-Stable** is your daily cognitive operating system - optimized for stability, performance, and uninterrupted user experience.

---

## 🎯 PURPOSE

**Titan-Stable** is the **USER RUNTIME** of TITANE∞:
- **Used daily** for conversations, memory, thinking, workflows
- **Never interrupted** by development activities
- **Fully optimized** for performance and stability
- **Complete OMEGA pipeline** activation
- **Zero cognitive load** - just works

---

## 🚀 QUICK START

### Build Titan-Stable

```bash
cd /path/to/TITANE_INFINITY
./runtime/stable/build.sh
```

### Launch Titan-Stable

```bash
# Linux
./runtime/stable/*.AppImage

# macOS
open runtime/stable/*.app

# Windows
runtime/stable/*.msi  # Install first, then launch
```

---

## 📋 BUILD CONFIGURATION

### Production Settings

| Feature | Status | Notes |
|---------|--------|-------|
| **Hot Reload** | ❌ Disabled | Stable experience, no interruptions |
| **DevTools** | ❌ Disabled | Clean production interface |
| **Source Maps** | ❌ Disabled | Smaller bundle size |
| **Logging** | ⚠️ Minimal | Errors only (warn level) |
| **OMEGA Pipeline** | ✅ FULL | All cognitive engines active |
| **MemoryOS** | ✅ Enabled | Persistent local storage |
| **Visual Engine v21** | ✅ Enabled | 60fps, high quality |
| **Optimizations** | ✅ MAX | Minify, treeshake, compress |

### Environment Variables

See `.env.production` for complete configuration.

Key variables:
- `NODE_ENV=production` - Production build mode
- `VITE_TITANE_RUNTIME=stable` - Identifies stable runtime
- `VITE_OMEGA_ENABLED=true` - Full OMEGA activation
- `VITE_ENABLE_DEVTOOLS=false` - No debug tools

---

## 🔧 BUILD PROCESS

The build script (`build.sh`) performs:

1. **Clean** previous builds
2. **Install** dependencies (if needed)
3. **Build** React frontend (production mode)
4. **Build** Tauri app (production mode)
5. **Copy** executable to `runtime/stable/`

Build artifacts:
- Linux: `*.AppImage` (portable executable)
- macOS: `*.app` (application bundle)
- Windows: `*.msi` (installer)

---

## 🎨 USER EXPERIENCE

### What You Get

✅ **Smooth Performance**: 60fps visual engine, optimized animations
✅ **Stable Conversations**: No reloads, no interruptions
✅ **Persistent Memory**: MemoryOS saves all context
✅ **Full OMEGA**: All cognitive engines active
✅ **Clean Interface**: No debug panels, no console logs
✅ **Auto-Updates**: Check for new stable builds

### What You DON'T Get

❌ **No Hot Reload**: Stability over development convenience
❌ **No DevTools**: Clean production experience
❌ **No Debug Logs**: Console is clean
❌ **No Telemetry**: Your data stays local

---

## 🔄 UPDATE WORKFLOW

### When to Rebuild Titan-Stable

Rebuild when:
- New features validated in `dev` branch
- After merging `dev` → `stable-runtime`
- Performance improvements deployed
- Security updates applied

### How to Update

```bash
# 1. Merge validated dev changes to stable-runtime
./scripts/git/merge-dev-to-stable.sh

# 2. Rebuild Titan-Stable
./runtime/stable/build.sh

# 3. Close current Titan-Stable instance

# 4. Launch new version
./runtime/stable/*.AppImage  # (or .app, .msi)
```

---

## 🛡️ STABILITY GUARANTEES

### Branch Protection

**stable-runtime** branch rules:
- ❌ No direct commits allowed
- ✅ Only merges from `dev`
- ✅ Requires validation before merge
- 🔒 Protected branch

### Process Isolation

**Titan-Stable** runs completely independently:
- Separate process from Titan-Dev
- Different executable
- Different configuration
- No shared state with dev environment

### Zero Interruptions

**Development never affects Titan-Stable**:
- Code changes don't trigger reloads
- Dev crashes don't affect stable
- Experiments stay in dev environment
- User experience remains fluid

---

## 📊 PERFORMANCE METRICS

Expected performance (optimized build):

| Metric | Target | Notes |
|--------|--------|-------|
| **Startup Time** | < 2s | First launch |
| **Memory Usage** | < 300MB | Idle state |
| **CPU Usage** | < 5% | Background |
| **FPS (Visual Engine)** | 60fps | Smooth animations |
| **Bundle Size** | < 30MB | Compressed |

---

## 🐛 TROUBLESHOOTING

### Problem: Build fails

```bash
# Clean node_modules and rebuild
rm -rf node_modules/
npm install
./runtime/stable/build.sh
```

### Problem: Executable won't launch

```bash
# Linux: Check permissions
chmod +x runtime/stable/*.AppImage

# macOS: Check security settings
xattr -d com.apple.quarantine runtime/stable/*.app

# Windows: Run as administrator
```

### Problem: Old version still running

```bash
# Kill all Titan-Stable processes
pkill -f "titan-stable"  # Linux/macOS
taskkill /F /IM titan-stable.exe  # Windows

# Then launch new version
```

---

## 📁 FILE STRUCTURE

```
runtime/stable/
├── build.sh                 # Build script
├── tauri.conf.json         # Tauri production config
├── .env.production         # Environment variables
├── README.md               # This file
├── *.AppImage              # Linux executable (generated)
├── *.app/                  # macOS app bundle (generated)
└── *.msi                   # Windows installer (generated)
```

---

## 🔗 RELATED DOCUMENTATION

- **Git Workflow**: See `scripts/git/README.md`
- **Dual-Runtime**: See `docs/DUAL_RUNTIME_WORKFLOW.md` (coming soon)
- **Architecture**: See `ARCHITECTURE.md`
- **Dev Runtime**: See `runtime/dev/README.md`

---

## 🎓 PHILOSOPHY

**Titan-Stable** embodies the core principle:

> **"Your cognitive OS should be as stable and reliable as your operating system. Development happens elsewhere."**

**Key Principles**:
- 🔵 **Stability First**: User experience never compromised
- ⚡ **Performance**: Optimized for daily use
- 🔒 **Isolation**: Dev work can't break stable
- 🚀 **Simplicity**: Just works, every time

---

**Built with ❤️ by TITANE∞**

Version: 24.2.0  
Runtime: Stable (Production)  
Branch: stable-runtime

---

🔵 **Titan-Stable** = Your daily cognitive OS  
🟢 **Titan-Dev** = Development sandbox

**Use Stable. Develop in Dev. Never mix.**
