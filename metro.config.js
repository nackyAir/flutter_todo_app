const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Firebase Auth "Component auth has not been registered yet" エラーの修正
// Expo SDK 53でのMetro package exports supportによる問題を解決
defaultConfig.resolver.unstable_enablePackageExports = false;

// .cjs ファイルのサポートを追加
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig; 