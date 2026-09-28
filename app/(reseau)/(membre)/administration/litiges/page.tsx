import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTeteDeModeration } from '@/components/maquette/moderation/en-tete-de-moderation';
import { OngletsDeModeration } from '@/components/maquette/moderation/onglets';
import { referenceDeGarde } from '@/components/membre/garde';
import { litigesEnCours } from '@/lib/depot/gestion';
import { textes } from '@/lib/i18n/langue';
import { jourAffiche } from '@/lib/regles/creneau';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';
import { exigerUnModerateur } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Litiges en cours') };
}

export default async function Litiges({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const moderateur = await exigerUnModerateur();
  const { p } = await textes();
  const [{ tranche }, litiges] = await Promise.all([
    searchParams,
    litigesEnCours(),
  ]);
  const initiales = `${moderateur.prenom.at(0) ?? ''}${moderateur.nom.at(0) ?? ''}`.toUpperCase();

  return (
    <main id="contenu">
      <EnTeteDeModeration initiales={initiales} />
      <div className="page">
        <header className="page-tete">
          <span className="kicker">FILE DES LITIGES</span>
          <h1>{p('Litiges')}</h1>
          <p>
            {p(
              'Les gardes ayant fait l’objet d’un signalement, du plus urgent au plus ancien. Chaque décision est envoyée au cycliste et au Bike Sitter.',
            )}
          </p>
        </header>

        <OngletsDeModeration p={p} actif="litiges" />

        {tranche ? (
          <article className="mod-carte" role="status">
            <div className="mod-tete">
              <span className="mod-etat">{p('Litige tranché')}</span>
            </div>
            <p className="gris">
              {p('Les deux membres ont été prévenus de la décision.')}
            </p>
          </article>
        ) : null}

        {litiges.length === 0 ? (
          <article className="mod-carte">
            <div className="mod-tete">
              <span className="mod-etat">{p('Aucun litige en cours')}</span>
            </div>
            <p className="vide-onglet">
              {p('Rien à trancher pour le moment.')}
            </p>
          </article>
        ) : (
          litiges.map((litige) => (
            <article
              key={litige.id}
              className={
                litige.priorite === 'haute' ? 'mod-carte urgent' : 'mod-carte'
              }
            >
              <div className="mod-tete">
                <span
                  className={
                    litige.priorite === 'haute' ? 'mod-etat rouge' : 'mod-etat attente'
                  }
                >
                  {litige.priorite === 'haute'
                    ? `${p('Priorité haute')}`
                    : `${p('Priorité moyenne')}`}
                </span>
                <span className="gris">{referenceDeGarde(litige.id)}</span>
              </div>
              <h3>{litige.motif ? p(litige.motif) : p('Signalement')}</h3>
              <p className="gris">
                {p('{cycliste} chez {bikeSitter}', {
                  cycliste: litige.prenomDuCycliste,
                  bikeSitter: litige.prenomDuBikeSitter,
                })}
                {' · '}
                {litige.quartier}
                {' · '}
                {p('ouvert le {date} à {heure}', {
                  date: jourAffiche(jourABruxelles(new Date(litige.ouvertLe))),
                  heure: heureABruxelles(new Date(litige.ouvertLe)),
                })}
              </p>
              <div className="actions-fin">
                <Link
                  href={`/administration/litiges/${litige.id}`}
                  className="primary"
                >
                  {p('Examiner le litige')}
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
