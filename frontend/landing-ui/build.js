#!/usr/bin/env node
/**
 * Build landing-ui to dist/ (standalone deploy).
 * Output: landing-ui/dist/
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
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

fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(outDir, 'index.html')
);
copyRecursive(path.join(__dirname, 'flow'), path.join(outDir, 'flow'));
copyRecursive(path.join(__dirname, 'assets'), path.join(outDir, 'assets'));

console.log('Landing UI built to landing-ui/dist/');
