import type { Metadata } from 'next';
import Link from 'next/link';

import EnteteDePage from '@/components/entete-de-page';
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
        chapeau={`Vous pouvez proposer jusqu’à ${EMPLACEMENTS_PAR_MEMBRE} emplacements.`}
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
              // Être au maximum n'est pas un blocage : c'est une limite qu'on
              // a choisie, et la ligne le dit sans filet sombre.
              decision.motif === 'quota_atteint'
                ? 'a-faire__entree a-faire__entree--calme'
                : 'a-faire__entree a-faire__entree--bloquant'
            }
          >
            <div className="a-faire__corps">
              <strong>
                {decision.motif === 'quota_atteint'
                  ? 'Vous avez atteint le maximum'
                  : 'Une vérification d’identité est nécessaire'}
              </strong>
              <p>
                {decision.motif === 'quota_atteint'
                  ? `Vous proposez déjà ${EMPLACEMENTS_PAR_MEMBRE} emplacements. Pour en ajouter un nouveau, retirez d’abord l’un d’eux.`
                  : 'Votre emplacement pourra être publié dès qu’une personne de l’association aura vérifié votre pièce d’identité. Cette étape permet aux cyclistes de confier leur vélo en toute confiance.'}
              </p>
            </div>
            {decision.motif === 'quota_atteint' ? null : (
              <Link
                href="/inscription/verification"
                className="bouton bouton--discret"
              >
                Suivre ma vérification
              </Link>
            )}
          </div>
        </div>
      )}

      <section className="panneau">
        <div className="panneau__entete">
          <h2>Vos emplacements</h2>
          {emplacements.length === 0 ? null : (
            <Link href="/emplacements">Voir la recherche publique</Link>
          )}
        </div>

        {emplacements.length === 0 ? (
          <div className="vide">
            <IconeCaracteristique pictogramme="prive" />
            <p>
              Un garage, une cave, une cour ou une véranda suffisent, dès lors
              que le lieu est fermé et réservé à votre usage.
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
