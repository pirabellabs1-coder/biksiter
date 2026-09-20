'use server';

import { redirect } from 'next/navigation';

import { envoyerUneDemande, motifsPourUneDemande } from '@/lib/depot/gardes';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { estUneHeure, estUnJour, type Creneau } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

export type ChampsDeDemande = Creneau & { veloId: string };

export type VerificationDeDemande = {
  motifs: string[];
  placesLibres: number;
};

function creneauValide(champs: ChampsDeDemande): boolean {
  return (
    estUnJour(champs.jourDepot) &&
    estUnJour(champs.jourReprise) &&
    estUneHeure(champs.heureDepot) &&
    estUneHeure(champs.heureReprise)
  );
}

/** Les motifs qui empêchent l'envoi, recalculés à chaque changement du formulaire. */
export async function verifierLaDemande(
  reference: string,
  champs: ChampsDeDemande,
): Promise<VerificationDeDemande> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  if (!creneauValide(champs)) {
    return { motifs: [p('Choisissez la date du dépôt.')], placesLibres: 0 };
  }
  const verification = await motifsPourUneDemande({
    membreId: membre.id,
    reference,
    veloId: champs.veloId,
    creneau: champs,
  });
  if (!verification) {
    return {
      motifs: [p("Cet emplacement n'est plus disponible.")],
      placesLibres: 0,
    };
  }
  return {
    motifs: verification.motifs.map((m) => p(m.texte, m.valeurs)),
    placesLibres: verification.placesLibres,
  };
}

export type EtatDeLEnvoi = { motifs: string[] };

export async function envoyerLaDemande(
  reference: string,
  _precedent: EtatDeLEnvoi,
  donnees: FormData,
): Promise<EtatDeLEnvoi> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  const lire = (nom: string) => String(donnees.get(nom) ?? '');
  const champs: ChampsDeDemande = {
    jourDepot: lire('jour'),
    heureDepot: lire('de'),
    jourReprise: lire('jourFin'),
    heureReprise: lire('a'),
    veloId: lire('velo'),
  };
  if (!creneauValide(champs)) {
    return { motifs: [p('Choisissez la date du dépôt.')] };
  }

  const resultat = await envoyerUneDemande({
    membreId: membre.id,
    reference,
    veloId: champs.veloId,
    creneau: champs,
    message: lire('message'),
  });
  if (!resultat.ok) {
    return { motifs: resultat.motifs.map((m) => p(m.texte, m.valeurs)) };
  }
  redirect(`/gardes/${resultat.id}?demande=envoyee`);
}
