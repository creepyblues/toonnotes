import { describe, it, expect } from 'vitest';
import type { Note } from '@toonnotes/types';
import { noteToMarkdown, markdownToNote, notesToMarkdownArchive } from '../index';

const makeNote = (overrides?: Partial<Note>): Note => ({
  id: 'abc-123',
  title: 'Trip Planning',
  content: '# Trip Planning\n\n- [x] Book flights to Tokyo\n- [ ] Research hotels in Shinjuku\n- [ ] Create day-by-day itinerary',
  labels: ['travel', 'summer-2026'],
  color: '#D1FAE5' as Note['color'],
  editorMode: 'checklist',
  isPinned: true,
  isArchived: false,
  isDeleted: false,
  createdAt: 1708416000000, // 2024-02-20T10:00:00Z
  updatedAt: 1708432200000, // 2024-02-20T14:30:00Z
  ...overrides,
});

describe('noteToMarkdown', () => {
  it('serializes a note with all metadata in frontmatter', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);

    expect(md).toContain('id: abc-123');
    expect(md).toContain('title: Trip Planning');
    expect(md).toContain('editor_mode: checklist');
    expect(md).toContain("color: '#D1FAE5'");
    expect(md).toContain('pinned: true');
    expect(md).toContain('archived: false');
    expect(md).toContain('deleted: false');
    expect(md).toContain('created_at:');
    expect(md).toContain('updated_at:');
    // Labels array
    expect(md).toContain('travel');
    expect(md).toContain('summer-2026');
  });

  it('serializes deleted note with deletedAt timestamp', () => {
    const note = makeNote({ isDeleted: true, deletedAt: 1708416000000 });
    const md = noteToMarkdown(note);

    expect(md).toContain('deleted: true');
    expect(md).toContain('deleted_at:');
    expect(md).not.toContain('1708416000000');
  });

  it('excludes deletedAt when not set', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);

    expect(md).not.toContain('deleted_at');
  });

  it('serializes images when present', () => {
    const note = makeNote({ images: ['img1.png', 'img2.jpg'] });
    const md = noteToMarkdown(note);

    expect(md).toContain('img1.png');
    expect(md).toContain('img2.jpg');
  });

  it('excludes images when empty', () => {
    const note = makeNote({ images: [] });
    const md = noteToMarkdown(note);

    expect(md).not.toMatch(/^images:/m);
  });

  it('preserves checklist content as-is', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);

    expect(md).toContain('- [x] Book flights to Tokyo');
    expect(md).toContain('- [ ] Research hotels in Shinjuku');
    expect(md).toContain('- [ ] Create day-by-day itinerary');
  });

  it('includes mode when provided in options', () => {
    const note = makeNote();
    const md = noteToMarkdown(note, { mode: 'organize' });

    expect(md).toContain('mode: organize');
  });

  it('excludes mode when not provided', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);

    expect(md).not.toMatch(/^mode:/m);
  });

  it('includes design_id when option is set and note has one', () => {
    const note = makeNote({ designId: 'design-456' });
    const md = noteToMarkdown(note, { includeDesign: true });

    expect(md).toContain('design_id: design-456');
  });

  it('excludes design_id when option is not set', () => {
    const note = makeNote({ designId: 'design-456' });
    const md = noteToMarkdown(note);

    expect(md).not.toContain('design_id');
  });

  it('includes behavior metadata when provided', () => {
    const note = makeNote();
    const md = noteToMarkdown(note, {
      behavior: {
        usefulnessScore: 75,
        usefulnessLevel: 'ready',
        accessCount: 12,
        editCount: 5,
      },
    });

    expect(md).toContain('usefulness_score: 75');
    expect(md).toContain('usefulness_level: ready');
    expect(md).toContain('access_count: 12');
    expect(md).toContain('edit_count: 5');
  });

  it('handles note with no labels', () => {
    const note = makeNote({ labels: [] });
    const md = noteToMarkdown(note);

    expect(md).toContain('labels: []');
  });

  it('handles note with no editorMode (defaults to plain)', () => {
    const note = makeNote({ editorMode: undefined });
    const md = noteToMarkdown(note);

    expect(md).toContain('editor_mode: plain');
  });

  it('converts timestamps to ISO strings', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);

    // Should contain ISO date strings, not raw numbers
    expect(md).not.toContain('1708416000000');
    expect(md).toMatch(/created_at: ['"]?\d{4}-\d{2}-\d{2}T/);
  });
});

