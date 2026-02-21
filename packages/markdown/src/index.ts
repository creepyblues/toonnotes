import matter from 'gray-matter';
import type { Note } from '@toonnotes/types';
import type { SerializeOptions, ParsedNote, NoteFrontmatter } from './types';

export type { SerializeOptions, ParsedNote, NoteFrontmatter } from './types';

/**
 * Convert a Note to a markdown string with YAML frontmatter.
 *
 * Frontmatter includes note metadata (id, title, labels, color, status flags, images, etc.).
 * Content is preserved as-is (already markdown with `- [x]` checklists).
 * Mode and behavior data can be optionally included via options.
 *
 * Note: URI fields (typographyPosterUri, characterMascotUri, backgroundOverride,
 * activeDesignLabelId) are intentionally excluded as they reference local/generated
 * assets that are not portable across environments.
 */
export function noteToMarkdown(note: Note, options?: SerializeOptions): string {
  const frontmatter: Record<string, unknown> = {
    id: note.id,
    title: note.title,
    labels: note.labels,
    editor_mode: note.editorMode ?? 'plain',
    color: note.color,
    pinned: note.isPinned,
    archived: note.isArchived,
    deleted: note.isDeleted,
    ...(note.deletedAt !== undefined && { deleted_at: new Date(note.deletedAt).toISOString() }),
    ...(note.images && note.images.length > 0 && { images: note.images }),
    created_at: new Date(note.createdAt).toISOString(),
    updated_at: new Date(note.updatedAt).toISOString(),
  };

  if (options?.mode) {
    frontmatter.mode = options.mode;
  }

  if (options?.includeDesign && note.designId) {
    frontmatter.design_id = note.designId;
  }

  if (options?.behavior) {
    const b = options.behavior;
    frontmatter.behavior = {
      ...(b.usefulnessScore !== undefined && { usefulness_score: b.usefulnessScore }),
      ...(b.usefulnessLevel !== undefined && { usefulness_level: b.usefulnessLevel }),
      ...(b.accessCount !== undefined && { access_count: b.accessCount }),
      ...(b.editCount !== undefined && { edit_count: b.editCount }),
    };
  }

  return matter.stringify(note.content, frontmatter);
}

/**
 * Parse a markdown string with YAML frontmatter into structured data.
 *
 * Uses gray-matter to extract frontmatter and content.
 * Returns typed frontmatter, raw content, and the original markdown.
 */
export function markdownToNote(md: string): ParsedNote {
  const { data, content } = matter(md);

  const frontmatter: NoteFrontmatter = {
    ...data,
    // Normalize known fields (overrides raw spread values with validated types)
    id: asString(data.id),
    title: asString(data.title),
    mode: asMode(data.mode),
    labels: asStringArray(data.labels),
    editor_mode: asString(data.editor_mode),
    color: asString(data.color),
    design_id: asString(data.design_id),
    pinned: asBoolean(data.pinned),
    archived: asBoolean(data.archived),
    deleted: asBoolean(data.deleted),
    deleted_at: asString(data.deleted_at),
    images: asStringArray(data.images),
    created_at: asString(data.created_at),
    updated_at: asString(data.updated_at),
    // Reset behavior so raw spread can't leak a non-object value
    behavior: undefined,
  };

  if (data.behavior && typeof data.behavior === 'object' && !Array.isArray(data.behavior)) {
    frontmatter.behavior = {
      usefulness_score: asNumber(data.behavior.usefulness_score),
      usefulness_level: asString(data.behavior.usefulness_level),
      access_count: asNumber(data.behavior.access_count),
      edit_count: asNumber(data.behavior.edit_count),
    };
  }

  return {
    frontmatter,
    content: content.trim(),
    rawMarkdown: md,
  };
}

/**
 * Convert multiple notes to a markdown archive (array of filename + content pairs).
 *
 * Filenames are sanitized from note titles, with fallback to note ID.
 * Duplicate filenames get a numeric suffix.
 */
export function notesToMarkdownArchive(
  notes: Note[],
  options?: SerializeOptions
): { filename: string; content: string }[] {
  const usedFilenames = new Set<string>();

  return notes.map((note) => {
    let base = sanitizeFilename(note.title || note.id);
    let filename = `${base}.md`;

    // Handle duplicates
    let counter = 1;
    while (usedFilenames.has(filename)) {
      filename = `${base}-${counter}.md`;
      counter++;
    }
    usedFilenames.add(filename);

    return {
      filename,
      content: noteToMarkdown(note, options),
    };
  });
}

// ---- Helpers ----

const VALID_MODES = ['manage', 'develop', 'organize', 'experience'] as const;

function asString(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  return undefined;
}

function asNumber(val: unknown): number | undefined {
  if (typeof val === 'number') return val;
  return undefined;
}

function asBoolean(val: unknown): boolean | undefined {
  if (typeof val === 'boolean') return val;
  return undefined;
}

function asStringArray(val: unknown): string[] | undefined {
  if (Array.isArray(val)) return val.filter((v) => typeof v === 'string');
  return undefined;
}

function asMode(val: unknown): 'manage' | 'develop' | 'organize' | 'experience' | undefined {
  if (typeof val === 'string' && VALID_MODES.includes(val as typeof VALID_MODES[number])) {
    return val as typeof VALID_MODES[number];
  }
  return undefined;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '')
    .toLowerCase()
    .slice(0, 100) || 'untitled';
}
