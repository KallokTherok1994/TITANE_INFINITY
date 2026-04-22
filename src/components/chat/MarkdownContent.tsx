/**
 * TITANE∞ — Markdown Content Renderer
 * Renders message content with markdown support (bold, italic, code, lists, etc.)
 * Integrates with CodeBlock for syntax highlighting
 *
 * v30.0.0 (Sprint 6)
 */

import React, { useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface MarkdownContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

interface ParsedNode {
  type:
    | 'text'
    | 'bold'
    | 'italic'
    | 'code'
    | 'codeBlock'
    | 'heading'
    | 'list'
    | 'link'
    | 'blockquote'
    | 'table'
    | 'break';
  content: string;
  language?: string;
  href?: string;
  children?: ParsedNode[];
  rows?: string[][];
}

// ═══════════════════════════════════════════════════════════════════
// MARKDOWN PARSER
// ═══════════════════════════════════════════════════════════════════

/**
 * Simple markdown parser (no external dependencies)
 * Supports: bold, italic, code, code blocks, headings, lists, links, blockquotes, tables, line breaks
 */
class MarkdownParser {
  private text: string;
  private position: number = 0;

  constructor(text: string) {
    this.text = text;
  }

  parse(): ParsedNode[] {
    const nodes: ParsedNode[] = [];
    let currentText = '';

    while (this.position < this.text.length) {
      // Check for code block (``` ... ```)
      if (this.text.substring(this.position, this.position + 3) === '```') {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push(this.parseCodeBlock());
        continue;
      }

      // Check for heading (# ## ### etc.)
      if (
        this.text[this.position] === '#' &&
        (this.position === 0 || this.text[this.position - 1] === '\n')
      ) {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push(this.parseHeading());
        continue;
      }

      // Check for markdown table
      if (this.isTableStart()) {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push(this.parseTable());
        continue;
      }

      // Check for blockquote
      if (
        this.text[this.position] === '>' &&
        (this.position === 0 || this.text[this.position - 1] === '\n')
      ) {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push(this.parseBlockquote());
        continue;
      }

      // Check for list (* - + followed by space)
      if (
        (this.text[this.position] === '*' ||
          this.text[this.position] === '-' ||
          this.text[this.position] === '+') &&
        this.text[this.position + 1] === ' ' &&
        (this.position === 0 || this.text[this.position - 1] === '\n')
      ) {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push(this.parseList());
        continue;
      }

      // Check for line break
      if (this.text[this.position] === '\n' && this.text[this.position + 1] === '\n') {
        if (currentText) {
          nodes.push({ type: 'text', content: currentText });
          currentText = '';
        }
        nodes.push({ type: 'break', content: '' });
        this.position += 2;
        continue;
      }

      // Accumulate regular text or process inline formatting
      const inlineResult = this.parseInline(currentText);
      if (inlineResult.parsed) {
        currentText = '';
        nodes.push(...inlineResult.nodes);
        this.position = inlineResult.newPosition;
      } else {
        currentText += this.text[this.position];
        this.position++;
      }
    }

    if (currentText) {
      nodes.push({ type: 'text', content: currentText });
    }

    return nodes;
  }

  private parseInline(accumulated: string): {
    parsed: boolean;
    nodes: ParsedNode[];
    newPosition: number;
  } {
    const char = this.text[this.position];
    const nodes: ParsedNode[] = [];

    // Bold (**text** or __text__)
    if (
      (char === '*' && this.text[this.position + 1] === '*') ||
      (char === '_' && this.text[this.position + 1] === '_')
    ) {
      const delimiter = char === '*' ? '**' : '__';
      if (accumulated) nodes.push({ type: 'text', content: accumulated });

      const closePos = this.text.indexOf(delimiter, this.position + 2);
      if (closePos !== -1) {
        const boldText = this.text.substring(this.position + 2, closePos);
        nodes.push({ type: 'bold', content: boldText });
        return { parsed: true, nodes, newPosition: closePos + 2 };
      }
    }

    // Italic (*text* or _text_)
    if (
      (char === '*' && this.text[this.position + 1] !== '*') ||
      (char === '_' &&
        this.text[this.position + 1] !== '_' &&
        this.position > 0 &&
        this.text[this.position - 1] !== ' ')
    ) {
      if (accumulated) nodes.push({ type: 'text', content: accumulated });

      const closePos = this.text.indexOf(char, this.position + 1);
      if (
        closePos !== -1 &&
        (closePos === this.text.length - 1 || this.text[closePos + 1] !== char)
      ) {
        const italicText = this.text.substring(this.position + 1, closePos);
        nodes.push({ type: 'italic', content: italicText });
        return { parsed: true, nodes, newPosition: closePos + 1 };
      }
    }

    // Inline code (`code`)
    if (char === '`') {
      if (accumulated) nodes.push({ type: 'text', content: accumulated });

      const closePos = this.text.indexOf('`', this.position + 1);
      if (closePos !== -1) {
        const codeText = this.text.substring(this.position + 1, closePos);
        nodes.push({ type: 'code', content: codeText });
        return { parsed: true, nodes, newPosition: closePos + 1 };
      }
    }

    // Link [text](url)
    if (char === '[') {
      if (accumulated) nodes.push({ type: 'text', content: accumulated });

      const closeTextPos = this.text.indexOf(']', this.position + 1);
      if (closeTextPos !== -1 && this.text[closeTextPos + 1] === '(') {
        const closeUrlPos = this.text.indexOf(')', closeTextPos + 2);
        if (closeUrlPos !== -1) {
          const linkText = this.text.substring(this.position + 1, closeTextPos);
          const linkUrl = this.text.substring(closeTextPos + 2, closeUrlPos);
          nodes.push({ type: 'link', content: linkText, href: linkUrl });
          return { parsed: true, nodes, newPosition: closeUrlPos + 1 };
        }
      }
    }

    return { parsed: false, nodes: [], newPosition: this.position };
  }

  private parseCodeBlock(): ParsedNode {
    this.position += 3; // Skip ```

    // Extract language (e.g., ```typescript)
    let language = '';
    while (this.position < this.text.length && this.text[this.position] !== '\n') {
      language += this.text[this.position];
      this.position++;
    }

    if (this.text[this.position] === '\n') this.position++;

    // Extract code until closing ```
    let code = '';
    while (this.position < this.text.length) {
      if (this.text.substring(this.position, this.position + 3) === '```') {
        this.position += 3;
        break;
      }
      code += this.text[this.position];
      this.position++;
    }

    return { type: 'codeBlock', content: code.trim(), language: language.trim() };
  }

  private parseHeading(): ParsedNode {
    let level = 0;
    while (this.position < this.text.length && this.text[this.position] === '#') {
      level++;
      this.position++;
    }

    if (this.text[this.position] === ' ') this.position++;

    let headingText = '';
    while (this.position < this.text.length && this.text[this.position] !== '\n') {
      headingText += this.text[this.position];
      this.position++;
    }

    if (this.text[this.position] === '\n') this.position++;

    return {
      type: 'heading',
      content: headingText.trim(),
      language: `h${Math.min(level, 6)}`,
    };
  }

  private parseList(): ParsedNode {
    const items: string[] = [];

    while (this.position < this.text.length) {
      if (
        (this.text[this.position] === '*' ||
          this.text[this.position] === '-' ||
          this.text[this.position] === '+') &&
        this.text[this.position + 1] === ' '
      ) {
        this.position += 2;
        let item = '';
        while (this.position < this.text.length && this.text[this.position] !== '\n') {
          item += this.text[this.position];
          this.position++;
        }
        items.push(item);
        if (this.text[this.position] === '\n') this.position++;
      } else {
        break;
      }
    }

    return { type: 'list', content: items.join('\n') };
  }

  private isTableStart(): boolean {
    if (!(this.position === 0 || this.text[this.position - 1] === '\n')) {
      return false;
    }

    const currentLineEnd = this.text.indexOf('\n', this.position);
    const firstLineEnd = currentLineEnd === -1 ? this.text.length : currentLineEnd;
    const firstLine = this.text.substring(this.position, firstLineEnd).trim();

    if (!firstLine.includes('|')) {
      return false;
    }

    if (firstLine.replace(/\|/g, '').trim().length === 0) {
      return false;
    }

    if (firstLineEnd >= this.text.length) {
      return false;
    }

    const secondLineStart = firstLineEnd + 1;
    const secondLineEndIndex = this.text.indexOf('\n', secondLineStart);
    const secondLineEnd =
      secondLineEndIndex === -1 ? this.text.length : secondLineEndIndex;
    const secondLine = this.text.substring(secondLineStart, secondLineEnd).trim();

    return /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(secondLine);
  }

  private parseTable(): ParsedNode {
    const rows: string[][] = [];

    const consumeLine = () => {
      const start = this.position;
      while (this.position < this.text.length && this.text[this.position] !== '\n') {
        this.position++;
      }
      const line = this.text.substring(start, this.position);
      if (this.text[this.position] === '\n') {
        this.position++;
      }
      return line;
    };

    const parseCells = (line: string) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim());

    rows.push(parseCells(consumeLine()));
    consumeLine();

    while (this.position < this.text.length) {
      const lineStart = this.position;
      while (this.position < this.text.length && this.text[this.position] !== '\n') {
        this.position++;
      }
      const line = this.text.substring(lineStart, this.position);

      if (!line.trim() || !line.includes('|')) {
        break;
      }

      rows.push(parseCells(line));

      if (this.text[this.position] === '\n') {
        this.position++;
      }
    }

    return { type: 'table', content: '', rows };
  }

  private parseBlockquote(): ParsedNode {
    const lines: string[] = [];

    while (this.position < this.text.length) {
      if (this.text[this.position] !== '>') {
        break;
      }

      this.position += 1;
      if (this.text[this.position] === ' ') {
        this.position += 1;
      }

      let line = '';
      while (this.position < this.text.length && this.text[this.position] !== '\n') {
        line += this.text[this.position];
        this.position++;
      }
      lines.push(line.trim());

      if (this.text[this.position] === '\n') {
        this.position++;
      }

      if (this.text[this.position] !== '>') {
        break;
      }
    }

    return { type: 'blockquote', content: lines.join('\n') };
  }
}

