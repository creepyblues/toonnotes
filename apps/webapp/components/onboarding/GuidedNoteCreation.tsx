'use client';

/**
 * Guided Note Creation - MODE Framework v2.0 (Web)
 *
 * Shows instructions for creating a note with the selected agent
 * and provides a text input for the user to enter their note.
 */

import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import {
  GUIDED_NOTE_INSTRUCTIONS,
  AGENT_DESCRIPTIONS,
  ONBOARDING_TEXT,
  getAgentName,
  getAgentEmoji,
  getAgentColor,
} from '@/lib/agentOnboardingContent';

interface GuidedNoteCreationProps {
  agentId: AgentId;
  onCreateNote: (content: string) => void;
  onBack: () => void;
}

export function GuidedNoteCreation({
  agentId,
  onCreateNote,
  onBack,
}: GuidedNoteCreationProps) {
  const [noteContent, setNoteContent] = useState('');

  const instruction = GUIDED_NOTE_INSTRUCTIONS[agentId];
  const description = AGENT_DESCRIPTIONS[agentId];
  const agentName = getAgentName(agentId);
  const agentEmoji = getAgentEmoji(agentId);
  const agentColor = getAgentColor(agentId);

  const handleCreateNote = () => {
    if (noteContent.trim()) {
      onCreateNote(noteContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && noteContent.trim()) {
      e.preventDefault();
      handleCreateNote();
    }
  };

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={cn(
          'flex items-center gap-2 text-sm self-start mb-6',
          'text-gray-500 dark:text-gray-400',
          'hover:text-gray-700 dark:hover:text-gray-300',
          'transition-colors duration-200'
        )}
      >
        <ArrowLeft size={16} weight="bold" />
        {ONBOARDING_TEXT.guidedCreation.backButton}
      </button>

      {/* Agent Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-4xl"
          style={{ filter: `drop-shadow(0 2px 4px ${agentColor}40)` }}
        >
          {agentEmoji}
        </span>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {agentName} Agent
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
        {description}
      </p>

      {/* Instruction */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {instruction.instruction}
      </p>

      {/* Example */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 italic">
        Example: "{instruction.exampleNote}"
      </p>

      {/* Input */}
      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={instruction.placeholder}
        rows={3}
        className={cn(
          'w-full px-4 py-3 rounded-lg mb-6',
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500',
          'resize-none transition-all duration-200'
        )}
        autoFocus
      />

      {/* Create Button */}
      <button
        onClick={handleCreateNote}
        disabled={!noteContent.trim()}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium',
          'transition-all duration-200',
          noteContent.trim()
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        )}
      >
        {ONBOARDING_TEXT.guidedCreation.createButton}
      </button>
    </div>
  );
}
