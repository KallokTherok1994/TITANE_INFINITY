#!/bin/bash
# P10.4 Infrastructure Diagnostic Run

RUN_NUM=$1
PACK_DIR=$2
WRAPPER_PATH=$3

LOG_FILE="$PACK_DIR/07_INFRA_DIAG_RUN_${RUN_NUM}.txt"

{
  echo "=== INFRA DIAGNOSTIC RUN $RUN_NUM ==="
  echo "Start: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
  # Pre-run checks
  echo ""
  echo "PRE-RUN CHECKS:"
  echo "- Ollama availability:"
  curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1 && echo "  ✅ Ollama ready" || echo "  ⚠️ Ollama not responding"
  
  echo "- No stray titane processes:"
  pgrep -f "titane-infinity" | wc -l | awk '{print "  Found: " $1 " processes (expect 0)"}'
  
  # Run wrapper
  echo ""
  echo "LAUNCHING WITH WRAPPER:"
  LAUNCH_START=$(date +%s)
  
  "$WRAPPER_PATH" /usr/bin/titane-infinity 20 "$LOG_FILE.wrapper.log" 2>&1
  LAUNCH_EXIT=$?
  
  LAUNCH_END=$(date +%s)
  DURATION=$((LAUNCH_END - LAUNCH_START))
  
  echo ""
  echo "LAUNCH METRICS:"
  echo "- Exit code: $LAUNCH_EXIT"
  echo "- Duration: ${DURATION}s"
  
  # Analyze wrapper log
  echo ""
  echo "STARTUP MARKERS:"
  
  READY_TIME=$(grep -m1 "Initialized successfully\|Main window shown\|backend ready" "$LOG_FILE.wrapper.log" 2>/dev/null | head -1 | cut -d'[' -f2 | cut -d']' -f1 || echo "NOT_FOUND")
  echo "- Backend ready at: $READY_TIME"
  
  PANIC_COUNT=$(grep -c "panicked\|thread.*panic" "$LOG_FILE.wrapper.log" 2>/dev/null || echo "0")
  echo "- Panic count: $PANIC_COUNT"
  
  CRASH_CHECK=$(grep -i "segfault\|signal\|core dump" "$LOG_FILE.wrapper.log" 2>/dev/null | wc -l || echo "0")
  echo "- Crash indicators: $CRASH_CHECK"
  
  # IPC check
  echo ""
  echo "IPC BRIDGE:"
  IPC_REFS=$(grep -c "tauri://localhost\|IPC" "$LOG_FILE.wrapper.log" 2>/dev/null || echo "0")
  echo "- IPC references: $IPC_REFS"
  
  echo ""
  echo "End: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "Status: $([ $LAUNCH_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
  
} | tee "$LOG_FILE"

exit $LAUNCH_EXIT
