import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const racine = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': racine,
      // `server-only` n'existe que pour faire échouer la compilation si un
      // composant client importe un module serveur. En test il n'y a pas de
      // client : on le neutralise plutôt que de renoncer à tester ces modules.
      'server-only': resolve(racine, 'lib/tests/module-vide.ts'),
    },
  },
});
