// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - MemoryCore Storage                                           ║
// ║ Persistence locale sécurisée sur système de fichiers                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use std::fs;
use std::io::Write;
use std::path::Path;
/// Sauvegarde des bytes dans un fichier
///
/// Crée les répertoires parents si nécessaire
/// # Arguments
/// * `path` - Chemin du fichier
/// * `data` - Données à écrire
/// # Returns
/// * `Result<(), String>` - Succès ou erreur
pub fn save_bytes(path: &str, data: &[u8]) -> Result<(), String> {
    // Créer le chemin parent si nécessaire
    let file_path = Path::new(path);

    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| {
                format!(
                    "Impossible de créer le répertoire {}: {}",
                    parent.display(),
                    e
                )
            })?;
        }
    }
    // Écrire les données dans un fichier temporaire d'abord (atomic write)
    let temp_path = format!("{}.tmp", path);
    let temp_file_path = Path::new(&temp_path);
    {
        let mut file = fs::File::create(temp_file_path).map_err(|e| {
            format!(
                "Impossible de créer le fichier temporaire {}: {}",
                temp_path, e
            )
        })?;

        file.write_all(data)
            .map_err(|e| format!("Impossible d'écrire dans {}: {}", temp_path, e))?;
        file.sync_all()
            .map_err(|e| format!("Impossible de synchroniser {}: {}", temp_path, e))?;
    }
    // Renommer le fichier temporaire vers le fichier final (opération atomique)
    fs::rename(temp_file_path, file_path)
        .map_err(|e| format!("Impossible de renommer {} vers {}: {}", temp_path, path, e))?;
    Ok(())
}

/// Charge des bytes depuis un fichier
/// * `Result<Vec<u8>, String>` - Données lues ou erreur
pub fn load_bytes(path: &str) -> Result<Vec<u8>, String> {
    let file_path = Path::new(path);
    // Vérifier que le fichier existe
    if !file_path.exists() {
        return Err(format!("Le fichier {} n'existe pas", path));
    }
    // Lire le fichier
    fs::read(file_path).map_err(|e| format!("Impossible de lire le fichier {}: {}", path, e))
}

/// Supprime un fichier de stockage
/// * `path` - Chemin du fichier à supprimer
pub fn clear_storage(path: &str) -> Result<(), String> {
    let file_path = Path::new(path);
    // Si le fichier n'existe pas, considérer comme succès
    if !file_path.exists() {
        return Ok(());
    }
    // Supprimer le fichier
    fs::remove_file(file_path)
        .map_err(|e| format!("Impossible de supprimer le fichier {}: {}", path, e))?;
    // Supprimer aussi le fichier temporaire s'il existe
    let temp_path = format!("{}.tmp", path);
    let temp_file_path = Path::new(&temp_path);
    if temp_file_path.exists() {
        let _ = fs::remove_file(temp_file_path); // Ignorer les erreurs ici
    }
    Ok(())
}

/// Vérifie si un fichier existe
/// * `bool` - true si le fichier existe
pub fn exists(path: &str) -> bool {
    Path::new(path).exists()
}

/// Obtient la taille d'un fichier en bytes
/// * `Result<u64, String>` - Taille en bytes ou erreur
#[allow(dead_code)]
pub fn get_file_size(path: &str) -> Result<u64, String> {
    let file_path = Path::new(path);
    let metadata = fs::metadata(file_path)
        .map_err(|e| format!("Impossible de lire les métadonnées de {}: {}", path, e))?;
    Ok(metadata.len())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    #[test]
    fn test_save_and_load() {
        let test_path = "/tmp/titane_test_storage.bin";
        let test_data = b"test data";
        // Sauvegarder
        save_bytes(test_path, test_data).expect("Failed to save");
        // Charger
        let loaded = load_bytes(test_path).expect("Failed to load");
        assert_eq!(test_data, &loaded[..]);
        // Nettoyer
        let _ = fs::remove_file(test_path);
    }

    #[test]
    fn test_clear_storage() {
        let test_path = "/tmp/titane_test_clear.bin";
        let test_data = b"clear test";
        // Créer le fichier
        save_bytes(test_path, test_data).expect("Failed to save");
        assert!(exists(test_path));
        // Supprimer
        clear_storage(test_path).expect("Failed to clear");
        assert!(!exists(test_path));
    }

    #[test]
    fn test_file_size() {
        let test_path = "/tmp/titane_test_size.bin";
        let test_data = b"12345";
        save_bytes(test_path, test_data).expect("Failed to save");
        let size = get_file_size(test_path).expect("Failed to get size");
        assert_eq!(size, 5);
        // Nettoyer
        let _ = fs::remove_file(test_path);
    }
}
