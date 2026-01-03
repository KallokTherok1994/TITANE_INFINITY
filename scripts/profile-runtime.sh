#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#   TITANE∞ v19.5.2 — Runtime Performance Profiling Script
#   PHASE 4.3: Profiling runtime performance (React DevTools, Lighthouse)
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REPORTS_DIR="$PROJECT_ROOT/performance-reports"

echo "🔬 PHASE 4.3: Runtime Performance Profiling"
echo "════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create reports directory
mkdir -p "$REPORTS_DIR"

# ────────────────────────────────────────────────────────────────
# STEP 1: Build production bundle
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}📦 STEP 1: Building production bundle...${NC}"
cd "$PROJECT_ROOT"

# Build with profiling enabled
pnpm run build -- --mode production

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completed${NC}"

echo ""
echo -e "${YELLOW}⚠️  TAURI-ONLY: étape Lighthouse/preview HTTP désactivée${NC}"
echo "   (aucun serveur HTTP autorisé)"
echo ""
exit 0

# ────────────────────────────────────────────────────────────────
# STEP 4: Extract key metrics from JSON
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}📊 STEP 4: Extracting performance metrics...${NC}"

if [ -f "$REPORTS_DIR/lighthouse-mobile.report.json" ]; then
  cat "$REPORTS_DIR/lighthouse-mobile.report.json" | jq '{
    performance: .categories.performance.score,
    fcp: .audits."first-contentful-paint".displayValue,
    lcp: .audits."largest-contentful-paint".displayValue,
    tbt: .audits."total-blocking-time".displayValue,
    cls: .audits."cumulative-layout-shift".displayValue,
    tti: .audits."interactive".displayValue,
    speed_index: .audits."speed-index".displayValue
  }' > "$REPORTS_DIR/metrics-mobile.json"
  
  echo -e "${GREEN}✅ Mobile metrics extracted: $REPORTS_DIR/metrics-mobile.json${NC}"
fi

if [ -f "$REPORTS_DIR/lighthouse-desktop.report.json" ]; then
  cat "$REPORTS_DIR/lighthouse-desktop.report.json" | jq '{
    performance: .categories.performance.score,
    fcp: .audits."first-contentful-paint".displayValue,
    lcp: .audits."largest-contentful-paint".displayValue,
    tbt: .audits."total-blocking-time".displayValue,
    cls: .audits."cumulative-layout-shift".displayValue,
    tti: .audits."interactive".displayValue,
    speed_index: .audits."speed-index".displayValue
  }' > "$REPORTS_DIR/metrics-desktop.json"
  
  echo -e "${GREEN}✅ Desktop metrics extracted: $REPORTS_DIR/metrics-desktop.json${NC}"
fi

# ────────────────────────────────────────────────────────────────
# STEP 5: Web Vitals from browser
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}📈 STEP 5: Collecting Web Vitals...${NC}"

# Create a simple Node script to fetch Web Vitals
cat > "$REPORTS_DIR/collect-vitals.mjs" << 'EOF'
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect Web Vitals
  const vitals = {};
  
  // FCP
  page.on('metrics', (metrics) => {
    vitals.fcp = metrics.FirstContentfulPaint;
  });
  
  await page.goto('tauri://localhost', { waitUntil: 'networkidle2' });
  
  // LCP
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      setTimeout(() => resolve(null), 5000);
    });
  });
  
  vitals.lcp = lcp;
  
  // CLS
  const cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => resolve(clsValue), 5000);
    });
  });
  
  vitals.cls = cls;
  
  console.log(JSON.stringify(vitals, null, 2));
  
  await browser.close();
})();
EOF

# Check if puppeteer is installed
if ! npm list puppeteer &> /dev/null; then
  echo -e "${YELLOW}⚠️  Puppeteer not found, skipping Web Vitals collection${NC}"
else
  node "$REPORTS_DIR/collect-vitals.mjs" > "$REPORTS_DIR/web-vitals.json" 2>/dev/null || \
    echo -e "${YELLOW}⚠️  Web Vitals collection failed${NC}"
fi

# ────────────────────────────────────────────────────────────────
# STEP 6: Bundle size analysis
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}📦 STEP 6: Analyzing bundle size...${NC}"

# Calculate total bundle size
TOTAL_SIZE=$(du -sh "$PROJECT_ROOT/dist/assets" | awk '{print $1}')
echo -e "Total bundle size: ${YELLOW}$TOTAL_SIZE${NC}"

