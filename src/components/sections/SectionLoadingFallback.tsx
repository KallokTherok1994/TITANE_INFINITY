import React from 'react';
import { colors, spacing, fontSizes } from '@themes/tokens';

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
        gap: spacing[2],
        padding: spacing[4],
        borderRadius: '0.75rem',
        border: `1px solid ${colors.neutral[700]}`,
        background: colors.neutral[900],
        color: colors.neutral[200],
      }}
    >
      <strong style={{ fontSize: fontSizes.sm }}>{label}</strong>
      <span style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>{note}</span>
    </div>
  );
};

export default SectionLoadingFallback;
