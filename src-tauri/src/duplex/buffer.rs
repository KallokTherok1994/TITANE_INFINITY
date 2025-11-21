/**
 * 🔄 Circular Buffer - Buffer circulaire pour audio streaming
 * Lock-free, haute performance
 */

use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

pub struct CircularBuffer {
    data: Arc<Vec<f32>>,
    capacity: usize,
    write_pos: Arc<AtomicUsize>,
    read_pos: Arc<AtomicUsize>,
}

impl CircularBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            data: Arc::new(vec![0.0; capacity]),
            capacity,
            write_pos: Arc::new(AtomicUsize::new(0)),
            read_pos: Arc::new(AtomicUsize::new(0)),
        }
    }

    /// Écrire des samples
    pub fn write(&self, samples: &[f32]) -> usize {
        let write_pos = self.write_pos.load(Ordering::Relaxed);
        let read_pos = self.read_pos.load(Ordering::Relaxed);
        
        let available = if write_pos >= read_pos {
            self.capacity - (write_pos - read_pos)
        } else {
            read_pos - write_pos
        };

        let to_write = samples.len().min(available);
        
        // TODO: Implémenter écriture lock-free réelle
        // Pour l'instant, version simplifiée
        
        let new_write_pos = (write_pos + to_write) % self.capacity;
        self.write_pos.store(new_write_pos, Ordering::Relaxed);
        
        to_write
    }

    /// Lire des samples
    pub fn read(&self, buffer: &mut [f32]) -> usize {
        let write_pos = self.write_pos.load(Ordering::Relaxed);
        let read_pos = self.read_pos.load(Ordering::Relaxed);
        
        let available = if write_pos >= read_pos {
            write_pos - read_pos
        } else {
            self.capacity - (read_pos - write_pos)
        };

        let to_read = buffer.len().min(available);
        
        // TODO: Implémenter lecture lock-free réelle
        
        let new_read_pos = (read_pos + to_read) % self.capacity;
        self.read_pos.store(new_read_pos, Ordering::Relaxed);
        
        to_read
    }

    /// Nombre de samples disponibles
    pub fn available(&self) -> usize {
        let write_pos = self.write_pos.load(Ordering::Relaxed);
        let read_pos = self.read_pos.load(Ordering::Relaxed);
        
        if write_pos >= read_pos {
            write_pos - read_pos
        } else {
            self.capacity - (read_pos - write_pos)
        }
    }

    /// Espace libre
    pub fn free_space(&self) -> usize {
        self.capacity - self.available()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.available() == 0
    }

    /// Est plein?
    pub fn is_full(&self) -> bool {
        self.free_space() == 0
    }

    /// Réinitialiser
    pub fn reset(&self) {
        self.write_pos.store(0, Ordering::Relaxed);
        self.read_pos.store(0, Ordering::Relaxed);
    }

    /// Capacité totale
    pub fn capacity(&self) -> usize {
        self.capacity
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circular_buffer_creation() {
        let buffer = CircularBuffer::new(1024);
        assert_eq!(buffer.capacity(), 1024);
        assert_eq!(buffer.available(), 0);
        assert_eq!(buffer.free_space(), 1024);
    }

    #[test]
    fn test_circular_buffer_write_read() {
        let buffer = CircularBuffer::new(1024);
        
        let samples = vec![0.1, 0.2, 0.3, 0.4, 0.5];
        let written = buffer.write(&samples);
        
        assert_eq!(written, 5);
        assert_eq!(buffer.available(), 5);
        
        let mut read_buffer = vec![0.0; 5];
        let read = buffer.read(&mut read_buffer);
        
        assert_eq!(read, 5);
        assert_eq!(buffer.available(), 0);
    }

    #[test]
    fn test_circular_buffer_overflow() {
        let buffer = CircularBuffer::new(10);
        
        let samples = vec![0.1; 15];
        let written = buffer.write(&samples);
        
        // Devrait écrire seulement 10
        assert_eq!(written, 10);
        assert!(buffer.is_full());
    }

    #[test]
    fn test_circular_buffer_reset() {
        let buffer = CircularBuffer::new(1024);
        
        let samples = vec![0.1; 100];
        buffer.write(&samples);
        
        assert_eq!(buffer.available(), 100);
        
        buffer.reset();
        
        assert_eq!(buffer.available(), 0);
        assert!(buffer.is_empty());
    }
}
