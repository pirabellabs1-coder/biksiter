import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next 15 est encore une configuration « eslintrc » : FlatCompat
// est ce qui permet de l'utiliser depuis un fichier de configuration plate.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const configuration = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Le code livré ne journalise pas dans la console (CLAUDE.md).
      'no-console': 'error',
      // Pas de `any` : la règle du projet, rendue exécutable.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default configuration;
