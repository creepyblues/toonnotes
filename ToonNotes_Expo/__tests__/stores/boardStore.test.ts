/**
 * Unit Tests for boardStore
 *
 * Tests board CRUD operations, style customization, design application,
 * and board data computation utilities.
 */

import { useBoardStore, computeBoardsFromNotes, deriveGradientFromColors } from '@/stores/boardStore';
import { NoteColor, Note, Board } from '@/types';

// Mock generateUUID to return predictable IDs
let mockUuidCounter = 0;
jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => `test-uuid-${++mockUuidCounter}`),
}));

describe('boardStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBoardStore.setState({ boards: [] });
    mockUuidCounter = 0;
  });

  describe('getBoardByHashtag', () => {
    it('should return undefined for non-existent hashtag', () => {
      const store = useBoardStore.getState();
      const board = store.getBoardByHashtag('nonexistent');
      expect(board).toBeUndefined();
    });

    it('should return board for existing hashtag (case-insensitive)', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('TestTag', { coverColor: '#FF0000' });

      const board = store.getBoardByHashtag('testtag');
      expect(board).toBeDefined();
      expect(board?.hashtag).toBe('testtag');
    });
  });

  describe('updateBoardStyle', () => {
    it('should create new board with style', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('anime', { coverColor: '#FF5555', icon: 'Star' });

      const boards = useBoardStore.getState().boards;
      expect(boards).toHaveLength(1);
      expect(boards[0].hashtag).toBe('anime');
      expect(boards[0].customStyle?.coverColor).toBe('#FF5555');
      expect(boards[0].customStyle?.icon).toBe('Star');
    });

    it('should update existing board style', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('anime', { coverColor: '#FF0000' });
      store.updateBoardStyle('anime', { coverColor: '#00FF00', icon: 'Heart' });

      const boards = useBoardStore.getState().boards;
      expect(boards).toHaveLength(1);
      expect(boards[0].customStyle?.coverColor).toBe('#00FF00');
      expect(boards[0].customStyle?.icon).toBe('Heart');
    });

    it('should normalize hashtag to lowercase', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('MyBoard', { coverColor: '#000000' });

      const board = store.getBoardByHashtag('myboard');
      expect(board).toBeDefined();
      expect(board?.hashtag).toBe('myboard');
    });
  });

  describe('clearBoardStyle', () => {
    it('should clear custom style from board', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('anime', { coverColor: '#FF0000', icon: 'Star' });
      store.clearBoardStyle('anime');

      const board = store.getBoardByHashtag('anime');
      expect(board?.customStyle).toBeUndefined();
    });

    it('should not create new board when clearing non-existent', () => {
      const store = useBoardStore.getState();
      store.clearBoardStyle('nonexistent');

      const boards = useBoardStore.getState().boards;
      expect(boards).toHaveLength(0);
    });
  });

  describe('applyDesign', () => {
    it('should create new board with design', () => {
      const store = useBoardStore.getState();
      store.applyDesign('manga', 'design-123');

      const board = store.getBoardByHashtag('manga');
      expect(board).toBeDefined();
      expect(board?.boardDesignId).toBe('design-123');
    });

    it('should update existing board with design', () => {
      const store = useBoardStore.getState();
      store.updateBoardStyle('manga', { coverColor: '#FF0000' });
      store.applyDesign('manga', 'design-456');

      const board = store.getBoardByHashtag('manga');
      expect(board?.boardDesignId).toBe('design-456');
      expect(board?.customStyle?.coverColor).toBe('#FF0000'); // Style preserved
    });
  });

  describe('clearDesign', () => {
    it('should clear design from board', () => {
      const store = useBoardStore.getState();
      store.applyDesign('manga', 'design-123');
      store.clearDesign('manga');

      const board = store.getBoardByHashtag('manga');
      expect(board?.boardDesignId).toBeUndefined();
    });
  });
});

