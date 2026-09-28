import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { Avatar } from '@/components/app/avatar';
import { creneau } from '@/components/maquette/garde/dates';
import { NoteEtPointsForts } from '@/components/maquette/garde/note-et-points-forts';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import {
  CRITERES,
  DELAI_POUR_DEPOSER_JOURS,
  onPeutEncoreDeposer,
} from '@/lib/regles/avis-de-garde';
import { exigerUnMembre } from '@/lib/session';

import { publierLAvis } from '../actions';

export const metadata: Metadata = { title: 'Avis' };

export default async function Avis({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;
  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (garde.etat !== 'termine' || garde.avis.deposeParMoi) {
    redirect(`/gardes/${id}`);
  }

  const [_nonLues, _emplacements] = await Promise.all([
    nombreDeNotificationsNonLues(membre.id),
    nombreDEmplacements(membre.id),
  ]);

  const fin =
    garde.evenements.find((e) => e.etape === 'termine')?.faitLe ?? garde.fin;
  const prenom = garde.autre.prenom;

  if (!onPeutEncoreDeposer(new Date(fin), new Date())) {
    return (
      <main id="contenu">
        <div className="dashboard-wrap">
          <span className="kicker">GARDE TERMINÉE</span>
          <h1>Le délai pour publier un avis est passé</h1>
          <p className="bs-intro">
            Il court pendant {DELAI_POUR_DEPOSER_JOURS} jours après la fin de
            la garde. La garde reste consultable dans « Terminées ».
          </p>
        </div>
      </main>
    );
  }

  const sens =
    garde.role === 'cycliste'
      ? 'cycliste_vers_bike_sitter'
      : 'bike_sitter_vers_cycliste';

  return (
    <main id="contenu">
      <div className="dashboard-wrap">
        <span className="kicker">GARDE TERMINÉE</span>
        <h1>Comment s’est passée la garde ?</h1>
        <p className="bs-intro">
          {garde.role === 'cycliste'
            ? `Votre avis aide les prochains cyclistes à choisir leur bike sitter. Il est facultatif, et ${prenom} pourra y répondre.`
            : `Votre avis aide les prochains bike sitters à savoir à qui ils ouvrent leur porte. Il est facultatif, et ${prenom} pourra y répondre.`}
        </p>

        <div className="dem-qui">
          <Avatar
            membreId={garde.autre.id}
            prenom={prenom}
            version={garde.autre.photo}
            taille={56}
          />
          <div>
            <b>
              {prenom} {garde.autre.initiale}.
            </b>
            <p>
              {garde.emplacement.type} · {creneau(garde.debut, garde.fin)}
            </p>
          </div>
        </div>

        <NoteEtPointsForts
          action={publierLAvis.bind(null, id)}
          criteres={CRITERES[sens]}
          retour={`/gardes/${id}`}
        />
      </div>
    </main>
  );
}
