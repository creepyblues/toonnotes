import * as LegacyFileSystem from 'expo-file-system/legacy';
import { devLog, devWarn, devError } from '@/utils/devLog';
import { recordError, log } from '@/services/firebaseAnalytics';
import * as Crypto from 'expo-crypto';
import { NoteDesign, DesignTheme, BoardDesign, GeminiBoardDesignResponse, Note, TypographyPosterStyle, CharacterMascotType, TypographyStyleConfig, CharacterMascotConfig, TypographyImageResponse, CharacterMascotResponse, TextAnalysis } from '@/types';
import { themeToNoteDesign } from './designEngine';
import { LabelPreset } from '@/constants/labelPresets';
import {
  parseThemeResponse,
  parseLuckyThemeResponse,
  parseStickerResponse,
  ValidatedThemeResponse,
  ValidatedLuckyThemeResponse,
} from '@/utils/validation/apiResponse';

// API endpoint - always use production Vercel API
// (localhost doesn't work on physical devices for testing)
const API_BASE_URL = 'https://toonnotes-api.vercel.app';
const THEME_API_URL = `${API_BASE_URL}/api/generate-theme`;
const STICKER_API_URL = `${API_BASE_URL}/api/generate-sticker`;
const LUCKY_THEME_API_URL = `${API_BASE_URL}/api/generate-lucky-theme`;
const LUCKY_STICKER_API_URL = `${API_BASE_URL}/api/generate-lucky-sticker`;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ThemeResponse {
  name: string;
  colors: {
    background: string;
    text: string;
    accent: string;
  };
  styles: {
    borderRadius: string;
    boxShadow: string;
    backgroundGradient: string;
  };
}

interface LuckyThemeResponse extends ThemeResponse {
  vibe: 'chaotic' | 'unhinged' | 'dramatic' | 'cursed' | 'blessed' | 'feral';
}

/**
 * Convert image URI to base64
 * Uses legacy FileSystem API for reliable cross-platform compatibility
 */
async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  try {
    devLog('Reading image from URI:', uri);

    // Check if file exists using legacy FileSystem API (more reliable with ImagePicker URIs)
    const fileInfo = await LegacyFileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Image file does not exist');
    }
    devLog('File exists:', fileInfo.exists, 'Size:', fileInfo.size);

    // Read file as base64 using the legacy FileSystem API
    const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    devLog('Base64 length:', base64.length);

    // Determine MIME type from URI extension or default to jpeg
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      heic: 'image/jpeg', // HEIC from iPhone, treat as jpeg after conversion
    };
    const mimeType = mimeTypes[extension] || 'image/jpeg';
    devLog('MIME type:', mimeType);

    return { base64, mimeType };
  } catch (error) {
    console.error('Failed to read image:', error);
    throw new Error(`Failed to read image file: ${error}`);
  }
}

/**
 * Generate a sticker with background removed
 * Returns the local URI of the saved sticker image
 */
async function generateSticker(
  base64: string,
  mimeType: string,
  characterDescription?: string
): Promise<string | null> {
  try {
    devLog('Generating sticker with background removal...');

    const response = await fetch(STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64,
        mimeType: mimeType,
        characterDescription: characterDescription,
      }),
    });

    if (!response.ok) {
      console.error('Sticker API error:', response.status);
      return null;
    }

    const rawData = await response.json();
    const data = parseStickerResponse(rawData);

    if (!data || !data.stickerData) {
      console.error('Sticker generation failed or returned invalid data');
      return null;
    }

    // Save the sticker image locally
    const stickerId = Crypto.randomUUID();
    const extension = data.mimeType === 'image/png' ? 'png' : 'jpg';
    const stickerPath = `${LegacyFileSystem.documentDirectory}stickers/${stickerId}.${extension}`;

    // Ensure stickers directory exists
    const stickersDir = `${LegacyFileSystem.documentDirectory}stickers`;
    const dirInfo = await LegacyFileSystem.getInfoAsync(stickersDir);
    if (!dirInfo.exists) {
      await LegacyFileSystem.makeDirectoryAsync(stickersDir, { intermediates: true });
    }

    // Write the sticker image
    await LegacyFileSystem.writeAsStringAsync(stickerPath, data.stickerData, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    devLog('Sticker saved to:', stickerPath);
    devLog('Fallback used:', data.fallback);

    return stickerPath;
  } catch (error) {
    console.error('Failed to generate sticker:', error);
    return null;
  }
}

