#!/usr/bin/env node

/**
 * Watch source files and automatically rebuild when they change
 * Run with: node scripts/watch-and-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const watchPaths = [
  path.join(projectRoot, 'hypertext'),
  path.join(projectRoot, 'extension'),
  path.join(projectRoot, 'manifest.json')
];

let debounceTimer = null;
const DEBOUNCE_MS = 300;

function rebuild() {
  try {
    console.log('\n🔨 Building...');
    execSync('npm run build:unpacked', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Build complete! Reload your extension in Chrome.\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

function debouncedRebuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(rebuild, DEBOUNCE_MS);
}

function watchDirectory(dirPath) {
  fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`📝 Changed: ${filename}`);
      debouncedRebuild();
    }
  });
}

function watchFile(filePath) {
  fs.watch(filePath, (eventType, filename) => {
    console.log(`📝 Changed: ${path.basename(filePath)}`);
    debouncedRebuild();
  });
}

console.log('👀 Watching for changes...\n');
console.log('Watched paths:');
watchPaths.forEach(p => console.log(`  - ${path.relative(projectRoot, p)}`));
console.log('\nPress Ctrl+C to stop\n');

// Initial build
rebuild();

// Watch files/directories
watchPaths.forEach(p => {
  const stats = fs.statSync(p);
  if (stats.isDirectory()) {
    watchDirectory(p);
  } else {
    watchFile(p);
  }
});
