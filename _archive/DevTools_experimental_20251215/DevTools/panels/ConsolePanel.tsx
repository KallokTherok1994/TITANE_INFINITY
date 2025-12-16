/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Console Panel                                   ║
 * ║   Interactive DevTools console for internal commands              ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useRef, useEffect } from 'react';
import { useConsole } from '../hooks/useConsole';
import './ConsolePanel.css';

export const ConsolePanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { history, executing, executeCommand, clearHistory } = useConsole();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || executing) return;

    await executeCommand(input.trim());
    setInput('');
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [history]);

  return (
    <div className="console-panel">
      <div className="panel-header">
        <h2 className="panel-title">💻 DevTools Console</h2>
        <div className="panel-actions">
          <button className="btn btn-secondary" onClick={clearHistory}>
            Clear History
          </button>
        </div>
      </div>

      <div className="console-help">
        <strong>Available Commands:</strong>
        <code>omega.debug()</code>
        <code>memory.clear("STM")</code>
        <code>engine.reset("coherence")</code>
        <code>self_healing.trigger("ClearSTM")</code>
        <code>system.health()</code>
      </div>

      <div className="console-history" ref={containerRef}>
        {history.map((result, index) => (
          <div key={index} className="console-entry">
            <div className="console-command">
              <span className="console-prompt">&gt;</span>
              <span className="console-command-text">{result.command}</span>
              <span className="console-timestamp">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className={`console-result ${result.success ? 'success' : 'error'}`}>
              {result.success ? (
                <pre>{JSON.stringify(result.result, null, 2)}</pre>
              ) : (
                <div className="console-error">❌ {result.error}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form className="console-input-form" onSubmit={handleSubmit}>
        <span className="console-prompt">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          className="console-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter command..."
          disabled={executing}
        />
        <button type="submit" className="btn" disabled={executing || !input.trim()}>
          {executing ? 'Executing...' : 'Execute'}
        </button>
      </form>
    </div>
  );
};
