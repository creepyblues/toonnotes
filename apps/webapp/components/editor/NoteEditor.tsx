'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  ArrowLeft,
  PushPin,
  PushPinSlash,
  Archive,
  BoxArrowDown,
  Trash,
  ArrowCounterClockwise,
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  ListBullets,
  CheckSquare,
  TextT,
  Tag,
} from '@phosphor-icons/react';
import { LabelPill, LabelPicker, LabelSuggestionToast } from '@/components/labels';
import { Note, NoteColor, EditorMode } from '@toonnotes/types';
import { useNoteStore, useLabelSuggestionStore } from '@/stores';
import { cn, textToHtml, htmlToPlainText } from '@/lib/utils';
import { analyzeNoteContent, filterExistingLabels } from '@toonnotes/label-ai';

interface NoteEditorProps {
  noteId: string;
}

const NOTE_COLORS: { color: NoteColor; name: string }[] = [
  { color: NoteColor.White, name: 'White' },
  { color: NoteColor.Lavender, name: 'Lavender' },
  { color: NoteColor.Rose, name: 'Rose' },
  { color: NoteColor.Peach, name: 'Peach' },
  { color: NoteColor.Mint, name: 'Mint' },
  { color: NoteColor.Sky, name: 'Sky' },
  { color: NoteColor.Violet, name: 'Violet' },
];

