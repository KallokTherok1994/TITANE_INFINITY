#!/usr/bin/env python3
"""
AUTO-FIX PROPRE: Ajout annotations #[tauri::command] UNIQUEMENT
Lecture main.rs, ajout annotation AVANT chaque fonction, ré-écriture.
"""

filepath = '/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/main.rs'

with open(filepath, 'r') as f:
    lines = f.readlines()

output_lines = []
i = 0
annotations_added = 0

while i < len(lines):
    line = lines[i]
    
    # Détecter les 3 handlers Tauri qui manquent l'annotation
    if ('fn helios_get_metrics(' in line or 
        'fn nexus_get_graph(' in line or 
        'fn watchdog_get_logs(' in line):
        
        # Vérifier si annotation déjà présente ligne précédente
        if i > 0 and '#[tauri::command]' not in lines[i-1]:
            # Ajouter annotation AVANT la fonction
            output_lines.append('#[tauri::command]\n')
            annotations_added += 1
    
    output_lines.append(line)
    i += 1

# Écrire résultat
with open(filepath, 'w') as f:
    f.writelines(output_lines)

print(f"✅ {annotations_added} annotations #[tauri::command] ajoutées")
print(f"📄 Total lignes: {len(output_lines)}")

# Vérification
with open(filepath, 'r') as f:
    content = f.read()
    count = content.count('#[tauri::command]')
    print(f"🔍 Total annotations dans le fichier: {count}")
