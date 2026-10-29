import type { CapacitorConfig } from '@capacitor/cli'

/**
 * `webDir` points at the Next.js static export. `androidScheme: 'https'`
 * serves the bundled assets from `https://localhost` inside the WebView, which
 * keeps localStorage/IndexedDB in a stable, secure-context origin.
 */
const config: CapacitorConfig = {
  appId: 'com.myenglishmastery.app',
  appName: 'My English Mastery',
  webDir: 'out',
  android: {
    backgroundColor: '#f6f3ec',
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
