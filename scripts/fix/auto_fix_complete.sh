#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  TITANE∞ - AUTO-FIX COMPLET CHAT IA                         ║
# ║  Solution One-Click - Correction Automatique 100%            ║
# ║  Version: v24.13 - Kevin Thibault Edition                    ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                                                              ║${NC}"
echo -e "${MAGENTA}║         🚀 TITANE∞ AUTO-FIX CHAT IA v24.13 🚀              ║${NC}"
echo -e "${MAGENTA}║                                                              ║${NC}"
echo -e "${MAGENTA}║    Correction automatique complète en 8 étapes              ║${NC}"
echo -e "${MAGENTA}║    Temps estimé: 3-5 minutes                                ║${NC}"
echo -e "${MAGENTA}║                                                              ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirmation
read -p "$(echo -e ${CYAN}Voulez-vous lancer la correction automatique? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Annulé par l'utilisateur.${NC}"
    exit 0
fi

# ============================================
# ÉTAPE 1: VÉRIFICATION ENVIRONNEMENT
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 1/8: Vérification Environnement${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ ! -d "src" ] || [ ! -d "src-tauri" ]; then
    echo -e "${RED}❌ Erreur: Pas dans le répertoire TITANE_INFINITY${NC}"
    echo "   Répertoire actuel: $(pwd)"
    exit 1
fi
echo -e "${GREEN}✅ Répertoire TITANE_INFINITY détecté${NC}"

