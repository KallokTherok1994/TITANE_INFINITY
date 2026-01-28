/**
 * TITANE∞ — Code Block with Syntax Highlighting
 * Wraps code with Highlight.js for colored syntax
 *
 * v26.4.0 (Sprint 6)
 */

import React, { useEffect, useRef, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════════
// HIGHLIGHT JS INTEGRATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Lightweight syntax highlighting without external dependencies
 * Supports: javascript, typescript, python, rust, bash, json, xml, html, css, sql
 */
class SyntaxHighlighter {
  private static readonly KEYWORDS: Record<string, string[]> = {
    typescript: [
      'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class',
      'const', 'continue', 'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum',
      'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'global',
      'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'is', 'keyof', 'let',
      'module', 'namespace', 'never', 'new', 'null', 'number', 'of', 'package', 'private',
      'protected', 'public', 'readonly', 'require', 'return', 'set', 'static', 'string',
      'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof',
      'unknown', 'var', 'void', 'while', 'with', 'yield',
    ],
    javascript: [
      'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
      'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else',
      'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for',
      'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface',
      'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public',
      'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield',
    ],
    python: [
      'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
      'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
      'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
      'try', 'while', 'with', 'yield',
    ],
    rust: [
      'abstract', 'as', 'async', 'await', 'become', 'box', 'break', 'const', 'continue', 'crate',
      'do', 'dyn', 'else', 'enum', 'extern', 'false', 'final', 'fn', 'for', 'if', 'impl', 'in',
      'let', 'loop', 'macro', 'match', 'mod', 'move', 'mut', 'override', 'priv', 'pub', 'ref',
      'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'try', 'type',
      'typeof', 'unsafe', 'unsized', 'use', 'virtual', 'where', 'while', 'yield',
    ],
    bash: [
      'case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in',
      'select', 'then', 'time', 'until', 'while',
    ],
  };

  private static readonly LITERALS: Record<string, RegExp | Record<string, RegExp>> = {
    string: /(['"`])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
  };

  static highlight(code: string, language: string = 'typescript'): string {
    const lang = language.toLowerCase() || 'typescript';
    const keywords = this.KEYWORDS[lang] || this.KEYWORDS.typescript;

    let highlighted = code;

    // Escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight comments
    highlighted = highlighted.replace(/#.*$/gm, (match) => `<span class="hljs-comment">${match}</span>`);
    highlighted = highlighted.replace(/\/\/.*$/gm, (match) => `<span class="hljs-comment">${match}</span>`);
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, (match) => `<span class="hljs-comment">${match}</span>`);

    // Highlight strings
    highlighted = highlighted.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, (match) => `<span class="hljs-string">${match}</span>`);

    // Highlight numbers
    highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, (match) => `<span class="hljs-number">${match}</span>`);

    // Highlight keywords
    if (Array.isArray(keywords) && keywords.length > 0) {
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      highlighted = highlighted.replace(keywordRegex, (match) => `<span class="hljs-keyword">${match}</span>`);
    }

    return highlighted;
  }
}

// ═══════════════════════════════════════════════════════════════════
// COPY BUTTON
// ═══════════════════════════════════════════════════════════════════

interface CopyButtonProps {
  code: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(114, 123, 129, 0.3)',
        border: '1px solid rgba(114, 123, 129, 0.5)',
        color: '#C4C4C4',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        transition: 'all 0.2s',
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(114, 123, 129, 0.5)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(114, 123, 129, 0.3)';
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CODE BLOCK COMPONENT
// ═══════════════════════════════════════════════════════════════════

/**
 * CodeBlock Component
 * Renders code with syntax highlighting and copy button
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'typescript', className, style }) => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      const highlighted = SyntaxHighlighter.highlight(code, language);
      preRef.current.innerHTML = `<code>${highlighted}</code>`;
    }
  }, [code, language]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(4, 15, 31, 0.8)',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '8px 0',
        border: '1px solid rgba(114, 123, 129, 0.3)',
        ...style,
      }}
      className={className}
    >
      {language && (
        <div
          style={{
            background: 'rgba(114, 123, 129, 0.15)',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#727B81',
            borderBottom: '1px solid rgba(114, 123, 129, 0.2)',
            fontWeight: 500,
          }}
        >
          {language}
        </div>
      )}

      <pre
        ref={preRef}
        style={{
          margin: 0,
          padding: '12px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#C4C4C4',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {code}
      </pre>

      <CopyButton code={code} />

      <style>{`
        .hljs-keyword { color: #FF6B6B; font-weight: 600; }
        .hljs-string { color: #51CF66; }
        .hljs-number { color: #4C6EF5; }
        .hljs-comment { color: #727B81; font-style: italic; }
        .hljs-function { color: #FFD93D; }
        .hljs-class { color: #6BCB77; }
      `}</style>
    </div>
  );
};

export default CodeBlock;
