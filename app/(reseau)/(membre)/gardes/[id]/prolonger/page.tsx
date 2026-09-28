import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  ChoixDeLaProlongation,
  type CreneauDeProlongation,
} from '@/components/maquette/garde/choix-de-la-prolongation';
import { duree, heure } from '@/components/maquette/garde/dates';
import {
  amenagementsDeLaGarde,
  finsDeProlongationAcceptees,
} from '@/lib/depot/amenagements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { prolongationPossible } from '@/lib/regles/amenagements';
import { jourABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { demanderLaProlongation } from '../amenagements';

export const metadata: Metadata = { title: 'Prolonger la garde' };

const HEURE = 60 * 60 * 1000;

/** Cinq heures de plus au maximum : au-delà, on repasse par une autre garde. */
const HEURES_PROPOSEES = 5;

export default async function ProlongerLaGarde({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
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

  // D'heure en heure après l'horaire convenu, comme dans les maquettes, en
  // ne gardant que les heures où le lieu accueille encore le vélo.
  const envisagees = Array.from(
    { length: HEURES_PROPOSEES },
    (_, rang) => new Date(garde.fin.getTime() + (rang + 1) * HEURE),
  );
  const acceptees = await finsDeProlongationAcceptees(garde, envisagees);

  const creneaux: CreneauDeProlongation[] = acceptees.map((fin) => {
    const jour = jourABruxelles(fin);
    const h = heure(fin);
    const enPlus = Math.round((fin.getTime() - garde.fin.getTime()) / HEURE);
    return {
      valeur: `${jour}T${h}`,
      jour,
      heure: h.replace('h', ':'),
      libelle: `${h}  ·  +${enPlus} h`,
    };
  });

  const prenom = garde.autre.prenom;

  return (
    <main id="contenu">
      <div className="dashboard-wrap">
        <span className="kicker">
          {garde.etat === 'en_cours' ? 'GARDE EN COURS' : 'GARDE À VENIR'}
        </span>
        <h1>Prolonger la garde</h1>
        <p className="bs-intro">
          La reprise est prévue à {heure(garde.fin)}. Si vous avez besoin de
          plus de temps, demandez une prolongation : {prenom} reçoit votre
          demande et vous répond depuis son espace.
        </p>

        <div className="champs lecture">
          <div>
            <span>Horaire convenu</span>
            <b>
              {heure(garde.debut)} → {heure(garde.fin)}
            </b>
          </div>
          <div>
            <span>Durée comptée</span>
            <b>{duree(garde.debut, garde.fin)}</b>
          </div>
        </div>

        {creneaux.length > 0 ? (
          <ChoixDeLaProlongation
            action={demanderLaProlongation.bind(null, garde.id)}
            creneaux={creneaux}
            prenom={prenom}
            heureConvenue={heure(garde.fin)}
            retour={`/gardes/${id}`}
          />
        ) : (
          <>
            <p className="bs-intro">
              Le lieu n’accueille pas de vélo plus tard aujourd’hui, ou la
              garde a déjà atteint la durée que {prenom} propose. Pour
              convenir d’autre chose, écrivez-lui un message.
            </p>
            <div className="deux-boutons">
              <Link className="primary" href={`/messages/${garde.id}`}>
                Écrire à {prenom}
              </Link>
              <Link className="outline" href={`/gardes/${id}`}>
                Revenir à la garde
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
