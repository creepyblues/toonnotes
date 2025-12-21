import { File, Paths } from 'expo-file-system/next';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { NoteDesign, BorderTemplate, BorderThickness, DesignTheme, TextAnalysis, StoryStyleDesignResponse, WebtoonStylePreset, WebtoonSketchResponse, WebtoonStyleConfig } from '@/types';
import { themeToNoteDesign } from './designEngine';

// API endpoints - localhost works for iOS simulator (shares host network)
// Change these to your Vercel deployment URL for production
const API_BASE_URL = 'http://localhost:3001';
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
    border: string;
  };
  styles: {
    borderStyle: string;
    borderWidth: string;
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
 */
async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  try {
    console.log('Reading image from URI:', uri);

    // Check if file exists using new File API
    const file = new File(uri);
    if (!file.exists) {
      throw new Error('Image file does not exist');
    }
    console.log('File exists:', file.exists);

    // Read file as base64 using the new File API
    const base64 = await file.base64();

    console.log('Base64 length:', base64.length);

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
    console.log('MIME type:', mimeType);

    return { base64, mimeType };
  } catch (error) {
    console.error('Failed to read image:', error);
    throw new Error(`Failed to read image file: ${error}`);
  }
}

/**
 * Map API border style to our BorderTemplate type
 */
function mapBorderTemplate(style: string): BorderTemplate {
  const styleMap: Record<string, BorderTemplate> = {
    solid: 'webtoon',
    dashed: 'sketch',
    dotted: 'pop',
    double: 'panel',
  };
  return styleMap[style] || 'webtoon';
}

/**
 * Map border width string to BorderThickness
 */
function mapBorderThickness(width: string): BorderThickness {
  const px = parseInt(width) || 2;
  if (px <= 1) return 'thin';
  if (px <= 3) return 'medium';
  return 'thick';
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
    console.log('Generating sticker with background removal...');

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

    const data = await response.json();

    if (data.error) {
      console.error('Sticker generation error:', data.error);
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

    console.log('Sticker saved to:', stickerPath);
    console.log('Fallback used:', data.fallback);

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
      console.log(`Attempting API call (${attempt + 1}/${MAX_RETRIES})...`);

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
          console.log(`Rate limited. Retrying in ${retryAfter}s...`);
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

      const themeData: ThemeResponse = await response.json();
      console.log('Received theme:', themeData);

      // Generate sticker with background removal (runs in parallel conceptually, but after theme)
      console.log('Generating sticker with background removal...');
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
          border: themeData.colors.border,
        },
        border: {
          template: mapBorderTemplate(themeData.styles.borderStyle),
          thickness: mapBorderThickness(themeData.styles.borderWidth),
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
          throw new Error('Cannot connect to design server. Make sure the local API server is running on port 3001.');
        }
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

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
    console.log('🎲 Generating lucky transformed sticker...');

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

    const data = await response.json();

    if (data.error) {
      console.error('Lucky sticker generation error:', data.error);
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

    console.log('🎲 Lucky sticker saved to:', stickerPath);
    console.log('Transformed:', data.transformed);

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
      console.log(`🎲 Attempting Lucky API call (${attempt + 1}/${MAX_RETRIES})...`);

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
          console.log(`Rate limited. Retrying in ${retryAfter}s...`);
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

      const themeData: LuckyThemeResponse = await response.json();
      console.log('🎲 Received lucky theme:', themeData);

      // Generate transformed sticker
      console.log('🎲 Generating transformed sticker...');
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
          border: themeData.colors.border,
        },
        border: {
          template: mapBorderTemplate(themeData.styles.borderStyle),
          thickness: mapBorderThickness(themeData.styles.borderWidth),
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
          throw new Error('Cannot connect to design server. Make sure the local API server is running on port 3001.');
        }
      }

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Failed to generate lucky design after retries');
}

// ============================================
// Theme-Based Design Generation
// ============================================

