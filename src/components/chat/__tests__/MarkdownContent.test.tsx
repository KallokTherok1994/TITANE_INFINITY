import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from '../MarkdownContent';

describe('MarkdownContent', () => {
  it('renders bold text and list items without preserving raw markdown markers', () => {
    const { container } = render(
      <MarkdownContent content={'[MOCK_OK] **Alpha**\n\n- Beta\n- Gamma'} />
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(container.querySelector('strong')?.textContent).toBe('Alpha');
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.textContent).not.toContain('**Alpha**');
  });

  it('renders links and code blocks as semantic markdown nodes', () => {
    const { container } = render(
      <MarkdownContent
        content={'# Titre\n\nVoir [source](https://example.com)\n\n```ts\nconst value = 42;\n```'}
      />
    );

    expect(container.querySelector('h1')?.textContent).toBe('Titre');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.textContent).toContain('ts');
    expect(container.querySelector('pre code')?.textContent).toContain('const value = 42;');
  });

  it('renders blockquotes and tables without leaking raw markdown separators', () => {
    const { container } = render(
      <MarkdownContent
        content={'> Citation importante\n\n| Colonne | Valeur |\n| --- | --- |\n| Alpha | 42 |'}
      />
    );

    expect(container.querySelector('blockquote')?.textContent).toContain(
      'Citation importante'
    );
    expect(container.querySelectorAll('table thead th')).toHaveLength(2);
    expect(container.querySelector('table tbody td')?.textContent).toBe('Alpha');
    expect(container.textContent).not.toContain('| --- | --- |');
  });
});