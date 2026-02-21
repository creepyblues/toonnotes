import type { Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

export interface EditorExtensionOptions {
  placeholder?: string;
}

/**
 * Single source of truth for TipTap extensions used across web and mobile.
 * Extracted from apps/webapp/components/editor/NoteEditor.tsx.
 */
export function createEditorExtensions(options?: EditorExtensionOptions): Extensions {
  return [
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
      placeholder: options?.placeholder ?? 'Start writing...',
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
  ];
}
