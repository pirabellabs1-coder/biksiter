import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { jourLisible } from '@/components/app/recherche';
import { motifsPourUneDemande } from '@/lib/depot/gardes';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { disponibiliteDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  ajouterJours,
  DUREES_MAX_JOURS,
  JOURS_ABREGES,
  libelleDesHoraires,
} from '@/lib/regles/creneau';
import {
  HEURES,
  lireLaRecherche,
  parametresDeLaRecherche,
} from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { envoyerLaDemande, verifierLaDemande } from './actions';
import { FormulaireDeDemande } from './formulaire';
import { textesDuFormulaireDeDemande } from './textes';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Votre demande') };
}

export default async function NouvelleDemande({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { reference } = await params;
  const recherche = lireLaRecherche(await searchParams);

  const [emplacement, velos] = await Promise.all([
    disponibiliteDe(reference, recherche.creneau),
    velosDuMembre(membre.id),
  ]);
  if (!emplacement) notFound();

  const veloId = velos[0]?.id ?? '';
  const verification = (await motifsPourUneDemande({
    membreId: membre.id,
    reference,
    veloId,
    creneau: recherche.creneau,
  })) ?? { motifs: [], placesLibres: 0 };

  const jourEnListe = (rang: number) => {
    const jour = ajouterJours(recherche.aujourdhui, rang);
    return { valeur: jour, libelle: jourLisible(p, jour) };
  };
  const note =
    emplacement.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE &&
    emplacement.noteMoyenne !== null
      ? `${emplacement.noteMoyenne.toFixed(1).replace('.', ',')} (${p('{n} avis', { n: emplacement.nombreDAvis })})`
      : null;

  return (
    <main id="contenu">
      <EnTete
        p={p}
        retour={`/emplacements/${reference}?${parametresDeLaRecherche(recherche).toString()}`}
        cloche={false}
      />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Votre demande')}</h1>
        <p className="sous-titre">
          {p('Vérifiez les informations avant d’envoyer votre demande de garde.')}
        </p>
        <FormulaireDeDemande
          envoyerAction={envoyerLaDemande.bind(null, reference)}
          verifierAction={verifierLaDemande.bind(null, reference)}
          bikeSitter={{
            prenom: emplacement.prenom,
            initiale: emplacement.initialeDuNom,
            verifie: emplacement.identiteVerifiee,
            note,
            quartier: emplacement.quartier,
          }}
          capacite={emplacement.capacite}
          dureeAcceptee={p(DUREES_MAX_JOURS[emplacement.dureeMaxJours] ?? '')}
          horaires={libelleDesHoraires(
            {
              jours: emplacement.jours,
              ouverture: emplacement.ouverture,
              fermeture: emplacement.fermeture,
              parJour: emplacement.parJour ?? {},
              fermetures: emplacement.fermetures,
            },
            (jour) => p(JOURS_ABREGES[jour] ?? ''),
          )}
          joursDeDepot={Array.from({ length: 7 }, (_, rang) => jourEnListe(rang))}
          joursDeRetour={Array.from({ length: 14 }, (_, rang) => jourEnListe(rang))}
          heures={HEURES}
          velos={velos}
          initial={{ ...recherche.creneau, veloId }}
          verificationInitiale={{
            motifs: verification.motifs.map((m) => p(m.texte, m.valeurs)),
            placesLibres: verification.placesLibres,
          }}
          textes={textesDuFormulaireDeDemande(p, emplacement.prenom)}
        />
      </div>
    </main>
  );
}
