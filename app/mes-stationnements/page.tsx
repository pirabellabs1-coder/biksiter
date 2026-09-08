import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
import {
  demandesRecues,
  mesStationnements,
  type Stationnement,
} from '@/lib/depot/stationnements';
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

export default async function MesStationnements() {
  const membre = await exigerUnMembre();

  const [miennes, recues] = await Promise.all([
    mesStationnements(membre.id),
    demandesRecues(membre.id),
  ]);

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="stationnements" />

      <h1 className="titre-page">Mes stationnements</h1>
      <p className="chapeau">
        Vous êtes cycliste d’un côté, bike sitter de l’autre. C’est le même
        compte, et les deux listes vivent côte à côte.
      </p>

      <h2 className="titre-section titre-section--aere">
        Ce qu’on me demande
      </h2>
      {recues.length === 0 ? (
        <p className="discret">
          Personne ne vous a encore écrit. Un emplacement publié met un peu de
          temps à être trouvé.
        </p>
      ) : (
        <ul className="stationnements">
          {recues.map((stationnement) => (
            <li key={stationnement.id} className="carte stationnement">
              <div className="stationnement__corps">
                <h3>
                  {stationnement.prenomDuCycliste} · {stationnement.typeVelo}
                </h3>
                <p className="discret">
                  {creneauEnFrancais(
                    new Date(stationnement.debut),
                    new Date(stationnement.fin),
                  )}
                </p>
                {stationnement.message ? (
                  <p className="discret">« {stationnement.message} »</p>
                ) : null}
                <span className={pastille(stationnement.etat)}>
                  {LIBELLES[stationnement.etat]}
                </span>
              </div>

              <div className="stationnement__actions">
                {stationnement.etat === 'demande' ? (
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
                ) : null}

                {stationnement.etat === 'accepte' ||
                stationnement.etat === 'en_cours' ? (
                  <Link
                    href={`/stationnements/${stationnement.id}`}
                    className="bouton bouton--discret"
                  >
                    Ouvrir
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="titre-section titre-section--aere">Ce que je demande</h2>
      {miennes.length === 0 ? (
        <p className="discret">
          Vous n’avez encore rien demandé.{' '}
          <Link href="/emplacements" className="lien">
            Voir les emplacements
          </Link>
          .
        </p>
      ) : (
        <ul className="stationnements">
          {miennes.map((stationnement) => (
            <li key={stationnement.id} className="carte stationnement">
              <div className="stationnement__corps">
                <h3>
                  Chez {stationnement.prenomDuBikeSitter} ·{' '}
                  {stationnement.quartier}
                </h3>
                <p className="discret">
                  {creneauEnFrancais(
                    new Date(stationnement.debut),
                    new Date(stationnement.fin),
                  )}
                </p>
                <span className={pastille(stationnement.etat)}>
                  {LIBELLES[stationnement.etat]}
                </span>
              </div>

              <div className="stationnement__actions">
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
