'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  corrigerLesPoints,
  enregistrerUneOffre,
  faireAvancerUnSignalement,
  suspendreOuReactiver,
  trancherUnLitige,
} from '@/lib/depot/gestion';
import { marquerCandidatureTraitee, trancher } from '@/lib/depot/moderation';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { CATEGORIES_D_OFFRE, type CategorieDOffre } from '@/lib/regles/catalogue';
import {
  CORRECTION_MAXIMALE,
  estUneIssueDeLitige,
  ETATS_D_UN_SIGNALEMENT,
  motifDeModerationValide,
} from '@/lib/regles/moderation';
import { exigerUnModerateur } from '@/lib/session';

/**
 * Chaque action revérifie que la personne modère : une action serveur est une
 * adresse, et une adresse s'appelle sans passer par l'écran qui la propose.
 */

export type EtatDUneDecision = { erreur: string | null };

const IDENTIFIANT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function traduire(texte: string, valeurs?: Record<string, string | number>) {
  return phraseur(await langueCourante())(texte, valeurs);
}

const lire = (donnees: FormData, nom: string) => String(donnees.get(nom) ?? '').trim();

// --- Les vérifications d'identité ----------------------------------------------------

export async function deciderDeLIdentite(
  membreId: string,
  _precedent: EtatDUneDecision,
  donnees: FormData,
): Promise<EtatDUneDecision> {
  const moderateur = await exigerUnModerateur();
  if (!IDENTIFIANT.test(membreId)) return { erreur: await traduire('Ce dossier n’existe plus.') };
  if (membreId === moderateur.id) {
    return { erreur: await traduire('Votre propre pièce se vérifie par une autre personne de l’équipe.') };
  }
  const decision = lire(donnees, 'decision');
  const motif = lire(donnees, 'motif');
  if (decision !== 'verifiee' && decision !== 'refusee') {
    return { erreur: await traduire('Choisissez une décision.') };
  }
  // Un refus se motive : la personne doit pouvoir comprendre et recommencer.
  if (decision === 'refusee' && !motifDeModerationValide(motif)) {
    return {
      erreur: await traduire(
        'Indiquez le motif du refus : il aidera le membre à envoyer une pièce valide.',
      ),
    };
  }
  const traite = await trancher(membreId, moderateur.id, decision, motif || null);
  if (!traite) {
    return { erreur: await traduire('Ce dossier a déjà été traité, peut-être par une autre personne.') };
  }
  revalidatePath('/administration');
  redirect(`/administration/verifications?decision=${decision}`);
}

export async function classerUneCandidature(donnees: FormData): Promise<void> {
  const moderateur = await exigerUnModerateur();
  const id = lire(donnees, 'candidature');
  if (IDENTIFIANT.test(id)) await marquerCandidatureTraitee(id, moderateur.id);
  revalidatePath('/administration/verifications');
  redirect('/administration/verifications');
}

// --- Les signalements ------------------------------------------------------------------

export async function avancerUnSignalement(donnees: FormData): Promise<void> {
  const moderateur = await exigerUnModerateur();
  const id = lire(donnees, 'signalement');
  const vers = lire(donnees, 'vers');
  const etat = ETATS_D_UN_SIGNALEMENT.find((e) => e.cle === vers)?.cle;
  const ok = etat ? await faireAvancerUnSignalement(moderateur.id, id, etat, lire(donnees, 'note')) : false;
  revalidatePath('/administration/signalements');
  const retour = ETATS_D_UN_SIGNALEMENT.find((e) => e.cle === lire(donnees, 'onglet'))?.cle ?? 'ouvert';
  redirect(`/administration/signalements?etat=${retour}${ok ? '' : '&erreur=1'}`);
}

// --- Les litiges -------------------------------------------------------------------------

export async function trancherLeLitige(
  gardeId: string,
  _precedent: EtatDUneDecision,
  donnees: FormData,
): Promise<EtatDUneDecision> {
  const moderateur = await exigerUnModerateur();
  const issue = lire(donnees, 'issue');
  const motif = lire(donnees, 'motif');
  if (!estUneIssueDeLitige(issue)) return { erreur: await traduire('Choisissez une issue.') };
  if (!motifDeModerationValide(motif)) {
    return {
      erreur: await traduire('Expliquez la décision en quelques mots : les deux membres la recevront.'),
    };
  }
  const resultat = await trancherUnLitige(
    moderateur.id,
    gardeId,
    issue,
    motif,
    donnees.get('confirmation') === 'oui',
  );
  if (resultat === 'velo_chez_le_bike_sitter') {
    return {
      erreur: await traduire(
        'Le vélo est encore chez le Bike Sitter : confirmez qu’il a été rendu au cycliste avant de clore la garde.',
      ),
    };
  }
  if (resultat === 'deja_tranche') {
    return {
      erreur: await traduire(
        'Ce litige a déjà été tranché, peut-être par une autre personne.',
      ),
    };
  }
  revalidatePath('/administration/litiges');
  redirect('/administration/litiges?tranche=1');
}

