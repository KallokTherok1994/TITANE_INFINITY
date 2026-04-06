// memory_system_commands.rs — exposes encrypted local memory entry commands
// as Tauri IPC commands. Distinct from MemoryCore (structured AI memory).

#[tauri::command]
pub async fn memory_save_entry(entry: String) -> Result<(), String> {
    log::debug!("💾 Command: memory_save_entry (length: {})", entry.len());
    #[cfg(all(not(feature = "mock"), feature = "full"))]
    {
        titane_infinity::system::memory::save_entry(titane_infinity::system::memory::MemoryEntry {
            content: entry,
            timestamp: 0,
        })?;
    }
    #[cfg(any(feature = "mock", not(feature = "full")))]
    {
        // In non-full builds, log and accept the entry (no encrypted storage available)
        log::info!("💾 memory_save_entry (mock/stub): accepted {} bytes", entry.len());
        let _ = entry;
    }
    Ok(())
}
