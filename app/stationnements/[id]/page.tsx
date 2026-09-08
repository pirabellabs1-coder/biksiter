import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BarreDuMembre from '@/components/barre-du-membre';
import { adresseDuStationnement } from '@/lib/depot/emplacements';
import {
  codeVivant,
  stationnementParId,
} from '@/lib/depot/stationnements';
import { VALIDITE_CODE_HEURES } from '@/lib/regles/remise';
import { exigerUnMembre } from '@/lib/session';
import { creneauEnFrancais } from '@/lib/temps';

import FormulaireDuCode from './formulaire-code';

export const metadata: Metadata = { title: 'Un stationnement' };
export const dynamic = 'force-dynamic';

export default async function LeStationnement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const membre = await exigerUnMembre();
  const { id } = await params;

  const stationnement = await stationnementParId(id, membre.id);
  if (!stationnement) {
    notFound();
  }

  const jeSuisLeCycliste = membre.id === stationnement.cyclisteId;
  const lAutre = jeSuisLeCycliste
    ? stationnement.prenomDuBikeSitter
    : stationnement.prenomDuCycliste;

  // Règle 4 : l'adresse ne sort qu'ici, pour le cycliste, et seulement parce
  // que la fonction SQL a vérifié que sa demande est acceptée.
  const adresse = jeSuisLeCycliste
    ? await adresseDuStationnement(stationnement.reference, membre.id)
    : null;

  const enCours = stationnement.etat === 'en_cours';
  const sens = enCours ? 'reprise' : 'depot';

  // Au dépôt, le cycliste remet le vélo ; à la reprise, c'est le bike sitter.
  const jeRemets = enCours ? !jeSuisLeCycliste : jeSuisLeCycliste;

  const remisePossible =
    stationnement.etat === 'accepte' || stationnement.etat === 'en_cours';

  const code = remisePossible && jeRemets ? await codeVivant(id, sens) : null;

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="stationnements" />

      <p className="surtitre">
        <Link href="/mes-stationnements" className="lien">
          Tous mes stationnements
        </Link>
      </p>

      <h1 className="titre-page">
        {jeSuisLeCycliste
          ? `Votre vélo chez ${stationnement.prenomDuBikeSitter}`
          : `Le vélo de ${stationnement.prenomDuCycliste}`}
      </h1>

      <dl className="details carte">
        <div>
          <dt>Quand</dt>
          <dd>
            {creneauEnFrancais(
              new Date(stationnement.debut),
              new Date(stationnement.fin),
            )}
          </dd>
        </div>
        <div>
          <dt>Vélo</dt>
          <dd>{stationnement.typeVelo}</dd>
        </div>
        <div>
          <dt>Quartier</dt>
          <dd>{stationnement.quartier}</dd>
        </div>
        <div>
          <dt>Adresse</dt>
          <dd>
            {adresse ?? (jeSuisLeCycliste ? 'après acceptation' : 'chez vous')}
          </dd>
        </div>
      </dl>

      {enCours ? (
        <div className="encart encart--garde">
          <p>
            <strong>Le vélo est gardé en ce moment.</strong> Il reste chez{' '}
            {stationnement.prenomDuBikeSitter} jusqu’à la reprise.
          </p>
        </div>
      ) : null}

      {stationnement.etat === 'termine' ? (
        <div className="encart encart--verifie">
          <p>
            <strong>Le stationnement est terminé.</strong> Le vélo est reparti
            avec {stationnement.prenomDuCycliste}.
          </p>
        </div>
      ) : null}

      {remisePossible ? (
        <>
          <h2 className="titre-section titre-section--aere">
            {enCours ? 'La reprise' : 'Le dépôt'}
          </h2>

          {jeRemets ? (
            <>
              <p className="discret">
                Vous remettez le vélo : dictez ce code à {lAutre}, qui le
                saisira de son côté. Il vaut {VALIDITE_CODE_HEURES} heures.
              </p>
              <p className="code-de-remise" aria-label={`Code : ${code?.split('').join(' ')}`}>
                {code}
              </p>
              <p className="discret">
                Ne l’envoyez pas à l’avance : il n’a de sens qu’au moment où
                vous êtes tous les deux devant le vélo.
              </p>
            </>
          ) : (
            <FormulaireDuCode stationnement={id} quiRemet={lAutre} />
          )}
        </>
      ) : null}
    </div>
  );
}
