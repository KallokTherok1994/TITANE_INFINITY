# DevTools Log Levels — Runtime Configuration Guide

**Feature:** Phase 4 (Week 6) - DevTools log levels (LOG_LEVEL)  
**Version:** v26.2.0  
**Date:** 2025-12-20

---

## 🎯 Overview

TITANE∞ now supports **runtime log level configuration** via multiple methods:

1. **Environment Variables** (build-time configuration)
2. **localStorage** (persistent user preference)
3. **Runtime API** (DevTools console control)

This enables developers to:
- Control log verbosity without rebuilding
- Filter noisy modules
- Debug specific components
- Optimize performance in production

---

## 📊 Log Levels

| Level | Purpose | Default In | Includes |
|-------|---------|------------|----------|
| **TRACE** | Very verbose debugging | Dev only | All logs + performance traces |
| **DEBUG** | Development debugging | Dev mode | Debug + Info + Warn + Error + Fatal |
| **INFO** | General information | Production | Info + Warn + Error + Fatal |
| **WARN** | Warnings only | — | Warn + Error + Fatal |
| **ERROR** | Errors only | — | Error + Fatal |
| **FATAL** | Critical errors only | — | Fatal only |
| **SILENT** | No logs | — | Nothing (effectively silent) |

**Default Behavior:**
- **Development:** `DEBUG` (see all debug info)
- **Production:** `INFO` (general information + warnings + errors)

---

## 🔧 Configuration Methods

### Method 1: Environment Variables (Build-Time)

Set log level at build time via `.env` files:

```bash
# .env.development
VITE_LOG_LEVEL=DEBUG

# .env.production
VITE_LOG_LEVEL=INFO
```

**Use Case:** Set different verbosity for dev vs production builds.

---

### Method 2: localStorage (Persistent User Preference)

Log level is automatically saved to `localStorage` and restored on page reload.

```javascript
// Set once, persists across sessions
window.__TITANE_LOG__.level = 'TRACE'

// Reload page - setting is preserved ✅
```

**Use Case:** Developer wants specific verbosity for their workflow.

---

### Method 3: Runtime API (DevTools Console)

Control logging dynamically via browser DevTools console:

```javascript
// ═══════════════════════════════════════════════════════════
// GLOBAL LOG LEVEL
// ═══════════════════════════════════════════════════════════

// Set global level (affects all modules)
window.__TITANE_LOG__.level = 'DEBUG'
window.__TITANE_LOG__.level = 'TRACE'  // Very verbose
window.__TITANE_LOG__.level = 'SILENT' // No logs

// Get current level
window.__TITANE_LOG__.level
// => 'DEBUG'


// ═══════════════════════════════════════════════════════════
// MODULE-SPECIFIC LOG LEVELS
// ═══════════════════════════════════════════════════════════

// Enable TRACE for specific module (very detailed debugging)
window.__TITANE_LOG__.setModule('ChatEngine', 'TRACE')
window.__TITANE_LOG__.setModule('MemoryEngine', 'DEBUG')

// Silence noisy module
window.__TITANE_LOG__.setModule('PerformanceMonitor', 'WARN')

// Reset module to use global level
window.__TITANE_LOG__.resetModule('ChatEngine')


// ═══════════════════════════════════════════════════════════
// EXCLUDE / FORCE MODULES
// ═══════════════════════════════════════════════════════════

// Completely exclude module from logging
window.__TITANE_LOG__.exclude('NoiseLogger')

// Force module to always log (ignore global level)
window.__TITANE_LOG__.force('SecurityEngine')


// ═══════════════════════════════════════════════════════════
// VIEW CONFIGURATION
// ═══════════════════════════════════════════════════════════

// View current configuration
window.__TITANE_LOG__.config
// => {
//   global: 'DEBUG',
//   modules: {
//     'ChatEngine': 'TRACE',
//     'MemoryEngine': 'DEBUG'
//   },
//   excluded: ['NoiseLogger'],
//   forced: ['SecurityEngine']
// }


// ═══════════════════════════════════════════════════════════
// RESET TO DEFAULTS
// ═══════════════════════════════════════════════════════════

// Reset to default configuration
window.__TITANE_LOG__.reset()
```

**Use Case:** Quick debugging without page reload or code changes.

---

## 🎓 Usage Examples

### Example 1: Debug Specific Feature

You're working on the Chat IA feature and want verbose logging only for chat-related modules:

```javascript
// Set global level to INFO (reduce noise)
window.__TITANE_LOG__.level = 'INFO'

// Enable TRACE for chat modules
window.__TITANE_LOG__.setModule('ChatEngine', 'TRACE')
window.__TITANE_LOG__.setModule('ChatErrorBoundary', 'TRACE')
window.__TITANE_LOG__.setModule('autoHealEngine', 'DEBUG')

// Now only chat modules log verbosely ✅
```

