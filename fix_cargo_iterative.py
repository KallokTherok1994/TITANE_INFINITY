#!/usr/bin/env python3
"""
TITANE INFINITY v11.0 - AUTO-FIX COMPLET PHASE 2
Détection et correction exhaustive de tous les problèmes de fermeture
"""

import os
import re
import subprocess
from pathlib import Path

base_dir = Path("/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri")

def run_cargo_check():
    """Execute cargo check et retourne les erreurs"""
    os.chdir(base_dir)
    result = subprocess.run(
        "source $HOME/.cargo/env && cargo check 2>&1",
        shell=True,
        capture_output=True,
        text=True,
        executable='/bin/bash'
    )
    return result.stdout + result.stderr

def extract_error_files(output):
    """Extrait les fichiers avec erreurs depuis cargo check"""
    files = set()
    for line in output.split('\n'):
        if '.rs:' in line and '-->' in line:
            match = re.search(r'--> (src/[^:]+\.rs):(\d+)', line)
            if match:
                files.add((match.group(1), int(match.group(2))))
    return list(files)

def fix_unclosed_function(file_path, line_no):
    """Corrige une fonction avec fermeture manquante"""
    with open(base_dir / file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Cherche la fonction avant la ligne d'erreur
    for i in range(line_no - 1, max(0, line_no - 50), -1):
        line = lines[i]
        
        # Pattern: pub fn xxx() ... Ok(()) SANS }
        if 'pub fn ' in line and '(' in line:
            # Vérifie si Ok(()) présent sans }
            if i + 1 < len(lines) and 'Ok(())' in lines[i+1]:
                if i + 2 < len(lines) and not lines[i+2].strip().startswith('}'):
                    # Ajoute }
                    lines.insert(i + 2, '    }\n    \n')
                    print(f"  ✅ Ajout }} après Ok(()) ligne {i+2} dans {file_path}")
                    with open(base_dir / file_path, 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    return True
        
        # Pattern: pub fn xxx() { ... (sans Ok ni })
        if 'pub fn ' in line and '->' in line and 'TitaneResult' in line:
            # Cherche la fin de cette fonction
            brace_count = 0
            for j in range(i, min(len(lines), i + 100)):
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count == 0 and j > i:
                    # Fonction fermée correctement
                    break
                if j == min(len(lines), i + 100) - 1 and brace_count > 0:
                    # Fonction non fermée - ajoute Ok(()) + }
                    indent = '    '
                    lines.insert(j + 1, f'{indent}Ok(())\n{indent}}}\n{indent}\n')
                    print(f"  ✅ Fermeture fonction ligne {j+1} dans {file_path}")
                    with open(base_dir / file_path, 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    return True
    
    return False

def fix_impl_block(file_path):
    """Vérifie et corrige le impl block final"""
    with open(base_dir / file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Cherche impl XXX {
    impl_matches = list(re.finditer(r'^impl\s+\w+\s*\{', content, re.MULTILINE))
    if not impl_matches:
        return False
    
    # Compte les { et } après le dernier impl
    last_impl_pos = impl_matches[-1].start()
    after_impl = content[last_impl_pos:]
    
    open_braces = after_impl.count('{')
    close_braces = after_impl.count('}')
    
    if open_braces > close_braces:
        # Manque des }
        missing = open_braces - close_braces
        content += '\n' + ('}\n' * missing)
        with open(base_dir / file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Ajout {missing} }} impl block dans {file_path}")
        return True
    
    return False

print("=" * 80)
print("TITANE INFINITY v11.0 - AUTO-FIX PHASE 2")
print("Détection et correction intelligente via cargo check")
print("=" * 80)
print()

iteration = 0
max_iterations = 20

while iteration < max_iterations:
    iteration += 1
    print(f"\n🔄 Itération {iteration}/{max_iterations}")
    print("Lancement cargo check...")
    
    output = run_cargo_check()
    error_files = extract_error_files(output)
    
    if not error_files:
        if 'Finished' in output and 'error' not in output.lower():
            print("\n✅ SUCCESS! Aucune erreur de compilation détectée!")
            print("Backend TITANE∞ compilé avec succès!")
            break
        else:
            print("\n⚠️ Pas d'erreurs trouvées mais compilation incomplète")
            print(output[-500:])
            break
    
    print(f"📌 {len(error_files)} fichier(s) avec erreurs détectés")
    
    fixed_any = False
    for file_path, line_no in error_files[:5]:  # Traite max 5 fichiers par itération
        print(f"\n🔧 Correction: {file_path}:{line_no}")
        
        # Essaie correction fonction
        if fix_unclosed_function(file_path, line_no):
            fixed_any = True
            continue
        
        # Essaie correction impl block
        if fix_impl_block(file_path):
            fixed_any = True
            continue
        
        print(f"  ⚠️ Correction manuelle nécessaire pour {file_path}:{line_no}")
    
    if not fixed_any:
        print("\n❌ Aucune correction automatique possible")
        print("Erreurs nécessitant intervention manuelle:")
        for file_path, line_no in error_files[:10]:
            print(f"  - {file_path}:{line_no}")
        break

print("\n" + "=" * 80)
print(f"Itérations effectuées: {iteration}")
print("=" * 80)
