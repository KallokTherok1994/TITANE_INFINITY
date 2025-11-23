// TITANE∞ v8.0 - Memory Types
// Structures de données pour le système de mémoire

use serde::{Deserialize, Serialize};
/// Entrée de mémoire individuelle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// Identifiant unique de l'entrée
    pub id: String,
    
    /// Timestamp de création (millisecondes depuis epoch)
    pub timestamp: u64,
    /// Contenu de l'entrée (texte, JSON, etc.)
    pub content: String,
}
impl MemoryEntry {
    /// Crée une nouvelle entrée de mémoire
    pub fn new(id: String, content: String, timestamp: u64) -> Self {
        Self {
            id,
            timestamp,
            content,
        }
    }
/// Bloc de mémoire chiffré (stockage)
pub struct EncryptedMemoryBlock {
    /// Nonce (IV) pour le déchiffrement
    pub nonce: Vec<u8>,
    /// Données chiffrées (incluant le tag d'authentification)
    pub data: Vec<u8>,
impl EncryptedMemoryBlock {
    /// Crée un nouveau bloc chiffré
    pub fn new(nonce: Vec<u8>, data: Vec<u8>) -> Self {
        Self { nonce, data }
/// Collection d'entrées de mémoire
pub struct MemoryCollection {
    /// Liste des entrées
    pub entries: Vec<MemoryEntry>,
    /// Checksum SHA-256 de la collection
    pub checksum: String,
    /// Version du format de données
    pub version: u32,
impl MemoryCollection {
    /// Crée une nouvelle collection vide
    pub fn new() -> Self {
            entries: Vec::new(),
            checksum: String::new(),
            version: 1,
    /// Ajoute une entrée à la collection
    pub fn add_entry(&mut self, entry: MemoryEntry) {
        self.entries.push(entry);
    /// Retourne le nombre d'entrées
    pub fn len(&self) -> usize {
        self.entries.len()
    /// Vérifie si la collection est vide
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    /// Efface toutes les entrées
    pub fn clear(&mut self) {
        self.entries.clear();
        self.checksum.clear();
impl Default for MemoryCollection {
    fn default() -> Self {
        Self::new()
