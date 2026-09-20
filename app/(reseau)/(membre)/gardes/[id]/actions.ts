'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  constatAttenduDe,
  effectuerUnGeste,
  enregistrerUnConstat,
  estUnIdentifiantDeGarde,
  refuserLeVeloPourLaBatterie,
  regenererLeCode,
  saisirLeCodeDeLaRemise,
  type PhotoPreparee,
} from '@/lib/depot/gardes';
import { deposerUnAvis } from '@/lib/depot/membre-espace';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import {
  estUnEtatDeclarable,
  motifsDuConstat,
  noteDuConstat,
  PHOTOS_DU_CONSTAT,
  TAILLE_MAXIMALE_D_UNE_PHOTO_DE_CONSTAT,
} from '@/lib/regles/constat';
import { typeReelDuFichier } from '@/lib/regles/pieces';
import { codeDuRefus, type Geste, type Phase } from '@/lib/regles/garde';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';
import { nettoyerLaPhoto } from '@/lib/securite/image';
import { exigerUnMembre } from '@/lib/session';

const GESTES_DIRECTS: readonly Geste[] = ['accepter', 'arriver', 'reprendre'];
const GESTES_AVEC_MOTIF: readonly Geste[] = [
  'refuser',
  'annuler',
  'absence',
  'personne_n_ouvre',
  'signaler',
];

export type EtatDUneAction = { erreur: string | null };

const lienDeLaGarde = (id: string) => `/gardes/${id}`;

/** Accepter, signaler son arrivée, demander la reprise : un seul geste. */
export async function gesteDirect(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const id = String(donnees.get('id') ?? '');
  const geste = String(donnees.get('geste') ?? '') as Geste;
  if (!GESTES_DIRECTS.includes(geste)) redirect(lienDeLaGarde(id));

  const resultat = await effectuerUnGeste(membre.id, id, geste, null);
  revalidatePath(lienDeLaGarde(id));
  // Le motif précis ne passe pas par l'adresse de la page : un texte lu dans
  // l'URL pourrait être écrit par n'importe qui. L'écran affiche une phrase
  // connue, et l'état relu de la garde dit le reste.
  if (!resultat.ok) {
    const code = codeDuRefus(resultat.motifs[0]?.texte ?? '');
    redirect(`${lienDeLaGarde(id)}?erreur=${code ?? 'geste'}`);
  }
  // Après l'arrivée ou la demande de reprise, le parcours continue par les
  // photos du vélo, devant la porte.
  redirect(
    geste === 'reprendre'
      ? `${lienDeLaGarde(id)}/constat/reprise`
      : geste === 'arriver'
        ? `${lienDeLaGarde(id)}/constat/depot`
        : lienDeLaGarde(id),
  );
}

export async function gesteAvecMotif(
  id: string,
  geste: Geste,
  _precedent: EtatDUneAction,
  donnees: FormData,
): Promise<EtatDUneAction> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  if (!GESTES_AVEC_MOTIF.includes(geste))
    return { erreur: p('Choisissez un motif.') };

  const choisi = String(donnees.get('motif') ?? '').trim();
  const precision = String(donnees.get('precision') ?? '')
    .trim()
    .slice(0, 400);
  if (!choisi) return { erreur: p('Choisissez un motif.') };
  const motif = precision ? `${choisi} — ${precision}` : choisi;

  const resultat = await effectuerUnGeste(membre.id, id, geste, motif);
  if (!resultat.ok) {
    const [m] = resultat.motifs;
    return { erreur: p(m!.texte, m!.valeurs) };
  }
  revalidatePath(lienDeLaGarde(id));
  redirect(lienDeLaGarde(id));
}

export async function nouveauCode(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const id = String(donnees.get('id') ?? '');
  const phase = String(donnees.get('phase') ?? '') as Phase;
  if (phase === 'depot' || phase === 'reprise') {
    await regenererLeCode(membre.id, id, phase);
  }
  redirect(`${lienDeLaGarde(id)}/remise/${phase}`);
}

export async function confirmerLaRemise(
  id: string,
  phase: Phase,
  _precedent: EtatDUneAction,
  donnees: FormData,
): Promise<EtatDUneAction> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  const saisie = String(donnees.get('code') ?? '')
    .replace(/\D/g, '')
    .slice(0, CHIFFRES_DU_CODE_DE_REMISE);
  const reserve = String(donnees.get('reserve') ?? '');
  const resultat = await saisirLeCodeDeLaRemise(membre.id, id, phase, saisie, reserve);
  if (!resultat.ok) return { erreur: p(resultat.texte, resultat.valeurs) };
  revalidatePath(lienDeLaGarde(id));
  redirect(`${lienDeLaGarde(id)}?remise=${phase}`);
}

