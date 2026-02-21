import { describe, it, expect } from 'vitest';
import { detectEditorMode } from '../mode-detection';

describe('detectEditorMode', () => {
  it('returns "checklist" for content with checkboxes', () => {
    expect(detectEditorMode('- [ ] Buy groceries\n- [x] Walk dog')).toBe('checklist');
  });

  it('returns "checklist" for content with only checked items', () => {
    expect(detectEditorMode('- [x] Done')).toBe('checklist');
  });

  it('returns "checklist" for content with only unchecked items', () => {
    expect(detectEditorMode('- [ ] Todo')).toBe('checklist');
  });

  it('returns "bullet" for content with bullets', () => {
    expect(detectEditorMode('• First item\n• Second item')).toBe('bullet');
  });

  it('returns "bullet" for content with dash bullets', () => {
    expect(detectEditorMode('- First item\n- Second item')).toBe('bullet');
  });

  it('returns "bullet" for content with star bullets', () => {
    expect(detectEditorMode('* First\n* Second')).toBe('bullet');
  });

  it('returns "plain" for plain text', () => {
    expect(detectEditorMode('Just some text\nAnother line')).toBe('plain');
  });

  it('returns "plain" for empty content', () => {
    expect(detectEditorMode('')).toBe('plain');
  });

  it('returns "plain" for whitespace-only content', () => {
    expect(detectEditorMode('   \n  ')).toBe('plain');
  });

  it('checkboxes take priority over bullets in mixed content', () => {
    expect(detectEditorMode('- [ ] Todo\n• Bullet')).toBe('checklist');
  });
});