// --- Les membres ---------------------------------------------------------------------------

export async function changerLeStatutDuCompte(
  membreId: string,
  _precedent: EtatDUneDecision,
  donnees: FormData,
): Promise<EtatDUneDecision> {
  const moderateur = await exigerUnModerateur();
  const motif = lire(donnees, 'motif');
  if (!motifDeModerationValide(motif)) {
    return { erreur: await traduire('Indiquez le motif : il reste dans l’historique du compte.') };
  }
  const resultat = await suspendreOuReactiver(
    moderateur.id,
    membreId,
    lire(donnees, 'suspendre') === 'oui',
    motif,
    donnees.get('confirmation') === 'oui',
  );
  if (resultat === 'gardes_engagees') {
    return {
      erreur: await traduire(
        'Ce membre a une garde en cours : sa suspension bloquerait la remise du vélo. Cochez la confirmation si la sécurité l’exige.',
      ),
    };
  }
  if (resultat === 'interdit') {
    return {
      erreur: await traduire('Ce compte ne peut pas être suspendu depuis cet écran. Il s’agit du vôtre ou de celui d’un membre de la modération.'),
    };
  }
  if (resultat === 'introuvable') return { erreur: await traduire('Ce compte n’existe plus.') };
  revalidatePath(`/administration/membres/${membreId}`);
  redirect(`/administration/membres/${membreId}?statut=change`);
}

export async function corrigerLeSolde(
  membreId: string,
  _precedent: EtatDUneDecision,
  donnees: FormData,
): Promise<EtatDUneDecision> {
  const moderateur = await exigerUnModerateur();
  const motif = lire(donnees, 'motif');
  const valeur = Number.parseInt(lire(donnees, 'nombre'), 10);
  const nombre = lire(donnees, 'sens') === 'retirer' ? -valeur : valeur;
  if (!motifDeModerationValide(motif)) {
    return { erreur: await traduire('Indiquez le motif de la correction : le membre le recevra.') };
  }
  const refus = await corrigerLesPoints(moderateur.id, membreId, Number.isNaN(nombre) ? 0 : nombre, motif);
  if (refus === 'nulle') return { erreur: await traduire('Indiquez un nombre de points.') };
  if (refus === 'trop_grande') {
    return {
      erreur: await traduire('Une correction va jusqu’à {n} points à la fois.', { n: CORRECTION_MAXIMALE }),
    };
  }
  if (refus === 'solde_negatif') {
    return { erreur: await traduire('Le solde du membre ne peut pas passer sous zéro.') };
  }
  if (refus === 'introuvable') return { erreur: await traduire('Ce compte n’existe plus.') };
  if (refus === 'interdit') {
    return { erreur: await traduire('Vos propres points doivent être corrigés par un autre membre de l’équipe.') };
  }
  revalidatePath(`/administration/membres/${membreId}`);
  redirect(`/administration/membres/${membreId}?points=corriges`);
}

// --- Le catalogue ---------------------------------------------------------------------------

export async function enregistrerLOffre(
  id: string | null,
  _precedent: EtatDUneDecision,
  donnees: FormData,
): Promise<EtatDUneDecision> {
  const moderateur = await exigerUnModerateur();
  const titre = lire(donnees, 'titre');
  const partenaire = lire(donnees, 'partenaire');
  const categorie = lire(donnees, 'categorie');
  const cout = Number.parseInt(lire(donnees, 'cout'), 10);
  const stock = Number.parseInt(lire(donnees, 'stock'), 10);
  if (titre.length < 2 || titre.length > 80) return { erreur: await traduire('Donnez un titre à l’avantage.') };
  if (partenaire.length < 2 || partenaire.length > 80) {
    return { erreur: await traduire('Indiquez le partenaire qui propose l’avantage.') };
  }
  if (!CATEGORIES_D_OFFRE.some((c) => c.cle === categorie)) {
    return { erreur: await traduire('Choisissez une catégorie.') };
  }
  if (!Number.isInteger(cout) || cout < 1 || cout > 1000) {
    return { erreur: await traduire('Le coût va de 1 à 1000 points.') };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) {
    return { erreur: await traduire('Le stock va de 0 à 10000 exemplaires.') };
  }
  const identifiant = await enregistrerUneOffre(moderateur.id, id, {
    titre,
    partenaire,
    categorie: categorie as CategorieDOffre,
    description: lire(donnees, 'description').slice(0, 600),
    retrait: lire(donnees, 'retrait').slice(0, 300),
    cout,
    stock,
    stockLu: id ? Number.parseInt(lire(donnees, 'stockLu'), 10) || 0 : null,
    active: donnees.get('active') === 'oui',
  });
  if (!identifiant) return { erreur: await traduire('Cet avantage n’existe plus.') };
  revalidatePath('/administration/catalogue');
  revalidatePath('/catalogue');
  redirect('/administration/catalogue?enregistre=1');
}
