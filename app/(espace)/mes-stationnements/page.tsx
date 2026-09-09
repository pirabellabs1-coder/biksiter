import type { Metadata } from 'next';
import Link from 'next/link';

import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import {
  demandesRecues,
  mesStationnements,
  type Stationnement,
} from '@/lib/depot/stationnements';
import { typeVeloDansUnePhrase } from '@/lib/regles/velos';
import { exigerUnMembre } from '@/lib/session';
import { creneauEnFrancais } from '@/lib/temps';

import { accepterLaDemande, annuler, refuserLaDemande } from './actions';

export const metadata: Metadata = { title: 'Mes stationnements' };
export const dynamic = 'force-dynamic';

const LIBELLES: Record<Stationnement['etat'], string> = {
  demande: 'En attente de réponse',
  accepte: 'Accepté',
  refuse: 'Refusé',
  annule: 'Annulé',
  en_cours: 'Vélo gardé en ce moment',
  termine: 'Terminé',
};

/** Règle 6 : l'ambre ne dit qu'une chose, « le vélo est actuellement gardé ». */
function pastille(etat: Stationnement['etat']): string {
  if (etat === 'en_cours') return 'pastille pastille--garde';
  if (etat === 'accepte') return 'pastille pastille--verifie';
  if (etat === 'refuse') return 'pastille pastille--refus';
  return 'pastille pastille--neutre';
}

/**
 * Ce qui est fini passe en bas, et se replie.
 *
 * Une liste qui mélange une demande sans réponse et une garde de l'an dernier
 * oblige à trier des yeux à chaque visite. L'ordre est donc : ce qui attend,
 * ce qui vient, puis le reste.
 */
const RANG: Record<Stationnement['etat'], number> = {
  demande: 0,
  en_cours: 1,
  accepte: 2,
  termine: 3,
  refuse: 4,
  annule: 5,
};

function parUrgence(un: Stationnement, autre: Stationnement): number {
  const ecart = RANG[un.etat] - RANG[autre.etat];
  return ecart !== 0 ? ecart : un.debut.getTime() - autre.debut.getTime();
}

function estClos(stationnement: Stationnement): boolean {
  return ['termine', 'refuse', 'annule'].includes(stationnement.etat);
}

export default async function MesStationnements() {
  const membre = await exigerUnMembre();

  const [miennes, recues] = await Promise.all([
    mesStationnements(membre.id),
    demandesRecues(membre.id),
  ]);

  const aRepondre = recues.filter(({ etat }) => etat === 'demande').length;

  return (
    <>
      <EnteteDePage
        surtitre="Mes stationnements"
        titre={
          aRepondre === 0
            ? 'Rien n’attend votre réponse'
            : aRepondre === 1
              ? 'Une demande attend votre réponse'
              : `${aRepondre} demandes attendent votre réponse`
        }
        phrase="Vous êtes cycliste d’un côté, bike sitter de l’autre. C’est le même compte, et les deux listes vivent côte à côte."
        actions={
          <Link href="/emplacements" className="bouton bouton--discret">
            Chercher un emplacement
          </Link>
        }
      />

      <div className="panneaux">
        <ListeDeStationnements
          titre="Ce qu’on me demande"
          stationnements={recues.slice().sort(parUrgence)}
          vide="Personne ne vous a encore écrit. Un emplacement publié met un peu de temps à être trouvé."
          rendu={(stationnement) => (
            <>
              <span className="ligne__titre">
                {stationnement.prenomDuCycliste} ·{' '}
                {typeVeloDansUnePhrase(stationnement.typeVelo)}
              </span>
              <span className="ligne__detail">
                {creneauEnFrancais(stationnement.debut, stationnement.fin)}
              </span>
              {stationnement.message ? (
                <span className="ligne__citation">
                  « {stationnement.message} »
                </span>
              ) : null}
            </>
          )}
          actions={(stationnement) =>
            stationnement.etat === 'demande' ? (
              <>
                <form action={accepterLaDemande}>
                  <input
                    type="hidden"
                    name="stationnement"
                    value={stationnement.id}
                  />
                  <button className="bouton bouton--principal" type="submit">
                    Accepter
                  </button>
                </form>
                <form action={refuserLaDemande}>
                  <input
                    type="hidden"
                    name="stationnement"
                    value={stationnement.id}
                  />
                  <button className="bouton bouton--discret" type="submit">
                    Refuser
                  </button>
                </form>
              </>
            ) : stationnement.etat === 'accepte' ||
              stationnement.etat === 'en_cours' ? (
              <Link
                href={`/stationnements/${stationnement.id}`}
                className="bouton bouton--discret"
              >
                Ouvrir
              </Link>
            ) : null
          }
        />

        <ListeDeStationnements
          titre="Ce que je demande"
          stationnements={miennes.slice().sort(parUrgence)}
          vide="Vous n’avez encore rien demandé."
          rendu={(stationnement) => (
            <>
              <span className="ligne__titre">
                Chez {stationnement.prenomDuBikeSitter} ·{' '}
                {stationnement.quartier}
              </span>
              <span className="ligne__detail">
                {creneauEnFrancais(stationnement.debut, stationnement.fin)}
              </span>
            </>
          )}
          actions={(stationnement) => (
            <>
              {stationnement.etat === 'accepte' ||
              stationnement.etat === 'en_cours' ? (
                <Link
                  href={`/stationnements/${stationnement.id}`}
                  className="bouton bouton--principal"
                >
                  Ouvrir
                </Link>
              ) : null}
              {stationnement.etat === 'demande' ||
              stationnement.etat === 'accepte' ? (
                <form action={annuler}>
                  <input
                    type="hidden"
                    name="stationnement"
                    value={stationnement.id}
                  />
                  <button className="bouton bouton--discret" type="submit">
                    Me désister
                  </button>
                </form>
              ) : null}
            </>
          )}
        />
      </div>
    </>
  );
}

