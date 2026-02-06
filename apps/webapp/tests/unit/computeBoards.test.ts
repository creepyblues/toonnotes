import { describe, it, expect } from 'vitest';
import { computeBoardsFromNotes } from '@/lib/computeBoards';
import { NoteColor, type Note } from '@toonnotes/types';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-' + Math.random().toString(36).substring(7),
    title: 'Test Note',
    content: 'Test content',
    labels: [],
    color: NoteColor.White,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    ...overrides,
  };
}

describe('computeBoardsFromNotes', () => {
  it('should return empty array for empty notes', () => {
    expect(computeBoardsFromNotes([])).toEqual([]);
  });

  it('should group notes by label', () => {
    const notes = [
      makeNote({ labels: ['todo'], updatedAt: 100 }),
      makeNote({ labels: ['todo'], updatedAt: 200 }),
      makeNote({ labels: ['reading'], updatedAt: 300 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards).toHaveLength(2);
    const todoBoard = boards.find((b) => b.hashtag === 'todo');
    const readingBoard = boards.find((b) => b.hashtag === 'reading');
    expect(todoBoard?.noteCount).toBe(2);
    expect(readingBoard?.noteCount).toBe(1);
  });

  it('should sort boards by most recent update descending', () => {
    const notes = [
      makeNote({ labels: ['old'], updatedAt: 100 }),
      makeNote({ labels: ['new'], updatedAt: 300 }),
      makeNote({ labels: ['mid'], updatedAt: 200 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards[0].hashtag).toBe('new');
    expect(boards[1].hashtag).toBe('mid');
    expect(boards[2].hashtag).toBe('old');
  });

  it('should include preview notes (max 4)', () => {
    const notes = [
      makeNote({ id: 'n1', labels: ['work'], updatedAt: 500 }),
      makeNote({ id: 'n2', labels: ['work'], updatedAt: 400 }),
      makeNote({ id: 'n3', labels: ['work'], updatedAt: 300 }),
      makeNote({ id: 'n4', labels: ['work'], updatedAt: 200 }),
      makeNote({ id: 'n5', labels: ['work'], updatedAt: 100 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards[0].noteCount).toBe(5);
    expect(boards[0].previewNotes).toHaveLength(4);
    // Should be sorted by most recent first
    expect(boards[0].previewNotes[0].id).toBe('n1');
  });

  it('should handle notes with multiple labels', () => {
    const notes = [
      makeNote({ labels: ['todo', 'work'], updatedAt: 100 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards).toHaveLength(2);
    expect(boards.find((b) => b.hashtag === 'todo')).toBeDefined();
    expect(boards.find((b) => b.hashtag === 'work')).toBeDefined();
  });

  it('should extract derived colors from up to 3 notes', () => {
    const notes = [
      makeNote({ labels: ['colorful'], color: NoteColor.Rose, updatedAt: 400 }),
      makeNote({ labels: ['colorful'], color: NoteColor.Mint, updatedAt: 300 }),
      makeNote({ labels: ['colorful'], color: NoteColor.Lavender, updatedAt: 200 }),
      makeNote({ labels: ['colorful'], color: NoteColor.White, updatedAt: 100 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards[0].derivedColors).toHaveLength(3);
    expect(boards[0].derivedColors).toContain(NoteColor.Rose);
    expect(boards[0].derivedColors).toContain(NoteColor.Mint);
    expect(boards[0].derivedColors).toContain(NoteColor.Lavender);
  });

  it('should handle notes with no labels', () => {
    const notes = [makeNote({ labels: [] })];

    const boards = computeBoardsFromNotes(notes);

    expect(boards).toHaveLength(0);
  });

  it('should set mostRecentUpdate to the latest updatedAt', () => {
    const notes = [
      makeNote({ labels: ['project'], updatedAt: 100 }),
      makeNote({ labels: ['project'], updatedAt: 500 }),
      makeNote({ labels: ['project'], updatedAt: 300 }),
    ];

    const boards = computeBoardsFromNotes(notes);

    expect(boards[0].mostRecentUpdate).toBe(500);
  });
});
