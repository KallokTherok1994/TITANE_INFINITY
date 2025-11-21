// TITANE∞ v12 - Panel Component
import { ReactNode } from 'react';
import './Panel.css';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export const Panel = ({ title, children, className = '', elevated = false }: PanelProps) => {
  const classes = [
    'panel',
    elevated && 'panel--elevated',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {title && <div className="panel__header">{title}</div>}
      <div className="panel__content">{children}</div>
    </div>
  );
};
