/**
 * API Response Validation Tests
 *
 * Tests for Zod validation of external API responses.
 * Ensures graceful handling of malformed or unexpected data.
 */

import {
  parseThemeResponse,
  parseLuckyThemeResponse,
  parseStickerResponse,
  parseBoardDesignResponse,
  isValidHexColor,
  sanitizeColor,
  ValidatedThemeResponse,
  ValidatedLuckyThemeResponse,
  ValidatedStickerResponse,
  ValidatedBoardDesignResponse,
} from '@/utils/validation/apiResponse';

describe('API Response Validation', () => {
  describe('parseThemeResponse', () => {
    it('should parse valid theme response', () => {
      const validResponse = {
        name: 'Sunset Vibes',
        colors: {
          background: '#FFF7ED',
          text: '#1A1625',
          accent: '#F97316',
        },
        styles: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          backgroundGradient: 'linear-gradient(to bottom, #FFF7ED, #FFEDD5)',
        },
      };

      const result = parseThemeResponse(validResponse);

      expect(result.name).toBe('Sunset Vibes');
      expect(result.colors.background).toBe('#FFF7ED');
      expect(result.colors.text).toBe('#1A1625');
      expect(result.colors.accent).toBe('#F97316');
      expect(result.styles?.borderRadius).toBe('12px');
    });

    it('should return defaults for null input', () => {
      const result = parseThemeResponse(null);

      expect(result.name).toBe('Custom Design');
      expect(result.colors.background).toBe('#FFFFFF');
      expect(result.colors.text).toBe('#1A1625');
      expect(result.colors.accent).toBe('#8B5CF6');
    });

    it('should return defaults for undefined input', () => {
      const result = parseThemeResponse(undefined);

      expect(result.name).toBe('Custom Design');
      expect(result.colors).toBeDefined();
    });

    it('should return defaults for empty object', () => {
      const result = parseThemeResponse({});

      expect(result.name).toBe('Custom Design');
      expect(result.colors.background).toBe('#FFFFFF');
    });

    it('should handle partial colors object', () => {
      const partialResponse = {
        name: 'Partial Theme',
        colors: {
          background: '#FF0000',
          // missing text and accent
        },
      };

      const result = parseThemeResponse(partialResponse);

      expect(result.colors.background).toBe('#FF0000');
      expect(result.colors.text).toBe('#1A1625'); // default
      expect(result.colors.accent).toBe('#8B5CF6'); // default
    });

    it('should handle missing styles gracefully', () => {
      const responseWithoutStyles = {
        name: 'No Styles',
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          accent: '#FF0000',
        },
      };

      const result = parseThemeResponse(responseWithoutStyles);

      expect(result.name).toBe('No Styles');
      expect(result.colors).toBeDefined();
    });

    it('should handle malformed JSON-like strings', () => {
      const result = parseThemeResponse('{"invalid": json}');

      expect(result.name).toBe('Custom Design');
    });

    it('should handle array input', () => {
      const result = parseThemeResponse([1, 2, 3]);

      expect(result.name).toBe('Custom Design');
    });
  });

  describe('parseLuckyThemeResponse', () => {
    it('should parse valid lucky theme response', () => {
      const validResponse = {
        name: 'Chaotic Energy',
        colors: {
          background: '#FEF3C7',
          text: '#1A1625',
          accent: '#F59E0B',
        },
        vibe: 'chaotic',
      };

      const result = parseLuckyThemeResponse(validResponse);

      expect(result.name).toBe('Chaotic Energy');
      expect(result.vibe).toBe('chaotic');
    });

    it('should accept all valid vibe values', () => {
      const vibes = ['chaotic', 'unhinged', 'dramatic', 'cursed', 'blessed', 'feral'] as const;

      vibes.forEach(vibe => {
        const response = {
          name: `${vibe} Theme`,
          colors: {
            background: '#FFFFFF',
            text: '#000000',
            accent: '#FF0000',
          },
          vibe,
        };

        const result = parseLuckyThemeResponse(response);
        expect(result.vibe).toBe(vibe);
      });
    });

    it('should return defaults for invalid input', () => {
      const result = parseLuckyThemeResponse(null);

      expect(result.name).toBe('Lucky Design');
      expect(result.vibe).toBe('chaotic');
    });

    it('should handle missing vibe field', () => {
      const responseWithoutVibe = {
        name: 'No Vibe',
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          accent: '#FF0000',
        },
      };

      const result = parseLuckyThemeResponse(responseWithoutVibe);

      expect(result.name).toBe('No Vibe');
      expect(result.vibe).toBeUndefined();
    });
  });

  describe('parseStickerResponse', () => {
    it('should parse valid sticker response', () => {
      const validResponse = {
        stickerData: 'base64EncodedImageData...',
        mimeType: 'image/png',
        fallback: false,
        transformed: true,
      };

      const result = parseStickerResponse(validResponse);

      expect(result).not.toBeNull();
      expect(result?.stickerData).toBe('base64EncodedImageData...');
      expect(result?.mimeType).toBe('image/png');
      expect(result?.fallback).toBe(false);
      expect(result?.transformed).toBe(true);
    });

    it('should return null for invalid input', () => {
      const result = parseStickerResponse(null);
      expect(result).toBeNull();
    });

    it('should return null for empty object', () => {
      const result = parseStickerResponse({});
      expect(result).toBeNull();
    });

    it('should return null when error field is present', () => {
      const responseWithError = {
        stickerData: 'some data',
        mimeType: 'image/png',
        error: 'Failed to process image',
      };

      const result = parseStickerResponse(responseWithError);
      expect(result).toBeNull();
    });

    it('should require stickerData field', () => {
      const responseWithoutData = {
        mimeType: 'image/png',
      };

      const result = parseStickerResponse(responseWithoutData);
      expect(result).toBeNull();
    });

    it('should default mimeType to image/png', () => {
      const responseWithoutMimeType = {
        stickerData: 'base64data',
      };

      const result = parseStickerResponse(responseWithoutMimeType);
      expect(result?.mimeType).toBe('image/png');
    });
  });

  describe('parseBoardDesignResponse', () => {
    it('should parse valid board design response', () => {
      const validResponse = {
        headerGradient: {
          colors: ['#FF6B6B', '#4ECDC4'],
          direction: 'to right',
        },
        corkboardStyle: {
          backgroundColor: '#D4A574',
          textureOpacity: 0.3,
          patternType: 'cork',
        },
        decorations: {
          pushPinColors: ['#FF0000', '#00FF00', '#0000FF'],
          tapeStyle: 'masking',
          shadowIntensity: 0.5,
        },
        accentColor: '#FF6B6B',
      };

      const result = parseBoardDesignResponse(validResponse);

      expect(result).not.toBeNull();
      expect(result?.headerGradient.colors).toHaveLength(2);
      expect(result?.corkboardStyle.backgroundColor).toBe('#D4A574');
      expect(result?.decorations?.pushPinColors).toHaveLength(3);
    });

    it('should return null for invalid input', () => {
      const result = parseBoardDesignResponse(null);
      expect(result).toBeNull();
    });

    it('should require minimum 2 gradient colors', () => {
      const invalidResponse = {
        headerGradient: {
          colors: ['#FF0000'], // only 1 color
        },
        corkboardStyle: {
          backgroundColor: '#FFFFFF',
        },
      };

      const result = parseBoardDesignResponse(invalidResponse);
      expect(result).toBeNull();
    });

    it('should validate textureOpacity range (0-1)', () => {
      const invalidOpacity = {
        headerGradient: {
          colors: ['#FF0000', '#0000FF'],
        },
        corkboardStyle: {
          backgroundColor: '#FFFFFF',
          textureOpacity: 1.5, // invalid: > 1
        },
      };

      const result = parseBoardDesignResponse(invalidOpacity);
      expect(result).toBeNull();
    });

    it('should handle optional decorations field', () => {
      const minimalResponse = {
        headerGradient: {
          colors: ['#FF0000', '#0000FF'],
        },
        corkboardStyle: {
          backgroundColor: '#FFFFFF',
        },
      };

      const result = parseBoardDesignResponse(minimalResponse);
      expect(result).not.toBeNull();
      expect(result?.decorations).toBeUndefined();
    });
  });

  describe('isValidHexColor', () => {
    it('should validate 6-character hex colors', () => {
      expect(isValidHexColor('#FF0000')).toBe(true);
      expect(isValidHexColor('#00ff00')).toBe(true);
      expect(isValidHexColor('#123ABC')).toBe(true);
    });

    it('should validate 3-character hex colors', () => {
      expect(isValidHexColor('#F00')).toBe(true);
      expect(isValidHexColor('#0f0')).toBe(true);
      expect(isValidHexColor('#ABC')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidHexColor('FF0000')).toBe(false); // missing #
      expect(isValidHexColor('#FF00')).toBe(false); // 4 chars
      expect(isValidHexColor('#FF00000')).toBe(false); // 7 chars
      expect(isValidHexColor('#GGGGGG')).toBe(false); // invalid chars
      expect(isValidHexColor('red')).toBe(false); // named color
      expect(isValidHexColor('rgb(255,0,0)')).toBe(false); // rgb
      expect(isValidHexColor('')).toBe(false); // empty
    });

    it('should be case-insensitive', () => {
      expect(isValidHexColor('#aabbcc')).toBe(true);
      expect(isValidHexColor('#AABBCC')).toBe(true);
      expect(isValidHexColor('#AaBbCc')).toBe(true);
    });
  });

  describe('sanitizeColor', () => {
    it('should return valid hex colors unchanged', () => {
      expect(sanitizeColor('#FF0000')).toBe('#FF0000');
      expect(sanitizeColor('#abc')).toBe('#abc');
    });

    it('should return default for invalid colors', () => {
      expect(sanitizeColor('invalid')).toBe('#8B5CF6');
      expect(sanitizeColor('')).toBe('#8B5CF6');
      expect(sanitizeColor('red')).toBe('#8B5CF6');
    });

    it('should use custom default when provided', () => {
      expect(sanitizeColor('invalid', '#000000')).toBe('#000000');
      expect(sanitizeColor('', '#FFFFFF')).toBe('#FFFFFF');
    });

    it('should handle edge cases', () => {
      expect(sanitizeColor(null as any)).toBe('#8B5CF6');
      expect(sanitizeColor(undefined as any)).toBe('#8B5CF6');
      expect(sanitizeColor(123 as any)).toBe('#8B5CF6');
    });
  });
});
