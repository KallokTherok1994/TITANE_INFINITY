//! TITANE∞ v20Ω — Timeline
//! Gestion de la timeline temporelle

use serde::{Deserialize, Serialize};
use std::ops::{Deref, DerefMut};

/// Timeline de snapshots
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Timeline {
    /// IDs des snapshots dans l'ordre chronologique
    entries: Vec<String>,
}

impl Timeline {
    /// Crée une nouvelle timeline
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    /// Crée une timeline avec capacité initiale
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            entries: Vec::with_capacity(capacity),
        }
    }

    /// Ajoute un snapshot à la fin
    pub fn push(&mut self, snapshot_id: String) {
        self.entries.push(snapshot_id);
    }

    /// Retire le dernier snapshot
    pub fn pop(&mut self) -> Option<String> {
        self.entries.pop()
    }

    /// Récupère un snapshot par index
    pub fn get(&self, index: usize) -> Option<&String> {
        self.entries.get(index)
    }

    /// Retourne le premier snapshot
    pub fn first(&self) -> Option<&String> {
        self.entries.first()
    }

    /// Retourne le dernier snapshot
    pub fn last(&self) -> Option<&String> {
        self.entries.last()
    }

    /// Retourne la longueur
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Vérifie si la timeline est vide
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Tronque la timeline à une position
    pub fn truncate(&mut self, len: usize) {
        self.entries.truncate(len);
    }

    /// Efface la timeline
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Retourne un itérateur
    pub fn iter(&self) -> impl Iterator<Item = &String> {
        self.entries.iter()
    }

    /// Retourne la position d'un snapshot
    pub fn position(&self, snapshot_id: &str) -> Option<usize> {
        self.entries.iter().position(|id| id == snapshot_id)
    }

    /// Vérifie si un snapshot existe dans la timeline
    pub fn contains(&self, snapshot_id: &str) -> bool {
        self.entries.iter().any(|id| id == snapshot_id)
    }

    /// Insère un snapshot à une position
    pub fn insert(&mut self, index: usize, snapshot_id: String) {
        if index <= self.entries.len() {
            self.entries.insert(index, snapshot_id);
        }
    }

    /// Supprime un snapshot par ID
    pub fn remove(&mut self, snapshot_id: &str) -> bool {
        if let Some(pos) = self.position(snapshot_id) {
            self.entries.remove(pos);
            true
        } else {
            false
        }
    }

    /// Retourne une sous-timeline (range)
    pub fn range(&self, start: usize, end: usize) -> Vec<String> {
        self.entries
            .iter()
            .skip(start)
            .take(end - start)
            .cloned()
            .collect()
    }

    /// Fork la timeline à partir d'une position
    pub fn fork_at(&self, position: usize) -> Timeline {
        let mut forked = Timeline::new();
        for entry in self.entries.iter().take(position + 1) {
            forked.push(entry.clone());
        }
        forked
    }

    /// Merge deux timelines (append)
    pub fn merge(&mut self, other: &Timeline) {
        for entry in other.iter() {
            if !self.contains(entry) {
                self.push(entry.clone());
            }
        }
    }

    /// Retourne les snapshots dans l'intervalle [from, to]
    pub fn between(&self, from: Option<usize>, to: Option<usize>) -> Vec<String> {
        let start = from.unwrap_or(0);
        let end = to.unwrap_or(self.entries.len());

        self.entries
            .iter()
            .skip(start)
            .take(end.saturating_sub(start))
            .cloned()
            .collect()
    }
}

impl Deref for Timeline {
    type Target = Vec<String>;

    fn deref(&self) -> &Self::Target {
        &self.entries
    }
}

impl DerefMut for Timeline {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.entries
    }
}

impl FromIterator<String> for Timeline {
    fn from_iter<I: IntoIterator<Item = String>>(iter: I) -> Self {
        Self {
            entries: iter.into_iter().collect(),
        }
    }
}

impl IntoIterator for Timeline {
    type Item = String;
    type IntoIter = std::vec::IntoIter<String>;

    fn into_iter(self) -> Self::IntoIter {
        self.entries.into_iter()
    }
}

