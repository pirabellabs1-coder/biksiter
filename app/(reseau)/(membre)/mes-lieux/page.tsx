import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Icone } from '@/components/app/icone';
import { Confirmation } from '@/components/maquette/confirmation';
import { mesLieux } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { exigerUnMembre } from '@/lib/session';

export const metadata: Metadata = { title: 'Mes emplacements' };

/**
 * Les emplacements du membre (l'onglet « Dispos » y mène). Sans emplacement,
 * on va droit au formulaire qui en décrit un.
 */
export default async function VotreEspace({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { retire, nouveau } = await searchParams;
  const membre = await exigerUnMembre();
  const [lieux, _nonLues] = await Promise.all([
    mesLieux(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);
  const complet = lieux.length >= EMPLACEMENTS_PAR_MEMBRE;

  if (nouveau && !complet) redirect('/mes-lieux/ajouter');
  if (lieux.length > 0) {
    return (
      <main id="contenu" className="ecran" data-cote="sitter">
        {retire ? (
          <Confirmation texte="Emplacement retiré : il n’apparaît plus dans les recherches." />
        ) : null}
        <header className="ecran-tete">
          <h1>Mes emplacements</h1>
          <p className="ecran-intro">
            Vos lieux d’accueil : leurs horaires, leurs photos, leur état.
          </p>
        </header>

        <ul className="cartes-lieux" role="list">
          {lieux.map((existant) => (
            <li key={existant.reference}>
              <Link
                href={`/mes-lieux/${existant.reference}`}
                className="carte-lieu"
              >
                <span className="carte-lieu-media">
                  {existant.premierePhoto !== null ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/emplacements/${existant.reference}/photo/${existant.premierePhoto}`}
                      alt=""
                    />
                  ) : (
                    <Icone nom="maison" taille={30} strokeWidth={1.6} />
                  )}
                  <span
                    className={`carte-lieu-etat pastille ${
                      existant.publie ? 'vert' : 'ambre'
                    }`}
                  >
                    {existant.publie
                      ? 'En ligne'
                      : existant.enPause
                        ? 'En pause'
                        : 'En préparation'}
                  </span>
                </span>
                <span className="carte-lieu-corps">
                  <strong>{existant.type}</strong>
                  <span className="carte-lieu-quartier">
                    {existant.quartier}
                  </span>
                  <span className="carte-lieu-faits">
                    <span className="fait">
                      <Icone nom="velo" taille={15} strokeWidth={2} />
                      {existant.capacite} place
                      {existant.capacite > 1 ? 's' : ''}
                    </span>
                    <span className="fait">
                      <Icone nom="photo" taille={15} strokeWidth={2} />
                      {existant.nombreDePhotos === 0
                        ? 'sans photo'
                        : `${existant.nombreDePhotos} photo${existant.nombreDePhotos > 1 ? 's' : ''}`}
                    </span>
                    <span className="fait">
                      <Icone nom="calendrier" taille={15} strokeWidth={2} />
                      {existant.joursDAccueil === 7
                        ? 'Tous les jours'
                        : existant.joursDAccueil === 0
                          ? 'Aucun jour'
                          : `${existant.joursDAccueil} j/semaine`}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {complet ? null : (
            <li>
              <Link className="carte-ajout" href="/mes-lieux?nouveau=1">
                <span className="carte-ajout-rond" aria-hidden="true">
                  <Icone nom="plus" taille={22} strokeWidth={2.2} />
                </span>
                <strong>Proposer un autre emplacement</strong>
                <span>Un garage, une cave ou une cour fermée.</span>
              </Link>
            </li>
          )}
        </ul>

        {complet ? (
          <p className="prog-note">
            Vous proposez {EMPLACEMENTS_PAR_MEMBRE} emplacements, le maximum par
            membre. Vous pouvez les modifier à tout moment.
          </p>
        ) : null}
      </main>
    );
  }

  // Sans emplacement, le parcours commence directement par la description
  // complète du lieu : une étape préalable reposait les mêmes questions.
  if (!retire) redirect('/mes-lieux/ajouter');

  return (
    <main id="contenu" className="ecran" data-cote="sitter">
      <Confirmation texte="Emplacement retiré : il n’apparaît plus dans les recherches." />
      <header className="ecran-tete">
        <h1>Mes emplacements</h1>
        <p className="ecran-intro">
          Vous pouvez proposer un emplacement à tout moment : un garage, une
          cave ou une cour fermée suffit.
        </p>
      </header>
      <Link className="primary bs-cta" href="/mes-lieux/ajouter">
        Proposer un emplacement
      </Link>
    </main>
  );
}