---

### Example 2: Production Debugging

An error occurs in production. Enable verbose logging temporarily:

```javascript
// Before: Production (INFO level)
// => Only general info logs

// Enable DEBUG temporarily
window.__TITANE_LOG__.level = 'DEBUG'

// Reproduce issue - see debug logs ✅

// Reload page - reverts to INFO ✅ (not persisted)
```

---

### Example 3: Performance Optimization

Too many logs impacting performance:

```javascript
// Silence noisy modules
window.__TITANE_LOG__.setModule('PerformanceMonitor', 'ERROR')
window.__TITANE_LOG__.setModule('MetricsCollector', 'WARN')
window.__TITANE_LOG__.exclude('AnimationLoop')

// Performance improved ✅
```

---

## 🧑‍💻 Code Integration

### For Module Authors

When creating a new module, use the logger with your module name:

```typescript
import { createLogger } from '@/utils/logger';

const logger = createLogger('MyModule');

export class MyModule {
  doSomething() {
    logger.trace('Entering doSomething()'); // TRACE level
    logger.debug('Processing item', { item });  // DEBUG level
    logger.info('Operation completed');        // INFO level
    logger.warn('Deprecated API used');        // WARN level
    logger.error('Operation failed', error);   // ERROR level
    logger.fatal('Critical failure', error);   // FATAL level
  }
}
```

**Module Name Best Practices:**
- Use PascalCase: `ChatEngine`, `MemoryEngine`, `StyleEngine`
- Be specific: `ChatErrorBoundary` (not just `ErrorBoundary`)
- Match class/file name when possible

---

### Performance Optimization

For expensive debug operations, check if logging is enabled first:

```typescript
import { logLevelManager } from '@/config/logLevelConfig';
import { createLogger, LogLevel } from '@/utils/logger';

const logger = createLogger('ExpensiveModule');

function processData() {
  // Check before expensive operation
  if (logLevelManager.shouldLog('ExpensiveModule', LogLevel.DEBUG)) {
    const debugData = computeExpensiveDebugData(); // Only compute if needed
    logger.debug('Debug data', debugData);
  }

  // Regular logging (logger handles check internally)
  logger.info('Processing complete');
}
```

**Why?** Avoids computing debug data when it won't be logged.

---

## 🔍 Troubleshooting

### Issue: Logs not appearing

**Solution 1:** Check log level
```javascript
window.__TITANE_LOG__.level
// If 'INFO' or higher, DEBUG/TRACE won't show
```

**Solution 2:** Check module exclusions
```javascript
window.__TITANE_LOG__.config
// Check 'excluded' array
```

**Solution 3:** Reset to defaults
```javascript
window.__TITANE_LOG__.reset()
```

---

### Issue: Too many logs

**Solution 1:** Increase global level
```javascript
window.__TITANE_LOG__.level = 'WARN' // Only warnings and errors
```

**Solution 2:** Exclude noisy modules
```javascript
window.__TITANE_LOG__.exclude('NoisyModule')
```

---

### Issue: localStorage not persisting

**Check:** Browser privacy settings may block localStorage.

**Workaround:** Use runtime API on each page load (add to bookmark):
```javascript
javascript:(function(){window.__TITANE_LOG__.level='DEBUG';})()
```

---

## 📁 Files Modified

### New Files
- `src/config/logLevelConfig.ts` — Runtime log level manager
- `docs/guides/DEVTOOLS_LOG_LEVELS.md` — This documentation

### Modified Files
- `src/utils/logger.ts` — Integrated with runtime log level manager
- `.env.example` — Added VITE_LOG_LEVEL configuration

---

## 🎯 Benefits

✅ **No Rebuild Required** — Change log levels without recompiling  
✅ **Module-Specific Control** — Debug specific components  
✅ **Performance Optimization** — Reduce log overhead in production  
✅ **Persistent Preferences** — User settings saved automatically  
✅ **Easy Debugging** — Quick verbosity adjustment via DevTools  
✅ **Production-Safe** — Defaults to INFO level in production builds

---

## 🚀 Next Steps

Recommended improvements:

1. **UI Control Panel** — Add visual log level selector in DevTools panel
2. **Log Filtering** — Add text search/filter in console output
3. **Log Export** — Enable downloading logs for bug reports
4. **Remote Logging** — Send logs to backend for monitoring

---

## 📖 Related Documentation

- [Logger Utilities](/src/utils/logger.ts) — Core logger implementation
- [OMEGA Pipeline](/docs/guides/OMEGA_PIPELINE_v2.md) — Pipeline logging patterns
- [Contributing Guide](/CONTRIBUTING.md) — Code style and logging best practices

---

**TITANE∞ v26.2.0** — _Your Cognitive Operating System_