/// Position dans une timeline
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimelinePosition {
    /// Index dans la timeline
    pub index: usize,
    /// Timestamp du snapshot
    pub timestamp: u64,
}

impl TimelinePosition {
    /// Crée une nouvelle position
    pub fn new(index: usize, timestamp: u64) -> Self {
        Self { index, timestamp }
    }

    /// Position au début
    pub fn start() -> Self {
        Self {
            index: 0,
            timestamp: 0,
        }
    }
}

/// Curseur de timeline
#[derive(Debug)]
pub struct TimelineCursor<'a> {
    timeline: &'a Timeline,
    position: usize,
}

impl<'a> TimelineCursor<'a> {
    /// Crée un nouveau curseur
    pub fn new(timeline: &'a Timeline) -> Self {
        Self {
            timeline,
            position: 0,
        }
    }

    /// Crée un curseur à une position
    pub fn at(timeline: &'a Timeline, position: usize) -> Self {
        Self {
            timeline,
            position: position.min(timeline.len().saturating_sub(1)),
        }
    }

    /// Avance le curseur
    pub fn advance(&mut self) -> Option<&String> {
        if self.position < self.timeline.len() {
            let entry = self.timeline.get(self.position);
            self.position += 1;
            entry
        } else {
            None
        }
    }

    /// Recule le curseur
    pub fn rewind(&mut self) -> Option<&String> {
        if self.position > 0 {
            self.position -= 1;
            self.timeline.get(self.position)
        } else {
            None
        }
    }

    /// Retourne l'entrée actuelle
    pub fn current(&self) -> Option<&String> {
        if self.position > 0 {
            self.timeline.get(self.position - 1)
        } else {
            None
        }
    }

    /// Retourne la position actuelle
    pub fn position(&self) -> usize {
        self.position
    }

    /// Vérifie si le curseur est à la fin
    pub fn at_end(&self) -> bool {
        self.position >= self.timeline.len()
    }

    /// Vérifie si le curseur est au début
    pub fn at_start(&self) -> bool {
        self.position == 0
    }

    /// Saute à une position
    pub fn jump_to(&mut self, position: usize) {
        self.position = position.min(self.timeline.len());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timeline_basic() {
        let mut timeline = Timeline::new();

        timeline.push("snap-1".to_string());
        timeline.push("snap-2".to_string());
        timeline.push("snap-3".to_string());

        assert_eq!(timeline.len(), 3);
        assert_eq!(timeline.first(), Some(&"snap-1".to_string()));
        assert_eq!(timeline.last(), Some(&"snap-3".to_string()));
    }

    #[test]
    fn test_timeline_truncate() {
        let mut timeline = Timeline::new();

        timeline.push("snap-1".to_string());
        timeline.push("snap-2".to_string());
        timeline.push("snap-3".to_string());

        timeline.truncate(2);

        assert_eq!(timeline.len(), 2);
        assert!(!timeline.contains("snap-3"));
    }

    #[test]
    fn test_timeline_fork() {
        let mut timeline = Timeline::new();

        timeline.push("snap-1".to_string());
        timeline.push("snap-2".to_string());
        timeline.push("snap-3".to_string());

        let forked = timeline.fork_at(1);

        assert_eq!(forked.len(), 2);
        assert!(forked.contains("snap-1"));
        assert!(forked.contains("snap-2"));
        assert!(!forked.contains("snap-3"));
    }

    #[test]
    fn test_cursor() {
        let mut timeline = Timeline::new();
        timeline.push("snap-1".to_string());
        timeline.push("snap-2".to_string());
        timeline.push("snap-3".to_string());

        let mut cursor = TimelineCursor::new(&timeline);

        assert!(cursor.at_start());
        assert_eq!(cursor.advance(), Some(&"snap-1".to_string()));
        assert_eq!(cursor.advance(), Some(&"snap-2".to_string()));
        assert_eq!(cursor.advance(), Some(&"snap-3".to_string()));
        assert!(cursor.at_end());

        assert_eq!(cursor.rewind(), Some(&"snap-3".to_string()));
    }
}
