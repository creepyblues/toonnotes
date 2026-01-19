'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Children, isValidElement, ReactNode, useState, useEffect } from 'react';
import { CodeBlock, InlineCode } from './CodeBlock';
import { InsightCallout, InsightsSection } from './InsightCallout';
import { TimelineNode, TimelineSection } from './TimelineSection';
import { StatisticsGrid, parseStatsFromTable } from './StatisticsGrid';

interface DiaryContentProps {
  content: string;
}

interface ParsedSection {
  type: 'summary' | 'sessions' | 'insights' | 'statistics' | 'categorized' | 'other';
  title: string;
  content: string;
}

function parseSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  // Split by H2 headers while preserving the header text
  const h2Regex = /^## (.+)$/gm;
  const parts = markdown.split(h2Regex);

  // First part is everything before the first H2 (usually nothing or intro)
  if (parts[0].trim()) {
    sections.push({
      type: 'other',
      title: '',
      content: parts[0].trim(),
    });
  }

  // Process pairs of (title, content)
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() || '';
    const content = parts[i + 1]?.trim() || '';

    // Determine section type
    let type: ParsedSection['type'] = 'other';
    const titleLower = title.toLowerCase();

    if (titleLower.includes('summary')) {
      type = 'summary';
    } else if (titleLower.includes('work session') || titleLower === 'sessions') {
      type = 'sessions';
    } else if (titleLower.includes('insight') || titleLower.includes('learning')) {
      type = 'insights';
    } else if (titleLower.includes('statistic')) {
      type = 'statistics';
    } else if (titleLower.includes('categorized work')) {
      type = 'categorized';
    }

    sections.push({ type, title, content });
  }

  return sections;
}

interface SessionData {
  title: string;
  content: string;
}

function parseWorkSessions(content: string): SessionData[] {
  const sessions: SessionData[] = [];

  // Split by H3 headers (### Session X: Title)
  const h3Regex = /^### (.+)$/gm;
  const parts = content.split(h3Regex);

  // Process pairs of (title, content)
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() || '';
    const sessionContent = parts[i + 1]?.trim() || '';

    if (title) {
      sessions.push({ title, content: sessionContent });
    }
  }

  return sessions;
}

interface InsightData {
  title: string;
  content: string;
}

function parseInsights(content: string): InsightData[] {
  const insights: InsightData[] = [];

  // Split by H3 headers (### 1. Title or ### Title)
  const h3Regex = /^### (?:\d+\.\s*)?(.+)$/gm;
  const parts = content.split(/^### (?:\d+\.\s*)?/gm);
  const titles = [...content.matchAll(h3Regex)].map(m => m[1]);

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]?.trim() || '';
    // Find the content between this title and the next
    const contentStart = content.indexOf(title) + title.length;
    const nextMatch = content.slice(contentStart).match(/^### /m);
    const contentEnd = nextMatch
      ? contentStart + (content.slice(contentStart).indexOf(nextMatch[0]))
      : content.length;

    const insightContent = content.slice(contentStart, contentEnd).trim();

    if (title) {
      insights.push({ title, content: insightContent });
    }
  }

  return insights;
}

function HighlightedProse({ children }: { children: ReactNode }) {
  // This wraps text that should have key terms highlighted
  return <div className="prose prose-warm max-w-none">{children}</div>;
}

