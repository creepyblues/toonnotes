/**
 * Unit Tests for UUID utility
 *
 * Tests UUID generation format and uniqueness.
 */

import { generateUUID } from '@/utils/uuid';

describe('generateUUID', () => {
  it('should generate a valid UUID v4 format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(uuid).toMatch(uuidRegex);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    const uuid3 = generateUUID();

    expect(uuid1).not.toBe(uuid2);
    expect(uuid2).not.toBe(uuid3);
    expect(uuid1).not.toBe(uuid3);
  });

  it('should generate UUIDs with correct version (4)', () => {
    const uuid = generateUUID();
    const versionChar = uuid.charAt(14); // 15th character should be '4'

    expect(versionChar).toBe('4');
  });

  it('should generate UUIDs with correct variant', () => {
    const uuid = generateUUID();
    const variantChar = uuid.charAt(19); // 20th character should be 8, 9, a, or b

    expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
  });

  it('should generate UUIDs with correct format length', () => {
    const uuid = generateUUID();

    expect(uuid).toHaveLength(36); // 32 hex chars + 4 dashes
  });

  it('should generate UUIDs with dashes in correct positions', () => {
    const uuid = generateUUID();

    expect(uuid.charAt(8)).toBe('-');
    expect(uuid.charAt(13)).toBe('-');
    expect(uuid.charAt(18)).toBe('-');
    expect(uuid.charAt(23)).toBe('-');
  });

  it('should generate only lowercase hex characters', () => {
    const uuid = generateUUID();
    const hexRegex = /^[0-9a-f-]+$/;

    expect(uuid.toLowerCase()).toBe(uuid);
    expect(uuid).toMatch(hexRegex);
  });

  it('should generate many unique UUIDs', () => {
    const uuids = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      uuids.add(generateUUID());
    }

    expect(uuids.size).toBe(count);
  });

  it('should not generate sequential UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();

    // UUIDs should be random, not sequential
    const num1 = parseInt(uuid1.replace(/-/g, '').substring(0, 8), 16);
    const num2 = parseInt(uuid2.replace(/-/g, '').substring(0, 8), 16);

    expect(Math.abs(num1 - num2)).toBeGreaterThan(1);
  });

  it('should be a string type', () => {
    const uuid = generateUUID();

    expect(typeof uuid).toBe('string');
  });
});
