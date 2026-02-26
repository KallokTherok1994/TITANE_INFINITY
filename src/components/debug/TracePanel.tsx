import React, { memo } from 'react';

interface TracePanelProps {
  trace: unknown;
  title?: string;
}

export const TracePanel = memo(function TracePanel({
  trace,
  title = 'Trace Conversation OS',
}: TracePanelProps): JSX.Element {
  if (!trace) {
    return (
      <div data-testid="trace-panel-empty" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
        Trace indisponible.
      </div>
    );
  }

  return (
    <section
      data-testid="trace-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{title}</div>
      <pre
        data-testid="trace-panel-json"
        style={{
          background: 'rgba(15,23,42,0.8)',
          borderRadius: '8px',
          padding: '8px',
          maxHeight: 180,
          overflow: 'auto',
          fontSize: '0.7rem',
          margin: 0,
        }}
      >
        {JSON.stringify(trace, null, 2)}
      </pre>
    </section>
  );
});

export default TracePanel;
