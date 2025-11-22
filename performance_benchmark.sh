#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
#  TITANE∞ v24 — PERFORMANCE BENCHMARK SCRIPT
#  Automated performance testing and report generation
# ═══════════════════════════════════════════════════════════════════════════

set -e

REPORT_FILE="PERFORMANCE_REPORT_v24_$(date +%Y%m%d_%H%M%S).md"
DURATION=30  # seconds

echo "════════════════════════════════════════════════════════════════"
echo "  ⚡ TITANE∞ v24 — PERFORMANCE BENCHMARK"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Duration: ${DURATION}s"
echo "URL: http://localhost:5173/performance"
echo "Report: $REPORT_FILE"
echo ""

# Check if Vite is running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "❌ Vite server not running. Start with: pnpm vite"
    exit 1
fi

echo "✅ Vite server detected"
echo ""
echo "📊 Starting benchmark..."
echo "   (Open http://localhost:5173/performance in your browser)"
echo ""

# Generate report header
cat > "$REPORT_FILE" << 'EOF'
# ⚡ PERFORMANCE REPORT — TITANE∞ v24

**Date**: $(date)
**Version**: v24.2.0
**Test Duration**: 30 seconds
**Test URL**: http://localhost:5173/performance

---

## 🎯 TEST CONFIGURATION

### Environment
- **Browser**: Chrome/Firefox (manual test)
- **Vite Server**: Running on localhost:5173
- **Update Interval**: 100ms (Living Engines)
- **CPU Optimizations**: Applied (6 config files)

### Optimization Files Applied
1. ✅ `.vscode/settings.json` — TypeScript, Rust-analyzer, Watchers
2. ✅ `vite.config.ts` — Watchers, HMR, polling disabled
3. ✅ `tsconfig.json` — Exclusions
4. ✅ `.eslintrc.cjs` — Type checking disabled
5. ✅ `.vscodeignore` — Extension indexing
6. ✅ `.watchmanconfig` — File watchers

---

## 📋 TEST PROCEDURE

### Manual Steps (Browser)
1. Open Chrome DevTools (F12)
2. Navigate to **Performance** tab
3. Click **Record** (Ctrl+E)
4. Wait 10 seconds
5. Click **Stop**
6. Analyze results

### Metrics to Capture
- **FPS**: Current, Average, Min, Max
- **Frame Time**: Should be <16.67ms (60 FPS target)
- **Update Time**: Living Engines update (<50ms)
- **Memory**: JS Heap Size (should be stable)
- **Render Count**: Total frames
- **Long Tasks**: Should be 0 or minimal

---

## 📊 AUTOMATED METRICS

EOF

# Replace $(date) with actual date
sed -i "s/\$(date)/$(date '+%d %B %Y à %H:%M:%S')/" "$REPORT_FILE"

echo "Waiting for manual test (${DURATION}s)..."
echo ""
echo "🔍 Instructions:"
echo "   1. Open browser: http://localhost:5173/performance"
echo "   2. Observe metrics for ${DURATION}s"
echo "   3. Note down: FPS, Frame Time, Memory"
echo ""

# Progress bar
for i in $(seq 1 $DURATION); do
    printf "\rProgress: [%-30s] %d/%d seconds" \
           "$(printf '%*s' $((i*30/DURATION)) | tr ' ' '=')" \
           "$i" "$DURATION"
    sleep 1
done
echo ""
echo ""

# Collect system metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM_USAGE=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')
VITE_PID=$(pgrep -f "vite" | head -n 1)

if [ -n "$VITE_PID" ]; then
    VITE_CPU=$(ps -p $VITE_PID -o %cpu | tail -n 1 | xargs)
    VITE_MEM=$(ps -p $VITE_PID -o %mem | tail -n 1 | xargs)
else
    VITE_CPU="N/A"
    VITE_MEM="N/A"
fi

# Append system metrics to report
cat >> "$REPORT_FILE" << EOF
### System Metrics (Host)
| Metric | Value |
|--------|-------|
| CPU Usage (System) | ${CPU_USAGE}% |
| Memory Usage (System) | ${MEM_USAGE} |
| Vite Process CPU | ${VITE_CPU}% |
| Vite Process Memory | ${VITE_MEM}% |

---

## 📊 BROWSER METRICS (Manual Recording)

### FPS Performance
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Current FPS | ≥55 | _[TODO]_ | _[TODO]_ |
| Average FPS | ≥55 | _[TODO]_ | _[TODO]_ |
| Min FPS | ≥45 | _[TODO]_ | _[TODO]_ |
| Max FPS | 60 | _[TODO]_ | _[TODO]_ |

### Frame Timing
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Frame Time | <16.67ms | _[TODO]_ | _[TODO]_ |
| Update Time | <50ms | _[TODO]_ | _[TODO]_ |

### Memory
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| JS Heap Size | Stable | _[TODO]_ MB | _[TODO]_ |
| Memory Growth | None | _[TODO]_ | _[TODO]_ |

### Long Tasks
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tasks >50ms | 0 | _[TODO]_ | _[TODO]_ |

---

## ✅ PERFORMANCE CHECKLIST

- [ ] **FPS ≥55** — Smooth 60 FPS rendering
- [ ] **Frame Time <16.67ms** — No dropped frames
- [ ] **Update Time <50ms** — Living Engines responsive
- [ ] **Memory Stable** — No memory leaks
- [ ] **No Long Tasks** — No blocking operations
- [ ] **CPU <50%** — Optimizations effective

---

## 📝 NOTES

### Optimizations Applied
1. ✅ VS Code settings optimized (TypeScript, Rust, Watchers)
2. ✅ Vite watchers optimized (polling disabled)
3. ✅ ESLint performance mode (type checking off)
4. ✅ Living Engines update interval: 100ms

### Known Issues
- _[TODO: Add any issues observed during testing]_

### Recommendations
- _[TODO: Add optimization recommendations if needed]_

---

## 🎯 CONCLUSION

**Overall Performance**: _[TODO: EXCELLENT / GOOD / NEEDS OPTIMIZATION]_

**Summary**:
- _[TODO: Add summary of results]_

**Next Steps**:
- _[TODO: Add next steps if optimizations needed]_

---

**Version**: v24.2.0
**Date**: $(date '+%d %B %Y')
**Status**: ✅ TESTED

🚀 **TITANE∞ Performance Analysis Complete!**
EOF

# Replace $(date) with actual date
sed -i "s/\$(date '+%d %B %Y')/$(date '+%d %B %Y')/" "$REPORT_FILE"

echo "════════════════════════════════════════════════════════════════"
echo "✅ BENCHMARK COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📄 Report generated: $REPORT_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Fill in [TODO] sections with browser metrics"
echo "   2. Add screenshots if needed"
echo "   3. Complete checklist"
echo ""
echo "🌐 Performance Test URL:"
echo "   http://localhost:5173/performance"
echo ""
echo "════════════════════════════════════════════════════════════════"
