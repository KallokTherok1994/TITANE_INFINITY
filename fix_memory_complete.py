#!/usr/bin/env python3
"""Fix memory/mod.rs - fermetures complètes"""

file_path = "/home/titane_os/Documents/TITANE_NEWGEN/TITANE_INFINITY/src-tauri/src/system/memory/mod.rs"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Cherche fn save_entry_internal (ligne ~141)
# Cherche fn load_entries_internal (ligne ~160)
# Cherche fn clear_memory_internal (ligne ~171)
# Cherche fn calculate_collection_checksum (ligne ~174)
# Cherche fn get_timestamp (ligne ~?)

# Ajoute Ok(()) et } aux bonnes positions
fixed_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    fixed_lines.append(line)
    
    # save_entry_internal
    if 'fn save_entry_internal' in line and i < len(lines) - 20:
        # Cherche Ok(storage::save...) puis ajoute }
        for j in range(i+1, min(i+20, len(lines))):
            if 'storage::save' in lines[j] and '?' in lines[j]:
                # Ajoute Ok(()) et } après
                fixed_lines.extend(lines[i+1:j+1])
                fixed_lines.append('    Ok(())\n}\n\n')
                i = j + 1
                break
    
    # load_entries_internal
    elif 'fn load_entries_internal' in line and i < len(lines) - 15:
        for j in range(i+1, min(i+15, len(lines))):
            if 'storage::load' in lines[j]:
                fixed_lines.extend(lines[i+1:j+1])
                i = j + 1
                break
    
    # clear_memory_internal
    elif 'fn clear_memory_internal' in line and i < len(lines) - 10:
        for j in range(i+1, min(i+10, len(lines))):
            if 'storage::clear' in lines[j]:
                fixed_lines.extend(lines[i+1:j+1])
                fixed_lines.append('}\n\n')
                i = j + 1
                break
    
    # calculate_collection_checksum
    elif 'fn calculate_collection_checksum' in line and i < len(lines) - 15:
        for j in range(i+1, min(i+15, len(lines))):
            if 'Ok(checksum)' in lines[j]:
                fixed_lines.extend(lines[i+1:j+1])
                fixed_lines.append('}\n\n')
                i = j + 1
                break
    
    # get_timestamp
    elif 'fn get_timestamp' in line and i < len(lines) - 8:
        for j in range(i+1, min(i+8, len(lines))):
            if 'Utc::now' in lines[j] or 'timestamp' in lines[j]:
                fixed_lines.extend(lines[i+1:j+1])
                fixed_lines.append('}\n\n')
                i = j + 1
                break
    
    # get_memory_state
    elif 'fn get_memory_state' in line and i < len(lines) - 20:
        # Déjà corrigé
        pass
    
    # clear_memory
    elif 'fn clear_memory' in line and i < len(lines) - 10:
        # Déjà corrigé
        pass
    
    i += 1

# Supprime duplications
content = ''.join(fixed_lines)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ memory/mod.rs corrigé")
