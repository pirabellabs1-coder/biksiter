'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { TEMOIN_DE_LANGUE } from './langue';
import { estUneLangue } from './traduction';

/** Un an : un choix de langue ne se refait pas à chaque visite. */
const UN_AN = 60 * 60 * 24 * 365;

export async function choisirLaLangue(donnees: FormData): Promise<void> {
  const langue = donnees.get('langue');
  if (typeof langue === 'string' && estUneLangue(langue)) {
    (await cookies()).set(TEMOIN_DE_LANGUE, langue, {
      maxAge: UN_AN,
      sameSite: 'lax',
      path: '/',
    });
  }

  // On revient sur la page d'où vient la demande — seulement si c'est une
  // page du site, pour qu'aucun lien ne puisse s'en servir comme relais.
  const origine = (await headers()).get('referer');
  let retour = '/';
  if (origine) {
    try {
      const adresse = new URL(origine);
      const hote = (await headers()).get('host');
      // Un chemin qui commence par « // » ou « /\ » désignerait un autre site.
      if (adresse.host === hote && !/^\/[\\/]/.test(adresse.pathname)) {
        retour = adresse.pathname + adresse.search;
      }
    } catch {
      // Une en-tête illisible ramène simplement à l'accueil.
    }
  }
  redirect(retour);
}
