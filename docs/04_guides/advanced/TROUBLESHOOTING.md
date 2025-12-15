# 🔧 TITANE∞ — Troubleshooting Guide

**Guide diagnostique complet pour résoudre les problèmes courants**

**Version:** v24.2.0  
**Mise à jour:** 15 décembre 2025

---

## 📋 Table des Matières

1. [Diagnostic Rapide](#diagnostic-rapide)
2. [Problèmes Backend (Rust/Tauri)](#problèmes-backend)
3. [Problèmes Frontend (React/TypeScript)](#problèmes-frontend)
4. [Problèmes Performance](#problèmes-performance)
5. [Problèmes AI/Memory](#problèmes-ai-memory)
6. [Problèmes Build/Deployment](#problèmes-build-deployment)
7. [Outils Diagnostic](#outils-diagnostic)

---

## 🚨 Diagnostic Rapide

### Checklist Initiale (2 minutes)

**1. Version & Environment:**
```bash
# Vérifier versions
node --version  # Requis: v20+
npm --version   # Requis: v10+
rustc --version # Requis: 1.70+

# Check package.json & Cargo.toml versions
cat package.json | grep '"version"'
cat src-tauri/Cargo.toml | grep '^version'

# Should match: v24.2.0
```

**2. Dependencies:**
```bash
# Frontend
npm install
npm outdated  # Check for updates

# Backend
cd src-tauri
cargo update
cargo check
```

**3. Clean Build:**
```bash
# Full clean rebuild
npm run clean
rm -rf node_modules dist
npm install
npm run build

cd src-tauri
cargo clean
cargo build --release
```

**4. Logs Check:**
```bash
# Dev logs (if Titan-Dev running)
tail -f runtime/dev/logs/vite.log
tail -f runtime/dev/logs/tauri.log

# Browser console (F12)
# Check for errors in Console tab
```

---

## 🦀 Problèmes Backend (Rust/Tauri)

### Erreur: "Tauri command not found"

**Symptômes:**
```
Error: Command 'conversation_generate' not found
```

**Causes:**
1. Command non enregistré dans `main.rs`
2. Typo dans nom command
3. Feature flag manquant

**Solution:**
```rust
// 1. Vérifier src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            conversation_generate,  // ✅ Ajouter ici
            // ... autres commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 2. Vérifier signature command (src-tauri/src/api/)
#[tauri::command]
pub async fn conversation_generate(
    user_input: String,
    config: ConversationConfig,
) -> Result<ConversationResponse, String> {
    // Implementation
}

// 3. Frontend appel (src/services/)
import { invoke } from '@tauri-apps/api/tauri';

const response = await invoke('conversation_generate', {
    userInput: "Hello",
    config: defaultConfig,
});
```

---

### Erreur: "Database locked"

**Symptômes:**
```
Error: SQLite database is locked
thread 'tokio-runtime-worker' panicked
```

**Causes:**
1. Multiple accès simultanés SQLite sans Arc<RwLock>
2. Transaction non fermée
3. WAL mode non activé

**Solution:**
```rust
// 1. Utiliser Arc<RwLock> pour thread-safe access
use std::sync::{Arc, RwLock};

pub struct VectorStore {
    db: Arc<RwLock<Connection>>,  // ✅ Thread-safe
}

// 2. Activer WAL mode (Write-Ahead Logging)
let conn = Connection::open("vector_store.db")?;
conn.execute("PRAGMA journal_mode=WAL", [])?;
conn.execute("PRAGMA synchronous=NORMAL", [])?;

// 3. Fermer transactions rapidement
{
    let db = self.db.write().unwrap();
    let tx = db.transaction()?;
    // ... operations
    tx.commit()?;
}  // ✅ Lock released ici
```

---

### Erreur: "Failed to build OMEGA pipeline"

**Symptômes:**
```
Error: Failed to initialize OMEGA pipeline
OllamaClient connection refused
```

**Causes:**
1. Ollama server non démarré
2. Config API keys manquantes
3. Network proxy issues

**Solution:**
```bash
# 1. Vérifier Ollama running
systemctl status ollama
# OU
curl http://localhost:11434/api/tags

# Si non running:
systemctl start ollama
# OU
ollama serve

# 2. Vérifier API keys (.env)
cat .env | grep API_KEY

# Ajouter si manquant:
echo "OPENAI_API_KEY=sk-..." >> .env
echo "ANTHROPIC_API_KEY=..." >> .env

# 3. Test manuel OMEGA
cd src-tauri
cargo test omega::test_pipeline_basic_flow -- --nocapture
```

---

### Memory Leak (Rust)

**Symptômes:**
```
Memory usage increasing over time
RSS: 500MB → 2GB after 1h
```

**Diagnostic:**
```bash
# 1. Profiling avec Valgrind
cargo build
valgrind --leak-check=full --show-leak-kinds=all \
    target/debug/titane-infinity

# 2. Heap profiling
cargo install cargo-profdata
cargo profdata -- run

# 3. Check common leaks
grep -r "forget\|leak" src-tauri/src/
```

**Solutions courantes:**
```rust
// ❌ MAUVAIS: Arc loop (circular reference)
struct Node {
    next: Arc<Node>,  // Leak!
}

// ✅ BON: Weak reference
use std::sync::Weak;
struct Node {
    next: Weak<Node>,  // No leak
}

// ❌ MAUVAIS: Channel receiver jamais consommé
let (tx, rx) = mpsc::channel();
tx.send(data).unwrap();
// rx jamais read → leak

// ✅ BON: Toujours consommer
tokio::spawn(async move {
    while let Some(msg) = rx.recv().await {
        // Process msg
    }
});
```

---

## ⚛️ Problèmes Frontend (React/TypeScript)

### Erreur: "Hydration mismatch"

**Symptômes:**
```
Warning: Text content did not match. Server: "..." Client: "..."
Hydration failed because initial UI does not match server-rendered
```

**Causes:**
1. Date.now() ou random() dans render
2. localStorage usage pendant SSR
3. useEffect side effects dans render

**Solution:**
```typescript
// ❌ MAUVAIS
const ChatMessage = () => {
  const timestamp = Date.now();  // ❌ Différent server vs client
  return <div>{timestamp}</div>;
};

// ✅ BON
const ChatMessage = () => {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  
  useEffect(() => {
    setTimestamp(Date.now());  // ✅ Client-only
  }, []);
  
  if (timestamp === null) return <div>Loading...</div>;
  return <div>{timestamp}</div>;
};

// ❌ MAUVAIS: localStorage pendant render
const theme = localStorage.getItem('theme');  // ❌ SSR crash

// ✅ BON: useEffect
const [theme, setTheme] = useState('light');

useEffect(() => {
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
}, []);
```

---

### Performance: Re-renders excessifs

**Symptômes:**
```
React DevTools Profiler: Component renders 50+ times/s
UI lag, input delay
```

**Diagnostic:**
```typescript
// Installer React DevTools Profiler
// F12 → Profiler tab → Record → Stop après 10s
// Chercher components avec high render count

// OU console.log
useEffect(() => {
  console.log('ChatWindow rendered');
});
```

**Solutions:**
```typescript
// ❌ MAUVAIS: Inline object prop
<ChatWindow config={{ theme: 'dark' }} />
// Crée nouveau object chaque render → re-render enfant

// ✅ BON: useMemo
const config = useMemo(() => ({ theme: 'dark' }), []);
<ChatWindow config={config} />

// ❌ MAUVAIS: Inline callback
<Button onClick={() => handleClick(id)} />
// Nouvelle fonction chaque render

// ✅ BON: useCallback
const handleClick = useCallback((id: string) => {
  // Logic
}, []);

// ❌ MAUVAIS: State dans parent pour child
const [input, setInput] = useState('');
<InputField value={input} onChange={setInput} />
// Parent re-render à chaque keystroke

// ✅ BON: State local child + debounce
const InputField = () => {
  const [local, setLocal] = useState('');
  
  const debouncedUpdate = useDebouncedCallback((value) => {
    onGlobalChange(value);  // Parent update avec debounce
  }, 300);
  
  return <input 
    value={local} 
    onChange={e => {
      setLocal(e.target.value);
      debouncedUpdate(e.target.value);
    }} 
  />;
};
```

---

### Erreur: "Tauri invoke failed"

**Symptômes:**
```typescript
Error: failed to invoke Tauri command
TypeError: Cannot read property 'invoke' of undefined
```

**Causes:**
1. Tauri context non initialisé (dev vs production)
2. Command typo
3. Security CSP block

**Solution:**
```typescript
// 1. Check Tauri context
import { invoke } from '@tauri-apps/api/tauri';

// Wrap dans try-catch
try {
  const result = await invoke('command_name', { arg: value });
} catch (error) {
  console.error('Tauri invoke failed:', error);
  // Fallback logic
}

// 2. Dev vs Prod detection
const isTauri = '__TAURI__' in window;

if (isTauri) {
  // Use Tauri invoke
  await invoke('get_memory');
} else {
  // Fallback pour browser dev
  const mockData = { /* ... */ };
  return mockData;
}

// 3. Vérifier CSP (tauri.conf.json)
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'"
    }
  }
}
```

---

## ⚡ Problèmes Performance

### OMEGA Pipeline Lent (>500ms)

**Symptômes:**
```
AI response latency: 800-1500ms (target <100ms)
```

**Diagnostic:**
```bash
# 1. Profiling Rust
cd src-tauri
cargo bench omega_benchmark

# 2. Logs timing
RUST_LOG=debug cargo run 2>&1 | grep "OMEGA"

# 3. Flame graph
cargo install flamegraph
cargo flamegraph --bin titane-infinity
```

**Optimizations:**
```rust
// 1. Cache embeddings
use lru::LruCache;
static EMBEDDING_CACHE: Lazy<Arc<Mutex<LruCache<String, Vec<f32>>>>> = 
    Lazy::new(|| Arc::new(Mutex::new(LruCache::new(1000))));

pub async fn embed_query(text: &str) -> Vec<f32> {
    // Check cache first
    if let Some(cached) = EMBEDDING_CACHE.lock().unwrap().get(text) {
        return cached.clone();  // ~1ms instead of 50ms
    }
    
    // Call AI model
    let embedding = ai_model.embed(text).await;
    EMBEDDING_CACHE.lock().unwrap().put(text.to_string(), embedding.clone());
    embedding
}

// 2. Paralléliser stages OMEGA
use tokio::join;

let (stage1, stage2, stage3) = join!(
    run_stage_1(input),
    run_stage_2(input),  // Parallel si indépendants
    run_stage_3(input),
);

// 3. Reduce allocations
// ❌ MAUVAIS
let mut result = Vec::new();
for item in items {
    result.push(process(item));  // Réallocations
}

// ✅ BON
let mut result = Vec::with_capacity(items.len());  // Pre-allocate
for item in items {
    result.push(process(item));
}
```

---

### FPS Bas (<30 FPS)

**Symptômes:**
```
React Profiler: Frame time >30ms
UI animations laggy
```

**Diagnostic:**
```typescript
// 1. Performance API
const start = performance.now();
// ... render logic
const end = performance.now();
console.log(`Render time: ${end - start}ms`);

// 2. React DevTools Profiler
// Flame graph mode → chercher hot components

// 3. Chrome DevTools Performance
// F12 → Performance → Record → Stop
```

**Optimizations:**
```typescript
// 1. Virtual scrolling (grandes listes)
import { FixedSizeList } from 'react-window';

const MessageList = ({ messages }) => (
  <FixedSizeList
    height={600}
    itemCount={messages.length}
    itemSize={80}
  >
    {({ index, style }) => (
      <div style={style}>
        <Message data={messages[index]} />
      </div>
    )}
  </FixedSizeList>
);

// 2. React.memo pour components purs
const Message = React.memo(({ content, timestamp }) => (
  <div className="message">
    <p>{content}</p>
    <span>{timestamp}</span>
  </div>
), (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.content === nextProps.content &&
         prevProps.timestamp === nextProps.timestamp;
});

// 3. Code splitting
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<Loading />}>
    <HeavyComponent />
  </Suspense>
);
```

---

## 🧠 Problèmes AI/Memory

### Memory Recall Vide

**Symptômes:**
```
UnifiedMemory.recall() returns []
Expected: Previous conversation context
```

**Diagnostic:**
```bash
# 1. Check SQLite database
sqlite3 ~/.local/share/titane-infinity/memory.db
.tables
SELECT COUNT(*) FROM stm_entries;
SELECT COUNT(*) FROM mtm_entries;
SELECT COUNT(*) FROM ltm_entries;

# 2. Check vector store
SELECT COUNT(*) FROM vector_entries;

# 3. Test insertion manuelle
INSERT INTO stm_entries (id, content, timestamp, metadata)
VALUES ('test-1', 'Hello world', 1702684800, '{}');
```

**Solutions:**
```rust
// 1. Vérifier initialization
let memory = UnifiedMemory::new(config).await?;
memory.init().await?;  // ✅ Créer tables si manquantes

// 2. Check retention policies
// STM: 5 min, MTM: 24h, LTM: permanent
// Si recall vide, peut-être expiration

// 3. Force persistence
memory.store(entry).await?;
memory.sync().await?;  // ✅ Force flush to disk

// 4. Check filters
let results = memory.recall(RecallOptions {
    tier: Some(MemoryTier::ShortTerm),  // ✅ Specify tier
    limit: 50,
    threshold: 0.5,  // ✅ Lower threshold si peu results
    ..Default::default()
}).await?;
```

---

### AI Response Incohérent

**Symptômes:**
```
AI génère réponses hors contexte
Hallucinations fréquentes
```

**Diagnostic:**
```typescript
// 1. Vérifier context envoyé
console.log('Context sent to AI:', context);

// 2. Vérifier memory recall
const memory = await unifiedMemory.recall({ limit: 10 });
console.log('Memory recalled:', memory);

// 3. Test AI direct (sans memory)
const response = await invoke('conversation_generate', {
    userInput: "Hello",
    config: { memory: false },  // Disable memory
});
```

**Solutions:**
```typescript
// 1. Améliorer context building
const buildContext = async (userInput: string) => {
  // Semantic memory (vector search)
  const semantic = await vectorStore.search(userInput, 5);
  
  // Recent history (STM)
  const recent = await memory.recall({ 
    tier: 'SHORT_TERM', 
    limit: 10 
  });
  
  // Combine avec weights
  const context = [
    ...semantic.map(r => ({ ...r, weight: 0.7 })),  // 70% semantic
    ...recent.map(r => ({ ...r, weight: 0.3 })),    // 30% recency
  ].sort((a, b) => b.weight - a.weight);
  
  return context.slice(0, 10);  // Top 10
};

// 2. Re-ranking results
import { rerank } from '@/services/semantic/reranker';

const ranked = await rerank(userInput, candidates);

// 3. Validate AI response
const validateResponse = (response: string) => {
  // Check hallucination markers
  if (response.includes('[UNCERTAIN]')) {
    return { valid: false, reason: 'Model uncertain' };
  }
  
  // Check context adherence (similarity)
  const similarity = cosineSimilarity(
    embedResponse(response),
    embedContext(context)
  );
  
  if (similarity < 0.5) {
    return { valid: false, reason: 'Response off-topic' };
  }
  
  return { valid: true };
};
```

---

## 🏗️ Problèmes Build/Deployment

### Build Fail: "Out of memory"

**Symptômes:**
```
FATAL ERROR: Reached heap limit Allocation failed
JavaScript heap out of memory
```

**Solution:**
```bash
# 1. Augmenter heap size Node.js
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build

# 2. Build en mode production (optimisé)
npm run build --mode production

# 3. Disable source maps (si pas besoin debug)
# vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false,  // Save memory
  }
});

# 4. Build progressif
npm run build:frontend
npm run build:backend
```

---

### Tauri Build Fail: "linker error"

**Symptômes:**
```
error: linking with `cc` failed
/usr/bin/ld: cannot find -lwebkit2gtk-4.0
```

**Solution:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install \
    libwebkit2gtk-4.0-dev \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install \
    webkit2gtk4.0-devel \
    openssl-devel \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel

# Arch
sudo pacman -S \
    webkit2gtk \
    openssl \
    gtk3 \
    libappindicator-gtk3 \
    librsvg

# Vérifier après install
cargo build --release
```

---

## 🛠️ Outils Diagnostic

### Backend (Rust)

**1. Logging:**
```bash
# Activer logs debug
RUST_LOG=debug cargo run

# Logs spécifiques module
RUST_LOG=omega=debug,memory=trace cargo run

# Logs dans fichier
RUST_LOG=debug cargo run 2>&1 | tee logs/debug.log
```

**2. Profiling:**
```bash
# CPU profiling
cargo install flamegraph
cargo flamegraph --bin titane-infinity

# Memory profiling
cargo install cargo-profdata
cargo profdata -- run

# Benchmarks
cargo bench
```

**3. Testing:**
```bash
# Run all tests
cargo test

# Test specific module avec output
cargo test omega:: -- --nocapture

# Test un seul test
cargo test test_pipeline_basic_flow

# Coverage
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

---

### Frontend (TypeScript)

**1. React DevTools:**
```
F12 → Components tab
- Inspect component tree
- View props/state
- Trace renders

F12 → Profiler tab
- Record render performance
- Flame graph analysis
- Ranked components
```

**2. Chrome Performance:**
```
F12 → Performance tab
- Record → Interact → Stop
- Analyze frame time
- Check long tasks (>50ms)
- Memory snapshots
```

**3. Bundle Analysis:**
```bash
# Visualize bundle size
npm run build
npx vite-bundle-analyzer dist

# Check dependencies size
npx depcheck
npm ls --depth=0
```

---

## 📊 Monitoring Production

### Health Checks

**Backend:**
```bash
# System health API
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "cpu": 45.2,
  "memory": 512,
  "uptime": 86400,
  "services": {
    "omega": "ok",
    "memory": "ok",
    "singularity": "ok"
  }
}
```

**Frontend:**
```typescript
// Performance monitoring
const perfMonitor = new PerformanceEngine();
perfMonitor.start();

setInterval(() => {
  const snapshot = perfMonitor.getLatestSnapshot();
  
  if (snapshot.fps < 30) {
    console.warn('Low FPS detected:', snapshot);
    // Auto-heal: reduce animations
  }
  
  if (snapshot.memory > 1000) {
    console.warn('High memory usage:', snapshot);
    // Auto-heal: clear caches
  }
}, 1000);
```

---

## 🚨 Emergency Recovery

### Application Crash

**1. Logs:**
```bash
# Check crash logs
tail -100 ~/.local/share/titane-infinity/crash.log

# System logs
journalctl -u titane-infinity -n 100
```

**2. Reset State:**
```bash
# Reset app state (WARNING: deletes data)
rm -rf ~/.local/share/titane-infinity/state.db
rm -rf ~/.config/titane-infinity/config.json

# Restart app (will recreate defaults)
./titane-infinity
```

**3. Safe Mode:**
```bash
# Launch sans AI/Memory modules
./titane-infinity --safe-mode

# Launch avec logs verbose
./titane-infinity --verbose --log-file=debug.log
```

---

## 📞 Support Escalation

**Si problème persiste après troubleshooting:**

1. **GitHub Issue** — [Create issue](https://github.com/KallokTherok1994/TITANE_INFINITY/issues/new)
   - Template: Bug report
   - Inclure: OS, version, logs, steps to reproduce

2. **Discussions** — [Discussions forum](https://github.com/KallokTherok1994/TITANE_INFINITY/discussions)
   - Questions générales
   - Community help

3. **Email Support** — dev@titane-infinity.ai (fictif)
   - Pour bugs critiques production

---

**Document généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Team

---

_Troubleshooting Guide — Resolve Issues Fast_ 🔧✨
