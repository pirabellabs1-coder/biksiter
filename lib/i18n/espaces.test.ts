import { describe, expect, test } from 'vitest';

import { laLangueChoisieSApplique } from './espaces';

describe('la langue de l’interface', () => {
  test('le site public suit la langue choisie', () => {
    expect(laLangueChoisieSApplique('/')).toBe(true);
    expect(laLangueChoisieSApplique('/comment-ca-marche')).toBe(true);
    expect(laLangueChoisieSApplique('/blog/un-article')).toBe(true);
  });

  test('l’espace membre s’affiche en français tant qu’il n’est pas traduit', () => {
    expect(laLangueChoisieSApplique('/profil')).toBe(false);
    expect(laLangueChoisieSApplique('/messages/abc')).toBe(false);
    expect(laLangueChoisieSApplique('/mon-espace')).toBe(false);
  });

  test('une adresse qui ressemble à une page publique ne s’y confond pas', () => {
    expect(laLangueChoisieSApplique('/faqueur')).toBe(false);
  });
});
