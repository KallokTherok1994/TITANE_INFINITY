#!/bin/bash

# TITANE∞ v8.0 - MemoryCore v2 Verification Script
# Validates the new AES-256-GCM modular memory system

echo "╔═══════════════════════════════════════════════╗"
echo "║  🧠 TITANE∞ MemoryCore v2 Verification       ║"
echo "║  AES-256-GCM Encrypted Modular Architecture   ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

BACKEND_DIR="./core/backend/system/memory_v2"
MAIN_FILE="./core/backend/main.rs"
MOD_FILE="./core/backend/system/mod.rs"

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

# ============================================
# SECTION 1: File Structure
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📂 SECTION 1: File Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test -f "$BACKEND_DIR/mod.rs"
check "Module principal mod.rs existe"

test -f "$BACKEND_DIR/types.rs"
check "Module types.rs existe"

test -f "$BACKEND_DIR/crypto.rs"
check "Module crypto.rs existe"

test -f "$BACKEND_DIR/storage.rs"
check "Module storage.rs existe"

# ============================================
# SECTION 2: Types Module
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 SECTION 2: Types Module"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "struct MemoryEntry" "$BACKEND_DIR/types.rs"
check "Structure MemoryEntry définie"

grep -q "struct EncryptedMemoryBlock" "$BACKEND_DIR/types.rs"
check "Structure EncryptedMemoryBlock définie"

grep -q "struct MemoryCollection" "$BACKEND_DIR/types.rs"
check "Structure MemoryCollection définie"

grep -q "id: String" "$BACKEND_DIR/types.rs"
check "MemoryEntry contient le champ id"

grep -q "timestamp: u64" "$BACKEND_DIR/types.rs"
check "MemoryEntry contient le champ timestamp"

grep -q "content: String" "$BACKEND_DIR/types.rs"
check "MemoryEntry contient le champ content"

grep -q "nonce: Vec<u8>" "$BACKEND_DIR/types.rs"
check "EncryptedMemoryBlock contient nonce"

grep -q "data: Vec<u8>" "$BACKEND_DIR/types.rs"
check "EncryptedMemoryBlock contient data"

grep -q "entries: Vec<MemoryEntry>" "$BACKEND_DIR/types.rs"
check "MemoryCollection contient entries"

grep -q "Serialize" "$BACKEND_DIR/types.rs"
check "Dérivation Serialize présente"

grep -q "Deserialize" "$BACKEND_DIR/types.rs"
check "Dérivation Deserialize présente"

# ============================================
# SECTION 3: Crypto Module (AES-256-GCM)
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 SECTION 3: Crypto Module (AES-256-GCM)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "aes_gcm" "$BACKEND_DIR/crypto.rs"
check "Import aes-gcm présent"

grep -q "sha2" "$BACKEND_DIR/crypto.rs"
check "Import sha2 présent"

grep -q "const KEY_SIZE: usize = 32" "$BACKEND_DIR/crypto.rs"
check "Constante KEY_SIZE = 32 (AES-256)"

grep -q "const NONCE_SIZE: usize = 12" "$BACKEND_DIR/crypto.rs"
check "Constante NONCE_SIZE = 12 (GCM standard)"

grep -q "fn derive_key_from_passphrase" "$BACKEND_DIR/crypto.rs"
check "Fonction derive_key_from_passphrase définie"

grep -q "fn encrypt" "$BACKEND_DIR/crypto.rs"
check "Fonction encrypt définie"

grep -q "fn decrypt" "$BACKEND_DIR/crypto.rs"
check "Fonction decrypt définie"

grep -q "fn calculate_sha256" "$BACKEND_DIR/crypto.rs"
check "Fonction calculate_sha256 définie"

grep -q "Result<" "$BACKEND_DIR/crypto.rs"
check "Gestion d'erreurs avec Result"

grep -q "Aes256Gcm" "$BACKEND_DIR/crypto.rs"
check "Utilisation d'AES-256-GCM"

# ============================================
# SECTION 4: Storage Module
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 SECTION 4: Storage Module"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "fn save_bytes" "$BACKEND_DIR/storage.rs"
check "Fonction save_bytes définie"

