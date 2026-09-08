import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Le hachage des mots de passe.
 *
 * scrypt plutôt qu'argon2 ou bcrypt : il est dans la bibliothèque standard de
 * Node, donc pas de module natif à compiler — une association qui déploie sur
 * trois environnements différents n'a pas à déboguer une chaîne de compilation
 * C. scrypt est coûteux en mémoire, ce qui est exactement ce qu'on demande à
 * une fonction de hachage de mot de passe.
 *
 * Les paramètres sont écrits dans l'empreinte : le jour où on les durcira, les
 * anciennes empreintes resteront vérifiables et se remplaceront à la connexion
 * suivante.
 */

const chiffrer = promisify(scrypt) as (
  motDePasse: string | Buffer,
  sel: string | Buffer,
  longueur: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const COUT = 2 ** 15; // ~100 ms sur une machine de bureau
const BLOC = 8;
const PARALLELISME = 1;
const LONGUEUR_DU_SEL = 16;
const LONGUEUR_DE_LA_CLE = 64;
// scrypt réclame environ 128 * N * r octets ; on laisse de la marge.
const MEMOIRE_MAXIMALE = 128 * COUT * BLOC * 2;

export async function empreinteDuMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(LONGUEUR_DU_SEL);
  const cle = await chiffrer(motDePasse.normalize('NFKC'), sel, LONGUEUR_DE_LA_CLE, {
    N: COUT,
    r: BLOC,
    p: PARALLELISME,
    maxmem: MEMOIRE_MAXIMALE,
  });

  return [
    'scrypt',
    COUT,
    BLOC,
    PARALLELISME,
    sel.toString('hex'),
    cle.toString('hex'),
  ].join('$');
}

export async function motDePasseCorrespond(
  motDePasse: string,
  empreinte: string,
): Promise<boolean> {
  const parties = empreinte.split('$');
  if (parties.length !== 6 || parties[0] !== 'scrypt') {
    return false;
  }

  const [, cout, bloc, parallelisme, selHex, cleHex] = parties;
  const N = Number.parseInt(cout, 10);
  const r = Number.parseInt(bloc, 10);
  const p = Number.parseInt(parallelisme, 10);

  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }

  const attendue = Buffer.from(cleHex, 'hex');
  const obtenue = await chiffrer(
    motDePasse.normalize('NFKC'),
    Buffer.from(selHex, 'hex'),
    attendue.length,
    { N, r, p, maxmem: 128 * N * r * 2 },
  );

  // Comparaison à temps constant : une comparaison naïve laisse deviner
  // l'empreinte octet par octet.
  return (
    attendue.length === obtenue.length && timingSafeEqual(attendue, obtenue)
  );
}
