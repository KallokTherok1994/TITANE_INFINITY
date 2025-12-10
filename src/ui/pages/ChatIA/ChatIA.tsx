import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ChatIA.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: string;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
  provider: string; // 'auto' | 'gemini' | 'ollama' | 'local'
  model?: string;
  streaming: boolean;
  images?: string[];
  system_prompt?: string;
}

interface ChatResponse {
  message: Message;
  success: boolean;
  error?: string;
  latency_ms: number;
}

interface ProviderStatus {
  gemini_configured: boolean;
  ollama_available: boolean;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export const ChatIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<
    'auto' | 'gemini' | 'ollama' | 'openai' | 'anthropic' | 'local'
  >('auto');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    gemini_configured: false,
    ollama_available: false,
  });

  // Charger le statut des providers au démarrage
  useEffect(() => {
    loadProviderStatus();
  }, []);

  const loadProviderStatus = async () => {
    try {
      // Vérifier Gemini
      const geminiStatus = await invoke<any>('get_gemini_key_status');
      const geminiConfigured = geminiStatus?.data?.configured || false;

      // Vérifier Ollama (via HTTP) et charger modèles
      let ollamaAvailable = false;
      let ollamaModels: string[] = [];
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          ollamaAvailable = true;
          const data = await response.json();
          ollamaModels = data.models?.map((m: OllamaModel) => m.name) || [];
          setAvailableModels(ollamaModels);
          if (ollamaModels.length > 0 && !selectedModel) {
            setSelectedModel(ollamaModels[0]); // Auto-sélectionner premier modèle
          }
        }
      } catch {
        // Ollama non disponible
      }

      setProviderStatus({
        gemini_configured: geminiConfigured,
        ollama_available: ollamaAvailable,
      });

      console.log('✅ Provider Status:', {
        geminiConfigured,
        ollamaAvailable,
        ollamaModels,
      });
    } catch (err) {
      console.error('❌ Erreur chargement provider status:', err);
    }
  };

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
      const request: ChatRequest = {
        message: userMsg.content,
        provider: provider,
        model: selectedModel || undefined,
        streaming: false,
        conversation_id: 'default',
      };

      console.log(`[ChatIA] Envoi message avec provider: ${provider}`);

      const response = await invoke<ChatResponse>('chat_send_message', {
        ...request,
      });

      if (response.success) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: response.message.content,
          timestamp: Date.now(),
          provider: response.message.provider || provider,
        };

        setMessages(prev => [...prev, assistantMsg]);
        console.log(
          `✅ Réponse reçue de ${response.message.provider} (${response.latency_ms}ms)`
        );
      } else {
        throw new Error(response.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      console.error('❌ Erreur ChatIA:', err);

      let errorMessage = '❌ Erreur: ';
      if (err.message?.includes('Rate limit')) {
        errorMessage += 'Trop de requêtes. Veuillez patienter quelques secondes.';
      } else if (err.message?.includes('not available')) {
        errorMessage += `Provider ${provider} non disponible. Configuration requise.`;
      } else {
        errorMessage += err.message || 'Erreur inconnue';
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-ia-container">
      <header className="chat-header">
        <h1>💬 Chat IA - TITANE∞</h1>
        <div className="provider-controls">
          <div className="provider-selector">
            <label>Provider:</label>
            <select value={provider} onChange={e => setProvider(e.target.value as any)}>
              <option value="auto">🤖 Auto (Intelligent)</option>
              <option value="openai">🔵 OpenAI GPT-4o</option>
              <option value="anthropic">🧠 Claude 3.5 Sonnet</option>
              <option value="gemini" disabled={!providerStatus.gemini_configured}>
                🔵 Gemini {!providerStatus.gemini_configured && '(⚠️ Non configuré)'}
              </option>
              <option value="ollama" disabled={!providerStatus.ollama_available}>
                🟢 Ollama {!providerStatus.ollama_available && '(⚠️ Non détecté)'}
              </option>
              <option value="local">🏠 Local (Fallback)</option>
            </select>
          </div>
          {provider === 'ollama' && availableModels.length > 0 && (
            <div className="model-selector">
              <label>Modèle:</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}
          {provider === 'gemini' && (
            <div className="model-selector">
              <label>Modèle:</label>
              <select
                value={selectedModel || 'gemini-2.0-flash-exp'}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
          )}
          {provider === 'openai' && (
            <div className="model-selector">
              <label>Modèle:</label>
              <select
                value={selectedModel || 'gpt-4o'}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="gpt-4o">GPT-4o (Latest)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          )}
          {provider === 'anthropic' && (
            <div className="model-selector">
              <label>Modèle:</label>
              <select
                value={selectedModel || 'claude-3-5-sonnet-20241022'}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
              </select>
            </div>
          )}
          <button
            className="refresh-status-btn"
            onClick={loadProviderStatus}
            title="Rafraîchir statut providers"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Status Banner */}
      {provider !== 'auto' && (
        <div className="provider-status-banner">
          {provider === 'gemini' && !providerStatus.gemini_configured && (
            <div className="status-warning">
              ⚠️ Gemini non configuré. Allez dans <strong>Gouvernance & Sécurité</strong>{' '}
              pour ajouter votre clé API.
            </div>
          )}
          {provider === 'ollama' && !providerStatus.ollama_available && (
            <div className="status-warning">
              ⚠️ Ollama non détecté. Assurez-vous qu'Ollama est lancé sur{' '}
              <code>localhost:11434</code>.
            </div>
          )}
          {provider === 'local' && (
            <div className="status-info">
              🏠 Mode local activé. Réponses basiques sans IA externe.
            </div>
          )}
        </div>
      )}

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-body">
              <div className="message-content">{msg.content}</div>
              {msg.provider && msg.role === 'assistant' && (
                <div className="message-provider-badge">
                  {msg.provider === 'gemini' && '🔵 Gemini'}
                  {msg.provider === 'ollama' && '🟢 Ollama'}
                  {msg.provider === 'local' && '🏠 Local'}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading">⏳ Génération en cours...</div>}
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
