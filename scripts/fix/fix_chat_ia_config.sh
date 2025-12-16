#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  TITANE∞ - FIX CHAT IA - CONFIGURATION API GEMINI          ║
# ║  Script de correction complète du Chat IA non-fonctionnel  ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

echo "🔧 TITANE∞ - Fix Chat IA - Démarrage..."
echo ""

# ============================================
# ÉTAPE 1: Vérification Environnement
# ============================================

echo "📋 ÉTAPE 1/5: Vérification de l'environnement..."

if [ ! -d "src" ] || [ ! -d "src-tauri" ]; then
    echo "❌ ERREUR: Ce script doit être exécuté depuis la racine de TITANE_INFINITY"
    echo "   Répertoire actuel: $(pwd)"
    exit 1
fi

echo "✅ Répertoire correct détecté"

# ============================================
# ÉTAPE 2: Configuration API Gemini
# ============================================

echo ""
echo "🔑 ÉTAPE 2/5: Configuration API Gemini..."

if [ -f ".env" ]; then
    echo "⚠️  Fichier .env existant détecté"
    if grep -q "VITE_GEMINI_API_KEY" .env; then
        echo "✅ VITE_GEMINI_API_KEY déjà configuré"
    else
        echo "⚠️  VITE_GEMINI_API_KEY manquant - ajout nécessaire"
    fi
else
    echo "📝 Création du fichier .env..."
    cat > .env << 'EOF'
# ╔══════════════════════════════════════════════════════════════╗
# ║  TITANE∞ - Variables d'Environnement                        ║
# ║  Fichier généré automatiquement - À CONFIGURER              ║
# ╚══════════════════════════════════════════════════════════════╝

# API Gemini (OBLIGATOIRE pour Chat IA)
# Obtenir une clé: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE

# Fallback Ollama (optionnel - local)
VITE_OLLAMA_ENDPOINT=http://localhost:11434

# Mode Debug
VITE_DEBUG_AI=false

# Timeout requêtes (ms)
VITE_AI_TIMEOUT=30000
EOF
    echo "✅ Fichier .env créé avec template"
fi

echo ""
echo "⚠️  ACTION REQUISE:"
echo "   1. Obtenez une clé API Gemini: https://makersuite.google.com/app/apikey"
echo "   2. Éditez le fichier .env et remplacez YOUR_API_KEY_HERE par votre clé"
echo "   3. Relancez ce script après configuration"
echo ""

if grep -q "YOUR_API_KEY_HERE" .env 2>/dev/null; then
    echo "❌ Clé API non configurée - veuillez éditer .env avant de continuer"
    echo "   Commande: nano .env  (ou votre éditeur préféré)"
    exit 1
fi

# ============================================
# ÉTAPE 3: Vérification Backend Tauri
# ============================================

echo ""
echo "🦀 ÉTAPE 3/5: Vérification des commandes Tauri Backend..."

if [ ! -f "src-tauri/src/main.rs" ]; then
    echo "❌ ERREUR: main.rs introuvable"
    exit 1
fi

# Vérifier si les commandes AI existent
if grep -q "chat_send_message\|ai_send_message\|send_message" src-tauri/src/main.rs; then
    echo "✅ Commandes Chat IA détectées dans main.rs"
else
    echo "⚠️  ATTENTION: Aucune commande Chat IA trouvée dans main.rs"
    echo "   Les commandes suivantes doivent être enregistrées:"
    echo "   - chat_send_message"
    echo "   - chat_get_history"
    echo "   - chat_clear_history"
fi

# Compter les commandes enregistrées
CMD_COUNT=$(grep -o "\.invoke_handler" src-tauri/src/main.rs | wc -l)
echo "📊 Commandes Tauri enregistrées: $CMD_COUNT"

# ============================================
# ÉTAPE 4: Correction Frontend ChatIA.tsx
# ============================================

echo ""
echo "⚛️  ÉTAPE 4/5: Vérification Frontend ChatIA.tsx..."

CHATIA_PATH="src/ui/pages/ChatIA/ChatIA.tsx"

if [ ! -f "$CHATIA_PATH" ]; then
    echo "⚠️  Fichier ChatIA.tsx introuvable - création nécessaire"
    mkdir -p "$(dirname "$CHATIA_PATH")"
    
    echo "📝 Création de ChatIA.tsx corrigé..."
    cat > "$CHATIA_PATH" << 'EOFCHAT'
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ChatIA.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatIAProps {}

