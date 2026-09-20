'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  annoncerUnRetardDe,
  demanderUneProlongation,
  repondreALaProlongation,
} from '@/lib/depot/amenagements';
import type { ResultatDEcriture } from '@/lib/depot/gardes';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { estUneHeure } from '@/lib/regles/creneau';
import { instantABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

export type EtatDUnAmenagement = { erreur: string | null };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function premierMotif(resultat: ResultatDEcriture): Promise<string> {
  const p = phraseur(await langueCourante());
  if (resultat.ok) return '';
  const [motif] = resultat.motifs;
  return motif ? p(motif.texte, motif.valeurs) : p('Cette action n’a pas pu aboutir.');
}

export async function prevenirDUnRetard(
  id: string,
  _precedent: EtatDUnAmenagement,
  donnees: FormData,
): Promise<EtatDUnAmenagement> {
  const membre = await exigerUnMembre();
  if (!IDENTIFIANT.test(id)) redirect('/gardes');
  const resultat = await annoncerUnRetardDe(
    membre.id,
    id,
    Number(donnees.get('minutes')),
    String(donnees.get('mot') ?? ''),
  );
  if (!resultat.ok) return { erreur: await premierMotif(resultat) };
  revalidatePath(`/gardes/${id}`);
  redirect(`/gardes/${id}?retard=annonce`);
}

export async function demanderLaProlongation(
  id: string,
  _precedent: EtatDUnAmenagement,
  donnees: FormData,
): Promise<EtatDUnAmenagement> {
  const membre = await exigerUnMembre();
  if (!IDENTIFIANT.test(id)) redirect('/gardes');
  const jour = String(donnees.get('jour') ?? '');
  const heure = String(donnees.get('heure') ?? '');
  const nouvelleFin = estUneHeure(heure) ? instantABruxelles(jour, heure) : null;
  if (!nouvelleFin) {
    const p = phraseur(await langueCourante());
    return { erreur: p('Indiquez le jour et l’heure souhaités pour la nouvelle fin de garde.') };
  }
  const resultat = await demanderUneProlongation(
    membre.id,
    id,
    nouvelleFin,
    String(donnees.get('motif') ?? ''),
  );
  if (!resultat.ok) return { erreur: await premierMotif(resultat) };
  revalidatePath(`/gardes/${id}`);
  redirect(`/gardes/${id}?prolongation=demandee`);
}

export async function repondreALaDemandeDeProlongation(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const id = String(donnees.get('id') ?? '');
  if (!IDENTIFIANT.test(id)) redirect('/gardes');
  const reponse = donnees.get('reponse');
  if (reponse !== 'accepter' && reponse !== 'refuser' && reponse !== 'annuler') {
    redirect(`/gardes/${id}`);
  }
  const resultat = await repondreALaProlongation(membre.id, id, reponse);
  revalidatePath(`/gardes/${id}`);
  redirect(
    resultat === 'ok'
      ? `/gardes/${id}?prolongation=${reponse}`
      : `/gardes/${id}?prolongation=${resultat}`,
  );
}
