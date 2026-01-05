'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileViewerProps {
  content: string;
  type: 'markdown' | 'yaml';
  title?: string;
}

export default function FileViewer({ content, type, title }: FileViewerProps) {
  if (type === 'yaml') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language="yaml"
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '14px',
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="px-6 py-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-200">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4 first:mt-0">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-gray-700 mb-2 mt-3">
                {children}
              </h4>
            ),

            // Paragraphs
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                {children}
              </p>
            ),

            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-outside ml-6 mb-4 space-y-1 text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 text-gray-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),

            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50 rounded-r-lg italic text-gray-700">
                {children}
              </blockquote>
            ),

            // Horizontal rule
            hr: () => <hr className="my-6 border-gray-200" />,

            // Strong/Bold
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),

            // Emphasis/Italic
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),

            // Tables - fully styled
            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                {children}
              </td>
            ),

            // Code blocks
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !className;

              if (isInline) {
                return (
                  <code
                    className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                    {...rest}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-4 rounded-lg overflow-hidden">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match ? match[1] : 'text'}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '14px',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },

            // Pre (for code blocks without language)
            pre: ({ children }) => (
              <pre className="my-4 rounded-lg overflow-hidden">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
