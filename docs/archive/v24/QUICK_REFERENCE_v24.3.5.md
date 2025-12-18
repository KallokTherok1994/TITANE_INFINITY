# 🚀 QUICK REFERENCE — TITANE∞ v24.3.5

**Version**: 24.3.5  
**Date**: 16 décembre 2025  
**Type**: Guide de référence rapide pour développeurs

---

## 📋 MEMORY MANAGEMENT — CHEAT SHEET

### ✅ DO's

```typescript
// ✅ Class-managed timer
class Service {
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.update(), 1000);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// ✅ React hook cleanup
useEffect(() => {
  const timer = setInterval(() => fetch(), 1000);
  return () => clearInterval(timer);
}, []);
```

### ❌ DON'Ts

```typescript
// ❌ Module-level timer (LEAK!)
setInterval(() => update(), 1000);

// ❌ Constructor timer sans ref (LEAK!)
class Service {
  constructor() {
    setInterval(() => this.update(), 1000);
  }
}
```

---

## 🛡️ NULL SAFETY — CHEAT SHEET

### ✅ DO's

```typescript
// ✅ Early return
const [data, setData] = useState<Data | null>(null);
if (!data) return <Loading />;
return <div>{data.title}</div>;

// ✅ Conditional rendering
{data && <Component data={data} />}

// ✅ Optional chaining
<span>{status?.vault_loaded}</span>
<span>{user?.profile?.name ?? 'Anonymous'}</span>
```

### ❌ DON'Ts

```typescript
// ❌ Direct access (NPE!)
return <div>{data.title}</div>;

// ❌ Non-null assertion sans raison
return <div>{data!.title}</div>;
```

---

## ⚡ PERFORMANCE — CHEAT SHEET

### React.memo

```typescript
// Small component
const StatCard = React.memo(({ label, value }) => (
  <div>{label}: {value}</div>
));

// With custom compare
const List = React.memo(
  ({ items }) => <div>{items.map(...)}</div>,
  (prev, next) => prev.items.length === next.items.length
);
```

### useCallback

```typescript
// Callback to memoized child
const handleUpdate = useCallback((id: string) => {
  updateItem(id);
}, [updateItem]);

// In Context
const value = useMemo(() => ({
  state,
  updateItem: useCallback(...),
  deleteItem: useCallback(...)
}), [state]);
```

### useMemo

```typescript
// Expensive computation
const filtered = useMemo(() => data.filter(item => item.value > 10), [data]);

// Sorted list
const sorted = useMemo(() => [...items].sort((a, b) => a.date - b.date), [items]);
```

---

## 🧪 TESTING — SNIPPETS

### Memory Leak Test

```typescript
it('should cleanup on destroy', () => {
  const spy = vi.spyOn(global, 'clearInterval');
  service.start();
  service.destroy();
  expect(spy).toHaveBeenCalled();
});
```

### Null Safety Test

```typescript
it('should handle null data', () => {
  const { container } = render(<Component data={null} />);
  expect(container).toHaveTextContent(/loading/i);
});
```

---

## 📝 CODE REVIEW — CHECKLIST

### Quick Checks

- [ ] Timers: référence stockée ✅
- [ ] useEffect: cleanup retourné ✅
- [ ] useState<T | null>: guards présents ✅
- [ ] memo(): components fréquents ✅
- [ ] useCallback(): callbacks enfants ✅
- [ ] useMemo(): calculs coûteux ✅
- [ ] TypeScript: 0 erreurs ✅

---

## 🔧 COMMANDS

```bash
# Dev
npm run dev:tauri

# Type check
npm run type-check

# Build
npm run build
npx tauri build

# Tests
npm test
npm run test:tauri
```

---

## 📊 QUALITY METRICS

| Métrique     | Objectif | Actuel  |
| ------------ | -------- | ------- |
| Memory Leaks | 0        | ✅ 0    |
| Null Safety  | 100%     | ✅ 100% |
| Performance  | >90%     | ✅ 95%  |
| TypeScript   | 0 errors | ✅ 0    |

**Score**: ✅ **98.5%**

---

**Référence Complète**: [BEST_PRACTICES_TITANE_v24.3.5.md](./BEST_PRACTICES_TITANE_v24.3.5.md)
