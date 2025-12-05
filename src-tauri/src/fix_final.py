#!/usr/bin/env python3
import re

# Lire fichier corrompu
with open('main.rs', 'r') as f:
    content = f.read()

# Supprimer TOUTES les annotations #[tauri::command] existantes
content = re.sub(r'#\[tauri::command\]\s*\n', '', content)

# Ajouter annotation proprement AVANT chaque handler (3)
content = re.sub(
    r'\n(fn helios_get_metrics\(state: State<Arc<Mutex<TitaneCore>>>\) -> Result<String, String> \{)',
    r'\n#[tauri::command]\n\1',
    content,
    count=1
)
content = re.sub(
    r'\n(fn nexus_get_graph\(state: State<Arc<Mutex<TitaneCore>>>\) -> Result<String, String> \{)',
    r'\n#[tauri::command]\n\1',
    content,
    count=1
)
content = re.sub(
    r'\n(fn watchdog_get_logs\(state: State<Arc<Mutex<TitaneCore>>>\) -> Result<Vec<String>, String> \{)',
    r'\n#[tauri::command]\n\1',
    content,
    count=1
)

# Réajouter #[tauri::command] pour get_system_status (qui doit l'avoir)
content = re.sub(
    r'\n(fn get_system_status\(state: State<Arc<Mutex<TitaneCore>>>\))',
    r'\n#[tauri::command]\n\1',
    content,
    count=1
)

# Écrire
with open('main.rs', 'w') as f:
    f.write(content)

# Vérification
count = content.count('#[tauri::command]')
print(f"✅ Réparation complète: {count} annotations (attendu: 4)")