// ═══════════════════════════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════════════════════════

interface RendererProps {
  node: ParsedNode;
  index: number;
}

const resolveHeadingAccent = (level: number) => {
  if (level <= 1) {
    return {
      paddingLeft: '0.7rem',
      borderLeft: '3px solid rgba(125, 211, 252, 0.92)',
      textTransform: 'none' as const,
    };
  }

  if (level === 2) {
    return {
      paddingBottom: '0.2rem',
      borderBottom: '1px solid rgba(148, 163, 184, 0.26)',
      textTransform: 'none' as const,
    };
  }

  return {
    paddingLeft: '0.45rem',
    borderLeft: '2px solid rgba(148, 163, 184, 0.22)',
    textTransform: 'uppercase' as const,
  };
};

const NodeRenderer: React.FC<RendererProps> = ({ node, index }) => {
  switch (node.type) {
    case 'text':
      return <span key={index}>{node.content}</span>;

    case 'bold':
      return (
        <strong
          key={index}
          style={{
            fontWeight: 800,
            color: 'rgba(248, 250, 252, 0.98)',
            letterSpacing: '0.01em',
          }}
        >
          {node.content}
        </strong>
      );

    case 'italic':
      return (
        <em
          key={index}
          style={{ fontStyle: 'italic', color: 'rgba(191, 219, 254, 0.96)' }}
        >
          {node.content}
        </em>
      );

    case 'code':
      return (
        <code
          key={index}
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.14rem 0.42rem',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.24)',
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            fontSize: '0.9em',
            color: 'rgba(191, 219, 254, 0.98)',
          }}
        >
          {node.content}
        </code>
      );

    case 'codeBlock':
      return (
        <pre
          key={index}
          style={{
            background:
              'linear-gradient(180deg, rgba(2, 6, 23, 0.94), rgba(15, 23, 42, 0.92))',
            padding: '0',
            borderRadius: '12px',
            overflow: 'auto',
            margin: '10px 0',
            border: '1px solid rgba(96, 165, 250, 0.18)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          }}
        >
          {node.language ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.62rem 0.9rem',
                borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                background: 'rgba(30, 41, 59, 0.72)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Sora, system-ui, sans-serif',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(125, 211, 252, 0.96)',
                }}
              >
                {node.language}
              </span>
            </div>
          ) : null}
          <code
            style={{
              display: 'block',
              padding: '14px 16px',
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              color: 'rgba(226, 232, 240, 0.98)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.65,
            }}
          >
            {node.content}
          </code>
        </pre>
      );

    case 'heading': {
      const level = parseInt(node.language?.substring(1) || '1');
      const headingSizes = ['2em', '1.75em', '1.5em', '1.25em', '1.1em', '1em'];
      const accentStyle = resolveHeadingAccent(level);
      return (
        <h1
          key={index}
          style={{
            fontSize: headingSizes[level - 1],
            fontWeight: level <= 2 ? 800 : 700,
            margin: level <= 2 ? '18px 0 10px 0' : '14px 0 8px 0',
            lineHeight: level <= 2 ? 1.14 : 1.22,
            letterSpacing: '-0.02em',
            color: 'rgba(248, 250, 252, 0.98)',
            ...accentStyle,
          }}
        >
          {node.content}
        </h1>
      );
    }

    case 'list': {
      const listItems = node.content.split('\n').filter(Boolean);
      return (
        <ul
          key={index}
          style={{
            margin: '10px 0',
            paddingLeft: '22px',
            color: 'rgba(226, 232, 240, 0.98)',
          }}
        >
          {listItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>
              {item}
            </li>
          ))}
        </ul>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          key={index}
          style={{
            margin: '12px 0',
            padding: '0.78rem 0.95rem',
            borderLeft: '3px solid rgba(125, 211, 252, 0.72)',
            borderRadius: '0 12px 12px 0',
            background:
              'linear-gradient(180deg, rgba(8, 47, 73, 0.28), rgba(15, 23, 42, 0.22))',
            color: 'rgba(224, 242, 254, 0.98)',
            fontStyle: 'italic',
            whiteSpace: 'pre-wrap',
          }}
        >
          {node.content}
        </blockquote>
      );

    case 'table': {
      const rows = node.rows ?? [];
      const [headerRow = [], ...bodyRows] = rows;

      return (
        <div
          key={index}
          style={{ overflowX: 'auto', margin: '12px 0', maxWidth: '100%' }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '320px',
              borderCollapse: 'separate',
              borderSpacing: 0,
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(15, 23, 42, 0.44)',
            }}
          >
            <thead>
              <tr>
                {headerRow.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    scope="col"
                    style={{
                      padding: '0.72rem 0.82rem',
                      textAlign: 'left',
                      background: 'rgba(30, 41, 59, 0.92)',
                      color: 'rgba(226, 232, 240, 0.98)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                    }}
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{
                        padding: '0.72rem 0.82rem',
                        color: 'rgba(226, 232, 240, 0.96)',
                        borderBottom:
                          rowIndex === bodyRows.length - 1
                            ? 'none'
                            : '1px solid rgba(148, 163, 184, 0.12)',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'link':
      return (
        <a
          key={index}
          href={node.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'rgba(125, 211, 252, 0.98)',
            textDecoration: 'underline',
            textUnderlineOffset: '0.18em',
            cursor: 'pointer',
          }}
        >
          {node.content}
        </a>
      );

    case 'break':
      return <br key={index} />;

    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

/**
 * MarkdownContent Component
 * Parses and renders markdown content with support for:
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Inline code (`code`)
 * - Code blocks (```language\ncode\n```)
 * - Headings (# ## ### etc.)
 * - Lists (* - + followed by space)
 * - Links ([text](url))
 * - Blockquotes (> quote)
 * - Tables (GitHub-style header + separator)
 * - Line breaks (\n\n)
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className,
  style,
}) => {
  const nodes = useMemo(() => {
    const parser = new MarkdownParser(content);
    return parser.parse();
  }, [content]);

  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'grid',
        gap: '0.3rem',
        lineHeight: '1.6',
        wordBreak: 'break-word',
      }}
    >
      {nodes.map((node, index) => (
        <NodeRenderer key={index} node={node} index={index} />
      ))}
    </div>
  );
};

export default MarkdownContent;
