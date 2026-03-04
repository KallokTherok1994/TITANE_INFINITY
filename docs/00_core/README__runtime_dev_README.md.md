# ═══════════════════════════════════════════════════════════════════════════

# TITANE∞ — DEV RUNTIME README

# ═══════════════════════════════════════════════════════════════════════════

## 🟢 TITAN-DEV: Development Environment

**Titan-Dev** is your safe experimentation zone - full debugging, monitoring, and freedom to break things.

---

## 🎯 PURPOSE

**Titan-Dev** is the **DEVELOPMENT RUNTIME** of TITANE∞:

- **Safe to experiment** - isolated from user experience
- **Full debugging tools** - DevTools, profiler, monitoring
- **Verbose logging** - see everything that happens
- **Manual reload control** - no auto-reload surprises
- **Telemetry enabled** - Claude Code integration

---

## 🚀 QUICK START

### Launch Titan-Dev

```bash
cd /path/to/TITANE_INFINITY
./runtime/dev/run-dev.sh
```

### Controls During Development

| Key        | Action                     |
| ---------- | -------------------------- |
| **Ctrl+R** | Reload React (soft reload) |
| **F5**     | Full window reload         |
| **F12**    | Toggle DevTools            |
| **Ctrl+C** | Stop dev server            |

---

## 📋 DEV CONFIGURATION

### Development Features

| Feature               | Status      | Notes                                |
| --------------------- | ----------- | ------------------------------------ |
| **Hot Reload**        | ⚠️ Manual   | Ctrl+R to reload React               |
| **Tauri Watch**       | ❌ Disabled | Prevents crashes, use manual reload  |
| **DevTools**          | ✅ Enabled  | F12 to open                          |
| **Source Maps**       | ✅ Enabled  | Full debugging support               |
| **Logging**           | ✅ Verbose  | Debug level, console + file          |
| **OMEGA Pipeline**    | ✅ Dev Mode | Verbose logging, telemetry           |
| **MemoryOS**          | ✅ Dev Mode | Volatile cache, debug enabled        |
| **Visual Engine v21** | ✅ Dev Mode | Debug overlay, performance metrics   |
| **Monitoring**        | ✅ Full     | Error tracking, performance, network |

### Environment Variables

See `.env.development` for complete configuration.

Key variables:

- `NODE_ENV=development` - Development mode
- `VITE_TITANE_RUNTIME=dev` - Identifies dev runtime
- `VITE_ENABLE_DEVTOOLS=true` - Full debug tools
- `VITE_OMEGA_LOGGING=verbose` - Detailed logs

---

## 🔧 DEVELOPMENT WORKFLOW

### Typical Dev Session

```bash
# 1. Switch to dev branch
./scripts/git/switch-dev.sh

# 2. Create feature branch (optional)
./scripts/git/new-feature.sh my-new-feature

# 3. Launch Titan-Dev
./runtime/dev/run-dev.sh

# 4. Make changes in VS Code
# (Files auto-saved with VS Code)

# 5. Manual reload React
# Press Ctrl+R in Titan-Dev window

# 6. Check logs
tail -f runtime/dev/logs/vite.log
tail -f runtime/dev/logs/tauri.log

# 7. Commit when ready
git add -A
git commit -m "feat: implement new feature"
```

---

## 🐛 DEBUGGING

### DevTools

Press **F12** to open Chrome DevTools:

- **Console**: See logs, errors, warnings
- **Elements**: Inspect DOM, CSS
- **Network**: Monitor API calls
- **Performance**: Profile React components
- **Memory**: Check for memory leaks
- **Application**: Inspect storage, cache

### Logs

All logs are saved in `runtime/dev/logs/`:

```bash
# Watch Vite logs (React dev server)
tail -f runtime/dev/logs/vite.log

# Watch Tauri logs (Rust backend)
tail -f runtime/dev/logs/tauri.log

# Search for errors
grep "ERROR" runtime/dev/logs/*.log

# Search for specific component
grep "VisualEngine" runtime/dev/logs/*.log
```

### Monitoring Dashboard

**Coming Soon**: `http://localhost:3001/monitor`

- Real-time performance metrics
- Memory usage tracking
- API call monitoring
- Component render tracking

---

## 🎨 DEVELOPMENT FEATURES

### Hot Module Replacement (HMR)

**React HMR** (Manual):

- Press **Ctrl+R** to reload React
- Preserves most component state
- Fast feedback loop

**Tauri Watch** (Disabled):

- Auto-reload disabled to prevent crashes
- Manual restart required for Rust changes:
  ```bash
  # Stop dev server (Ctrl+C)
  # Restart
  ./runtime/dev/run-dev.sh
  ```

### Visual Engine Debug Overlay

When `VITE_VISUAL_ENGINE_DEBUG=true`:

- Performance metrics (FPS, frame time)
- Active state display
- Transition tracking
- Particle count

### MemoryOS Debug Mode

When `VITE_MEMORYOS_DEBUG=true`:

