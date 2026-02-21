import { describe, it, expect } from 'vitest';
import { textToHtml, htmlToPlainText } from '../html-bridge';
import { normalizeContent } from '../serializer';

describe('cross-platform parity', () => {
  const testCases = [
    {
      name: 'canonical checkboxes',
      content: '- [x] Buy groceries\n- [ ] Walk the dog',
    },
    {
      name: 'canonical bullets',
      content: '• Item one\n• Item two\n• Item three',
    },
    {
      name: 'plain text',
      content: 'Just some text\nAnother line',
    },
    {
      name: 'mixed content',
      content: '- [x] Done task\n- [ ] Pending task\n• Bullet item\nPlain text line',
    },
  ];

  for (const { name, content } of testCases) {
    it(`webapp round-trip matches Expo round-trip for: ${name}`, () => {
      // Webapp round-trip: text → HTML → text
      const webappResult = htmlToPlainText(textToHtml(content));

      // Expo round-trip: normalizeContent (text → text)
      const expoResult = normalizeContent(content);

      expect(webappResult).toBe(expoResult);
    });
  }

  it('mixed format inputs normalize to same canonical output', () => {
    // Various ways to write the same content
    const variants = [
      '- [X] Done\n* Item\n[ ] Todo',     // uppercase X, star bullet, no dash
      '- [x] Done\n- Item\n- [ ] Todo',    // dash bullet
      '- [x] Done\n• Item\n- [ ] Todo',    // canonical
    ];

    const normalized = variants.map(normalizeContent);

    // All should produce the same canonical output
    const expected = '- [x] Done\n• Item\n- [ ] Todo';
    for (const result of normalized) {
      expect(result).toBe(expected);
    }
  });

  it('webapp round-trip produces normalized output for non-canonical input', () => {
    const nonCanonical = '- [X] Done\n* Item';
    const webResult = htmlToPlainText(textToHtml(nonCanonical));
    const normalized = normalizeContent(nonCanonical);

    expect(webResult).toBe(normalized);
  });
});
