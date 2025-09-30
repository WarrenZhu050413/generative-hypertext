#!/usr/bin/env node

/**
 * Create placeholder icons for the extension
 * Run: node scripts/create-icons.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 48, 128];
const iconsDir = join(__dirname, '../public/icons');

// Ensure icons directory exists
mkdirSync(iconsDir, { recursive: true });

function createSVG(size) {
  // Simple book/butterfly icon design
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4A90E2" rx="${size * 0.15}"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2}) scale(${size * 0.015})">
    <!-- Book icon -->
    <path d="M 10 5 L 10 35 L 30 38 L 30 8 Z" fill="white" opacity="0.9"/>
    <path d="M 30 8 L 30 38 L 35 37 L 35 7 Z" fill="white" opacity="0.7"/>
    <line x1="10" y1="12" x2="26" y2="13.5" stroke="white" stroke-width="1" opacity="0.5"/>
    <line x1="10" y1="17" x2="26" y2="18.5" stroke="white" stroke-width="1" opacity="0.5"/>
    <line x1="10" y1="22" x2="26" y2="23.5" stroke="white" stroke-width="1" opacity="0.5"/>
  </g>
</svg>`;
}

// Create SVG icons
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = join(iconsDir, `icon${size}.svg`);
  writeFileSync(filename, svg, 'utf8');
  console.log(`✅ Created ${filename}`);
});

// Note: For production, convert SVG to PNG
console.log('\n📝 Note: These are SVG placeholders. For production, convert to PNG:');
console.log('   Use an online tool or ImageMagick: convert icon.svg icon.png');
console.log('   Or use a design tool like Figma/Sketch to create proper icons.\n');