import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import EnteteDePage from '@/components/entete-de-page';
import { adresseDuStationnement } from '@/lib/depot/emplacements';
import { avisDejaEcrit } from '@/lib/depot/avis';
import { messagesDuStationnement } from '@/lib/depot/echanges';
import { codeVivant, stationnementParId } from '@/lib/depot/stationnements';
import { onPeutEcrire } from '@/lib/regles/echanges';
import { VALIDITE_CODE_HEURES } from '@/lib/regles/remise';
import { exigerUnMembre } from '@/lib/session';
import { creneauEnFrancais, enFrancais } from '@/lib/temps';

import {
  ecrireAuSujetDuStationnement,
  ecrireUnAvisSurLaGarde,
} from './actions';
import FormulaireDAvis from './avis';
import Echange from './echange';
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
  const messages = await messagesDuStationnement(id, membre.id);
  const filOuvert = onPeutEcrire(stationnement.etat);

  // L'avis se propose au cycliste, une fois le vélo repris, et une seule fois.
  const avisPossible =
    stationnement.etat === 'termine' &&
    jeSuisLeCycliste &&
    !(await avisDejaEcrit(id));

  return (
    <div className="page-de-lespace">
      <EnteteDePage
        surtitre="Un stationnement"
        titre={
          jeSuisLeCycliste
            ? `Votre vélo chez ${stationnement.prenomDuBikeSitter}`
            : `Le vélo de ${stationnement.prenomDuCycliste}`
        }
        chapeau={`${stationnement.quartier} · ${creneauEnFrancais(new Date(stationnement.debut), new Date(stationnement.fin))}`}
        actions={
          <Link href="/mes-stationnements" className="bouton bouton--discret">
            Tous mes stationnements
          </Link>
        }
      />

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
        <div className="encart encart--verifie">
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
            <div className="remise">
              <div className="remise__entete">
                <h3 className="remise__titre">Code de remise</h3>
                <span className="remise__validite">
                  Valable {VALIDITE_CODE_HEURES} h
                </span>
              </div>

              {/* Un chiffre par tuile pour qu'il se relise sans se perdre, mais
                  un seul élément lu à voix haute par un lecteur d'écran : sans
                  ce `aria-label`, il épellerait quatre nombres séparés. */}
              <ul
                className="remise__chiffres"
                aria-label={`Code : ${(code ?? '').split('').join(' ')}`}
              >
                {(code ?? '').split('').map((chiffre, rang) => (
                  <li
                    // Deux chiffres identiques se suivent souvent dans un code :
                    // c'est la position qui l'identifie, pas la valeur.
                    key={`${rang}-${chiffre}`}
                    className="remise__chiffre"
                    aria-hidden="true"
                  >
                    {chiffre}
                  </li>
                ))}
              </ul>

              <p>
                Dictez-le à {lAutre}, qui le saisira de son côté. Il a trois
                essais.
              </p>
              <p>
                Communiquez-le au moment de la remise, lorsque vous êtes tous
                les deux devant le vélo.
              </p>
            </div>
          ) : (
            <FormulaireDuCode stationnement={id} quiRemet={lAutre} />
          )}
        </>
      ) : null}

      {avisPossible ? (
        <>
          <h2 className="titre-section titre-section--aere">Laisser un avis</h2>
          <FormulaireDAvis
            action={ecrireUnAvisSurLaGarde.bind(null, id)}
            prenomDuBikeSitter={stationnement.prenomDuBikeSitter}
          />
        </>
      ) : null}

      <h2 className="titre-section titre-section--aere">
        {messages.length === 0 ? 'Écrire' : 'Vos échanges'}
      </h2>

      {messages.length === 0 ? (
        <p className="discret">Aucun message pour le moment.</p>
      ) : (
        <ol className="fil">
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                message.auteurId === membre.id
                  ? 'fil__message fil__message--mien'
                  : 'fil__message'
              }
            >
              <p className="fil__auteur">
                {message.prenomDeLAuteur}
                <span className="discret">
                  {' '}
                  · {enFrancais(new Date(message.ecritLe))}
                </span>
              </p>
              <p>{message.corps}</p>
            </li>
          ))}
        </ol>
      )}

      {filOuvert ? (
        <Echange
          action={ecrireAuSujetDuStationnement.bind(null, id)}
          prenomDeLAutre={lAutre}
        />
      ) : (
        <p className="discret">
          Ce stationnement est terminé : les échanges sont clos.
        </p>
      )}
    </div>
  );
}