# List largest files
echo "Largest files:"
du -h "$PROJECT_ROOT/dist/assets"/*.js 2>/dev/null | sort -rh | head -10 | while read size file; do
  filename=$(basename "$file")
  echo -e "  ${YELLOW}$size${NC} - $filename"
done

# ────────────────────────────────────────────────────────────────
# STEP 7: Generate summary report
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}📝 STEP 7: Generating summary report...${NC}"

REPORT_FILE="$REPORTS_DIR/RUNTIME_PERFORMANCE_REPORT.md"

cat > "$REPORT_FILE" << 'EOF'
# 🔬 PHASE 4.3: Runtime Performance Profiling Report

**Date**: $(date +"%Y-%m-%d %H:%M:%S")  
**Project**: TITANE∞ v19.5.2

---

## 📊 Performance Metrics

### Lighthouse Mobile
EOF

if [ -f "$REPORTS_DIR/metrics-mobile.json" ]; then
  cat "$REPORTS_DIR/metrics-mobile.json" | jq -r '
    "- **Performance Score**: \(.performance * 100)%",
    "- **First Contentful Paint (FCP)**: \(.fcp)",
    "- **Largest Contentful Paint (LCP)**: \(.lcp)",
    "- **Total Blocking Time (TBT)**: \(.tbt)",
    "- **Cumulative Layout Shift (CLS)**: \(.cls)",
    "- **Time to Interactive (TTI)**: \(.tti)",
    "- **Speed Index**: \(.speed_index)"
  ' >> "$REPORT_FILE"
else
  echo "❌ No mobile metrics available" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << 'EOF'

### Lighthouse Desktop
EOF

if [ -f "$REPORTS_DIR/metrics-desktop.json" ]; then
  cat "$REPORTS_DIR/metrics-desktop.json" | jq -r '
    "- **Performance Score**: \(.performance * 100)%",
    "- **First Contentful Paint (FCP)**: \(.fcp)",
    "- **Largest Contentful Paint (LCP)**: \(.lcp)",
    "- **Total Blocking Time (TBT)**: \(.tbt)",
    "- **Cumulative Layout Shift (CLS)**: \(.cls)",
    "- **Time to Interactive (TTI)**: \(.tti)",
    "- **Speed Index**: \(.speed_index)"
  ' >> "$REPORT_FILE"
else
  echo "❌ No desktop metrics available" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

---

## 📦 Bundle Size Analysis

- **Total Size**: $TOTAL_SIZE

### Largest Files:
EOF

du -h "$PROJECT_ROOT/dist/assets"/*.js 2>/dev/null | sort -rh | head -10 | while read size file; do
  filename=$(basename "$file")
  echo "- \`$filename\`: $size" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << 'EOF'

---

## 📈 Recommendations

### High Priority
- [ ] Optimize largest bundle (`ai-onnx-*.js`, `page-chat-*.js`)
- [ ] Reduce Total Blocking Time (TBT) if >300ms
- [ ] Improve Largest Contentful Paint (LCP) if >2.5s

### Medium Priority
- [ ] Tree-shake unused dependencies
- [ ] Implement code splitting for routes
- [ ] Add service worker for caching

### Low Priority
- [ ] Optimize images (WebP, lazy loading)
- [ ] Minify CSS further
- [ ] Enable compression (gzip/brotli)

---

## 🔗 Reports

- [Lighthouse Mobile HTML](<./lighthouse-mobile.report.html>)
- [Lighthouse Desktop HTML](<./lighthouse-desktop.report.html>)
- [Mobile Metrics JSON](<./metrics-mobile.json>)
- [Desktop Metrics JSON](<./metrics-desktop.json>)

EOF

echo -e "${GREEN}✅ Summary report generated: $REPORT_FILE${NC}"

# ────────────────────────────────────────────────────────────────
# CLEANUP
# ────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"

# Stop dev server
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Remove temporary script
rm -f "$REPORTS_DIR/collect-vitals.mjs"

echo -e "${GREEN}✅ Server stopped${NC}"

# ────────────────────────────────────────────────────────────────
# SUMMARY
# ────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ PHASE 4.3 COMPLETED${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📁 Reports directory: $REPORTS_DIR"
echo ""
echo "📊 Generated files:"
echo "  - lighthouse-mobile.report.html"
echo "  - lighthouse-desktop.report.html"
echo "  - metrics-mobile.json"
echo "  - metrics-desktop.json"
echo "  - RUNTIME_PERFORMANCE_REPORT.md"
echo ""
echo "🔍 Next steps:"
echo "  1. Review Lighthouse reports for optimization opportunities"
echo "  2. Check bundle size analysis for heavy dependencies"
echo "  3. Profile React components with DevTools Profiler"
echo "  4. Run PHASE 4.4 (memory leak detection)"
echo ""