/**
 * Generate a note design from an image using Gemini API
 */
export async function generateDesign(imageUri: string): Promise<NoteDesign> {
  // Convert image to base64
  const { base64, mimeType } = await imageUriToBase64(imageUri);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      devLog(`Attempting API call (${attempt + 1}/${MAX_RETRIES})...`);

      const response = await fetch(THEME_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          mimeType: mimeType,
        }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);

        if (attempt < MAX_RETRIES - 1) {
          devLog(`Rate limited. Retrying in ${retryAfter}s...`);
          await delay(retryAfter * 1000);
          continue;
        } else {
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const rawData = await response.json();
      const themeData = parseThemeResponse(rawData);
      devLog('Received and validated theme:', themeData);

      // Generate sticker with background removal (runs in parallel conceptually, but after theme)
      devLog('Generating sticker with background removal...');
      const stickerUri = await generateSticker(base64, mimeType);

      // Convert API response to NoteDesign format
      const design: NoteDesign = {
        id: Crypto.randomUUID(),
        name: themeData.name || 'Custom Design',
        sourceImageUri: imageUri,
        createdAt: Date.now(),
        background: {
          primaryColor: themeData.colors.background,
          secondaryColor: themeData.colors.accent,
          style: 'image', // Default to using source image as background
          imageUri: imageUri, // Use the source image
          opacity: 0.15, // Subtle overlay
        },
        colors: {
          titleText: themeData.colors.text,
          bodyText: themeData.colors.text,
          accent: themeData.colors.accent,
        },
        typography: {
          titleStyle: 'sans-serif',
          vibe: 'modern',
        },
        sticker: {
          id: Crypto.randomUUID(),
          imageUri: stickerUri || imageUri, // Fallback to original if sticker generation fails
          description: 'Character from uploaded image',
          suggestedPosition: 'bottom-right',
          scale: 'medium',
        },
        designSummary: `Theme "${themeData.name}" generated from your image.`,
      };

      return design;

    } catch (error: any) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const isNetworkError = error.message?.includes('Network request failed') ||
                             error.message?.includes('fetch') ||
                             error.name === 'TypeError';

      if (isNetworkError) {
        console.error('Network error detected. Make sure local API server is running on port 3001');
        if (attempt >= MAX_RETRIES - 1) {
          recordError(error as Error, { service: 'gemini', method: 'generateDesign', type: 'network' });
          throw new Error('Cannot connect to design server. Make sure the local API server is running on port 3001.');
        }
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        devLog(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      // Record final failure
      recordError(error as Error, { service: 'gemini', method: 'generateDesign', attempt: String(attempt + 1) });
      throw error;
    }
  }

  throw lastError || new Error('Failed to generate design after retries');
}

/**
 * Generate a transformed "lucky" sticker with funny style
 * Returns the local URI of the saved sticker image
 */
