/**
 * Test contrat IPC — Zod Top-20
 * V32 Phase 3 — Rule 16 compliance
 * Vérifie que validateIpcPayload accepte les payloads valides
 * et rejette les payloads invalides pour les 20 nouvelles commandes.
 */
import { describe, it, expect } from 'vitest';
import { validateIpcPayload } from '../../src/lib/ipcContract';

describe('IPC Zod Contract — Top-20 (V32 Phase 3)', () => {
  // ─── create_new_conversation ────────────────────────────────
  it('create_new_conversation: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('create_new_conversation', { userId: 'user-1', title: 'Test' })
    ).not.toThrow();
  });

  it('create_new_conversation: rejects missing userId', () => {
    expect(() => validateIpcPayload('create_new_conversation', {})).toThrow(/IPC contract/);
  });

  // ─── get_conversation_history ───────────────────────────────
  it('get_conversation_history: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('get_conversation_history', { conversationId: 'conv-1', limit: 20 })
    ).not.toThrow();
  });

  it('get_conversation_history: rejects missing conversationId', () => {
    expect(() => validateIpcPayload('get_conversation_history', {})).toThrow(/IPC contract/);
  });

  // ─── delete_conversation ────────────────────────────────────
  it('delete_conversation: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('delete_conversation', { conversationId: 'conv-1' })
    ).not.toThrow();
  });

  // ─── set_provider_preference ────────────────────────────────
  it('set_provider_preference: accepts valid enum value', () => {
    expect(() =>
      validateIpcPayload('set_provider_preference', { preference: 'ollama' })
    ).not.toThrow();
  });

  it('set_provider_preference: rejects invalid enum value', () => {
    expect(() =>
      validateIpcPayload('set_provider_preference', { preference: 'unknown_provider' })
    ).toThrow(/IPC contract/);
  });

  // ─── chat_set_gemini_key ─────────────────────────────────────
  it('chat_set_gemini_key: accepts valid key', () => {
    expect(() =>
      validateIpcPayload('chat_set_gemini_key', { key: 'AIzaSyXXXXXXXXXX' })
    ).not.toThrow();
  });

  it('chat_set_gemini_key: rejects empty key', () => {
    expect(() =>
      validateIpcPayload('chat_set_gemini_key', { key: '' })
    ).toThrow(/IPC contract/);
  });

  // ─── cycle commands (no-args) ────────────────────────────────
  it('cycle_get_state: accepts empty payload', () => {
    expect(() => validateIpcPayload('cycle_get_state', {})).not.toThrow();
  });

  it('cycle_get_rhythm: accepts empty payload', () => {
    expect(() => validateIpcPayload('cycle_get_rhythm', {})).not.toThrow();
  });

  it('cycle_get_alignment: accepts empty payload', () => {
    expect(() => validateIpcPayload('cycle_get_alignment', {})).not.toThrow();
  });

  it('cycle_get_diagnostics: accepts empty payload', () => {
    expect(() => validateIpcPayload('cycle_get_diagnostics', {})).not.toThrow();
  });

  // ─── cycle_predict_events ────────────────────────────────────
  it('cycle_predict_events: accepts valid hoursAhead', () => {
    expect(() =>
      validateIpcPayload('cycle_predict_events', { hoursAhead: 24 })
    ).not.toThrow();
  });

  it('cycle_predict_events: rejects hoursAhead > 168', () => {
    expect(() =>
      validateIpcPayload('cycle_predict_events', { hoursAhead: 999 })
    ).toThrow(/IPC contract/);
  });

  // ─── cycle_suggest_optimal_time ──────────────────────────────
  it('cycle_suggest_optimal_time: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('cycle_suggest_optimal_time', { taskType: 'deep-work', durationMinutes: 90 })
    ).not.toThrow();
  });

  // ─── web_research ────────────────────────────────────────────
  it('web_research: accepts valid query', () => {
    expect(() =>
      validateIpcPayload('web_research', { query: 'TITANE AI system' })
    ).not.toThrow();
  });

  it('web_research: rejects empty query', () => {
    expect(() =>
      validateIpcPayload('web_research', { query: '' })
    ).toThrow(/IPC contract/);
  });

  // ─── memory_hybrid_store ─────────────────────────────────────
  it('memory_hybrid_store: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('memory_hybrid_store', { key: 'user-pref', value: 'dark-mode' })
    ).not.toThrow();
  });

  // ─── memory_hybrid_recall ────────────────────────────────────
  it('memory_hybrid_recall: accepts valid payload', () => {
    expect(() =>
      validateIpcPayload('memory_hybrid_recall', { query: 'user preferences', limit: 10 })
    ).not.toThrow();
  });

  it('memory_hybrid_recall: rejects limit > 50', () => {
    expect(() =>
      validateIpcPayload('memory_hybrid_recall', { query: 'test', limit: 100 })
    ).toThrow(/IPC contract/);
  });

  // ─── singularity_set_intent ──────────────────────────────────
  it('singularity_set_intent: accepts valid intent', () => {
    expect(() =>
      validateIpcPayload('singularity_set_intent', { intent: 'focus-mode', priority: 8 })
    ).not.toThrow();
  });

  // ─── window_set_zoom ─────────────────────────────────────────
  it('window_set_zoom: accepts valid zoom level', () => {
    expect(() =>
      validateIpcPayload('window_set_zoom', { level: 1.5 })
    ).not.toThrow();
  });

  it('window_set_zoom: rejects zoom level > 5.0', () => {
    expect(() =>
      validateIpcPayload('window_set_zoom', { level: 10 })
    ).toThrow(/IPC contract/);
  });

  // ─── get_ollama_status (no-args) ─────────────────────────────
  it('get_ollama_status: accepts empty payload', () => {
    expect(() => validateIpcPayload('get_ollama_status', {})).not.toThrow();
  });
});
