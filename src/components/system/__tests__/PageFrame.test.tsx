import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageFrame, PageSection } from '../PageFrame';

describe('PageFrame', () => {
  it('renders with correct testid and surface frame attribute', () => {
    render(<PageFrame id="test-page"><div>content</div></PageFrame>);
    const frame = screen.getByTestId('page-frame-test-page');
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute('data-surface-frame', 'test-page');
  });

  it('renders children', () => {
    render(<PageFrame id="x"><span data-testid="child">hello</span></PageFrame>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies padding classes', () => {
    render(<PageFrame id="p" padding="lg"><div /></PageFrame>);
    expect(screen.getByTestId('page-frame-p').className).toContain('p-8');
  });
});

describe('PageSection', () => {
  it('renders title and subtitle', () => {
    render(
      <PageSection title="Test Title" subtitle="Test subtitle">
        <span>child</span>
      </PageSection>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders with testId', () => {
    render(<PageSection testId="my-section"><span>x</span></PageSection>);
    expect(screen.getByTestId('my-section')).toBeInTheDocument();
  });
});