async function generateLuckySticker(
  base64: string,
  mimeType: string
): Promise<string | null> {
  try {
    devLog('🎲 Generating lucky transformed sticker...');

    const response = await fetch(LUCKY_STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      console.error('Lucky sticker API error:', response.status);
      return null;
    }

    const rawData = await response.json();
    const data = parseStickerResponse(rawData);

    if (!data || !data.stickerData) {
      console.error('Lucky sticker generation failed or returned invalid data');
      return null;
    }

    // Save the sticker image locally
    const stickerId = Crypto.randomUUID();
    const extension = data.mimeType === 'image/png' ? 'png' : 'jpg';
    const stickerPath = `${LegacyFileSystem.documentDirectory}stickers/${stickerId}.${extension}`;

    // Ensure stickers directory exists
    const stickersDir = `${LegacyFileSystem.documentDirectory}stickers`;
    const dirInfo = await LegacyFileSystem.getInfoAsync(stickersDir);
    if (!dirInfo.exists) {
      await LegacyFileSystem.makeDirectoryAsync(stickersDir, { intermediates: true });
    }

    // Write the sticker image
    await LegacyFileSystem.writeAsStringAsync(stickerPath, data.stickerData, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    devLog('🎲 Lucky sticker saved to:', stickerPath);
    devLog('Transformed:', data.transformed ?? false);

    return stickerPath;
  } catch (error) {
    console.error('Failed to generate lucky sticker:', error);
    return null;
  }
}

/**
 * Generate a "Feeling Lucky" chaotic random design from an image
 * Optionally accepts a theme to base the design on
 */
export async function generateLuckyDesign(
  imageUri: string,
  theme?: DesignTheme
): Promise<NoteDesign> {
  // If no image but we have a theme, generate theme-based design with lucky sticker
  if (!imageUri && theme) {
    const stickerUri = await generateThemedSticker(theme);

    const sticker: NoteDesign['sticker'] = {
      id: Crypto.randomUUID(),
      imageUri: stickerUri || '',
      description: `Lucky ${theme.name} style character`,
      suggestedPosition: theme.stickerHint.defaultPosition,
      scale: theme.stickerHint.defaultScale,
    };

    const designBase = themeToNoteDesign(theme, '', sticker);

    return {
      ...designBase,
      id: Crypto.randomUUID(),
      createdAt: Date.now(),
      name: `Lucky ${theme.name}`,
      designSummary: `🎲 Lucky "${theme.name}" - chaotic energy!`,
      vibe: 'chaotic',
      isLucky: true,
    };
  }

  // Convert image to base64
  const { base64, mimeType } = await imageUriToBase64(imageUri);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      devLog(`🎲 Attempting Lucky API call (${attempt + 1}/${MAX_RETRIES})...`);

      const response = await fetch(LUCKY_THEME_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          mimeType: mimeType,
        }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);

        if (attempt < MAX_RETRIES - 1) {
          devLog(`Rate limited. Retrying in ${retryAfter}s...`);
          await delay(retryAfter * 1000);
          continue;
        } else {
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const rawData = await response.json();
      const themeData = parseLuckyThemeResponse(rawData);
      devLog('🎲 Received and validated lucky theme:', themeData);

      // Generate transformed sticker
      devLog('🎲 Generating transformed sticker...');
      const stickerUri = await generateLuckySticker(base64, mimeType);

      // Convert API response to NoteDesign format
      const design: NoteDesign = {
        id: Crypto.randomUUID(),
        name: themeData.name || 'Lucky Design',
        sourceImageUri: imageUri,
        createdAt: Date.now(),
        background: {
          primaryColor: themeData.colors.background,
          secondaryColor: themeData.colors.accent,
          style: 'image', // Default to using source image as background
          imageUri: imageUri, // Use the source image
          opacity: 0.2, // Slightly more visible for lucky designs
        },
        colors: {
          titleText: themeData.colors.text,
          bodyText: themeData.colors.text,
          accent: themeData.colors.accent,
        },
        typography: {
          titleStyle: 'sans-serif',
          vibe: 'modern',
        },
        sticker: {
          id: Crypto.randomUUID(),
          imageUri: stickerUri || imageUri,
          description: 'Transformed character sticker',
          suggestedPosition: 'bottom-right',
          scale: 'medium',
        },
        designSummary: `🎲 "${themeData.name}" - ${themeData.vibe || 'chaotic'} energy!`,
        vibe: themeData.vibe,
        isLucky: true,
      };

      return design;

    } catch (error: any) {
      lastError = error as Error;
      console.error(`🎲 Lucky attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const isNetworkError = error.message?.includes('Network request failed') ||
                             error.message?.includes('fetch') ||
                             error.name === 'TypeError';

      if (isNetworkError) {
        console.error('Network error detected. Make sure local API server is running on port 3001');
        if (attempt >= MAX_RETRIES - 1) {
          recordError(error as Error, { service: 'gemini', method: 'generateLuckyDesign', type: 'network' });
          throw new Error('Cannot connect to design server. Make sure the local API server is running on port 3001.');
        }
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        devLog(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      // Record final failure
      recordError(error as Error, { service: 'gemini', method: 'generateLuckyDesign', attempt: String(attempt + 1) });
      throw error;
    }
  }

  throw lastError || new Error('Failed to generate lucky design after retries');
}

// ============================================
// Theme-Based Design Generation
// ============================================

const THEMED_STICKER_API_URL = `${API_BASE_URL}/api/generate-themed-sticker`;

/**
 * Generate a sticker based on theme style hints
 */
async function generateThemedSticker(
  theme: DesignTheme,
  imageBase64?: string,
  mimeType?: string
): Promise<string | null> {
  try {
    devLog(`Generating ${theme.name} themed sticker...`);

    const response = await fetch(THEMED_STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        themeId: theme.id,
        themeName: theme.name,
        artStyle: theme.stickerHint.artStyle,
        mood: theme.stickerHint.mood,
        aiPromptHints: theme.aiPromptHints,
        imageData: imageBase64,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      console.error('Themed sticker API error:', response.status);
      // Fall back to regular sticker generation if themed endpoint not available
      if (imageBase64 && mimeType) {
        return await generateSticker(imageBase64, mimeType);
      }
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error('Themed sticker generation error:', data.error);
      // Fall back to regular sticker generation
      if (imageBase64 && mimeType) {
        return await generateSticker(imageBase64, mimeType);
      }
      return null;
    }

    // Save the sticker image locally
    const stickerId = Crypto.randomUUID();
    const extension = data.mimeType === 'image/png' ? 'png' : 'jpg';
    const stickerPath = `${LegacyFileSystem.documentDirectory}stickers/${stickerId}.${extension}`;

    // Ensure stickers directory exists
    const stickersDir = `${LegacyFileSystem.documentDirectory}stickers`;
    const dirInfo = await LegacyFileSystem.getInfoAsync(stickersDir);
    if (!dirInfo.exists) {
      await LegacyFileSystem.makeDirectoryAsync(stickersDir, { intermediates: true });
    }

    // Write the sticker image
    await LegacyFileSystem.writeAsStringAsync(stickerPath, data.stickerData, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    devLog(`${theme.name} sticker saved to:`, stickerPath);
    return stickerPath;
  } catch (error) {
    console.error('Failed to generate themed sticker:', error);
    // Fall back to regular sticker generation
    if (imageBase64 && mimeType) {
      return await generateSticker(imageBase64, mimeType);
    }
    return null;
  }
}

/**
 * Generate a note design from a theme preset
 * Optionally uses an image to extract colors that harmonize with the theme
 */
export async function generateThemedDesign(
  theme: DesignTheme,
  imageUri?: string
): Promise<NoteDesign> {
  let imageBase64: string | undefined;
  let mimeType: string | undefined;
  let colorOverrides: Partial<DesignTheme['colors']> | undefined;

  // If image provided, extract colors
  if (imageUri) {
    try {
      const imageData = await imageUriToBase64(imageUri);
      imageBase64 = imageData.base64;
      mimeType = imageData.mimeType;

      // Try to get color adjustments from API
      try {
        const colorResponse = await fetch(`${API_BASE_URL}/api/extract-colors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageBase64,
            mimeType: mimeType,
            themeId: theme.id,
            baseColors: theme.colors,
          }),
        });

        if (colorResponse.ok) {
          const colorData = await colorResponse.json();
          if (colorData.colors) {
            colorOverrides = colorData.colors;
            devLog('Color overrides from image:', colorOverrides);
          }
        }
      } catch (e) {
        // Color extraction is optional, continue without it
        devLog('Color extraction skipped:', e);
      }
    } catch (error) {
      devWarn('Could not process image, using default theme colors:', error);
    }
  }

  // Generate themed sticker
  const stickerUri = await generateThemedSticker(theme, imageBase64, mimeType);

  // Create sticker object
  const sticker: NoteDesign['sticker'] = {
    id: Crypto.randomUUID(),
    imageUri: stickerUri || imageUri || '',
    description: `${theme.name} style character`,
    suggestedPosition: theme.stickerHint.defaultPosition,
    scale: theme.stickerHint.defaultScale,
  };

  // Convert theme to NoteDesign
  const designBase = themeToNoteDesign(
    theme,
    imageUri || '',
    sticker,
    colorOverrides
  );

  const design: NoteDesign = {
    ...designBase,
    id: Crypto.randomUUID(),
    createdAt: Date.now(),
    // If we have an image, use it as background option
    background: imageUri
      ? {
          ...designBase.background,
          imageUri: imageUri,
          style: 'image' as const,
          opacity: theme.background.defaultOpacity,
        }
      : designBase.background,
  };

  return design;
}

