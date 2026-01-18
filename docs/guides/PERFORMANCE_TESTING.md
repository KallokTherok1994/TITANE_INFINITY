# Performance Testing Guide

**Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** 🟢 Active  

---

## Overview

This guide covers performance testing for TITANE∞, including benchmarking, profiling, and regression detection.

---

## Quick Start

### Run Performance Benchmark

```bash
# From project root
./scripts/test/benchmark-performance.sh
```

**Output:**
- Launch time (5 runs, averaged)
- Memory usage (RSS)
- Binary size
- CPU usage
- Results saved to `.performance-results/`

---

## Performance Metrics

### 1. App Launch Time

**Target:** < 2 seconds  
**Threshold:** < 3 seconds  
**Measurement:** Time from process start to window visible  

**Command:**
```bash
time ./deployment/latest/*.AppImage
```

**Expected:**
- Cold start: 1.5-2.5s
- Warm start: 0.5-1.5s

---

### 2. Memory Usage

**Target:** < 100 MB  
**Threshold:** < 150 MB  
**Measurement:** Resident Set Size (RSS) after idle 5s  

**Command:**
```bash
ps -o rss= -p $(pgrep titane-infinity)
```

**Expected:**
- Idle: 50-80 MB
- Active chat: 100-120 MB
- With engines: 120-150 MB

---

### 3. Binary Size

**Target:** < 100 MB  
**Threshold:** < 150 MB  
**Measurement:** AppImage file size  

**Command:**
```bash
du -h deployment/latest/*.AppImage
```

**Expected:**
- AppImage: 80-90 MB
- DEB: 8-10 MB

---

### 4. CPU Usage

**Target:** < 10% idle  
**Threshold:** < 50% peak  
**Measurement:** CPU percentage during operation  

**Command:**
```bash
top -p $(pgrep titane-infinity) -b -n 1 | grep titane
```

**Expected:**
- Idle: 1-5%
- Chat active: 10-30%
- Engine processing: 30-50%

---

## Benchmark Suite

### Manual Benchmarking

#### 1. Launch Time (Hyperfine)

```bash
# Install hyperfine
cargo install hyperfine

# Benchmark
hyperfine --warmup 2 --runs 10 \
  './deployment/latest/*.AppImage' \
  --export-json .performance-results/hyperfine.json
```

#### 2. Memory Profiling (Valgrind)

```bash
# Install valgrind
sudo apt install valgrind

# Profile memory
valgrind --tool=massif --massif-out-file=.performance-results/massif.out \
  ./deployment/latest/*.AppImage
```

#### 3. CPU Profiling (perf)

```bash
# Install perf
sudo apt install linux-tools-generic

# Profile CPU
perf record -g ./deployment/latest/*.AppImage
perf report
```

---

## Automated Testing

### CI/CD Integration

Add to `.github/workflows/ci.yml`:

```yaml
- name: Performance Benchmark
  run: ./scripts/test/benchmark-performance.sh
  
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: .performance-results/
```

---

## Regression Detection

### Baseline Results (v26.3.0)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Launch Time | 1.8s | < 3.0s | ✅ |
| Memory (Idle) | 53 MB | < 150 MB | ✅ |
| Binary Size | 82 MB | < 150 MB | ✅ |
| CPU (Idle) | 2% | < 50% | ✅ |

### Regression Criteria

Performance regression detected if:
- Launch time increases > 20%
- Memory usage increases > 30%
- Binary size increases > 15%
- CPU usage increases > 50%

**Action:** Block merge if regression detected without justification.

---

## Profiling Tools

### Rust (Backend)

#### Criterion Benchmarks

```bash
# Run Rust benchmarks
cd src-tauri
cargo bench

# View results
open target/criterion/report/index.html
```

#### Flamegraph

```bash
# Install cargo-flamegraph
cargo install flamegraph

# Generate flamegraph
cargo flamegraph --bin titane-infinity

# View flamegraph.svg
```

---

### JavaScript (Frontend)

#### Chrome DevTools

1. Launch app in dev mode: `pnpm run dev:tauri`
2. Open DevTools: `Ctrl+Shift+I`
3. Go to Performance tab
4. Record profile
5. Analyze results

#### Lighthouse

```bash
# Install lighthouse
npm install -g lighthouse

# Run audit (requires dev server)
lighthouse http://localhost:4000 --view
```

---

## Load Testing

### Concurrent Users Simulation

```bash
# Create load test script
cat > scripts/test/load-test.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
  ./deployment/latest/*.AppImage &
  sleep 1
done
wait
EOF

chmod +x scripts/test/load-test.sh
./scripts/test/load-test.sh
```

### Expected Behavior

- 10 concurrent instances: < 1 GB total memory
- No crashes
- Responsive UI in all instances

---

## Best Practices

### 1. Consistent Environment

- Run on same hardware/OS
- Close other applications
- Use consistent system load
- Warm up system before benchmarking

### 2. Multiple Runs

- Minimum 5 runs per test
- Discard outliers (> 2σ)
- Report average + standard deviation

### 3. Baseline Tracking

- Save all benchmark results
- Compare against baseline (v26.3.0)
- Track trends over time

### 4. CI Integration

- Run benchmarks on every PR
- Comment results on PR
- Block merge if regression detected

---

## Troubleshooting

### Slow Launch Time

**Possible Causes:**
- Large bundle size
- Slow disk I/O
- Heavy initialization

**Solutions:**
- Lazy load modules
- Optimize bundle size
- Profile initialization code

---

### High Memory Usage

**Possible Causes:**
- Memory leaks
- Large data structures
- Inefficient caching

**Solutions:**
- Use memory profiler (Valgrind)
- Check for circular references
- Implement memory limits

---

### High CPU Usage

**Possible Causes:**
- Inefficient algorithms
- Busy loops
- Heavy computations

**Solutions:**
- Profile with perf
- Optimize hot paths
- Use async/await properly

---

## Performance Goals

### v26.4.0 Targets

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Launch Time | 1.8s | 1.5s | -17% |
| Memory | 53 MB | 50 MB | -6% |
| Binary Size | 82 MB | 75 MB | -9% |
| CPU (Idle) | 2% | 1% | -50% |

---

## References

- Hyperfine: https://github.com/sharkdp/hyperfine
- Valgrind: https://valgrind.org/
- perf: https://perf.wiki.kernel.org/
- Criterion: https://github.com/bheisler/criterion.rs
- Flamegraph: https://github.com/flamegraph-rs/flamegraph

---

**Last Benchmark Run:** January 19, 2026  
**Baseline Version:** v26.3.0  
**Next Review:** v26.4.0 release  
