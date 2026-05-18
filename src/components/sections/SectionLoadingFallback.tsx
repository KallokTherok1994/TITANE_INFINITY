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
        border: '1px solid var(--titanium-border-subtle, rgba(255,255,255,0.06))',
        background: 'var(--titanium-bg-elevated, #1a1a1a)',
        color: 'var(--titanium-text-secondary, #b8b8b8)',
      }}
    >
      <strong style={{ fontSize: '0.875rem', color: 'var(--titanium-text-primary, #f5f5f5)' }}>{label}</strong>
      <span style={{ fontSize: '0.8125rem', color: 'var(--titanium-text-tertiary, #8a8a8a)' }}>
        {note}
      </span>
    </div>
  );
};

export default SectionLoadingFallback;
