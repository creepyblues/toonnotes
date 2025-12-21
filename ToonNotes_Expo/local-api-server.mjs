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
  } else if (req.method === 'POST' && req.url === '/api/analyze-note-text') {
    // Story Style - Stage 1: Analyze note text for context, keywords, mood
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { title, content } = JSON.parse(body);

        const noteText = `${title || ''}\n${content || ''}`.trim();

        if (!noteText || noteText.length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Note text is too short (minimum 10 characters)' }));
          return;
        }

        console.log('✨ Analyzing note text for Story Style...');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const analysisPrompt = `Analyze this note and extract structured information about its content, purpose, and emotional tone.

Title: ${title || '(no title)'}
Content: ${content || '(no content)'}

Return a JSON object with this exact structure:
{
  "context": {
    "purpose": "work|personal|creative|learning|journal",
    "type": "notes|todo|writing|planning|reflection|list|diary",
    "formality": "casual|professional|creative|intimate"
  },
  "keywords": {
    "topics": ["array of 2-4 main topics"],
    "category": "single primary category",
    "entities": ["specific names, dates, or key terms"]
  },
  "mood": {
    "primary": "focused|happy|sad|excited|calm|anxious|inspired|determined|grateful|nostalgic",
    "energy": "low|medium|high",
    "tone": "informational|emotional|motivational|reflective|humorous"
  },
  "suggestedStyle": {
    "aesthetic": "modern-minimal|playful|dramatic|dreamy|retro|bold|elegant|quirky",
    "colorMood": "warm-cozy|cool-professional|vibrant-energetic|soft-calm|dark-moody|pastel-gentle",
    "intensity": "subtle|moderate|bold"
  }
}

Be thoughtful about the mood and style suggestions. Match them to how the content FEELS, not just what it says.
Return ONLY the JSON object.`;

        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('✨ Text analysis response:', text);

        const analysisData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysisData));

      } catch (error) {
        console.error('Error analyzing note text:', error);

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
  } else if (req.method === 'POST' && req.url === '/api/generate-story-style') {
    // Story Style - Stage 2: Generate design from text analysis
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { analysis, noteTitle } = JSON.parse(body);

        if (!analysis) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'analysis is required' }));
          return;
        }

        console.log('🎨 Generating Story Style design from analysis...');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const designPrompt = `Create a note design based on this content analysis:

Context: ${analysis.context.purpose} - ${analysis.context.type}
Formality: ${analysis.context.formality}
Mood: ${analysis.mood.primary} (${analysis.mood.energy} energy, ${analysis.mood.tone} tone)
Topics: ${analysis.keywords.topics.join(', ')}
Category: ${analysis.keywords.category}
Suggested Style: ${analysis.suggestedStyle.aesthetic}, ${analysis.suggestedStyle.colorMood}
Intensity: ${analysis.suggestedStyle.intensity}

Design a toon-ish, anime-inspired note theme that matches this content's mood and purpose.

Rules:
- For "work/professional" → Clean lines, cool colors (blues, grays), minimal decorations
- For "personal/journal" → Warm colors (peach, cream, soft yellows), softer edges, cozy feel
- For "creative/writing" → Expressive colors, artistic borders, dreamy vibes
- For "high energy/excited" → Vibrant saturated colors, bold borders, dynamic feel
- For "calm/reflective" → Muted pastels, soft shadows, gentle aesthetic
- For "learning" → Clear, organized feel with accent pops for focus
- Keep it toon-ish and fun - this is ToonNotes!

Return JSON:
{
  "name": "Creative 2-3 word theme name that captures the vibe",
  "colors": {
    "background": "#HEX (light, readable background)",
    "text": "#HEX (dark, readable text)",
    "accent": "#HEX (vibrant accent for highlights)",
    "border": "#HEX (subtle but visible border)"
  },
  "styles": {
    "borderStyle": "solid|dashed|dotted",
    "borderWidth": "1px|2px|3px",
    "borderRadius": "8px|12px|16px|20px",
    "boxShadow": "none|subtle|medium|glow"
  },
  "matchedTheme": "ghibli|manga|webtoon|shoujo|shonen|kawaii|vintage",
  "designRationale": "Brief explanation of design choices (1-2 sentences)"
}

Return ONLY the JSON object.`;

        const result = await model.generateContent(designPrompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('🎨 Story Style design response:', text);

        const designData = JSON.parse(text);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(designData));

      } catch (error) {
        console.error('Error generating story style design:', error);

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
  } else if (req.method === 'POST' && req.url === '/api/generate-webtoon-sketch') {
    // Webtoon Artist - Generate storyboard sketch from text analysis
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { analysis, style, noteTitle, noteContent } = JSON.parse(body);

        if (!analysis || !style) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'analysis and style are required' }));
          return;
        }

        console.log(`🎨 Webtoon Artist: Generating ${style} style sketch...`);

        // Style-specific art directions
        const styleConfigs = {
          shonen: {
            name: 'Shonen',
            artDirection: 'Bold dynamic lines, action-oriented composition, intense expressions, speed lines, dramatic angles. Think One Piece, Naruto, My Hero Academia style rough storyboards.',
            lineStyle: 'thick bold strokes, high contrast, dynamic poses',
            mood: 'energetic, determined, powerful'
          },
          shoujo: {
            name: 'Shoujo',
            artDirection: 'Soft flowing lines, delicate expressions, flowers and sparkles as accents, romantic atmosphere, gentle compositions. Think Fruits Basket, Sailor Moon, Ouran style rough storyboards.',
            lineStyle: 'thin elegant lines, soft shading, decorative elements',
            mood: 'emotional, dreamy, gentle'
          },
          simple: {
            name: 'Simple',
            artDirection: 'Clean minimalist lines, clear compositions, focused on clarity over detail, modern webtoon style. Think Solo Leveling, Tower of God, Lore Olympus style rough storyboards.',
            lineStyle: 'clean simple lines, minimal detail, clear silhouettes',
            mood: 'clean, focused, modern'
          }
        };

        const styleConfig = styleConfigs[style] || styleConfigs.simple;

        // Use Gemini 2.0 Flash for image generation
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['image', 'text'],
          }
        });

        const imagePrompt = `Create a webtoon storyboard rough sketch that represents this note:

TITLE: ${noteTitle || 'Untitled'}
CONTENT SUMMARY: ${noteContent?.slice(0, 200) || 'No content'}

ANALYSIS:
- Purpose: ${analysis.context.purpose}
- Type: ${analysis.context.type}
- Mood: ${analysis.mood.primary} (${analysis.mood.energy} energy)
- Topics: ${analysis.keywords.topics.join(', ')}
- Aesthetic: ${analysis.suggestedStyle.aesthetic}

ART STYLE: ${styleConfig.name}
- ${styleConfig.artDirection}
- Line style: ${styleConfig.lineStyle}
- Mood: ${styleConfig.mood}

REQUIREMENTS:
1. Create a single panel rough storyboard sketch (not manga pages)
2. Black and white sketch with hatching/shading
3. Include a simple character or scene that represents the note's content
4. Add minimal text/labels if helpful (like "WORK!" or "IDEA")
5. Keep it rough and sketchy like a storyboard artist's quick concept
6. The style should clearly match ${styleConfig.name} aesthetic

Draw this as if you're a webtoon storyboard artist quickly sketching an idea.`;

        const result = await model.generateContent(imagePrompt);
        const response = await result.response;

        // Extract image and text from response
        let imageBase64 = null;
        let sceneDescription = '';
        let artistNotes = '';

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageBase64 = part.inlineData.data;
          } else if (part.text) {
            // Parse out scene description and notes
            const text = part.text;
            if (text.includes('Scene:') || text.includes('Description:')) {
              sceneDescription = text;
            } else {
              artistNotes = text;
            }
          }
        }

        if (!imageBase64) {
          throw new Error('No image generated');
        }

        console.log(`🎨 Webtoon Artist: ${styleConfig.name} sketch generated!`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          imageBase64,
          mimeType: 'image/png',
          style,
          sceneDescription: sceneDescription || `A ${styleConfig.name} style sketch representing "${noteTitle || 'your note'}"`,
          artistNotes: artistNotes || `Created in ${styleConfig.name} style with ${styleConfig.lineStyle}`
        }));

      } catch (error) {
        console.error('Webtoon Artist error:', error);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message || 'Failed to generate sketch' }));
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
  console.log('  POST /api/generate-lucky-theme - 🎲 Generate chaotic random theme');
  console.log('  POST /api/generate-lucky-sticker - 🎲 Generate transformed funny sticker');
  console.log('  POST /api/generate-themed-sticker - 🎨 Generate sticker for specific theme');
  console.log('  POST /api/extract-colors - 🎨 Extract colors from image for theme');
  console.log('  POST /api/analyze-note-text - ✨ Story Style: Analyze note text');
  console.log('  POST /api/generate-story-style - ✨ Story Style: Generate design from analysis');
  console.log('  POST /api/generate-webtoon-sketch - 🎨 Webtoon Artist: Generate storyboard sketch');
});
