#!/usr/bin/env python3
"""
TITANE_INFINITY - Correction automatique des warnings Rust
Script intelligent de nettoyage complet
"""

import os
import re
import subprocess
from pathlib import Path
from typing import List, Dict, Set

class RustWarningFixer:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.src_tauri = self.root_dir / "src-tauri" / "src"
        self.fixes_applied = []
        
    def remove_unused_imports(self, file_path: Path) -> int:
        """Supprime les imports inutilisés de manière intelligente"""
        count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        new_lines = []
        skip_next = False
        
        for i, line in enumerate(lines):
            # Skip imports inutilisés simples (pas pub use)
            if skip_next:
                skip_next = False
                continue
                
            # Patterns d'imports inutilisés à supprimer
            if re.match(r'^\s*use\s+[\w:]+::\{[^}]*\};\s*$', line):
                # Vérifier si c'est un import privé non utilisé
                if 'pub use' not in line:
                    # Analyser si le symbole est utilisé dans le fichier
                    imports = re.findall(r'\w+', line.split('use')[1].split(';')[0])
                    used = any(imp in content for imp in imports if imp not in ['use', 'crate', 'super'])
                    if not used:
                        count += 1
                        continue
            
            new_lines.append(line)
        
        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            self.fixes_applied.append(f"Removed {count} unused imports from {file_path.name}")
        
        return count
    
    def remove_unused_parentheses(self, file_path: Path) -> int:
        """Supprime les parenthèses inutiles"""
        count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern pour parenthèses inutiles dans expressions arithmétiques simples
        patterns = [
            (r'\((\w+)\s*-\s*(\w+)\)', r'\1 - \2'),
            (r'\((\w+)\s*\+\s*(\w+)\)', r'\1 + \2'),
            (r'\((\w+)\s*\*\s*(\w+)\)', r'\1 * \2'),
            (r'\((\w+)\s*/\s*(\w+)\)', r'\1 / \2'),
            (r'\((\d+\.?\d*)\)', r'\1'),
        ]
        
        new_content = content
        for pattern, replacement in patterns:
            matches = re.findall(pattern, new_content)
            if matches:
                count += len(matches)
                new_content = re.sub(pattern, replacement, new_content)
        
        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            self.fixes_applied.append(f"Removed {count} unused parentheses from {file_path.name}")
        
        return count
    
    def add_allow_dead_code(self, file_path: Path, target: str) -> bool:
        """Ajoute #[allow(dead_code)] à un élément spécifique"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher la définition
        patterns = [
            (rf'(pub\s+)?struct\s+{target}', 'struct'),
            (rf'(pub\s+)?fn\s+{target}', 'function'),
            (rf'(pub\s+)?enum\s+{target}', 'enum'),
        ]
        
        for pattern, kind in patterns:
            match = re.search(pattern, content)
            if match:
                # Vérifier si #[allow(dead_code)] existe déjà
                pos = match.start()
                before = content[:pos].split('\n')[-2:]
                if any('#[allow(dead_code)]' in line for line in before):
                    return False
                
                # Insérer #[allow(dead_code)]
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if pattern in line:
                        indent = len(line) - len(line.lstrip())
                        lines.insert(i, ' ' * indent + '#[allow(dead_code)]')
                        break
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))
                
                self.fixes_applied.append(f"Added #[allow(dead_code)] to {kind} {target} in {file_path.name}")
                return True
        
        return False
    
    def remove_unused_functions(self, file_path: Path, functions: List[str]) -> int:
        """Supprime les fonctions inutilisées"""
        count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for func_name in functions:
            # Pattern pour fonction complète
            pattern = rf'(pub\s+)?fn\s+{func_name}\s*\([^)]*\)[^{{]*\{{[^}}]*\}}'
            matches = re.findall(pattern, content, re.DOTALL)
            
            if matches:
                content = re.sub(pattern, '', content, flags=re.DOTALL)
                count += 1
        
        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.fixes_applied.append(f"Removed {count} unused functions from {file_path.name}")
        
        return count
    
    def fix_adaptive_engine_analysis(self):
        """Corrections spécifiques pour adaptive_engine/analysis.rs"""
        analysis_file = self.src_tauri / "system" / "adaptive_engine" / "analysis.rs"
        
        if not analysis_file.exists():
            return
        
        with open(analysis_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remplacer (integrity - anomaly_risk) par integrity - anomaly_risk
        content = re.sub(r'\(integrity\s*-\s*anomaly_risk\)', 'integrity - anomaly_risk', content)
        
        # Ajouter #[inline] et #[allow(dead_code)] aux fonctions d'analyse
        functions = ['calculate_integrity', 'calculate_pressure', 'calculate_harmony', 'calculate_trend']
        
        for func in functions:
            pattern = rf'(pub\s+fn\s+{func})'
            if pattern in content and '#[inline]' not in content[:content.find(func)]:
                content = re.sub(
                    pattern,
                    r'#[inline]\n#[allow(dead_code)]\n\1',
                    content
                )
        
        with open(analysis_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        self.fixes_applied.append("Fixed adaptive_engine/analysis.rs")
    
    def fix_utils_functions(self):
        """Ajoute #[inline] #[allow(dead_code)] aux fonctions utils"""
        utils_files = [
            self.src_tauri / "utils" / "math.rs",
            self.src_tauri / "utils" / "mod.rs",
        ]
        
        for utils_file in utils_files:
            if not utils_file.exists():
                continue
            
            with open(utils_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fonctions utilitaires à marquer
            util_functions = [
                'clamp01_f32', 'clamp01_f64', 'f32_to_f64', 'smooth_f32',
                'lerp', 'normalize', 'clamp'
            ]
            
            for func in util_functions:
                pattern = rf'(pub\s+fn\s+{func})'
                match = re.search(pattern, content)
                if match:
                    # Vérifier si déjà annoté
                    before = content[:match.start()].split('\n')[-3:]
                    if not any('#[inline]' in line for line in before):
                        content = re.sub(
                            pattern,
                            r'#[inline]\n#[allow(dead_code)]\n\1',
                            content,
                            count=1
                        )
            
            with open(utils_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.fixes_applied.append(f"Fixed utils functions in {utils_file.name}")
    
    def process_all_files(self):
        """Traite tous les fichiers .rs"""
        rs_files = list(self.src_tauri.rglob("*.rs"))
        
        print(f"🔍 Analyse de {len(rs_files)} fichiers Rust...")
        
        total_fixes = 0
        
        for rs_file in rs_files:
            # Ignorer les fichiers de test
            if 'test' in str(rs_file).lower():
                continue
            
            # Suppression parenthèses inutiles
            total_fixes += self.remove_unused_parentheses(rs_file)
        
        # Corrections spécifiques
        self.fix_adaptive_engine_analysis()
        self.fix_utils_functions()
        
        return total_fixes
    
    def run_cargo_fmt(self):
        """Exécute cargo fmt"""
        print("\n🔧 Exécution de cargo fmt...")
        try:
            result = subprocess.run(
                ['cargo', 'fmt'],
                cwd=self.root_dir / "src-tauri",
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                self.fixes_applied.append("✅ cargo fmt successful")
                return True
            else:
                print(f"⚠️ cargo fmt failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ cargo fmt error: {e}")
            return False
    
    def generate_report(self):
        """Génère un rapport des corrections"""
        print("\n" + "="*70)
        print("📊 RAPPORT DE CORRECTION DES WARNINGS RUST")
        print("="*70)
        print(f"\n✅ {len(self.fixes_applied)} corrections appliquées:\n")
        
        for fix in self.fixes_applied:
            print(f"  • {fix}")
        
        print("\n" + "="*70)

def main():
    root_dir = "/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY"
    
    print("🚀 TITANE_INFINITY - Correction automatique des warnings Rust")
    print("="*70)
    
    fixer = RustWarningFixer(root_dir)
    
    # Traiter tous les fichiers
    fixes = fixer.process_all_files()
    
    # Exécuter cargo fmt
    fixer.run_cargo_fmt()
    
    # Générer le rapport
    fixer.generate_report()
    
    print("\n✨ Correction terminée!")

if __name__ == "__main__":
    main()
