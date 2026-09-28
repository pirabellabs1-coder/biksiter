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

        <ul className="groupe" role="list">
          {lieux.map((existant) => (
            <li key={existant.reference}>
              <Link
                href={`/mes-lieux/${existant.reference}`}
                className="rangee"
              >
                {existant.premierePhoto !== null ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="vignette-lieu"
                    src={`/emplacements/${existant.reference}/photo/${existant.premierePhoto}`}
                    alt=""
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="rangee-icone" aria-hidden="true">
                    <Icone nom="maison" taille={18} strokeWidth={2} />
                  </span>
                )}
                <span className="rangee-texte">
                  <strong>{existant.type}</strong>
                  <span>
                    {existant.quartier} · {existant.capacite} place
                    {existant.capacite > 1 ? 's' : ''} ·{' '}
                    {existant.nombreDePhotos === 0
                      ? 'sans photo'
                      : `${existant.nombreDePhotos} photo${existant.nombreDePhotos > 1 ? 's' : ''}`}
                  </span>
                  <span>
                    {existant.joursDAccueil === 7
                      ? 'Tous les jours'
                      : existant.joursDAccueil === 0
                        ? 'Aucun jour d’accueil'
                        : `${existant.joursDAccueil} jour${existant.joursDAccueil > 1 ? 's' : ''} d’accueil par semaine`}
                  </span>
                </span>
                <span
                  className={
                    existant.publie ? 'status' : 'status status-attente'
                  }
                >
                  {existant.publie
                    ? 'En ligne'
                    : existant.enPause
                      ? 'En pause'
                      : 'En préparation'}
                </span>
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          ))}
        </ul>

        {complet ? (
          <p className="prog-note">
            Vous proposez {EMPLACEMENTS_PAR_MEMBRE} emplacements, le maximum par
            membre. Vous pouvez les modifier à tout moment.
          </p>
        ) : (
          <Link className="outline bouton-ajout" href="/mes-lieux?nouveau=1">
            <Icone nom="plus" taille={18} strokeWidth={2.2} />
            Proposer un autre emplacement
          </Link>
        )}
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
