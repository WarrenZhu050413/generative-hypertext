#!/bin/bash

# Build script for Nabokov Web Clipper extension

set -e

echo "🔨 Building Nabokov Web Clipper..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Type check
echo "🔍 Type checking..."
npm run type-check

# Build with Vite
echo "⚡ Building with Vite..."
npm run build

# Copy additional assets if needed
echo "📋 Copying assets..."
if [ -d "public/icons" ]; then
  mkdir -p dist/icons
  cp -r public/icons/* dist/icons/
fi

# Validate manifest exists
if [ ! -f "dist/manifest.json" ]; then
  echo "❌ Error: manifest.json not found in dist/"
  exit 1
fi

# Fix Canvas HTML script reference
echo "🔧 Fixing Canvas HTML..."
bash scripts/fix-canvas.sh

echo "✅ Build complete! Extension files are in dist/"
echo "📍 Load the extension from: $(pwd)/dist"