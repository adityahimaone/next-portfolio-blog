import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    rules: {
      // Favicons and bookmark thumbnails are arbitrary remote hosts that the
      // image optimizer cannot be configured for one by one.
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
