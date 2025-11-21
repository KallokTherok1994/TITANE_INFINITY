#!/usr/bin/env python3
"""
Correction PRÉCISE des accolades manquantes dans main.rs TITANE
Répare le pattern spécifique :
  if let (Ok...) = (
      ...lock()
      ...lock()
  [ICI MANQUE ) { ]
      if let Err(e) = system::xxx::tick(
"""

import re

def fix_precise_pattern(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    fixed_lines = []
    i = 0
    fixes = 0
    
    while i < len(lines):
        line = lines[i]
        fixed_lines.append(line)
        
        # Détecter: ligne avec .lock() SANS virgule finale
        if '.lock()' in line and not line.rstrip().endswith(','):
            # Vérifier ligne suivante
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                
                # Si ligne suivante contient "if let Err" ou "log::error"
                if ('if let Err' in next_line or 
                    ('log::error' in next_line)):
                    
                    # Trouver l'indentation
                    indent = len(line) - len(line.lstrip())
                    
                    # Ajouter ) { avec indentation appropriée
                    close_paren = ' ' * indent + ') {\n'
                    fixed_lines.append(close_paren)
                    fixes += 1
                    print(f"✅ Ligne {i+1}: Ajout ) {{ après .lock()")
        
        i += 1
    
    # Écrire le résultat
    with open(filepath, 'w') as f:
        f.writelines(fixed_lines)
    
    print(f"\n📊 Total: {fixes} corrections appliquées")
    print(f"📝 {len(lines)} lignes → {len(fixed_lines)} lignes")
    
    return fixes

if __name__ == '__main__':
    import sys
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'src-tauri/src/main.rs'
    fix_precise_pattern(filepath)