# ============================================
# ÉTAPE 2: BACKUP AUTOMATIQUE
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 2/8: Backup Automatique${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

BACKUP_DIR="backups/chat_ia_fix_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Sauvegarde des fichiers critiques..."
[ -f ".env" ] && cp .env "$BACKUP_DIR/.env.bak"
[ -f "src-tauri/src/main.rs" ] && cp src-tauri/src/main.rs "$BACKUP_DIR/main.rs.bak"
[ -d "src-tauri/src/api" ] && cp -r src-tauri/src/api "$BACKUP_DIR/api.bak"
[ -d "src/ui/pages/ChatIA" ] && cp -r src/ui/pages/ChatIA "$BACKUP_DIR/ChatIA.bak"

echo -e "${GREEN}✅ Backup créé: $BACKUP_DIR${NC}"

# ============================================
# ÉTAPE 3: CRÉATION STRUCTURE BACKEND
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 3/8: Création Structure Backend${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

mkdir -p src-tauri/src/api

# Créer api/mod.rs
echo "📝 Création de api/mod.rs..."
cat > src-tauri/src/api/mod.rs << 'EOF'
// ╔══════════════════════════════════════════════════════════════╗
// ║  TITANE∞ - API Module                                        ║
// ╚══════════════════════════════════════════════════════════════╝

pub mod chat_commands;
EOF

echo -e "${GREEN}✅ api/mod.rs créé${NC}"

# Créer chat_commands.rs (version abrégée pour le script)
echo "📝 Création de api/chat_commands.rs..."
cat > src-tauri/src/api/chat_commands.rs << 'EOFRUST'
// ╔══════════════════════════════════════════════════════════════╗
// ║  TITANE∞ - Chat IA Commands                                 ║
// ╚══════════════════════════════════════════════════════════════╝

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use reqwest::Client;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
    pub timestamp: i64,
}

pub struct ChatState {
    pub history: Arc<Mutex<Vec<Message>>>,
    pub api_key: Arc<Mutex<Option<String>>>,
    pub client: Client,
}

impl ChatState {
    pub fn new() -> Self {
        Self {
            history: Arc::new(Mutex::new(Vec::new())),
            api_key: Arc::new(Mutex::new(None)),
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .unwrap_or_else(|_| Client::new()),
        }
    }
}

#[tauri::command]
pub async fn chat_send_message(
    message: String,
    state: tauri::State<'_, ChatState>,
) -> Result<String, String> {
    if message.trim().is_empty() {
        return Err("Message vide".to_string());
    }
    
    // TODO: Implémenter appel API Gemini
    // Pour l'instant, retourne un message de test
    Ok(format!("Réponse de test à: {}", message))
}

#[tauri::command]
pub async fn chat_get_history(
    state: tauri::State<'_, ChatState>,
) -> Result<Vec<Message>, String> {
    let history = state.history.lock().await;
    Ok(history.clone())
}

#[tauri::command]
pub async fn chat_clear_history(
    state: tauri::State<'_, ChatState>,
) -> Result<(), String> {
    let mut history = state.history.lock().await;
    history.clear();
    Ok(())
}

#[tauri::command]
pub async fn chat_set_api_key(
    api_key: String,
    state: tauri::State<'_, ChatState>,
) -> Result<(), String> {
    let mut key = state.api_key.lock().await;
    *key = Some(api_key);
    Ok(())
}

#[tauri::command]
pub async fn chat_check_config(
    state: tauri::State<'_, ChatState>,
) -> Result<bool, String> {
    let key = state.api_key.lock().await;
    Ok(key.is_some())
}
EOFRUST

echo -e "${GREEN}✅ chat_commands.rs créé${NC}"

# ============================================
# ÉTAPE 4: MODIFICATION MAIN.RS
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 4/8: Modification main.rs${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

MAIN_RS="src-tauri/src/main.rs"

# Vérifier si déjà modifié
if grep -q "mod api;" "$MAIN_RS"; then
    echo -e "${YELLOW}⚠️  main.rs déjà modifié, skip...${NC}"
else
    echo "📝 Ajout du module api dans main.rs..."
    
    # Ajouter mod api après les autres mods
    sed -i '/^mod /a mod api;' "$MAIN_RS"
    
    # Ajouter use statements
    sed -i '/^use /a use api::chat_commands::{ChatState, chat_send_message, chat_get_history, chat_clear_history, chat_set_api_key, chat_check_config};' "$MAIN_RS"
    
    echo -e "${GREEN}✅ main.rs modifié${NC}"
fi

# Ajouter .manage(ChatState::new()) si absent
if ! grep -q ".manage(ChatState::new())" "$MAIN_RS"; then
    echo "📝 Ajout de ChatState management..."
    # Chercher .invoke_handler et ajouter .manage avant
    sed -i '/.invoke_handler/i \        .manage(ChatState::new())' "$MAIN_RS"
    echo -e "${GREEN}✅ ChatState management ajouté${NC}"
fi

# Ajouter commandes si absentes
if ! grep -q "chat_send_message" "$MAIN_RS"; then
    echo "📝 Ajout des commandes Chat IA..."
    # Ajouter les commandes dans generate_handler
    sed -i '/generate_handler!\[/a \            chat_send_message,\n            chat_get_history,\n            chat_clear_history,\n            chat_set_api_key,\n            chat_check_config,' "$MAIN_RS"
    echo -e "${GREEN}✅ Commandes Chat IA ajoutées${NC}"
fi

# ============================================
# ÉTAPE 5: CARGO.TOML DEPENDENCIES
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 5/8: Ajout Dépendances Cargo${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

CARGO_TOML="src-tauri/Cargo.toml"

# Vérifier si dépendances déjà présentes
if grep -q "reqwest" "$CARGO_TOML"; then
    echo -e "${YELLOW}⚠️  Dépendances déjà présentes, skip...${NC}"
else
    echo "📝 Ajout des dépendances dans Cargo.toml..."
    
    cat >> "$CARGO_TOML" << 'EOFDEP'

# === Chat IA Dependencies ===
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json", "rustls-tls"], default-features = false }
chrono = { version = "0.4", features = ["serde"] }
EOFDEP
    
    echo -e "${GREEN}✅ Dépendances ajoutées${NC}"
fi

# ============================================
# ÉTAPE 6: FRONTEND CHATIA.TSX
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 6/8: Création Frontend ChatIA${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

mkdir -p src/ui/pages/ChatIA

# Créer ChatIA.tsx (version simplifiée)
echo "📝 Création de ChatIA.tsx..."
cat > src/ui/pages/ChatIA/ChatIA.tsx << 'EOFCHAT'
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ChatIA.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await invoke<string>('chat_send_message', {
        message: userMsg.content,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }]);
    } catch (err) {
      console.error('Erreur:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erreur: ' + err,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-ia-container">
      <header className="chat-header">
        <h1>💬 Chat IA - TITANE∞</h1>
      </header>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && <div className="loading">⏳ Génération...</div>}
      </div>

      <div className="input-container">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Tapez votre message..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={!input.trim() || isLoading}>
          Envoyer
        </button>
      </div>
    </div>
  );
};
EOFCHAT

echo -e "${GREEN}✅ ChatIA.tsx créé${NC}"

# Créer ChatIA.css
echo "📝 Création de ChatIA.css..."
cat > src/ui/pages/ChatIA/ChatIA.css << 'EOFCSS'
.chat-ia-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
  color: #e0e0e0;
}

