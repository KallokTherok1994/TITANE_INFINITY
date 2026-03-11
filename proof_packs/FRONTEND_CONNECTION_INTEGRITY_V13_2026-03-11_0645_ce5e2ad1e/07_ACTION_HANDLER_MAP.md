# 07 Action Handler Map

Chat interaction chain:

1. UI input: `data-testid="chat-input"`.
2. User action: `handleSend` callback.
3. Handler calls `sendMessage(messageText)`.
4. Hook pipeline continues in `useChat`.

Proof:

- `raw/10_conversation_action_links.txt`