describe('computeBoardsFromNotes', () => {
  const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: `note-${Math.random()}`,
    title: 'Test Note',
    content: 'Test content',
    labels: [],
    color: NoteColor.White,
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  it('should return empty array for notes with no labels', () => {
    const notes = [createMockNote(), createMockNote()];
    const boards = computeBoardsFromNotes(notes, []);
    expect(boards).toHaveLength(0);
  });

  it('should group notes by label', () => {
    const notes = [
      createMockNote({ labels: ['anime'] }),
      createMockNote({ labels: ['anime'] }),
      createMockNote({ labels: ['manga'] }),
    ];

    const boards = computeBoardsFromNotes(notes, []);
    expect(boards).toHaveLength(2);

    const animeBoard = boards.find((b) => b.hashtag === 'anime');
    const mangaBoard = boards.find((b) => b.hashtag === 'manga');

    expect(animeBoard?.noteCount).toBe(2);
    expect(mangaBoard?.noteCount).toBe(1);
  });

  it('should exclude archived notes', () => {
    const notes = [
      createMockNote({ labels: ['anime'], isArchived: true }),
      createMockNote({ labels: ['anime'] }),
    ];

    const boards = computeBoardsFromNotes(notes, []);
    const animeBoard = boards.find((b) => b.hashtag === 'anime');

    expect(animeBoard?.noteCount).toBe(1);
  });

  it('should exclude deleted notes', () => {
    const notes = [
      createMockNote({ labels: ['anime'], isDeleted: true }),
      createMockNote({ labels: ['anime'] }),
    ];

    const boards = computeBoardsFromNotes(notes, []);
    const animeBoard = boards.find((b) => b.hashtag === 'anime');

    expect(animeBoard?.noteCount).toBe(1);
  });

  it('should include note in multiple boards if it has multiple labels', () => {
    const notes = [createMockNote({ labels: ['anime', 'manga', 'favorites'] })];

    const boards = computeBoardsFromNotes(notes, []);
    expect(boards).toHaveLength(3);
    expect(boards.every((b) => b.noteCount === 1)).toBe(true);
  });

  it('should sort boards by most recent update', () => {
    const oldDate = Date.now() - 10000;
    const newDate = Date.now();

    const notes = [
      createMockNote({ labels: ['old'], updatedAt: oldDate }),
      createMockNote({ labels: ['new'], updatedAt: newDate }),
    ];

    const boards = computeBoardsFromNotes(notes, []);
    expect(boards[0].hashtag).toBe('new');
    expect(boards[1].hashtag).toBe('old');
  });

  it('should derive colors from note backgrounds', () => {
    const notes = [
      createMockNote({ labels: ['colorful'], color: NoteColor.Rose }),
      createMockNote({ labels: ['colorful'], color: NoteColor.Mint }),
      createMockNote({ labels: ['colorful'], color: NoteColor.Sky }),
    ];

    const boards = computeBoardsFromNotes(notes, []);
    const colorfulBoard = boards.find((b) => b.hashtag === 'colorful');

    expect(colorfulBoard?.derivedColors).toHaveLength(3);
    expect(colorfulBoard?.derivedColors).toContain(NoteColor.Rose);
  });
});

describe('deriveGradientFromColors', () => {
  it('should return default colors for empty array', () => {
    const gradient = deriveGradientFromColors([]);
    expect(gradient).toHaveLength(2);
    expect(gradient[0]).toBe(NoteColor.White);
  });

  it('should create gradient from single color', () => {
    const gradient = deriveGradientFromColors(['#FF0000']);
    expect(gradient).toHaveLength(2);
    expect(gradient[0]).toBe('#FF0000');
  });

  it('should use first two colors for gradient', () => {
    const gradient = deriveGradientFromColors(['#FF0000', '#00FF00', '#0000FF']);
    expect(gradient).toEqual(['#FF0000', '#00FF00']);
  });
});
