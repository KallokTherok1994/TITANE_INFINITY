#!/usr/bin/env python3
"""Fix memory_v2/mod.rs - fermetures automatiques"""
import re

file_path = "/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/system/memory_v2/mod.rs"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: function sans fermeture après Ok(())
pattern1 = r'(pub fn \w+\([^)]*\) -> Result<[^>]+, [^>]+> \{[^}]+Ok\(\(\))\n(\s*)(pub fn |#\[|impl |\/\/|mod |use |$)'
replacement1 = r'\1\n    }\n\n\2\3'

# Pattern: function sans fermeture après return value
pattern2 = r'(pub fn \w+\([^)]*\) -> [^{]+ \{[^}]+(self\.\w+ = [^;]+;|return [^;]+;))\n(\s*)(pub fn |#\[|impl |\/\/|mod |use |$)'
replacement2 = r'\1\n    }\n\n\3\4'

# Pattern: impl block sans fermeture
pattern3 = r'(impl \w+ \{[^}]+pub fn [^}]+\})\n(\s*)(pub struct |#\[|impl |\/\/|mod |use |$)'
replacement3 = r'\1\n}\n\n\2\3'

# Apply patterns
content = re.sub(pattern1, replacement1, content, flags=re.MULTILINE)
content = re.sub(pattern2, replacement2, content, flags=re.MULTILINE)
content = re.sub(pattern3, replacement3, content, flags=re.MULTILINE)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ memory_v2/mod.rs corrigé")
