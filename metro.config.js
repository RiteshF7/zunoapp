// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude native build artifacts (.cxx, build, .gradle) from Metro's file watcher.
// These temporary CMake directories are created/deleted during Android native builds
// and cause ENOENT crashes on Windows (especially with OneDrive paths).
const blockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : [];

config.resolver.blockList = [
  ...blockList,
  /[/\\]android[/\\]\.cxx[/\\].*/,
  /[/\\]android[/\\]build[/\\].*/,
  /[/\\]\.gradle[/\\].*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
