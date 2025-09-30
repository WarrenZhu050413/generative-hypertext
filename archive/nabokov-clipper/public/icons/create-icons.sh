#!/bin/bash

# Create minimal valid PNG files using ImageMagick or convert if available
# Otherwise use base64 encoded minimal PNGs

if command -v convert &> /dev/null; then
    echo "Using ImageMagick to create icons..."
    convert -size 16x16 xc:#4A90E2 -font Arial -pointsize 10 -fill white -gravity center -annotate +0+0 "N" icon16.png
    convert -size 48x48 xc:#4A90E2 -font Arial -pointsize 30 -fill white -gravity center -annotate +0+0 "N" icon48.png
    convert -size 128x128 xc:#4A90E2 -font Arial -pointsize 80 -fill white -gravity center -annotate +0+0 "N" icon128.png
elif command -v sips &> /dev/null; then
    # macOS sips tool - convert SVG to PNG
    echo "Using sips to convert SVG to PNG..."
    sips -s format png icon16.svg --out icon16.png
    sips -s format png icon48.svg --out icon48.png
    sips -s format png icon128.svg --out icon128.png
else
    # Create minimal valid transparent PNGs using base64
    echo "Creating minimal PNG placeholders..."

    # 16x16 solid blue PNG
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFklEQVR42mNk+M/AQAqYGEYNGDUAAQAkLwH6XhqLzQAAAABJRU5ErkJggg==" | base64 -d > icon16.png

    # 48x48 solid blue PNG
    echo "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAFklEQVR42u3BMQEAAADCIPunfg5vYAAASsgBP4cJAAAAAElFTkSuQmCC" | base64 -d > icon48.png

    # 128x128 solid blue PNG
    echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAFklEQVR42u3BMQEAAADCIPunfg43YAAAAOCSA9wAAeYZjJAAAAAASUVORK5CYII=" | base64 -d > icon128.png

    echo "Created minimal PNG placeholders. Replace with proper icons later."
fi

echo "Icon files created successfully"
