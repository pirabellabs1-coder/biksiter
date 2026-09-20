import type { Cle, Textes } from '@/lib/i18n/langue';
import type { EtatDeGarde, Geste } from '@/lib/regles/garde';

/** Les libellés du dictionnaire pour chaque état et chaque geste d'une garde. */

export const CLE_DE_L_ETAT: Readonly<Record<EtatDeGarde, Cle>> = {
  demande: 'st.PENDING',
  accepte: 'st.ACCEPTED',
  arrivee: 'st.ARRIVAL',
  en_cours: 'st.ACTIVE',
  reprise_demandee: 'st.RETURN_REQUESTED',
  termine: 'st.COMPLETED',
  refuse: 'st.DECLINED',
  annule: 'st.CANCELLED',
  expire: 'st.EXPIRED',
  litige: 'st.DISPUTED',
};

export const CLE_DU_GESTE: Readonly<Record<Geste, Cle>> = {
  accepter: 'ac.accept',
  refuser: 'ac.decline',
  annuler: 'ac.cancel',
  absence: 'ac.noshow',
  arriver: 'ac.arrive',
  personne_n_ouvre: 'ac.noanswer',
  recevoir: 'ac.receive',
  reprendre: 'ac.pickup',
  restituer: 'ac.return',
  signaler: 'ac.dispute',
};

export function referenceDeGarde(id: string): string {
  return `BS-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

/** Les étapes de la frise, dans l'ordre du parcours. */
export const ETAPES_DE_LA_FRISE: readonly [string, string][] = [
  ['demande', 'Demande envoyée'],
  ['accepte', 'Acceptée'],
  ['arrivee', 'Arrivée signalée'],
  ['velo_recu', 'Vélo reçu'],
  ['reprise_demandee', 'Récupération confirmée'],
  ['velo_restitue', 'Vélo restitué'],
  ['termine', 'Terminé'],
];

export function libelleDEtat(t: Textes['t'], etat: EtatDeGarde): string {
  return t(CLE_DE_L_ETAT[etat]);
}
