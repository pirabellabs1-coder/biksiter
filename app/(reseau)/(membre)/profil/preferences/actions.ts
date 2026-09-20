'use server';

import { redirect } from 'next/navigation';

import { reglerLaTranquillite } from '@/lib/depot/notifications';
import { estUneHeure } from '@/lib/regles/creneau';
import { TRANQUILLITE_PAR_DEFAUT } from '@/lib/regles/notifications';
import { exigerUnMembre } from '@/lib/session';

export async function enregistrerLesHeuresDeCalme(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const active = donnees.get('active') === 'oui';
  const de = String(donnees.get('de') ?? '');
  const a = String(donnees.get('a') ?? '');
  await reglerLaTranquillite(
    membre.id,
    active
      ? {
          de: estUneHeure(de) ? de : TRANQUILLITE_PAR_DEFAUT.de,
          a: estUneHeure(a) ? a : TRANQUILLITE_PAR_DEFAUT.a,
        }
      : null,
  );
  redirect('/profil/preferences?enregistre=1');
}
