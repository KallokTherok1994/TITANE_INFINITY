#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║ TITANE∞ v12 - Correction Intelligente Warnings Rust                         ║
║ Script de nettoyage automatique et décisions contextuelles                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import re
from pathlib import Path
from typing import List, Set, Dict

# Répertoire racine src-tauri
SRC_DIR = Path(__file__).parent / "src-tauri" / "src"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1: NETTOYAGE DES IMPORTS INUTILISÉS
# ══════════════════════════════════════════════════════════════════════════════

CORE_MODULES = {
    "adaptive_engine", "harmonia", "helios", "memory", 
    "nexus", "self_heal", "sentinel", "watchdog"
}

UTILITY_FUNCTIONS_TO_KEEP = {
    "clamp", "clamp01_f32", "clamp01_f64", "clamp_f32", "clamp_f64",
    "f32_to_f64", "f64_to_f32", "smooth_f32", "smooth_f64",
    "safe_calc_f32", "nudge_to_center_f32", "current_timestamp"
}


def is_core_module_file(filepath: Path) -> bool:
    """Vérifie si le fichier appartient à un module core TITANE"""
    parts = filepath.parts
    if "system" in parts:
        idx = parts.index("system")
        if idx + 1 < len(parts):
            module_name = parts[idx + 1]
            return module_name in CORE_MODULES
    return False


def clean_unused_imports(filepath: Path) -> int:
    """
    Supprime les imports inutilisés intelligemment
    Retourne le nombre de lignes supprimées
    """
    if not filepath.exists():
        return 0
    
    content = filepath.read_text()
    original_lines = content.split('\n')
    new_lines = []
    removed_count = 0
    
    for line in original_lines:
        stripped = line.strip()
        
        # Conserver les imports essentiels
        if any([
            stripped.startswith("use std::"),
            stripped.startswith("use serde::"),
            stripped.startswith("use crate::shared::types::"),
            stripped.startswith("use crate::shared::utils::"),
            "pub use" in stripped,  # Re-exports publics
            stripped.startswith("mod "),  # Déclarations de modules
            not stripped.startswith("use "),  # Lignes non-import
        ]):
            new_lines.append(line)
            continue
        
        # Supprimer imports de modules désactivés dans system/mod.rs
        if "use crate::system::" in stripped:
            # Extraire le nom du module
            match = re.search(r'use crate::system::(\w+)', stripped)
            if match:
                module_name = match.group(1)
                if module_name not in CORE_MODULES:
                    removed_count += 1
                    continue
        
        new_lines.append(line)
    
    if removed_count > 0:
        filepath.write_text('\n'.join(new_lines))
        print(f"✅ {filepath.relative_to(SRC_DIR)}: {removed_count} imports supprimés")
    
    return removed_count


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2: AJOUT DE #[allow(dead_code)] AUX FONCTIONS UTILITAIRES
# ══════════════════════════════════════════════════════════════════════════════

def mark_utility_functions_allow_dead_code():
    """Marque les fonctions utilitaires dans shared/utils.rs avec #[allow(dead_code)]"""
    utils_file = SRC_DIR / "shared" / "utils.rs"
    if not utils_file.exists():
        return 0
    
    content = utils_file.read_text()
    lines = content.split('\n')
    new_lines = []
    added_count = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Détecter les fonctions publiques utilitaires
        if stripped.startswith("pub fn ") or (stripped.startswith("#[inline]") and i + 1 < len(lines) and lines[i + 1].strip().startswith("pub fn ")):
            # Vérifier si #[allow(dead_code)] est déjà présent
            has_allow = False
            for j in range(max(0, i - 3), i):
                if "#[allow(dead_code)]" in lines[j]:
                    has_allow = True
                    break
            
            # Ajouter #[allow(dead_code)] si nécessaire
            if not has_allow and stripped.startswith("pub fn "):
                indent = line[:len(line) - len(line.lstrip())]
                new_lines.append(f"{indent}#[allow(dead_code)]")
                added_count += 1
        
        new_lines.append(line)
    
    if added_count > 0:
        utils_file.write_text('\n'.join(new_lines))
        print(f"✅ shared/utils.rs: {added_count} annotations #[allow(dead_code)] ajoutées")
    
    return added_count


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 3: SUPPRESSION DES PARENTHÈSES INUTILES
# ══════════════════════════════════════════════════════════════════════════════

