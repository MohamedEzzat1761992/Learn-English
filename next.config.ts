import type { NextConfig } from 'next'

/**
 * The app ships as a standalone Android APK (Capacitor) as well as a static
 * web build, so the Next.js server features are deliberately unused:
 * no API routes, no middleware, no rewrites, no image optimizer.
 *
 * `output: 'export'` produces `out/`, which is both the static web root and
 * Capacitor's `webDir`. `trailingSlash` keeps every route a directory with an
 * `index.html`, which is what a plain static host and the Android WebView
 * asset loader resolve reliably.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
