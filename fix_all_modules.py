#!/usr/bin/env python3
"""
FIX ALL MODULES - Correction automatique de tous les modules Rust
Ajoute les } manquants après start(), tick(), health()
"""
import os
import re

SRC_PATH = "src-tauri/src/system"

def fix_module(file_path):
    """Répare un fichier mod.rs"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixes = 0
    
    # Fix start() - cherche "Ok(())" sans "}" après
    content = re.sub(
        r'(pub fn start\(&mut self\) -> TitaneResult<\(\)> \{[^}]*?Ok\(\))\n(\s*)(///|pub fn)',
        r'\1\n\2}\n\2\3',
        content,
        flags=re.DOTALL
    )
    if content != original:
        fixes += 1
        original = content
    
    # Fix tick() - cherche dernière ligne avant "/// Get" ou "pub fn health"
    content = re.sub(
        r'(pub fn tick\(&mut self\) -> TitaneResult<\(\)> \{[^}]*?;)\n(\s*)(///|pub fn health)',
        r'\1\n\2Ok(())\n\2}\n\2\3',
        content,
        flags=re.DOTALL
    )
    if content != original:
        fixes += 1
        original = content
    
    # Fix health() - cherche "}" sans "}" après (fermeture ModuleHealth)
    content = re.sub(
        r'(ModuleHealth \{[^}]*?message: format![^}]*?\})\n(\s*)(///|pub fn|\})',
        r'\1\n\2}\n\2\3',
        content,
        flags=re.DOTALL
    )
    if content != original:
        fixes += 1
        original = content
    
    # Fix get_metrics/get_graph - cherche dernière ligne avant "}"
    content = re.sub(
        r'(pub fn get_\w+\(&self\) -> String \{[^}]*?unwrap_or_else\(\|_\| "[^"]*"\.to_string\(\)\))\n(\s*)(///|\})',
        r'\1\n\2}\n\2\3',
        content,
        flags=re.DOTALL
    )
    if content != original:
        fixes += 1
    
    if fixes > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return fixes
    return 0

def main():
    total_fixes = 0
    files_fixed = 0
    
    for root, dirs, files in os.walk(SRC_PATH):
        for file in files:
            if file == "mod.rs":
                path = os.path.join(root, file)
                fixes = fix_module(path)
                if fixes > 0:
                    files_fixed += 1
                    total_fixes += fixes
                    print(f"✅ {path}: {fixes} corrections")
    
    print(f"\n📊 TOTAL: {files_fixed} fichiers / {total_fixes} corrections")

if __name__ == "__main__":
    main()
