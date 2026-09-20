import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { EnTete } from '@/components/app/en-tete';
import { dateDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { detailDeLaGarde } from '@/lib/depot/gardes';
import { textes } from '@/lib/i18n/langue';
import {
  demandeUnMotif,
  DESISTEMENT_TARDIF_HEURES,
  estUnDesistementTardif,
  motifsProposes,
  transitionPermise,
  type Geste,
} from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';

import { FormulaireDeMotif } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Motif') };
}

const GESTES = ['refuser', 'annuler', 'absence', 'personne_n_ouvre', 'signaler'];

export default async function Motif({
  params,
}: {
  params: Promise<{ id: string; geste: string }>;
}) {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const { id, geste: brut } = await params;
  if (!GESTES.includes(brut)) notFound();
  const geste = brut as Geste;

  const garde = await detailDeLaGarde(membre.id, id);
  if (!garde) notFound();
  if (!demandeUnMotif(geste) || !transitionPermise(garde.etat, geste, garde.role)) {
    redirect(`/gardes/${id}`);
  }

  const autre = garde.autre.prenom;
  const tardif =
    geste === 'annuler' &&
    garde.etat === 'accepte' &&
    estUnDesistementTardif(garde.debut, new Date());

  const titre =
    geste === 'absence'
      ? p("Le vélo n'a pas été remis")
      : geste === 'signaler'
        ? p('Signaler un problème')
        : geste === 'refuser'
          ? p('Refuser la demande')
          : geste === 'personne_n_ouvre'
            ? p("Personne ne m'a ouvert")
            : p('Annuler la garde');

  const explication =
    geste === 'absence'
      ? p(
          'Vous avez attendu {prenom} sans voir le vélo arriver. La garde se ferme, la place se libère, et l’absence est enregistrée sur la garde. Elle n’apparaît sur aucun profil public.',
          { prenom: autre },
        )
      : geste === 'signaler'
        ? p(
            'Un modérateur reprend le dossier avec l’historique complet de la garde. La garde est gelée pendant l’examen : ni vous ni {prenom} ne pouvez plus la faire avancer.',
            { prenom: autre },
          )
        : geste === 'refuser'
          ? p('Merci d’indiquer la raison : nous prévenons {prenom}, et cela l’aide à mieux demander la prochaine fois.', {
              prenom: autre,
            })
          : geste === 'personne_n_ouvre'
            ? p('Nous prévenons {prenom} que vous êtes reparti avec votre vélo. La place redevient libre.', {
                prenom: autre,
              })
            : p('Nous prévenons {prenom} immédiatement. L’annulation est enregistrée sur la garde, pas sur votre profil.', {
                prenom: autre,
              });

  const confirmer =
    geste === 'absence'
      ? p("Confirmer l'absence")
      : geste === 'signaler'
        ? p('Soumettre le litige')
        : geste === 'refuser'
          ? p('Refuser la demande')
          : geste === 'personne_n_ouvre'
            ? p('Clore la garde')
            : p("Confirmer l'annulation");

  return (
    <main id="contenu">
      <EnTete p={p} retour={`/gardes/${id}`} cloche={false} />
      <div className="ecran-app ecran-parcours">
        <h1 className="titre-ecran">{titre}</h1>
        <p className="sous-titre">{explication}</p>

        {tardif ? (
          <div className="encart ambre" style={{ marginBottom: 12 }}>
            <Icone nom="alerte" taille={22} />
            <span>
              <strong>{p('Cette annulation arrive tard')}</strong>
              {garde.role === 'bike_sitter'
                ? p(
                    '{prenom} a prévu de venir dans moins de {heures} heures : nous lui montrons les emplacements encore libres sur son créneau. Le désistement est enregistré.',
                    { prenom: autre, heures: DESISTEMENT_TARDIF_HEURES },
                  )
                : p(
                    '{prenom} a gardé sa place pour vous : prévenir moins de {heures} heures avant compte comme un désistement tardif.',
                    { prenom: autre, heures: DESISTEMENT_TARDIF_HEURES },
                  )}
            </span>
          </div>
        ) : null}

        <div className="carte carte-de-garde" style={{ marginBottom: 6 }}>
          <span className="ligne-icone fond-vert">
            <Icone nom="velo" taille={24} />
          </span>
          <span className="ligne-texte">
            <strong>{garde.velo?.nom ?? p(garde.typeVelo)}</strong>
            <span>
              {autre} · {dateDeGarde(p, garde.debut, garde.fin)}
            </span>
          </span>
        </div>

        <FormulaireDeMotif
          id={id}
          geste={geste}
          motifs={motifsProposes(geste, garde.role).map((m) => [m, p(m)] as const)}
          danger={['refuser', 'signaler', 'absence', 'annuler'].includes(geste)}
          textes={{
            motif: geste === 'signaler' ? p('Description de la situation') : p('Raison'),
            precision:
              geste === 'signaler'
                ? p('Description de la situation')
                : p('Précisez si vous le souhaitez (facultatif)'),
            confirmer,
            revenir: p('Revenir à la garde'),
            envoi: p('Envoi…'),
          }}
        />
      </div>
    </main>
  );
}