// ============================================
// Label Preset Sticker Generation
// ============================================

const LABEL_PRESET_STICKER_API_URL = `${API_BASE_URL}/api/generate-label-sticker`;

/**
 * Generate a sticker for a label preset using its style hints
 * Uses the preset's artStyle, mood, and aiPromptHints for generation
 */
export async function generateLabelPresetSticker(
  preset: LabelPreset,
  imageBase64?: string,
  mimeType?: string
): Promise<string | null> {
  try {
    devLog(`🏷️ Generating sticker for label preset: ${preset.name}...`);

    const response = await fetch(LABEL_PRESET_STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presetId: preset.id,
        presetName: preset.name,
        category: preset.category,
        mood: preset.mood,
        artStyle: preset.artStyle,
        aiPromptHints: preset.aiPromptHints,
        stickerEmoji: preset.stickerEmoji,
        colors: preset.colors,
        imageData: imageBase64,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      console.error('Label preset sticker API error:', response.status);
      // Fall back to themed sticker generation if endpoint not available
      if (imageBase64 && mimeType) {
        return await generateSticker(imageBase64, mimeType, preset.name);
      }
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error('Label preset sticker generation error:', data.error);
      // Fall back to regular sticker generation
      if (imageBase64 && mimeType) {
        return await generateSticker(imageBase64, mimeType, preset.name);
      }
      return null;
    }

    // Save the sticker image locally
    const stickerId = Crypto.randomUUID();
    const extension = data.mimeType === 'image/png' ? 'png' : 'jpg';
    const stickerPath = `${LegacyFileSystem.documentDirectory}stickers/${stickerId}.${extension}`;

    // Ensure stickers directory exists
    const stickersDir = `${LegacyFileSystem.documentDirectory}stickers`;
    const dirInfo = await LegacyFileSystem.getInfoAsync(stickersDir);
    if (!dirInfo.exists) {
      await LegacyFileSystem.makeDirectoryAsync(stickersDir, { intermediates: true });
    }

    // Write the sticker image
    await LegacyFileSystem.writeAsStringAsync(stickerPath, data.stickerData, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    devLog(`🏷️ Label preset sticker saved to:`, stickerPath);
    return stickerPath;
  } catch (error) {
    console.error('Failed to generate label preset sticker:', error);
    // Fall back to regular sticker generation
    if (imageBase64 && mimeType) {
      return await generateSticker(imageBase64, mimeType, preset.name);
    }
    return null;
  }
}

/**
 * Generate a design from a label preset with an optional image
 * Combines the preset's colors/styles with AI-generated sticker
 */
export async function generateLabelPresetDesign(
  preset: LabelPreset,
  imageUri?: string
): Promise<NoteDesign> {
  let imageBase64: string | undefined;
  let mimeType: string | undefined;

  // If image provided, convert to base64
  if (imageUri) {
    try {
      const imageData = await imageUriToBase64(imageUri);
      imageBase64 = imageData.base64;
      mimeType = imageData.mimeType;
    } catch (error) {
      devWarn('Could not process image for label preset design:', error);
    }
  }

  // Generate preset-styled sticker
  const stickerUri = await generateLabelPresetSticker(preset, imageBase64, mimeType);

  // Create the design from preset
  const design: NoteDesign = {
    id: `label-preset-${preset.id}`,
    name: `#${preset.name}`,
    sourceImageUri: imageUri || '',
    createdAt: Date.now(),

    background: {
      primaryColor: preset.colors.bg,
      secondaryColor: preset.colors.secondary,
      style: preset.bgStyle === 'gradient' ? 'gradient' : 'solid',
      imageUri: imageUri,
      opacity: 0.15,
    },

    colors: {
      titleText: preset.colors.text,
      bodyText: preset.colors.text,
      accent: preset.colors.primary,
    },

    typography: {
      titleStyle: preset.fontStyle === 'serif' ? 'serif' :
                  preset.fontStyle === 'handwritten' ? 'handwritten' : 'sans-serif',
      vibe: preset.mood === 'playful' ? 'cute' :
            preset.mood === 'serious' ? 'dramatic' :
            preset.mood === 'dreamy' ? 'classic' : 'modern',
    },

    sticker: {
      id: Crypto.randomUUID(),
      imageUri: stickerUri || '',
      description: `${preset.name} style character`,
      suggestedPosition: preset.stickerPosition,
      scale: 'medium',
    },

    designSummary: `Design for #${preset.name} - ${preset.description}`,

    // Mark as label preset
    labelPresetId: preset.id,
    isLabelPreset: true,
  };

  return design;
}

// ============================================
// Board Design Generation
// ============================================

const BOARD_DESIGN_API_URL = `${API_BASE_URL}/api/generate-board-design`;

/**
 * Generate a board design from hashtag and note content
 */
export async function generateBoardDesign(
  hashtag: string,
  notes: Note[],
  userHint?: string
): Promise<BoardDesign> {
  devLog(`🎨 Generating board design for #${hashtag}...`);

  // Extract note content for context (first 10 notes, title + 100 chars content)
  const noteContent = notes.slice(0, 10).map(note => {
    const title = note.title || '';
    const content = note.content?.slice(0, 100) || '';
    return `${title}: ${content}`.trim();
  }).filter(Boolean);

  const response = await fetch(BOARD_DESIGN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hashtag,
      noteContent,
      userHint,
    }),
  });

  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Board design generation failed: ${response.status}`);
  }

  const data: GeminiBoardDesignResponse = await response.json();
  devLog('🎨 Board design received:', data.name);

  // Convert API response to BoardDesign
  const design: BoardDesign = {
    id: Crypto.randomUUID(),
    boardHashtag: hashtag.toLowerCase(),
    name: data.name,
    createdAt: Date.now(),
    header: {
      backgroundColor: data.header.background_color,
      textColor: data.header.text_color,
      badgeColor: data.header.badge_color,
      badgeTextColor: data.header.badge_text_color,
      accentColor: data.header.accent_color,
    },
    corkboard: {
      backgroundColor: data.corkboard.background_color,
      textureId: data.corkboard.texture_id || undefined,
      textureOpacity: data.corkboard.texture_opacity,
      borderColor: data.corkboard.border_color,
    },
    decorations: {
      icon: data.decorations.icon || undefined,
      iconColor: data.decorations.icon_color || undefined,
      accentType: data.decorations.accent_type,
      accentColor: data.decorations.accent_color || undefined,
    },
    designSummary: data.design_summary,
    sourceKeywords: data.source_keywords,
    themeInspiration: data.theme_inspiration,
  };

  return design;
}

// ============================================
// Typographic Poster - Text Art Generation
// ============================================

const TYPOGRAPHY_POSTER_API_URL = `${API_BASE_URL}/api/generate-typography-poster`;
const CHARACTER_MASCOT_API_URL = `${API_BASE_URL}/api/generate-character-mascot`;

// Typography style preset configurations
export const TYPOGRAPHY_STYLES: TypographyStyleConfig[] = [
  {
    id: 'hand-lettered',
    name: 'Hand-Lettered',
    emoji: '✍️',
    description: 'Flowing, artistic handwriting',
    artDirection: 'Hand-lettered calligraphy style with flowing, organic letters. Slight imperfections for authentic charm.',
    fontVibe: 'flowing script with personality, organic curves',
    mood: 'personal, warm, artistic',
  },
  {
    id: 'brush-marker',
    name: 'Brush/Marker',
    emoji: '🖌️',
    description: 'Bold brush strokes',
    artDirection: 'Bold brush or marker strokes with varying thickness. Japanese/Chinese calligraphy influence.',
    fontVibe: 'expressive brushwork, dynamic strokes',
    mood: 'energetic, expressive, bold',
  },
  {
    id: 'designer',
    name: 'Designer',
    emoji: '🎨',
    description: 'Professional lettering art',
    artDirection: 'Professional hand-lettering design with mixed styles. Decorative flourishes.',
    fontVibe: 'polished, decorative, multiple lettering styles',
    mood: 'crafted, professional, detailed',
  },
  {
    id: 'bold-modern',
    name: 'Bold Modern',
    emoji: '💪',
    description: 'Strong, impactful typography',
    artDirection: 'Bold sans-serif inspired lettering, high impact poster style. Thick letters with strong presence.',
    fontVibe: 'thick bold letters, geometric, maximalist',
    mood: 'powerful, attention-grabbing, modern',
  },
];

// Character mascot type configurations
export const CHARACTER_TYPES: CharacterMascotConfig[] = [
  {
    id: 'chibi-anime',
    name: 'Chibi Anime',
    emoji: '🧸',
    description: 'Cute, small proportions',
    artDirection: 'Chibi/super-deformed anime style. Large head with small body (2:1 ratio). Big expressive eyes.',
    proportions: 'chibi 2:1 head to body ratio',
    expressionStyle: 'exaggerated cute expressions, big sparkly eyes',
  },
  {
    id: 'realistic-anime',
    name: 'Anime Character',
    emoji: '✨',
    description: 'Standard anime proportions',
    artDirection: 'Standard anime/manga proportions. Detailed eyes with highlights, dynamic pose capable.',
    proportions: 'standard anime 6-7 head tall',
    expressionStyle: 'expressive but proportional, detailed eyes',
  },
  {
    id: 'mascot-cute',
    name: 'Mascot',
    emoji: '🐾',
    description: 'Animal or creature mascot',
    artDirection: 'Cute mascot character - could be animal, creature, or fantasy being. Kawaii aesthetic.',
    proportions: 'round, simplified, approachable',
    expressionStyle: 'friendly, simple, iconic expressions',
  },
];

/**
 * Generate a typography poster from note text
 */
export async function generateTypographyPoster(
  analysis: TextAnalysis,
  style: TypographyPosterStyle,
  noteTitle: string,
  noteContent: string
): Promise<TypographyImageResponse> {
  devLog(`✍️ Generating ${style} typography poster...`);

  const response = await fetch(TYPOGRAPHY_POSTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysis,
      style,
      noteTitle,
      noteContent,
    }),
  });

  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Typography generation failed: ${response.status}`);
  }

  const data: TypographyImageResponse = await response.json();
  devLog(`✍️ Typography poster generated: ${style} style`);

  return data;
}

