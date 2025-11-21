#!/usr/bin/env python3
"""
Script de réparation automatique des accolades manquantes dans main.rs
Corrige les patterns if let (Ok...) = ( où il manque ) { après les lock()
"""

import re
import sys

def fix_main_rs(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        fixed_lines.append(line)
        
        # Détecter pattern: if let (Ok...) = (
        if re.match(r'\s+if let \(Ok.*\) = \(\s*$', line):
            # Collecter les lignes suivantes jusqu'à trouver une qui ne se termine pas par ','
            j = i + 1
            lock_lines = []
            while j < len(lines) and (lines[j].strip().endswith(',') or 
                                      lines[j].strip().endswith('.lock()') or
                                      '.lock()' in lines[j]):
                lock_lines.append(lines[j])
                j += 1
                if not lines[j-1].strip().endswith(','):
                    break
            
            # Ajouter les lignes de lock
            for lock_line in lock_lines:
                fixed_lines.append(lock_line)
            
            # Vérifier si la ligne suivante commence par "if let Err"
            if j < len(lines) and 'if let Err' in lines[j]:
                # Il manque ) { avant
                fixed_lines.append('                    ) {')
            
            i = j
            continue
        
        i += 1
    
    # Écrire le fichier corrigé
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print(f"✅ Fichier {filepath} corrigé")
    print(f"   {len(lines)} lignes → {len(fixed_lines)} lignes")

if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'src-tauri/src/main.rs'
    fix_main_rs(filepath)
