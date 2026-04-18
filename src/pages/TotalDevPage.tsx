/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — TOTAL_DEV PAGE
 * GOD DEV TITANE — Espace de développement souverain
 *
 * Architecture: Ring 1 → IPC canonique → Rust backends
 * Provider: QWEN-Coder via Ollama (modèle qwen2.5-coder)
 * Unlock: SHA-256 backend only. Jamais de secret brut frontend.
 * Session: 1h expiry, visible, revokable
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { secureInvoke } from '@/lib/security';
import { TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';
import { logger } from '@/lib/logger';
import './TotalDevPage.css';

import AgentDashboardsPanel from '../components/AgentDashboardsPanel';

// Fonction utilitaire pour calculer le hash SHA-256

// Injection universelle des dashboards agents avancés
// (affiché sur toutes les pages principales)
// Positionné en fixed en bas à droite
// data-testid="agent-dashboards-panel"
// Voir AgentDashboardsPanel.tsx
export { AgentDashboardsPanel };
const sha256 = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

type LockState = 'LOCKED' | 'UNLOCKED' | 'EXPIRED' | 'CHECKING';

interface SessionStatus {
  lock_state: string;
  expires_at_unix?: number;
  now_unix: number;
}

interface UnlockResult {
  ok: boolean;
  session_token?: string;
  expires_at_unix?: number;
  lock_state: string;
  error?: string;
}

interface GitResult {
  ok: boolean;
  content: string;
  error?: string;
  exit_code: number;
  op: string;
}

interface ConsoleResult {
  ok: boolean;
  content: string;
  stderr?: string;
  exit_code: number;
  command_id: string;
  started_at: number;
  ended_at: number;
  duration_ms: number;
}

interface FileResult {
  ok: boolean;
  path: string;
  content?: string;
  size?: number;
  lines?: number;
  error?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  model?: string;
}

interface ConsoleEntry {
  id: string;
  command: string;
  result?: ConsoleResult;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// ARCHITECTURE CONTEXT INJECTION
// Used as system prompt prefix for QWEN-Coder
// ─────────────────────────────────────────────────────────────────
const TOTAL_DEV_SYSTEM_PROMPT = `Tu es GOD DEV TITANE — l'agent de développement souverain de TITANE∞ v30.0.0.

ARCHITECTURE CANONIQUE:
- 4-Ring strict: Ring0=Tauri/Rust, Ring1=IPC commands, Ring2=Services TS, Ring3=UI/React
- One Door: UI → IPC canonique → Services → Network Gateway → Externe
- Payload IPC: { ok, content, error } toujours
- Provider runtime: Tauri uniquement (prd). Pas de fetch autonome en production.
- Capability Tauri active: developer_mode, total_dev, self_heal, persistence, chat_ai
- Stack: React + TypeScript + Tauri 2.10 + Rust 1.94 + pnpm 10 + Node 24

IDENTITÉ DE L'AGENT:
- Architecte + Intégrateur + Auditeur + Réparateur + Certificateur
- Jamais simple générateur de code. Jamais exécuteur aveugle.
- Patch minimal, toujours justifié, toujours réversible.
- Preuve avant narration. Vérité stricte.

RÈGLES ABSOLUES:
- Aucun refactor gratuit hors scope
- Aucune suppression silencieuse de zone critique
- Aucun faux PASS
- Toute modification importante = audit minimal + rollback path

ZONES SENSIBLES:
- src-tauri/* (Ring 0 — changements avec audit Rust obligatoire)
- capabilities/* (rollback obligatoire)
- provider core / router chat
- services critiques / mémoire
- builds / packaging / workflows

Tu réponds en français. Tu cites les fichiers touchés. Tu classes chaque risque.
`;

// ─────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────

const normalizeLockState = (
  status: Partial<SessionStatus> | null | undefined
): LockState => {
  const candidate =
    typeof status?.lock_state === 'string' ? status.lock_state.toUpperCase() : '';

  if (
    candidate === 'LOCKED' ||
    candidate === 'UNLOCKED' ||
    candidate === 'EXPIRED' ||
    candidate === 'CHECKING'
  ) {
    return candidate;
  }

  return 'LOCKED';
};

const normalizeExpiry = (status: Partial<SessionStatus> | null | undefined): number => {
  return typeof status?.expires_at_unix === 'number' &&
    Number.isFinite(status.expires_at_unix)
    ? status.expires_at_unix
    : 0;
};

function useLockState() {
  const [lockState, setLockState] = useState<LockState>('CHECKING');
  const [expiresAt, setExpiresAt] = useState<number>(0);

  const checkSession = useCallback(async () => {
    try {
      const status = await secureInvoke<Partial<SessionStatus>>(
        TAURI_COMMANDS.TOTAL_DEV_SESSION_STATUS,
        {}
      );

      setLockState(normalizeLockState(status));
      setExpiresAt(normalizeExpiry(status));
    } catch {
      setLockState('LOCKED');
      setExpiresAt(0);
    }
  }, []);

  // Vérifier à intervalles réguliers (expiry check)
  useEffect(() => {
    checkSession();
    const interval = setInterval(checkSession, 30_000);
    return () => clearInterval(interval);
  }, [checkSession]);

  return { lockState, expiresAt, setLockState, setExpiresAt, checkSession };
}

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────

const LockBadge = memo<{ lockState: LockState; expiresAt: number }>(
  ({ lockState, expiresAt }) => {
    const labels: Record<LockState, string> = {
      LOCKED: '🔒 LOCKED',
      UNLOCKED: '🔓 UNLOCKED',
      EXPIRED: '⏰ EXPIRED',
      CHECKING: '⏳ ...',
    };
    const colors: Record<LockState, string> = {
      LOCKED: 'total-dev-badge--locked',
      UNLOCKED: 'total-dev-badge--unlocked',
      EXPIRED: 'total-dev-badge--expired',
      CHECKING: 'total-dev-badge--checking',
    };

    const remaining =
      lockState === 'UNLOCKED' && expiresAt
        ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
        : null;

    const remainingLabel =
      remaining !== null ? ` (${Math.floor(remaining / 60)}m${remaining % 60}s)` : '';

    return (
      <span className={`total-dev-badge ${colors[lockState]}`} data-testid="lock-badge">
        {labels[lockState]}
        {remainingLabel}
      </span>
    );
  }
);
LockBadge.displayName = 'LockBadge';

// ─────────────────────────────────────────────────────────────────
// UNLOCK PANEL
// ─────────────────────────────────────────────────────────────────
const UnlockPanel = memo<{
  onUnlocked: (expiresAt: number) => void;
}>(({ onUnlocked }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Calculer le hash SHA-256 du mot de passe avant envoi
      const tokenHash = await sha256(inputValue);

      // Envoyer le hash au backend pour comparaison
      const result = await secureInvoke<UnlockResult>(TAURI_COMMANDS.TOTAL_DEV_UNLOCK, {
        token: tokenHash,
      });
      if (result.ok && result.expires_at_unix) {
        logger.info('TOTAL_DEV unlocked', { component: 'TotalDevPage' });
        setInputValue('');
        onUnlocked(result.expires_at_unix);
      } else {
        setError(result.error ?? 'Token invalide');
      }
    } catch (e) {
      setError(`Erreur IPC: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [inputValue, onUnlocked]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleUnlock();
    },
    [handleUnlock]
  );

  return (
    <div className="total-dev-unlock-panel">
      <div className="total-dev-unlock-icon">🔐</div>
      <h2 className="total-dev-unlock-title">TOTAL_DEV — Accès Gouverné</h2>
      <p className="total-dev-unlock-desc">
        Cet espace requiert un unlock explicite. La vérification est effectuée côté Rust
        (SHA-256). Aucun secret n'est stocké côté frontend. Session : 1h.
      </p>
      <div className="total-dev-unlock-form">
        <input
          type="password"
          placeholder="Token unlock..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="total-dev-unlock-input"
          autoComplete="off"
          disabled={loading}
        />
        <button
          onClick={handleUnlock}
          disabled={loading || !inputValue.trim()}
          className="total-dev-unlock-btn"
          data-testid="total-dev-unlock-btn"
        >
          {loading ? '...' : 'UNLOCK'}
        </button>
      </div>
      {error && <p className="total-dev-unlock-error">{error}</p>}
      <p className="total-dev-unlock-hint">
        En mode LOCKED : lecture et analyse disponibles.
      </p>
    </div>
  );
});
UnlockPanel.displayName = 'UnlockPanel';

// ─────────────────────────────────────────────────────────────────
// CHAT DEV
// ─────────────────────────────────────────────────────────────────
const ChatDevPanel = memo<{ lockState: LockState }>(({ lockState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        '**GOD DEV TITANE** prêt.\n\nProvider: **QWEN-Coder** (qwen2.5-coder via Ollama)\nMode: ' +
        (lockState === 'UNLOCKED' ? '🔓 FULL DEV' : '🔒 ANALYZE ONLY') +
        '\n\nContexte architecture injecté. Posez votre question ou donnez une mission.',
      timestamp: Date.now(),
      provider: 'ollama',
      model: 'qwen2.5-coder',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const txt = input.trim();
    if (!txt || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: txt,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Construire le contexte pour QWEN-Coder
      const modeNote =
        lockState === 'UNLOCKED'
          ? '[MODE: FULL_DEV_UNLOCKED — toutes les actions sont autorisées]'
          : '[MODE: ANALYZE_ONLY_LOCKED — lecture et analyse uniquement]';

      const systemPrompt = TOTAL_DEV_SYSTEM_PROMPT + '\n\n' + modeNote;

      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Utiliser la commande chat canonique avec provider Ollama + modèle qwen
      const result = await secureInvoke<{
        ok?: boolean;
        content?: string;
        message?: string;
        error?: string;
        response?: string;
      }>(TAURI_COMMANDS.CHAT_GENERATE, {
        message: txt,
        context: {
          system_prompt: systemPrompt,
          history: chatHistory,
          provider: 'ollama',
          model: 'qwen2.5-coder',
          mode: 'total_dev',
        },
      });

      const responseText =
        result.content ??
        result.message ??
        result.response ??
        (result.error
          ? `[Erreur provider: ${result.error}]`
          : '[Aucune réponse du provider QWEN-Coder. Vérifiez que Ollama est actif avec qwen2.5-coder]');

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        provider: 'ollama',
        model: 'qwen2.5-coder',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: `**ERREUR IPC:** ${String(e)}\n\nVérifiez que Ollama est actif: \`ollama run qwen2.5-coder\``,
        timestamp: Date.now(),
        provider: 'ollama',
        model: 'qwen2.5-coder',
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lockState]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="total-dev-panel">
      <div className="total-dev-panel-header">
        <span>💬 CHAT DEV</span>
        <span className="total-dev-provider-badge">QWEN-Coder · ollama</span>
      </div>
      <div className="total-dev-chat-messages">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`total-dev-chat-msg total-dev-chat-msg--${msg.role}`}
          >
            <div className="total-dev-chat-msg-meta">
              <span className="total-dev-chat-role">
                {msg.role === 'user' ? '👤' : '🤖'} {msg.role.toUpperCase()}
              </span>
              {msg.model && <span className="total-dev-chat-model">{msg.model}</span>}
            </div>
            <pre className="total-dev-chat-content">{msg.content}</pre>
          </div>
        ))}
        {loading && (
          <div className="total-dev-chat-msg total-dev-chat-msg--assistant">
            <div className="total-dev-chat-msg-meta">
              <span className="total-dev-chat-role">🤖 ASSISTANT</span>
              <span className="total-dev-chat-model">qwen2.5-coder</span>
            </div>
            <div className="total-dev-chat-loading">
              <span className="total-dev-spinner" /> Génération en cours...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="total-dev-chat-input-row">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Question ou mission DEV... (Entrée = envoyer, Shift+Entrée = nouvelle ligne)"
          className="total-dev-chat-input"
          rows={3}
          disabled={loading}
        />
        <div className="total-dev-chat-btns">
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="total-dev-btn total-dev-btn--primary"
          >
            ENVOYER
          </button>
          <button
            onClick={() =>
              setMessages(prev => (prev.length > 0 ? [prev[0] as ChatMessage] : []))
            }
            className="total-dev-btn total-dev-btn--ghost"
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
});
ChatDevPanel.displayName = 'ChatDevPanel';

