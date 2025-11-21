#!/usr/bin/env python3
"""Reconstruction complète memory_v2/mod.rs"""
import re

file_path = "/tmp/memory_v2_backup.rs"
output_path = "/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/system/memory_v2/mod.rs"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Reconstruction ligne par ligne avec détection des patterns
fixed_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    fixed_lines.append(line)
    
    # Détection fin de fonction (Ok(()) sans })
    if 'Ok(())' in line and i + 1 < len(lines):
        next_line = lines[i + 1]
        # Si ligne suivante est } orphelin de sed
        if next_line.strip() == '}' and (i + 2 < len(lines) and lines[i + 2].strip() == '}'):
            # Garder un seul }
            fixed_lines.append('    }\n')
            i += 2  # Skip les 2 }
            i += 1
            continue
        # Si ligne suivante commence par /// ou pub fn, ajouter }
        elif next_line.strip().startswith(('///', 'pub fn', 'fn ', '#[')):
            fixed_lines.append('    }\n\n')
    
    # Détection fin de Self {} sans }
    if re.search(r'Self \{[^}]+\}\s*$', line) and i + 1 < len(lines):
        next_line = lines[i + 1]
        if next_line.strip().startswith(('///', 'pub fn', 'impl ')):
            fixed_lines.append('    }\n\n')
    
    # Détection return value sans }
    if re.search(r'return \w+;?\s*$', line) or re.search(r'^\s+\w+\s*$', line):
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.strip().startswith(('///', 'pub fn', 'fn ', '#[')):
                fixed_lines.append('    }\n\n')
    
    i += 1

# Écriture
with open(output_path, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("✅ memory_v2/mod.rs reconstruit")
