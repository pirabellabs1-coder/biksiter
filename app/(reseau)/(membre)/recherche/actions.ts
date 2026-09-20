'use server';

import { redirect } from 'next/navigation';

import { dansUneTransaction } from '@/lib/bd/client';
import { trouverUnLieu } from '@/lib/contenu/lieux';
import { notifier } from '@/lib/depot/notifications';
import { estUneHeure, estUnJour } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

/** Être prévenu dès qu'un emplacement ouvre près du lieu cherché. */
export async function creerUneAlerte(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const texte = String(donnees.get('lieu') ?? '').slice(0, 120);
  const lieu = trouverUnLieu(texte);
  const jour = String(donnees.get('jour') ?? '');
  const de = String(donnees.get('de') ?? '');
  const a = String(donnees.get('a') ?? '');
  const retour = String(donnees.get('retour') ?? '/recherche');

  if (lieu) {
    await dansUneTransaction(async (client) => {
      const deja = await client.query(
        `select 1 from alerte_de_recherche
          where membre_id = $1 and lieu = $2 and jour is not distinct from $3::date`,
        [membre.id, lieu.nom, estUnJour(jour) ? jour : null],
      );
      if (deja.rowCount) return;
      await client.query(
        `insert into alerte_de_recherche (membre_id, lieu, latitude, longitude, jour, heure_de, heure_a)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          membre.id,
          lieu.nom,
          lieu.latitude,
          lieu.longitude,
          estUnJour(jour) ? jour : null,
          estUneHeure(de) ? de : null,
          estUneHeure(a) ? a : null,
        ],
      );
      await notifier(client, membre.id, {
        texte:
          "Alerte créée pour {lieu}. Vous serez prévenu dès qu'un emplacement ouvre.",
        valeurs: { lieu: lieu.nom },
        lien: '/profil/alertes',
      });
    });
  }

  // Le retour ne peut mener qu'à une page de recherche du site.
  redirect(
    retour.startsWith('/recherche?') ? `${retour}&alerte=creee` : '/recherche',
  );
}
