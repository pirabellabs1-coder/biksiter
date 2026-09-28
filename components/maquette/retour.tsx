'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Icone } from '@/components/app/icone';

/**
 * La flèche de retour de l'en-tête d'application.
 *
 * La maquette la pose avec `data-back`, qui remonte d'un écran. Ici on remonte
 * dans l'historique du navigateur : c'est le même geste, et ça marche depuis
 * n'importe quel écran sans que le cadre ait à connaître d'où l'on vient.
 *
 * Les écrans où mène la barre d'onglets sont des points de départ : une flèche
 * de retour n'y a pas de sens (d'où reviendrait-on ?). Elle n'apparaît que
 * dans un écran de détail.
 */
const ECRANS_RACINES = [
  '/mon-espace',
  '/recherche',
  '/gardes',
  '/favoris',
  '/plan-du-site',
  '/plus',
  '/accueil',
  '/mes-lieux',
  '/profil',
  '/catalogue',
];

export function Retour() {
  const routeur = useRouter();
  const chemin = usePathname();

  if (ECRANS_RACINES.includes(chemin)) return null;

  return (
    <button
      type="button"
      className="back"
      aria-label="Revenir"
      onClick={() => routeur.back()}
    >
      <Icone nom="retour" taille={24} strokeWidth={2.2} />
    </button>
  );
}
