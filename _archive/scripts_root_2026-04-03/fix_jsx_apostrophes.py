#!/usr/bin/env python3
"""
Fix unescaped apostrophes in JSX/TSX files
Replaces ' with &apos; in JSX content
"""

import re
import os
from pathlib import Path

def fix_jsx_apostrophes(file_path):
    """Fix apostrophes in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern pour trouver les apostrophes dans les attributs JSX et le contenu
    # Remplace ' par &apos; sauf dans les strings JS
    
    patterns = [
        (r"(\w)n't(\s|<)", r"\1n&apos;t\2"),  # don't, can't, won't, etc.
        (r"(\w)'s(\s|<)", r"\1&apos;s\2"),     # it's, that's, etc.
        (r"(\w)'re(\s|<)", r"\1&apos;re\2"),   # we're, they're, etc.
        (r"(\w)'ve(\s|<)", r"\1&apos;ve\2"),   # I've, we've, etc.
        (r"(\w)'ll(\s|<)", r"\1&apos;ll\2"),   # I'll, we'll, etc.
        (r"(\w)'d(\s|<)", r"\1&apos;d\2"),     # I'd, we'd, etc.
        (r"(\w)'m(\s|<)", r"\1&apos;m\2"),     # I'm
        (r"Let's(\s|<)", r"Let&apos;s\1"),     # Let's
        (r"What's(\s|<)", r"What&apos;s\1"),   # What's
        (r"There's(\s|<)", r"There&apos;s\1"), # There's
        (r"Here's(\s|<)", r"Here&apos;s\1"),   # Here's
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Fix all JSX/TSX files"""
    src_dir = Path("src")
    fixed_count = 0
    file_count = 0
    
    for ext in ["*.tsx", "*.jsx"]:
        for file_path in src_dir.rglob(ext):
            file_count += 1
            if fix_jsx_apostrophes(file_path):
                fixed_count += 1
                print(f"✓ {file_path}")
    
    print(f"\n✅ {fixed_count}/{file_count} fichiers corrigés")
    return fixed_count

if __name__ == "__main__":
    os.chdir(Path(__file__).parent.parent)
    main()
