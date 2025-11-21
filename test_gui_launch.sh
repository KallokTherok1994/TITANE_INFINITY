#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║ TITANE∞ v15.5 - GUI Launch Diagnostic Script                                ║
# ║ Test pour identifier pourquoi la fenêtre GUI ne s'affiche pas               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

BINARY="./src-tauri/target/release/titane-infinity"

echo "═══════════════════════════════════════════════════════════════"
echo " TITANE∞ GUI Launch Diagnostic"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if binary exists
if [[ ! -f "$BINARY" ]]; then
    echo "❌ Binary not found: $BINARY"
    echo "💡 Run: cargo build --release"
    exit 1
fi

echo "✅ Binary found: $BINARY"
echo ""

# Test 1: Check dependencies
echo "🔍 Test 1: Checking WebKit dependencies..."
if flatpak-spawn --host ldd "$BINARY" | grep -q "webkit2gtk-4.1"; then
    echo "✅ WebKit2GTK-4.1 dependency found"
    
    if flatpak-spawn --host ldd "$BINARY" | grep "webkit2gtk-4.1" | grep -q "not found"; then
        echo "❌ WebKit2GTK-4.1 NOT available on system"
        echo "💡 Install: sudo apt install libwebkit2gtk-4.1-dev"
        exit 1
    else
        echo "✅ WebKit2GTK-4.1 available on system"
    fi
else
    echo "⚠️  No webkit2gtk-4.1 dependency found (unexpected)"
fi
echo ""

# Test 2: Test version command (should work)
echo "🔍 Test 2: Testing CLI (--version)..."
if flatpak-spawn --host "$BINARY" --version 2>&1; then
    echo "✅ CLI works"
else
    echo "❌ CLI failed"
    exit 1
fi
echo ""

# Test 3: Launch GUI with timeout and display info
echo "🔍 Test 3: Attempting GUI launch..."
echo "   DISPLAY=$DISPLAY"
echo "   WAYLAND_DISPLAY=$WAYLAND_DISPLAY"
echo ""

echo "🚀 Launching GUI in background..."
echo "   (will timeout after 15 seconds if no window appears)"
echo ""

# Launch in background with logs
flatpak-spawn --host "$BINARY" 2>&1 | tee /tmp/titane_gui_launch.log &
GUI_PID=$!

echo "   PID: $GUI_PID"
echo ""

# Wait and check
for i in {1..15}; do
    sleep 1
    
    # Check if process still running
    if ! kill -0 $GUI_PID 2>/dev/null; then
        echo "❌ Process died after $i seconds"
        echo ""
        echo "📋 Last logs:"
        tail -20 /tmp/titane_gui_launch.log
        exit 1
    fi
    
    # Check if window appeared
    if flatpak-spawn --host wmctrl -l 2>/dev/null | grep -i "titane" || \
       flatpak-spawn --host xdotool search --name "TITANE" 2>/dev/null; then
        echo "✅ Window detected after $i seconds!"
        echo ""
        echo "🎉 GUI launched successfully!"
        echo ""
        echo "Press Ctrl+C to close this script (window will stay open)"
        wait $GUI_PID
        exit 0
    fi
    
    echo "   Waiting... ${i}s"
done

echo ""
echo "⏱️  Timeout: No window detected after 15 seconds"
echo ""
echo "📋 Process info:"
flatpak-spawn --host ps aux | grep titane-infinity | grep -v grep || echo "   Process not found"
echo ""

echo "📋 Last logs:"
tail -30 /tmp/titane_gui_launch.log
echo ""

echo "⚠️  Process still running but no window visible"
echo "💡 Killing process..."
kill $GUI_PID 2>/dev/null || true
wait $GUI_PID 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo " Diagnostic complete - see logs above"
echo "═══════════════════════════════════════════════════════════════"
