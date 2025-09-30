# Extension Icons

This directory contains placeholder SVG icons for the Nabokov Web Clipper extension.

## Current Status
- SVG placeholders have been generated for testing
- Icons show a simple book design on blue background

## For Production
Chrome extensions should use PNG icons for best compatibility. Convert the SVGs to PNG:

### Using ImageMagick (if installed):
```bash
convert icon16.svg icon16.png
convert icon48.svg icon48.png
convert icon128.svg icon128.png
```

### Using Online Tools:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

### Using Design Tools:
Create custom icons in Figma, Sketch, or Adobe Illustrator and export as PNG at:
- 16x16px (toolbar icon)
- 48x48px (extension management page)
- 128x128px (Chrome Web Store)

## Icon Guidelines
- Use simple, recognizable designs
- Ensure icons work on both light and dark backgrounds
- Follow Chrome's extension icon guidelines
- Consider creating adaptive icons for different sizes