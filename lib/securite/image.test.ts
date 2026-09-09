import { describe, expect, test } from 'vitest';
import sharp from 'sharp';

import {
  contientDesCoordonnees,
  metadonneesDe,
  nettoyerLaPhoto,
} from './image';

/**
 * Une photo comme en produirait un téléphone : du JPEG, et des coordonnées
 * GPS dans les métadonnées.
 */
async function photoAvecGps(): Promise<Buffer> {
  return sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 120, g: 140, b: 150 },
    },
  })
    // Dans le modèle de sharp, IFD3 est le bloc GPS — c'est là que le
    // téléphone écrit les coordonnées du lieu de la prise de vue.
    .withExif({
      IFD0: { Make: 'BikeSitters', Model: 'Test' },
      IFD3: {
        GPSLatitudeRef: 'N',
        GPSLatitude: '50/1 49/1 44/1',
        GPSLongitudeRef: 'E',
        GPSLongitude: '4/1 22/1 20/1',
      },
    })
    .jpeg()
    .toBuffer();
}

describe('règle 4 — une photo ne trahit pas l’adresse par ses métadonnées', () => {
  test('la photo d’origine porte bien des coordonnées GPS', async () => {
    // Sans cette vérification, les tests suivants passeraient même si le
    // nettoyage ne faisait rien — ou si sharp n'avait rien écrit du tout.
    const original = await photoAvecGps();

    const avant = await metadonneesDe(original);

    expect(avant.exif).toBe(true);
    expect(contientDesCoordonnees(avant.bloc)).toBe(true);
  });

  test('la photo nettoyée n’en porte plus aucune', async () => {
    const nettoyee = await nettoyerLaPhoto(await photoAvecGps());
    const apres = await metadonneesDe(nettoyee.contenu);

    expect(apres.exif).toBe(false);
    expect(contientDesCoordonnees(apres.bloc)).toBe(false);
  });

  test('les octets de sortie ne contiennent plus la trace du GPS', async () => {
    const nettoyee = await nettoyerLaPhoto(await photoAvecGps());
    const octets = nettoyee.contenu.toString('latin1');

    expect(octets).not.toContain('BikeSitters');
    expect(octets).not.toContain('Exif');
  });
});

describe('le nettoyage normalise aussi le format et la taille', () => {
  test('la sortie est toujours du WebP, quel que soit ce qui entre', async () => {
    // C'est ce que le schéma contraint : un type stocké différent voudrait
    // dire qu'une image a contourné ce passage.
    const nettoyee = await nettoyerLaPhoto(await photoAvecGps());
    expect((await metadonneesDe(nettoyee.contenu)).format).toBe('webp');
  });

  test('une image trop large est réduite', async () => {
    const enorme = await sharp({
      create: {
        width: 4000,
        height: 3000,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .jpeg()
      .toBuffer();

    const nettoyee = await nettoyerLaPhoto(enorme);
    expect(nettoyee.largeur).toBe(1400);
    expect(nettoyee.hauteur).toBe(1050);
  });

  test('une petite image n’est pas agrandie', async () => {
    const petite = await sharp({
      create: {
        width: 300,
        height: 200,
        channels: 3,
        background: { r: 10, g: 10, b: 10 },
      },
    })
      .jpeg()
      .toBuffer();

    const nettoyee = await nettoyerLaPhoto(petite);
    expect(nettoyee.largeur).toBe(300);
  });
});