/**
 * Generate a character mascot from note text analysis
 */
export async function generateCharacterMascot(
  analysis: TextAnalysis,
  characterType: CharacterMascotType,
  noteTitle: string,
  noteContent: string
): Promise<CharacterMascotResponse> {
  devLog(`🧸 Generating ${characterType} character mascot...`);

  const response = await fetch(CHARACTER_MASCOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysis,
      characterType,
      noteTitle,
      noteContent,
    }),
  });

  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Character generation failed: ${response.status}`);
  }

  const data: CharacterMascotResponse = await response.json();
  devLog(`🧸 Character mascot generated: ${characterType} style`);

  return data;
}

/**
 * Save typography poster to local storage
 * Returns the local URI of the saved image
 */
export async function saveTypographyPoster(
  posterData: TypographyImageResponse
): Promise<string> {
  const posterId = Crypto.randomUUID();
  const extension = posterData.mimeType === 'image/png' ? 'png' : 'jpg';
  const posterPath = `${LegacyFileSystem.documentDirectory}typography/${posterId}.${extension}`;

  // Ensure typography directory exists
  const typographyDir = `${LegacyFileSystem.documentDirectory}typography`;
  const dirInfo = await LegacyFileSystem.getInfoAsync(typographyDir);
  if (!dirInfo.exists) {
    await LegacyFileSystem.makeDirectoryAsync(typographyDir, { intermediates: true });
  }

  // Write the poster image
  await LegacyFileSystem.writeAsStringAsync(posterPath, posterData.imageBase64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });

  devLog('✍️ Typography poster saved to:', posterPath);
  return posterPath;
}

/**
 * Save character mascot to local storage
 * Returns the local URI of the saved image
 */
export async function saveCharacterMascot(
  mascotData: CharacterMascotResponse
): Promise<string> {
  const mascotId = Crypto.randomUUID();
  const extension = mascotData.mimeType === 'image/png' ? 'png' : 'jpg';
  const mascotPath = `${LegacyFileSystem.documentDirectory}mascots/${mascotId}.${extension}`;

  // Ensure mascots directory exists
  const mascotsDir = `${LegacyFileSystem.documentDirectory}mascots`;
  const dirInfo = await LegacyFileSystem.getInfoAsync(mascotsDir);
  if (!dirInfo.exists) {
    await LegacyFileSystem.makeDirectoryAsync(mascotsDir, { intermediates: true });
  }

  // Write the mascot image
  await LegacyFileSystem.writeAsStringAsync(mascotPath, mascotData.imageBase64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });

  devLog('🧸 Character mascot saved to:', mascotPath);
  return mascotPath;
}

// ============================================
// Image-Only Design Generation
// ============================================

const IMAGE_STICKER_API_URL = `${API_BASE_URL}/api/generate-image-sticker`;

/**
 * Generate a character sticker from an image (background removal)
 * Returns the URI of the saved sticker image, or null if failed
 */
export async function generateStickerFromImage(imageUri: string): Promise<string | null> {
  devLog('🎨 Generating sticker from image...');

  // Convert image to base64
  const { base64, mimeType } = await imageUriToBase64(imageUri);

  try {
    devLog('🔄 Calling sticker API at:', IMAGE_STICKER_API_URL);
    const stickerResponse = await fetch(IMAGE_STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType: mimeType,
      }),
    });

    devLog('📡 Sticker API response status:', stickerResponse.status);

    if (stickerResponse.ok) {
      const stickerData = await stickerResponse.json();
      devLog('📦 Sticker data received, has stickerBase64:', !!stickerData.stickerBase64);

      if (stickerData.stickerBase64) {
        // Save sticker to local storage
        const stickerUri = await saveStickerImage(stickerData.stickerBase64, stickerData.mimeType || 'image/png');
        devLog('✅ Sticker generated and saved:', stickerUri);
        return stickerUri;
      } else {
        devWarn('⚠️ API returned OK but no stickerBase64 in response');
        return null;
      }
    } else {
      const errorText = await stickerResponse.text();
      devWarn('❌ Sticker generation failed:', stickerResponse.status, errorText);
      return null;
    }
  } catch (error) {
    devWarn('❌ Sticker generation error:', error);
    return null;
  }
}

/**
 * Generate a design from just an image
 * Creates a character sticker and uses the image as background
 */
export async function generateImageDesign(imageUri: string): Promise<NoteDesign> {
  devLog('🎨 Generating design from image...');

  // Convert image to base64
  const { base64, mimeType } = await imageUriToBase64(imageUri);

  // Generate character sticker from the image
  let stickerUri: string | undefined;

  try {
    devLog('🔄 Calling sticker API at:', IMAGE_STICKER_API_URL);
    const stickerResponse = await fetch(IMAGE_STICKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
        mimeType: mimeType,
      }),
    });

    devLog('📡 Sticker API response status:', stickerResponse.status);

    if (stickerResponse.ok) {
      const stickerData = await stickerResponse.json();
      devLog('📦 Sticker data received, has stickerBase64:', !!stickerData.stickerBase64);

      if (stickerData.stickerBase64) {
        // Save sticker to local storage
        stickerUri = await saveStickerImage(stickerData.stickerBase64, stickerData.mimeType || 'image/png');
        devLog('✅ Sticker generated and saved:', stickerUri);
      } else {
        devWarn('⚠️ API returned OK but no stickerBase64 in response');
      }
    } else {
      const errorText = await stickerResponse.text();
      devWarn('❌ Sticker generation failed:', stickerResponse.status, errorText);
    }
  } catch (error) {
    devWarn('❌ Sticker generation error:', error);
  }

  // Create a design with neutral colors + image background
  const design: NoteDesign = {
    id: Crypto.randomUUID(),
    name: 'Custom Design',
    sourceImageUri: imageUri,
    createdAt: Date.now(),

    background: {
      primaryColor: '#FFFFFF',
      style: 'image',
      imageUri: imageUri,
      opacity: 0.2,
    },

    colors: {
      titleText: '#1F2937',
      bodyText: '#4B5563',
      accent: '#7C3AED',
    },

    typography: {
      titleStyle: 'sans-serif',
      vibe: 'modern',
    },

    sticker: {
      id: Crypto.randomUUID(),
      imageUri: stickerUri || '',
      description: 'Character from uploaded image',
      suggestedPosition: 'bottom-right',
      scale: 'medium',
    },

    designSummary: 'Custom design generated from uploaded image',
  };

  devLog('🎨 Design created:', {
    id: design.id,
    hasSticker: !!design.sticker?.imageUri,
    stickerUri: design.sticker?.imageUri,
  });

  return design;
}

/**
 * Helper to save sticker image to local storage
 */
async function saveStickerImage(base64: string, mimeType: string): Promise<string> {
  const stickerId = Crypto.randomUUID();
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const stickerPath = `${LegacyFileSystem.documentDirectory}stickers/${stickerId}.${extension}`;

  // Ensure stickers directory exists
  const stickersDir = `${LegacyFileSystem.documentDirectory}stickers`;
  const dirInfo = await LegacyFileSystem.getInfoAsync(stickersDir);
  if (!dirInfo.exists) {
    await LegacyFileSystem.makeDirectoryAsync(stickersDir, { intermediates: true });
  }

  // Write the sticker image
  await LegacyFileSystem.writeAsStringAsync(stickerPath, base64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });

  return stickerPath;
}
