/**
 * Corkboard Texture Generator
 *
 * Generates a tileable corkboard texture PNG for the board backgrounds.
 * Uses canvas to create a warm brown cork look with natural variation.
 *
 * Usage: node scripts/generate-corkboard.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const WIDTH = 512;
const HEIGHT = 512;

function generateCorkboard() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Base cork color - warm brown
  const baseColor = { r: 194, g: 154, b: 108 };

  // Fill with base color
  ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Add noise/grain for cork texture
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Random variation for each pixel
    const variation = (Math.random() - 0.5) * 40;

    // Apply variation to RGB channels
    data[i] = Math.max(0, Math.min(255, baseColor.r + variation));     // R
    data[i + 1] = Math.max(0, Math.min(255, baseColor.g + variation)); // G
    data[i + 2] = Math.max(0, Math.min(255, baseColor.b + variation)); // B
    // Alpha stays at 255
  }

  ctx.putImageData(imageData, 0, 0);

  // Add darker spots (cork pores)
  const poreCount = 800;
  for (let i = 0; i < poreCount; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const radius = Math.random() * 2 + 0.5;
    const opacity = Math.random() * 0.15 + 0.05;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 70, 40, ${opacity})`;
    ctx.fill();
  }

  // Add lighter highlights
  const highlightCount = 400;
  for (let i = 0; i < highlightCount; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const radius = Math.random() * 1.5 + 0.3;
    const opacity = Math.random() * 0.1 + 0.03;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 220, ${opacity})`;
    ctx.fill();
  }

  // Add subtle fiber lines
  const fiberCount = 150;
  for (let i = 0; i < fiberCount; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const length = Math.random() * 15 + 5;
    const angle = Math.random() * Math.PI * 2;
    const opacity = Math.random() * 0.08 + 0.02;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.strokeStyle = `rgba(80, 50, 30, ${opacity})`;
    ctx.lineWidth = Math.random() * 0.8 + 0.2;
    ctx.stroke();
  }

  return canvas;
}

// Generate and save
const canvas = generateCorkboard();
const buffer = canvas.toBuffer('image/png');

// Ensure textures directory exists
const texturesDir = path.join(__dirname, '..', 'assets', 'textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

const outputPath = path.join(texturesDir, 'corkboard.png');
fs.writeFileSync(outputPath, buffer);

console.log(`Corkboard texture generated: ${outputPath}`);
console.log(`Size: ${WIDTH}x${HEIGHT}px`);