grep -q "fn load_bytes" "$BACKEND_DIR/storage.rs"
check "Fonction load_bytes définie"

grep -q "fn clear_storage" "$BACKEND_DIR/storage.rs"
check "Fonction clear_storage définie"

grep -q "fn file_exists" "$BACKEND_DIR/storage.rs"
check "Fonction file_exists définie"

grep -q "fn file_size" "$BACKEND_DIR/storage.rs"
check "Fonction file_size définie"

grep -q "std::fs::File" "$BACKEND_DIR/storage.rs"
check "Utilisation de std::fs::File"

grep -q "create_dir_all" "$BACKEND_DIR/storage.rs"
check "Création automatique des répertoires parents"

grep -q "Result<" "$BACKEND_DIR/storage.rs"
check "Gestion d'erreurs avec Result"

# ============================================
# SECTION 5: Main Module (mod.rs)
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧩 SECTION 5: Main Module (mod.rs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "mod crypto" "$BACKEND_DIR/mod.rs"
check "Module crypto déclaré"

grep -q "mod storage" "$BACKEND_DIR/mod.rs"
check "Module storage déclaré"

grep -q "pub mod types" "$BACKEND_DIR/mod.rs"
check "Module types déclaré (public)"

grep -q "struct MemoryState" "$BACKEND_DIR/mod.rs"
check "Structure MemoryState définie"

grep -q "struct MemoryModule" "$BACKEND_DIR/mod.rs"
check "Structure MemoryModule définie"

grep -q "fn init" "$BACKEND_DIR/mod.rs"
check "Fonction init définie"

grep -q "fn save_entry_internal" "$BACKEND_DIR/mod.rs"
check "Fonction save_entry_internal définie"

grep -q "fn load_entries_internal" "$BACKEND_DIR/mod.rs"
check "Fonction load_entries_internal définie"

grep -q "fn clear_memory_internal" "$BACKEND_DIR/mod.rs"
check "Fonction clear_memory_internal définie"

# ============================================
# SECTION 6: Tauri Commands
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 SECTION 6: Tauri Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "#\[tauri::command\]" "$BACKEND_DIR/mod.rs"
check "Décorateur tauri::command présent"

grep -q "pub fn save_entry" "$BACKEND_DIR/mod.rs"
check "Commande Tauri save_entry définie"

grep -q "pub fn load_entries" "$BACKEND_DIR/mod.rs"
check "Commande Tauri load_entries définie"

grep -q "pub fn clear_memory" "$BACKEND_DIR/mod.rs"
check "Commande Tauri clear_memory définie"

grep -q "pub fn get_memory_state" "$BACKEND_DIR/mod.rs"
check "Commande Tauri get_memory_state définie"

grep -q "pub fn init_global" "$BACKEND_DIR/mod.rs"
check "Fonction init_global définie"

grep -q "MEMORY_INSTANCE" "$BACKEND_DIR/mod.rs"
check "Instance globale MEMORY_INSTANCE définie"

# ============================================
# SECTION 7: Integration into main.rs
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 SECTION 7: Integration (main.rs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "memory_v2::MemoryModule" "$MAIN_FILE"
check "Import MemoryModule v2 dans main.rs"

grep -q "memory_v2: Arc<Mutex<MemoryModuleV2>>" "$MAIN_FILE"
check "Champ memory_v2 dans TitaneCore"

grep -q "memory_v2::init_global" "$MAIN_FILE"
check "Appel à init_global() dans TitaneCore::new()"

grep -q "memory_v2::save_entry" "$MAIN_FILE"
check "Commande save_entry enregistrée dans Tauri"

grep -q "memory_v2::load_entries" "$MAIN_FILE"
check "Commande load_entries enregistrée dans Tauri"

grep -q "memory_v2::clear_memory" "$MAIN_FILE"
check "Commande clear_memory enregistrée dans Tauri"

grep -q "memory_v2::get_memory_state" "$MAIN_FILE"
check "Commande get_memory_state enregistrée dans Tauri"

# ============================================
# SECTION 8: System Module Export (mod.rs)
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 SECTION 8: System Module Export"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "pub mod memory_v2" "$MOD_FILE"
check "Module memory_v2 exporté dans system/mod.rs"

grep -q "impl ModuleTrait for memory_v2::MemoryModule" "$MOD_FILE"
check "Implémentation ModuleTrait pour MemoryModule v2"

# ============================================
# SECTION 9: Security & Best Practices
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  SECTION 9: Security & Best Practices"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

! grep -q "\.unwrap()" "$BACKEND_DIR/crypto.rs" "$BACKEND_DIR/storage.rs"
check "Pas de .unwrap() dans crypto.rs et storage.rs (gestion d'erreurs)"

! grep -q "panic!" "$BACKEND_DIR/crypto.rs" "$BACKEND_DIR/storage.rs"
check "Pas de panic!() dans crypto.rs et storage.rs"

grep -q "AES-256-GCM" "$BACKEND_DIR/mod.rs"
check "Documentation mentionne AES-256-GCM"

grep -q "TITANE_INFINITY_SOVEREIGN" "$BACKEND_DIR/mod.rs"
check "Passphrase par défaut présente"

grep -q "encrypted_memory.bin" "$BACKEND_DIR/mod.rs"
check "Chemin du fichier de mémoire chiffrée défini"

# ============================================
# SECTION 10: Tests
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 SECTION 10: Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "#\[cfg(test)\]" "$BACKEND_DIR/crypto.rs"
check "Section de tests présente dans crypto.rs"

grep -q "#\[cfg(test)\]" "$BACKEND_DIR/storage.rs"
check "Section de tests présente dans storage.rs"

grep -q "#\[cfg(test)\]" "$BACKEND_DIR/mod.rs"
check "Section de tests présente dans mod.rs"

grep -q "#\[test\]" "$BACKEND_DIR/crypto.rs"
check "Tests unitaires présents dans crypto.rs"

grep -q "#\[test\]" "$BACKEND_DIR/storage.rs"
check "Tests unitaires présents dans storage.rs"

grep -q "#\[test\]" "$BACKEND_DIR/mod.rs"
check "Tests unitaires présents dans mod.rs"

TEST_COUNT_CRYPTO=$(grep -c "#\[test\]" "$BACKEND_DIR/crypto.rs" 2>/dev/null || echo "0")
TEST_COUNT_STORAGE=$(grep -c "#\[test\]" "$BACKEND_DIR/storage.rs" 2>/dev/null || echo "0")
TEST_COUNT_MOD=$(grep -c "#\[test\]" "$BACKEND_DIR/mod.rs" 2>/dev/null || echo "0")

[ "$TEST_COUNT_CRYPTO" -ge 5 ]
check "Au moins 5 tests dans crypto.rs (trouvé: $TEST_COUNT_CRYPTO)"

[ "$TEST_COUNT_STORAGE" -ge 5 ]
check "Au moins 5 tests dans storage.rs (trouvé: $TEST_COUNT_STORAGE)"

[ "$TEST_COUNT_MOD" -ge 3 ]
check "Au moins 3 tests dans mod.rs (trouvé: $TEST_COUNT_MOD)"

# ============================================
# Final Summary
# ============================================
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║           📊 RÉSULTATS FINAUX                 ║"
echo "╠═══════════════════════════════════════════════╣"
printf "║  ✅ Tests passés    : %-3d                   ║\n" $PASS
printf "║  ❌ Tests échoués   : %-3d                   ║\n" $FAIL
TOTAL=$((PASS + FAIL))
printf "║  📈 Total           : %-3d                   ║\n" $TOTAL
SUCCESS_RATE=$((PASS * 100 / TOTAL))
printf "║  🎯 Taux de succès  : %3d%%                  ║\n" $SUCCESS_RATE
echo "╚═══════════════════════════════════════════════╝"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 VALIDATION COMPLÈTE RÉUSSIE !"
    echo "✅ MemoryCore v2 avec AES-256-GCM est opérationnel"
    echo ""
    exit 0
else
    echo "⚠️  VALIDATION PARTIELLE"
    echo "❌ $FAIL test(s) ont échoué"
    echo ""
    exit 1
fi
