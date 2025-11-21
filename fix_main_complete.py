#!/usr/bin/env python3
"""
Correction automatique complète de main.rs
Répare tous les patterns if let (Ok...) = ( avec accolades manquantes
"""

import re

def fix_main_rs_complete(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern 1: Lignes qui se terminent par .lock() sans virgule ni )
    # et sont suivies directement de "if let Err"
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        fixed_lines.append(line)
        
        # Détecter if let (Ok...) = (
        if re.search(r'if let \(Ok.*\) = \($', line.strip()):
            # Collecter les lock() suivants
            j = i + 1
            lock_lines = []
            
            while j < len(lines):
                next_line = lines[j]
                lock_lines.append(next_line)
                
                # Si ligne suivante = if let Err OU log::error sans ) avant
                if 'if let Err' in next_line or ('log::error' in next_line and not next_line.strip().endswith(',')):
                    # Il manque ) { avant cette ligne
                    # Retirer la dernière ligne ajoutée
                    lock_lines.pop()
                    
                    # Ajouter ) { avec bonne indentation
                    indent = '                    '
                    fixed_lines.append(indent + ') {')
                    
                    # Réajouter la ligne
                    fixed_lines.append(next_line)
                    i = j
                    break
                
                # Si ligne termine avec ) ou } seul, on arrête
                if next_line.strip() in [')', ') {', '}', '} else {']:
                    i = j
                    break
                
                j += 1
            
            continue
        
        i += 1
    
    # Pattern 2: Fermer les } manquants après log::error sans }
    final_lines = []
    for i, line in enumerate(fixed_lines):
        final_lines.append(line)
        
        # Si log::error sans } après et ligne suivante = //  ou if let Ok
        if 'log::error!' in line and not line.strip().endswith('}'):
            next_idx = i + 1
            if next_idx < len(fixed_lines):
                next_line = fixed_lines[next_idx]
                if next_line.strip().startswith('//') or next_line.strip().startswith('if let Ok'):
                    # Ajouter }
                    indent = ' ' * (len(line) - len(line.lstrip()) - 4)
                    final_lines.append(indent + '}')
    
    # Écrire résultat
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(final_lines))
    
    print(f"✅ {len(fixed_lines)} → {len(final_lines)} lignes")
    return len(final_lines) - len(fixed_lines)

if __name__ == '__main__':
    import sys
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'src-tauri/src/main.rs'
    added = fix_main_rs_complete(filepath)
    print(f"📝 {added} accolades ajoutées")
