import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { removeBackground } from '@imgly/background-removal-node';

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is required');
  console.error('Create a .env file with: GEMINI_API_KEY=your_key');
  console.error('Or run with: GEMINI_API_KEY=your_key npm run api');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper to save base64 image to file
function saveBase64Image(base64Data, filename) {
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = path.join(__dirname, 'temp', filename);

  // Ensure temp directory exists
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-theme') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageData, mimeType } = JSON.parse(body);

        if (!imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageData is required' }));
          return;
        }

        console.log('Generating theme from image...');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Analyze this image and create a note theme based on its visual style and colors.

Return a JSON object with this exact structure:
{
  "name": "A creative 2-3 word theme name",
  "colors": {
    "background": "#HEXCOLOR for note background",
    "text": "#HEXCOLOR for text",
    "accent": "#HEXCOLOR for accents/highlights",
    "border": "#HEXCOLOR for borders"
  },
  "styles": {
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": "1px|2px|3px",
    "borderRadius": "8px|12px|16px",
    "boxShadow": "subtle|medium|strong|none",
    "backgroundGradient": "none|subtle|medium"
  }
}

Extract colors directly from the image. Make the theme feel cohesive and inspired by the image's mood and aesthetic.
Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageData
            }
          }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('Gemini response:', text);

        const themeData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(themeData));

      } catch (error) {
        console.error('Error generating theme:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-lucky-theme') {
    // "Feeling Lucky" - Chaotic random theme generation
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageData, mimeType } = JSON.parse(body);

        if (!imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageData is required' }));
          return;
        }

        console.log('🎲 Generating LUCKY theme from image...');

        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            temperature: 1.8, // High temperature for maximum randomness
            topK: 40,
            topP: 0.95,
          }
        });

        const luckyPrompt = `You are a CHAOTIC design generator. Look at this image and create the most unexpected, quirky, FUNNY note theme.

Rules:
- Pick a RANDOM aesthetic: vaporwave, deep-fried meme, cottagecore, dark academia, Y2K, brutalist, maximalist, ugly-chic, liminal space, fever dream, goblin mode, unhinged energy
- Give it a FUNNY 2-4 word name that sounds ABSURD and MEMORABLE
  Examples: "Goblin Mode Academia", "Unhinged Sunset", "Passive Aggressive Pastels", "Existential Sparkles", "Chaotic Cottagecore", "Dramatic Potato Energy", "Cursed Kawaii", "Feral Minimalism"
- Colors should be BOLD and unexpected - don't play it safe! Clash them if it's funny
- Border style should match the chaos
- The vibe should make people laugh or go "what??"

Return a JSON object with this exact structure:
{
  "name": "Funny absurd theme name",
  "vibe": "chaotic|unhinged|dramatic|cursed|blessed|feral|chaotic",
  "colors": {
    "background": "#HEXCOLOR",
    "text": "#HEXCOLOR",
    "accent": "#HEXCOLOR",
    "border": "#HEXCOLOR"
  },
  "styles": {
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": "1px|2px|3px|4px|5px",
    "borderRadius": "0px|4px|8px|16px|24px|50px",
    "boxShadow": "subtle|medium|strong|extreme|none",
    "backgroundGradient": "none|subtle|medium|intense"
  }
}

BE WEIRD. BE BOLD. MAKE IT MEMORABLE AND SHAREABLE.
Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent([
          luckyPrompt,
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageData
            }
          }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('🎲 Lucky theme response:', text);

        const themeData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(themeData));

      } catch (error) {
        console.error('Error generating lucky theme:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-lucky-sticker') {
    // "Feeling Lucky" - Just use background removal (Gemini can't do transparent images)
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageData, mimeType } = JSON.parse(body);

        if (!imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageData is required' }));
          return;
        }

        console.log('🎲 Generating LUCKY sticker with background removal...');

        // Use background removal to create transparent sticker
        const imageBuffer = Buffer.from(imageData, 'base64');
        const blob = new Blob([imageBuffer], { type: mimeType || 'image/jpeg' });

        const resultBlob = await removeBackground(blob, {
          debug: false,
          progress: (key, current, total) => {
            console.log(`🎲 Background removal: ${key} ${Math.round(current/total*100)}%`);
          }
        });

        const arrayBuffer = await resultBlob.arrayBuffer();
        const resultBuffer = Buffer.from(arrayBuffer);
        const stickerBase64 = resultBuffer.toString('base64');

        console.log('🎲 Lucky sticker created with transparent background!');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          stickerData: stickerBase64,
          mimeType: 'image/png',
          transformed: true
        }));

      } catch (error) {
        console.error('Error generating lucky sticker:', error);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: error.message || 'Failed to generate lucky sticker',
          fallback: true
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-themed-sticker') {
    // Generate sticker that matches a specific theme's art style
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { themeId, themeName, artStyle, mood, aiPromptHints, imageData, mimeType } = JSON.parse(body);

        console.log(`🎨 Generating ${themeName} themed sticker...`);

        // If we have image data, use background removal to create the sticker
        if (imageData) {
          console.log('Using provided image with background removal...');

          const imageBuffer = Buffer.from(imageData, 'base64');
          const blob = new Blob([imageBuffer], { type: mimeType || 'image/jpeg' });

          const resultBlob = await removeBackground(blob, {
            debug: false,
            progress: (key, current, total) => {
              console.log(`🎨 ${themeName} sticker: ${key} ${Math.round(current/total*100)}%`);
            }
          });

          const arrayBuffer = await resultBlob.arrayBuffer();
          const resultBuffer = Buffer.from(arrayBuffer);
          const stickerBase64 = resultBuffer.toString('base64');

          console.log(`🎨 ${themeName} themed sticker created!`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            stickerData: stickerBase64,
            mimeType: 'image/png',
            themeId: themeId,
            artStyleApplied: artStyle
          }));
        } else {
          // No image provided - return info about what sticker style would be used
          console.log('No image provided, returning theme sticker hints...');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            themeId: themeId,
            artStyle: artStyle,
            mood: mood,
            hints: aiPromptHints,
            message: 'No image provided - use these hints for sticker generation'
          }));
        }

      } catch (error) {
        console.error('Error generating themed sticker:', error);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: error.message || 'Failed to generate themed sticker',
          fallback: true
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/extract-colors') {
    // Extract colors from image that harmonize with a theme
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageData, mimeType, themeId, baseColors } = JSON.parse(body);

        if (!imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageData is required' }));
          return;
        }

        console.log(`🎨 Extracting colors for ${themeId} theme...`);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Analyze this image and extract colors that would harmonize with the following base theme colors:

Base Theme Colors:
- Background: ${baseColors?.background || '#FFFFFF'}
- Title: ${baseColors?.title || '#000000'}
- Body: ${baseColors?.body || '#333333'}
- Accent: ${baseColors?.accent || '#0ea5e9'}
- Border: ${baseColors?.border || '#E5E7EB'}

Theme ID: ${themeId}

Extract colors from the image that:
1. Complement or enhance the base theme colors
2. Maintain readability (good contrast between background and text)
3. Feel cohesive with the theme's aesthetic

Return a JSON object with ONLY the colors you want to override (don't include colors that should stay the same):
{
  "colors": {
    "background": "#HEXCOLOR (optional)",
    "title": "#HEXCOLOR (optional)",
    "body": "#HEXCOLOR (optional)",
    "accent": "#HEXCOLOR (optional)",
    "border": "#HEXCOLOR (optional)"
  }
}

Only include colors that you're confident would improve the theme based on the image.
Return ONLY the JSON object, no other text.`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageData
            }
          }
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('🎨 Color extraction response:', text);

        const colorData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(colorData));

      } catch (error) {
        console.error('Error extracting colors:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-sticker') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageData, mimeType } = JSON.parse(body);

        if (!imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageData is required' }));
          return;
        }

        console.log('Removing background from image...');

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Create a Blob from the buffer
        const blob = new Blob([imageBuffer], { type: mimeType || 'image/jpeg' });

        // Remove background using @imgly/background-removal-node
        console.log('Processing with background removal AI...');
        const resultBlob = await removeBackground(blob, {
          debug: false,
          progress: (key, current, total) => {
            console.log(`Background removal: ${key} ${Math.round(current/total*100)}%`);
          }
        });

        // Convert result blob to base64
        const arrayBuffer = await resultBlob.arrayBuffer();
        const resultBuffer = Buffer.from(arrayBuffer);
        const stickerBase64 = resultBuffer.toString('base64');

        console.log('Background removed successfully');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          stickerData: stickerBase64,
          mimeType: 'image/png',
          fallback: false
        }));

      } catch (error) {
        console.error('Error removing background:', error);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: error.message || 'Failed to remove background',
          fallback: true
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-image-sticker') {
    // Generate character sticker from uploaded image (removes background)
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { imageBase64, mimeType } = JSON.parse(body);

        if (!imageBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'imageBase64 is required' }));
          return;
        }

        console.log('🎨 Generating character sticker from image...');

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(imageBase64, 'base64');

        // Create a Blob from the buffer
        const blob = new Blob([imageBuffer], { type: mimeType || 'image/jpeg' });

        // Remove background using @imgly/background-removal-node
        console.log('Processing with background removal AI...');
        const resultBlob = await removeBackground(blob, {
          debug: false,
          progress: (key, current, total) => {
            console.log(`Background removal: ${key} ${Math.round(current/total*100)}%`);
          }
        });

        // Convert result blob to base64
        const arrayBuffer = await resultBlob.arrayBuffer();
        const resultBuffer = Buffer.from(arrayBuffer);
        const stickerBase64 = resultBuffer.toString('base64');

        console.log('✅ Character sticker generated successfully');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          stickerBase64: stickerBase64,
          mimeType: 'image/png',
        }));

      } catch (error) {
        console.error('Error generating sticker:', error);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: error.message || 'Failed to generate sticker',
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-board-design') {
    // Board Design - Generate visual design for a board based on hashtag and notes
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { hashtag, noteContent, userHint } = JSON.parse(body);

        if (!hashtag) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'hashtag is required' }));
          return;
        }

        console.log(`🎨 Generating board design for #${hashtag}...`);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const boardPrompt = `Design a visual theme for a board (collection of notes) in a manga/anime note-taking app.

BOARD HASHTAG: #${hashtag}

NOTES IN THIS BOARD:
${noteContent && noteContent.length > 0 ? noteContent.join('\n') : '(No notes yet)'}

${userHint ? `USER'S STYLE PREFERENCE: ${userHint}` : ''}

