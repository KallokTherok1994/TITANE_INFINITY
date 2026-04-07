#!/bin/bash

# Monitor production builds in real-time
# Shows progress of Cargo and pnpm builds

while true; do
  clear
  echo "════════════════════════════════════════════════════════════"
  echo "📦 PATCH-010 PRODUCTION BUILD MONITOR"
  echo "════════════════════════════════════════════════════════════"
  echo ""
  
  # Check Cargo build
  echo "🔨 Rust Build (Cargo Release):"
  if pgrep -f "cargo build --release" > /dev/null; then
    echo "   Status: 🟡 IN PROGRESS"
    tail -5 /tmp/prod_build.log 2>/dev/null | sed 's/^/   /'
  elif [[ -f /tmp/prod_build.log ]] && grep -q "error" /tmp/prod_build.log; then
    echo "   Status: ❌ FAILED"
    grep "error" /tmp/prod_build.log | tail -3 | sed 's/^/   /'
  elif [[ -f /tmp/prod_build.log ]] && grep -q "Finished" /tmp/prod_build.log; then
    echo "   Status: ✅ COMPLETE"
  else
    echo "   Status: ⏳ STARTING..."
  fi
  
  echo ""
  
  # Check pnpm build
  echo "📦 Frontend Build (pnpm):"
  if pgrep -f "pnpm build" > /dev/null; then
    echo "   Status: 🟡 IN PROGRESS"
    tail -5 /tmp/frontend_build.log 2>/dev/null | sed 's/^/   /'
  elif [[ -f /tmp/frontend_build.log ]] && grep -q "error" /tmp/frontend_build.log; then
    echo "   Status: ❌ FAILED"
    grep "error" /tmp/frontend_build.log | tail -3 | sed 's/^/   /'
  elif [[ -f /tmp/frontend_build.log ]] && grep -q "built" /tmp/frontend_build.log; then
    echo "   Status: ✅ COMPLETE"
  else
    echo "   Status: ⏳ STARTING..."
  fi
  
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "Build time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Press Ctrl+C to exit"
  
  sleep 10
done
