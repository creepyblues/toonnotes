import { describe, it, expect } from 'vitest';
import {
  checklistToContent,
  parseChecklistFromContent,
  bulletToContent,
  parseBulletFromContent,
  stripCheckboxPrefixes,
  stripBulletPrefixes,
  stripAllFormatting,
  normalizeContent,
} from '../serializer';

describe('checklistToContent / parseChecklistFromContent', () => {
  it('round-trips checked items', () => {
    const items = [
      { text: 'Buy groceries', checked: true },
      { text: 'Walk the dog', checked: false },
    ];
    const content = checklistToContent(items);
    expect(content).toBe('- [x] Buy groceries\n- [ ] Walk the dog');

    const parsed = parseChecklistFromContent(content);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].text).toBe('Buy groceries');
    expect(parsed[0].checked).toBe(true);
    expect(parsed[1].text).toBe('Walk the dog');
    expect(parsed[1].checked).toBe(false);
  });

  it('parseChecklistFromContent handles empty content', () => {
    const parsed = parseChecklistFromContent('');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('');
    expect(parsed[0].checked).toBe(false);
  });

  it('parseChecklistFromContent strips bullet prefixes for non-checkbox lines', () => {
    const parsed = parseChecklistFromContent('• Some bullet text');
    expect(parsed[0].text).toBe('Some bullet text');
    expect(parsed[0].checked).toBe(false);
  });
});

describe('bulletToContent / parseBulletFromContent', () => {
  it('round-trips bullet items', () => {
    const items = [{ text: 'First' }, { text: 'Second' }];
    const content = bulletToContent(items);
    expect(content).toBe('• First\n• Second');

    const parsed = parseBulletFromContent(content);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].text).toBe('First');
    expect(parsed[1].text).toBe('Second');
  });

  it('parseBulletFromContent handles empty content', () => {
    const parsed = parseBulletFromContent('');
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('');
  });

  it('parseBulletFromContent strips various bullet prefixes', () => {
    const content = '• Bullet\n- Dash\n* Star';
    const parsed = parseBulletFromContent(content);
    expect(parsed[0].text).toBe('Bullet');
    expect(parsed[1].text).toBe('Dash');
    expect(parsed[2].text).toBe('Star');
  });
});

describe('stripCheckboxPrefixes', () => {
  it('strips unchecked checkbox prefix', () => {
    expect(stripCheckboxPrefixes('- [ ] text')).toBe('text');
  });

  it('strips checked checkbox prefix', () => {
    expect(stripCheckboxPrefixes('- [x] text')).toBe('text');
  });

  it('handles multi-line', () => {
    expect(stripCheckboxPrefixes('- [ ] a\n- [x] b')).toBe('a\nb');
  });
});

describe('stripBulletPrefixes', () => {
  it('strips bullet prefix', () => {
    expect(stripBulletPrefixes('• text')).toBe('text');
  });

  it('strips dash bullet', () => {
    expect(stripBulletPrefixes('- text')).toBe('text');
  });

  it('strips star bullet', () => {
    expect(stripBulletPrefixes('* text')).toBe('text');
  });
});

describe('stripAllFormatting', () => {
  it('strips checkbox and bullet prefixes', () => {
    const input = '- [x] done\n• item\nplain';
    expect(stripAllFormatting(input)).toBe('done\nitem\nplain');
  });
});

describe('normalizeContent', () => {
  it('normalizes checkbox variants to canonical form', () => {
    expect(normalizeContent('- [X] text')).toBe('- [x] text');
    expect(normalizeContent('[x] text')).toBe('- [x] text');
    expect(normalizeContent('[ ] text')).toBe('- [ ] text');
  });

  it('normalizes bullet variants to •', () => {
    expect(normalizeContent('- text')).toBe('• text');
    expect(normalizeContent('* text')).toBe('• text');
    expect(normalizeContent('• text')).toBe('• text');
  });

  it('preserves plain text', () => {
    expect(normalizeContent('just text')).toBe('just text');
  });

  it('handles mixed content', () => {
    const input = '- [X] Done\n* Item\nPlain line\n- [ ] Todo';
    const expected = '- [x] Done\n• Item\nPlain line\n- [ ] Todo';
    expect(normalizeContent(input)).toBe(expected);
  });

  it('handles empty/null content', () => {
    expect(normalizeContent('')).toBe('');
  });
});
