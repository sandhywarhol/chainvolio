// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Solana Mobile Wallet Adapter and other Solana packages use package exports
config.resolver.unstable_enablePackageExports = true;

// Ensure we can resolve modules from the node_modules folder properly
config.resolver.sourceExts.push('mjs');

// Add polyfills for environment
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-get-random-values'),
  buffer: require.resolve('buffer'),
  stream: require.resolve('readable-stream'),
};

module.exports = config;
