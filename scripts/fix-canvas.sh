#!/bin/bash

# Fix Canvas HTML to use relative paths for Chrome extension

echo "🔧 Fixing Canvas HTML paths..."

# Fix absolute paths to relative paths
sed -i.bak 's|src="/assets/|src="../../assets/|g' dist/src/canvas/index.html
sed -i.bak 's|href="/assets/|href="../../assets/|g' dist/src/canvas/index.html

# Remove backup file
rm -f dist/src/canvas/index.html.bak

echo "✅ Canvas HTML paths fixed!"