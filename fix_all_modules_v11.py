#!/usr/bin/env python3
"""
TITANE INFINITY v11.0 - AUTO-FIX GLOBAL
Correction massive de TOUS les modules avec fermetures manquantes
"""

import os
import re
import sys
from pathlib import Path

# Compteurs
fixed_files = []
errors = []

def fix_module_file(file_path):
    """Corrige un fichier module avec fermetures manquantes"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        changes = 0
        
        # Pattern 1: start() manquant }
        pattern1 = re.compile(
            r'(pub fn start\(&mut self\) -> TitaneResult<\(\)> \{[^\}]+Ok\(\))\n(\s*)(pub fn|fn |///)',
            re.MULTILINE | re.DOTALL
        )
        if pattern1.search(content):
            content = pattern1.sub(r'\1\n\2}\n\2\n\2\3', content)
            changes += 1
        
        # Pattern 2: tick() manquant Ok(()) + }
        # Variante A: tick avec code mais sans Ok(())
        pattern2a = re.compile(
            r'(pub fn tick\([^)]*\) -> TitaneResult<\(\)> \{(?:(?!Ok\(\)).)+ )\n(\s*)(pub fn|fn |///)',
            re.MULTILINE | re.DOTALL
        )
        if pattern2a.search(content):
            content = pattern2a.sub(r'\1\n\2    Ok(())\n\2}\n\2\n\2\3', content)
            changes += 1
        
        # Variante B: tick avec Ok(()) mais sans }
        pattern2b = re.compile(
            r'(pub fn tick\([^)]*\) -> TitaneResult<\(\)> \{[^\}]+Ok\(\))\n(\s*)(pub fn|fn |///)',
            re.MULTILINE | re.DOTALL
        )
        if pattern2b.search(content):
            content = pattern2b.sub(r'\1\n\2}\n\2\n\2\3', content)
            changes += 1
        
        # Pattern 3: health() manquant } else { HealthStatus::Healthy } et fermetures
        pattern3 = re.compile(
            r'(pub fn health\(&self\) -> ModuleHealth \{[^}]+HealthStatus::Degraded)\n(\s*)(HealthStatus::Healthy[^\}]+ModuleHealth \{[^}]+message: format!\([^)]+\),)\n(\s*)(pub fn|fn |///)',
            re.MULTILINE | re.DOTALL
        )
        if pattern3.search(content):
            content = pattern3.sub(r'\1\n\2} else {\n\2    HealthStatus::Healthy\n\2};\n\2\n\2\3\n\4}\n\4}\n\4\n\4\5', content)
            changes += 1
        
        # Pattern 4: Variante health() plus simple
        pattern4 = re.compile(
            r'(else if [^{]+\{[^}]+HealthStatus::Degraded)\n(\s+)(HealthStatus::Healthy)',
            re.MULTILINE
        )
        if pattern4.search(content):
            content = pattern4.sub(r'\1\n\2} else {\n\2    \3', content)
            changes += 1
        
        # Pattern 5: ModuleHealth struct manquant }
        pattern5 = re.compile(
            r'(ModuleHealth \{[^}]+message: format!\([^)]+\),)\n(\s*)(pub fn|fn |///)',
            re.MULTILINE | re.DOTALL
        )
        if pattern5.search(content):
            content = pattern5.sub(r'\1\n\2}\n\2}\n\2\n\2\3', content)
            changes += 1
        
        # Pattern 6: Fonction get_metrics/get_graph/get_logs sans }
        pattern6 = re.compile(
            r'(pub fn get_(?:metrics|graph|logs)\([^)]*\)[^{]+\{[^}]+\.collect\(\))\n(\s*)\}(\s*)$',
            re.MULTILINE | re.DOTALL
        )
        if pattern6.search(content):
            content = pattern6.sub(r'\1\n\2}\n\2}\n', content)
            changes += 1
        
        # Pattern 7: impl block final manquant }
        if content.rstrip().endswith('collect()'):
            content += '\n    }\n}\n'
            changes += 1
        elif not content.rstrip().endswith('}'):
            content += '\n}\n'
            changes += 1
        
        if changes > 0 and content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_files.append(file_path)
            print(f"✅ FIXED: {file_path.relative_to(base_dir)} ({changes} patterns)")
            return True
        
        return False
        
    except Exception as e:
        errors.append((file_path, str(e)))
        print(f"❌ ERROR: {file_path}: {e}")
        return False

# Chemin base
base_dir = Path("/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/system")

# Liste des modules prioritaires à corriger
priority_modules = [
    "adaptive_engine", "memory", "memory_v2",
    "cortex", "resonance", "ans", "swarm", "field", "continuum",
    "kernel", "secureflow", "lowflow", "stability", "integrity", "balance",
    "pulse", "flowsync", "harmonic", "deepsense", "deepalignment",
    "vitalcore", "neurofield", "neuromesh", "coremesh", "metacortex",
    "governor", "conscience", "adaptive", "evolution", "sentient",
    "harmonic_brain", "meta_integration", "architecture",
    "central_governor", "executive_flow", "strategic_intelligence",
    "intention", "action_potential", "dashboard", "self_healing_v2",
    "energetic", "resonance_v2", "meaning", "identity",
    "self_alignment", "taskflow", "mission", "adaptive_intelligence",
    "autonomic_evolution"
]

print("=" * 80)
print("TITANE INFINITY v11.0 - AUTO-FIX GLOBAL")
print("=" * 80)
print(f"Analyse: {base_dir}")
print()

# Correction des modules prioritaires
for module_name in priority_modules:
    mod_file = base_dir / module_name / "mod.rs"
    if mod_file.exists():
        fix_module_file(mod_file)

# Scan ALL autres modules
all_mods = list(base_dir.glob("*/mod.rs"))
for mod_file in all_mods:
    if mod_file.parent.name not in priority_modules:
        fix_module_file(mod_file)

print()
print("=" * 80)
print(f"✅ Fichiers corrigés: {len(fixed_files)}")
print(f"❌ Erreurs: {len(errors)}")
print("=" * 80)

if fixed_files:
    print("\nFichiers modifiés:")
    for f in fixed_files[:20]:
        print(f"  - {f.relative_to(base_dir.parent)}")
    if len(fixed_files) > 20:
        print(f"  ... et {len(fixed_files) - 20} autres")

sys.exit(0 if len(errors) == 0 else 1)
