/**
 * TITANE∞ Remote — Root App
 * Wires RemoteTransport with auth screen + chat view.
 * Gateway URL is read from ?gateway= query param or entered manually.
 */

import React, { useState } from 'react';
import { RemoteTransport } from '../lib/remoteTransport';
import RemoteAuthScreen from './RemoteAuthScreen';
import RemoteChatView from './RemoteChatView';
import { useRemoteChat } from './useRemoteChat';

export default function RemoteApp() {
  const [transport, setTransport] = useState<RemoteTransport | null>(null);

  const { state, login, logout, sendMessage } = useRemoteChat(transport);

  const handleLogin = async (gatewayUrl: string, secret: string) => {
    const t = new RemoteTransport({ baseUrl: gatewayUrl });
    setTransport(t);
    // Authenticate on `t` directly, then pass t as override so login() doesn't wait
    // for the React state update of `transport` before calling t.invoke()
    await login(secret, t);
  };

  const handleLogout = () => {
    logout();
    setTransport(null);
  };

  if (!state.authenticated) {
    return (
      <RemoteAuthScreen
        onLogin={handleLogin}
        loading={state.loading}
        error={state.error}
      />
    );
  }

  return (
    <RemoteChatView
      messages={state.messages}
      loading={state.loading}
      error={state.error}
      conversationId={state.conversationId}
      onSend={sendMessage}
      onLogout={handleLogout}
    />
  );
}
