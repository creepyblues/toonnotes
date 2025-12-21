/**
 * Generate tileable pattern PNG assets for ToonNotes
 * Run with: node scripts/generate-patterns.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../assets/patterns');
const SIZE = 64; // Small tile size for efficient bundling

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to save canvas as PNG
function savePattern(canvas, name) {
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(OUTPUT_DIR, `${name}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${name}.png`);
}

// 1. Small Dots
function createDotsSmall() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';

  const dotSize = 2;
  const spacing = 12;

  for (let x = spacing/2; x < SIZE; x += spacing) {
    for (let y = spacing/2; y < SIZE; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  savePattern(canvas, 'dots-small');
}

// 2. Large Dots
function createDotsLarge() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';

  const dotSize = 4;
  const spacing = 20;

  for (let x = spacing/2; x < SIZE; x += spacing) {
    for (let y = spacing/2; y < SIZE; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  savePattern(canvas, 'dots-large');
}

// 3. Horizontal Lines
function createLinesH() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  const spacing = 8;

  for (let y = spacing/2; y < SIZE; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SIZE, y);
    ctx.stroke();
  }

  savePattern(canvas, 'lines-h');
}

// 4. Diagonal Lines
function createLinesDiag() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  const spacing = 10;

  // Draw diagonal lines (45 degrees)
  for (let i = -SIZE; i < SIZE * 2; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + SIZE, SIZE);
    ctx.stroke();
  }

  savePattern(canvas, 'lines-diag');
}

// 5. Grid
function createGrid() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;

  const spacing = 16;

  // Horizontal lines
  for (let y = 0; y < SIZE; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SIZE, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x = 0; x < SIZE; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, SIZE);
    ctx.stroke();
  }

  savePattern(canvas, 'grid');
}

// 6. Subtle Paper Texture
function createPaperSubtle() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Create subtle noise
  const imageData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 30;
    imageData.data[i] = noise;     // R
    imageData.data[i + 1] = noise; // G
    imageData.data[i + 2] = noise; // B
    imageData.data[i + 3] = 30;    // A (low alpha for subtlety)
  }
  ctx.putImageData(imageData, 0, 0);

  savePattern(canvas, 'paper-subtle');
}

// 7. Rough Paper Texture
function createPaperRough() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Create more visible noise
  const imageData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 50;
    imageData.data[i] = noise;
    imageData.data[i + 1] = noise;
    imageData.data[i + 2] = noise;
    imageData.data[i + 3] = 50;
  }
  ctx.putImageData(imageData, 0, 0);

  savePattern(canvas, 'paper-rough');
}

// 8. Light Screentone (manga style)
function createScreentoneLight() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';

  const dotSize = 1.5;
  const spacing = 6;

  // Offset every other row for screentone effect
  for (let row = 0; row < SIZE / spacing; row++) {
    const offset = (row % 2) * (spacing / 2);
    for (let col = 0; col < SIZE / spacing + 1; col++) {
      ctx.beginPath();
      ctx.arc(col * spacing + offset, row * spacing, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  savePattern(canvas, 'screentone-light');
}

// 9. Halftone
function createHalftone() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';

  const spacing = 8;

  // Create halftone with varying dot sizes based on position
  for (let row = 0; row < SIZE / spacing; row++) {
    const offset = (row % 2) * (spacing / 2);
    for (let col = 0; col < SIZE / spacing + 1; col++) {
      const x = col * spacing + offset;
      const y = row * spacing;
      // Vary size slightly for visual interest
      const dotSize = 2 + Math.sin(x * 0.3) * 0.5 + Math.cos(y * 0.3) * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  savePattern(canvas, 'halftone');
}

// 10. Watercolor Wash
function createWatercolor() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Create soft blotchy texture
  const imageData = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      // Create organic-looking blotches
      const noise = Math.random() * 40 +
                    Math.sin(x * 0.5) * 20 +
                    Math.cos(y * 0.5) * 20;
      imageData.data[i] = noise;
      imageData.data[i + 1] = noise;
      imageData.data[i + 2] = noise;
      imageData.data[i + 3] = 40;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Add some soft blur effect with overlapping circles
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#666666';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * SIZE,
      Math.random() * SIZE,
      10 + Math.random() * 20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  savePattern(canvas, 'watercolor');
}

// 11. Film Grain Noise
function createNoise() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Create fine grain noise
  const imageData = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * 60;
    imageData.data[i] = noise;
    imageData.data[i + 1] = noise;
    imageData.data[i + 2] = noise;
    imageData.data[i + 3] = 25;
  }
  ctx.putImageData(imageData, 0, 0);

  savePattern(canvas, 'noise');
}

// Generate all patterns
console.log('Generating pattern assets...\n');

createDotsSmall();
createDotsLarge();
createLinesH();
createLinesDiag();
createGrid();
createPaperSubtle();
createPaperRough();
createScreentoneLight();
createHalftone();
createWatercolor();
createNoise();

console.log('\nAll patterns generated successfully!');
