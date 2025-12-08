# TITANE∞ Migration Guide: v19.5 → v19.6

## Overview

This guide covers the migration from the 14-engine architecture to the unified 9-engine system.

---

## Breaking Changes

### 1. Engine Consolidation

#### Before (14 engines)
```typescript
// Old imports
import { NexusEngine } from '@/engines/nexus';
import { ConsistencyEngine } from '@/engines/consistency';
import { HeliosEngine } from '@/engines/helios';
import { HarmoniaEngine } from '@/engines/harmonia';
import { SentinelEngine } from '@/engines/sentinel';
```

#### After (9 engines)
```typescript
// New imports
import { CoherenceEngine } from '@/core/modules/coherence';
import { SystemHealth } from '@/core/modules/system_health';
import { UnifiedMemory } from '@/core/modules/unified_memory';
```

### 2. IPC Command Changes

#### State Queries
```typescript
// Old
await invoke('get_helios_state');
await invoke('get_nexus_state');
await invoke('engine_get_sentinel_state');

// New
await invoke('health_get_state');     // Replaces helios + sentinel
await invoke('coherence_get_state');  // Replaces nexus
await invoke('memory_get_state');     // Replaces memory modules
```

#### Batch Requests (New)
```typescript
// New: Get all dashboard state in one call
import { getDashboardState, extractData } from '@/lib/batch';

const result = await getDashboardState();
const health = extractData(result, 'health');
const memory = extractData(result, 'memory');
const coherence = extractData(result, 'coherence');
```

### 3. State Structure Changes

#### Old State Access
```typescript
const heliosState = await invoke('get_helios_state');
const nexusState = await invoke('get_nexus_state');
// Two separate calls, two different structures
```

#### New State Access
```typescript
import { useSingularityState } from '@/core/state/SingularityState';

// Unified state with consistent structure
const state = useSingularityState();
const health = state.systemHealth;
const coherence = state.coherence;
const memory = state.memory;
```

---

## Step-by-Step Migration

### Step 1: Update Imports

Replace old engine imports:

```diff
- import { NexusEngine } from '@/engines/nexus';
- import { HeliosEngine } from '@/engines/helios';
+ import { useSingularityState } from '@/core/state/SingularityState';
+ import { getDashboardState } from '@/lib/batch';
```

### Step 2: Update IPC Calls

Replace sequential calls with batch:

```diff
- const health = await invoke('get_helios_state');
- const memory = await invoke('get_memory_state');
- const coherence = await invoke('get_nexus_state');
+ const result = await getDashboardState();
+ const health = extractData(result, 'health');
+ const memory = extractData(result, 'memory');
+ const coherence = extractData(result, 'coherence');
```

### Step 3: Update Components

Replace direct engine access with hooks:

```diff
function HealthDisplay() {
-  const [health, setHealth] = useState(null);
-  useEffect(() => {
-    invoke('get_helios_state').then(setHealth);
-  }, []);
+  const health = useSingularityState(s => s.systemHealth);

  return <div>{health?.global_health}</div>;
}
```

### Step 4: Use Batch Hook (Optional)

For components needing multiple state values:

```typescript
import { useBatch } from '@/lib/batch';

function Dashboard() {
  const { data, loading, executeDashboard } = useBatch();

  useEffect(() => {
    executeDashboard();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <HealthCard data={data?.health} />
      <MemoryCard data={data?.memory} />
      <CoherenceCard data={data?.coherence} />
    </div>
  );
}
```

---

## API Reference Changes

### Removed Commands
| Old Command | Replacement |
|-------------|-------------|
| `get_helios_state` | `health_get_state` |
| `get_helios_metrics` | `health_get_state` |
| `get_nexus_state` | `coherence_get_state` |
| `validate_nexus` | `coherence_check_system` |
| `engine_get_sentinel_state` | `health_get_state` |
| `get_memory_state` | `memory_get_state` |

### New Commands
| Command | Description |
|---------|-------------|
| `batch_execute` | Execute multiple commands in parallel |
| `batch_get_dashboard_state` | Get health + memory + coherence + cache |
| `batch_get_monitoring_overview` | Get health + coherence |
| `cache_invalidate_pattern` | Clear cache by prefix |
| `cache_get_metrics` | Get cache hit/miss stats |

---

## Performance Benefits

After migration, expect:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Dashboard load | ~32ms | ~8ms | **75% faster** |
| Cached queries | ~8ms | <0.03ms | **99.9% faster** |
| Initial bundle | 100% | ~60-70% | **30-40% smaller** |
| RwLock contention | High | None | **Lock-free** |

---

## Compatibility Mode

For gradual migration, legacy command aliases are available:

```rust
// These still work but are deprecated
get_helios_state → health_get_state
get_nexus_state → coherence_get_state
```

**Note:** Legacy aliases will be removed in v20.0.

---

## Troubleshooting

### Issue: "Command not found"
**Solution:** Update to new command names (see table above)

### Issue: "State structure changed"
**Solution:** Use the unified state structure:
```typescript
// Old: response.helios.cpu_usage
// New: response.cpu_usage
```

### Issue: "Multiple IPC calls slow"
**Solution:** Use batch requests:
```typescript
const result = await getDashboardState();
```

---

## Need Help?

- Architecture docs: `docs/architecture/9-engines.md`
- API reference: `docs/api/commands.md`
- Report issues: `https://github.com/titane-infinity/issues`

---

*TITANE_INFINITY v19.6.0 — Migration Guide | 14→9 Engines*
