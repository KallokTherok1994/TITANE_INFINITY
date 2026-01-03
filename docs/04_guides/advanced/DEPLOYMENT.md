# 🚀 TITANE∞ — Production Deployment Guide

**Guide complet pour déployer TITANE∞ en production**

**Version:** v24.2.0  
**Mise à jour:** 15 décembre 2025

---

## 📋 Table des Matières

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Build Optimization](#build-optimization)
4. [Security Hardening](#security-hardening)
5. [Monitoring & Observability](#monitoring--observability)
6. [Deployment Strategies](#deployment-strategies)
7. [Post-Deployment Validation](#post-deployment-validation)
8. [Scaling & Performance](#scaling--performance)

---

## ✅ Pre-Deployment Checklist

### 1. Code Quality

```bash
# Backend Rust
cd src-tauri
cargo clippy -- -D warnings
cargo fmt --check
cargo test --all
cargo bench

# Frontend TypeScript
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run test:e2e

# Security audit
pnpm audit --production
cargo audit
```

### 2. Dependencies

```bash
# Update outdated
npm outdated
cargo update --dry-run

# Remove unused
npm prune --production
cargo clean

# Lock versions
pnpm install --frozen-lockfile  # Uses package-lock.json exactly
cargo build --locked
```

### 3. Configuration

```bash
# Check production config exists
cat .env.production
cat tauri.conf.json

# Validate API keys present
grep "API_KEY" .env.production

# Check no dev credentials in prod
! grep -i "localhost" .env.production
! grep -i "development" .env.production
```

### 4. Documentation

```bash
# README updated
git diff main README.md

# CHANGELOG updated
git diff main CHANGELOG.md

# Version bump
cat package.json | grep version  # v24.2.0
cat src-tauri/Cargo.toml | grep ^version  # 24.2.0
```

---

## 🏗️ Environment Setup

### Production Variables (.env.production)

```bash
# App Config
NODE_ENV=production
VITE_APP_VERSION=24.2.0
VITE_API_URL=https://api.titane-infinity.ai

# Security
VITE_ENABLE_DEV_TOOLS=false
RUST_LOG=info,warn,error  # No debug logs

# AI Providers
OPENAI_API_KEY=sk-prod-xxx
ANTHROPIC_API_KEY=sk-ant-prod-xxx
MISTRAL_API_KEY=xxx

# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/titane
VECTOR_STORE_PATH=/var/lib/titane/vector_store.db

# Performance
MAX_WORKERS=8
CACHE_SIZE_MB=512
EMBEDDING_CACHE_SIZE=10000

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
PROMETHEUS_PORT=9090
HEALTHCHECK_INTERVAL=30
```

### System Requirements

**Minimum:**
- CPU: 4 cores (x86_64 or ARM64)
- RAM: 8 GB
- Disk: 20 GB SSD
- Network: 10 Mbps

**Recommended:**
- CPU: 8+ cores
- RAM: 16 GB
- Disk: 50 GB NVMe SSD
- Network: 100 Mbps

**OS Support:**
- ✅ Ubuntu 22.04 LTS / 24.04 LTS
- ✅ Fedora 39+
- ✅ Arch Linux (rolling)
- ✅ Windows 10/11 (x64)
- ✅ macOS 13+ (Intel/Apple Silicon)

---

## 🛠️ Build Optimization

### Frontend Build

```bash
# Production build avec optimizations
NODE_ENV=production pnpm run build

# Vite config (vite.config.ts)
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'esbuild',  // Faster than terser
    sourcemap: false,   // Disable for prod (unless Sentry)
    
    rollupOptions: {
      output: {
        // Code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tauri-vendor': ['@tauri-apps/api'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
      },
    },
    
    // Compression
    chunkSizeWarningLimit: 1000,  // 1 MB chunks max
  },
  
  esbuild: {
    drop: ['console', 'debugger'],  // Remove console.log in prod
  },
});

# Analyze bundle size
npx vite-bundle-analyzer dist
```

### Backend Build

```bash
# Rust release build avec optimizations
cd src-tauri
cargo build --release --locked

# Cargo.toml optimizations
[profile.release]
opt-level = 3           # Maximum optimization
lto = "fat"             # Link-time optimization (slower build, faster runtime)
codegen-units = 1       # Single codegen unit (better optimization)
strip = true            # Strip symbols (smaller binary)
panic = 'abort'         # Don't unwind on panic (smaller binary)

# Check binary size
ls -lh target/release/titane-infinity

# Strip additional symbols (Linux/macOS)
strip target/release/titane-infinity
```

### Tauri Bundle

```bash
# Generate production bundles
pnpm run tauri build

# tauri.conf.json
{
  "tauri": {
    "bundle": {
      "identifier": "com.titane-infinity.app",
      "version": "24.2.0",
      "active": true,
      
      "targets": ["deb", "appimage", "rpm"],  // Linux
      "targets": ["msi", "nsis"],             // Windows
      "targets": ["dmg", "app"],              // macOS
      
      "resources": [],  // No extra files in bundle
      
      "externalBin": [],  // No external binaries
      
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",  // macOS
        "icons/icon.ico"    // Windows
      ],
      
      "windows": {
        "certificateThumbprint": null,  // Sign avec cert
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      },
      
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "13.0",
        "exceptionDomain": "",
        "signingIdentity": null,  // Sign avec Apple Developer cert
        "entitlements": null
      },
      
      "linux": {
        "deb": {
          "depends": [
            "libwebkit2gtk-4.0-37",
            "libgtk-3-0",
            "libayatana-appindicator3-1"
          ]
        }
      }
    }
  }
}

# Check bundle output
ls -lh src-tauri/target/release/bundle/
```

---

## 🔒 Security Hardening

### 1. Content Security Policy (CSP)

```json
// tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": {
        "default-src": "'self'",
        "script-src": ["'self'", "'wasm-unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "data:"],
        "connect-src": [
          "'self'",
          "https://api.openai.com",
          "https://api.anthropic.com",
          "https://api.mistral.ai"
        ]
      }
    }
  }
}
```

### 2. API Keys Management

```rust
// src-tauri/src/config/secrets.rs
use std::env;

pub struct Secrets {
    openai_key: String,
    anthropic_key: String,
}

impl Secrets {
    pub fn load() -> Result<Self, String> {
        // NEVER hardcode keys
        let openai_key = env::var("OPENAI_API_KEY")
            .map_err(|_| "OPENAI_API_KEY not set")?;
        
        let anthropic_key = env::var("ANTHROPIC_API_KEY")
            .map_err(|_| "ANTHROPIC_API_KEY not set")?;
        
        // Validate keys format
        if !openai_key.starts_with("sk-") {
            return Err("Invalid OpenAI key format".into());
        }
        
        Ok(Self { openai_key, anthropic_key })
    }
}

// Rotate keys periodically (every 90 days)
```

### 3. Rate Limiting

```rust
// src-tauri/src/middleware/rate_limit.rs
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::{Instant, Duration};

pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
    limit: usize,  // Max requests per window
    window: Duration,  // Time window
}

impl RateLimiter {
    pub fn new(limit: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            limit,
            window,
        }
    }
    
    pub fn check(&self, user_id: &str) -> bool {
        let mut requests = self.requests.lock().unwrap();
        let now = Instant::now();
        
        let user_requests = requests.entry(user_id.to_string())
            .or_insert_with(Vec::new);
        
        // Remove old requests outside window
        user_requests.retain(|&t| now.duration_since(t) < self.window);
        
        if user_requests.len() >= self.limit {
            return false;  // Rate limited
        }
        
        user_requests.push(now);
        true
    }
}

// Usage:
// 100 requests per minute max
let rate_limiter = RateLimiter::new(100, Duration::from_secs(60));

#[tauri::command]
pub async fn api_call(user_id: String) -> Result<Response, String> {
    if !rate_limiter.check(&user_id) {
        return Err("Rate limit exceeded. Try again later.".into());
    }
    
    // Process request
}
```

### 4. Input Validation

```rust
// src-tauri/src/validators.rs
pub fn validate_user_input(input: &str) -> Result<(), String> {
    // Length check
    if input.len() > 10_000 {
        return Err("Input too long (max 10,000 chars)".into());
    }
    
    // No SQL injection attempts
    let forbidden = ["DROP TABLE", "DELETE FROM", "INSERT INTO"];
    for pattern in forbidden {
        if input.to_uppercase().contains(pattern) {
            return Err("Invalid input detected".into());
        }
    }
    
    // No XSS attempts
    if input.contains("<script>") || input.contains("javascript:") {
        return Err("Invalid input detected".into());
    }
    
    Ok(())
}

#[tauri::command]
pub async fn conversation_generate(user_input: String) -> Result<String, String> {
    validate_user_input(&user_input)?;
    
    // Process validated input
}
```

### 5. Database Security

```rust
// Use prepared statements (prevents SQL injection)
let stmt = conn.prepare("SELECT * FROM memories WHERE user_id = ?1")?;
let results = stmt.query_map([user_id], |row| {
    // Map row
})?;

// Enable WAL mode + encryption (SQLite)
conn.execute("PRAGMA journal_mode=WAL", [])?;
conn.execute("PRAGMA cipher='sqlcipher'", [])?;
conn.execute("PRAGMA key='your-encryption-key'", [])?;

// PostgreSQL: Use SSL
let db_url = "postgresql://user:pass@host:5432/db?sslmode=require";
```

---

## 📊 Monitoring & Observability

### 1. Health Check Endpoint

```rust
// src-tauri/src/api/health.rs
use sysinfo::{System, SystemExt, CpuExt};

#[derive(serde::Serialize)]
pub struct HealthStatus {
    status: String,  // "healthy" | "degraded" | "down"
    uptime: u64,
    cpu_usage: f32,
    memory_mb: u64,
    services: HashMap<String, String>,
}

#[tauri::command]
pub async fn health_check() -> HealthStatus {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let memory_mb = sys.used_memory() / 1024 / 1024;
    
    let mut services = HashMap::new();
    services.insert("omega".to_string(), check_omega().await);
    services.insert("memory".to_string(), check_memory().await);
    services.insert("database".to_string(), check_database().await);
    
    let status = if services.values().all(|s| s == "ok") {
        "healthy"
    } else if services.values().any(|s| s == "down") {
        "down"
    } else {
        "degraded"
    };
    
    HealthStatus {
        status: status.to_string(),
        uptime: sys.uptime(),
        cpu_usage,
        memory_mb,
        services,
    }
}

// HTTP endpoint (for load balancers)
// GET /health → 200 OK if healthy, 503 Service Unavailable if down
```

### 2. Structured Logging

```rust
// src-tauri/src/main.rs
use tracing::{info, warn, error, debug};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

fn init_logging() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer()
            .json()  // JSON format for log aggregation
            .with_target(true)
            .with_level(true)
            .with_thread_ids(true)
            .with_file(true)
            .with_line_number(true)
        )
        .init();
    
    info!(
        version = env!("CARGO_PKG_VERSION"),
        "TITANE∞ started"
    );
}

// Usage
info!(user_id = %user_id, "User logged in");
warn!(latency_ms = 450, "High AI latency detected");
error!(error = %e, "Database connection failed");

// Logs output:
// {"timestamp":"2025-12-15T10:00:00Z","level":"INFO","target":"titane::auth","message":"User logged in","user_id":"user-123"}
```

### 3. Metrics Collection (Prometheus)

```rust
// Cargo.toml
[dependencies]
prometheus = "0.13"

// src-tauri/src/metrics.rs
use prometheus::{Counter, Histogram, Registry};
use once_cell::sync::Lazy;

static REGISTRY: Lazy<Registry> = Lazy::new(Registry::new);

static REQUEST_COUNT: Lazy<Counter> = Lazy::new(|| {
    let counter = Counter::new("titane_requests_total", "Total requests").unwrap();
    REGISTRY.register(Box::new(counter.clone())).unwrap();
    counter
});

static REQUEST_DURATION: Lazy<Histogram> = Lazy::new(|| {
    let histogram = Histogram::with_opts(
        prometheus::HistogramOpts::new("titane_request_duration_seconds", "Request duration")
            .buckets(vec![0.01, 0.05, 0.1, 0.5, 1.0, 5.0])
    ).unwrap();
    REGISTRY.register(Box::new(histogram.clone())).unwrap();
    histogram
});

// Usage
REQUEST_COUNT.inc();
let timer = REQUEST_DURATION.start_timer();
// ... process request
timer.observe_duration();

// Expose metrics endpoint
#[tauri::command]
pub fn metrics() -> String {
    use prometheus::Encoder;
    let encoder = prometheus::TextEncoder::new();
    let metric_families = REGISTRY.gather();
    let mut buffer = vec![];
    encoder.encode(&metric_families, &mut buffer).unwrap();
    String::from_utf8(buffer).unwrap()
}

// GET /metrics → Prometheus scrape target
```

### 4. Error Tracking (Sentry)

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    release: `titane-infinity@${import.meta.env.VITE_APP_VERSION}`,
    
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    
    tracesSampleRate: 0.1,  // 10% transactions
    replaysSessionSampleRate: 0.1,  // 10% sessions
    replaysOnErrorSampleRate: 1.0,  // 100% errors
    
    beforeSend(event) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
      }
      return event;
    },
  });
}
```

---

## 🚢 Deployment Strategies

### Desktop Application (Tauri Bundle)

**1. Linux (.deb, .AppImage, .rpm):**
```bash
# Build bundles
pnpm run tauri build

# Output:
# src-tauri/target/release/bundle/deb/titane-infinity_24.2.0_amd64.deb
# src-tauri/target/release/bundle/appimage/titane-infinity_24.2.0_amd64.AppImage
# src-tauri/target/release/bundle/rpm/titane-infinity-24.2.0-1.x86_64.rpm

# Install .deb
sudo dpkg -i titane-infinity_24.2.0_amd64.deb

# Install .AppImage
chmod +x titane-infinity_24.2.0_amd64.AppImage
./titane-infinity_24.2.0_amd64.AppImage

# Install .rpm
sudo rpm -i titane-infinity-24.2.0-1.x86_64.rpm
```

**2. Windows (.msi, .exe):**
```bash
# Build on Windows machine
pnpm run tauri build

# Output:
# src-tauri/target/release/bundle/msi/TITANE_INFINITY_24.2.0_x64_en-US.msi
# src-tauri/target/release/bundle/nsis/TITANE_INFINITY_24.2.0_x64-setup.exe

# Sign with code signing certificate
signtool sign /f cert.pfx /p password /t http://timestamp.digicert.com TITANE_INFINITY_24.2.0_x64-setup.exe

# Test installer
TITANE_INFINITY_24.2.0_x64-setup.exe /S  # Silent install
```

**3. macOS (.dmg, .app):**
```bash
# Build on macOS machine
pnpm run tauri build

# Output:
# src-tauri/target/release/bundle/dmg/TITANE_INFINITY_24.2.0_x64.dmg
# src-tauri/target/release/bundle/macos/TITANE_INFINITY.app

# Sign with Apple Developer certificate
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" TITANE_INFINITY.app

# Notarize (required for macOS 10.15+)
xcrun notarytool submit TITANE_INFINITY_24.2.0_x64.dmg --apple-id user@example.com --password app-specific-password --team-id TEAMID

# Test
open TITANE_INFINITY_24.2.0_x64.dmg
```

### Auto-Update (Tauri Updater)

```json
// tauri.conf.json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.titane-infinity.ai/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

```typescript
// src/services/updater.ts
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

export async function checkForUpdates() {
  try {
    const { shouldUpdate, manifest } = await checkUpdate();
    
    if (shouldUpdate) {
      console.log(`Update available: ${manifest?.version}`);
      
      // Prompt user
      const confirmed = await confirm(
        `New version ${manifest?.version} available. Update now?`
      );
      
      if (confirmed) {
        await installUpdate();
        await relaunch();
      }
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
}

// Check on startup
checkForUpdates();

// Check periodically (every 6 hours)
setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
```

---

## ✅ Post-Deployment Validation

### Smoke Tests

```bash
#!/bin/bash
# smoke-tests.sh

set -e  # Exit on any error

echo "🧪 Running smoke tests..."

# 1. Application launches
timeout 30s ./titane-infinity --version
echo "✅ App launches"

# 2. Health check OK
response=$(curl -s http://localhost:3000/api/health)
status=$(echo $response | jq -r '.status')
if [ "$status" != "healthy" ]; then
  echo "❌ Health check failed: $status"
  exit 1
fi
echo "✅ Health check passed"

# 3. AI pipeline responds
response=$(curl -s -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}')
if [ -z "$response" ]; then
  echo "❌ AI pipeline not responding"
  exit 1
fi
echo "✅ AI pipeline OK"

# 4. Memory persistence works
response=$(curl -s http://localhost:3000/api/memory/recall)
if [ -z "$response" ]; then
  echo "❌ Memory system not responding"
  exit 1
fi
echo "✅ Memory system OK"

echo "✅ All smoke tests passed!"
```

### Performance Baseline

```bash
# Measure startup time
time ./titane-infinity --version  # Should be <5s

# Measure AI latency
curl -w "@curl-format.txt" -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# curl-format.txt:
# time_total: %{time_total}s
# Expected: <500ms

# Memory usage
ps aux | grep titane-infinity
# Expected: <1GB RSS
```

---

## 📈 Scaling & Performance

### Database Migration (SQLite → PostgreSQL)

**When to migrate:**
- Users > 1,000
- Memory entries > 100,000
- Concurrent requests > 100/s

**Migration script:**
```bash
#!/bin/bash
# migrate-to-postgres.sh

# Export SQLite data
sqlite3 ~/.local/share/titane-infinity/memory.db <<EOF
.mode csv
.output stm_entries.csv
SELECT * FROM stm_entries;
.output mtm_entries.csv
SELECT * FROM mtm_entries;
.output ltm_entries.csv
SELECT * FROM ltm_entries;
EOF

# Import to PostgreSQL
psql -h prod-db -U titane -d titane <<EOF
COPY stm_entries FROM 'stm_entries.csv' CSV;
COPY mtm_entries FROM 'mtm_entries.csv' CSV;
COPY ltm_entries FROM 'ltm_entries.csv' CSV;
EOF

echo "✅ Migration complete"
```

### Vector Store Optimization (HNSW)

**When vectors > 10,000:**
```rust
// Replace linear search with HNSW index
use hnsw_rs::Hnsw;

pub struct VectorStore {
    hnsw_index: Hnsw<f32, DistCosine>,  // Fast approximate search
    vectors: HashMap<String, Vec<f32>>,
}

impl VectorStore {
    pub fn search(&self, query: &[f32], top_k: usize) -> Vec<SearchResult> {
        // HNSW search: O(log n) instead of O(n)
        let neighbors = self.hnsw_index.search(query, top_k, 50);
        
        neighbors.into_iter()
            .map(|n| SearchResult {
                id: n.d_id,
                distance: n.distance,
            })
            .collect()
    }
}

// Performance: 10K vectors
// Linear: ~50ms per search
// HNSW: ~2ms per search (25x faster)
```

### Load Balancing (Multiple Instances)

```nginx
# nginx.conf
upstream titane_backend {
    least_conn;  # Load balance by connection count
    
    server localhost:3001 weight=1;
    server localhost:3002 weight=1;
    server localhost:3003 weight=1;
}

server {
    listen 80;
    server_name api.titane-infinity.ai;
    
    location /api {
        proxy_pass http://titane_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /health {
        proxy_pass http://titane_backend/health;
        access_log off;  # Don't log health checks
    }
}
```

---

## 🔄 Rollback Procedure

**If deployment fails:**

```bash
#!/bin/bash
# rollback.sh

# 1. Stop new version
systemctl stop titane-infinity

# 2. Restore previous version
cp /backup/titane-infinity-24.1.0 /usr/local/bin/titane-infinity

# 3. Restore database
psql -h prod-db -U titane -d titane < backup_24.1.0.sql

# 4. Restart
systemctl start titane-infinity

# 5. Verify
curl http://localhost:3000/api/health

echo "✅ Rollback complete"
```

---

**Document généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Team

---

_Production Deployment Guide — Deploy with Confidence_ 🚀✨
