import fs from 'node:fs'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Luật kiến trúc (xem AGENTS.md):
 *   shared (components, config, hooks, lib, utils, testing) -> features -> app
 * - Không import chéo giữa các feature; ghép feature ở tầng src/app.
 * - Feature không import từ app; shared không import từ features hay app.
 * - Dùng import tuyệt đối `@/`, không dùng `../`.
 */
const FEATURES = fs
  .readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const noParentImports = {
  group: ['../*'],
  message: 'Use the `@/` absolute import instead of a relative parent path.'
}

const noAppImports = {
  group: ['@/app', '@/app/*'],
  message: 'Only src/app may import from the app layer.'
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['eslint.config.js', 'vite.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/app/**/*.{js,jsx}', 'src/main.jsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [noParentImports] }],
    },
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{js,jsx}`],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          noParentImports,
          noAppImports,
          {
            group: ['@/features/*', `!@/features/${feature}`],
            message: 'Features must not import from other features. Compose them in src/app instead.'
          }
        ]
      }],
    },
  })),
  {
    files: ['src/{components,config,hooks,lib,utils,testing}/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          noParentImports,
          noAppImports,
          {
            group: ['@/features', '@/features/*'],
            message: 'Shared code must not import from features.'
          }
        ]
      }],
    },
  },
])
