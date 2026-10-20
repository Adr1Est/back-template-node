import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const INFRA_PACKAGES = [
  'express',
  'cors',
  'helmet',
  'zod',
  'jose',
  'pino',
  'pino-http',
  'dotenv',
  '@prisma/client',
  '@prisma/adapter-pg',
  '@node-rs/argon2',
]

export default defineConfig(
  globalIgnores(['dist', 'coverage', 'src/generated']),

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Express 5 gestiona los handlers async: pasar una promesa como callback es correcto.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false } },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Lee la configuración desde shared/infrastructure/config/env.ts.',
        },
      ],
    },
  },

  // --- Reglas de la arquitectura hexagonal ---
  {
    files: ['src/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: INFRA_PACKAGES,
          patterns: [
            {
              regex: '(^|/)(application|infrastructure|generated)(/|$)',
              message:
                'domain no puede depender de application, infrastructure ni del cliente Prisma.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: INFRA_PACKAGES,
          patterns: [
            {
              regex: '(^|/)(infrastructure|generated)(/|$)',
              message:
                'application solo depende de domain. Define un puerto e inyecta el adaptador.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/infrastructure/config/env.ts', 'prisma.config.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  // --- Tests: dobles en memoria y cuerpos de supertest (any) ---
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Siempre el último: desactiva las reglas de estilo que chocan con Prettier.
  prettier,
)
