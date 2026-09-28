/**
 * Les trois vues de « Mes gardes », côté cycliste.
 *
 * Les maquettes définitives n'en montrent que trois, là où l'espace membre en
 * comptait quatre : une garde annulée se lit avec les gardes terminées, et une
 * demande refusée reste avec les demandes — c'est là qu'on la cherche, juste
 * après l'avoir envoyée.
 *
 * Chaque état tombe dans une vue, et une seule.
 */

import type { EtatDeGarde } from './garde';

export const VUES_DES_GARDES = [
  {
    cle: 'avenir',
    titre: 'À venir',
    etats: ['accepte', 'arrivee', 'en_cours', 'reprise_demandee', 'litige'],
  },
  { cle: 'demandes', titre: 'Demandes', etats: ['demande', 'refuse', 'expire'] },
  { cle: 'terminees', titre: 'Terminées', etats: ['termine', 'annule'] },
] as const satisfies ReadonlyArray<{
  cle: string;
  titre: string;
  etats: readonly EtatDeGarde[];
}>;

export type VueDesGardes = (typeof VUES_DES_GARDES)[number]['cle'];

export function vueDeLEtat(etat: EtatDeGarde): VueDesGardes {
  const vue = VUES_DES_GARDES.find((v) =>
    (v.etats as readonly EtatDeGarde[]).includes(etat),
  );
  if (!vue) {
    throw new Error(`Aucune vue ne reçoit l’état « ${etat} ».`);
  }
  return vue.cle;
}
