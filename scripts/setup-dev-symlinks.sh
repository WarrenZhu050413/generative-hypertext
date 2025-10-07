#!/bin/bash

# Setup development symbolic links for Chrome extension
# This makes dist/unpacked load source files directly - no rebuild needed!

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UNPACKED_DIR="$PROJECT_ROOT/dist/unpacked"

echo "Setting up development symlinks..."

# Create dist/unpacked if it doesn't exist
mkdir -p "$UNPACKED_DIR"

# Copy manifest (this needs to be a real file, not a symlink)
cp "$PROJECT_ROOT/manifest.json" "$UNPACKED_DIR/manifest.json"

# Remove old directories if they exist
rm -rf "$UNPACKED_DIR/hypertext"
rm -rf "$UNPACKED_DIR/extension"

# Create symlinks to source directories
ln -s "$PROJECT_ROOT/hypertext" "$UNPACKED_DIR/hypertext"
ln -s "$PROJECT_ROOT/extension" "$UNPACKED_DIR/extension"

echo "✅ Development symlinks created!"
echo ""
echo "📁 dist/unpacked/hypertext -> hypertext/ (source)"
echo "📁 dist/unpacked/extension -> extension/ (source)"
echo ""
echo "Now reload your extension in Chrome (chrome://extensions)"
echo "Any changes to source files will be reflected immediately after reload!"
