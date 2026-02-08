/**
 * TITANE∞ — Conversations Context (Singleton useConversations)
 */

import React, { createContext, useContext } from 'react';
import { useConversations, type UseConversationsReturn } from '@/hooks/useConversations';

const ConversationsContext = createContext<UseConversationsReturn | null>(null);

export const ConversationsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const value = useConversations();

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversationsContext = (): UseConversationsReturn => {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error('useConversationsContext must be used within ConversationsProvider');
  }
  return ctx;
};