const THEMED_STICKER_API_URL = `${API_BASE_URL}/api/generate-themed-sticker`;
const ANALYZE_TEXT_API_URL = `${API_BASE_URL}/api/analyze-note-text`;
const STORY_STYLE_API_URL = `${API_BASE_URL}/api/generate-story-style`;

/**
 * Generate a sticker based on theme style hints
 */
async function generateThemedSticker(
  theme: DesignTheme,
  imageBase64?: string,
  mimeType?: string
): Promise<string | null> {
  try {
    console.log(`Generating ${theme.name} themed sticker...`);

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

    console.log(`${theme.name} sticker saved to:`, stickerPath);
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
            console.log('Color overrides from image:', colorOverrides);
          }
        }
      } catch (e) {
        // Color extraction is optional, continue without it
        console.log('Color extraction skipped:', e);
      }
    } catch (error) {
      console.warn('Could not process image, using default theme colors:', error);
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
// Story Style - AI Text Analysis to Design
// ============================================

/**
 * Stage 1: Analyze note text for context, keywords, mood
 */
export async function analyzeNoteText(
  title: string,
  content: string
): Promise<TextAnalysis> {
  console.log('✨ Analyzing note text...');

  const response = await fetch(ANALYZE_TEXT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
    }),
  });

  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed: ${response.status}`);
  }

  const analysisData: TextAnalysis = await response.json();
  console.log('✨ Analysis complete:', analysisData.mood.primary, analysisData.suggestedStyle.aesthetic);

  return analysisData;
}

/**
 * Stage 2: Generate design from text analysis
 */
export async function generateStoryStyleDesign(
  analysis: TextAnalysis,
  noteTitle: string
): Promise<StoryStyleDesignResponse> {
  console.log('🎨 Generating Story Style design...');

  const response = await fetch(STORY_STYLE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysis,
      noteTitle,
    }),
  });

  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Rate limit exceeded. Please wait ${errorData.retryAfter || 60} seconds.`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Design generation failed: ${response.status}`);
  }

  const designData: StoryStyleDesignResponse = await response.json();
  console.log('🎨 Design generated:', designData.name, designData.matchedTheme);

  return designData;
}

/**
 * Convert Story Style response to NoteDesign
 */
function storyStyleToNoteDesign(
  storyStyle: StoryStyleDesignResponse,
  analysis: TextAnalysis
): NoteDesign {
  // Map box shadow to border thickness
  const thicknessMap: Record<string, BorderThickness> = {
    none: 'thin',
    subtle: 'thin',
    medium: 'medium',
    glow: 'thick',
  };

  // Map border style string to BorderTemplate
  const templateMap: Record<string, BorderTemplate> = {
    solid: 'webtoon',
    dashed: 'sketch',
    dotted: 'pop',
  };

  const borderRadius = parseInt(storyStyle.styles.borderRadius) || 12;
  const borderWidth = parseInt(storyStyle.styles.borderWidth) || 2;

  return {
    id: Crypto.randomUUID(),
    name: storyStyle.name,
    sourceImageUri: '',
    createdAt: Date.now(),
    background: {
      primaryColor: storyStyle.colors.background,
      secondaryColor: storyStyle.colors.accent,
      style: 'solid',
    },
    colors: {
      titleText: storyStyle.colors.text,
      bodyText: storyStyle.colors.text,
      accent: storyStyle.colors.accent,
      border: storyStyle.colors.border,
    },
    border: {
      template: templateMap[storyStyle.styles.borderStyle] || 'webtoon',
      thickness: thicknessMap[storyStyle.styles.boxShadow] || 'medium',
    },
    typography: {
      titleStyle: 'sans-serif',
      vibe: 'modern',
    },
    sticker: {
      id: Crypto.randomUUID(),
      imageUri: '',
      description: `Story Style: ${storyStyle.designRationale}`,
      suggestedPosition: 'bottom-right',
      scale: 'medium',
    },
    designSummary: `✨ "${storyStyle.name}" - ${storyStyle.designRationale}`,
  };
}

/**
 * Combined: Full Story Style flow
 * Analyzes note text and generates a matching design
 */
export async function createStoryStyle(
  title: string,
  content: string
): Promise<{
  analysis: TextAnalysis;
  design: NoteDesign;
}> {
  // Stage 1: Analyze text
  const analysis = await analyzeNoteText(title, content);

  // Stage 2: Generate design from analysis
  const storyStyleResponse = await generateStoryStyleDesign(analysis, title);

  // Convert to NoteDesign
  const design = storyStyleToNoteDesign(storyStyleResponse, analysis);

  return {
    analysis,
    design,
  };
}

// ============================================
// Webtoon Artist - AI Sketch Generation
// ============================================

const WEBTOON_SKETCH_API_URL = `${API_BASE_URL}/api/generate-webtoon-sketch`;

// Webtoon style preset configurations
export const WEBTOON_STYLES: WebtoonStyleConfig[] = [
  {
    id: 'shonen',
    name: 'Shonen',
    emoji: '💥',
    description: 'Bold, dynamic, action-packed',
    artDirection: 'Bold dynamic lines, action-oriented composition, intense expressions',
    lineStyle: 'thick bold strokes, high contrast',
    mood: 'energetic, determined, powerful',
    examples: ['One Piece', 'Naruto', 'My Hero Academia'],
  },
  {
    id: 'shoujo',
    name: 'Shoujo',
    emoji: '✿',
    description: 'Soft, elegant, emotional',
    artDirection: 'Soft flowing lines, delicate expressions, flowers and sparkles',
    lineStyle: 'thin elegant lines, soft shading',
    mood: 'emotional, dreamy, gentle',
    examples: ['Fruits Basket', 'Sailor Moon', 'Ouran'],
  },
  {
    id: 'simple',
    name: 'Simple',
    emoji: '◇',
    description: 'Clean, minimal, modern',
    artDirection: 'Clean minimalist lines, clear compositions, focused on clarity',
    lineStyle: 'clean simple lines, minimal detail',
    mood: 'clean, focused, modern',
    examples: ['Solo Leveling', 'Tower of God', 'Lore Olympus'],
  },
];

/**
 * Generate a webtoon storyboard sketch based on text analysis
 */
export async function generateWebtoonSketch(
  analysis: TextAnalysis,
  style: WebtoonStylePreset,
  noteTitle: string,
  noteContent: string
): Promise<WebtoonSketchResponse> {
  console.log(`🎨 Generating ${style} webtoon sketch...`);

  const response = await fetch(WEBTOON_SKETCH_API_URL, {
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
    throw new Error(errorData.error || `Sketch generation failed: ${response.status}`);
  }

  const sketchData: WebtoonSketchResponse = await response.json();
  console.log(`🎨 Sketch generated: ${style} style`);

  return sketchData;
}

/**
 * Save webtoon sketch to local storage
 * Returns the local URI of the saved image
 */
export async function saveWebtoonSketch(
  sketchData: WebtoonSketchResponse
): Promise<string> {
  const sketchId = Crypto.randomUUID();
  const extension = sketchData.mimeType === 'image/png' ? 'png' : 'jpg';
  const sketchPath = `${LegacyFileSystem.documentDirectory}sketches/${sketchId}.${extension}`;

  // Ensure sketches directory exists
  const sketchesDir = `${LegacyFileSystem.documentDirectory}sketches`;
  const dirInfo = await LegacyFileSystem.getInfoAsync(sketchesDir);
  if (!dirInfo.exists) {
    await LegacyFileSystem.makeDirectoryAsync(sketchesDir, { intermediates: true });
  }

  // Write the sketch image
  await LegacyFileSystem.writeAsStringAsync(sketchPath, sketchData.imageBase64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });

  console.log('🎨 Webtoon sketch saved to:', sketchPath);
  return sketchPath;
}
