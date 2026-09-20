'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type {
  ChampsDeDemande,
  EtatDeLEnvoi,
  VerificationDeDemande,
} from '@/app/(reseau)/(membre)/demande/[reference]/actions';
import { demandeAModifier, modifierUneDemande, motifsPourUneDemande } from '@/lib/depot/gardes';
import { langueCourante } from '@/lib/i18n/langue';
import { phraseur } from '@/lib/i18n/traduction';
import { estUneHeure, estUnJour } from '@/lib/regles/creneau';
import { exigerUnMembre } from '@/lib/session';

function creneauValide(champs: ChampsDeDemande): boolean {
  return (
    estUnJour(champs.jourDepot) &&
    estUnJour(champs.jourReprise) &&
    estUneHeure(champs.heureDepot) &&
    estUneHeure(champs.heureReprise)
  );
}

export async function verifierLaModification(
  id: string,
  champs: ChampsDeDemande,
): Promise<VerificationDeDemande> {
  const membre = await exigerUnMembre();
  const p = phraseur(await langueCourante());
  const demande = await demandeAModifier(membre.id, id);
  if (!demande) {
    return { motifs: [p('Cette demande ne peut plus être modifiée.')], placesLibres: 0 };
  }
  if (!creneauValide(champs)) {
    return { motifs: [p('Choisissez la date du dépôt.')], placesLibres: 0 };
  }
  const verification = await motifsPourUneDemande(
    { membreId: membre.id, reference: demande.reference, veloId: champs.veloId, creneau: champs },
    id,
  );
  if (!verification) {
    return { motifs: [p("Cet emplacement n'est plus disponible.")], placesLibres: 0 };
  }
  return {
    motifs: verification.motifs.map((m) => p(m.texte, m.valeurs)),
    placesLibres: verification.placesLibres,
  };
}

export async function enregistrerLaModification(
  id: string,
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
  if (!creneauValide(champs)) return { motifs: [p('Choisissez la date du dépôt.')] };

  const resultat = await modifierUneDemande(membre.id, id, {
    veloId: champs.veloId,
    creneau: champs,
    message: lire('message'),
  });
  if (!resultat.ok) return { motifs: resultat.motifs.map((m) => p(m.texte, m.valeurs)) };
  revalidatePath(`/gardes/${id}`);
  redirect(`/gardes/${id}?demande=modifiee`);
}
