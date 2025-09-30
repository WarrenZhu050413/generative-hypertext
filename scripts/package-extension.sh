#!/bin/bash

# Package script for Nabokov Web Clipper extension

set -e

echo "📦 Packaging Nabokov Web Clipper..."

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ directory not found. Run 'npm run build:extension' first."
  exit 1
fi

# Get version from manifest
VERSION=$(node -p "require('./src/manifest.json').version")
PACKAGE_NAME="nabokov-web-clipper-v${VERSION}.zip"

# Create package
echo "🗜️  Creating package: ${PACKAGE_NAME}"
cd dist
zip -r "../${PACKAGE_NAME}" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo "✅ Package created: ${PACKAGE_NAME}"
echo "📦 Size: $(du -h ${PACKAGE_NAME} | cut -f1)"