# 🔥 SUPER PROMPT #7 — TITANE∞ PERFORMANCE AUDIT & FIX

**Audit complet de performance + optimisations**

---

## 📋 Métadonnées

- **Priorité** : 🟡 P2
- **Complexité** : ⭐⭐⭐⭐
- **Durée estimée** : 2-4h
- **Dépendances** : Tous les prompts précédents
- **Output** : App ultra-performante + Benchmarks
- **Outils** : GitHub Copilot Chat + VS Code

---

## 🎯 Objectif

**Optimiser les performances** de TITANE∞ pour atteindre :
- ⚡ Startup < 2s
- ⚡ TTI (Time To Interactive) < 1.2s
- ⚡ Latence API < 100ms
- ⚡ Utilisation mémoire < 512MB

---

## 🚀 Super Prompt

````markdown
@workspace

Tu es expert Performance Engineering sur **TITANE_INFINITY**.

Ton rôle : **auditer et OPTIMISER les performances** (frontend + backend).

---

## 1. AUDIT PERFORMANCE

Génère : `docs/performance/PERFORMANCE_AUDIT_REPORT.md`

Métriques à mesurer :
- Startup time (cold/warm)
- TTI (Time To Interactive)
- Latence API moyenne
- Bundle size frontend
- Utilisation mémoire (idle/active)
- CPU usage
- Temps de build

---

## 2. OPTIMISATIONS FRONTEND

### 2.1. Code Splitting

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const DevTools = lazy(() => import('./apps/devtools'));
const Settings = lazy(() => import('./apps/settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DevTools />
    </Suspense>
  );
}
```

### 2.2. Optimisation Images

```bash
# Installer imagemin
npm install --save-dev imagemin-cli imagemin-webp

# Optimiser toutes les images
imagemin src/assets/*.{jpg,png} --out-dir=dist/assets --plugin=webp
```

### 2.3. Tree Shaking

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
        }
      }
    }
  }
}
```

---

## 3. OPTIMISATIONS BACKEND

### 3.1. Profiling Rust

```bash
# Installer flamegraph
cargo install flamegraph

# Profiler l'app
cargo flamegraph --bin titane-infinity

# Analyser le flamegraph.svg
```

### 3.2. Optimisations Cargo.toml

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### 3.3. Async batching

```rust
use tokio::time::{sleep, Duration};

pub struct BatchProcessor<T> {
    batch: Arc<Mutex<Vec<T>>>,
    max_size: usize,
}

impl<T> BatchProcessor<T> {
    pub async fn add(&self, item: T) {
        let mut batch = self.batch.lock().await;
        batch.push(item);

        if batch.len() >= self.max_size {
            self.flush().await;
        }
    }

    async fn flush(&self) {
        // Process batch
    }
}
```

---

## 4. OPTIMISATIONS MÉMOIRE

### 4.1. Pool d'objets

```rust
use object_pool::Pool;

lazy_static! {
    static ref BUFFER_POOL: Pool<Vec<u8>> = Pool::new(32, || {
        Vec::with_capacity(1024)
    });
}

pub async fn process_with_pool() {
    let mut buffer = BUFFER_POOL.pull();
    // Use buffer
    buffer.clear(); // Réutilisable
}
```

### 4.2. Éviter les clones inutiles

```rust
// AVANT (bad)
pub fn process(data: String) -> String {
    let clone = data.clone();
    // ...
}

// APRÈS (good)
pub fn process(data: &str) -> String {
    // ...
}
```

---

## 5. CACHING MULTI-NIVEAUX

```rust
pub struct MultiLevelCache<T> {
    l1: Arc<Mutex<LruCache<String, T>>>,      // RAM rapide
    l2: Arc<Mutex<HashMap<String, T>>>,       // RAM plus lente
    l3: Option<Arc<dyn PersistentStore<T>>>,  // Disque
}

impl<T: Clone> MultiLevelCache<T> {
    pub async fn get(&self, key: &str) -> Option<T> {
        // L1
        if let Some(val) = self.l1.lock().await.get(key) {
            return Some(val.clone());
        }

        // L2
        if let Some(val) = self.l2.lock().await.get(key) {
            self.l1.lock().await.put(key.to_string(), val.clone());
            return Some(val.clone());
        }

        // L3
        if let Some(store) = &self.l3 {
            if let Some(val) = store.get(key).await {
                self.l2.lock().await.insert(key.to_string(), val.clone());
                self.l1.lock().await.put(key.to_string(), val.clone());
                return Some(val);
            }
        }

        None
    }
}
```

---

## 6. BENCHMARKS

### 6.1. Criterion benchmarks

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_process_message(c: &mut Criterion) {
    c.bench_function("process_message", |b| {
        b.iter(|| {
            process_message(black_box("test message"))
        });
    });
}

criterion_group!(benches, bench_process_message);
criterion_main!(benches);
```

### 6.2. Lighthouse CI (frontend)

```bash
npm install -g @lhci/cli

# Audit
lhci autorun --config=lighthouserc.json
```

---

## 7. OUTPUT ATTENDU

1. `docs/performance/PERFORMANCE_AUDIT_REPORT.md`
2. Flamegraph backend (avant/après)
3. Bundle frontend < 500KB
4. Code splitting actif
5. Multi-level cache implémenté
6. Benchmarks Criterion (Rust)
7. Lighthouse score > 90 (frontend)
8. Métriques finales :
   - Startup < 2s
   - TTI < 1.2s
   - API latency < 100ms
   - Memory < 512MB

Commence par l'audit puis optimisations critiques.
````

---

## ✅ Checklist

- [ ] Audit performance complet
- [ ] Code splitting frontend
- [ ] Bundle < 500KB
- [ ] Profiling Rust (flamegraph)
- [ ] Optimisations Cargo release
- [ ] Multi-level cache
- [ ] Benchmarks < 100ms
- [ ] Lighthouse > 90
- [ ] Objectifs de perf atteints

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-09
