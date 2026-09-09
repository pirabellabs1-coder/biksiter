import type { Metadata } from 'next';
import Link from 'next/link';

import EnteteDePage from '@/components/espace/entete-de-page';
import IconeCaracteristique from '@/components/icone-caracteristique';
import { emplacementsDuMembre } from '@/lib/depot/emplacements';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { decisionDePublication } from '@/lib/regles/publication';
import { exigerUnMembre, membrePourLesRegles } from '@/lib/session';

import { mettreEnPause, republier } from './actions';

export const metadata: Metadata = { title: 'Mes emplacements' };
export const dynamic = 'force-dynamic';

export default async function MesEmplacements() {
  const membre = await exigerUnMembre();
  const emplacements = await emplacementsDuMembre(membre.id);
  const decision = decisionDePublication(await membrePourLesRegles());

  return (
    <>
      <EnteteDePage
        surtitre="Mes emplacements"
        titre={
          emplacements.length === 0
            ? 'Vous n’en proposez aucun'
            : `${emplacements.length} sur ${EMPLACEMENTS_PAR_MEMBRE} possibles`
        }
        phrase={`Deux au maximum. Au-delà, on ne parle plus d’un voisin qui rend service.`}
        actions={
          decision.autorise ? (
            <Link
              href="/proposer-un-emplacement"
              className="bouton bouton--principal"
            >
              Décrire un emplacement
            </Link>
          ) : null
        }
      />

      {decision.autorise ? null : (
        <div className="a-faire">
          <div
            className={
              decision.motif === 'quota_atteint'
                ? 'a-faire__entree'
                : 'a-faire__entree a-faire__entree--bloquant'
            }
          >
            <div className="a-faire__corps">
              <strong>
                {decision.motif === 'quota_atteint'
                  ? 'Vous êtes au maximum'
                  : 'Votre identité doit d’abord être vérifiée'}
              </strong>
              <p>
                {decision.motif === 'quota_atteint'
                  ? `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements. Retirez-en un pour en décrire un autre.`
                  : 'Une personne doit avoir contrôlé votre pièce d’identité. C’est ce qui rend acceptable, pour un cycliste, de confier son vélo à quelqu’un qu’il ne connaît pas.'}
              </p>
            </div>
            {decision.motif === 'quota_atteint' ? null : (
              <Link
                href="/inscription/verification"
                className="bouton bouton--discret"
              >
                Voir où ça en est
              </Link>
            )}
          </div>
        </div>
      )}

      <section className="panneau">
        <div className="panneau__entete">
          <h2>Ce que je propose</h2>
          {emplacements.length === 0 ? null : (
            <Link href="/emplacements">Voir la recherche publique</Link>
          )}
        </div>

        {emplacements.length === 0 ? (
          <div className="vide">
            <IconeCaracteristique pictogramme="prive" />
            <p>
              Un garage, une cave, une cour, une véranda. Si un vélo peut y
              tenir quelques heures à l’abri et que personne d’autre que vous
              n’y entre, vous pouvez accueillir.
            </p>
            {decision.autorise ? (
              <div className="boutons">
                <Link
                  href="/proposer-un-emplacement"
                  className="bouton bouton--principal"
                >
                  Décrire mon emplacement
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="lignes">
            {emplacements.map((emplacement) => (
              <li key={emplacement.reference}>
                <div className="ligne">
                  <span className="ligne__corps">
                    <span className="ligne__titre">{emplacement.type}</span>
                    <span className="ligne__detail">
                      {emplacement.quartier} ·{' '}
                      {emplacement.capacite > 1
                        ? `${emplacement.capacite} vélos`
                        : '1 vélo'}
                      {emplacement.demandesEnAttente > 0
                        ? ` · ${emplacement.demandesEnAttente} demande${
                            emplacement.demandesEnAttente > 1 ? 's' : ''
                          } à traiter`
                        : ''}
                    </span>
                  </span>

                  <span className="ligne__fin">
                    <span
                      className={
                        emplacement.publie
                          ? 'pastille pastille--verifie'
                          : 'pastille pastille--neutre'
                      }
                    >
                      {emplacement.publie ? 'Publié' : 'En pause'}
                    </span>

                    <Link
                      href={`/mes-emplacements/${emplacement.reference}/modifier`}
                      className="bouton bouton--discret"
                    >
                      Modifier
                    </Link>

                    {emplacement.publie ? (
                      <form action={mettreEnPause}>
                        <input
                          type="hidden"
                          name="emplacement"
                          value={emplacement.reference}
                        />
                        <button
                          type="submit"
                          className="bouton bouton--discret"
                        >
                          Mettre en pause
                        </button>
                      </form>
                    ) : (
                      <form action={republier}>
                        <input
                          type="hidden"
                          name="emplacement"
                          value={emplacement.reference}
                        />
                        <button
                          type="submit"
                          className="bouton bouton--discret"
                          disabled={membre.verification !== 'verifiee'}
                        >
                          Republier
                        </button>
                      </form>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
