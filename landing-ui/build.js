#!/usr/bin/env node
/**
 * Copy landing-ui files to backend/static/
 * Does NOT overwrite or remove backend/static/app/
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const staticDir = path.join(root, 'backend', 'static');

if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy index.html
fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(staticDir, 'index.html')
);

// Copy flow/
copyRecursive(
  path.join(__dirname, 'flow'),
  path.join(staticDir, 'flow')
);

// Copy assets/
copyRecursive(
  path.join(__dirname, 'assets'),
  path.join(staticDir, 'assets')
);

console.log('Landing UI built to backend/static/');
