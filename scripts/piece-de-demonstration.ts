/**
 * Dépose une pièce d'identité de démonstration.
 *
 * Sans elle, l'écran d'examen ne se regarde pas : il n'existe que s'il y a un
 * document à relire, et déposer un vrai document sur un poste de
 * développement serait exactement ce qu'il ne faut pas faire.
 *
 * L'image générée dit en toutes lettres qu'elle n'est pas une pièce
 * d'identité, et ne contient aucune donnée réelle. Elle est chiffrée par le
 * même chemin que le dépôt réel.
 *
 *   npm run bd:piece -- <uuid du membre>
 */
import sharp from 'sharp';

import { interroger } from '../lib/bd/client';
import { chiffrer } from '../lib/securite/chiffrement';

const MEMBRE = process.argv[2];
if (!MEMBRE) {
  throw new Error('Usage : deposer-une-piece.ts <uuid du membre>');
}

async function deposer(): Promise<void> {
  const image = await sharp({
  create: {
    width: 1000,
    height: 640,
    channels: 3,
    background: { r: 236, g: 240, b: 233 },
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="1000" height="640">
           <rect x="30" y="30" width="940" height="580" rx="24"
                 fill="#ffffff" stroke="#1b4332" stroke-width="4"/>
           <text x="70" y="120" font-family="sans-serif" font-size="34"
                 fill="#1b4332">DOCUMENT DE DÉMONSTRATION</text>
           <text x="70" y="200" font-family="sans-serif" font-size="46"
                 fill="#1e293b">Yanis D.</text>
           <text x="70" y="270" font-family="sans-serif" font-size="28"
                 fill="#64748b">Ceci n'est pas une vraie pièce d'identité.</text>
           <text x="70" y="320" font-family="sans-serif" font-size="28"
                 fill="#64748b">Aucune donnée réelle n'y figure.</text>
           <rect x="70" y="380" width="220" height="180" rx="12"
                 fill="#e2e8f0"/>
         </svg>`,
        'utf8',
      ),
      top: 0,
      left: 0,
    },
  ])
    .jpeg({ quality: 80 })
    .toBuffer();

  const coffre = chiffrer(image);

  await interroger(
    `insert into piece_didentite
       (membre_id, contenu_chiffre, vecteur, etiquette, type_mime, taille_en_octets)
     values ($1, $2, $3, $4, 'image/jpeg', $5)
     on conflict (membre_id) do update
        set contenu_chiffre = excluded.contenu_chiffre,
            vecteur = excluded.vecteur,
            etiquette = excluded.etiquette,
            taille_en_octets = excluded.taille_en_octets,
            deposee_le = now(),
            relue_le = null`,
    [MEMBRE, coffre.contenu, coffre.vecteur, coffre.etiquette, image.length],
  );

  await interroger(
    `update membre set verification = 'en_cours' where id = $1`,
    [MEMBRE],
  );

  console.log('pièce de démonstration déposée pour', MEMBRE);
}

deposer().then(
  () => process.exit(0),
  (erreur) => {
    console.error(erreur);
    process.exit(1);
  },
);
