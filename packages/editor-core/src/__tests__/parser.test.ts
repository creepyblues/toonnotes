import { describe, it, expect } from 'vitest';
import { parseLineType, parseContent } from '../parser';

describe('parseLineType', () => {
  it('detects unchecked checkbox: - [ ] text', () => {
    const result = parseLineType('- [ ] Buy groceries');
    expect(result.type).toBe('checkbox-unchecked');
    expect(result.prefixLength).toBe(6);
  });

  it('detects checked checkbox: - [x] text', () => {
    const result = parseLineType('- [x] Buy groceries');
    expect(result.type).toBe('checkbox-checked');
    expect(result.prefixLength).toBe(6);
  });

  it('detects checked checkbox: - [X] text (uppercase)', () => {
    const result = parseLineType('- [X] Buy groceries');
    expect(result.type).toBe('checkbox-checked');
    expect(result.prefixLength).toBe(6);
  });

  it('detects checkbox without dash: [ ] text', () => {
    const result = parseLineType('[ ] Buy groceries');
    expect(result.type).toBe('checkbox-unchecked');
  });

  it('detects checkbox without dash: [x] text', () => {
    const result = parseLineType('[x] Buy groceries');
    expect(result.type).toBe('checkbox-checked');
  });

  it('detects bullet with •', () => {
    const result = parseLineType('• Buy groceries');
    expect(result.type).toBe('bullet');
    expect(result.prefixLength).toBe(2);
  });

  it('detects bullet with -', () => {
    const result = parseLineType('- Buy groceries');
    expect(result.type).toBe('bullet');
    expect(result.prefixLength).toBe(2);
  });

  it('detects bullet with *', () => {
    const result = parseLineType('* Buy groceries');
    expect(result.type).toBe('bullet');
    expect(result.prefixLength).toBe(2);
  });

  it('returns text for plain lines', () => {
    const result = parseLineType('Just some text');
    expect(result.type).toBe('text');
    expect(result.prefixLength).toBe(0);
  });

  it('returns text for empty lines', () => {
    const result = parseLineType('');
    expect(result.type).toBe('text');
    expect(result.prefixLength).toBe(0);
  });

  it('checkbox takes precedence over bullet for "- [" prefix', () => {
    // "- [ ] text" should be checkbox, not bullet
    const result = parseLineType('- [ ] text');
    expect(result.type).toBe('checkbox-unchecked');
  });
});

describe('parseContent', () => {
  it('splits and classifies lines correctly', () => {
    const content = '- [x] Done\n- [ ] Todo\n• Item\nPlain text';
    const result = parseContent(content);

    expect(result).toHaveLength(4);
    expect(result[0].type).toBe('checkbox-checked');
    expect(result[0].text).toBe('Done');
    expect(result[0].rawLine).toBe('- [x] Done');
    expect(result[1].type).toBe('checkbox-unchecked');
    expect(result[1].text).toBe('Todo');
    expect(result[2].type).toBe('bullet');
    expect(result[2].text).toBe('Item');
    expect(result[3].type).toBe('text');
    expect(result[3].text).toBe('Plain text');
  });

  it('handles empty content', () => {
    const result = parseContent('');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('text');
    expect(result[0].text).toBe('');
  });

  it('handles single line', () => {
    const result = parseContent('• Single bullet');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('bullet');
    expect(result[0].text).toBe('Single bullet');
  });
});