// ─────────────────────────────────────────────────────────────────
// CONSOLE DEV
// ─────────────────────────────────────────────────────────────────
const ConsoleDevPanel = memo<{ lockState: LockState }>(({ lockState }) => {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [cmdInput, setCmdInput] = useState('');
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const runCommand = useCallback(async () => {
    const cmd = cmdInput.trim();
    if (!cmd || running) return;

    if (lockState !== 'UNLOCKED') {
      setEntries(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          command: cmd,
          result: {
            ok: false,
            content: '',
            stderr: 'LOCKED — Unlock TOTAL_DEV pour exécuter des commandes.',
            exit_code: -1,
            command_id: 'blocked',
            started_at: Math.floor(Date.now() / 1000),
            ended_at: Math.floor(Date.now() / 1000),
            duration_ms: 0,
          },
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const entry: ConsoleEntry = {
      id: `cmd_${Date.now()}`,
      command: cmd,
      timestamp: Date.now(),
    };
    setEntries(prev => [...prev, entry]);
    setCmdInput('');
    setRunning(true);

    try {
      const result = await secureInvoke<ConsoleResult>(
        TAURI_COMMANDS.TOTAL_DEV_RUN_COMMAND,
        { command: cmd }
      );
      setEntries(prev => prev.map(e => (e.id === entry.id ? { ...e, result } : e)));
    } catch (e) {
      setEntries(prev =>
        prev.map(e =>
          e.id === entry.id
            ? {
                ...e,
                result: {
                  ok: false,
                  content: '',
                  stderr: String(e),
                  exit_code: -1,
                  command_id: 'err',
                  started_at: 0,
                  ended_at: 0,
                  duration_ms: 0,
                },
              }
            : e
        )
      );
    } finally {
      setRunning(false);
    }
  }, [cmdInput, running, lockState]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') runCommand();
    },
    [runCommand]
  );

  return (
    <div className="total-dev-panel">
      <div className="total-dev-panel-header">
        <span>🖥️ CONSOLE DEV</span>
        {lockState !== 'UNLOCKED' && (
          <span className="total-dev-badge total-dev-badge--locked">LOCKED</span>
        )}
      </div>
      <div className="total-dev-console-output">
        {entries.length === 0 && (
          <div className="total-dev-console-hint">
            {lockState === 'UNLOCKED'
              ? '$ Entrez une commande (git, pnpm, cargo, node…)'
              : '🔒 Console disponible après unlock TOTAL_DEV'}
          </div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="total-dev-console-entry">
            <div className="total-dev-console-cmd">
              <span className="total-dev-console-prompt">❯</span>
              {entry.command}
            </div>
            {entry.result ? (
              <div className="total-dev-console-result">
                {entry.result.content && (
                  <pre className="total-dev-console-stdout">{entry.result.content}</pre>
                )}
                {entry.result.stderr && (
                  <pre className="total-dev-console-stderr">
                    [stderr] {entry.result.stderr}
                  </pre>
                )}
                <div className="total-dev-console-meta">
                  <span
                    className={
                      entry.result.ok ? 'total-dev-exit-ok' : 'total-dev-exit-err'
                    }
                  >
                    exit: {entry.result.exit_code}
                  </span>
                  <span className="total-dev-console-duration">
                    {entry.result.duration_ms}ms
                  </span>
                  <span className="total-dev-console-id">#{entry.result.command_id}</span>
                </div>
              </div>
            ) : (
              <div className="total-dev-console-running">⏳ En cours…</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="total-dev-console-input-row">
        <span className="total-dev-console-prompt">❯</span>
        <input
          type="text"
          value={cmdInput}
          onChange={e => setCmdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="pnpm run test | cargo check | git status | …"
          className="total-dev-console-input"
          disabled={running}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={runCommand}
          disabled={running || !cmdInput.trim()}
          className="total-dev-btn total-dev-btn--console"
        >
          RUN
        </button>
        <button
          onClick={() => setEntries([])}
          className="total-dev-btn total-dev-btn--ghost"
        >
          CLR
        </button>
      </div>
    </div>
  );
});
ConsoleDevPanel.displayName = 'ConsoleDevPanel';

// ─────────────────────────────────────────────────────────────────
// GIT PANEL
// ─────────────────────────────────────────────────────────────────
const GitPanel = memo<{ lockState: LockState }>(({ lockState }) => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runGit = useCallback(
    async (op: string, args: string[] = []) => {
      if (lockState !== 'UNLOCKED') {
        setOutput('🔒 LOCKED — Unlock TOTAL_DEV pour les opérations git.');
        return;
      }
      setLoading(true);
      try {
        const result = await secureInvoke<GitResult>(TAURI_COMMANDS.TOTAL_DEV_GIT_OP, {
          op,
          args,
        });
        const out = result.ok
          ? `✅ git ${op}\n${result.content}`
          : `❌ git ${op} (exit ${result.exit_code})\n${result.error ?? ''}\n${result.content}`;
        setOutput(out);
      } catch (e) {
        setOutput(`❌ Erreur IPC: ${String(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [lockState]
  );

  return (
    <div className="total-dev-panel">
      <div className="total-dev-panel-header">
        <span>🌿 GIT POWER</span>
        {lockState !== 'UNLOCKED' && (
          <span className="total-dev-badge total-dev-badge--locked">LOCKED</span>
        )}
      </div>
      <div className="total-dev-git-actions">
        <button
          onClick={() => runGit('status')}
          disabled={loading}
          className="total-dev-btn total-dev-btn--git"
          data-testid="total-dev-git-status"
        >
          status
        </button>
        <button
          onClick={() => runGit('diff', ['--stat'])}
          disabled={loading}
          className="total-dev-btn total-dev-btn--git"
          data-testid="total-dev-git-diff-stat"
        >
          diff --stat
        </button>
        <button
          onClick={() => runGit('log', ['--oneline', '-10'])}
          disabled={loading}
          className="total-dev-btn total-dev-btn--git"
          data-testid="total-dev-git-log"
        >
          log -10
        </button>
        <button
          onClick={() => runGit('branch')}
          disabled={loading}
          className="total-dev-btn total-dev-btn--git"
          data-testid="total-dev-git-branch"
        >
          branch
        </button>
        <button
          onClick={() => runGit('rev-parse', ['--short', 'HEAD'])}
          disabled={loading}
          className="total-dev-btn total-dev-btn--git"
          data-testid="total-dev-git-head-sha"
        >
          HEAD SHA
        </button>
      </div>

      <p className="total-dev-git-note" data-testid="total-dev-git-readonly-note">
        Surface Git read-only gouvernee: inspection locale seulement. Les operations
        d'ecriture git restent hors de ce panneau.
      </p>

      {output && (
        <pre className="total-dev-git-output">
          {loading ? '⏳ En cours...\n' : ''}
          {output}
        </pre>
      )}
    </div>
  );
});
GitPanel.displayName = 'GitPanel';

// ─────────────────────────────────────────────────────────────────
// FILE INSPECTOR
// ─────────────────────────────────────────────────────────────────
const FileInspectorPanel = memo<{ lockState: LockState }>(({ lockState }) => {
  const [path, setPath] = useState('');
  const [result, setResult] = useState<FileResult | null>(null);
  const [loading, setLoading] = useState(false);

  const readFile = useCallback(async () => {
    const p = path.trim();
    if (!p) return;
    if (lockState !== 'UNLOCKED') {
      setResult({ ok: false, path: p, error: 'LOCKED — unlock requis' });
      return;
    }
    setLoading(true);
    try {
      const res = await secureInvoke<FileResult>(TAURI_COMMANDS.TOTAL_DEV_READ_FILE, {
        path: p,
      });
      setResult(res);
    } catch (e) {
      setResult({ ok: false, path: p, error: String(e) });
    } finally {
      setLoading(false);
    }
  }, [path, lockState]);

  return (
    <div className="total-dev-panel">
      <div className="total-dev-panel-header">
        <span>📂 FILE INSPECTOR</span>
        {lockState !== 'UNLOCKED' && (
          <span className="total-dev-badge total-dev-badge--locked">LOCKED</span>
        )}
      </div>
      <div className="total-dev-file-input-row">
        <input
          type="text"
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="src/pages/TotalDevPage.tsx ou chemin relatif..."
          className="total-dev-file-input"
          onKeyDown={e => e.key === 'Enter' && readFile()}
        />
        <button
          onClick={readFile}
          disabled={loading || !path.trim()}
          className="total-dev-btn total-dev-btn--primary"
        >
          {loading ? '...' : 'LIRE'}
        </button>
      </div>
      {result && (
        <div className="total-dev-file-result">
          <div className="total-dev-file-meta">
            <span className={result.ok ? 'total-dev-exit-ok' : 'total-dev-exit-err'}>
              {result.ok ? '✅' : '❌'} {result.path}
            </span>
            {result.size !== undefined && (
              <span>{(result.size / 1024).toFixed(1)} KB</span>
            )}
            {result.lines !== undefined && <span>{result.lines} lignes</span>}
          </div>
          {result.error && <p className="total-dev-file-error">{result.error}</p>}
          {result.content && (
            <pre className="total-dev-file-content">{result.content}</pre>
          )}
        </div>
      )}
    </div>
  );
});
FileInspectorPanel.displayName = 'FileInspectorPanel';

// ─────────────────────────────────────────────────────────────────
// DEV ACTIONS
// ─────────────────────────────────────────────────────────────────
const DevActionsPanel = memo<{ lockState: LockState }>(({ lockState }) => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runCmd = useCallback(
    async (cmd: string) => {
      if (lockState !== 'UNLOCKED') {
        setOutput('🔒 LOCKED — unlock requis');
        return;
      }
      setLoading(true);
      setOutput(`$ ${cmd}\n⏳ En cours...`);
      try {
        const result = await secureInvoke<ConsoleResult>(
          TAURI_COMMANDS.TOTAL_DEV_RUN_COMMAND,
          { command: cmd }
        );
        const out =
          `$ ${cmd}\n` +
          `exit: ${result.exit_code} | ${result.duration_ms}ms\n\n` +
          (result.content || '') +
          (result.stderr ? `\n[stderr]\n${result.stderr}` : '');
        setOutput(out);
      } catch (e) {
        setOutput(`❌ Erreur: ${String(e)}`);
      } finally {
        setLoading(false);
      }
    },
    [lockState]
  );

  const actions = [
    { label: '🧪 pnpm test', cmd: 'pnpm run test' },
    { label: '✅ pnpm check', cmd: 'pnpm run check' },
    { label: '🔍 pnpm lint', cmd: 'pnpm run lint' },
    {
      label: '🦀 cargo check',
      cmd: 'cargo check --manifest-path src-tauri/Cargo.toml',
    },
    {
      label: '🦀 cargo clippy',
      cmd: 'cargo clippy --manifest-path src-tauri/Cargo.toml',
    },
    { label: '📦 pnpm build', cmd: 'pnpm run build' },
    { label: '🧪 test:100', cmd: 'pnpm run test:100' },
    { label: '🔒 verify:invariants', cmd: 'pnpm run verify:invariants-governed' },
    { label: '🌐 e2e:desktop', cmd: 'pnpm run e2e:desktop:run' },
    { label: '📊 node -v', cmd: 'node -v' },
    { label: '📦 pnpm -v', cmd: 'pnpm -v' },
    { label: '🦀 cargo -V', cmd: 'cargo -V' },
  ];

  return (
    <div className="total-dev-panel">
      <div className="total-dev-panel-header">
        <span>⚡ DEV ACTIONS</span>
        {lockState !== 'UNLOCKED' && (
          <span className="total-dev-badge total-dev-badge--locked">LOCKED</span>
        )}
      </div>
      <div className="total-dev-actions-grid">
        {actions.map(action => (
          <button
            key={action.cmd}
            onClick={() => runCmd(action.cmd)}
            disabled={loading || lockState !== 'UNLOCKED'}
            className="total-dev-action-btn"
            title={action.cmd}
            data-testid="dev-action-btn"
          >
            {action.label}
          </button>
        ))}
      </div>
      {output && <pre className="total-dev-actions-output">{output}</pre>}
    </div>
  );
});
DevActionsPanel.displayName = 'DevActionsPanel';

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────

type TabId = 'chat' | 'console' | 'git' | 'files' | 'actions';

export const TotalDevPage: React.FC = () => {
  const { lockState, expiresAt, setLockState, setExpiresAt } = useLockState();
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const handleUnlocked = useCallback(
    (exp: number) => {
      setLockState('UNLOCKED');
      setExpiresAt(exp);
    },
    [setLockState, setExpiresAt]
  );

  const handleRevoke = useCallback(async () => {
    try {
      await secureInvoke(TAURI_COMMANDS.TOTAL_DEV_REVOKE, {});
      setLockState('LOCKED');
      setExpiresAt(0);
    } catch (e) {
      logger.warn('Total dev revoke failed', { error: String(e) });
    }
  }, [setLockState, setExpiresAt]);

  const expiresLabel =
    lockState === 'UNLOCKED' && expiresAt
      ? new Date(expiresAt * 1000).toLocaleTimeString('fr-FR')
      : null;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'chat', label: '💬 CHAT DEV' },
    { id: 'console', label: '🖥️ CONSOLE' },
    { id: 'git', label: '🌿 GIT' },
    { id: 'files', label: '📂 FICHIERS' },
    { id: 'actions', label: '⚡ ACTIONS' },
  ];

  return (
    <div className="total-dev-page">
      {/* HEADER ─────────────────────────────────────────── */}
      <header className="total-dev-header" data-testid="total-dev-header">
        <div className="total-dev-header-left">
          <h1 className="total-dev-title">
            ⚛ <span className="total-dev-title-main">TOTAL_DEV</span>
            <span className="total-dev-title-sub">GOD DEV TITANE∞</span>
          </h1>
        </div>
        <div className="total-dev-header-meta">
          <LockBadge lockState={lockState} expiresAt={expiresAt} />
          <span className="total-dev-meta-item">Provider: qwen2.5-coder</span>
          <span className="total-dev-meta-item">v30.0.0</span>
          {expiresLabel && (
            <span className="total-dev-meta-item">Expire: {expiresLabel}</span>
          )}
          {lockState === 'UNLOCKED' && (
            <button
              onClick={handleRevoke}
              className="total-dev-btn total-dev-btn--revoke"
              title="Révoquer la session"
            >
              🔒 LOCK
            </button>
          )}
        </div>
      </header>

      {/* UNLOCK (si locked/expired) ──────────────────────── */}
      {(lockState === 'LOCKED' ||
        lockState === 'EXPIRED' ||
        lockState === 'CHECKING') && (
        <div className="total-dev-main-area total-dev-main-area--locked">
          {lockState !== 'CHECKING' && <UnlockPanel onUnlocked={handleUnlocked} />}
          {lockState === 'CHECKING' && (
            <div className="total-dev-checking">
              <span className="total-dev-spinner" /> Vérification session…
            </div>
          )}
          {/* Chat accessible même en mode LOCKED */}
          <div className="total-dev-locked-chat">
            <ChatDevPanel lockState={lockState} />
          </div>
        </div>
      )}

      {/* MAIN AREA (unlocked) ────────────────────────────── */}
      {lockState === 'UNLOCKED' && (
        <div className="total-dev-main-area">
          {/* TABS */}
          <div className="total-dev-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`total-dev-tab ${activeTab === tab.id ? 'total-dev-tab--active' : ''}`}
                data-testid={`total-dev-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="total-dev-tab-content">
            {activeTab === 'chat' && <ChatDevPanel lockState={lockState} />}
            {activeTab === 'console' && <ConsoleDevPanel lockState={lockState} />}
            {activeTab === 'git' && <GitPanel lockState={lockState} />}
            {activeTab === 'files' && <FileInspectorPanel lockState={lockState} />}
            {activeTab === 'actions' && <DevActionsPanel lockState={lockState} />}
          </div>
        </div>
      )}

      {/* FOOTER ─────────────────────────────────────────── */}
      <footer className="total-dev-footer">
        <span>TITANE∞ v30.0.0 · TOTAL_DEV · Ring1→IPC→Rust</span>
        <span>
          {lockState === 'UNLOCKED'
            ? '🔓 Session active — tous les pouvoirs GOD DEV disponibles'
            : '🔒 Mode ANALYZE ONLY — unlock pour les actions critiques'}
        </span>
      </footer>
    </div>
  );
};

TotalDevPage.displayName = 'TotalDevPage';
