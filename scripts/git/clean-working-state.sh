#!/bin/bash
# TITANE∞ — Clean working state (stash or reset)
# Usage: ./clean-working-state.sh [--force]

FORCE_MODE=false

if [[ "$1" == "--force" ]]; then
    FORCE_MODE=true
fi

echo "🧹 TITANE∞ — Clean Working State"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if working directory is clean
if [[ -z $(git status -s) ]]; then
    echo "✅ Working directory is already clean"
    echo "No uncommitted changes"
    exit 0
fi

echo "📋 UNCOMMITTED CHANGES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git status --short
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $FORCE_MODE == true ]]; then
    echo "⚠️  FORCE MODE: Resetting all changes (NO STASH)"
    read -p "❓ Are you sure? This CANNOT be undone (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git reset --hard HEAD
        git clean -fd
        echo "✅ Working directory reset (changes lost)"
    else
        echo "❌ Reset aborted"
        exit 1
    fi
else
    echo "Choose action:"
    echo "  1) Stash changes (safe, can restore later)"
    echo "  2) Reset changes (⚠️  DANGEROUS, cannot restore)"
    echo "  3) Cancel"
    echo ""
    read -p "❓ Select option (1/2/3): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            STASH_MSG="Manual stash via clean-working-state.sh ($(date '+%Y-%m-%d %H:%M:%S'))"
            git stash push -m "$STASH_MSG"
            echo "✅ Changes stashed"
            echo ""
            echo "💡 Restore with: git stash pop"
            echo "💡 View stashes: git stash list"
            ;;
        2)
            read -p "⚠️  Confirm RESET? This will DELETE all changes (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git reset --hard HEAD
                git clean -fd
                echo "✅ Working directory reset (changes lost)"
            else
                echo "❌ Reset cancelled"
            fi
            ;;
        3)
            echo "❌ Cancelled"
            exit 0
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Current status:"
git status --short
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
