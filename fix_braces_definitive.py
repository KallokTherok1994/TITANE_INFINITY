#!/usr/bin/env python3
"""
RÉPARATION DÉFINITIVE main.rs - Fix accolades manquantes
"""
import re

filepath = '/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs'

with open(filepath, 'r') as f:
    content = f.read()

# Fix patterns précis avec regex
fixes = [
    # Fix 1: Resonance block (ligne ~393-396)
    (r'(if let Err\(e\) = system::resonance::tick\([^)]+\) \{\s+log::error!\([^)]+\);\s+)(log::error!)', 
     r'\1}\n                } else {\n                    \2'),
    
    # Fix 2: Cortex pattern match (ligne ~398-410)
    (r'(memory\.lock\(\)\s+)\{',
     r'\1) {\n                    '),
    
    # Fix 3: Continuum record_snapshot (ligne ~484-490)
    (r'(20\s+)(log::error!)',
     r'20\n                        ) {\n                            \2'),
    
    # Fix 4: Continuum dependencies error (ligne ~500)
    (r'(\}\s+)\}(\s+log::error!\("🔴 Failed to lock dependencies for Continuum"\);)',
     r'\1}\n                }\n                } else {\n                    \2'),
]

for pattern, replacement in fixes:
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Écrire résultat
with open(filepath, 'w') as f:
    f.write(content)

# Vérifier équilibre accolades
open_count = content.count('{')
close_count = content.count('}')
print(f"✅ Accolades: {open_count} {{ vs {close_count} }}")
print(f"Différence: {abs(open_count - close_count)}")

# Compter parenthèses aussi
open_paren = content.count('(')
close_paren = content.count(')')
print(f"Parenthèses: {open_paren} ( vs {close_paren} )")
print(f"Différence: {abs(open_paren - close_paren)}")
