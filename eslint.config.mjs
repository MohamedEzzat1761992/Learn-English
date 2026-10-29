import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * Flat ESLint configuration (ESLint 9).
 *
 * `legacy-prototype/` is intentionally excluded: it is an archived Vite
 * prototype kept only as a design reference and is not part of this app.
 */
const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'coverage/**',
      'legacy-prototype/**',
      'android/**',
      'dist-apk/**',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