function SummarySection({ content }: { content: string }) {
  return (
    <section className="my-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
          📋
        </span>
        Daily Summary
      </h2>
      <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5 md:p-8">
        <HighlightedProse>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isInline = !className;
                if (isInline) {
                  return <InlineCode>{children}</InlineCode>;
                }
                const language = className?.replace('language-', '') || 'text';
                return <CodeBlock language={language}>{String(children)}</CodeBlock>;
              },
              strong({ children }) {
                return (
                  <strong className="rounded bg-teal-50 px-1 font-semibold text-teal-700">
                    {children}
                  </strong>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </HighlightedProse>
      </div>
    </section>
  );
}

function WorkSessionsSection({ content }: { content: string }) {
  const sessions = parseWorkSessions(content);

  if (sessions.length === 0) {
    return (
      <section className="my-8">
        <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
            🕐
          </span>
          Work Sessions
        </h2>
        <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </section>
    );
  }

  return (
    <TimelineSection>
      {sessions.map((session, index) => (
        <TimelineNode
          key={index}
          title={session.title}
          isLast={index === sessions.length - 1}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>;
              },
              code({ className, children }) {
                const isInline = !className;
                if (isInline) {
                  return <InlineCode>{children}</InlineCode>;
                }
                const language = className?.replace('language-', '') || 'text';
                return <CodeBlock language={language}>{String(children)}</CodeBlock>;
              },
            }}
          >
            {session.content}
          </ReactMarkdown>
        </TimelineNode>
      ))}
    </TimelineSection>
  );
}

function InsightsLearningsSection({ content }: { content: string }) {
  const insights = parseInsights(content);

  if (insights.length === 0) {
    return (
      <InsightsSection>
        <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </InsightsSection>
    );
  }

  return (
    <InsightsSection>
      {insights.map((insight, index) => (
        <InsightCallout key={index} title={insight.title}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              code({ className, children }) {
                const isInline = !className;
                if (isInline) {
                  return <InlineCode>{children}</InlineCode>;
                }
                const language = className?.replace('language-', '') || 'text';
                return <CodeBlock language={language}>{String(children)}</CodeBlock>;
              },
              pre({ children }) {
                // Just pass through - the code component handles rendering
                return <>{children}</>;
              },
            }}
          >
            {insight.content}
          </ReactMarkdown>
        </InsightCallout>
      ))}
    </InsightsSection>
  );
}

function StatisticsSection({ content }: { content: string }) {
  const stats = parseStatsFromTable(content);

  if (stats.length === 0) {
    return (
      <section className="my-8">
        <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
            📊
          </span>
          Statistics
        </h2>
        <div className="rounded-2xl border border-warm-200 bg-warm-50 p-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </section>
    );
  }

  return <StatisticsGrid stats={stats} />;
}

function GenericSection({ title, content }: { title: string; content: string }) {
  // Get appropriate icon for section
  const getIcon = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('categorized')) return '🏷️';
    if (lower.includes('screenshot')) return '📸';
    if (lower.includes('tomorrow') || lower.includes('next')) return '🎯';
    if (lower.includes('bug') || lower.includes('fix')) return '🐛';
    if (lower.includes('feature')) return '✨';
    return '📝';
  };

  return (
    <section className="my-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-warm-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-100 text-lg">
          {getIcon(title)}
        </span>
        {title}
      </h2>
      <div className="prose prose-warm max-w-none prose-headings:font-display prose-h3:text-lg prose-a:text-teal-600">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children }) {
              const isInline = !className;
              if (isInline) {
                return <InlineCode>{children}</InlineCode>;
              }
              const language = className?.replace('language-', '') || 'text';
              return <CodeBlock language={language}>{String(children)}</CodeBlock>;
            },
            pre({ children }) {
              return <>{children}</>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}

export function DiaryContent({ content }: DiaryContentProps) {
  const sections = parseSections(content);

  return (
    <article className="diary-content">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'summary':
            return <SummarySection key={index} content={section.content} />;
          case 'sessions':
            return <WorkSessionsSection key={index} content={section.content} />;
          case 'insights':
            return <InsightsLearningsSection key={index} content={section.content} />;
          case 'statistics':
            return <StatisticsSection key={index} content={section.content} />;
          default:
            if (section.title) {
              return <GenericSection key={index} title={section.title} content={section.content} />;
            }
            // Render intro content without a section wrapper
            return (
              <div key={index} className="prose prose-warm max-w-none my-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
              </div>
            );
        }
      })}
    </article>
  );
}