export const ChatIA: React.FC<ChatIAProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await invoke<Message[]>('chat_get_history');
      setMessages(history || []);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // CRITICAL FIX: Appel direct à l'API Gemini via commande Tauri
      const response = await invoke<string>('chat_send_message', {
        message: userMessage.content,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erreur envoi message:', err);
      
      // Gestion d'erreur détaillée
      let errorMessage = 'Erreur de connexion au Chat IA';
      
      if (err.includes('API key')) {
        errorMessage = '❌ Clé API Gemini non configurée. Voir fichier .env';
      } else if (err.includes('network') || err.includes('timeout')) {
        errorMessage = '❌ Erreur réseau. Vérifiez votre connexion internet.';
      } else if (err.includes('quota')) {
        errorMessage = '❌ Quota API dépassé. Attendez ou changez de clé.';
      }

      setError(errorMessage);
      
      // Message d'erreur dans le chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMessage}\n\nDétails: ${err}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await invoke('chat_clear_history');
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Erreur effacement historique:', err);
    }
  };

  return (
    <div className="chat-ia-container">
      <header className="chat-header">
        <h1>💬 Chat IA - TITANE∞</h1>
        <button 
          onClick={clearHistory}
          className="clear-button"
          disabled={messages.length === 0}
        >
          🗑️ Effacer
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Bienvenue sur le Chat IA TITANE∞</p>
            <p>Posez votre première question pour commencer...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="loading-dots">
                <span>●</span><span>●</span><span>●</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Tapez votre message..."
          disabled={isLoading}
          className="message-input"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
};

export default ChatIA;
EOFCHAT

    echo "✅ ChatIA.tsx créé avec corrections"
else
    echo "✅ ChatIA.tsx existant détecté"
fi

# ============================================
# ÉTAPE 5: Vérification CSS
# ============================================

echo ""
echo "🎨 ÉTAPE 5/5: Vérification CSS..."

CHATIA_CSS="src/ui/pages/ChatIA/ChatIA.css"

if [ ! -f "$CHATIA_CSS" ]; then
    echo "📝 Création de ChatIA.css..."
    cat > "$CHATIA_CSS" << 'EOFCSS'
.chat-ia-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
  color: #e0e0e0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.clear-button {
  padding: 0.5rem 1rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button:hover:not(:disabled) {
  background: #ff6666;
  transform: translateY(-2px);
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #ff44444d;
  border-left: 4px solid #ff4444;
  margin: 1rem;
  border-radius: 0.5rem;
}

.error-banner button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  color: #666;
  margin-top: 3rem;
}

.empty-state p {
  margin: 0.5rem 0;
}

.message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #1a1a1a;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 1rem;
  position: relative;
}

.message-user .message-content {
  background: #2563eb;
}

.message-text {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-timestamp {
  font-size: 0.75rem;
  color: #666;
}

.loading-dots {
  display: flex;
  gap: 0.25rem;
}

.loading-dots span {
  animation: pulse 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.input-container {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-top: 1px solid #333;
}

.message-input {
  flex: 1;
  padding: 1rem;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: #e0e0e0;
  font-size: 1rem;
}

.message-input:focus {
  outline: none;
  border-color: #2563eb;
}

.send-button {
  padding: 1rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
EOFCSS

    echo "✅ ChatIA.css créé"
else
    echo "✅ ChatIA.css existant détecté"
fi

# ============================================
# RAPPORT FINAL
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            ✅ FIX CHAT IA - CONFIGURATION TERMINÉE          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1️⃣  CONFIGURER LA CLÉ API:"
echo "   $ nano .env"
echo "   Remplacer: YOUR_API_KEY_HERE par votre clé Gemini"
echo "   Obtenir clé: https://makersuite.google.com/app/apikey"
echo ""
echo "2️⃣  AJOUTER LES COMMANDES BACKEND:"
echo "   Voir le fichier: fix_backend_commands.rs (à créer)"
echo "   Copier dans: src-tauri/src/api/chat_commands.rs"
echo ""
echo "3️⃣  RECOMPILER:"
echo "   $ pnpm install"
echo "   $ pnpm dev"
echo ""
echo "4️⃣  TESTER LE CHAT:"
echo "   Ouvrir TITANE∞ → Section Chat IA"
echo "   Envoyer un message de test"
echo ""
echo "📚 Documentation complète: docs/CHAT_IA_TROUBLESHOOTING.md"
echo ""
