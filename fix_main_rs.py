#!/usr/bin/env python3
"""
AUTO-FIX: Réparation des accolades main.rs + ajout annotations Tauri
"""
import re

with open('/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs', 'r') as f:
    lines = f.readlines()

# FIX 1: Ajouter } manquant ligne 390 (après log::error Resonance)
# FIX 2: Ajouter ) manquant ligne 402 (tuple pattern match)
# FIX 3: Ajouter } manquant ligne 410 (après log::error Cortex)

output = []
for i, line in enumerate(lines, start=1):
    output.append(line)
    
    # Fix ligne 390: ajouter } après log::error Resonance
    if i == 390 and 'log::error!("🔴 Resonance' in line:
        if not lines[i].strip().startswith('}'):  # Ne pas dupliquer
            output.append('                }\n')
    
    # Fix ligne 395: ajouter } après else log::error Resonance
    if i == 395 and 'log::error!("🔴 Failed to lock Resonance' in line:
        if not lines[i].strip().startswith('}'):
            output.append('                }\n')
    
    # Fix ligne 402: ajouter ) manquant pour tuple pattern
    if i == 402 and 'memory.lock()' in line and not line.strip().endswith(')'):
        output[-1] = line.rstrip() + ')\n'
    
    # Fix ligne 410: ajouter } après log::error dependencies for Cortex
    if i == 410 and 'Failed to lock dependencies for Cortex' in line:
        if i+1 < len(lines) and not lines[i+1].strip().startswith('}'):
            output.append('                    }\n')
    
    # Fix ligne 412: ajouter } après else log::error Cortex
    if i == 412 and 'log::error!("🔴 Failed to lock Cortex' in line:
        if i+1 < len(lines) and not lines[i+1].strip().startswith('}'):
            output.append('                }\n')

# Écrire fichier réparé
with open('/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs', 'w') as f:
    f.writelines(output)

print(f"✅ Réparation main.rs: {len(output)} lignes écrites")

# Maintenant ajouter les annotations Tauri
with open('/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs', 'r') as f:
    content = f.read()

# Ajouter #[tauri::command] devant les 3 handlers
content = re.sub(
    r'(\n)(fn helios_get_metrics\()',
    r'\n#[tauri::command]\n\2',
    content
)
content = re.sub(
    r'(\n)(fn nexus_get_graph\()',
    r'\n#[tauri::command]\n\2',
    content
)
content = re.sub(
    r'(\n)(fn watchdog_get_logs\()',
    r'\n#[tauri::command]\n\2',
    content
)

with open('/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs', 'w') as f:
    f.write(content)

print("✅ Annotations #[tauri::command] ajoutées aux 3 handlers")
