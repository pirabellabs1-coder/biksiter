import Link from 'next/link';

import type { AvisAffiche } from '@/lib/depot/reseau';
import type { Textes } from '@/lib/i18n/langue';
import { enJour } from '@/lib/temps';

/**
 * Un avis publié : qui l'a écrit, sa note, son texte, le détail par critère,
 * et la réponse de la personne visée. Jamais de suppression : une réponse, ou
 * une contestation.
 */
export function CarteDAvis({
  p,
  avis,
  actions = false,
}: {
  p: Textes['p'];
  avis: AvisAffiche;
  /** Vrai quand la personne visée consulte ses propres avis. */
  actions?: boolean;
}) {
  const criteres = Object.entries(avis.criteres ?? {});
  return (
    <div className="card">
      <div className="card-body">
        <div className="row" style={{ marginBottom: 6 }}>
          <div className="avatar sm" aria-hidden="true">
            {avis.auteurPrenom.charAt(0)}
          </div>
          <div className="grow">
            <p className="t-s strong">{avis.auteurPrenom}</p>
            <p className="t-xs muted">{enJour(new Date(avis.ecritLe))}</p>
          </div>
          <span className="t-s" aria-label={`${avis.note} / 5`}>
            ★ {avis.note}
          </span>
        </div>
        {avis.texte ? (
          <p className="t-s muted" style={{ lineHeight: 1.65 }}>
            {avis.texte}
          </p>
        ) : null}
        {criteres.length > 0 ? (
          <div
            style={{
              marginTop: 9,
              paddingTop: 9,
              borderTop: '1px solid var(--chalk)',
            }}
          >
            {criteres.map(([critere, valeur]) => (
              <div
                key={critere}
                className="row"
                style={{ justifyContent: 'space-between' }}
              >
                <span className="t-xs muted">{p(critere)}</span>
                <span className="t-xs">★ {valeur}</span>
              </div>
            ))}
          </div>
        ) : null}
        {avis.reponse ? (
          <div
            style={{
              marginTop: 10,
              paddingLeft: 12,
              borderLeft: '2px solid var(--chalk)',
            }}
          >
            <p className="t-xs muted">{p('Réponse')}</p>
            <p className="t-s">{avis.reponse}</p>
          </div>
        ) : null}
        {actions && !avis.reponse ? (
          <Link
            href={`/profil/avis/${avis.id}/repondre`}
            className="btn ghost sm"
            style={{ marginTop: 10, display: 'inline-block' }}
          >
            {p('Répondre')}
          </Link>
        ) : null}
        {actions && !avis.conteste ? (
          <>
            {' '}
            <Link
              href={`/profil/avis/${avis.id}/contester`}
              className="btn ghost sm"
              style={{ marginTop: 10, display: 'inline-block' }}
            >
              {p('Contester')}
            </Link>
          </>
        ) : null}
        {avis.conteste ? (
          <p className="t-xs muted" style={{ marginTop: 8 }}>
            {p('Signalé à la modération.')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
