import React from 'react';

interface SectionLoadingFallbackProps {
  label: string;
  note?: string;
  testId?: string;
}

export const SectionLoadingFallback: React.FC<SectionLoadingFallbackProps> = ({
  label,
  note = 'Initialisation du module en cours…',
  testId,
}) => {
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <strong style={{ fontSize: 'var(--text-sm)' }}>{label}</strong>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {note}
      </span>
    </div>
  );
};

export default SectionLoadingFallback;