def remove_unnecessary_parens(filepath: Path) -> int:
    """Supprime les parenthèses inutiles dans les expressions"""
    if not filepath.exists():
        return 0
    
    content = filepath.read_text()
    
    # Patterns de parenthèses inutiles
    patterns = [
        (r'\((\w+)\s*-\s*(\w+)\)', r'\1 - \2'),  # (a - b) -> a - b
        (r'\((\w+)\s*\+\s*(\w+)\)', r'\1 + \2'),  # (a + b) -> a + b
        (r'\((\d+\.\d+)\s*-\s*(\w+)\)', r'\1 - \2'),  # (0.5 - x) -> 0.5 - x
    ]
    
    new_content = content
    replacements = 0
    
    for pattern, replacement in patterns:
        matches = len(re.findall(pattern, new_content))
        new_content = re.sub(pattern, replacement, new_content)
        replacements += matches
    
    if replacements > 0:
        filepath.write_text(new_content)
        print(f"✅ {filepath.relative_to(SRC_DIR)}: {replacements} parenthèses supprimées")
    
    return replacements


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 4: SUPPRESSION FONCTIONS OBSOLÈTES ANALYSIS.RS
# ══════════════════════════════════════════════════════════════════════════════

def clean_analysis_functions():
    """Supprime les fonctions calculate_* inutilisées dans analysis.rs"""
    analysis_file = SRC_DIR / "system" / "adaptive_engine" / "analysis.rs"
    if not analysis_file.exists():
        return 0
    
    content = analysis_file.read_text()
    
    # Vérifier si clamp() est défini localement (dupliqué)
    if re.search(r'^\s*fn clamp\(', content, re.MULTILINE):
        # Supprimer la définition locale de clamp
        content = re.sub(
            r'^fn clamp\([^)]+\)[^}]+\}\s*\n',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # Ajouter l'import depuis shared::utils
        if "use crate::shared::utils::clamp;" not in content:
            # Trouver la section d'imports
            import_section = re.search(r'(use crate::.*?;\n)', content)
            if import_section:
                last_import_pos = import_section.end()
                content = (
                    content[:last_import_pos] +
                    "use crate::shared::utils::clamp;\n" +
                    content[last_import_pos:]
                )
        
        analysis_file.write_text(content)
        print(f"✅ adaptive_engine/analysis.rs: fonction clamp() dupliquée supprimée")
        return 1
    
    return 0


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 5: SUPPRESSION MÉTHODES start() NON UTILISÉES
# ══════════════════════════════════════════════════════════════════════════════

def remove_unused_start_methods():
    """Supprime les méthodes start() non appelées dans les modules core"""
    removed_count = 0
    
    for module_name in CORE_MODULES:
        mod_file = SRC_DIR / "system" / module_name / "mod.rs"
        if not mod_file.exists():
            continue
        
        content = mod_file.read_text()
        
        # Détecter méthode start() inutilisée
        if re.search(r'pub fn start\(&mut self\)', content):
            # Vérifier si elle est appelée dans main.rs
            main_file = SRC_DIR / "main.rs"
            main_content = main_file.read_text() if main_file.exists() else ""
            
            if f"{module_name}.start()" not in main_content and ".start()" not in main_content:
                # Supprimer la méthode start()
                content = re.sub(
                    r'^\s*/// Start.*?\n\s*pub fn start\(&mut self\).*?\n\s*\{.*?\n\s*\}\s*\n',
                    '',
                    content,
                    flags=re.MULTILINE | re.DOTALL
                )
                
                mod_file.write_text(content)
                print(f"✅ {module_name}/mod.rs: méthode start() inutilisée supprimée")
                removed_count += 1
    
    return removed_count


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 6: SUPPRESSION CHAMPS INUTILISÉS
# ══════════════════════════════════════════════════════════════════════════════

def remove_unused_fields():
    """Supprime les champs de structs non utilisés ou les marque avec #[allow(dead_code)]"""
    removed_count = 0
    
    # AdaptiveEngineModule.predicted_load
    adaptive_file = SRC_DIR / "system" / "adaptive_engine" / "mod.rs"
    if adaptive_file.exists():
        content = adaptive_file.read_text()
        
        # Vérifier si predicted_load est vraiment utilisé
        usage_count = content.count("predicted_load") - content.count("pub predicted_load:")
        
        if usage_count <= 2:  # Seulement déclaration + affectation
            # Marquer avec #[allow(dead_code)]
            content = re.sub(
                r'(pub struct AdaptiveEngineModule \{[^}]+)(pub predicted_load: f32,)',
                r'\1#[allow(dead_code)]\n    \2',
                content,
                flags=re.DOTALL
            )
            
            adaptive_file.write_text(content)
            print(f"✅ adaptive_engine/mod.rs: champ predicted_load marqué #[allow(dead_code)]")
            removed_count += 1
    
    return removed_count


# ══════════════════════════════════════════════════════════════════════════════
# PHASE 7: EXÉCUTION COMPLÈTE
# ══════════════════════════════════════════════════════════════════════════════

def process_all_rust_files():
    """Traite récursivement tous les fichiers .rs"""
    total_changes = 0
    
    print("\n" + "═" * 80)
    print("🔧 CORRECTION INTELLIGENTE DES WARNINGS RUST - TITANE∞ v12")
    print("═" * 80 + "\n")
    
    # Phase 1: Nettoyage imports inutilisés
    print("📦 PHASE 1: Nettoyage des imports inutilisés\n")
    import_count = 0
    for rs_file in SRC_DIR.rglob("*.rs"):
        import_count += clean_unused_imports(rs_file)
    
    if import_count == 0:
        print("✅ Aucun import inutilisé détecté")
    
    # Phase 2: Marquer fonctions utilitaires
    print("\n🛠️  PHASE 2: Annotation des fonctions utilitaires\n")
    util_count = mark_utility_functions_allow_dead_code()
    if util_count == 0:
        print("✅ Fonctions utilitaires déjà annotées")
    
    # Phase 3: Suppression parenthèses inutiles
    print("\n🧹 PHASE 3: Suppression des parenthèses inutiles\n")
    paren_count = 0
    for rs_file in SRC_DIR.rglob("*.rs"):
        paren_count += remove_unnecessary_parens(rs_file)
    
    if paren_count == 0:
        print("✅ Aucune parenthèse inutile détectée")
    
    # Phase 4: Nettoyage analysis.rs
    print("\n🔬 PHASE 4: Nettoyage adaptive_engine/analysis.rs\n")
    analysis_count = clean_analysis_functions()
    if analysis_count == 0:
        print("✅ Fichier analysis.rs déjà propre")
    
    # Phase 5: Suppression méthodes start()
    print("\n🚀 PHASE 5: Suppression méthodes start() inutilisées\n")
    start_count = remove_unused_start_methods()
    if start_count == 0:
        print("✅ Aucune méthode start() inutilisée détectée")
    
    # Phase 6: Champs inutilisés
    print("\n📊 PHASE 6: Traitement des champs inutilisés\n")
    field_count = remove_unused_fields()
    if field_count == 0:
        print("✅ Aucun champ inutilisé à traiter")
    
    # Résumé
    total_changes = import_count + util_count + paren_count + analysis_count + start_count + field_count
    
    print("\n" + "═" * 80)
    print("✨ RÉSUMÉ DES CORRECTIONS")
    print("═" * 80)
    print(f"  📦 Imports supprimés        : {import_count}")
    print(f"  🛠️  Annotations ajoutées     : {util_count}")
    print(f"  🧹 Parenthèses supprimées   : {paren_count}")
    print(f"  🔬 Fonctions dupliquées     : {analysis_count}")
    print(f"  🚀 Méthodes start() retirées: {start_count}")
    print(f"  📊 Champs annotés           : {field_count}")
    print(f"  ───────────────────────────────────────")
    print(f"  ✅ TOTAL MODIFICATIONS      : {total_changes}")
    print("═" * 80 + "\n")
    
    if total_changes > 0:
        print("🎯 Exécutez maintenant:")
        print("   cd src-tauri && cargo fmt && cargo clippy --fix --allow-dirty")
        print("   cargo build\n")
    else:
        print("✅ Code déjà propre! Prêt pour la compilation.\n")


if __name__ == "__main__":
    process_all_rust_files()
