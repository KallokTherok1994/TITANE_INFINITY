/**
 * TITANE∞ v∞.26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ HYBRID BUBBLE v∞
 *   Fusion AI Chat + Dev Console
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Super Prompt #16 — Copilote omniprésent hybride
 *
 * Modes:
 * - bubble: Bulle flottante minimale
 * - chat: Panneau chat IA
 * - console: Terminal dev intégré
 * - hybrid: Chat + Console simultanés
 *
 * Connexions:
 * - Singularity Engine (introspection)
 * - Memory Eternal (contexte persistant)
 * - Self-Healing Engine (auto-repair)
 * - Dev Engine (commandes techniques)
 * - AI Pipeline (Claude, Gemini, TITANE-LOCAL)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { hybridEngine } from '../modules/hybrid/HybridEngine';
import type { HybridMode, HybridExecution } from '../modules/hybrid/HybridEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface HybridBubbleProps {
  initialMode?: HybridMode;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const BUBBLE_SIZE = 64;
const PANEL_WIDTH = 480;
const PANEL_HEIGHT = 680;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const HybridBubble: React.FC<HybridBubbleProps> = ({
  initialMode = 'bubble',
}) => {
  const [mode, setMode] = useState<HybridMode>(initialMode);
  const [input, setInput] = useState('');
  const [executions, setExecutions] = useState<HybridExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to hybrid engine state
  useEffect(() => {
    const unsubscribe = hybridEngine.subscribe((state) => {
      setExecutions(state.executionHistory);
      setIsExecuting(state.isExecuting);
    });

    return unsubscribe;
  }, []);

  // Auto-scroll console
  useEffect(() => {
    if (mode === 'console' && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executions, mode]);

  // Focus input when opening console
  useEffect(() => {
    if (mode === 'console' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  // ═══ EVENT LISTENERS ═══
  useEffect(() => {
    const handleHybridOpen = () => setMode('chat');
    const handleHybridClose = () => setMode('bubble');
    const handleHybridConsole = () => setMode('console');
    const handleHybridBubble = () => setMode('bubble');

    if (typeof window !== 'undefined') {
      window.addEventListener('titane-hybrid-open', handleHybridOpen);
      window.addEventListener('titane-hybrid-close', handleHybridClose);
      window.addEventListener('titane-hybrid-console', handleHybridConsole);
      window.addEventListener('titane-hybrid-bubble', handleHybridBubble);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('titane-hybrid-open', handleHybridOpen);
        window.removeEventListener('titane-hybrid-close', handleHybridClose);
        window.removeEventListener('titane-hybrid-console', handleHybridConsole);
        window.removeEventListener('titane-hybrid-bubble', handleHybridBubble);
      }
    };
  }, []);

  // ═══ HANDLERS ═══

  const handleBubbleClick = useCallback(() => {
    if (mode === 'bubble') {
      setMode('console');
    }
  }, [mode]);

  const handleExecuteCommand = useCallback(async () => {
    if (!input.trim() || isExecuting) return;

    const command = hybridEngine.parseCommand(input);
    setInput('');

    try {
      await hybridEngine.executeCommand(command);
    } catch (error) {
      console.error('[HybridBubble] Execute failed:', error);
    }
  }, [input, isExecuting]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteCommand();
    }
  }, [handleExecuteCommand]);

  const handleModeSwitch = useCallback((newMode: HybridMode) => {
    setMode(newMode);
    hybridEngine.setState({ mode: newMode });
  }, []);

  // ═══ RENDER BUBBLE ═══
  if (mode === 'bubble') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #727B81 0%, #C4C4C4 100%)',
          boxShadow: isHovering
            ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
            : '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(196, 196, 196, 0.3)',
          transform: isHovering ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={handleBubbleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div style={{
          fontSize: '28px',
          color: '#040F1F',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isExecuting ? '⚙️' : '🧠⚡'}
        </div>
      </motion.div>
    );
  }

  // ═══ RENDER CONSOLE PANEL ═══
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        background: 'linear-gradient(180deg, #1a1f2e 0%, #0a0e1a 100%)',
        borderRadius: '16px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(196, 196, 196, 0.15)',
        border: '1px solid rgba(114, 123, 129, 0.3)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(114, 123, 129, 0.2)',
        background: 'rgba(114, 123, 129, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#C4C4C4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            🧠⚡ TITANE∞ HYBRID
            <span style={{
              fontSize: '11px',
              color: '#727B81',
              fontWeight: '400',
              padding: '2px 8px',
              background: 'rgba(114, 123, 129, 0.2)',
              borderRadius: '4px',
            }}>
              {mode === 'console' ? 'DEV CONSOLE' : 'AI CHAT'}
            </span>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#727B81',
            marginTop: '2px',
          }}>
            {executions.length} commands • v∞.26.0
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => handleModeSwitch('console')}
            style={{
              padding: '6px 12px',
              background: mode === 'console' ? 'rgba(196, 196, 196, 0.2)' : 'transparent',
              border: '1px solid rgba(114, 123, 129, 0.3)',
              borderRadius: '6px',
              color: mode === 'console' ? '#C4C4C4' : '#727B81',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📟 Console
          </button>
          <button
            onClick={() => handleModeSwitch('chat')}
            style={{
              padding: '6px 12px',
              background: mode === 'chat' ? 'rgba(196, 196, 196, 0.2)' : 'transparent',
              border: '1px solid rgba(114, 123, 129, 0.3)',
              borderRadius: '6px',
              color: mode === 'chat' ? '#C4C4C4' : '#727B81',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            💬 Chat
          </button>
          <button
            onClick={() => handleModeSwitch('bubble')}
            style={{
              padding: '6px',
              background: 'transparent',
              border: '1px solid rgba(114, 123, 129, 0.3)',
              borderRadius: '6px',
              color: '#727B81',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✖
          </button>
        </div>
      </div>

      {/* Console Output */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        fontFamily: '"Fira Code", "Consolas", monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        color: '#C4C4C4',
      }}>
        {executions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#727B81',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠⚡</div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              TITANE∞ HYBRID ENGINE v∞
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Ready for commands. Type 'help' for available actions.
            </div>
          </div>
        ) : (
          executions.slice().reverse().map((exec, index) => (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: index < executions.length - 1 ? '1px solid rgba(114, 123, 129, 0.2)' : 'none',
              }}
            >
              {/* Command */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#C4C4C4',
              }}>
                <span style={{ color: '#727B81' }}>$</span>
                <span style={{ fontWeight: '600' }}>{exec.command.raw}</span>
                <span style={{
                  fontSize: '10px',
                  color: '#727B81',
                  marginLeft: 'auto',
                }}>
                  {exec.duration}ms
                </span>
              </div>

              {/* Output */}
              <div style={{
                whiteSpace: 'pre-wrap',
                color: exec.exitCode === 0 ? '#C4C4C4' : '#ff6b6b',
                fontSize: '12px',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '6px',
                border: `1px solid ${exec.exitCode === 0 ? 'rgba(114, 123, 129, 0.2)' : 'rgba(255, 107, 107, 0.3)'}`,
              }}>
                {exec.output || (exec.errors && exec.errors.join('\n')) || '(no output)'}
              </div>

              {/* Exit code indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px',
                fontSize: '11px',
                color: exec.exitCode === 0 ? '#4ade80' : '#ff6b6b',
              }}>
                {exec.exitCode === 0 ? '✅' : '❌'} Exit code: {exec.exitCode}
              </div>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>

      {/* Command Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(114, 123, 129, 0.2)',
        background: 'rgba(10, 14, 26, 0.8)',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            color: '#727B81',
            fontSize: '14px',
            fontFamily: '"Fira Code", "Consolas", monospace',
          }}>
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (e.g., inspect system, logs, fix module)"
            disabled={isExecuting}
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(114, 123, 129, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#C4C4C4',
              fontSize: '13px',
              fontFamily: '"Fira Code", "Consolas", monospace',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(196, 196, 196, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(114, 123, 129, 0.3)'}
          />
          <button
            onClick={handleExecuteCommand}
            disabled={!input.trim() || isExecuting}
            style={{
              padding: '10px 20px',
              background: input.trim() && !isExecuting
                ? 'linear-gradient(135deg, #727B81 0%, #C4C4C4 100%)'
                : 'rgba(114, 123, 129, 0.3)',
              border: 'none',
              borderRadius: '8px',
              color: '#040F1F',
              fontSize: '13px',
              fontWeight: '600',
              cursor: input.trim() && !isExecuting ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: input.trim() && !isExecuting ? 1 : 0.5,
            }}
          >
            {isExecuting ? '⚙️ Executing...' : '▶ Run'}
          </button>
        </div>

        {/* Helper hints */}
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#727B81',
          display: 'flex',
          gap: '12px',
        }}>
          <span>💡 Try: inspect, logs, fix, diagnostic</span>
          <span>•</span>
          <span>📘 Type 'help' for all commands</span>
        </div>
      </div>
    </motion.div>
  );
};

HybridBubble.displayName = 'HybridBubble';

export default HybridBubble;
