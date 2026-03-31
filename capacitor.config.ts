import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jamesleepm.bibleblocks.dev',
  appName: 'BibleBlocks',
  webDir: 'dist',
  ios: {
    // "automatic" avoids wrong innerWidth/innerHeight on some WKWebView builds (black GL buffer).
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: false,
    backgroundColor: '#87ceeb',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  server: {
    androidScheme: 'https',
    // Bundle is local-only; avoid wildcard allow-list (App Store / security review).
    allowNavigation: [],
  },
};

export default config;
