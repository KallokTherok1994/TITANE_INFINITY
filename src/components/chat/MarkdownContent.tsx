/**
 * TITANE∞ — Markdown Content Renderer
 * Renders message content with markdown support (bold, italic, code, lists, etc.)
 * Integrates with CodeBlock for syntax highlighting
 *
 * v26.4.0 (Sprint 6)
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
    | 'break';
  content: string;
  language?: string;
  href?: string;
  children?: ParsedNode[];
}

// ═══════════════════════════════════════════════════════════════════
// MARKDOWN PARSER
// ═══════════════════════════════════════════════════════════════════

/**
 * Simple markdown parser (no external dependencies)
 * Supports: bold, italic, code, code blocks, headings, lists, links, line breaks
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
}

// ═══════════════════════════════════════════════════════════════════
// RENDERER
// ═══════════════════════════════════════════════════════════════════

interface RendererProps {
  node: ParsedNode;
  index: number;
}

const NodeRenderer: React.FC<RendererProps> = ({ node, index }) => {
  switch (node.type) {
    case 'text':
      return <span key={index}>{node.content}</span>;

    case 'bold':
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {node.content}
        </strong>
      );

    case 'italic':
      return (
        <em key={index} style={{ fontStyle: 'italic' }}>
          {node.content}
        </em>
      );

    case 'code':
      return (
        <code
          key={index}
          style={{
            background: 'rgba(114, 123, 129, 0.2)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
            color: '#C4C4C4',
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
            background: 'rgba(4, 15, 31, 0.8)',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            margin: '8px 0',
            border: '1px solid rgba(114, 123, 129, 0.3)',
          }}
        >
          <code
            style={{ fontFamily: 'monospace', color: '#C4C4C4', whiteSpace: 'pre-wrap' }}
          >
            {node.content}
          </code>
        </pre>
      );

    case 'heading': {
      const level = parseInt(node.language?.substring(1) || '1');
      const headingSizes = ['2em', '1.75em', '1.5em', '1.25em', '1.1em', '1em'];
      return (
        <h1
          key={index}
          style={{
            fontSize: headingSizes[level - 1],
            fontWeight: 700,
            margin: '12px 0 8px 0',
            color: '#C4C4C4',
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
            margin: '8px 0',
            paddingLeft: '20px',
            color: '#C4C4C4',
          }}
        >
          {listItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
        </ul>
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
            color: '#727B81',
            textDecoration: 'underline',
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
      style={{ ...style, lineHeight: '1.6', wordBreak: 'break-word' }}
    >
      {nodes.map((node, index) => (
        <NodeRenderer key={index} node={node} index={index} />
      ))}
    </div>
  );
};

export default MarkdownContent;
