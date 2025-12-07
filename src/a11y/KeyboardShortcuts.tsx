import { useEffect, useState } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[] = []) {
  useEffect(() => {
    const defaultShortcuts: Shortcut[] = [
      {
        key: 'k',
        ctrl: true,
        action: () => document.getElementById('search-input')?.focus(),
        description: 'Focus search',
      },
      {
        key: 'n',
        ctrl: true,
        action: () => window.dispatchEvent(new CustomEvent('new-conversation')),
        description: 'New conversation',
      },
      {
        key: '/',
        ctrl: true,
        action: () => window.dispatchEvent(new CustomEvent('show-shortcuts')),
        description: 'Show shortcuts',
      },
      {
        key: 'Escape',
        action: () => window.dispatchEvent(new CustomEvent('close-modal')),
        description: 'Close modal',
      },
    ];

    const allShortcuts = [...defaultShortcuts, ...shortcuts];

    function handleKeyPress(e: KeyboardEvent) {
      for (const shortcut of allShortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const altMatch = shortcut.alt ? e.altKey : true;
        const keyMatch = e.key === shortcut.key;

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
}

interface MessageProps {
  content: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function Message({ content, onEdit, onDelete }: MessageProps) {
  const [focused, setFocused] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'e' && focused) {
      onEdit();
    }

    if (e.key === 'Delete' && focused) {
      onDelete();
    }
  }

  return (
    <div
      className="message"
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      role="article"
      aria-label={`Message: ${content.substring(0, 50)}`}
    >
      {content}
    </div>
  );
}