describe('markdownToNote', () => {
  it('parses frontmatter and content', () => {
    const md = `---
id: abc-123
title: Trip Planning
labels:
  - travel
  - summer-2026
editor_mode: checklist
color: '#D1FAE5'
pinned: true
archived: false
created_at: '2024-02-20T10:40:00.000Z'
updated_at: '2024-02-20T15:10:00.000Z'
---

# Trip Planning

- [x] Book flights to Tokyo
- [ ] Research hotels`;

    const result = markdownToNote(md);

    expect(result.frontmatter.id).toBe('abc-123');
    expect(result.frontmatter.title).toBe('Trip Planning');
    expect(result.frontmatter.labels).toEqual(['travel', 'summer-2026']);
    expect(result.frontmatter.editor_mode).toBe('checklist');
    expect(result.frontmatter.color).toBe('#D1FAE5');
    expect(result.frontmatter.pinned).toBe(true);
    expect(result.frontmatter.archived).toBe(false);
    expect(result.frontmatter.created_at).toBe('2024-02-20T10:40:00.000Z');
    expect(result.frontmatter.updated_at).toBe('2024-02-20T15:10:00.000Z');
  });

  it('preserves checklist content correctly', () => {
    const md = `---
title: Checklist
---

- [x] Done task
- [ ] Open task
- [X] Also done (uppercase X)`;

    const result = markdownToNote(md);

    expect(result.content).toContain('- [x] Done task');
    expect(result.content).toContain('- [ ] Open task');
    expect(result.content).toContain('- [X] Also done (uppercase X)');
  });

  it('parses mode field', () => {
    const md = `---
title: Test
mode: organize
---

Content`;

    const result = markdownToNote(md);
    expect(result.frontmatter.mode).toBe('organize');
  });

  it('ignores invalid mode values', () => {
    const md = `---
title: Test
mode: invalid
---

Content`;

    const result = markdownToNote(md);
    expect(result.frontmatter.mode).toBeUndefined();
  });

  it('parses behavior metadata', () => {
    const md = `---
title: Test
behavior:
  usefulness_score: 80
  usefulness_level: developed
  access_count: 15
  edit_count: 7
---

Content`;

    const result = markdownToNote(md);
    expect(result.frontmatter.behavior).toEqual({
      usefulness_score: 80,
      usefulness_level: 'developed',
      access_count: 15,
      edit_count: 7,
    });
  });

  it('handles unquoted ISO dates (parsed as Date by gray-matter)', () => {
    const md = `---
title: Test
created_at: 2024-02-20T10:00:00.000Z
updated_at: 2024-02-20T14:30:00.000Z
---

Content`;

    const result = markdownToNote(md);
    // gray-matter parses unquoted ISO dates as Date objects; asString handles this
    expect(typeof result.frontmatter.created_at).toBe('string');
    expect(result.frontmatter.created_at).toContain('2024-02-20');
  });

  it('handles invalid behavior type gracefully', () => {
    const md = `---
title: Test
behavior: "not an object"
---

Content`;

    const result = markdownToNote(md);
    // Should not leak raw string into behavior field
    expect(result.frontmatter.behavior).toBeUndefined();
  });

  it('parses deleted and deleted_at fields', () => {
    const md = `---
title: Trashed Note
deleted: true
deleted_at: '2024-03-01T12:00:00.000Z'
---

Old content`;

    const result = markdownToNote(md);
    expect(result.frontmatter.deleted).toBe(true);
    expect(result.frontmatter.deleted_at).toBe('2024-03-01T12:00:00.000Z');
  });

  it('parses images array', () => {
    const md = `---
title: Photo Note
images:
  - photo1.png
  - photo2.jpg
---

Pictures`;

    const result = markdownToNote(md);
    expect(result.frontmatter.images).toEqual(['photo1.png', 'photo2.jpg']);
  });

  it('handles markdown without frontmatter', () => {
    const md = `# Just a heading

Some content without frontmatter.`;

    const result = markdownToNote(md);
    expect(result.frontmatter.title).toBeUndefined();
    expect(result.content).toContain('# Just a heading');
    expect(result.content).toContain('Some content without frontmatter.');
  });

  it('preserves rawMarkdown', () => {
    const md = `---
title: Test
---

Content here`;

    const result = markdownToNote(md);
    expect(result.rawMarkdown).toBe(md);
  });
});

