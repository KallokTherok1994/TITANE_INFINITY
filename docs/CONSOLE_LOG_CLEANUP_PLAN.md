# TITANE∞ - Console.log Cleanup Strategy

## 📊 Current State Analysis

**Total console.log occurrences: 2,851**

### Distribution by Directory:
- **Hooks:** 201 (79 cleaned ✅)
- **Services:** 294 (highest priority 🔴)
- **Modules:** 226
- **Engines:** ~120
- **Components:** ~300
- **Features:** ~200
- **Other:** ~1,510

## 🎯 Priority Strategy

### Phase 1: Critical Services (In Progress)
**Target:** 294 occurrences in /src/services

**Top Priority Files:**
1. `hybridTTS.ts` - 49 occurrences
2. `tauriAutoRepair.ts` - 32 occurrences
3. `UnifiedMemory.ts` - 32 occurrences
4. `audioStreaming.ts` - 16 occurrences
5. `advisorEngine.ts` - 16 occurrences
6. `selfHealingSyncLayer.ts` - 15 occurrences
7. `audioHealthCheck.ts` - 14 occurrences
8. `ttsEngineService.ts` - 14 occurrences

**Strategy:**
- Replace console.log → logger.debug
- Replace console.warn → logger.warn
- Replace console.error → logger.error
- Add centralized logger import

### Phase 2: Modules
**Target:** 226 occurrences in /src/modules

**Top Priority:**
1. LiveDebugger - 26 occurrences
2. Avatar floating - 20 occurrences
3. ServiceWorkerManager - 18 occurrences
4. TalkToTitane engines - ~50 occurrences

### Phase 3: Engines
**Target:** ~120 occurrences in /src/engines

**Focus:**
- Time engines (ChatScheduler, TimeEngine, AgendaEngine)
- Aura engines
- Spatial/Holophonic engines
- Meta engines

### Phase 4: Components & Features
**Target:** ~500 occurrences

**Approach:** Automated script + manual review

## 🛠️ Migration Pattern

```typescript
// BEFORE
console.log('[ServiceName] Action completed', data);
console.error('[ServiceName] Error:', error);

// AFTER
import { createLogger } from '@/utils/logger';
const logger = createLogger('ServiceName');

logger.debug('Action completed', { data });
logger.error('Error', { error });
```

## ✅ Benefits

1. **Production Safety:** Logs auto-disabled in production
2. **Performance:** Zero-cost abstractions when disabled
3. **Consistency:** Standardized format across codebase
4. **Control:** Runtime log level configuration
5. **Traceability:** Automatic timestamps and prefixes

## 📈 Progress Tracking

- [x] Phase 0: Hooks cleanup (79/280 cleaned)
- [ ] Phase 1: Services cleanup (0/294)
- [ ] Phase 2: Modules cleanup (0/226)
- [ ] Phase 3: Engines cleanup (0/120)
- [ ] Phase 4: Components cleanup (0/500)

**Target:** Reduce from 2,851 to <200 critical logs only

## 🔧 Automation Script

Location: `/scripts/cleanup-console-logs.sh`

Usage:
```bash
./scripts/cleanup-console-logs.sh
```

## 🎯 Success Metrics

- Build: ✅ SUCCESS
- Tests: ✅ 151/151 PASSING
- TypeScript: ✅ 0 errors
- Console.log: 2,851 → Target <200