function ListeDeStationnements({
  titre,
  stationnements,
  vide,
  rendu,
  actions,
}: {
  titre: string;
  stationnements: Stationnement[];
  vide: string;
  rendu: (stationnement: Stationnement) => React.ReactNode;
  actions: (stationnement: Stationnement) => React.ReactNode;
}) {
  const vivants = stationnements.filter((un) => !estClos(un));
  const clos = stationnements.filter(estClos);

  return (
    <section className="panneau">
      <div className="panneau__entete">
        <h2>{titre}</h2>
        {stationnements.length === 0 ? null : (
          <span className="discret">
            {stationnements.length === 1
              ? '1 stationnement'
              : `${stationnements.length} stationnements`}
          </span>
        )}
      </div>

      {stationnements.length === 0 ? (
        <div className="vide">
          <IconeCaracteristique pictogramme="calendrier" />
          <p>{vide}</p>
        </div>
      ) : (
        <>
          {vivants.length === 0 ? (
            <div className="vide">
              <p>Rien en cours. Ce qui est terminé est replié ci-dessous.</p>
            </div>
          ) : (
            <ul className="lignes">
              {vivants.map((stationnement) => (
                <li key={stationnement.id}>
                  <div className="ligne">
                    <span className="jeton-initiale jeton-initiale--petit" aria-hidden="true">
                      {stationnement.prenomDuCycliste.charAt(0)}
                    </span>
                    <span className="ligne__corps">
                      {rendu(stationnement)}
                    </span>
                    <span className="ligne__fin">
                      <span className={pastille(stationnement.etat)}>
                        {LIBELLES[stationnement.etat]}
                      </span>
                      {actions(stationnement)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {clos.length === 0 ? null : (
            <details className="repli">
              <summary>
                {clos.length === 1
                  ? '1 stationnement terminé ou annulé'
                  : `${clos.length} stationnements terminés ou annulés`}
              </summary>
              <ul className="lignes">
                {clos.map((stationnement) => (
                  <li key={stationnement.id}>
                    <div className="ligne">
                      <span className="ligne__corps">
                        {rendu(stationnement)}
                      </span>
                      <span className="ligne__fin">
                        <span className={pastille(stationnement.etat)}>
                          {LIBELLES[stationnement.etat]}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  );
}
