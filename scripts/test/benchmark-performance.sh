#!/bin/bash
# Performance Benchmarking Script for TITANE∞
# Measures app launch time, memory usage, and responsiveness

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/.performance-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 TITANE∞ Performance Benchmark"
echo "================================="
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Check if AppImage exists
APPIMAGE=$(find "$PROJECT_ROOT/deployment/latest" -name "*.AppImage" 2>/dev/null | head -1)
if [[ -z "$APPIMAGE" ]]; then
    echo -e "${RED}❌ No AppImage found in deployment/latest${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found AppImage: $(basename "$APPIMAGE")"
echo ""

# 1. App Launch Time Benchmark
echo "📊 Test 1/4: App Launch Time"
echo "----------------------------"

launch_times=()
for i in {1..5}; do
    echo -n "  Run $i/5... "
    
    # Start timer
    start_time=$(date +%s.%N)
    
    # Launch app in background
    timeout 5s "$APPIMAGE" &>/dev/null &
    APP_PID=$!
    
    # Wait for process to start
    sleep 2
    
    # Kill process
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
    
    # End timer
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    
    launch_times+=("$duration")
    echo -e "${GREEN}${duration}s${NC}"
done

# Calculate average
avg_launch=$(echo "scale=3; (${launch_times[0]} + ${launch_times[1]} + ${launch_times[2]} + ${launch_times[3]} + ${launch_times[4]}) / 5" | bc)
echo ""
echo -e "  Average Launch Time: ${YELLOW}${avg_launch}s${NC}"
echo ""

# 2. Memory Usage Benchmark
echo "📊 Test 2/4: Memory Usage"
echo "-------------------------"

"$APPIMAGE" &>/dev/null &
APP_PID=$!
sleep 3

if ps -p $APP_PID > /dev/null; then
    memory_kb=$(ps -o rss= -p $APP_PID)
    memory_mb=$(echo "scale=2; $memory_kb / 1024" | bc)
    echo -e "  Memory Usage (RSS): ${YELLOW}${memory_mb} MB${NC}"
    
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
else
    echo -e "  ${RED}Failed to measure memory${NC}"
    memory_mb="N/A"
fi
echo ""

# 3. Binary Size
echo "📊 Test 3/4: Binary Size"
echo "------------------------"

appimage_size_bytes=$(stat -c%s "$APPIMAGE")
appimage_size_mb=$(echo "scale=2; $appimage_size_bytes / 1024 / 1024" | bc)
echo -e "  AppImage Size: ${YELLOW}${appimage_size_mb} MB${NC}"
echo ""

# 4. Startup Resource Check
echo "📊 Test 4/4: Startup CPU Usage"
echo "-------------------------------"

"$APPIMAGE" &>/dev/null &
APP_PID=$!
sleep 2

if ps -p $APP_PID > /dev/null; then
    cpu_usage=$(ps -o %cpu= -p $APP_PID | tr -d ' ')
    echo -e "  CPU Usage: ${YELLOW}${cpu_usage}%${NC}"
    
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
else
    echo -e "  ${RED}Failed to measure CPU${NC}"
    cpu_usage="N/A"
fi
echo ""

# Save results to JSON
cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "version": "v26.3.0",
  "metrics": {
    "launch_time_avg_s": $avg_launch,
    "launch_time_runs": [${launch_times[0]}, ${launch_times[1]}, ${launch_times[2]}, ${launch_times[3]}, ${launch_times[4]}],
    "memory_usage_mb": $memory_mb,
    "binary_size_mb": $appimage_size_mb,
    "cpu_usage_percent": $cpu_usage
  },
  "thresholds": {
    "launch_time_max_s": 3.0,
    "memory_usage_max_mb": 150,
    "cpu_usage_max_percent": 50
  }
}
EOF

echo "================================="
echo -e "${GREEN}✓${NC} Benchmark Complete"
echo ""
echo "Results saved to:"
echo "  $RESULTS_FILE"
echo ""

# Check against thresholds
echo "Threshold Checks:"
echo "-----------------"

if (( $(echo "$avg_launch < 3.0" | bc -l) )); then
    echo -e "  Launch Time:  ${GREEN}✓ PASS${NC} (${avg_launch}s < 3.0s)"
else
    echo -e "  Launch Time:  ${RED}✗ FAIL${NC} (${avg_launch}s >= 3.0s)"
fi

if [[ "$memory_mb" != "N/A" ]] && (( $(echo "$memory_mb < 150" | bc -l) )); then
    echo -e "  Memory Usage: ${GREEN}✓ PASS${NC} (${memory_mb} MB < 150 MB)"
else
    echo -e "  Memory Usage: ${RED}✗ FAIL${NC} (${memory_mb} MB >= 150 MB)"
fi

if [[ "$cpu_usage" != "N/A" ]] && (( $(echo "$cpu_usage < 50" | bc -l) )); then
    echo -e "  CPU Usage:    ${GREEN}✓ PASS${NC} (${cpu_usage}% < 50%)"
else
    echo -e "  CPU Usage:    ${YELLOW}⚠ CHECK${NC} (${cpu_usage}% >= 50%)"
fi

echo ""
echo "View all results:"
echo "  ls -lh $RESULTS_DIR"
