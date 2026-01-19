'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language?: string;
  children: string;
  filePath?: string;
}

function detectFilePath(code: string, language: string): string | null {
  // Common patterns for file paths in code blocks
  // e.g., // src/auth/google.ts or # src/auth/google.ts
  const firstLine = code.split('\n')[0];

  // Check for file path comment patterns
  const patterns = [
    /^\/\/\s*(.+\.(ts|tsx|js|jsx|json|md|css|scss|html))$/,
    /^#\s*(.+\.(py|rb|sh|yaml|yml))$/,
    /^\/\*\s*(.+)\s*\*\/$/,
  ];

  for (const pattern of patterns) {
    const match = firstLine.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function getLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    typescript: '📄',
    javascript: '📄',
    tsx: '📄',
    jsx: '📄',
    python: '🐍',
    bash: '💻',
    shell: '💻',
    sh: '💻',
    json: '📋',
    yaml: '📋',
    yml: '📋',
    css: '🎨',
    scss: '🎨',
    html: '🌐',
  };
  return icons[language] || '📄';
}

function normalizeLanguage(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : 'text';
}

export function CodeBlock({ language: langProp, children, filePath: filePathProp }: CodeBlockProps) {
  const code = String(children).replace(/\n$/, '');
  const language = langProp || 'text';
  const detectedPath = detectFilePath(code, language);
  const filePath = filePathProp || detectedPath;

  // Remove file path comment from code if detected
  const displayCode = detectedPath
    ? code.split('\n').slice(1).join('\n').trim()
    : code;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-warm-200 bg-warm-900">
      {/* File path header */}
      {filePath && (
        <div className="flex items-center gap-2 border-b border-warm-700 bg-warm-800 px-4 py-2">
          <span className="text-sm">{getLanguageIcon(language)}</span>
          <code className="text-sm font-medium text-warm-300">{filePath}</code>
        </div>
      )}

      {/* Code content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }
          }}
        >
          {displayCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-warm-100 px-1.5 py-0.5 text-sm font-medium text-warm-800">
      {children}
    </code>
  );
}
