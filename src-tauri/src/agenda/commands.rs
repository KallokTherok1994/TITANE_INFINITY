// ═══════════════════════════════════════════════════════════════════
// TITANE∞ v∞ — AGENDA COMMANDS
// Commandes Tauri pour l'API Agenda
// ═══════════════════════════════════════════════════════════════════

use super::storage::{get_storage, AgendaStats};
use super::types::{
    AgendaEvent, CreateEventInput, DeleteEventInput, EventStatus, MoveEventInput, UpdateEventInput,
};
use tauri::command;
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════════
// COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════════

/// Charge tous les événements
#[command]
pub async fn agenda_load_events() -> Result<Vec<AgendaEvent>, String> {
    log::debug!("[Agenda] 📥 Chargement des événements...");
    let storage = get_storage()?;
    let events = storage.get_all_events().await;
    log::info!("[Agenda] ✅ {} événements chargés", events.len());
    Ok(events)
}

/// Sauvegarde les événements (synchronisation complète)
#[command]
pub async fn agenda_save_events(events: Vec<AgendaEvent>) -> Result<(), String> {
    log::debug!("[Agenda] 💾 Sauvegarde de {} événements...", events.len());
    let storage = get_storage()?;

    // Remplace tous les événements
    for event in events {
        // Vérifier si existe déjà
        if storage.get_event(&event.id).await.is_some() {
            storage
                .update_event(&event.id, |e| {
                    *e = event.clone();
                })
                .await?;
        } else {
            storage.add_event(event).await?;
        }
    }

    log::info!("[Agenda] ✅ Événements sauvegardés");
    Ok(())
}

/// Crée un nouvel événement
#[command]
pub async fn agenda_create_event(input: CreateEventInput) -> Result<AgendaEvent, String> {
    log::debug!("[Agenda] ➕ Création événement: {}", input.title);

    let now = chrono::Utc::now().timestamp_millis() as u64;

    let event = AgendaEvent {
        id: Uuid::new_v4().to_string(),
        title: input.title,
        description: input.description,
        start_date_time: input.start_date_time,
        end_date_time: input.end_date_time,
        all_day: input.all_day.unwrap_or(false),
        category: input.category.unwrap_or_default(),
        status: EventStatus::Scheduled,
        priority: input.priority.unwrap_or_default(),
        priority_score: None,
        energy_required: None,
        color: input.color,
        location: input.location,
        recurrence: input.recurrence,
        reminders: input.reminders.unwrap_or_default(),
        tags: input.tags.unwrap_or_default(),
        notes: input.notes,
        project_id: input.project_id,
        created_at: now,
        updated_at: now,
    };

    let storage = get_storage()?;
    let created = storage.add_event(event).await?;

    log::info!(
        "[Agenda] ✅ Événement créé: {} ({})",
        created.title,
        created.id
    );
    Ok(created)
}

/// Met à jour un événement existant
#[command]
pub async fn agenda_update_event(input: UpdateEventInput) -> Result<AgendaEvent, String> {
    log::debug!("[Agenda] ✏️ Mise à jour événement: {}", input.event_id);

    let storage = get_storage()?;

    let updated = storage
        .update_event(&input.event_id, |event| {
            if let Some(title) = &input.title {
                event.title = title.clone();
            }
            if let Some(description) = &input.description {
                event.description = Some(description.clone());
            }
            if let Some(start) = &input.start_date_time {
                event.start_date_time = start.clone();
            }
            if let Some(end) = &input.end_date_time {
                event.end_date_time = end.clone();
            }
            if let Some(all_day) = input.all_day {
                event.all_day = all_day;
            }
            if let Some(category) = &input.category {
                event.category = category.clone();
            }
            if let Some(status) = &input.status {
                event.status = status.clone();
            }
            if let Some(priority) = &input.priority {
                event.priority = priority.clone();
            }
            if let Some(color) = &input.color {
                event.color = Some(color.clone());
            }
            if let Some(location) = &input.location {
                event.location = Some(location.clone());
            }
            if let Some(recurrence) = &input.recurrence {
                event.recurrence = Some(recurrence.clone());
            }
            if let Some(reminders) = &input.reminders {
                event.reminders = reminders.clone();
            }
            if let Some(tags) = &input.tags {
                event.tags = tags.clone();
            }
            if let Some(notes) = &input.notes {
                event.notes = Some(notes.clone());
            }
            if let Some(project_id) = &input.project_id {
                event.project_id = Some(project_id.clone());
            }
        })
        .await?;

    log::info!("[Agenda] ✅ Événement mis à jour: {}", updated.title);
    Ok(updated)
}