- Memory operations logged
- Cache miss/hit tracking
- Storage size monitoring

---

## 🔬 EXPERIMENTAL FEATURES

Test new features safely in Dev:

```bash
# Edit runtime/dev/.env.development
VITE_EXPERIMENTAL_FEATURES=true
VITE_FEATURE_FLAG_VISUAL_V22=true
VITE_FEATURE_FLAG_MEMORY_V2=true
```

Feature flags:

- `VISUAL_V22`: Next-gen visual engine
- `MEMORY_V2`: New memory architecture
- More flags added as features develop

---

## ⚠️ IMPORTANT RULES

### ✅ DO in Dev

✅ **Experiment freely** - This is your sandbox
✅ **Break things** - Isolated from user experience
✅ **Test aggressively** - All tools at your disposal
✅ **Use verbose logging** - See everything
✅ **Try experimental features** - Safe environment

### ❌ DON'T in Dev

❌ **Don't merge untested code to stable** - Validate first
❌ **Don't commit debug artifacts** - `.env.development` is gitignored
❌ **Don't use production API keys** - Use dev/test keys
❌ **Don't skip testing** - Just because it works in dev...

---

## 🚀 PERFORMANCE TESTING

### Load Testing

```bash
# Stress test cognitive engines
npm run test:load

# Memory leak detection
npm run test:memory

# Performance benchmarks
npm run test:perf
```

### Profiling

1. Open DevTools (F12)
2. Go to "Performance" tab
3. Click "Record"
4. Perform actions in Titan-Dev
5. Stop recording
6. Analyze flame graph

---

## 📊 MONITORING & TELEMETRY

### Claude Code Integration

When `VITE_CLAUDE_CODE_INTEGRATION=true`:

- Telemetry sent to `localhost:3001/telemetry`
- Branch-aware context
- Performance metrics shared
- Error tracking

### Metrics Tracked

- Component render times
- API call durations
- Memory usage trends
- User interaction patterns
- Visual engine performance

---

## 🧪 TESTING IN DEV

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- VisualEngine.test.ts

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run Tauri integration tests
npm run tauri test

# Run e2e tests
npm run test:e2e
```

---

## 🔄 SYNC WITH STABLE

### Test Before Merging

Before `merge-dev-to-stable.sh`:

1. **Test thoroughly in Dev**

   ```bash
   npm test
   npm run test:e2e
   npm run test:perf
   ```

2. **Check for regressions**
   - Compare with previous dev build
   - Verify all features work
   - Check performance metrics

3. **Review changes**

   ```bash
   git log stable-runtime..dev --oneline
   git diff stable-runtime..dev
   ```

4. **Get feedback** (if team)
   - Code review
   - QA testing
   - User testing (optional)

5. **Merge when validated**
   ```bash
   ./scripts/git/merge-dev-to-stable.sh
   ```

---

## 📁 FILE STRUCTURE

```
runtime/dev/
├── run-dev.sh               # Launch script
├── tauri.conf.json         # Tauri dev config
├── .env.development        # Environment variables
├── README.md               # This file
└── logs/                   # Generated logs
    ├── vite.log            # Vite dev server logs
    └── tauri.log           # Tauri runtime logs
```

---

## 🔗 RELATED DOCUMENTATION

- **Git Workflow**: See `scripts/git/README.md`
- **Stable Runtime**: See `runtime/stable/README.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Testing Guide**: See `docs/TESTING.md` (coming soon)

---

## 💡 TIPS & TRICKS

### Fast Iteration

```bash
# Terminal 1: Watch logs
tail -f runtime/dev/logs/*.log | grep "ERROR\|WARN"

# Terminal 2: Run tests on change
npm test -- --watch

# Terminal 3: Titan-Dev running
./runtime/dev/run-dev.sh
```

### Debug Rust Changes

```bash
# Edit Rust code in src-tauri/

# Stop dev server (Ctrl+C)

# Rebuild + restart
./runtime/dev/run-dev.sh
```

### Quick Reset

```bash
# Clean everything
rm -rf runtime/dev/logs/
rm -rf node_modules/.vite/
rm -rf target/debug/

# Restart fresh
./runtime/dev/run-dev.sh
```

---

## 🎓 PHILOSOPHY

**Titan-Dev** embodies the principle:

> **"Development needs freedom to break, test, and iterate. Stability comes after validation."**

**Key Principles**:

- 🟢 **Freedom**: Break things without consequences
- 🔧 **Tools**: Full debugging arsenal
- 🧪 **Testing**: Validate before merging
- 🚀 **Iteration**: Fast feedback loops

---

**Built with ❤️ by TITANE∞**

Version: 26.2.0-dev  
Runtime: Dev (Development)  
Branch: dev or feature/\*

---

🟢 **Titan-Dev** = Safe experimentation zone  
🔵 **Titan-Stable** = Production user experience

**Develop freely. Validate thoroughly. Deploy confidently.**
