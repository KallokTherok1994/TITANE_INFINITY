/**
 * TITANE∞ Remote — React hook for remote chat
 *
 * Manages authentication, conversation state, and streaming via RemoteTransport.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { RemoteTransport } from '../lib/remoteTransport';

export interface RemoteMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface RemoteChatState {
  authenticated: boolean;
  loading: boolean;
  error: string | null;
  messages: RemoteMessage[];
  conversationId: string | null;
}

type CreateConversationContent =
  | string
  | {
      conversationId?: string;
      conversation_id?: string;
    };

interface ConversationGenerateContent {
  content?: string;
  response?: string;
  answer?: string;
  text?: string;
  conversationId?: string;
  conversation_id?: string;
  error?: string;
}

export function useRemoteChat(transport: RemoteTransport | null) {
  const [state, setState] = useState<RemoteChatState>({
    authenticated: false,
    loading: false,
    error: null,
    messages: [],
    conversationId: null,
  });

  const convIdRef = useRef<string | null>(null);
  // Keep a ref to always have the latest transport without stale closure issues
  const transportRef = useRef<RemoteTransport | null>(transport);
  useEffect(() => {
    transportRef.current = transport;
  }, [transport]);

  const login = useCallback(
    async (secret: string, transportOverride?: RemoteTransport) => {
      const t = transportOverride ?? transport;
      if (!t) return;
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        // Always authenticate — transportOverride may be a fresh unauthenticated transport
        await t.authenticate(secret);
        // Create a new conversation
        const result =
          await t.invoke<CreateConversationContent>('create_new_conversation', {});
        const convId =
          (typeof result === 'string'
            ? result
            : result.conversationId ?? result.conversation_id) ??
          `remote-${Date.now()}`;
        convIdRef.current = convId;
        setState(s => ({
          ...s,
          authenticated: true,
          loading: false,
          conversationId: convId,
        }));
      } catch (e) {
        setState(s => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e.message : 'Connexion échouée',
        }));
      }
    },
    [transport]
  );

  const logout = useCallback(() => {
    transport?.clearTokens();
    convIdRef.current = null;
    setState({
      authenticated: false,
      loading: false,
      error: null,
      messages: [],
      conversationId: null,
    });
  }, [transport]);

  const sendMessage = useCallback(
    async (userText: string) => {
      const t = transportRef.current;
      if (!t || !state.authenticated) return;

      const userMsg: RemoteMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };

      setState(s => ({
        ...s,
        loading: true,
        error: null,
        messages: [...s.messages, userMsg],
      }));

      try {
        const conversationId = convIdRef.current ?? `remote-${Date.now()}`;
        convIdRef.current = conversationId;

        const result = await t.invoke<ConversationGenerateContent>(
          'conversation_generate',
          {
            message: userText,
            conversationId,
            contextEnvelope: {},
            stream: false,
          }
        );

        const text =
          result?.content ??
          result?.response ??
          result?.answer ??
          result?.text ??
          (result?.error ? `Erreur: ${result.error}` : 'Pas de réponse');
        const nextConversationId = result?.conversationId ?? result?.conversation_id;
        if (nextConversationId) {
          convIdRef.current = nextConversationId;
        }

        const aiMsg: RemoteMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
        };

        setState(s => ({
          ...s,
          loading: false,
          conversationId: convIdRef.current,
          messages: [...s.messages, aiMsg],
        }));
      } catch (e) {
        setState(s => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e.message : "Erreur lors de l'envoi",
        }));
      }
    },
    [transport, state.authenticated]
  );

  return { state, login, logout, sendMessage };
}