Create a cohesive board design that:
1. Reflects the theme suggested by the hashtag "#${hashtag}"
2. Matches the mood and content of the notes (if provided)
3. Appeals to manga/anime fans
4. Works well for a corkboard-style display

Consider these anime aesthetics:
- Shonen (bold, energetic, action-packed)
- Shoujo (soft, romantic, sparkly)
- Slice of Life (cozy, warm, gentle)
- Dark Fantasy (moody, mysterious, gothic)
- Kawaii (cute, pastel, playful)
- Cyberpunk (neon, techy, futuristic)
- Vintage Anime (retro 80s/90s aesthetic)

Return a JSON object with this exact structure:
{
  "name": "Creative 2-4 word board name (e.g., 'Starlit Inspiration Board', 'Shonen Dream Collection')",
  "header": {
    "background_color": "#HEX (header background)",
    "text_color": "#HEX (hashtag text)",
    "badge_color": "#HEX (note count badge background)",
    "badge_text_color": "#HEX (badge text)",
    "accent_color": "#HEX (decorative accents)"
  },
  "corkboard": {
    "background_color": "#HEX (main board area background)",
    "texture_id": "corkboard|paper|fabric|wood|null",
    "texture_opacity": 0.1 to 0.8,
    "border_color": "#HEX (bottom border)"
  },
  "decorations": {
    "icon": "lucide-icon-name or null (e.g., 'heart', 'star', 'zap', 'sparkles', 'book', 'music')",
    "icon_color": "#HEX or null",
    "accent_type": "sparkles|stars|hearts|flowers|none",
    "accent_color": "#HEX or null"
  },
  "design_summary": "1-2 sentence explanation of design choices",
  "source_keywords": ["3-5 keywords extracted from hashtag/notes"],
  "theme_inspiration": "shonen|shoujo|slice_of_life|dark_fantasy|kawaii|cyberpunk|vintage|minimal"
}