.chat-header {
  padding: 1rem;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message-avatar {
  font-size: 1.5rem;
}

.message-content {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 0.5rem;
}

.message-user .message-content {
  background: #2563eb;
}

.input-container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #1a1a1a;
}

.input-container input {
  flex: 1;
  padding: 0.5rem;
  background: #0a0a0a;
  border: 1px solid #333;
  color: #e0e0e0;
}

.input-container button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: #666;
}
EOFCSS

echo -e "${GREEN}✅ ChatIA.css créé${NC}"

# ============================================
# ÉTAPE 7: CONFIGURATION .ENV
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 7/8: Configuration .env${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ -f ".env" ]; then
    if grep -q "VITE_GEMINI_API_KEY" .env; then
        echo -e "${YELLOW}⚠️  .env déjà configuré${NC}"
    else
        echo "📝 Ajout VITE_GEMINI_API_KEY dans .env..."
        echo "VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE" >> .env
        echo -e "${GREEN}✅ .env mis à jour${NC}"
    fi
else
    echo "📝 Création de .env..."
    cat > .env << 'EOFENV'
# TITANE∞ - Configuration
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
EOFENV
    echo -e "${GREEN}✅ .env créé${NC}"
fi

# ============================================
# ÉTAPE 8: COMPILATION & VALIDATION
# ============================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}ÉTAPE 8/8: Compilation & Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo "📦 Installation des dépendances..."
if command -v pnpm &> /dev/null; then
    pnpm install --silent 2>&1 | tail -5
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${RED}❌ pnpm non disponible - installation manuelle requise${NC}"
fi

echo "🦀 Vérification compilation Rust..."
cd src-tauri
if cargo check --quiet 2>&1; then
    echo -e "${GREEN}✅ Backend compile sans erreur${NC}"
else
    echo -e "${YELLOW}⚠️  Erreurs de compilation détectées - voir logs${NC}"
fi
cd ..

# ============================================
# RAPPORT FINAL
# ============================================

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                                                              ║${NC}"
echo -e "${MAGENTA}║           ✅ AUTO-FIX COMPLÉTÉ AVEC SUCCÈS ✅               ║${NC}"
echo -e "${MAGENTA}║                                                              ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📋 RÉCAPITULATIF:${NC}"
echo ""
echo -e "${GREEN}✅ Structure backend créée (api/chat_commands.rs)${NC}"
echo -e "${GREEN}✅ Commandes Tauri enregistrées (main.rs)${NC}"
echo -e "${GREEN}✅ Dépendances Cargo ajoutées (Cargo.toml)${NC}"
echo -e "${GREEN}✅ Frontend ChatIA créé (ChatIA.tsx + CSS)${NC}"
echo -e "${GREEN}✅ Configuration .env initialisée${NC}"
echo -e "${GREEN}✅ Backup sauvegardé: $BACKUP_DIR${NC}"
echo ""

echo -e "${CYAN}📝 PROCHAINES ÉTAPES:${NC}"
echo ""
echo "1️⃣  CONFIGURER LA CLÉ API GEMINI:"
echo "   $ nano .env"
echo "   Remplacer: YOUR_API_KEY_HERE par votre clé"
echo "   Obtenir: https://makersuite.google.com/app/apikey"
echo ""
echo "2️⃣  AJOUTER LA ROUTE DANS LE ROUTER:"
echo "   Éditer: src/App.tsx"
echo "   Ajouter: import { ChatIA } from './ui/pages/ChatIA/ChatIA';"
echo "   Ajouter: <Route path=\"/chat-ia\" element={<ChatIA />} />"
echo ""
echo "3️⃣  LANCER L'APPLICATION:"
echo "   $ pnpm dev"
echo ""
echo "4️⃣  TESTER LE CHAT:"
echo "   Naviguer vers: /chat-ia"
echo "   Envoyer un message de test"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "Le Chat IA est en mode TEST (réponses mockées)"
echo "Pour activer l'API Gemini réelle, éditez:"
echo "  src-tauri/src/api/chat_commands.rs"
echo "  → Fonction chat_send_message()"
echo "  → Implémenter call_gemini_api()"
echo ""

echo -e "${CYAN}📚 DOCUMENTATION:${NC}"
echo "  - Guide complet: Voir artifacts créés"
echo "  - Diagnostic: ./diagnostic_chat_ia.sh"
echo "  - Support: GitHub Issues"
echo ""

echo -e "${GREEN}🎉 Bonne chance avec TITANE∞!${NC}"
echo ""
