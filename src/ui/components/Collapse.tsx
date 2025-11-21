// TITANE∞ v12 - Collapse Component
import { ReactNode, useState } from 'react';
import { Icons } from '../Icons';
import './Collapse.css';

interface CollapseProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Collapse = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const classes = [
    'collapse',
    isOpen && 'collapse--open',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <button
        className="collapse__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="collapse__title">{title}</span>
        <span className={`collapse__icon ${isOpen ? 'collapse__icon--open' : ''}`}>
          <Icons.ChevronDown />
        </span>
      </button>
      {isOpen && <div className="collapse__content">{children}</div>}
    </div>
  );
};
