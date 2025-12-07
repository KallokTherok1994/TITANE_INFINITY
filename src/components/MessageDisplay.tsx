import React from 'react';
import { Sanitizer } from '@/security/sanitizer';

interface MessageDisplayProps {
  content: string;
  isMarkdown?: boolean;
}

export function MessageDisplay({ content, isMarkdown }: MessageDisplayProps) {
  if (isMarkdown) {
    // Si c'est du Markdown, le parser doit d'abord convertir puis sanitize
    const htmlContent = Sanitizer.sanitizeHtml(content);

    return (
      <div
        className="message-display"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  // Sinon, affichage texte simple
  return <div className="message-display">{content}</div>;
}
