// TITANE∞ v12 - ScrollContainer Component
import { ReactNode, UIEvent, useRef, useState } from 'react';
import './ScrollContainer.css';

interface ScrollContainerProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export const ScrollContainer = ({
  children,
  className = '',
  maxHeight = '100%',
}: ScrollContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(true);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    setShowTopShadow(scrollTop > 0);
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 1);
  };

  const classes = [
    'scroll-container',
    showTopShadow && 'scroll-container--shadow-top',
    showBottomShadow && 'scroll-container--shadow-bottom',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ maxHeight }}>
      <div
        ref={scrollRef}
        className="scroll-container__content"
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  );
};
