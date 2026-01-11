'use client';

import { useState } from 'react';
import { GitCommit, CaretDown, CaretUp } from '@phosphor-icons/react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import releaseData from '@/data/release-data.json';

interface GitCommitData {
  hash: string;
  message: string;
  date: string;
  author: string;
}

interface ReleaseData {
  commits: GitCommitData[];
  generatedAt: string;
  totalCount: number;
}

const typedReleaseData = releaseData as ReleaseData;
const INITIAL_COUNT = 10;

// Parse commit type from conventional commit message
function getCommitType(message: string): string | null {
  const match = message.match(
    /^(feat|fix|docs|chore|refactor|test|style|perf|ci|build|revert)(\(.+?\))?:/
  );
  return match ? match[1] : null;
}

// Get type badge styling
function getTypeBadgeClass(type: string | null): string {
  const classes: Record<string, string> = {
    feat: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    fix: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    docs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    chore: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    refactor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    test: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    style: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    perf: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    ci: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    build: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    revert: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  return classes[type || ''] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
}

// Clean commit message by removing conventional commit prefix
function cleanMessage(message: string): string {
  return message.replace(
    /^(feat|fix|docs|chore|refactor|test|style|perf|ci|build|revert)(\(.+?\))?:\s*/,
    ''
  );
}

export function ReleaseUpdateSection() {
  const [showAll, setShowAll] = useState(false);

  const commits = typedReleaseData.commits;
  const displayedCommits = showAll ? commits : commits.slice(0, INITIAL_COUNT);
  const hasMore = commits.length > INITIAL_COUNT;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Release Updates
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
        {displayedCommits.map((commit) => {
          const type = getCommitType(commit.message);
          const message = cleanMessage(commit.message);

          return (
            <div
              key={commit.hash}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                <GitCommit
                  size={18}
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {type && (
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          getTypeBadgeClass(type)
                        )}
                      >
                        {type}
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {commit.hash}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(commit.date), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      by {commit.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Show More/Less Button */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {showAll ? (
              <>
                <CaretUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <CaretDown size={16} />
                Show {commits.length - INITIAL_COUNT} More Updates
              </>
            )}
          </button>
        )}
      </div>

      {/* Generation timestamp */}
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">
        Last updated: {format(new Date(typedReleaseData.generatedAt), 'MMM d, yyyy')}
      </p>
    </section>
  );
}