/// Déplace un événement (change les dates)
#[command]
pub async fn agenda_move_event(input: MoveEventInput) -> Result<AgendaEvent, String> {
    log::debug!("[Agenda] 📦 Déplacement événement: {}", input.event_id);

    let storage = get_storage()?;

    let moved = storage
        .update_event(&input.event_id, |event| {
            event.start_date_time = input.new_start_date_time.clone();
            event.end_date_time = input.new_end_date_time.clone();
        })
        .await?;

    log::info!(
        "[Agenda] ✅ Événement déplacé: {} → {}",
        moved.title,
        moved.start_date_time
    );
    Ok(moved)
}

/// Supprime un événement
#[command]
pub async fn agenda_delete_event(input: DeleteEventInput) -> Result<bool, String> {
    log::debug!("[Agenda] 🗑️ Suppression événement: {}", input.event_id);

    let storage = get_storage()?;
    let deleted = storage.delete_event(&input.event_id).await?;

    if deleted {
        log::info!("[Agenda] ✅ Événement supprimé: {}", input.event_id);
    } else {
        log::warn!("[Agenda] ⚠️ Événement non trouvé: {}", input.event_id);
    }

    Ok(deleted)
}

/// Obtient un événement par ID
#[command]
pub async fn agenda_get_event(event_id: String) -> Result<Option<AgendaEvent>, String> {
    log::debug!("[Agenda] 🔍 Recherche événement: {}", event_id);

    let storage = get_storage()?;
    let event = storage.get_event(&event_id).await;

    Ok(event)
}

/// Obtient les événements dans une plage de dates
#[command]
pub async fn agenda_get_events_in_range(
    start: String,
    end: String,
) -> Result<Vec<AgendaEvent>, String> {
    log::debug!("[Agenda] 📆 Événements du {} au {}", start, end);

    let storage = get_storage()?;
    let events = storage.get_events_in_range(&start, &end).await;

    log::debug!("[Agenda] {} événements trouvés", events.len());
    Ok(events)
}

/// Obtient les statistiques de l'agenda
#[command]
pub async fn agenda_get_stats() -> Result<AgendaStats, String> {
    log::debug!("[Agenda] 📊 Récupération des statistiques...");

    let storage = get_storage()?;
    let stats = storage.get_stats().await;

    Ok(stats)
}

/// Marque un événement comme complété
#[command]
pub async fn agenda_complete_event(event_id: String) -> Result<AgendaEvent, String> {
    log::debug!("[Agenda] ✅ Complétion événement: {}", event_id);

    let storage = get_storage()?;

    let completed = storage
        .update_event(&event_id, |event| {
            event.status = EventStatus::Completed;
        })
        .await?;

    log::info!("[Agenda] ✅ Événement complété: {}", completed.title);
    Ok(completed)
}

/// Annule un événement
#[command]
pub async fn agenda_cancel_event(event_id: String) -> Result<AgendaEvent, String> {
    log::debug!("[Agenda] ❌ Annulation événement: {}", event_id);

    let storage = get_storage()?;

    let cancelled = storage
        .update_event(&event_id, |event| {
            event.status = EventStatus::Cancelled;
        })
        .await?;

    log::info!("[Agenda] ✅ Événement annulé: {}", cancelled.title);
    Ok(cancelled)
}
