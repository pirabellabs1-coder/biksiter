import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { amenagementsDeLaGarde } from '@/lib/depot/amenagements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT,
  PROLONGATION_MAXIMALE_JOURS,
  prolongationPossible,
} from '@/lib/regles/amenagements';
import { HEURES } from '@/lib/recherche-courante';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { demanderLaProlongation } from '../amenagements';
import { FormulaireDeProlongation } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Prolonger la garde') };
}

const HEURE = 60 * 60 * 1000;

export default async function ProlongerLaGarde({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  const { prolongation } = await amenagementsDeLaGarde(garde.id);
  if (
    garde.role !== 'cycliste' ||
    !prolongationPossible(garde.etat, garde.fin, new Date()) ||
    prolongation?.etat === 'demandee'
  ) {
    redirect(`/gardes/${id}`);
  }

  // Une heure de plus par défaut, arrondie au quart d'heure.
  const proposee = new Date(Math.ceil((garde.fin.getTime() + HEURE) / (15 * 60 * 1000)) * 15 * 60 * 1000);
  const heureProposee = heureABruxelles(proposee);

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{p('Prolonger la garde')}</h1>
        <p className="sous-titre">
          {p('Besoin de plus de temps ? Demandez une prolongation à {prenom}.', {
            prenom: garde.autre.prenom,
          })}
        </p>

        <div className="encart solde-encart" style={{ marginBottom: 12 }}>
          <Icone nom="calendrier" taille={28} />
          <span>
            <span className="petit">{p('Horaire actuel')}</span>
            <strong style={{ fontSize: 17 }}>{dateDeGarde(p, garde.debut, garde.fin)}</strong>
          </span>
        </div>

        <FormulaireDeProlongation
          action={demanderLaProlongation.bind(null, garde.id)}
          heures={HEURES}
          jourParDefaut={jourABruxelles(proposee)}
          heureParDefaut={HEURES.includes(heureProposee) ? heureProposee : '18:00'}
          jourMinimal={jourABruxelles(garde.fin)}
          jourMaximal={jourABruxelles(
            new Date(garde.fin.getTime() + PROLONGATION_MAXIMALE_JOURS * 24 * HEURE),
          )}
          longueur={LONGUEUR_D_UN_MOT_D_ACCOMPAGNEMENT}
          textes={{
            nouvelleFin: p('Nouvelle fin de garde'),
            jour: p('Jour'),
            heure: p('Heure'),
            motif: p('Motif de la prolongation (facultatif)'),
            exemple: p('Ex. : mon train a du retard, je repasse demain matin.'),
            information: p('{prenom} doit accepter la prolongation. Jusque-là, la garde se termine à l’heure prévue.', {
              prenom: garde.autre.prenom,
            }),
            envoyer: p('Envoyer la demande'),
            envoi: p('Envoi…'),
          }}
        />
      </div>
    </main>
  );
}
