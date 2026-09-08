import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
import { emplacementsDuMembre } from '@/lib/depot/emplacements';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { decisionDePublication } from '@/lib/regles/publication';
import { exigerUnMembre, membrePourLesRegles } from '@/lib/session';

export const metadata: Metadata = { title: 'Mes emplacements' };
export const dynamic = 'force-dynamic';

export default async function MesEmplacements() {
  const membre = await exigerUnMembre();
  const emplacements = await emplacementsDuMembre(membre.id);
  const decision = decisionDePublication(await membrePourLesRegles());

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="emplacements" />

      <h1 className="titre-page">Mes emplacements</h1>
      <p className="chapeau">
        Vous pouvez en proposer {EMPLACEMENTS_PAR_MEMBRE} au maximum. Au-delà,
        on ne parle plus d’un voisin qui rend service.
      </p>

      {emplacements.length === 0 ? (
        <div className="carte">
          <h2>Vous n’en proposez aucun</h2>
          <p className="discret">
            Un garage, une cave, une cour, une véranda. Si un vélo peut y tenir
            quelques heures à l’abri et que personne d’autre que vous n’y entre,
            vous pouvez accueillir.
          </p>
        </div>
      ) : (
        <ul className="emplacements">
          {emplacements.map((emplacement) => (
            <li key={emplacement.reference} className="emplacement">
              <div className="emplacement__corps">
                <h2>{emplacement.type}</h2>
                <p>
                  {emplacement.quartier} ·{' '}
                  {emplacement.capacite > 1
                    ? `${emplacement.capacite} vélos`
                    : '1 vélo'}
                </p>
                <p>
                  {emplacement.publie ? (
                    <span className="pastille pastille--verifie">Publié</span>
                  ) : (
                    <span className="pastille pastille--neutre">
                      En attente de vérification
                    </span>
                  )}
                  {emplacement.demandesEnAttente > 0 ? (
                    <>
                      {' '}
                      <span className="pastille pastille--neutre">
                        {emplacement.demandesEnAttente} demande
                        {emplacement.demandesEnAttente > 1 ? 's' : ''} à traiter
                      </span>
                    </>
                  ) : null}
                </p>
              </div>

              <Link
                href={`/emplacements/${emplacement.reference}`}
                className="bouton bouton--discret"
              >
                Voir la fiche publique
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="titre-section titre-section--aere">En ajouter un</h2>

      {decision.autorise ? (
        <>
          <p className="discret">
            Votre identité est vérifiée : votre prochain emplacement sera publié
            dès que vous l’aurez décrit.
          </p>
          <Link
            href="/proposer-un-emplacement"
            className="bouton bouton--principal"
          >
            Décrire un emplacement
          </Link>
        </>
      ) : (
        <div className="encart">
          <p>
            {decision.motif === 'quota_atteint'
              ? `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements, c’est le maximum.`
              : 'Votre identité doit être vérifiée par une personne avant qu’un emplacement puisse être publié. C’est ce qui rend acceptable, pour un cycliste, de confier son vélo à un inconnu.'}
          </p>
        </div>
      )}
    </div>
  );
}
