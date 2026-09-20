import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FormulaireDeDemande } from '@/app/(reseau)/(membre)/demande/[reference]/formulaire';
import { textesDuFormulaireDeDemande } from '@/app/(reseau)/(membre)/demande/[reference]/textes';
import { EnTete } from '@/components/app/en-tete';
import { jourLisible } from '@/components/app/recherche';
import { demandeAModifier, motifsPourUneDemande } from '@/lib/depot/gardes';
import { velosDuMembre } from '@/lib/depot/membre-espace';
import { disponibiliteDe } from '@/lib/depot/reseau';
import { textes } from '@/lib/i18n/langue';
import { AVIS_POUR_AFFICHER_UNE_NOTE } from '@/lib/regles/avis-de-garde';
import {
  ajouterJours,
  DUREES_MAX_JOURS,
  JOURS_ABREGES,
  libelleDesHoraires,
  type Creneau,
} from '@/lib/regles/creneau';
import { HEURES } from '@/lib/recherche-courante';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { enregistrerLaModification, verifierLaModification } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Modifier la demande') };
}

export default async function ModifierLaDemande({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const demande = await demandeAModifier(membre.id, id);
  if (!demande) redirect(`/gardes/${id}`);

  const creneau: Creneau = {
    jourDepot: jourABruxelles(demande.debut),
    heureDepot: heureABruxelles(demande.debut),
    jourReprise: jourABruxelles(demande.fin),
    heureReprise: heureABruxelles(demande.fin),
  };
  const [emplacement, velos] = await Promise.all([
    disponibiliteDe(demande.reference, creneau),
    velosDuMembre(membre.id),
  ]);
  if (!emplacement) redirect(`/gardes/${id}`);

  const veloId =
    velos.find((velo) => velo.id === demande.veloId)?.id ?? velos[0]?.id ?? '';
  const verification = (await motifsPourUneDemande(
    { membreId: membre.id, reference: demande.reference, veloId, creneau },
    demande.id,
  )) ?? { motifs: [], placesLibres: 0 };

  const aujourdhui = jourABruxelles();
  const jourEnListe = (rang: number) => {
    const jour = ajouterJours(aujourdhui, rang);
    return { valeur: jour, libelle: jourLisible(p, jour) };
  };
  const note =
    emplacement.nombreDAvis >= AVIS_POUR_AFFICHER_UNE_NOTE && emplacement.noteMoyenne !== null
      ? `${emplacement.noteMoyenne.toFixed(1).replace('.', ',')} (${p('{n} avis', { n: emplacement.nombreDAvis })})`
      : null;

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Modifier la demande')}</h1>
        <p className="sous-titre">
          {p('Mettez à jour votre demande tant que {prenom} n’y a pas répondu.', {
            prenom: emplacement.prenom,
          })}
        </p>
        <FormulaireDeDemande
          envoyerAction={enregistrerLaModification.bind(null, demande.id)}
          verifierAction={verifierLaModification.bind(null, demande.id)}
          messageInitial={demande.message ?? ''}
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
          initial={{ ...creneau, veloId }}
          verificationInitiale={{
            motifs: verification.motifs.map((m) => p(m.texte, m.valeurs)),
            placesLibres: verification.placesLibres,
          }}
          textes={{
            ...textesDuFormulaireDeDemande(p, emplacement.prenom),
            envoyer: p('Enregistrer les modifications'),
            envoi: p('Enregistrement…'),
          }}
        />
      </div>
    </main>
  );
}