describe('noteToMarkdown -> markdownToNote round-trip', () => {
  it('preserves all metadata fields', () => {
    const note = makeNote();
    const md = noteToMarkdown(note, { mode: 'organize' });
    const parsed = markdownToNote(md);

    expect(parsed.frontmatter.id).toBe(note.id);
    expect(parsed.frontmatter.title).toBe(note.title);
    expect(parsed.frontmatter.labels).toEqual(note.labels);
    expect(parsed.frontmatter.editor_mode).toBe(note.editorMode);
    expect(parsed.frontmatter.color).toBe(note.color);
    expect(parsed.frontmatter.pinned).toBe(note.isPinned);
    expect(parsed.frontmatter.archived).toBe(note.isArchived);
    expect(parsed.frontmatter.deleted).toBe(note.isDeleted);
    expect(parsed.frontmatter.mode).toBe('organize');
  });

  it('preserves deleted status and deletedAt through round-trip', () => {
    const note = makeNote({ isDeleted: true, deletedAt: 1708416000000 });
    const md = noteToMarkdown(note);
    const parsed = markdownToNote(md);

    expect(parsed.frontmatter.deleted).toBe(true);
    expect(parsed.frontmatter.deleted_at).toBeDefined();
    const deletedMs = new Date(parsed.frontmatter.deleted_at!).getTime();
    expect(deletedMs).toBe(note.deletedAt);
  });

  it('preserves images through round-trip', () => {
    const note = makeNote({ images: ['photo1.png', 'photo2.jpg'] });
    const md = noteToMarkdown(note);
    const parsed = markdownToNote(md);

    expect(parsed.frontmatter.images).toEqual(['photo1.png', 'photo2.jpg']);
  });

  it('preserves checklist content through round-trip', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);
    const parsed = markdownToNote(md);

    expect(parsed.content).toContain('- [x] Book flights to Tokyo');
    expect(parsed.content).toContain('- [ ] Research hotels in Shinjuku');
    expect(parsed.content).toContain('- [ ] Create day-by-day itinerary');
  });

  it('preserves timestamps as ISO strings', () => {
    const note = makeNote();
    const md = noteToMarkdown(note);
    const parsed = markdownToNote(md);

    // Verify timestamps round-trip to valid ISO strings
    expect(parsed.frontmatter.created_at).toBeDefined();
    expect(parsed.frontmatter.updated_at).toBeDefined();
    const createdMs = new Date(parsed.frontmatter.created_at!).getTime();
    const updatedMs = new Date(parsed.frontmatter.updated_at!).getTime();
    expect(createdMs).toBe(note.createdAt);
    expect(updatedMs).toBe(note.updatedAt);
  });

  it('preserves behavior metadata through round-trip', () => {
    const note = makeNote();
    const md = noteToMarkdown(note, {
      behavior: { usefulnessScore: 90, usefulnessLevel: 'complete', accessCount: 20, editCount: 8 },
    });
    const parsed = markdownToNote(md);

    expect(parsed.frontmatter.behavior).toEqual({
      usefulness_score: 90,
      usefulness_level: 'complete',
      access_count: 20,
      edit_count: 8,
    });
  });

  it('preserves plain text note through round-trip', () => {
    const note = makeNote({
      editorMode: 'plain',
      content: 'Just a simple text note.\n\nWith multiple paragraphs.',
    });
    const md = noteToMarkdown(note);
    const parsed = markdownToNote(md);

    expect(parsed.content).toBe('Just a simple text note.\n\nWith multiple paragraphs.');
    expect(parsed.frontmatter.editor_mode).toBe('plain');
  });
});

describe('notesToMarkdownArchive', () => {
  it('converts multiple notes to filename/content pairs', () => {
    const notes = [
      makeNote({ title: 'Trip Planning' }),
      makeNote({ id: 'def-456', title: 'Grocery List' }),
    ];

    const archive = notesToMarkdownArchive(notes);

    expect(archive).toHaveLength(2);
    expect(archive[0].filename).toBe('trip-planning.md');
    expect(archive[1].filename).toBe('grocery-list.md');
    expect(archive[0].content).toContain('Trip Planning');
    expect(archive[1].content).toContain('Grocery List');
  });

  it('handles duplicate titles with numeric suffix', () => {
    const notes = [
      makeNote({ id: '1', title: 'Notes' }),
      makeNote({ id: '2', title: 'Notes' }),
      makeNote({ id: '3', title: 'Notes' }),
    ];

    const archive = notesToMarkdownArchive(notes);

    expect(archive[0].filename).toBe('notes.md');
    expect(archive[1].filename).toBe('notes-1.md');
    expect(archive[2].filename).toBe('notes-2.md');
  });

  it('falls back to note ID for empty titles', () => {
    const notes = [makeNote({ title: '' })];
    const archive = notesToMarkdownArchive(notes);

    expect(archive[0].filename).toBe('abc-123.md');
  });

  it('sanitizes special characters in filenames', () => {
    const notes = [makeNote({ title: 'What/Why: A "Test" <Note>' })];
    const archive = notesToMarkdownArchive(notes);

    expect(archive[0].filename).toBe('whatwhy-a-test-note.md');
    expect(archive[0].filename).not.toMatch(/[\/\\:*?"<>|]/);
  });

  it('strips leading dots to avoid hidden files', () => {
    const notes = [makeNote({ title: '...Hidden Note' })];
    const archive = notesToMarkdownArchive(notes);

    expect(archive[0].filename).not.toMatch(/^\./);
  });

  it('handles titles with trailing dots', () => {
    const notes = [makeNote({ title: 'Note. Final.' })];
    const archive = notesToMarkdownArchive(notes);

    expect(archive[0].filename).not.toMatch(/\.\.md$/);
  });

  it('passes options through to noteToMarkdown', () => {
    const notes = [makeNote()];
    const archive = notesToMarkdownArchive(notes, { mode: 'manage' });

    expect(archive[0].content).toContain('mode: manage');
  });
});
