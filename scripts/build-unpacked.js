#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function ensureExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} not found at ${filePath}`);
  }
}

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const distRoot = path.join(projectRoot, 'dist');
  const unpackedRoot = path.join(distRoot, 'unpacked');

  ensureExists(path.join(projectRoot, 'manifest.json'), 'manifest.json');
  ensureExists(path.join(projectRoot, 'extension'), 'extension directory');
  ensureExists(path.join(projectRoot, 'hypertext'), 'hypertext directory');

  fs.mkdirSync(distRoot, { recursive: true });
  fs.rmSync(unpackedRoot, { recursive: true, force: true });
  fs.mkdirSync(unpackedRoot, { recursive: true });

  fs.copyFileSync(
    path.join(projectRoot, 'manifest.json'),
    path.join(unpackedRoot, 'manifest.json')
  );

  copyDir(
    path.join(projectRoot, 'extension'),
    path.join(unpackedRoot, 'extension')
  );
  copyDir(
    path.join(projectRoot, 'hypertext'),
    path.join(unpackedRoot, 'hypertext')
  );

  console.log('Unpacked bundle ready at dist/unpacked');
}

try {
  main();
} catch (error) {
  console.error('[build-unpacked] Failed:', error.message);
  process.exitCode = 1;
}
