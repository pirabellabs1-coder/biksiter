'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  ajouterUnVelo,
  basculerLeBlocage,
  contesterUnAvis,
  repondreAUnAvis,
  retirerUnVelo,
  signaler,
} from '@/lib/depot/membre-espace';
import { suspendreLesDemandes } from '@/lib/depot/lieux';
import {
  modifierLeNom,
  retirerUneAlerte,
  supprimerLeCompte,
} from '@/lib/depot/mon-compte';
import {
  reglerLaTranquillite,
  TRANQUILLITE_PAR_DEFAUT,
} from '@/lib/depot/notifications';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { estUneHeure } from '@/lib/regles/creneau';
import { exigerUnMembre, seDeconnecter } from '@/lib/session';

export type EtatSimple = { erreur: string | null };

async function traduire(texte: string): Promise<string> {
  return phraseur(await langueCourante())(texte);
}

export async function enregistrerUnVelo(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  const lire = (nom: string) => String(donnees.get(nom) ?? '');
  const resultat = await ajouterUnVelo(membre.id, {
    nom: lire('nom'),
    type: lire('type'),
    marque: lire('marque'),
    couleur: lire('couleur'),
    numeroDeCadre: lire('cadre'),
  });
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  revalidatePath('/profil/velos');
  redirect('/profil/velos?velo=ajoute');
}

export async function supprimerUnVelo(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const resultat = await retirerUnVelo(
    membre.id,
    String(donnees.get('id') ?? ''),
  );
  revalidatePath('/profil/velos');
  redirect(
    resultat.ok ? '/profil/velos?velo=retire' : '/profil/velos?velo=engage',
  );
}

export async function bloquerOuDebloquer(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const cible = String(donnees.get('id') ?? '');
  await basculerLeBlocage(membre.id, cible);
  if (donnees.get('retour') === 'bloques') {
    revalidatePath('/profil/bloques');
    redirect('/profil/bloques');
  }
  revalidatePath(`/membres/${cible}`);
  redirect(/^[0-9a-f-]{36}$/.test(cible) ? `/membres/${cible}` : '/profil');
}

export async function envoyerUnSignalement(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  const cibleType = String(donnees.get('cible') ?? '');
  const cible = String(donnees.get('id') ?? '');
  if ((cibleType !== 'membre' && cibleType !== 'emplacement') || !cible) {
    return { erreur: await traduire("Ce signalement n'a pas de cible.") };
  }
  if (cibleType === 'membre' && cible === membre.id) {
    return {
      erreur: await traduire('Vous ne pouvez pas vous signaler vous-même.'),
    };
  }
  const resultat = await signaler(membre.id, {
    cibleType,
    cible,
    motif: String(donnees.get('motif') ?? ''),
    details: String(donnees.get('details') ?? ''),
  });
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  redirect('/profil?signalement=envoye');
}

export async function repondre(
  avisId: string,
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  const resultat = await repondreAUnAvis(
    membre.id,
    avisId,
    String(donnees.get('reponse') ?? ''),
  );
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  redirect('/profil/avis?reponse=publiee');
}

export async function contester(
  avisId: string,
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  const resultat = await contesterUnAvis(
    membre.id,
    avisId,
    String(donnees.get('motif') ?? ''),
  );
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  redirect('/profil/avis?contestation=envoyee');
}

export async function supprimerUneAlerte(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  await retirerUneAlerte(membre.id, String(donnees.get('id') ?? ''));
  revalidatePath('/profil/alertes');
}

export async function modifierMonNom(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  const resultat = await modifierLeNom(membre.id, {
    prenom: String(donnees.get('prenom') ?? ''),
    nom: String(donnees.get('nom') ?? ''),
  });
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  revalidatePath('/', 'layout');
  redirect('/profil/parametres?enregistre=1');
}

export async function supprimerMonCompte(
  _precedent: EtatSimple,
  donnees: FormData,
): Promise<EtatSimple> {
  const membre = await exigerUnMembre();
  if (donnees.get('confirmation') !== 'oui') {
    return {
      erreur: await traduire('Cochez la case pour confirmer la suppression.'),
    };
  }
  const resultat = await supprimerLeCompte(
    membre.id,
    String(donnees.get('motDePasse') ?? ''),
  );
  if (!resultat.ok) return { erreur: await traduire(resultat.texte) };
  await seDeconnecter();
  redirect('/?compte=supprime');
}

export async function reglerLesHeuresDeTranquillite(
  donnees: FormData,
): Promise<void> {
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
  redirect('/profil/parametres?enregistre=1');
}

export async function seDeconnecterDeLEspace(): Promise<void> {
  await seDeconnecter();
  redirect('/');
}

/** « Accepter les nouvelles demandes » : un seul geste pour tous ses lieux. */
export async function basculerLesNouvellesDemandes(
  donnees: FormData,
): Promise<void> {
  const membre = await exigerUnMembre();
  const accepter = donnees.get('accepter') === 'oui';
  const ok = await suspendreLesDemandes(membre.id, !accepter);
  revalidatePath('/profil');
  redirect(ok ? '/profil' : '/profil?demandes=impossible');
}
