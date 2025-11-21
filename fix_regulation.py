#!/usr/bin/env python3
"""Fix regulation.rs - correction rapide des if sans }"""

import re

file_path = "/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/system/adaptive_engine/regulation.rs"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: if ... { return Err(...); (sans })
# Suivi par: if ou autre ligne non-indentée
pattern = re.compile(
    r'(    if [^\{]+\{\n        return Err\([^\)]+\);\n)(    if |fn |#\[|\})',
    re.MULTILINE
)

content = pattern.sub(r'\1    }\n\2', content)

# Pattern: fn xxx() -> f32 { ... expression_seule (sans })
# Cherche: fn ... -> f32 { suivi d'une expression simple
pattern2 = re.compile(
    r'(\) -> f32 \{\n    [^\n]+\n)(/// |fn |#\[)',
    re.MULTILINE
)

content = pattern2.sub(r'\1}\n\n\2', content)

# Pattern: fn apply_constraints sans Ok(())
if 'fn apply_constraints' in content and 'apply_constraints' in content:
    # Ajouter Ok(()) avant fermeture
    pattern3 = re.compile(
        r'(fn apply_constraints\(state: &mut AdaptiveState\) -> Result<\(\), String> \{[^\}]+)(/// |fn )',
        re.DOTALL
    )
    if pattern3.search(content):
        content = pattern3.sub(r'\1\n    Ok(())\n}\n\n\2', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ regulation.rs corrigé")
