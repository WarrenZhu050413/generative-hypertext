/**
 * Generate placeholder PNG icons for the extension
 * Creates 16x16, 48x48, and 128x128 icons
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple base64 PNG for each size (1x1 transparent pixel, will be scaled)
// These are minimal valid PNG files that can be replaced with proper icons later

const createSimplePNG = (size) => {
  // SVG that we'll convert to base64 for now
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#4A90E2"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.6}" fill="white" text-anchor="middle" dominant-baseline="middle">N</text>
</svg>`;

  return Buffer.from(svg);
};

const sizes = [16, 48, 128];
const iconsDir = join(__dirname, '../public/icons');

console.log('Generating placeholder icons...');

sizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = join(iconsDir, filename);

  // For now, create SVG files since we can't easily create PNG without external libs
  const svgFilename = `icon${size}.svg`;
  const svgFilepath = join(iconsDir, svgFilename);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#4A90E2" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">N</text>
</svg>`;

  writeFileSync(svgFilepath, svg);
  console.log(`Created ${svgFilename}`);
});

console.log('\nNote: SVG icons created. For production, convert to PNG using:');
console.log('  npm install -g sharp-cli');
console.log('  sharp -i public/icons/icon16.svg -o public/icons/icon16.png');
console.log('  sharp -i public/icons/icon48.svg -o public/icons/icon48.png');
console.log('  sharp -i public/icons/icon128.svg -o public/icons/icon128.png');