export async function validerLeConstat(
  id: string,
  phase: Phase,
  _precedent: EtatDUneAction,
  donnees: FormData,
): Promise<EtatDUneAction> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  const etat = String(donnees.get('etat') ?? '');
  const note = String(donnees.get('note') ?? '');
  // Une photo par emplacement : son rang dit ce qu'elle montre.
  const fichiers = PHOTOS_DU_CONSTAT.flatMap(({ rang }) => {
    const fichier = donnees.get(`photo-${rang}`);
    return fichier instanceof File && fichier.size > 0 ? [{ rang, fichier }] : [];
  });

  const attendu = await constatAttenduDe(membre.id, id, phase);
  if (!attendu) {
    return {
      erreur: p('Le constat se fait devant la porte, au moment de remettre ou de reprendre le vélo.'),
    };
  }
  const batterieVerifiee = attendu.electrique ? donnees.get('batterie') === 'oui' : null;
  const motifs = motifsDuConstat({
    rangs: fichiers.map(({ rang }) => rang),
    etat,
    note,
    electrique: attendu.electrique,
    batterieVerifiee: batterieVerifiee === true,
  });
  if (motifs.length > 0 || !estUnEtatDeclarable(etat)) {
    return { erreur: p(motifs[0] ?? "Indiquez l'état constaté.") };
  }

  const photos: (PhotoPreparee & { rang: number })[] = [];
  for (const { rang, fichier } of fichiers) {
    if (fichier.size > TAILLE_MAXIMALE_D_UNE_PHOTO_DE_CONSTAT) {
      return { erreur: p('Une photo est trop lourde. Reprenez-la directement avec l’appareil photo du téléphone.') };
    }
    const contenu = Buffer.from(await fichier.arrayBuffer());
    const type = typeReelDuFichier(contenu);
    if (!type || type === 'application/pdf') {
      return { erreur: p('Envoyez des photos (JPEG, PNG ou WebP).') };
    }
    try {
      photos.push({ rang, ...(await nettoyerLaPhoto(contenu)) });
    } catch {
      return {
        erreur: p(
          'Une photo n’a pas pu être lue. Essayez d’en prendre une autre.',
        ),
      };
    }
  }

  const resultat = await enregistrerUnConstat(membre.id, id, phase, {
    etat,
    note: noteDuConstat(etat, note),
    batterieVerifiee,
    photos,
  });
  if (!resultat.ok) {
    const [m] = resultat.motifs;
    return { erreur: p(m!.texte, m!.valeurs) };
  }
  revalidatePath(lienDeLaGarde(id));
  // Les photos prises, on passe au code : c'est l'étape suivante du parcours.
  redirect(`${lienDeLaGarde(id)}/remise/${phase}`);
}

/** Le bike sitter refuse un vélo dont la batterie l'inquiète. */
export async function refuserPourLaBatterie(donnees: FormData): Promise<void> {
  const membre = await exigerUnMembre();
  const id = String(donnees.get('id') ?? '');
  if (!estUnIdentifiantDeGarde(id)) redirect('/gardes');
  const resultat = await refuserLeVeloPourLaBatterie(membre.id, id);
  revalidatePath(lienDeLaGarde(id));
  redirect(resultat.ok ? `${lienDeLaGarde(id)}?batterie=refusee` : `${lienDeLaGarde(id)}?erreur=geste`);
}

export async function publierLAvis(
  id: string,
  _precedent: EtatDUneAction,
  donnees: FormData,
): Promise<EtatDUneAction> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  const note = Number(donnees.get('note'));
  const criteres: Record<string, number> = {};
  for (const [cle, valeur] of donnees.entries()) {
    if (cle.startsWith('critere:') && typeof valeur === 'string' && valeur) {
      criteres[cle.slice('critere:'.length)] = Number(valeur);
    }
  }
  const resultat = await deposerUnAvis(membre.id, id, {
    note,
    criteres,
    texte: String(donnees.get('texte') ?? ''),
  });
  if (!resultat.ok) return { erreur: p(resultat.texte) };
  revalidatePath(lienDeLaGarde(id));
  redirect(`${lienDeLaGarde(id)}?avis=depose`);
}
