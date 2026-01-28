#!/bin/bash
# 🚀 QUICK START - PRODUCTION TESTING GUIDE
# Sprint 6 Phase 3 - Full Chat IA Testing
# 
# Usage: Follow steps in order

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🚀 SPRINT 6 PHASE 3 - PRODUCTION TESTING QUICK START             ║"
echo "║  v26.4.0 - Full Chat IA System (Tool Calling + Memory + UI)      ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 1: Check All Systems
# ═══════════════════════════════════════════════════════════════════

echo "📋 STEP 1: Checking all systems..."
echo ""

# Check Ollama
echo -n "  🤖 Ollama... "
if curl -s http://127.0.0.1:11434/api/tags &>/dev/null; then
  echo "✅ HEALTHY"
else
  echo "❌ NOT RUNNING (Start with: ollama serve)"
fi

# Check git
echo -n "  📦 Git Status... "
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
if git diff --quiet && git diff --cached --quiet; then
  echo "✅ CLEAN"
else
  echo "⚠️  UNCOMMITTED CHANGES"
fi

# Check files
echo -n "  📄 Tool Calling... "
if grep -q "parseToolCalls" src/services/chat/toolCaller.ts; then
  echo "✅ READY"
else
  echo "❌ NOT FOUND"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 2: Instructions
# ═══════════════════════════════════════════════════════════════════

echo "🎯 STEP 2: Testing Instructions"
echo ""
echo "1️⃣  START THE APP:"
echo "    npm run dev:tauri    OR    pnpm run dev:tauri"
echo ""
echo "2️⃣  OPEN BROWSER DEVTOOLS:"
echo "    Press: F12"
echo "    Go to: Console tab"
echo ""
echo "3️⃣  LOOK FOR THESE LOGS:"
echo "    ✅ [ToolCaller] 🔍 PARSING TEXT: ..."
echo "    ✅ [ToolCaller] ✅ JSON MATCH #1: tool_name=..."
echo "    ✅ [ToolCaller] ✨ TOOL CALL PARSED: {...}"
echo ""
echo "4️⃣  TEST REQUESTS (in Chat):"
echo ""
echo "    ┌─ TEST 1: TOOL CALLING (get_time) ─────────────────────────┐"
echo "    │ Message: \"Quelle heure est-il maintenant?\"               │"
echo "    │ Expected: [ToolCaller] JSON MATCH #1: tool_name=get_time   │"
echo "    │           Time returned (ISO + locale + timestamp)         │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 2: TOOL CALLING (calculate) ──────────────────────────┐"
echo "    │ Message: \"Calcule 456 * 123 + 789\"                       │"
echo "    │ Expected: JSON MATCH #1: tool_name=calculate                │"
echo "    │           Result: 56967                                    │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 3: TOOL CALLING (web_search) ─────────────────────────┐"
echo "    │ Message: \"Recherche sur la tour Eiffel\"                  │"
echo "    │ Expected: JSON MATCH #1: tool_name=web_search               │"
echo "    │           Search results displayed                         │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 4: MEMORY PERSISTENCE ────────────────────────────────┐"
echo "    │ Steps:                                                      │"
echo "    │   1. Send 5 messages                                        │"
echo "    │   2. Press F5 (refresh page)                               │"
echo "    │   3. Check messages still there                            │"
echo "    │ Expected: All 5 messages visible, console shows \"Loaded X\"  │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 5: MESSAGE REACTIONS ──────────────────────────────────┐"
echo "    │ Steps:                                                      │"
echo "    │   1. Click on any message                                   │"
echo "    │   2. Click emoji 👍                                         │"
echo "    │   3. Press F5 (refresh)                                    │"
echo "    │ Expected: Emoji shows under message, survives refresh       │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 6: TOKEN COUNTER ─────────────────────────────────────┐"
echo "    │ Steps:                                                      │"
echo "    │   1. Send long message                                      │"
echo "    │   2. Look at message bubbles                                │"
echo "    │ Expected: \"XXX tokens\" shown below message                  │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""
echo "    ┌─ TEST 7: ZOOM CONTROL ──────────────────────────────────────┐"
echo "    │ Steps:                                                      │"
echo "    │   1. Press Ctrl + Plus → Interface larger                   │"
echo "    │   2. Press Ctrl + Minus → Interface smaller                 │"
echo "    │   3. Press Ctrl + 0 → Reset to 75%                         │"
echo "    │   4. Press F5 → zoom value persists                        │"
echo "    │ Expected: Zoom works, survives refresh                     │"
echo "    │ Check: ✅ [ ]                                              │"
echo "    └────────────────────────────────────────────────────────────┘"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 3: Verify localStorage
# ═══════════════════════════════════════════════════════════════════