export function NoteEditor({ noteId }: NoteEditorProps) {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);

  // Note store
  const note = useNoteStore((state) => state.notes.find((n) => n.id === noteId));
  const updateNote = useNoteStore((state) => state.updateNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const restoreNote = useNoteStore((state) => state.restoreNote);
  const archiveNote = useNoteStore((state) => state.archiveNote);
  const unarchiveNote = useNoteStore((state) => state.unarchiveNote);
  const pinNote = useNoteStore((state) => state.pinNote);
  const unpinNote = useNoteStore((state) => state.unpinNote);
  const addLabelToNote = useNoteStore((state) => state.addLabelToNote);
  const removeLabelFromNote = useNoteStore((state) => state.removeLabelFromNote);
  const allLabels = useNoteStore((state) => state.labels);

  // Label suggestion store
  const {
    showAutoApplyToast,
    showSuggestionToast,
    showErrorToast,
    setAnalyzing,
    isAnalyzing,
  } = useLabelSuggestionStore();

  // Track labels applied via auto-labeling (for undo)
  const autoAppliedLabelsRef = useRef<string[]>([]);

  const [title, setTitle] = useState(note?.title || '');
  const [color, setColor] = useState<NoteColor>(note?.color || NoteColor.White);
  const [editorMode, setEditorMode] = useState<EditorMode>(note?.editorMode || 'plain');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  // Track content changes via a counter instead of the actual content string
  // This avoids the memory leak from putting editor?.getHTML() in deps
  const [contentVersion, setContentVersion] = useState(0);
  // Convert plain text to HTML for TipTap
  const initialHtml = textToHtml(note?.content || '');
  const contentRef = useRef(initialHtml);

  const editor = useEditor({
    immediatelyRender: false, // Disable SSR to avoid hydration mismatch
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Store the latest content and trigger a version update
      contentRef.current = editor.getHTML();
      setContentVersion((v) => v + 1);
    },
  });

  // Auto-save effect with debounce - triggered by title or content version changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef({ title: note?.title, content: initialHtml });

  useEffect(() => {
    if (!note) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const currentContent = contentRef.current;
    const hasChanges =
      title !== lastSavedRef.current.title || currentContent !== lastSavedRef.current.content;

    if (!hasChanges) return;

    saveTimeoutRef.current = setTimeout(() => {
      // Convert HTML to plain text for cross-platform consistency
      const plainTextContent = htmlToPlainText(currentContent);
      updateNote(noteId, {
        title,
        content: plainTextContent,
        color,
      });
      lastSavedRef.current = { title, content: currentContent };
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, contentVersion, noteId, updateNote, note, color]);

  // Save color changes immediately
  useEffect(() => {
    if (note && color !== note.color) {
      updateNote(noteId, { color });
    }
  }, [color, noteId, updateNote, note]);

  // Save editor mode changes immediately
  useEffect(() => {
    if (note && editorMode !== note.editorMode) {
      updateNote(noteId, { editorMode });
    }
  }, [editorMode, noteId, updateNote, note]);

  // Focus title on mount if new note
  useEffect(() => {
    if (!title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [title]);

  // Analyze note content and suggest labels
  // Returns true if a toast was shown (analysis had results)
  const analyzeAndSuggestLabels = useCallback(async (): Promise<boolean> => {
    if (!note) return false;

    const currentContent = htmlToPlainText(contentRef.current);

    // Skip analysis for very short notes
    if (!title?.trim() && currentContent.length < 20) {
      return false;
    }

    // Get existing label names for matching
    const existingLabelNames = allLabels.map((l) => l.name);

    setAnalyzing(true, noteId);

    try {
      const response = await analyzeNoteContent({
        noteTitle: title,
        noteContent: currentContent,
        existingLabels: existingLabelNames,
      });

      // Handle API errors
      if (response.error) {
        showErrorToast(noteId, response.error);
        return false;
      }

      // Filter out labels already on the note
      const newAutoApplyLabels = filterExistingLabels(
        response.autoApplyLabels,
        note.labels
      );
      const newSuggestLabels = filterExistingLabels(
        response.suggestLabels,
        note.labels
      );

      // Show toast for auto-apply OR suggested labels
      if (newAutoApplyLabels.length > 0) {
        // High-confidence labels: auto-apply with undo option
        const labelNames = newAutoApplyLabels.map((l) => l.labelName);
        showAutoApplyToast(noteId, labelNames);
        return true;
      } else if (newSuggestLabels.length > 0) {
        // Medium-confidence labels: show suggestion for user to accept/decline
        const labelNames = newSuggestLabels.map((l) => l.labelName);
        showSuggestionToast(noteId, labelNames);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[NoteEditor] Analysis error:', error);
      showErrorToast(noteId, { message: 'Analysis failed', code: null });
      return false;
    } finally {
      setAnalyzing(false);
    }
  }, [note, noteId, title, allLabels, setAnalyzing, showAutoApplyToast, showSuggestionToast, showErrorToast]);

  // Track if we're waiting for toast action before navigating
  const pendingNavigationRef = useRef(false);

  // Handle applying labels from toast
  const handleApplyLabels = useCallback((labels: string[]) => {
    labels.forEach((label) => {
      addLabelToNote(noteId, label);
    });
    autoAppliedLabelsRef.current = labels;
    // Navigate after applying labels if we were waiting
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false;
      router.back();
    }
  }, [noteId, addLabelToNote, router]);

  // Handle undo auto-applied labels
  const handleUndoLabels = useCallback(() => {
    autoAppliedLabelsRef.current.forEach((label) => {
      removeLabelFromNote(noteId, label);
    });
    autoAppliedLabelsRef.current = [];
    // Navigate after undo if we were waiting
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false;
      router.back();
    }
  }, [noteId, removeLabelFromNote, router]);

  // Handle declining suggestions (dismiss toast without applying)
  const handleDecline = useCallback(() => {
    // Navigate after decline if we were waiting
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false;
      router.back();
    }
  }, [router]);

  const handleBack = useCallback(async () => {
    // Trigger label analysis before navigating away
    const hasToast = await analyzeAndSuggestLabels();
    if (hasToast) {
      // Wait for user to handle the toast before navigating
      pendingNavigationRef.current = true;
    } else {
      // No toast, navigate immediately
      router.back();
    }
  }, [analyzeAndSuggestLabels, router]);

  const handlePin = useCallback(() => {
    if (note?.isPinned) {
      unpinNote(noteId);
    } else {
      pinNote(noteId);
    }
  }, [note?.isPinned, noteId, pinNote, unpinNote]);

  const handleArchive = useCallback(() => {
    if (note?.isArchived) {
      unarchiveNote(noteId);
    } else {
      archiveNote(noteId);
      router.push('/');
    }
  }, [note?.isArchived, noteId, archiveNote, unarchiveNote, router]);

  const handleDelete = useCallback(() => {
    if (note?.isDeleted) {
      restoreNote(noteId);
    } else {
      deleteNote(noteId);
      router.push('/');
    }
  }, [note?.isDeleted, noteId, deleteNote, restoreNote, router]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Note not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: color }}>
      {/* Header/Toolbar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <ModeButton
            onClick={() => setEditorMode('plain')}
            active={editorMode === 'plain'}
            icon={<TextT size={18} />}
            label="Plain Text"
          />
          <ModeButton
            onClick={() => setEditorMode('checklist')}
            active={editorMode === 'checklist'}
            icon={<CheckSquare size={18} />}
            label="Checklist"
          />
          <ModeButton
            onClick={() => setEditorMode('bullet')}
            active={editorMode === 'bullet'}
            icon={<ListBullets size={18} />}
            label="Bullet List"
          />
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            icon={<TextB size={18} weight="bold" />}
            label="Bold (Cmd+B)"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            icon={<TextItalic size={18} />}
            label="Italic (Cmd+I)"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive('underline')}
            icon={<TextUnderline size={18} />}
            label="Underline (Cmd+U)"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive('strike')}
            icon={<TextStrikethrough size={18} />}
            label="Strikethrough"
          />
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            icon={<ListBullets size={18} />}
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            active={editor?.isActive('taskList')}
            icon={<CheckSquare size={18} />}
            label="Checklist"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-colors"
              style={{ backgroundColor: color }}
              aria-label="Change color"
            />
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-2 z-50">
                {NOTE_COLORS.map(({ color: c, name }) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className={cn(
                      'w-7 h-7 rounded-full transition-transform hover:scale-110',
                      color === c && 'ring-2 ring-purple-500 ring-offset-2'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={name}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handlePin}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isPinned
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
            aria-label={note.isPinned ? 'Unpin' : 'Pin'}
          >
            {note.isPinned ? (
              <PushPinSlash size={20} weight="fill" />
            ) : (
              <PushPin size={20} />
            )}
          </button>

          <button
            onClick={handleArchive}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isArchived
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
            aria-label={note.isArchived ? 'Unarchive' : 'Archive'}
          >
            {note.isArchived ? (
              <BoxArrowDown size={20} weight="fill" />
            ) : (
              <Archive size={20} />
            )}
          </button>

          <button
            onClick={handleDelete}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isDeleted
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500'
            )}
            aria-label={note.isDeleted ? 'Restore' : 'Delete'}
          >
            {note.isDeleted ? (
              <ArrowCounterClockwise size={20} />
            ) : (
              <Trash size={20} />
            )}
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 mb-4"
          />

          {/* Labels */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {note.labels.map((label) => (
              <LabelPill
                key={label}
                label={label}
                size="md"
                showIcon={true}
              />
            ))}
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors',
                  'bg-gray-200/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-300/60 dark:hover:bg-gray-700/60'
                )}
              >
                <Tag size={14} />
                <span>Add label</span>
              </button>
              {showLabelPicker && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <LabelPicker
                    noteId={noteId}
                    currentLabels={note.labels}
                    onClose={() => setShowLabelPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* TipTap Editor */}
          <EditorContent
            editor={editor}
            className="prose prose-gray dark:prose-invert max-w-none"
          />
        </div>
      </div>

      {/* Label Suggestion Toast */}
      <LabelSuggestionToast
        onApplyLabels={handleApplyLabels}
        onUndo={handleUndoLabels}
        onDecline={handleDecline}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

function ToolbarButton({ onClick, active, icon, label }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

interface ModeButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

function ModeButton({ onClick, active, icon, label }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors flex items-center gap-1',
        active
          ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
