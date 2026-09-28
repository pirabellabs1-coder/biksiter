import { notFound } from 'next/navigation';

import { jourLisible } from '@/components/app/recherche';
import { motifsPourUneDemande } from '@/lib/depot/gardes';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { disponibiliteDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  A_CONVENIR,
  ajouterJours,
  DUREES_MAX_JOURS,
  JOURS_ABREGES,
  libelleDesHoraires,
} from '@/lib/regles/creneau';
import {
  avecLesHeuresChoisies,
  heuresDansLAccueil,
  plagesDAccueil,
} from '@/lib/regles/heures-proposees';
import { HEURES, lireLaRecherche } from '@/lib/recherche-courante';
import { exigerUnMembre } from '@/lib/session';

import { envoyerLaDemande, verifierLaDemande } from './actions';
import { FormulaireDeDemande } from './formulaire';
import { textesDuFormulaireDeDemande } from './textes';

export async function NouvelleDemande({
  reference,
  parametres,
}: {
  reference: string;
  parametres: Record<string, string | undefined>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const recherche = lireLaRecherche(parametres);

  const [emplacement, velos] = await Promise.all([
    disponibiliteDe(reference, recherche.creneau),
    velosDuMembre(membre.id),
  ]);
  if (!emplacement) notFound();

  // Le type de vélo choisi sur la fiche désigne, s'il y en a un, le vélo du
  // membre de ce type : c'est celui qu'il pense confier.
  const typeChoisi = parametres.velo;
  const veloId =
    (velos.find((velo) => velo.type === typeChoisi) ?? velos[0])?.id ?? '';
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
          dureeAcceptee={
            emplacement.dureeMaxJours > 1
              ? `${p('Jusqu’à {n} h dans la journée', { n: emplacement.dureeMaxHeures })} · ${p(DUREES_MAX_JOURS[emplacement.dureeMaxJours] ?? '')}`
              : p('Jusqu’à {n} h d’affilée', { n: emplacement.dureeMaxHeures })
          }
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
          heures={avecLesHeuresChoisies(
            heuresDansLAccueil(HEURES, plagesDAccueil(emplacement)),
            recherche.creneau.heureDepot,
            recherche.creneau.heureReprise,
          )}
          joursMaximum={
            emplacement.dureeMaxJours === A_CONVENIR ? null : emplacement.dureeMaxJours
          }
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