echo "🔍 STEP 3: Verify localStorage (F12 > Application > Storage)"
echo ""
echo "  Expected keys:"
echo "    ✅ titane_chat_mode_default       (messages + metadata)"
echo "    ✅ titane_message_reactions       (emoji reactions)"
echo "    ✅ titane_zoom_level              (zoom percentage)"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 4: Full Integration Test
# ═══════════════════════════════════════════════════════════════════

echo "🎯 STEP 4: Full Integration Test"
echo ""
echo "  Complete workflow (Tests 1-7 together):"
echo ""
echo "  1️⃣  Send: \"Quelle heure est-il?\" → Check Tool Calling works"
echo "  2️⃣  Message auto-saved → Check Memory works"
echo "  3️⃣  Click emoji on message → Check Reactions works"
echo "  4️⃣  See token count → Check Token Counter works"
echo "  5️⃣  Ctrl+Plus → Check Zoom works"
echo "  6️⃣  Refresh (F5) → Check everything persists"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 5: Expected Results Summary
# ═══════════════════════════════════════════════════════════════════

echo "📊 STEP 5: Expected Results"
echo ""
echo "┌────────────────┬──────────┬─────────────────────────────────┐"
echo "│ Test           │ Status   │ What to see                     │"
echo "├────────────────┼──────────┼─────────────────────────────────┤"
echo "│ Tool: get_time │ ✅ PASS  │ Time in French + ISO format     │"
echo "│ Tool: calc     │ ✅ PASS  │ Math result (56967)             │"
echo "│ Tool: search   │ ✅ PASS  │ Search results + query logged   │"
echo "│ Memory save    │ ✅ PASS  │ Messages persist after F5       │"
echo "│ Reactions      │ ✅ PASS  │ Emoji visible + survives F5     │"
echo "│ Token count    │ ✅ PASS  │ \"XXX tokens\" in message bubble  │"
echo "│ Zoom           │ ✅ PASS  │ Zoom in/out/reset works + saves │"
echo "└────────────────┴──────────┴─────────────────────────────────┘"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 6: If something fails
# ═══════════════════════════════════════════════════════════════════

echo "❓ TROUBLESHOOTING"
echo ""
echo "  If Tool Calling doesn't work:"
echo "    1. Check console for [ToolCaller] logs"
echo "    2. Check that message includes JSON: {\"tool_name\": \"...\"}"
echo "    3. Verify Ollama is running: curl http://127.0.0.1:11434/api/tags"
echo ""
echo "  If Memory doesn't persist:"
echo "    1. Check localStorage in F12 > Application"
echo "    2. Clear cookies/cache if needed"
echo "    3. Check console for [CHAT] logs"
echo ""
echo "  If UI features don't show:"
echo "    1. Hard refresh: Ctrl+Shift+R"
echo "    2. Check browser console for TypeScript errors"
echo "    3. Check Vite terminal for build errors"
echo ""

# ═══════════════════════════════════════════════════════════════════
# STEP 7: Documentation Files
# ═══════════════════════════════════════════════════════════════════

echo "📚 DOCUMENTATION"
echo ""
echo "  Test Suite:              TEST_SUITE_COMPLETE.md"
echo "  Production Report:       PRODUCTION_TEST_REPORT.md"
echo "  Test Script:             test-sprint6-phase3.sh"
echo "  Test Results:            TEST_REPORT_*.txt"
echo ""

echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Ready to test! Follow the steps above and mark checkboxes ✅"
echo ""
