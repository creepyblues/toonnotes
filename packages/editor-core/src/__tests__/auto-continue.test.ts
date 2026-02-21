import { describe, it, expect } from 'vitest';
import { getAutoContinuePrefix, shouldRemoveEmptyLine } from '../auto-continue';

describe('getAutoContinuePrefix', () => {
  it('returns "- [ ] " for unchecked checkbox with content', () => {
    expect(getAutoContinuePrefix('- [ ] Buy groceries')).toBe('- [ ] ');
  });

  it('returns "- [ ] " for checked checkbox with content', () => {
    expect(getAutoContinuePrefix('- [x] Done task')).toBe('- [ ] ');
  });

  it('returns "• " for bullet with content', () => {
    expect(getAutoContinuePrefix('• Some item')).toBe('• ');
  });

  it('returns "• " for dash bullet with content', () => {
    expect(getAutoContinuePrefix('- Some item')).toBe('• ');
  });

  it('returns "• " for star bullet with content', () => {
    expect(getAutoContinuePrefix('* Some item')).toBe('• ');
  });

  it('returns null for plain text', () => {
    expect(getAutoContinuePrefix('Just text')).toBeNull();
  });

  it('returns null for empty checkbox (no content)', () => {
    expect(getAutoContinuePrefix('- [ ] ')).toBeNull();
  });

  it('returns null for empty bullet (no content)', () => {
    expect(getAutoContinuePrefix('• ')).toBeNull();
  });
});

describe('shouldRemoveEmptyLine', () => {
  it('returns true for empty unchecked checkbox', () => {
    expect(shouldRemoveEmptyLine('- [ ] ')).toBe(true);
  });

  it('returns true for empty checked checkbox', () => {
    expect(shouldRemoveEmptyLine('- [x] ')).toBe(true);
  });

  it('returns true for empty bullet •', () => {
    expect(shouldRemoveEmptyLine('• ')).toBe(true);
  });

  it('returns true for empty dash bullet', () => {
    expect(shouldRemoveEmptyLine('- ')).toBe(true);
  });

  it('returns true for empty star bullet', () => {
    expect(shouldRemoveEmptyLine('* ')).toBe(true);
  });

  it('returns false for checkbox with content', () => {
    expect(shouldRemoveEmptyLine('- [ ] text')).toBe(false);
  });

  it('returns false for bullet with content', () => {
    expect(shouldRemoveEmptyLine('• text')).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(shouldRemoveEmptyLine('text')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(shouldRemoveEmptyLine('')).toBe(false);
  });
});
