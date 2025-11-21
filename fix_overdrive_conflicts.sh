#!/bin/bash

# Script de fix rapide pour résoudre les conflits de commandes Overdrive
# Ce script commente les commandes Tauri en double dans overdrive/auto_heal.rs

set -e

cd "$(dirname "$0")/src-tauri/src/overdrive"

echo "🔧 Fix des conflits Overdrive..."

# 1. Commenter les 3 commandes auto_heal en conflit dans overdrive/auto_heal.rs
echo "  → Commentaire des commandes auto_heal dupliquées..."
sed -i '/^#\[tauri::command\]/,/^pub fn auto_heal_scan/{ s/^#\[tauri::command\]/\/\/ DISABLED: Conflit avec src\/auto_heal.rs\n\/\/ #[tauri::command]/; s/^pub fn auto_heal_scan/\/\/ pub fn auto_heal_scan_v3/ }' auto_heal.rs
sed -i '/^#\[tauri::command\]/,/^pub fn auto_heal_repair/{ s/^#\[tauri::command\]/\/\/ #[tauri::command]/; s/^pub fn auto_heal_repair/\/\/ pub fn auto_heal_repair_v3/ }' auto_heal.rs  
sed -i '/^#\[tauri::command\]/,/^pub fn auto_heal_get_logs/{ s/^#\[tauri::command\]/\/\/ #[tauri::command]/; s/^pub fn auto_heal_get_logs/\/\/ pub fn auto_heal_get_logs_v3/ }' auto_heal.rs

# 2. Commenter memory_clear dans overdrive/memory_engine.rs
echo "  → Commentaire de memory_clear dupliquée..."
sed -i '/^#\[tauri::command\]/,/^pub fn memory_clear/{ s/^#\[tauri::command\]/\/\/ DISABLED: Conflit avec commands\/mod.rs\n\/\/ #[tauri::command]/; s/^pub fn memory_clear/\/\/ pub fn memory_clear_overdrive/ }' memory_engine.rs

# 3. Commenter exp_get_talents dans overdrive/exp_engine.rs
echo "  → Commentaire de exp_get_talents dupliquée..."
sed -i '/^#\[tauri::command\]/,/^pub fn exp_get_talents/{ s/^#\[tauri::command\]/\/\/ DISABLED: Conflit avec commands\/exp_fusion.rs\n\/\/ #[tauri::command]/; s/^pub fn exp_get_talents/\/\/ pub fn exp_get_talents_overdrive/ }' exp_engine.rs

echo "✅ Conflits résolus !"
echo ""
echo "ℹ️  Les commandes suivantes ont été désactivées :"
echo "   - overdrive::auto_heal::auto_heal_scan (→ utiliser auto_heal::auto_heal_scan)"
echo "   - overdrive::auto_heal::auto_heal_repair (→ utiliser auto_heal::auto_heal_repair)"
echo "   - overdrive::auto_heal::auto_heal_get_logs (→ utiliser auto_heal::auto_heal_get_logs)"
echo "   - overdrive::memory_engine::memory_clear (→ utiliser commands::memory_clear)"
echo "   - overdrive::exp_engine::exp_get_talents (→ utiliser commands::exp_fusion::exp_get_talents)"
echo ""
echo "🚀 Testez la compilation : cargo check"