Make the design feel unique and tailored to this specific board.
Return ONLY the JSON object.`;

        const result = await model.generateContent(boardPrompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('🎨 Board design response:', text);

        const designData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(designData));

      } catch (error) {
        console.error('Error generating board design:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-typography-poster') {
    // Typography Poster - Generate hand-lettered/typographic art from note text
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        console.log('📝 Typography Poster request received:', JSON.stringify(parsed, null, 2));
        const { analysis, style, noteTitle, noteContent } = parsed;

        // Use noteTitle if available, otherwise use first part of noteContent
        const textToUse = noteTitle || (noteContent ? noteContent.slice(0, 100) : '');

        if (!analysis || !style || !textToUse) {
          console.log('❌ Missing fields - analysis:', !!analysis, 'style:', style, 'textToUse:', textToUse);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'analysis, style, and either noteTitle or noteContent are required' }));
          return;
        }

        console.log(`🎨 Typography Poster: Generating ${style} style typography for: "${textToUse.slice(0, 50)}..."`);

        // Style configurations for typography
        const styleConfigs = {
          'hand-lettered': {
            name: 'Hand-Lettered',
            artDirection: 'Hand-lettered calligraphy style with flowing, organic letters. Slight imperfections for authentic charm. Mix of thick and thin strokes like brush pen lettering.',
            fontVibe: 'flowing script with personality, organic curves',
            mood: 'personal, warm, artistic'
          },
          'brush-marker': {
            name: 'Brush/Marker',
            artDirection: 'Bold brush or marker strokes with varying thickness. Japanese/Chinese calligraphy influence. Expressive, dynamic, with ink-like texture.',
            fontVibe: 'expressive brushwork, dynamic strokes, varying pressure',
            mood: 'energetic, expressive, bold'
          },
          'designer': {
            name: 'Designer',
            artDirection: 'Professional hand-lettering design with mixed styles. Decorative flourishes, balanced composition. Like vintage sign painting meets modern typography art.',
            fontVibe: 'polished, decorative, multiple lettering styles combined',
            mood: 'crafted, professional, detailed'
          },
          'bold-modern': {
            name: 'Bold Modern',
            artDirection: 'Bold sans-serif inspired lettering, high impact poster style. Thick letters with strong presence. Maximalist, attention-grabbing typography.',
            fontVibe: 'thick bold letters, geometric, maximalist impact',
            mood: 'powerful, attention-grabbing, modern'
          }
        };

        const styleConfig = styleConfigs[style] || styleConfigs['hand-lettered'];

        // Use Gemini 2.0 Flash for image generation
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
          }
        });

        // Determine text to render (use title or content, limit length for better typography)
        const textToRender = textToUse.length <= 50
          ? textToUse
          : textToUse.slice(0, 50) + '...';

        const imagePrompt = `Create a beautiful typographic poster that renders this text as artistic hand-lettering:

TEXT TO RENDER: "${textToRender}"

NOTE ANALYSIS:
- Mood: ${analysis.mood.primary} (${analysis.mood.energy} energy)
- Tone: ${analysis.mood.tone}
- Purpose: ${analysis.context.purpose}
- Aesthetic: ${analysis.suggestedStyle.aesthetic}
- Color Mood: ${analysis.suggestedStyle.colorMood}

ART STYLE: ${styleConfig.name}
- ${styleConfig.artDirection}
- Font vibe: ${styleConfig.fontVibe}
- Mood: ${styleConfig.mood}

REQUIREMENTS:
1. The text must be READABLE and be the main visual element
2. Use ${styleConfig.name} lettering style throughout
3. Colors should complement the ${analysis.mood.primary} mood and ${analysis.suggestedStyle.colorMood} color palette
4. Simple, clean background (solid color or subtle gradient) - NOT busy
5. The typography IS the artwork - make each letter beautiful
6. Fill the frame well with the text composition
7. Style similar to motivational quote posters or hand-lettered signs
8. Add subtle decorative elements if appropriate (small flourishes, stars, hearts - based on mood)

Create this as if you're a professional hand-lettering artist making a poster print.
Output a high-quality image.`;

        const result = await model.generateContent(imagePrompt);
        const response = await result.response;

        let imageBase64 = null;
        let artistNotes = '';

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageBase64 = part.inlineData.data;
          } else if (part.text) {
            artistNotes = part.text;
          }
        }

        if (!imageBase64) {
          throw new Error('No image generated');
        }

        console.log(`🎨 Typography Poster: ${styleConfig.name} typography generated!`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageBase64,
          mimeType: 'image/png',
          style,
          renderedText: textToRender,
          artistNotes: artistNotes || `Created in ${styleConfig.name} style with ${styleConfig.fontVibe}`
        }));

      } catch (error) {
        console.error('Typography Poster error:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Failed to generate typography' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/generate-character-mascot') {
    // Character Mascot - Generate anime character appearing to present the text
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { analysis, characterType, noteTitle, noteContent } = JSON.parse(body);

        // Use noteTitle if available, otherwise use first part of noteContent
        const textToUse = noteTitle || (noteContent ? noteContent.slice(0, 100) : '');

        if (!analysis || !characterType || !textToUse) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'analysis, characterType, and either noteTitle or noteContent are required' }));
          return;
        }

        console.log(`🎨 Character Mascot: Generating ${characterType} character for: "${textToUse.slice(0, 30)}..."`);

        // Character type configurations
        const characterConfigs = {
          'chibi-anime': {
            name: 'Chibi Anime',
            artDirection: 'Chibi/super-deformed anime style. Large head with small body (2:1 or 3:1 ratio). Big expressive eyes, simplified features. Cute and adorable proportions.',
            proportions: 'chibi 2:1 head to body ratio, oversized head, tiny body',
            expressionStyle: 'exaggerated cute expressions, big sparkly eyes, simple mouth'
          },
          'realistic-anime': {
            name: 'Anime Character',
            artDirection: 'Standard anime/manga proportions. Detailed eyes with highlights, dynamic pose capable. Professional manga illustration quality.',
            proportions: 'standard anime 6-7 head tall, balanced proportions',
            expressionStyle: 'expressive but proportional, detailed eyes with emotion'
          },
          'mascot-cute': {
            name: 'Mascot',
            artDirection: 'Cute mascot character - could be animal, creature, or fantasy being. Kawaii aesthetic, round shapes, friendly appearance. Think brand mascots or game companions.',
            proportions: 'round, simplified, approachable silhouette, blob-like cuteness',
            expressionStyle: 'friendly, simple, iconic expressions, always happy/encouraging'
          }
        };

        const charConfig = characterConfigs[characterType] || characterConfigs['chibi-anime'];

        // Use Gemini 2.0 Flash for image generation
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
          }
        });

        // Determine character pose/action based on mood
        const moodToPose = {
          'happy': 'cheerfully waving or giving thumbs up',
          'excited': 'jumping with joy or pumping fist',
          'calm': 'peaceful smile, hands together',
          'focused': 'pointing forward determinedly',
          'sad': 'looking sympathetic with gentle expression',
          'motivated': 'striking an encouraging pose',
          'reflective': 'thoughtful pose with hand on chin',
          'energetic': 'dynamic action pose'
        };

        const pose = moodToPose[analysis.mood.primary] || 'cheerfully presenting';

        const imagePrompt = `Create an anime character that appears to be announcing or presenting a message:

MESSAGE CONTEXT:
- Title/Content: "${textToUse.slice(0, 50)}"
- Purpose: ${analysis.context.purpose}
- Topics: ${analysis.keywords.topics.join(', ')}

NOTE MOOD:
- Primary: ${analysis.mood.primary} (${analysis.mood.energy} energy)
- Tone: ${analysis.mood.tone}

CHARACTER STYLE: ${charConfig.name}
- ${charConfig.artDirection}
- Proportions: ${charConfig.proportions}
- Expression: ${charConfig.expressionStyle}

REQUIREMENTS:
1. Character should be ${pose} - matching the ${analysis.mood.primary} mood
2. The character appears to be presenting or announcing something (like they're sharing the note's message)
3. Pose ideas: holding a sign, speech bubble gesture, pointing enthusiastically, or announcing pose
4. Expression matches the content mood (${analysis.mood.primary}, ${analysis.mood.tone})
5. TRANSPARENT BACKGROUND (PNG with alpha channel)
6. Full body or 3/4 body shot (not just face)
7. Clean, crisp linework suitable for use as a sticker
8. Character should feel like they "belong" with the note's theme

Draw this as a professional anime illustrator creating a character sticker.
Make the character appealing and full of personality!`;

        const result = await model.generateContent(imagePrompt);
        const response = await result.response;

        let imageBase64 = null;
        let characterDescription = '';
        let artistNotes = '';

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageBase64 = part.inlineData.data;
          } else if (part.text) {
            const text = part.text;
            if (text.toLowerCase().includes('character') || text.toLowerCase().includes('drawing')) {
              characterDescription = text;
            } else {
              artistNotes = text;
            }
          }
        }

        if (!imageBase64) {
          throw new Error('No image generated');
        }

        console.log(`🎨 Character Mascot: ${charConfig.name} character generated!`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageBase64,
          mimeType: 'image/png',
          characterType,
          characterDescription: characterDescription || `A ${charConfig.name} style character`,
          poseDescription: `Character is ${pose}, expressing ${analysis.mood.primary} energy`,
          artistNotes: artistNotes || `Created in ${charConfig.name} style with ${charConfig.expressionStyle}`
        }));

      } catch (error) {
        console.error('Character Mascot error:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Failed to generate character' }));
        }
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/generate-theme - Generate theme from image');
  console.log('  POST /api/generate-sticker - Generate sticker with background removal');
  console.log('  POST /api/generate-image-sticker - 🎨 Generate character sticker from image');
  console.log('  POST /api/generate-lucky-theme - 🎲 Generate chaotic random theme');
  console.log('  POST /api/generate-lucky-sticker - 🎲 Generate transformed funny sticker');
  console.log('  POST /api/generate-themed-sticker - 🎨 Generate sticker for specific theme');
  console.log('  POST /api/extract-colors - 🎨 Extract colors from image for theme');
  console.log('  POST /api/generate-board-design - 🎨 Board Design: Generate design for board');
  console.log('  POST /api/generate-typography-poster - ✍️ Typography Poster: Generate hand-lettered text art');
  console.log('  POST /api/generate-character-mascot - 🧸 Character Mascot: Generate anime character presenter');
});
